# ROADMAP — やること / 未来の拡張性

> タスク管理と拡張計画。完了は `[x]`、完了多数になったら `archive` で整理（[../DOC-RULES.md](../DOC-RULES.md)）。

## TL;DR

リクルートX採用LPの立ち上げフェーズ。まずサービス定義（SPEC）とデザイン（DESIGN）の `TBD` を埋め、LP実装へ。

## 進行中フェーズ: 立ち上げ

### 決める（仕様・デザイン）
- [ ] サービスの一言説明・ターゲット・提供価値を確定 → [../specs/SPEC.md](../specs/SPEC.md)
- [ ] デザイントークン（色・フォント・角丸・コンテナ幅）を確定 → [../specs/DESIGN.md](../specs/DESIGN.md)
- [ ] ページ構成・URL・ナビを確定

### 作る（実装）
- [ ] index.html / CSS / JS をスケルトン作成（HTML/CSS/JS分離・絶対パス）
- [ ] 共通コンポーネント（ヘッダー/フッター/CTA）
- [ ] OG画像・favicon

### 公開準備
- [ ] GA4・Clarity 新規発行 → [../operations/INFRA.md](../operations/INFRA.md)
- [ ] HubSpotフォーム
- [ ] 5幅デバイス確認（[../specs/DEVICE-RULES.md](../specs/DEVICE-RULES.md) §16）
- [ ] 既存ページから内部リンク5〜10本 → [../content/SEO.md](../content/SEO.md)
- [ ] GitHub Pages + CNAME 設定・GSC登録

## 拡張アイデア（やるかは未定）

- ページ5枚超になったら docs/ をページ別に分割（[../DOC-RULES.md](../DOC-RULES.md) 分割トリガー）
- 多言語化（日英）— 既存i18nパターン踏襲
