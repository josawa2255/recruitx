# INFRA — 開発環境・外部サービス・触ってはいけない領域

> 「どのクラウドを使っているか」「外部サービスの種別」「触ると壊れる領域はどこか」の重要情報を集約。**実IDは非公開**（公開リポのため。実値は `INFRA-PRIVATE.md`／gitignoreで保管）。

## TL;DR

リクルートXは GitHub Pages + CNAME `recruitx.contentsx.jp`、DNSはお名前.com。GA4/Clarityは**新規発行**、Google広告タグとHubSpot Portalは既存流用可（実IDは非公開ファイル参照）。

## 1. 会社情報

| 項目 | 内容 |
|------|------|
| 運営会社 | コンテンツエックス株式会社 / Contents X Co., Ltd. |
| 所在地 | 非公開（[INFRA-PRIVATE.md](INFRA-PRIVATE.md)） |
| コピーライト | © Contents X Co., Ltd. 2026 All rights reserved. |

## 2. デプロイ・インフラ

| 項目 | 値 |
|------|-----|
| ホスティング | GitHub Pages（既存2サイトと同方式） |
| ドメイン | `recruitx.contentsx.jp`（CNAME） |
| DNS | お名前.com |

## 3. 外部サービス（種別とリクルートX方針）

| サービス | 実IDの所在 | リクルートX方針 |
|----------|---------|----------------|
| GA4 | 非公開（[INFRA-PRIVATE.md](INFRA-PRIVATE.md)） | **新規プロパティ作成** |
| Microsoft Clarity | 非公開（同上） | **新規発行** |
| Google広告タグ | 非公開（同上）／**既存タグを両サイト設置済** | 既存を流用可 |
| HubSpot | 非公開（同上・[HUBSPOT-CTA-HANDOFF.md](HUBSPOT-CTA-HANDOFF.md) 参照） | **共通フォーム流用**（送信元タグ `リクルートX` で識別） |
| WordPress API | 非公開（同上） | 必要時に利用（コラム/制作事例CMS） |
| Google Search Console | 両サイト登録・サイトマップ送信済 | 公開後に登録 |

### WordPress（WP）運用メモ
- CMSは社内WP環境（実URL非公開）。**PHPローカルがマスター**、お名前.comファイルマネージャーでアップロード。

## 4. 触ってはいけない領域 ⛔（既存資産を参照・流用する際の地雷）

具体的なパス・GitHub Actions等は [INFRA-PRIVATE.md](INFRA-PRIVATE.md) 参照。要点のみ:

- BizMangaの**外部配布済みURL**は変更禁止
- **301リダイレクト用HTML**は削除禁止
- **共有画像フォルダ**の画像削除は、両リポgrepで参照確認してから
- 既存サイトの**日次ランクトラッカー**（GitHub Actions）は触らない

## 5. 公開ポリシー（このリポについて）

このリポジトリは public のため、**運用機微情報（外部サービスID・触禁領域の具体パス）は本ファイルから外し**、`INFRA-PRIVATE.md`（gitignored）に集約しています。
- リポを clone した開発者は、別ルート（社内Wiki等）から `INFRA-PRIVATE.md` を取得して `docs/operations/` 配下に配置すること
- 新規にIDが必要な作業をする場合は、コミット対象に含めないよう注意
- ランタイムJS（`js/main.js`）には HubSpot ID等が**ハードコードで残っている**（API呼び出しに必要なため）。これはブラウザのview-sourceで誰でも閲覧可能、というのは仕様
