#!/usr/bin/env python3
"""
tools/build-columns.py  —  RecruitX コラムビルダー
共有コラム cx_column の掲載先=recruitx（/contentsx/v1/columns?site=recruitx）を取得し:
  1. column.html のカテゴリタブ / PICK UP / カードグリッドを更新（BUILD markers 間を差し替え）
  2. /column/{slug}/index.html を静的生成
  3. sitemap.xml の /column/ エントリを更新（存在する場合）

⚠️ 公開コラムが 0 件のときは column.html のスケルトン（モック見本）を保持して終了する
   （0件で見本を消さない）。記事を WP に入れてから再実行する。
"""
import html as _html
import json
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from html.parser import HTMLParser
from pathlib import Path
from typing import Optional
import urllib.request

ROOT = Path(__file__).parent.parent
COLUMN_HTML = ROOT / "column.html"
COLUMN_DIR = ROOT / "column"
TEMPLATE_PATH = ROOT / "tools" / "templates" / "column-detail.html.tpl"
SITEMAP_PATH = ROOT / "sitemap.xml"

SITE_URL = "https://recruitx.contentsx.jp"
API_BASE = "https://cms.contentsx.jp/wp-json/contentsx/v1"

# ---- XSS sanitizer (allowlist-based HTMLParser、build-cases.py と同方針) ----
ALLOWED_TAGS = {
    "p", "br", "strong", "em", "b", "i", "u", "s", "del",
    "h2", "h3", "h4", "h5", "h6", "ul", "ol", "li", "a", "img",
    "table", "thead", "tbody", "tr", "th", "td",
    "figure", "figcaption", "blockquote", "cite", "dl", "dt", "dd",
    "small", "sup", "sub", "hr",
}
ALLOWED_ATTRS = {
    "a": {"href", "title", "rel"},
    "img": {"src", "alt", "width", "height", "loading", "decoding"},
    "th": {"scope"},
    "td": {"colspan", "rowspan"},
}
VOID_TAGS = {"br", "img", "hr"}


class _Sanitizer(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.out: list = []

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_TAGS:
            return
        allowed = ALLOWED_ATTRS.get(tag, set())
        safe = ""
        for name, val in attrs:
            if name not in allowed:
                continue
            val = (val or "").replace('"', "&quot;")
            if name == "href" and not re.match(r"^(https?://|/|#)", val):
                continue
            if name == "src" and not re.match(r"^https?://", val):
                continue
            safe += f' {name}="{val}"'
        self.out.append(f"<{tag}{safe}>")

    def handle_endtag(self, tag):
        if tag not in ALLOWED_TAGS or tag in VOID_TAGS:
            return
        self.out.append(f"</{tag}>")

    def handle_data(self, data):
        self.out.append(data.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;"))

    def handle_entityref(self, name):
        self.out.append(f"&{name};")

    def handle_charref(self, name):
        self.out.append(f"&#{name};")


def sanitize_html(raw: str) -> str:
    s = _Sanitizer()
    s.feed(raw or "")
    return "".join(s.out)


def esc(s: str) -> str:
    """属性・テキスト用の最小エスケープ。"""
    return _html.escape(str(s or ""), quote=True)


# ---- SVG helpers ----
SVG_CAL = (
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"'
    ' aria-hidden="true"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/>'
    '<path d="M2.5 6.5h11M5.5 2v3M10.5 2v3" stroke-linecap="round"/></svg>'
)
SVG_ARROW = (
    '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2"'
    ' stroke-linecap="round" stroke-linejoin="round"><path d="M6 3l5 5-5 5"/></svg>'
)


# ---- API ----
_CB = str(int(time.time()))


def _fetch_json(url: str, timeout: int = 20) -> object:
    with urllib.request.urlopen(url, timeout=timeout) as resp:
        return json.loads(resp.read().decode("utf-8"))


def _norm(c: dict) -> dict:
    """共有コラム(cx_column)のフィールド名をrecruitXフロントの内部名へ写像。
    title_ja→title / excerpt_ja→excerpt（他キー: category/thumbnail/date/slug/id/
    pickup/seo_title/seo_description/content はそのまま使える）。"""
    if not isinstance(c, dict):
        return c
    c = dict(c)
    c["title"] = c.get("title_ja", "") or c.get("title", "")
    c["excerpt"] = c.get("excerpt_ja", "") or c.get("excerpt", "")
    return c


def fetch_columns() -> list:
    # 共有コラムから掲載先=recruitx のみ取得（cx_column 相乗り）
    url = f"{API_BASE}/columns?site=recruitx&per_page=100&_cb={_CB}"
    try:
        data = _fetch_json(url)
        if not isinstance(data, list):
            raise ValueError(f"Expected list, got {type(data)}")
        return [_norm(c) for c in data]
    except Exception as e:
        print(f"[ERROR] API fetch failed: {e}", file=sys.stderr)
        sys.exit(1)


def fetch_column_detail(col_id: int) -> Optional[dict]:
    url = f"{API_BASE}/columns/{col_id}?_cb={_CB}"
    try:
        data = _fetch_json(url)
        return _norm(data) if isinstance(data, dict) else None
    except Exception as e:
        print(f"[WARN] Detail fetch failed for id={col_id}: {e}", file=sys.stderr)
        return None


# ---- 部品生成 ----
def _media_html(thumb: str, alt: str, cls: str) -> str:
    if thumb:
        return (f'<img class="{cls}" src="{esc(thumb)}" alt="{esc(alt)}"'
                f' loading="lazy" decoding="async">')
    return ""  # 画像未設定はCSSのプレースホルダ背景に任せる


def build_tabs(columns: list) -> str:
    # 出現順を保ちつつ重複排除（API=新着順）
    cats = []
    for c in columns:
        cat = c.get("category") or ""
        if cat and cat not in cats:
            cats.append(cat)
    out = ['          <button type="button" class="rx-collist__filter-btn" data-filter="all" aria-pressed="true">すべて</button>']
    for cat in cats:
        out.append(
            f'          <button type="button" class="rx-collist__filter-btn"'
            f' data-filter="{esc(cat)}" aria-pressed="false">{esc(cat)}</button>'
        )
    return "\n".join(out)


def build_featured(columns: list) -> str:
    """ヒーロー右の新着クラスタ = 最新の公開3件（自動）。"""
    out = []
    for c in columns[:3]:
        slug = c.get("slug", "")
        cat = c.get("category") or ""
        media_img = _media_html(c.get("thumbnail", ""), c.get("title", ""), "")
        badge = f'<span class="rx-colfeat__badge">{esc(cat)}</span>' if cat else ""
        ph = "" if c.get("thumbnail") else " is-placeholder"
        out.append(
            f'              <li class="rx-colfeat__item{ph}">\n'
            f'                <a class="rx-colfeat__link" href="column/{esc(slug)}/">\n'
            f'                  <span class="rx-colfeat__media">{media_img}{badge}</span>\n'
            f'                  <span class="rx-colfeat__body">\n'
            f'                    <span class="rx-colfeat__title">{esc(c.get("title",""))}</span>\n'
            f'                    <span class="rx-colfeat__date">{esc(c.get("date",""))}</span>\n'
            f'                  </span>\n'
            f'                </a>\n'
            f'              </li>'
        )
    return "\n".join(out)


def build_pickup(columns: list) -> str:
    pick = next((c for c in columns if c.get("pickup")), None) or columns[0]
    slug = pick.get("slug", "")
    cat = pick.get("category") or ""
    cat_html = f'<span class="rx-pickup__cat">{esc(cat)}</span>' if cat else ""
    media = _media_html(pick.get("thumbnail", ""), pick.get("title", ""), "rx-pickup__media")
    if not media:
        media = '<span class="rx-pickup__media" aria-hidden="true"></span>'
    ph = "" if pick.get("thumbnail") else " is-placeholder"
    return (
        f'          <a class="rx-pickup__card{ph}" href="column/{esc(slug)}/">\n'
        f'            {media}\n'
        f'            <span class="rx-pickup__content">\n'
        f'              {cat_html}\n'
        f'              <span class="rx-pickup__title">{esc(pick.get("title",""))}</span>\n'
        f'              <span class="rx-pickup__desc">{esc(pick.get("excerpt",""))}</span>\n'
        f'              <span class="rx-pickup__date">{esc(pick.get("date",""))}</span>\n'
        f'            </span>\n'
        f'          </a>'
    )


def build_card(c: dict) -> str:
    """画像左・テキスト右の横型カード（バッジ→タイトル→説明→日付/矢印）。"""
    slug = c.get("slug", "")
    cat = c.get("category") or ""
    title = c.get("title", "")
    media = _media_html(c.get("thumbnail", ""), title, "")  # img は figure 内、class無し
    cat_badge = f'<span class="rx-colcard__cat">{esc(cat)}</span>' if cat else ""
    desc = c.get("excerpt", "")
    desc_html = f'<p class="rx-colcard__desc">{esc(desc)}</p>' if desc else ""
    ph = "" if c.get("thumbnail") else " is-placeholder"
    return (
        f'\n          <li class="rx-colcard rx-anim{ph}" data-category="{esc(cat)}" data-title="{esc(title)}">'
        f'\n            <a class="rx-colcard__link" href="column/{esc(slug)}/">'
        f'\n              <figure class="rx-colcard__media">{media}</figure>'
        f'\n              <div class="rx-colcard__body">'
        f'\n                {cat_badge}'
        f'\n                <h3 class="rx-colcard__title">{esc(title)}</h3>'
        f'\n                {desc_html}'
        f'\n                <div class="rx-colcard__foot">'
        f'\n                  <span class="rx-colcard__date">{SVG_CAL}{esc(c.get("date",""))}</span>'
        f'\n                  <span class="rx-colcard__arrow" aria-hidden="true">{SVG_ARROW}</span>'
        f'\n                </div>'
        f'\n              </div>'
        f'\n            </a>'
        f'\n          </li>'
    )


def _replace_block(src: str, marker: str, inner: str) -> str:
    pat = re.compile(rf"<!-- BUILD:{marker} -->.*?<!-- /BUILD:{marker} -->", re.DOTALL)
    repl = f"<!-- BUILD:{marker} -->\n{inner}\n<!-- /BUILD:{marker} -->"
    new = pat.sub(lambda _m: repl, src)
    if new == src:
        print(f"[WARN] BUILD:{marker} markers not found — skipped", file=sys.stderr)
    return new


def update_column_html(columns: list) -> None:
    src = COLUMN_HTML.read_text(encoding="utf-8")
    src = _replace_block(src, "COLUMN_FEATURED", build_featured(columns))
    src = _replace_block(src, "COLUMN_TABS", build_tabs(columns))
    src = _replace_block(src, "COLUMN_PICKUP", build_pickup(columns))
    cards = "".join(build_card(c) for c in columns)
    src = _replace_block(src, "COLUMN_GRID", cards)
    COLUMN_HTML.write_text(src, encoding="utf-8")
    print(f"[OK] column.html updated (featured/tabs/pickup/{len(columns)} cards)")


# ---- 詳細ページ生成 ----
def _make_jsonld(d: dict, page_url: str) -> tuple:
    title = d.get("title", "")
    seo_title = d.get("seo_title") or f"{title}｜リクルートX コラム"
    seo_desc = d.get("seo_description") or d.get("excerpt", "")
    image = d.get("thumbnail", "")
    article = {
        "@context": "https://schema.org", "@type": "Article",
        "headline": seo_title, "description": seo_desc, "url": page_url,
        "datePublished": d.get("date_ymd", ""),
        "dateModified": d.get("modified_ymd", "") or d.get("date_ymd", ""),
        "publisher": {"@type": "Organization", "name": "リクルートX", "url": SITE_URL},
    }
    if image:
        article["image"] = image
    breadcrumb = {
        "@context": "https://schema.org", "@type": "BreadcrumbList",
        "itemListElement": [
            {"@type": "ListItem", "position": 1, "name": "トップ", "item": SITE_URL},
            {"@type": "ListItem", "position": 2, "name": "コラム", "item": f"{SITE_URL}/column.html"},
            {"@type": "ListItem", "position": 3, "name": title, "item": page_url},
        ],
    }
    return (json.dumps(article, ensure_ascii=False), json.dumps(breadcrumb, ensure_ascii=False))


def build_related(me: dict, all_cols: list, limit: int = 3) -> str:
    my_cat = me.get("category") or ""
    picks = [c for c in all_cols if c.get("slug") != me.get("slug") and (c.get("category") or "") == my_cat]
    picks += [c for c in all_cols if c.get("slug") != me.get("slug") and c not in picks]
    items = []
    for c in picks[:limit]:
        slug = c.get("slug", "")
        media = _media_html(c.get("thumbnail", ""), c.get("title", ""), "")
        cat = c.get("category") or ""
        cat_badge = f'<span class="rx-colcard__cat">{esc(cat)}</span>' if cat else ""
        desc = c.get("excerpt", "")
        desc_html = f'<p class="rx-colcard__desc">{esc(desc)}</p>' if desc else ""
        ph = "" if c.get("thumbnail") else " is-placeholder"
        items.append(
            f'\n            <li class="rx-colcard{ph}" data-category="{esc(cat)}">'
            f'\n              <a class="rx-colcard__link" href="../{esc(slug)}/">'
            f'\n                <figure class="rx-colcard__media">{media}</figure>'
            f'\n                <div class="rx-colcard__body">'
            f'\n                  {cat_badge}'
            f'\n                  <h3 class="rx-colcard__title">{esc(c.get("title",""))}</h3>'
            f'\n                  {desc_html}'
            f'\n                  <div class="rx-colcard__foot">'
            f'\n                    <span class="rx-colcard__date">{SVG_CAL}{esc(c.get("date",""))}</span>'
            f'\n                    <span class="rx-colcard__arrow" aria-hidden="true">{SVG_ARROW}</span>'
            f'\n                  </div>'
            f'\n                </div>'
            f'\n              </a>'
            f'\n            </li>'
        )
    return "".join(items)


def _generate_one(c: dict, template: str, all_cols: list) -> str:
    slug = c.get("slug", "")
    detail = fetch_column_detail(c.get("id", 0))
    if detail is None:
        return f"[SKIP] {slug}: detail fetch failed"
    title = detail.get("title", "")
    cat = detail.get("category") or ""
    image = detail.get("thumbnail", "")
    content_html = sanitize_html(detail.get("content", ""))
    seo_title = detail.get("seo_title") or f"{title}｜リクルートX コラム"
    seo_desc = detail.get("seo_description") or detail.get("excerpt", "")
    page_url = f"{SITE_URL}/column/{slug}/"
    article_jsonld, breadcrumb_jsonld = _make_jsonld(detail, page_url)

    hero_img = (
        f'<img class="rx-cold__hero-img" src="{esc(image)}" alt="{esc(title)}"'
        f' width="1200" height="630" loading="eager" fetchpriority="high" decoding="async">'
        if image else ""
    )
    cat_html = f'<span class="rx-cold__cat">{esc(cat)}</span>' if cat else ""

    out = (
        template
        .replace("{{seo_title}}", esc(seo_title))
        .replace("{{seo_description}}", esc(seo_desc))
        .replace("{{title}}", esc(title))
        .replace("{{slug}}", esc(slug))
        .replace("{{category}}", cat_html)
        .replace("{{date}}", esc(detail.get("date", "")))
        .replace("{{date_ymd}}", esc(detail.get("date_ymd", "")))
        .replace("{{modified_ymd}}", esc(detail.get("modified_ymd", "") or detail.get("date_ymd", "")))
        .replace("{{hero_image}}", hero_img)
        .replace("{{content_html}}", content_html)
        .replace("{{page_url}}", page_url)
        .replace("{{article_jsonld}}", article_jsonld)
        .replace("{{breadcrumb_jsonld}}", breadcrumb_jsonld)
        .replace("{{related}}", build_related(c, all_cols))
    )
    out_dir = COLUMN_DIR / slug
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / "index.html").write_text(out, encoding="utf-8")
    return f"[OK] /column/{slug}/"


def generate_details(columns: list) -> None:
    if not TEMPLATE_PATH.exists():
        print(f"[ERROR] Template not found: {TEMPLATE_PATH}", file=sys.stderr)
        sys.exit(1)
    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    COLUMN_DIR.mkdir(exist_ok=True)
    with ThreadPoolExecutor(max_workers=8) as pool:
        futures = {pool.submit(_generate_one, c, template, columns): c.get("slug") for c in columns}
        for f in as_completed(futures):
            print(f.result())


def update_sitemap(columns: list) -> None:
    if not SITEMAP_PATH.exists():
        print("[INFO] sitemap.xml not found — skipping")
        return
    src = SITEMAP_PATH.read_text(encoding="utf-8")
    cleaned = re.sub(r"\s*<url>\s*<loc>[^<]*/column/[^<]*</loc>.*?</url>", "", src, flags=re.DOTALL)
    entries = ""
    for c in columns:
        lastmod = c.get("modified_ymd", "")
        lm = f"<lastmod>{lastmod}</lastmod>" if lastmod else ""
        entries += (
            f'\n  <url><loc>{SITE_URL}/column/{c.get("slug","")}/</loc>'
            f'{lm}<changefreq>monthly</changefreq><priority>0.6</priority></url>'
        )
    result = cleaned.replace("</urlset>", f"{entries}\n</urlset>")
    SITEMAP_PATH.write_text(result, encoding="utf-8")
    print(f"[OK] sitemap.xml updated ({len(columns)} column entries)")


def main():
    print("=== build-columns.py ===")
    columns = fetch_columns()
    print(f"Fetched {len(columns)} columns from API")
    if not columns:
        print("[WARN] 公開コラムが0件です。column.html のスケルトン見本を保持して終了します。")
        print("       WP管理画面でコラムを公開してから再実行してください。")
        sys.exit(0)
    update_column_html(columns)
    generate_details(columns)
    update_sitemap(columns)
    print("=== Done ===")


if __name__ == "__main__":
    main()
