#!/usr/bin/env python3
"""
tools/build-home-plans.py — ホーム『08 料金』のプランカードを生成する

  tools/data/home-plans.json を読み、index.html の
  <!-- BUILD:HOME_PLANS --> … <!-- /BUILD:HOME_PLANS --> の中身を差し替える。

使い方:  python3 tools/build-home-plans.py

方針（変更しないこと）:
  - 金額・本数・注記は営業資料からの転記のみ。推測で作らない
  - 税区分・契約期間・追加費用を資料に無い形で補足しない
  - 正式金額が未確定のプランは price を空にする（数字の枠を出さずに成立する）
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


def esc(v) -> str:
    return html.escape(str(v), quote=True)


def card(plan: dict) -> str:
    cls = " rx-home-plan--featured" if plan.get("recommended") else ""
    out = [f'{I}<li class="rx-home-plan{cls} rx-anim">']
    if plan.get("recommended"):
        out.append(f'{I}  <p class="rx-home-plan__badge">おすすめ</p>')
    out.append(f'{I}  <p class="rx-home-plan__label">{esc(plan["label"])}</p>')
    out.append(f'{I}  <h3 class="rx-home-plan__name">{esc(plan["name"])}</h3>')
    if plan.get("desc"):
        out.append(f'{I}  <p class="rx-home-plan__desc">{esc(plan["desc"])}</p>')

    price = plan.get("price") or {}
    if price.get("value"):
        prefix = f'<span class="rx-home-plan__price-prefix">{esc(price["prefix"])}</span>' if price.get("prefix") else ""
        out.append(f'{I}  <p class="rx-home-plan__price">{prefix}'
                   f'<b>{esc(price["value"])}</b>'
                   f'<small>{esc(price.get("unit", ""))}</small></p>')
        if plan.get("priceSub"):
            out.append(f'{I}  <p class="rx-home-plan__price-sub">{esc(plan["priceSub"])}</p>')
    elif plan.get("priceNote"):
        # 正式金額が未確定のプランは、数字の枠を埋めずに文言だけ置く
        out.append(f'{I}  <p class="rx-home-plan__price-sub">{esc(plan["priceNote"])}</p>')

    items = plan.get("items") or []
    if items:
        out.append(f'{I}  <ul class="rx-home-plan__items">')
        for it in items:
            out.append(f'{I}    <li>{esc(it)}</li>')
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
    notes_html = "\n".join(
        f'        <p class="rx-home-plans__note">{esc(n)}</p>' for n in notes
    )

    body = (f'        <ul class="rx-home-plans__list">\n{cards}\n        </ul>\n\n{notes_html}')

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
