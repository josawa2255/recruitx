/* =========================================================================
   main.js — リクルートX トップLP（ファーストビュー / 最小限）
   - CTA アンカーのスムーススクロール（scroll-margin-top は CSS §13 で担保）
   - IntersectionObserver による軽い入場アニメ（.rx-anim → .is-in）
   - prefers-reduced-motion: reduce のときはアニメをスキップ
   ※ i18n は SPEC §6 が TBD のため未実装（将来 i18n→nav のロード順で追加）
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- CTA / ページ内アンカーのスムーススクロール ---- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href');
    if (id === '#' || id.length < 2) return;
    var target = document.querySelector(id);
    if (!target) return;
    e.preventDefault();
    target.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start'
    });
  });

  /* ---- 入場アニメ ---- */
  function revealAll() {
    var els = document.querySelectorAll('.rx-anim');
    for (var i = 0; i < els.length; i++) els[i].classList.add('is-in');
  }

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealAll();
    return;
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

  /* ---- スマホのポインタ視差チルト（hover可能なファインポインタ端末のみ） ---- */
  function setupTilt() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var mock = document.querySelector('.rx-mock');
    var phone = mock && mock.querySelector('.rx-mock__phone');
    if (!phone) return;

    mock.addEventListener('pointermove', function (e) {
      var r = mock.getBoundingClientRect();
      var px = (e.clientX - r.left) / r.width - 0.5;   /* -0.5〜0.5 */
      var py = (e.clientY - r.top) / r.height - 0.5;
      phone.style.setProperty('--ry', (-7 - px * 10).toFixed(2) + 'deg');
      phone.style.setProperty('--rx', (2 + py * 6).toFixed(2) + 'deg');
    });
    mock.addEventListener('pointerleave', function () {
      phone.style.removeProperty('--ry');             /* 既定の傾きに戻す */
      phone.style.removeProperty('--rx');
    });
  }

  function init() {
    var els = document.querySelectorAll('.rx-anim');
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
    setupTilt();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
