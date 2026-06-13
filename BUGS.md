# BUGS — バグの記憶 / 再発防止ログ

> バグを直したら**1行**追記する。目的は「同じ轍を踏まない」こと。原因と対策を短く。
> 形式: `YYYY-MM-DD | 症状 | 原因 | 対策（再発防止）`

## 既知の轍（Contents X 系で過去に踏んだもの・先回り防止）

- ロゴが潰れる/歪む → `<img>` の width/height が実ファイル寸法と違う比 → 実寸法と一致させる（[DEVICE-RULES.md](docs/specs/DEVICE-RULES.md) §1）
- スマホで横スクロールが出る → 固定幅要素が画面幅を超過 → `overflow-x:hidden` で隠さず根本の固定幅を修正（§8）
- 言語切替が壊れる → スクリプト読込順序ミス → `i18n → nav` の順を厳守（[SPEC.md](docs/specs/SPEC.md) §6）

## バグ履歴

<!-- ここに1行ずつ追記。最新を上に。 -->
- 2026-06-13: 事例詳細ページのCTA矢印が巨大化 | CTAの `.rx-ccta*` は case.css 定義だが詳細ページは case.css を読まず、`.rx-ccta__btn svg` のサイズ未指定で style.css の `svg{max-width:100%}` が効いて矢印が膨張 | 必要な `.rx-ccta*`（svgは16px）を case-detail.css に複製。再発防止: 詳細ページで使うコンポーネントのCSSは読み込むCSSに含まれているか確認
- 2026-06-13: 一覧 case.html で事例カードの画像が全滅（altのみ表示） | ページCSPが `img-src 'self' data:` で、WP(cms.contentsx.jp)ホストの画像をブロック（curlはCSP非評価で200に見える） | case.html の img-src に `https://cms.contentsx.jp` を追加（詳細テンプレは既に `https:` 許可済）。再発防止: 外部ホスト画像を使うページはCSP img-src に当該ホストを追加
- 2026-06-13: 事例カード/詳細ページのリンク・CSSが本番で壊れる（カード→詳細に飛べない・詳細が無スタイル） | build-cases.pyとcase-detailテンプレがルート絶対パス `/case/...`・`/css/...` を使用、本番は github.io/recruitx/ サブパス配信で `/recruitx/` が抜け404 | 全て各ページからの相対パス（カード `case/{slug}/`、詳細 `../../css/...`）に変更。再発防止: ルート絶対パス禁止（CLAUDE.md エンジニアリング規約）
- 2026-06-13: build-cases.py が直前に公開した事例を取りこぼす（事例カードがリンクされず詳細ページに飛べない） | 公開API /contentsx/v1/cases がNginx/CDNキャッシュ(max-age=300/s-maxage=600)で固定URLをHITし古い一覧を返す | fetchURLに毎回ユニークな `_cb={time}` を付与してキャッシュ回避。再発防止: 公開直後のビルドはキャッシュバスター必須
- 2026-06-12: 料金ページSPで「アイコン+テキスト+<b>強調」のflex行が縦割れ表示 | flexコンテナ直下の生テキストと<b>が別々のflexアイテムになり折返し時に分解 | テキスト全体を<span>で包んで1アイテム化。再発防止: display:flex直下に生テキストノードを置かない
- 2026-06-10: ヒーローのスクロールハンドラが3つ重複（旧is-hero-scrolled切替+scrub+カスケードが毎フレーム競合・レイアウト読み3回/スタイル上書き合戦）→ 1リスナー1RAFに統合、寸法はresize時のみ再計測。再発防止: 同一要素を動かすscrollハンドラは増設せず既存ループに乗せる
