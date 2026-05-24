# INFRA — 開発環境・外部サービス・触ってはいけない領域

> 「どのクラウドを使っているか」「外部サービスIDは何か」「触ると壊れる領域はどこか」の重要情報を集約。**外部サービス値の単一の正本。**

## TL;DR

リクルートXは GitHub Pages + CNAME `recruitx.contentsx.jp`、DNSはお名前.com。GA4/Clarityは**新規発行**、Google広告タグとHubSpot Portalは既存流用可。下表の既存IDは兄弟サイトのもの（流用判断の材料）。

## 1. 会社情報

| 項目 | 内容 |
|------|------|
| 運営会社 | コンテンツエックス株式会社 / Contents X Co., Ltd. |
| 所在地 | 東京都目黒区中目黒1-8-8 目黒F2ビルディング1F |
| コピーライト | © Contents X Co., Ltd. 2026 All rights reserved. |

## 2. デプロイ・インフラ

| 項目 | 値 |
|------|-----|
| ホスティング | GitHub Pages（既存2サイトと同方式） |
| ドメイン | `recruitx.contentsx.jp`（CNAME） |
| DNS | お名前.com |

## 3. 外部サービス（既存値と新サービス方針）

| サービス | 既存の値 | リクルートX方針 |
|----------|---------|----------------|
| GA4 | C `G-B000C4JCCX` / B `G-Q1T3033Q3W` | **新規プロパティ作成** |
| Microsoft Clarity | C `wd1694xs70` / B `wd18nkhvy8` | **新規発行** |
| Google広告タグ | `AW-18108125426`（両サイト設置済） | 既存を流用可 |
| HubSpot | Portal `48367061` / 共通フォーム `b6da14d0-d60d-4357-89fc-0015ed32b704` | Portal流用・**専用フォーム発行を検討** |
| WordPress API | `https://cms.contentsx.jp/wp-json/contentsx/v1` | 必要時に利用（コラム/制作事例CMS） |
| Google Search Console | 両サイト登録・サイトマップ送信済 | 公開後に登録 |

### WordПress（WP）運用メモ
- CMSは `cms.contentsx.jp`。**PHPローカルがマスター**、お名前.comファイルマネージャーでアップロード。

## 4. 触ってはいけない領域 ⛔（既存資産を参照・流用する際の地雷）

- ⛔ `/biz-library`（BizManga）URL は QRコードで外部配布済み、**絶対変更禁止**
- ⛔ `ContentX/bizmanga/*.html`（8ファイル）は旧URL救済の301リダイレクト、**削除厳禁**
- ⛔ `ContentX/material/` の画像削除は**両リポジトリをgrep**してから（BizMangaが絶対URLで参照）
- GSC日次ランクトラッカー（GitHub Actions）が毎朝9時JSTで稼働中
