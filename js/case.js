/* =========================================================================
   case.js — リクルートX 導入事例ページ（case.html 専用）
   - 業種フィルタ（aria-pressed 切替 + hidden 属性で表示制御）
   - サマリー数字のカウントアップ（[data-countup] / IntersectionObserver 起動）
   - ナビ・入場アニメは main.js が担当（このファイルはページ固有機能のみ）
   - prefers-reduced-motion: reduce のときはカウントアップをスキップ
   ========================================================================= */

/* ---- 業種フィルタ ---- */
(function () {
  'use strict';

  var group = document.querySelector('[data-case-filter]');
  if (!group) return;
  var buttons = group.querySelectorAll('button[data-filter]');
  var cards = document.querySelectorAll('.rx-case[data-category]');

  group.addEventListener('click', function (e) {
    var btn = e.target.closest('button[data-filter]');
    if (!btn) return;
    var filter = btn.getAttribute('data-filter');

    for (var i = 0; i < buttons.length; i++) {
      buttons[i].setAttribute('aria-pressed', buttons[i] === btn ? 'true' : 'false');
    }
    for (var j = 0; j < cards.length; j++) {
      cards[j].hidden = (filter !== 'all' && cards[j].getAttribute('data-category') !== filter);
    }
  });
})();

/* ---- カウントアップ（HTMLには最終値を書いておき、JSは演出だけ＝非JS環境でも数値は見える） ---- */
(function () {
  'use strict';

  var els = document.querySelectorAll('[data-countup]');
  if (!els.length) return;

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion || !('IntersectionObserver' in window)) return; // 最終値表示のまま

  var DURATION = 1100;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function format(n) {
    return Math.round(n).toLocaleString('ja-JP');
  }

  function animate(el) {
    var target = parseInt(el.getAttribute('data-countup'), 10);
    if (!isFinite(target)) return;
    var start = null;

    function tick(ts) {
      if (start === null) start = ts;
      var p = (ts - start) / DURATION;
      if (p > 1) p = 1;
      el.textContent = format(target * easeOutCubic(p));
      if (p < 1) window.requestAnimationFrame(tick);
    }
    window.requestAnimationFrame(tick);
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        io.unobserve(entry.target);
        animate(entry.target);
      }
    });
  }, { threshold: 0.4 });

  function init() {
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
