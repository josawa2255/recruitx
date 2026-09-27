#!/usr/bin/env python3
"""
tools/build-home-plans.py — ホーム『08 料金』のプランカードを生成する

  tools/data/home-plans.json を読み、index.html の
  <!-- BUILD:HOME_PLANS --> … <!-- /BUILD:HOME_PLANS --> の中身を差し替える。

使い方:  python3 tools/build-home-plans.py

方針（変更しないこと）:
  - 構成は 03 課題ナビ・06 3つの改善ルート と同じ A / B / AI のルート別
  - 金額は正式資料に書かれている場合だけ入れる。推測・デザイン案・旧料金体系の数字を使わない
  - price が数値なら大きな数字、文字列（例「個別お見積り」）ならそのままカード内で最も強く見せる
  - 税区分・契約期間・追加費用を資料に無い形で補足しない
  - provisional: true のプランがある場合だけ、仮表記であることの注意書きを出す
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA = ROOT / "tools" / "data" / "home-plans.json"
INDEX = ROOT / "index.html"
START, END = "<!-- BUILD:HOME_PLANS -->", "<!-- /BUILD:HOME_PLANS -->"
I = "          "
NUMERIC = re.compile(r"^[0-9]+(\.[0-9]+)?$")


def esc(v) -> str:
    return html.escape(str(v), quote=True)


def price_html(plan: dict) -> list[str]:
    price = str(plan.get("price") or "").strip()
    if not price:
        return []
    prefix = plan.get("pricePrefix") or ""
    suffix = plan.get("priceSuffix") or ""
    if NUMERIC.match(price):
        # 正式価格が決まったら、この分岐で大きな数字として出る
        head = f'<span class="rx-home-plan__price-prefix">{esc(prefix)}</span>' if prefix else ""
        tail = f'<small>{esc(suffix)}</small>' if suffix else ""
        return [f'{I}  <p class="rx-home-plan__price">{head}<b>{esc(price)}</b>{tail}</p>']
    # 未確定のあいだは文字（個別お見積り など）をカード内で最も強く見せる
    return [f'{I}  <p class="rx-home-plan__price rx-home-plan__price--text">'
            f'{esc(prefix)}{esc(price)}{esc(suffix)}</p>']


def card(plan: dict) -> str:
    cls = " rx-home-plan--featured" if plan.get("recommended") else ""
    out = [f'{I}<li class="rx-home-plan{cls} rx-anim">']
    if plan.get("recommended"):
        out.append(f'{I}  <p class="rx-home-plan__badge">おすすめ</p>')
    label = [f'{I}  <p class="rx-home-plan__label">{esc(plan.get("planNumber", ""))}']
    if plan.get("route"):
        label.append(f'<span class="rx-home-plan__route">{esc(plan["route"])}</span>')
    label.append("</p>")
    out.append("".join(label))
    out.append(f'{I}  <h3 class="rx-home-plan__name">{esc(plan["title"])}</h3>')
    if plan.get("description"):
        out.append(f'{I}  <p class="rx-home-plan__desc">{esc(plan["description"])}</p>')
    out += price_html(plan)
    if plan.get("priceSub"):
        out.append(f'{I}  <p class="rx-home-plan__price-sub">{esc(plan["priceSub"])}</p>')

    features = plan.get("features") or []
    if features:
        out.append(f'{I}  <ul class="rx-home-plan__items">')
        for f in features:
            out.append(f'{I}    <li>{esc(f)}</li>')
        out.append(f'{I}  </ul>')
    if plan.get("extra"):
        out.append(f'{I}  <p class="rx-home-plan__extra">＋ {esc(plan["extra"])}</p>')
    out.append(f"{I}</li>")
    return "\n".join(out)


def main() -> int:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    plans = data.get("plans") or []
    if not plans:
        print("[ERROR] plans が空です", file=sys.stderr)
        return 1

    cards = "\n".join(card(p) for p in plans)
    notes = [n for n in (data.get("note"), data.get("subNote")) if n]
    if any(p.get("provisional") for p in plans) and data.get("provisionalNote"):
        notes.insert(0, data["provisionalNote"])
    parts = [f'        <ul class="rx-home-plans__list">\n{cards}\n        </ul>']
    if notes:
        parts.append("\n".join(f'        <p class="rx-home-plans__note">{esc(n)}</p>' for n in notes))
    cta = data.get("cta") or {}
    if cta.get("label") and cta.get("href"):
        # 正式料金が未確定のあいだは、料金ページではなく相談窓口へ送る
        parts.append(f'        <p class="rx-home-plans__cta-wrap">'
                     f'<a class="rx-home-plans__cta" href="{esc(cta["href"])}">{esc(cta["label"])}'
                     f'<span class="rx-home-plans__cta-arrow" aria-hidden="true"></span></a></p>')
    body = "\n\n".join(parts)

    src = INDEX.read_text(encoding="utf-8")
    if START not in src or END not in src:
        print(f"[ERROR] {INDEX.name} に BUILD マーカーがありません", file=sys.stderr)
        return 1
    new = re.sub(re.escape(START) + r".*?" + re.escape(END),
                 f"{START}\n{body}\n        {END}", src, flags=re.S)
    if new == src:
        print("[INFO] 変更なし")
        return 0
    INDEX.write_text(new, encoding="utf-8")
    print(f"[OK] {len(plans)}プランを index.html に反映しました")
    return 0


if __name__ == "__main__":
    sys.exit(main())
