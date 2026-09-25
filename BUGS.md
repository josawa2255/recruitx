# BUGS — バグの記憶 / 再発防止ログ

> バグを直したら**1行**追記する。目的は「同じ轍を踏まない」こと。原因と対策を短く。
> 形式: `YYYY-MM-DD | 症状 | 原因 | 対策（再発防止）`

## 既知の轍（Contents X 系で過去に踏んだもの・先回り防止）

- ロゴが潰れる/歪む → `<img>` の width/height が実ファイル寸法と違う比 → 実寸法と一致させる（[DEVICE-RULES.md](docs/specs/DEVICE-RULES.md) §1）
- スマホで横スクロールが出る → 固定幅要素が画面幅を超過 → `overflow-x:hidden` で隠さず根本の固定幅を修正（§8）
- 言語切替が壊れる → スクリプト読込順序ミス → `i18n → nav` の順を厳守（[SPEC.md](docs/specs/SPEC.md) §6）

## バグ履歴

<!-- ここに1行ずつ追記。最新を上に。 -->
- 2026-09-25: 料金ページで和文が「任意オ／プション」のように語中で割れ、行頭に「。」だけが落ちる | `tokens.css` の `.rx-jp-body` が `word-break: keep-all`＋`overflow-wrap: anywhere`。keep-all で文節を保つ代わりに、1行に収まらない長い文は `anywhere` が禁則を無視して任意の位置で割る | 本文系（リード・注記・説明文）は `word-break: normal / overflow-wrap: normal / line-break: strict` に戻して禁則を効かせ、ヒーローのリードは句読点で区切れる文に書き換えた。再発防止: **`.rx-jp-body` 配下で20字を超える句読点なしの文を書かない**。長い文を置くなら上記3点セットで既定を上書きする
- 2026-09-25: ナビ「料金プラン」を押すと**旧料金に着地**していた（price.html がフルスタート型40万/30万・広告強化型30万/25万・9ヶ月総額290〜310万円のままで、ホーム・営業資料の3プラン〈19.8/34.8/58.9万円〉と食い違い）。さらにヒーロー写真に旧プラン「スタンダードプラン ¥98,000/月〜」が**焼き込まれ**、1ページ内に3種類の価格が併存していた | ホームを資料準拠にリデザインした際、price.html を同時に更新していなかった（`docs/private/home-redesign.md` 確認リスト B-6 に未処理で残存）。画像に焼き込まれた価格は grep で検出できず、SPEC の「公開前に実数値の確認が必要」という注意書きも残ったままだった | price.html を営業資料 p27/p28/p29（＋p24/p25/p31）準拠の3プランへ差し替え。焼き込みカードは画像を 1672×941 → 1218×941 にトリミングして除去。再発防止: **金額は画像に焼き込まない**（テキスト＋CSSで載せて差分に出す）。料金を変えたら price.html・index.html・各ページの description を同一コミットで揃える
- 2026-09-23: 320px幅で全ページのヘッダーのハンバーガーが画面右端で欠ける | ロゴ＋CTA＋ハンバーガーの合計幅が320pxを超過（gap・CTA padding・ハンバーガーの margin-left） | style.css に ≤360px の詰め設定を追加。ホームはCTA文言が長いため ≤480px で「無料診断」に短縮。再発防止: ヘッダーCTAの文言を変えたら320pxでハンバーガーが押せるか確認（DEVICE-RULES §7）
- 2026-08-04: **お問い合わせページが本番で真っ白＝問い合わせ受付が機能していなかった** | `contact.html` が0バイト。git履歴を遡っても全コミットで0バイト（2026-06-09以降）＝どこかで中身が失われたまま気づかず commit/push され、GitHub Pages がそれをそのまま配信していた。iCloud同期破損（採用ワークスペース側の `docs/WORKSPACE-GUIDE.md` 参照）の取りこぼしと推定。0バイトHTMLは他に無し。JS(`js/main.js`)とCSS(`.rx-form*`)は無傷で、フォームのマークアップだけが消えていた | `js/main.js` が要求するname属性・`docs/operations/HUBSPOT-CTA-HANDOFF.md` の参照HTML・CSSのクラス定義から再構築し、Playwrightで送信/バリデーション/ハニーポットを検証。再発防止: **0バイトファイルはgrepが無言で通るため気づけない**。ページを触る前に `find . -name "*.html" -size 0` で確認する
- 2026-06-14: 事例詳細ヒーローが固定ヘッダーと重なる（画像側カラム/SPの上配置画像がヘッダー下に潜る） | `.rx-cdtl-hero` がtop:0開始で画像カラムにヘッダー分の余白なし。さらにヘッダー実高さが各ページ72px等とハードコードされ、ロゴ+paddingでワイド画面では約90pxに達するため price.html等も数px重なっていた | 固定ヘッダー高さをトークン `--rx-header-h: clamp(68px,4.2vw+34px,92px)` に集約。詳細ヒーローは `padding-top: var(--rx-header-h)`、price PCは `max(var,従来値)`、アンカーは `calc(var+16px)` に統一。再発防止: 最初のセクションは必ず `--rx-header-h` を確保（[DEVICE-RULES.md](docs/specs/DEVICE-RULES.md) §13）
- 2026-06-13: 事例詳細ページのCTA矢印が巨大化 | CTAの `.rx-ccta*` は case.css 定義だが詳細ページは case.css を読まず、`.rx-ccta__btn svg` のサイズ未指定で style.css の `svg{max-width:100%}` が効いて矢印が膨張 | 必要な `.rx-ccta*`（svgは16px）を case-detail.css に複製。再発防止: 詳細ページで使うコンポーネントのCSSは読み込むCSSに含まれているか確認
- 2026-06-13: 一覧 case.html で事例カードの画像が全滅（altのみ表示） | ページCSPが `img-src 'self' data:` で、WP(cms.contentsx.jp)ホストの画像をブロック（curlはCSP非評価で200に見える） | case.html の img-src に `https://cms.contentsx.jp` を追加（詳細テンプレは既に `https:` 許可済）。再発防止: 外部ホスト画像を使うページはCSP img-src に当該ホストを追加
- 2026-06-13: 事例カード/詳細ページのリンク・CSSが本番で壊れる（カード→詳細に飛べない・詳細が無スタイル） | build-cases.pyとcase-detailテンプレがルート絶対パス `/case/...`・`/css/...` を使用、本番は github.io/recruitx/ サブパス配信で `/recruitx/` が抜け404 | 全て各ページからの相対パス（カード `case/{slug}/`、詳細 `../../css/...`）に変更。再発防止: ルート絶対パス禁止（CLAUDE.md エンジニアリング規約）
- 2026-06-13: build-cases.py が直前に公開した事例を取りこぼす（事例カードがリンクされず詳細ページに飛べない） | 公開API /contentsx/v1/cases がNginx/CDNキャッシュ(max-age=300/s-maxage=600)で固定URLをHITし古い一覧を返す | fetchURLに毎回ユニークな `_cb={time}` を付与してキャッシュ回避。再発防止: 公開直後のビルドはキャッシュバスター必須
- 2026-06-12: 料金ページSPで「アイコン+テキスト+<b>強調」のflex行が縦割れ表示 | flexコンテナ直下の生テキストと<b>が別々のflexアイテムになり折返し時に分解 | テキスト全体を<span>で包んで1アイテム化。再発防止: display:flex直下に生テキストノードを置かない
- 2026-06-10: ヒーローのスクロールハンドラが3つ重複（旧is-hero-scrolled切替+scrub+カスケードが毎フレーム競合・レイアウト読み3回/スタイル上書き合戦）→ 1リスナー1RAFに統合、寸法はresize時のみ再計測。再発防止: 同一要素を動かすscrollハンドラは増設せず既存ループに乗せる
