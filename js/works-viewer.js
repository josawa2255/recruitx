/* =========================================================================
   works-viewer.js — ホーム「導入事例・制作実績」の漫画をその場で読む画面（index.html 専用）
   - 表紙のボタン（.rx-works__open[data-manga]）を押すと、全画面の読み画面（<dialog id="worksViewer">）を開き、
     全ページを縦に並べてスクロールで読ませる
   - 閉じる: × / 最後の「閉じる」/ Esc（dialog 標準）/ 左右の暗い所を押す / スマホの「戻る」
     （開くときに履歴を1つ積み、「戻る」でホームから離れず読み画面だけを閉じる）
   - ページ画像は WP（cms.contentsx.jp）の制作事例 works と同じ素材を直接読む。実行時に API を読まないのは、
     WP の CORS が ichioshi.contentsx.jp しか許可しておらず github.io と file:// では読めないため
     （<img> の読み込みは CORS の影響を受けない。CSP の img-src は cms.contentsx.jp を許可済み）
   - DOM生成のみ（innerHTML不使用）
   ========================================================================= */
(function () {
  'use strict';

  /* ---- 作品データ ----
     キーは表紙ボタンの data-manga。pages は1ページ目から順に。width/height はページ画像の実寸（作品内は全ページ同じ）。
     出典: GET https://cms.contentsx.jp/wp-json/contentsx/v1/works の gallery（2026-10-06 取得）。
     WP 側でページを差し替えたら、ここも更新する。
     作品を足すとき: index.html の表紙を <button class="rx-works__open" data-manga="キー" …> にして、ここに1件足す */
  var MANGA = {
    'hana': {
      title: 'HANA Intelligence 〜友だちの笑顔が、私を変えた〜',
      width: 1688, height: 2110,
      pages: [
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/01.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/02.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/03.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/04.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/05.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/06.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/07.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/08.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/09.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/10.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/11.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/12.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/13.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/14.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/15.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/05/16.webp'
      ]
    },
    'gaudia-3': {
      title: 'もうすぐ入学のタクマくん（ガウディア様）',
      width: 1688, height: 2110,
      pages: [
        'https://cms.contentsx.jp/wp-content/uploads/2026/08/gaudia-3-01.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/08/gaudia-3-02.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/08/gaudia-3-03.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/08/gaudia-3-04.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/08/gaudia-3-05.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/08/gaudia-3-06.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/08/gaudia-3-07.webp'
      ]
    },
    'birdman': {
      title: '不屈の翼（株式会社Birdman様）',
      width: 1080, height: 1350,
      pages: [
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/1-1.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/2.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/3.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/4-1.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/5-1.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/6.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/7.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/8-1.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/9-1.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/10-9.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/11-7.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/12-4.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/13-3.webp',
        'https://cms.contentsx.jp/wp-content/uploads/2026/04/14-2.webp'
      ]
    }
  };

  var dialog  = document.getElementById('worksViewer');
  var openers = document.querySelectorAll('.rx-works__open[data-manga]');
  if (!dialog || !openers.length || typeof dialog.showModal !== 'function') return;

  var titleEl  = dialog.querySelector('.rx-mv__title');
  var countEl  = dialog.querySelector('.rx-mv__count');
  var scroller = dialog.querySelector('.rx-mv__scroll');
  var list     = dialog.querySelector('.rx-mv__pages');
  var opener   = null;   // 閉じたらフォーカスを戻す表紙ボタン
  var pushed   = false;  // 開くときに履歴を積んだか
  var skipPop  = false;  // 自分で history.back() したときの popstate は無視する

  function open(id, btn) {
    var m = MANGA[id];
    opener = btn;
    titleEl.textContent = m.title;
    countEl.textContent = '全' + m.pages.length + 'ページ';
    list.textContent = '';
    m.pages.forEach(function (src, i) {
      var li = document.createElement('li');
      li.className = 'rx-mv__page';
      var img = document.createElement('img');
      // loading は src より先に指定する（後だと先読みが走るブラウザがある）
      img.loading = i < 2 ? 'eager' : 'lazy';
      img.decoding = 'async';
      img.width = m.width;
      img.height = m.height;
      img.alt = m.title + '（' + (i + 1) + 'ページ目）';
      img.src = src;
      li.appendChild(img);
      list.appendChild(li);
    });

    document.documentElement.classList.add('is-mv-open');   // 後ろのページをスクロールさせない
    dialog.showModal();
    scroller.scrollTop = 0;
    scroller.focus({ preventScroll: true });                 // 矢印キー・スペースでそのまま読み進められるように
    try {
      history.pushState({ rxWorksViewer: id }, '');
      pushed = true;
    } catch (e) {
      pushed = false;
    }
  }

  dialog.addEventListener('close', function () {
    document.documentElement.classList.remove('is-mv-open');
    list.textContent = '';                                   // 読み込み途中の画像を止める
    if (opener) opener.focus({ preventScroll: true });
    opener = null;
    // ×・Esc などで閉じたときは、開くときに積んだ履歴を戻しておく
    if (pushed) {
      pushed = false;
      skipPop = true;
      history.back();
    }
  });

  // スマホの「戻る」: ホームから離れず、読み画面だけを閉じる
  window.addEventListener('popstate', function () {
    if (skipPop) { skipPop = false; return; }
    if (!dialog.open) return;
    pushed = false;   // 履歴はもう戻っている
    dialog.close();
  });

  function close() { dialog.close(); }
  dialog.querySelector('.rx-mv__close').addEventListener('click', close);
  dialog.querySelector('.rx-mv__end-close').addEventListener('click', close);
  // ページの左右の暗い所（スクロール領域そのもの）を押したら閉じる。ページの上を押しても閉じない
  scroller.addEventListener('click', function (e) {
    if (e.target === scroller) close();
  });

  Array.prototype.forEach.call(openers, function (btn) {
    var id = btn.getAttribute('data-manga');
    if (!MANGA[id]) return;            // データがない表紙は押せる見た目にしない
    btn.classList.add('is-ready');     // 「読む」ラベルとホバーは .is-ready のときだけ出す
    btn.addEventListener('click', function () { open(id, btn); });
  });
})();
