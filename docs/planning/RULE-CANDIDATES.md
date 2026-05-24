# RULE-CANDIDATES — ルール化候補（自動収集）

> 繰り返しの指摘を検知した逆フック（[.claude/hooks/rule-candidate.sh](../../.claude/hooks/rule-candidate.sh)）が、CLAUDE.md / DOC-RULES に昇格させるべき候補を追記する場所。**ここは下書き**。人の確認を経て本体（[CLAUDE.md](../../CLAUDE.md) / [DOC-RULES.md](../DOC-RULES.md)）へ昇格する。

## 昇格フロー

1. 逆フックが候補を1行追記（`- YYYY-MM-DD: ルール案 （根拠）`）
2. 人/Claudeがレビューし、妥当なら本体mdへ移す
3. 採用したらここから削除（採用済みは残さない）

## 候補

<!-- 逆フックが追記。最新を上に。 -->
