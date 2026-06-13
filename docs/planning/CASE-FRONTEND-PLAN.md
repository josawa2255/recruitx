# 採用事例フロント実装計画（CASE-FRONTEND-PLAN）

> 「事例カードをクリックすると詳細ページが表示される」を実現する静的ビルドの要件書。
> **実装済み（2026-06-13）**: `tools/build-cases.py` / `tools/templates/case-detail.html.tpl` / `css/case-detail.css` / `.github/workflows/build-cases.yml` / case.html BUILD markers。
> WP側（CPT `rx_case`・REST API）は実装済みで、コンテンツも入り始めている。
> 着手トリガー: 「詳細ページを作りたい」「フロント実装」「ビルドして」等。

## ゴール（3点セット）

1. **case.html のカード一覧をWP駆動に置き換え** — ハードコードされた11枚のカードを、ビルド時にWP REST APIから生成
2. **詳細ページ `/case/{slug}` の静的生成** — 「詳しく見る」のリンク先。本文はWPの標準エディタで編集された HTML
3. **GitHub Actions 日次ビルド＋手動即時ビルド**（workflow_dispatch）

## データ源

- 一覧: `GET {API}/cases`（実URLは [INFRA-PRIVATE.md](../operations/INFRA-PRIVATE.md)。整形済みJSON）
- 個別: `GET {API}/cases/{id}` — 一覧の全フィールド＋ `content`（本文HTML）
- 主なフィールド: `slug` / `company`（タイトル） / `tags`・`tag_slugs` / `summary` / `image`（large WebP URL） / `focal {x,y}` / `stats [{label,value,unit,arrow}]`（最大3・arrow=up|down|none） / `seo_title`・`seo_description`（空欄フォールバック適用済みの最終値）
- 静的ビルドはサーバーサイドfetchのため**CORS不要**（CORSはクライアントJS用に設定済み）

## カード一覧の生成要件

- 既存の `rx-ccard` マークアップ構造・クラスを踏襲（case.css を変えずに済む形）
- メイン画像: `<img src="{image}" style はNG → object-position は focal 値からインラインでなくstyle属性 or CSS変数で出力`（実装時に既存CSSと整合する方式を選ぶ）
- 数値ブロック: 1〜3個可変。`arrow` up=右上矢印SVG / down=右下矢印SVG / none=非表示（既存SVGパスを流用）
- タグ表示: 業種タグ（飲食・清掃・家事代行）を先頭にソートして「業種 / 採用種別」の見た目を再現
- 絞り込みボタン: 業種タグから自動生成（`data-filter` は tag_slug）
- 並び順: 公開日時ベース。**現行ページの並びを保つ運用は公開日の調整で行う**（実装時に確定）

## 詳細ページの生成要件

- URL形式: `/case/{slug}.html` か `/case/{slug}/index.html` かは実装時に決定（リンクは `/case/{slug}` で書けるよう後者推奨）
- `<title>`=`seo_title`・`<meta name="description">`=`seo_description`（API側でフォールバック適用済み）
- H1・成果サマリー（stats再掲）・本文（content）・CTA・事例一覧への戻り導線
- 本文HTMLはWP管理者入力だが、**出力前のサニタイズ方針を実装時に確認**（BUGS.md #039 の原則）
- 構造化データ: Article＋BreadcrumbList（FAQはWP本文にQ&Aがある場合 FAQPage）をビルドで出力（**本文に`<script>`は書かない**設計）
- ⚠️ **パス規約の切替**: 詳細ページはサブディレクトリ配下になるため、CLAUDE.md の「同階層相対パス」ルールを**絶対パス（`/`始まり）へ移行**する必要がある（ナビ・CSS・JS参照。既存ルートページの扱いも含めて実装時に一括判断し、CLAUDE.md / docs/specs/DEVICE-RULES.md を更新）

## ビルド・自動化

- 手本: BizManga の `tools/build-columns.py`・`js/bm-wp-api.js`・`.github/workflows/` のビルド系（ContentX_HPワークスペース内）
- スクリプト: `tools/build-cases.py`（API取得→カード一覧差し込み→詳細ページ生成）
- workflow: 日次cron＋workflow_dispatch。WP編集後すぐ反映したい時は手動ビルド（「ビルドして」でClaudeが実行）
- ビルド後、SEOワークフローの Step 6（/seo-content）・Step 7（/seo-page）を生成HTMLに対して実施する（全公開事例まとめてで可）

## 前提・関連

- 言語: 日本語のみでスタート（i18nは対象外）
- サブドメイン未開通でも実装・ローカル検証は可能（公開はDNS＋CNAME設定後）
- SEO戦略・KW割当は本リポに書かない（制作管理は非公開リポ側。ハブ=採用ワークスペース直下のCLAUDE.md参照）
