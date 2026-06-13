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
| ドメイン | `recruitx.contentsx.jp`（CNAME）— **2026-06-13 開通済み・常時SSL** |
| DNS | お名前.com（CNAME `recruitx`→`josawa2255.github.io`） |

### サブドメイン開通手順（ランブック・他サービスにも流用可）

GitHub Pages のプロジェクトページに `*.contentsx.jp` サブドメインを割り当てる標準手順。`recruitx.contentsx.jp` 開通（2026-06-13）で実証済み。新サービスでも同じ流れ。

1. **お名前.com で CNAME レコード追加**（DNS設定 → DNSレコード設定 → 対象ドメイン `contentsx.jp` → 「レコード追加」）
   - ホスト名: `<サブドメイン>`（例 `recruitx`。`.contentsx.jp` は自動付与。フルFQDNを書かない）
   - TYPE: `CNAME` / VALUE: `<GitHubユーザー名>.github.io`（例 `josawa2255.github.io`。リポ所有者の Pages ホスト。末尾ドット任意） / TTL: `3600`
   - 「追加」→「確認画面へ進む」→「設定する」。伝播は数分〜1時間
   - ※ネームサーバーが `01〜04.dnsv.jp`（有効）であることが前提（お名前.comのDNSレコード設定が使える状態）
2. **GitHub Pages でカスタムドメイン設定**（Settings → Pages）
   - Custom domain に `<サブドメイン>.contentsx.jp` を入力して Save → リポ直下に `CNAME` ファイルが自動生成される（手動作成不要）
   - 「DNS Check in Progress」→ 伝播後に緑 ✓。証明書は自動発行（approved になる）
3. **Enforce HTTPS にチェック**（証明書発行後に押せるようになる）。これで `http://` → `https://` 301リダイレクト＝常時SSL
4. **検証コマンド**:
   - `dig <サブドメイン>.contentsx.jp +short` → `<user>.github.io.` ＋ GitHub IP `185.199.108-111.153` が返る
   - `gh api repos/<owner>/<repo>/pages` → `cname` 一致・`https_enforced: true`・証明書 `state: approved`
   - `curl -sI -o /dev/null -w "%{http_code} -> %{redirect_url}\n" http://<サブドメイン>.contentsx.jp/` → `301 -> https://...`

**注意**: 当リポは相対パス設計のため、サブパス配信（`josawa2255.github.io/recruitx/`）でもルート配信（`recruitx.contentsx.jp/`）でもリンク・CSSが壊れない。絶対パス（`/css/...`）に戻すとサブパス時に壊れる（→ CLAUDE.md・BUGS.md）。

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
- **採用事例CMS（2026-06-12 WP側実装済み）**: case.html のカード＋「詳しく見る」詳細ページをWPの専用投稿タイプ `rx_case` で管理する。
  - API: 一覧 `GET {API}/cases` / 個別 `GET {API}/cases/{id}`（詳細本文 `content` つき）
  - フィールド: 会社名（タイトル）/ タグ（`rx_case_tag`・チェックボックス選択）/ 成果概要 / メイン画像（アイキャッチ＋フォーカルポイント `focal.x/y` → フロントは `object-position: x% y%` で再現）/ 実績数値 `stats[{label,value,unit,arrow:up|down|none}]` 最大3個可変
  - 詳細ページURLは `/case/{slug}` 予定（サブディレクトリ化に伴い、該当ページはパス規約を絶対パスへ切替）
  - フロント実装（fetch JS・静的ビルド・日次cron）は未着手。WP側手順の正本は ContentX_HP 側 `docs/operations/WP-SERVICE-ONBOARDING.md`

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
