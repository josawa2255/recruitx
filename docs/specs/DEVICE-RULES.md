# DEVICE-RULES — 全デバイスで美しく表示する絶対ルール

> 「機種で表示が変わらないように統一する」ための普遍ルール（Contents X 系共通・**ブランドが変わっても継承・原則改変しない**）。新規ページ・既存修正・コンポーネント設計のすべてで遵守。

## TL;DR

「PCではキレイなのにスマホで崩れる」を恒久的に防ぐ16ルール。**コミット前に 320/768/1024/1440/1920px の5幅で目視**し、§16のチェックリストを通す。

## 1. 画像HTML属性は実ファイル寸法と一致必須
`<img width height>` は実寸法と同じアスペクト比で書く（誤った比は画像が歪む＝ロゴ潰れの主因）。不安なら CSS `aspect-ratio: 実W / 実H` を併用。実寸確認: `python3 -c "from PIL import Image; print(Image.open('path').size)"`。

## 2. 最低5デバイス幅で確認
コミット前に **320 / 768 / 1024 / 1440 / 1920px** で表示崩れ・動的UI開閉を目視。

## 3. ブレークポイント統一
```css
@media (max-width: 768px) { /* モバイル */ }
@media (max-width: 1024px) and (min-width: 769px) { /* タブレット */ }
```

## 4. Flexbox 安全ルール
親に `min-width:0`、潰したくない要素（ロゴ/アイコン/CTA）に `flex-shrink:0`、可変要素に `flex:1`。

## 5. 流動サイジング
見出し・ヒーロー・重要CTAは固定px禁止、`clamp(min, fluid, max)`。本文・キャプションは固定14-16px可。

## 6. ホバーUIはタッチ代替必須
PCの `:hover` 情報（ツールチップ/ドロップダウン）はSPでタップ or 常時可視 or 別UIで提供。

## 7. ハンバーガー最低要件
`order` 指定 + `flex-shrink:0` + `min 48×48px` + 最上位z-index。320pxで押せる位置。`touchend` を `click` と併用（iOS Safari対策）。

## 8. 横スクロール禁止
`overflow-x:hidden` は応急処置。根本原因（超過する固定幅要素）を修正。確認: `document.body.scrollWidth > window.innerWidth` が `true` ならNG。

## 9. ワイド画面（1440px超）の余白対策
コンテナは段階的に max-width 拡大、padding は `clamp()`/vw で画面比に追従。長文本文だけ可読性のため max-width 720-820px 維持。
```css
.rx-container { width: min(100%, 1200px); margin: 0 auto; padding: 0 clamp(16px, 3vw, 32px); }
@media (min-width: 1440px) { .rx-container { max-width: 1340px; } }
@media (min-width: 1920px) { .rx-container { max-width: 1560px; } }
section { padding: clamp(48px, 8vw, 160px) 0; }
```

## 10. 意図的な重なりは距離感を保つ
重ねたUIは「グループ親 + 全子要素 % or cqw 配置」、グループ親に `aspect-ratio` をlock。SPは別フレームとして再設計。「重なりは座標(%)、レイアウトは比率(grid/flex)、文字は流動(clamp)」の3層で考える。

## 11. Z-index 階層表（生数字を増やさない）
```css
:root {
  --z-base:0; --z-elevated:10; --z-sticky:100; --z-header:1000;
  --z-fab:1500; --z-dropdown:2000; --z-modal:9000; --z-toast:9500;
  --z-hamburger:10000; --z-tooltip:10500;
}
```
モーダル中にFABが透ける等は `body:has(.modal.open) .fab{display:none}` で抑止（z-indexで戦わない）。

## 12. タッチターゲット最低 44×44px
タップUIは `min-width/height:44px`。視覚的に小さくても padding か擬似要素でタップ領域確保。隣接要素間に最低8pxギャップ。

## 13. スティッキーヘッダーのアンカーオフセット
```css
html { scroll-behavior: smooth; }
h1,h2,h3,h4,[id]:not(html,body){ scroll-margin-top: calc(72px + 16px); }
@media (max-width:768px){ h1,h2,h3,h4,[id]:not(html,body){ scroll-margin-top: calc(60px + 16px);} }
```

## 14. i18n: EN は日本語より約30%長い（多言語化する場合）
ナビ/ボタンの最小幅はENを基準に。`html[lang="en"]` 専用にgap/font-sizeを詰める。翻訳は `data-ja`/`data-en` で明示。

## 15. 画像読込アトリビュート使い分け
| 場所 | loading | fetchpriority |
|---|---|---|
| ヒーロー/LCP | eager | high（`<link rel="preload" as="image">` 併用） |
| ATF内 | eager | auto |
| ATF外/モーダル内 | lazy | — |

全 `<img>` に `src/alt/width/height/loading/decoding` を明示。WebPデフォルト（80KB超は AVIF をフォールバック付き）、kebab-case 命名 + `images/{用途}/`。

## 16. コミット前チェックリスト
- [ ] 画像 width/height が実比と一致 + loading/decoding 指定
- [ ] 320/768/1024/1440/1920px で崩れなし
- [ ] ハンバーガー押せる・ドロップダウン開ける・CTAタップできる
- [ ] タップ要素 44×44px・隣接8pxギャップ
- [ ] 横スクロール出ない
- [ ] 見出しは vw含む clamp（固定px地獄なし）
- [ ] ホバー専用UIにタッチ代替
- [ ] 1920px で左右が真っ白に間延びしない
- [ ] 重なりUIの距離感が全幅で崩れない
- [ ] z-index は §11 の変数を使用
- [ ] アンカー先に scroll-margin-top
- [ ] （多言語なら）ENで破綻しない
- [ ] LCP画像のみ eager+high、他は lazy
