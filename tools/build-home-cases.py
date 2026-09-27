#!/usr/bin/env python3
"""
tools/build-home-cases.py — ホーム『07 導入事例』のカードを生成する

  tools/data/home-cases.json を読み、index.html の
  <!-- BUILD:HOME_CASES --> … <!-- /BUILD:HOME_CASES --> の中身を差し替える。

使い方:  python3 tools/build-home-cases.py

方針（変更しないこと）:
  - 事例の文言・数値は case/{slug}/index.html（原典）からの転記のみ。推測で足さない
  - 全体の参考実績（02 実績の数字）の数値を個別事例へ流用しない
  - route（A / B / AI）は正式な紐付けが確定したときだけ入れる。null なら表示しない
  - results が空なら数字は出さず、resultText（正式に確認できる文章）で成立させる
"""
import html
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent
DATA = ROOT / "tools" / "data" / "home-cases.json"
INDEX = ROOT / "index.html"
START, END = "<!-- BUILD:HOME_CASES -->", "<!-- /BUILD:HOME_CASES -->"

# name / issue.name などは <br> だけ許可したいので、エスケープ後に戻す
def esc(value: str) -> str:
    return html.escape(str(value), quote=True).replace("&lt;br&gt;", "<br>")


def tags_html(case: dict, indent: str) -> str:
    rows = [f'<span class="rx-home-case__tag">{esc(case["industry"])}</span>']
    if case.get("employmentType"):
        rows.append(f'<span class="rx-home-case__tag rx-home-case__tag--sub">{esc(case["employmentType"])}</span>')
    # 改善ルート（A / B / AI）は正式な対応関係が確定したときだけ出る
    if case.get("route"):
        rows.append(f'<span class="rx-home-case__tag rx-home-case__tag--route">{esc(case["route"])}</span>')
    body = f"\n{indent}  ".join(rows)
    return f'{indent}<p class="rx-home-case__tags">\n{indent}  {body}\n{indent}</p>'


def step_html(case: dict, key: str, label: str, modifier: str, indent: str) -> str:
    step = case.get(key) or {}
    out = [f'{indent}<div class="rx-home-case__step">',
           f'{indent}  <span class="rx-home-case__label{modifier}">{label}</span>',
           f'{indent}  <p class="rx-home-case__step-name">{esc(step.get("name", ""))}</p>']
    if step.get("text"):
        out.append(f'{indent}  <p class="rx-home-case__step-text">{esc(step["text"])}</p>')
    out.append(f"{indent}</div>")
    return "\n".join(out)


def result_html(case: dict, indent: str) -> str:
    results = case.get("results") or []
    out = [f'{indent}<div class="rx-home-case__result">',
           f'{indent}  <span class="rx-home-case__label rx-home-case__label--res">成果</span>']
    if results:
        inner = "wrap" if len(results) > 1 else "single"
        if inner == "wrap":
            out.append(f'{indent}  <div class="rx-home-case__kpis">')
            pad = f"{indent}    "
        else:
            pad = f"{indent}  "
        for r in results:
            out += [f'{pad}<p class="rx-home-case__kpi">',
                    f'{pad}  <span class="rx-home-case__kpi-label">{esc(r["label"])}</span>',
                    f'{pad}  <span class="rx-home-case__kpi-value"><b>{esc(r["value"])}</b><small>{esc(r["unit"])}</small></span>',
                    f'{pad}</p>']
        if inner == "wrap":
            out.append(f"{indent}  </div>")
    elif case.get("resultText"):
        # 正式な数値が無い事例は、数字のスペースを無理に埋めず文章で見せる
        out.append(f'{indent}  <p class="rx-home-case__result-text">{esc(case["resultText"])}</p>')
    out.append(f"{indent}</div>")
    return "\n".join(out)


def card_html(case: dict, lead: bool) -> str:
    cls = "rx-home-case--lead" if lead else "rx-home-case--sub"
    i = "          " if lead else "            "
    img = case["image"]
    arrow = f'{i}      <span class="rx-home-case__arrow" aria-hidden="true"></span>\n' if lead else ""
    return f'''{i}<a class="rx-home-case {cls} rx-anim" href="{esc(case["url"])}">
{i}  <figure class="rx-home-case__media">
{i}    <img src="{esc(img["src"])}"
{i}         alt="{esc(img["alt"])}" width="{int(img["width"])}" height="{int(img["height"])}" loading="lazy" decoding="async">
{i}  </figure>
{i}  <div class="rx-home-case__body">
{tags_html(case, i + "    ")}
{i}    <h3 class="rx-home-case__company">{esc(case["company"])}</h3>
{i}    <p class="rx-home-case__desc">{esc(case["summary"])}</p>

{i}    <div class="rx-home-case__flow">
{step_html(case, "issue", "課題", "", i + "      ")}
{arrow}{step_html(case, "measure", "施策", " rx-home-case__label--act", i + "      ")}
{arrow}{result_html(case, i + "      ")}
{i}    </div>

{i}    <span class="rx-home-case__more">導入事例を見る<span class="rx-home-case__more-arrow" aria-hidden="true"></span></span>
{i}  </div>
{i}</a>'''


def main() -> int:
    data = json.loads(DATA.read_text(encoding="utf-8"))
    cases = data.get("cases") or []
    if not cases:
        print("[ERROR] cases が空です", file=sys.stderr)
        return 1

    blocks = [card_html(cases[0], lead=True)]
    subs = cases[1:]
    if subs:
        inner = "\n\n".join(card_html(c, lead=False) for c in subs)
        blocks.append(f'          <div class="rx-home-cases__sub">\n{inner}\n          </div>')
    body = "\n\n".join(blocks)

    src = INDEX.read_text(encoding="utf-8")
    if START not in src or END not in src:
        print(f"[ERROR] {INDEX.name} に BUILD マーカーがありません", file=sys.stderr)
        return 1
    new = re.sub(
        re.escape(START) + r".*?" + re.escape(END),
        f"{START}\n{body}\n          {END}",
        src,
        flags=re.S,
    )
    if new == src:
        print("[INFO] 変更なし")
        return 0
    INDEX.write_text(new, encoding="utf-8")
    print(f"[OK] {len(cases)}件を index.html に反映しました")
    return 0


if __name__ == "__main__":
    sys.exit(main())
