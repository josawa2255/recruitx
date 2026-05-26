# DESIGN — リクルートX デザイントークン

> 本サービス独自のデザイン値（**新規設計・ここを埋める**）。表示崩れ防止の普遍ルールは [DEVICE-RULES.md](DEVICE-RULES.md)。

## TL;DR

リクルートXは**デザイン新規**。トーンは**白基調 × Instagram/TikTok風の鮮やかなグラデーション**（提案書スライドの暗色ネイビー×ゴールドとは意図的に分ける。LPは明るく社会的・共感寄り）。**フォント確定**（見出し Zen Kaku Gothic New / 本文 Noto Sans JP）、**色確定**。クラスは `.rx-` / CSS変数は `--rx-*` を使う。
（参考: Contents X はCyber Green系の硬質ミニマル、BizMangaはオレンジ系の漫画トーン。**流用せず**トーンの参考まで。）

## カラーパレット

ブランドの署名は**ピンク→マゼンタ→紫のグラデーション**（Instagram/TikTok風）。ブルーを信頼の差し色に。

| 用途 | 変数 | 値 |
|------|------|-----|
| 主アクセント（ピンク/マゼンタ） | `--rx-accent` | `#ec2d87` |
| アクセントRGB | `--rx-accent-rgb` | `236, 45, 135` |
| アクセントhover | `--rx-accent-hover` | `#d61f76` |
| **ブランドグラデ**（署名色・CTA/帯） | `--rx-grad` | `linear-gradient(95deg, #a32bbf 0%, #e6268d 55%, #ff3d87 100%)` |
| 副アクセント（ブルー） | `--rx-accent-2` | `#2f80ed` |
| 補助（スカイ/シアン・少量） | `--rx-accent-3` | `#38bdf8` |
| 背景白 | `--rx-bg` | `#ffffff` |
| 背景薄（section交互） | `--rx-bg-light` | `#f6f7fb` |
| テキスト主 | `--rx-text` | `#1a2742` |
| テキスト副 | `--rx-text-muted` | `#5c6b85` |
| ボーダー | `--rx-border` | `#e7eaf1` |
| カード背景 | `--rx-card-bg` | `#ffffff` |
| カード影 | `--rx-shadow` | `0 4px 24px rgba(28, 40, 74, .08)` |
| 角丸（標準カード） | `--rx-radius` | `16px` |
| 角丸（大カード/モーダル） | `--rx-radius-lg` | `24px` |
| 角丸（ボタン・pill） | `--rx-radius-pill` | `999px` |

- **ヒーロー見出しは単語ごとに色替え**：ピンク「SNS」→ブルー「知って」→ピンク「好きになって」→濃紺「応募される」。
- グラデは紫(左)→ピンク(右)の3段。テキストには原則使わず、CTA・帯・アイコン面に使用（可読性確保）。

## フォント

**全OS同一描画のため自前ホスト(WOFF2)で固定 + 和文サブセット**（崩れ対策は [DEVICE-RULES.md](DEVICE-RULES.md) §16）。両書体とも Google Fonts 提供・無料。

```css
/* 本文 */
font-family: 'Noto Sans JP', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', 'Yu Gothic', Meiryo, sans-serif;
/* 見出し */
font-family: 'Zen Kaku Gothic New', 'Noto Sans JP', 'Hiragino Sans', sans-serif;
```

| 用途 | 書体 | ウェイト | 備考 |
|------|------|---------|------|
| 見出し | Zen Kaku Gothic New | 700 / 900 | コントラストを出す。`palt` + 微 letter-spacing 可 |
| 本文 | Noto Sans JP | 400（強調 500/700） | `line-height` 1.7〜1.9・unitless |

- **読み込むウェイトは必要分だけ**（和文は1ウェイトでも重い。Zen=700/900、Noto=400/700 程度に絞る）。
- 数字を見せる箇所（割合・金額）は `font-variant-numeric: tabular-nums`（[DEVICE-RULES.md](DEVICE-RULES.md) §16）。

## タイポスケール / ボタン / コンテナ幅

**clamp は rem+vw 混在**（純vw禁止＝ズームで拡大されずWCAG 1.4.4違反）。**最大は最小の2.5倍以内**（[DEVICE-RULES.md](DEVICE-RULES.md) §5）。

| 用途 | 変数 | 値（≒px 320→1440幅） |
|------|------|------|
| ヒーロー見出し h1 | `--rx-fs-hero` | `clamp(2rem, 1.3rem + 3vw, 3.5rem)`（32→56） |
| 見出し h2 | `--rx-fs-h2` | `clamp(1.5rem, 1.15rem + 1.6vw, 2.25rem)`（24→36） |
| 見出し h3 | `--rx-fs-h3` | `clamp(1.25rem, 1.1rem + 0.7vw, 1.5rem)`（20→24） |
| リード文 | `--rx-fs-lead` | `clamp(1.0625rem, 1rem + 0.3vw, 1.25rem)`（17→20） |
| 本文 | `--rx-fs-body` | `1rem`（16px固定可・§5） |
| 補足/キャプション | `--rx-fs-small` | `0.875rem`（14px） |

**ボタン**
```css
.rx-btn { border-radius: var(--rx-radius-pill); padding: clamp(.85rem, .7rem + .6vw, 1.05rem) clamp(1.5rem, 1.2rem + 1.2vw, 2.25rem);
          min-height: 48px; font-weight: 700; }              /* タップ44px超(§12) */
.rx-btn--primary { background: var(--rx-grad); color: #fff; } /* グラデCTA「無料で相談する」 */
.rx-btn--ghost   { background: #fff; color: var(--rx-text); border: 1px solid var(--rx-border); } /* 「資料をDL」 */
```

**コンテナ幅**（[DEVICE-RULES.md](DEVICE-RULES.md) §9 準拠）
```css
.rx-container { width: min(100%, 1200px); margin: 0 auto; padding: 0 clamp(16px, 3vw, 32px); }
@media (min-width:1440px){ .rx-container{ max-width:1340px; } }
@media (min-width:1920px){ .rx-container{ max-width:1560px; } }
section { padding: clamp(48px, 8vw, 160px) 0; }
/* 長文本文ブロックのみ可読性のため max-width 720〜820px */
```

## クラス命名規則

- プレフィックス `.rx-`（例 `.rx-header` `.rx-hero` `.rx-btn` `.rx-container`）
- z-index は生数字を使わず階層変数（[DEVICE-RULES.md](DEVICE-RULES.md) §11）

> 確定したら値をここに記入し、`TBD` を消す。
