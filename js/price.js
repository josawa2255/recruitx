/* =========================================================================
   price.js — 料金プランページ
   - 3問プラン診断: ある/ない の選択トグル
   - 3問すべて回答したら、提案バンドの「A / B」を回答に応じて強調
     （すべて「ある」→ B：広告強化型 / それ以外 → A：フルスタート型）
   - 入場アニメ（.rx-anim）は main.js が共通処理
   ========================================================================= */
(function () {
  'use strict';

  var rows = document.querySelectorAll('[data-diag-row]');
  var resultPlan = document.querySelector('.rx-pdiag__result-plan');
  if (!rows.length || !resultPlan) return;

  var defaultText = resultPlan.textContent;

  function answers() {
    var list = [];
    rows.forEach(function (row) {
      var on = row.querySelector('.rx-pdiag__btn.is-on');
      list.push(on ? on.getAttribute('data-answer') : null);
    });
    return list;
  }

  function refresh() {
    var list = answers();
    var done = list.every(function (a) { return a !== null; });
    if (!done) {
      resultPlan.textContent = defaultText;
      return;
    }
    var allYes = list.every(function (a) { return a === 'yes'; });
    resultPlan.textContent = allYes ? 'B：広告強化型' : 'A：フルスタート型';
  }

  rows.forEach(function (row) {
    var btns = row.querySelectorAll('.rx-pdiag__btn');
    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        btns.forEach(function (b) {
          b.classList.toggle('is-on', b === btn);
          b.setAttribute('aria-pressed', b === btn ? 'true' : 'false');
        });
        refresh();
      });
    });
  });
})();
