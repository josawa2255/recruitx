# SPEC — リクルートX 機能仕様

> 機能・ページ・動作の単一の正本。**機能追加・動作変更のたびに同一コミット内で更新。** 最終更新: 2026-05-24

## TL;DR

リクルートX（採用LP）の仕様。現状は新規立ち上げ前段階で、サービス定義は `TBD` を埋めていく。

## 1. サービス概要

| 項目 | 内容 |
|------|------|
| サービス名 | リクルートX（RecruitX） |
| 一言説明 | `TBD` |
| ターゲット | `TBD` |
| 提供価値 | `TBD` |
| ドメイン | `recruitx.contentsx.jp` |

## 2. ページ構成

| ページ | ファイル | 主要JS | 状態 |
|--------|---------|--------|------|
| トップLP | `index.html` | `js/main.js`（ナビsticky/ハンバーガー/入場アニメ） | 制作中（ヒーローのみ） |
| お問い合わせ | `contact.html` | `js/main.js`（HubSpot Forms API v3 直送） | 実装済み・要テスト送信 |

## 3. URL構造・ナビゲーション

- 現状のサイト内アンカー:
  - `#hero`（ヒーロー - sticky pin 350svh: 文字スワップ150svh → カーテンリビール100svh。背景固定のままAboutが下から覆う）
  - `#about`（**リクルートXとは** - 画像左/コピー右）
  - `#problem`（**こんなお悩みありませんか？** - 現場の声3連引用・明朝の大引用符）
  - `#service`（**3つのステップで採用を変える** - コンテンツ制作→SNS運用→Meta広告の縦フロー＋PLUSバンド「求人広告 運用代行」= Indeed等の運用代行・低コスト訴求）
  - `#case` / `#company` / `#news`（ナビ用に予約・未着手）
- お問い合わせは別ページ `contact.html` → ナビCTAから遷移
- 新規LPは公開時に既存ページから内部リンク5〜10本 → [../content/SEO.md](../content/SEO.md)

## 4. URLパラメータ・特殊モード

- `TBD`（`?param=...` の仕様があれば記載）

## 5. 共通コンポーネント

- ヘッダー / フッター / CTA / モーダル 等の仕様を記載（`TBD`）
- デザイン値は [DESIGN.md](DESIGN.md)、表示崩れ防止は [DEVICE-RULES.md](DEVICE-RULES.md) に従う

## 6. i18n（多言語対応）

- 対応有無: `TBD`
- 実装する場合の既存パターン（Contents X 系共通）:
  - 2層構造: JSON辞書（テキスト走査で日→英置換）+ `data-ja`/`data-en`（辞書より優先）
  - スクリプト読込順序は **`i18n → nav` を厳守**（崩すと言語切替が壊れる）
  - `translateAll()` は言語判定してから呼ぶ（無条件呼び出し禁止）
  - localStorageキーは `rx-lang`（サービス専用）
  - EN は日本語より約30%長い前提でナビ/ボタン幅を設計

## 7. 外部サービス連携

- 設定値の正本は [../operations/INFRA.md](../operations/INFRA.md)。ここでは「どの連携を使うか」のみ管理。
- 使用予定: GA4（新規）/ Clarity（新規）/ HubSpot フォーム（`TBD`）

## 8. デプロイ

- GitHub Pages / CNAME `recruitx.contentsx.jp` / DNS お名前.com
