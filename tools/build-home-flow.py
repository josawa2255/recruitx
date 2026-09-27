#!/usr/bin/env python3
"""
tools/build-home-flow.py — ホーム『09 導入の流れ』の5ステップを生成する

  tools/data/home-flow.json を読み、index.html の
  <!-- BUILD:HOME_FLOW --> … <!-- /BUILD:HOME_FLOW --> の中身を差し替える。

使い方:  python3 tools/build-home-flow.py

方針（変更しないこと）:
  - duration は資料・正式原稿に明記があるときだけ入れる（空なら期間バッジを出さない）
  - image が空なら写真の代わりに淡いピンクのアイコンパネルを出す
  - HERO・市場の変化・導入事例の画像は流用しない
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA = ROOT / "tools" / "data" / "home-flow.json"
INDEX = ROOT / "index.html"
START, END = "<!-- BUILD:HOME_FLOW -->", "<!-- /BUILD:HOME_FLOW -->"
I = "          "


def esc(v) -> str:
    return html.escape(str(v), quote=True).replace("&lt;br&gt;", "<br>").replace("&lt;b&gt;", "<b>").replace("&lt;/b&gt;", "</b>")


def step_html(step: dict) -> str:
    img = step.get("image") or {}
    if img.get("src"):
        media = (f'{I}    <figure class="rx-home-flow__media">\n'
                 f'{I}      <img src="{esc(img["src"])}" alt="{esc(img["alt"])}"\n'
                 f'{I}           width="{int(img["width"])}" height="{int(img["height"])}" loading="lazy" decoding="async">\n'
                 f'{I}    </figure>')
    else:
        # 写真が未用意のステップ。淡いピンクの面＋線画アイコンで代用する（差し替えは JSON の image に入れるだけ）
        media = (f'{I}    <p class="rx-home-flow__media rx-home-flow__media--icon" aria-hidden="true">\n'
                 f'{I}      <svg><use href="#{esc(step["icon"])}"/></svg>\n'
                 f'{I}    </p>')
    out = [f'{I}<li class="rx-home-flow__step rx-anim">',
           f'{I}  <div class="rx-home-flow__card">',
           f'{I}    <p class="rx-home-flow__head">'
           f'<span class="rx-home-flow__no">{esc(step["no"])}</span>'
           f'<span class="rx-home-flow__title">{esc(step["title"])}</span></p>',
           media,
           f'{I}    <p class="rx-home-flow__text">{esc(step["text"])}</p>']
    if step.get("duration"):
        out.append(f'{I}    <p class="rx-home-flow__duration">'
                   f'<svg aria-hidden="true"><use href="#{esc(step["icon"])}"/></svg>{esc(step["duration"])}</p>')
    out += [f'{I}  </div>', f'{I}</li>']
    return "\n".join(out)


def main() -> int:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    steps = data.get("steps") or []
    if not steps:
        print("[ERROR] steps が空です", file=sys.stderr)
        return 1

    items = "\n".join(step_html(s) for s in steps)
    parts = [f'        <ol class="rx-home-flow__list">\n{items}\n        </ol>']
    if data.get("note"):
        parts.append(f'        <p class="rx-home-flow__note">{esc(data["note"])}</p>')

    supports = data.get("supports") or []
    if supports:
        rows = []
        for sp in supports:
            rows.append(f'{I}  <li>\n'
                        f'{I}    <span class="rx-home-flow__support-icon"><svg aria-hidden="true"><use href="#{esc(sp["icon"])}"/></svg></span>\n'
                        f'{I}    <span class="rx-home-flow__support-body">\n'
                        f'{I}      <span class="rx-home-flow__support-title">{esc(sp["title"])}</span>\n'
                        f'{I}      <span class="rx-home-flow__support-text">{esc(sp["text"])}</span>\n'
                        f'{I}    </span>\n'
                        f'{I}  </li>')
        head = f'{I}<p class="rx-home-flow__support-head">{esc(data.get("supportHead", ""))}</p>\n' if data.get("supportHead") else ""
        parts.append('        <div class="rx-home-flow__supports">\n' + head +
                     f'{I}<ul class="rx-home-flow__support-list">\n' + "\n".join(rows) + f'\n{I}</ul>\n        </div>')

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
    print(f"[OK] {len(steps)}ステップを index.html に反映しました")
    return 0


if __name__ == "__main__":
    sys.exit(main())
