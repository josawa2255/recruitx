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

/* ヘッダーナビ: スクロールで背景を白くする + SPハンバーガー開閉 */
(function () {
  var nav = document.getElementById('nav');
  if (!nav) return;
  var menu = nav.querySelector('.rx-nav__menu');
  var ham  = nav.querySelector('.rx-nav__hamburger');

  function onScroll() {
    if (window.scrollY > 16) nav.classList.add('is-scrolled');
    else nav.classList.remove('is-scrolled');
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  if (ham && menu) {
    var toggle = function () {
      var open = menu.classList.toggle('is-open');
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    ham.addEventListener('click', toggle);
    // メニュー内リンクを押したら閉じる
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.rx-nav__link') && menu.classList.contains('is-open')) toggle();
    });
  }
})();

/* お問い合わせ → HubSpot Forms API v3 直送（XSS安全: createElement + textContent） */
(function () {
  var HUBSPOT_PORTAL_ID = '48367061';
  var HUBSPOT_FORM_GUID = 'b6da14d0-d60d-4357-89fc-0015ed32b704';
  var SERVICE_NAME      = 'リクルートX';

  var form = document.getElementById('rx-contact-form');
  if (!form) return;
  var PARAMS = new URLSearchParams(window.location.search);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submitBtn = form.querySelector('.rx-form__submit');
    submitBtn.disabled = true;
    submitBtn.classList.add('is-sending');

    var fd = new FormData(form);
    var fullName = String(fd.get('fullName') || '');

    var tracking = ['[' + SERVICE_NAME + '経由のお問い合わせ]'];
    var utmSource   = PARAMS.get('utm_source');
    var utmMedium   = PARAMS.get('utm_medium');
    var utmCampaign = PARAMS.get('utm_campaign');
    var source      = PARAMS.get('source');
    if (utmSource)   tracking.push('流入元: ' + utmSource);
    if (utmMedium)   tracking.push('媒体: ' + utmMedium);
    if (utmCampaign) tracking.push('キャンペーン: ' + utmCampaign);
    if (source)      tracking.push('参照ページ: ' + source);
    tracking.push('ページ: ' + window.location.href);
    var trackingNote = '\n\n---\n' + tracking.join('\n');

    var payload = {
      fields: [
        { name: 'company',   value: String(fd.get('company')    || '') },
        { name: 'busyo',     value: String(fd.get('department') || '') },
        { name: 'lastname',  value: fullName },
        { name: 'firstname', value: fullName },
        { name: 'email',     value: String(fd.get('email')      || '') },
        { name: 'message',   value: String(fd.get('message')    || '') + trackingNote }
      ],
      context: {
        pageUri:  window.location.href,
        pageName: SERVICE_NAME + ' - お問い合わせ'
      }
    };

    var url = 'https://api.hsforms.com/submissions/v3/integration/submit/'
      + HUBSPOT_PORTAL_ID + '/' + HUBSPOT_FORM_GUID;

    fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(function (res) {
        if (res.ok) return res.json();
        return res.text().then(function (t) { throw new Error(t); });
      })
      .then(function () {
        var thanks = document.createElement('div');
        thanks.className = 'rx-form__thanks';
        var h = document.createElement('p');
        h.className = 'rx-form__thanks-h';
        h.textContent = 'お問い合わせありがとうございます。';
        var s = document.createElement('p');
        s.className = 'rx-form__thanks-s';
        s.textContent = '3営業日以内にご連絡いたします。';
        thanks.appendChild(h);
        thanks.appendChild(s);
        form.parentNode.insertBefore(thanks, form.nextSibling);
        form.style.display = 'none';
      })
      .catch(function (err) {
        console.error('HubSpot submission error:', err);
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-sending');
        alert('送信に失敗しました。お手数ですが、もう一度お試しください。');
      });
  });
})();

/* ヒーロー文字スワップ: スクロール量に応じて body に is-hero-scrolled を付与
   - 60pxスクロールで h1 が階段リードに切り替わり、戻ると再び h1 に戻る */
(function () {
  var THRESHOLD = 60;
  function onHeroScroll() {
    if (window.scrollY > THRESHOLD) {
      document.body.classList.add('is-hero-scrolled');
    } else {
      document.body.classList.remove('is-hero-scrolled');
    }
  }
  window.addEventListener('scroll', onHeroScroll, { passive: true });
  onHeroScroll();
})();

/* ヒーロー scrub: スクロール進行度に応じて h1 と階段リードを直接DOMでクロスフェード
   RAF + ticking ガード（per-frameでscrollに同期）— 参考: Apple/Stripeの pinned hero パターン */
(function () {
  var hero = document.getElementById('hero');
  if (!hero) return;
  var titleEl = hero.querySelector('.rx-hero__title');
  var swapEl  = hero.querySelector('.rx-hero__title-swap');
  if (!titleEl || !swapEl) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;                       // 静的表示・スクラブ無し

  var ticking = false;

  function update() {
    var rect = hero.getBoundingClientRect();
    var scrollable = hero.offsetHeight - window.innerHeight;
    var p = scrollable > 0 ? -rect.top / scrollable : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;

    // h1: 1 → 0（0〜0.5 でフェード）
    var titleOp = 1 - p * 2;
    if (titleOp < 0) titleOp = 0;
    // swap: 0 → 1（0.2〜0.7 でフェード）
    var swapOp = (p - 0.2) / 0.5;
    if (swapOp < 0) swapOp = 0; else if (swapOp > 1) swapOp = 1;

    titleEl.style.opacity = titleOp.toFixed(3);
    titleEl.style.transform = 'translateY(' + (-16 * p).toFixed(2) + 'px)';
    swapEl.style.opacity = swapOp.toFixed(3);
    swapEl.style.transform = 'translateY(' + (16 * (1 - swapOp)).toFixed(2) + 'px)';

    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();

/* swap 階段カスケード: 各行が左上から順に流れ落ちる
   既存のscrub更新を上書きする形で各frame走る（後勝ち） */
(function () {
  var hero = document.getElementById('hero');
  if (!hero) return;
  var swapEl = hero.querySelector('.rx-hero__title-swap');
  if (!swapEl) return;
  var lines = swapEl.querySelectorAll('.rx-hero__title-swap-line');
  if (!lines.length) return;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;

  var ticking = false;

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function update() {
    var rect = hero.getBoundingClientRect();
    var scrollable = hero.offsetHeight - window.innerHeight;
    var p = scrollable > 0 ? -rect.top / scrollable : 0;
    if (p < 0) p = 0; else if (p > 1) p = 1;

    // 親swapは常に表示（行ごとに制御するため、既存IIFEの設定を上書き）
    swapEl.style.opacity = '1';
    swapEl.style.transform = 'none';

    // 各行のカスケード: line i は startBase + i*stagger でフェードイン
    var startBase = 0.18;
    var stagger = 0.08;
    var revealLen = 0.18;

    for (var i = 0, n = lines.length; i < n; i++) {
      var s = startBase + i * stagger;
      var t = (p - s) / revealLen;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      var e = easeOutCubic(t);
      var shiftX = (1 - e) * -10;
      var shiftY = (1 - e) * -16;
      lines[i].style.opacity = e.toFixed(3);
      lines[i].style.transform = 'translate(' + shiftX.toFixed(1) + 'px, ' + shiftY.toFixed(1) + 'px)';
    }
    ticking = false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  update();
})();
