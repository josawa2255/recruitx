# DESIGN — リクルートX デザイントークン

> 本サービス独自のデザイン値（**新規設計・ここを埋める**）。表示崩れ防止の普遍ルールは [DEVICE-RULES.md](DEVICE-RULES.md)。

## TL;DR

リクルートXは**デザイン新規**。色・フォント・角丸は未確定（`TBD`）。クラスは `.rx-` / CSS変数は `--rx-*` を使う。
（参考: Contents X はCyber Green系の硬質ミニマル、BizMangaはオレンジ系の漫画トーン。**流用せず**トーンの参考まで。）

## カラーパレット

| 用途 | 変数 | 値 |
|------|------|-----|
| アクセント | `--rx-accent` | `TBD` |
| アクセントRGB | `--rx-accent-rgb` | `TBD` |
| アクセントhover | `--rx-accent-hover` | `TBD` |
| 背景白 | `--rx-bg` | `#ffffff` |
| 背景薄 | `--rx-bg-light` | `TBD` |
| テキスト主 | `--rx-text` | `TBD` |
| テキスト副 | `--rx-text-muted` | `TBD` |
| ボーダー | `--rx-border` | `TBD` |
| カード背景 | `--rx-card-bg` | `#ffffff` |
| 角丸 | `--rx-radius` | `TBD` |

## フォント

```css
/* 本文 */ font-family: 'TBD', 'Noto Sans JP', sans-serif;
/* 見出し */ font-family: 'TBD', sans-serif;
```

## タイポスケール / ボタン / コンテナ幅

- 見出し・本文の clamp 値: `TBD`（固定px禁止 → [DEVICE-RULES.md](DEVICE-RULES.md) §5）
- ボタン角丸・padding: `TBD`
- コンテナ max-width: `TBD`

## クラス命名規則

- プレフィックス `.rx-`（例 `.rx-header` `.rx-hero` `.rx-btn` `.rx-container`）
- z-index は生数字を使わず階層変数（[DEVICE-RULES.md](DEVICE-RULES.md) §11）

> 確定したら値をここに記入し、`TBD` を消す。
