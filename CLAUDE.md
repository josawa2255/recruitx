# リクルートX — Claude Code 作業ガイド

> リクルートX（RecruitX）採用LP の入口ドキュメント。**まずここを読み、変更時はどのドキュメントを更新するか [docs/DOC-RULES.md](docs/DOC-RULES.md) で判断する。**

## TL;DR（最優先で守る3点）

1. **絶対パス必須**・**HTML/CSS/JS分離**・**commit & push は Claude が実施**
2. **絵文字禁止 / 「Webtoon」表記回避（→「縦スクロール漫画」「縦読み」）/ AI混在比率を書かない**
3. 機能・動作・URL・共通コンポーネントを変えたら **同一コミット内で該当mdを更新**（後回し禁止）

## リポジトリ

| 項目 | 値 |
|------|-----|
| サービス | リクルートX（英 RecruitX） |
| 運営会社 | コンテンツエックス株式会社 |
| 社内プレフィックス | `[R]` = リクルートX（兄弟: `[C]`=Contents X / `[B]`=BizManga） |
| ドメイン | `recruitx.contentsx.jp`（GitHub Pages + CNAME / DNS お名前.com） |
| クラスプレフィックス | `.rx-` / CSS変数 `--rx-*` / localStorage `rx-lang` |

## エンジニアリング規約（Contents X 系共通・厳守）

- **リンクは絶対パス必須**: `href`/`src` は必ず `/` 始まり（相対パスはサブディレクトリで404の主因）
- **HTML/CSS/JS分離**: インラインCSS/JS禁止、最初から外部ファイルに分ける
- **commit & push は Claude 側で実施**
- バグを直したら [BUGS.md](BUGS.md) に1行追記

## ブランドボイス（厳守）

| ルール | 内容 |
|--------|------|
| 絵文字禁止 | SVG / タイポ記号（+ − — 「」）で代替（絵文字多用はAI製LPの兆候） |
| 「Webtoon」表記回避 | ユーザー可視は「縦スクロール漫画」「縦読み」。CSS/JS内部識別子は可（NAVER商標対策） |
| AI混在比率を書かない | 「7割人間3割AI」等は禁止。「独自の制作メソッド」として訴求 |
| 平易な日本語で | 変数名・コード用語の羅列をせず自然な日本語で説明 |

## ドキュメント・ルーティング

| 何を変えたか | 更新するファイル |
|---|---|
| 機能・ページ・URL・コンポーネント | [docs/specs/SPEC.md](docs/specs/SPEC.md) |
| 色・フォント・角丸などデザイントークン | [docs/specs/DESIGN.md](docs/specs/DESIGN.md) |
| 全デバイス表示の崩れ防止ルール | [docs/specs/DEVICE-RULES.md](docs/specs/DEVICE-RULES.md) |
| メタ・構造化データ・内部リンク | [docs/content/SEO.md](docs/content/SEO.md) |
| WP・クラウド・外部サービスID・触禁領域 | [docs/operations/INFRA.md](docs/operations/INFRA.md) |
| やること・拡張計画 | [docs/planning/ROADMAP.md](docs/planning/ROADMAP.md) |
| 学び・引き継ぎ知識 | [docs/planning/KNOWLEDGE.md](docs/planning/KNOWLEDGE.md) |
| バグと再発防止 | [BUGS.md](BUGS.md) |
| **md運用ルール・スキル使用・自動修整の判断** | [docs/DOC-RULES.md](docs/DOC-RULES.md) ⭐ |
| **Claude公式の最新推奨の追従状況** | [docs/operations/BEST-PRACTICE-WATCH.md](docs/operations/BEST-PRACTICE-WATCH.md) ⭐ |

迷ったら [docs/DOC-RULES.md](docs/DOC-RULES.md) を見る。
