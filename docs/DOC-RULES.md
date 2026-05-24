# DOC-RULES — md運用の頭脳

> このリポのドキュメント運用ルールを1枚に集約。「どの変更でどのmdを更新するか」「いつスキルを使うか」「自動で修整してよい範囲」を定義する。**運用判断に迷ったら必ずここを見る。**

## TL;DR

1. 変更したら**同一コミット内**で対応mdを更新（下の更新ルーティング表）
2. md（リポ内）は**自動更新OK**、スキル本体（`~/.claude/skills`）は**提案のみ**（勝手に書き換えない）
3. 1ファイル**200行以下**を目安（出典と最新値は [BEST-PRACTICE-WATCH.md](operations/BEST-PRACTICE-WATCH.md)）
4. 構成は単一LPのうちフラット寄り。**分割トリガー**を満たしたら枝分かれ

## 更新ルーティング（変更 → 更新するmd）

| 変更の種類 | 更新先 |
|---|---|
| 機能追加・動作変更・URLパラメータ・共通コンポーネント | [specs/SPEC.md](specs/SPEC.md) |
| 色・フォント・角丸・余白などデザイントークン | [specs/DESIGN.md](specs/DESIGN.md) |
| デバイス表示・レスポンシブ・アクセシビリティ規則 | [specs/DEVICE-RULES.md](specs/DEVICE-RULES.md) |
| メタタグ・構造化データ・内部リンク・KW戦略 | [content/SEO.md](content/SEO.md) |
| 外部サービスID・WP・クラウド・DNS・触禁領域 | [operations/INFRA.md](operations/INFRA.md) |
| タスク進捗・拡張計画 | [planning/ROADMAP.md](planning/ROADMAP.md) |
| 新しい学び・トラブル解決・引き継ぎ知識 | [planning/KNOWLEDGE.md](planning/KNOWLEDGE.md) |
| 直したバグ | [/BUGS.md](../BUGS.md) |
| 規約・ブランドボイス・ルーティング自体 | [/CLAUDE.md](../CLAUDE.md) |

「今回は小さいから」「後でまとめて」は禁止。

## スキル使用の判断

| 状況 | 使うスキル |
|---|---|
| md群の整理・監査・同期・stale点検 | `md-maintainer` |
| SEO監査・コンテンツ品質・スキーマ・サイトマップ | `seo-*`（seo-audit / seo-technical / seo-schema 等） |
| 公開前のローカル表示確認 | `webapp-testing` / `run` |
| 公式の最新推奨の追従（週次） | [BEST-PRACTICE-WATCH.md](operations/BEST-PRACTICE-WATCH.md) の定期ジョブ |

迷ったら「専用スキルがあるなら使う、なければ手作業」。

## 自動修整の範囲（⭐確定ポリシー）

| 対象 | 自動修整 | 理由 |
|---|---|---|
| リポ内の md（記録・ルール類） | **自動OK** | 出典付きで追記・修正、差分は通知 |
| `~/.claude/skills` のスキル本体 | **提案のみ**（承認制） | 全プロジェクト影響のため勝手に書き換えない |
| コード（HTML/CSS/JS） | 提案のみ | 仕様変更は人が判断 |

自動更新時は「何を・なぜ・出典」を変更サマリで残す。

## ファイルサイズ・構造ガイド

- 1ファイル**200行以下**目安（超えたら分割を検討。最新の推奨値は BEST-PRACTICE-WATCH が追従）
- 各mdの先頭に**TL;DR（3行以内）**、重要情報を上に
- H1は1つ、見出しは3階層以内、リンクは `[text](path)` 形式

## 分割トリガー（フラット → 枝分かれ）

以下のいずれかを満たしたら該当ディレクトリ内で分割する:

- **ページが5枚超** → `specs/` にページ別 SPEC を追加
- **知識が肥大**（KNOWLEDGE が200行超 or 話題が3系統以上）→ `planning/knowledge/` に枝分かれ
- **コピー差し替えが頻発** → `content/COPY.md` を新設
- **多言語化** → i18n辞書管理を `content/` に独立
- **公開運用が定常化** → `operations/CHECKLIST.md` `operations/ANALYTICS.md` を新設

将来像（拡張時の到達点）は兄弟リポ ContentX_HP の `docs/` 構成に準拠。
