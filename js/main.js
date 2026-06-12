/* =========================================================================
   main.js — リクルートX トップLP
   - CTA アンカーのスムーススクロール（scroll-margin-top は CSS §13 で担保）
   - IntersectionObserver による軽い入場アニメ（.rx-anim → .is-in）
   - ヘッダーナビ（スクロール背景 / ハンバーガー / Escで閉じる）
   - ヒーロー sticky pin + scrub（h1フェード + 階段リードの行カスケードを1ループに統合）
   - お問い合わせ → HubSpot Forms API v3 直送（XSS安全: createElement + textContent）
   - prefers-reduced-motion: reduce のときはアニメをスキップ
   ========================================================================= */
(function () {
  'use strict';

  var reduceMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- CTA / ページ内アンカーのスムーススクロール ---- */
  document.addEventListener('click', function (e) {
    var link = e.target.closest('a[href^="#"]');
    if (!link) return;
    var id = link.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
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

  function init() {
    var els = document.querySelectorAll('.rx-anim');
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

/* ヘッダーナビ: スクロールで背景を白くする + SPハンバーガー開閉 */
(function () {
  'use strict';

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
    var setOpen = function (open) {
      menu.classList.toggle('is-open', open);
      ham.setAttribute('aria-expanded', open ? 'true' : 'false');
      ham.setAttribute('aria-label', open ? 'メニューを閉じる' : 'メニューを開く');
      document.body.style.overflow = open ? 'hidden' : '';
    };
    ham.addEventListener('click', function () {
      setOpen(!menu.classList.contains('is-open'));
    });
    // メニュー内リンクを押したら閉じる
    menu.addEventListener('click', function (e) {
      if (e.target.closest('.rx-nav__link') && menu.classList.contains('is-open')) setOpen(false);
    });
    // Escキーで閉じる（アクセシビリティ）
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        ham.focus();
      }
    });
  }
})();

/* ヒーロー sticky pin + scrub:
   1スクロールリスナー・1RAF・1回のレイアウト読み取りで
   h1のフェードアウトと階段リード各行のカスケードを同時に駆動する。
   寸法（offsetHeight / innerHeight）は resize 時のみ再計測し、毎フレームの再レイアウトを避ける */
(function () {
  'use strict';

  var hero = document.getElementById('hero');
  if (!hero) return;
  var titleEl = hero.querySelector('.rx-hero__title');
  var swapEl  = hero.querySelector('.rx-hero__title-swap');
  if (!titleEl || !swapEl) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // 静的表示

  var lines = swapEl.querySelectorAll('.rx-hero__title-swap-line');

  // カスケード設定: 行 i は START_BASE + i*STAGGER から REVEAL の長さでフェードイン
  var START_BASE = 0.18;
  var STAGGER    = 0.08;
  var REVEAL     = 0.18;
  // 文字アニメは進行度0〜0.6（=150svh）で完結。残り0.6〜1.0（=100svh）は
  // 背景固定のままAboutが下から覆うカーテンリビール区間（CSS側で実装）
  var TEXT_PHASE = 0.6;

  var ticking = false;
  var scrollable = 1;

  // 親swapは常時表示・行単位で出し入れする（初期化時に1度だけ設定）
  swapEl.style.opacity = '1';
  swapEl.style.transform = 'none';

  function measure() {
    scrollable = Math.max(hero.offsetHeight - window.innerHeight, 1);
  }

  function easeOutCubic(t) { return 1 - Math.pow(1 - t, 3); }

  function update() {
    ticking = false;
    var p = -hero.getBoundingClientRect().top / scrollable;
    if (p < 0) p = 0; else if (p > 1) p = 1;
    p = p / TEXT_PHASE;              // 文字アニメ用の進行度に変換（0.6で1.0に到達）
    if (p > 1) p = 1;

    // h1: 進行度 0〜0.5 でフェードアウト
    var titleOp = 1 - p * 2;
    if (titleOp < 0) titleOp = 0;
    titleEl.style.opacity = titleOp.toFixed(3);
    titleEl.style.transform = 'translateY(' + (-16 * p).toFixed(2) + 'px)';

    // 階段リード: 各行が左上から順に流れ落ちる
    for (var i = 0, n = lines.length; i < n; i++) {
      var t = (p - (START_BASE + i * STAGGER)) / REVEAL;
      if (t < 0) t = 0; else if (t > 1) t = 1;
      var e = easeOutCubic(t);
      lines[i].style.opacity = e.toFixed(3);
      lines[i].style.transform =
        'translate(' + ((1 - e) * -10).toFixed(1) + 'px, ' + ((1 - e) * -16).toFixed(1) + 'px)';
    }
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    measure();
    onScroll();
  }, { passive: true });

  measure();
  update();
})();

/* フローティングお問い合わせボタン（左下固定・スクロール追従）
   - 全ページ共通。お問い合わせページ（#rx-contact-form あり）では出さない
   - 少しスクロールしたら表示し、以後ずっと追従（.is-visible をトグル）
   - DOM生成のみ（innerHTML不使用・ユーザー入力なし） */
(function () {
  'use strict';

  if (document.getElementById('rx-contact-form')) return; // お問い合わせページ自身では出さない
  if (document.querySelector('.rx-fab')) return;          // 二重挿入ガード

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var fab = document.createElement('a');
  fab.className = 'rx-fab';
  fab.href = 'contact.html';
  fab.setAttribute('aria-label', 'お問い合わせ');

  var svg = svgEl('svg', {
    'class': 'rx-fab__icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.9', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true'
  });
  svg.appendChild(svgEl('path', { d: 'M4 5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 3V6a1 1 0 0 1 1-1Z' }));
  svg.appendChild(svgEl('path', { d: 'm5 7 7 5 7-5' }));
  fab.appendChild(svg);

  var label = document.createElement('span');
  label.className = 'rx-fab__text';
  label.textContent = 'お問い合わせ';
  fab.appendChild(label);

  document.body.appendChild(fab);

  var SHOW_AFTER = 200; // px スクロールしたら表示し、以後ずっと追従
  var shown = false, ticking = false;
  function apply() {
    ticking = false;
    var should = window.scrollY > SHOW_AFTER;
    if (should !== shown) { shown = should; fab.classList.toggle('is-visible', shown); }
  }
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(apply);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  apply();
})();

/* お問い合わせ → HubSpot Forms API v3 直送（XSS安全: createElement + textContent）
   - 入力はtrim + 文字数上限でサニタイズ
   - honeypot（bot対策）: 隠しフィールドが埋まっていたら送信せず成功表示
   - URLパラメータは長さ制限してからトラッキング情報に使用 */
(function () {
  'use strict';

  var HUBSPOT_PORTAL_ID = '48367061';
  var HUBSPOT_FORM_GUID = 'b6da14d0-d60d-4357-89fc-0015ed32b704';
  var SERVICE_NAME      = 'リクルートX';

  var form = document.getElementById('rx-contact-form');
  if (!form) return;
  var PARAMS = new URLSearchParams(window.location.search);

  // 入力上限（HubSpot側と運用に合わせた安全値）
  var LIMITS = { company: 200, department: 100, fullName: 100, email: 254, message: 4000 };

  function readField(fd, name) {
    return String(fd.get(name) || '').trim().slice(0, LIMITS[name] || 200);
  }

  function readParam(key) {
    var v = PARAMS.get(key);
    return v ? v.slice(0, 80) : null;
  }

  function showThanks() {
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
  }

  function showError(message) {
    var err = form.querySelector('.rx-form__error');
    if (!err) {
      err = document.createElement('p');
      err.className = 'rx-form__error';
      err.setAttribute('role', 'alert');
      var submitBtn = form.querySelector('.rx-form__submit');
      form.insertBefore(err, submitBtn);
    }
    err.textContent = message;
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var submitBtn = form.querySelector('.rx-form__submit');
    if (submitBtn.disabled) return; // 二重送信ガード

    var fd = new FormData(form);

    // honeypot: botは隠しフィールドを埋める → 送信せず成功と同じ見た目に
    if (String(fd.get('website') || '') !== '') {
      showThanks();
      return;
    }

    var company  = readField(fd, 'company');
    var fullName = readField(fd, 'fullName');
    var email    = readField(fd, 'email');
    var message  = readField(fd, 'message');

    // クライアント側の必須・形式チェック（サーバー側検証はHubSpotが実施）
    if (!company || !fullName || !email || !message) {
      showError('必須項目が未入力です。ご確認ください。');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('メールアドレスの形式をご確認ください。');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.classList.add('is-sending');

    var tracking = ['[' + SERVICE_NAME + '経由のお問い合わせ]'];
    var utmSource   = readParam('utm_source');
    var utmMedium   = readParam('utm_medium');
    var utmCampaign = readParam('utm_campaign');
    var source      = readParam('source');
    if (utmSource)   tracking.push('流入元: ' + utmSource);
    if (utmMedium)   tracking.push('媒体: ' + utmMedium);
    if (utmCampaign) tracking.push('キャンペーン: ' + utmCampaign);
    if (source)      tracking.push('参照ページ: ' + source);
    tracking.push('ページ: ' + window.location.href.slice(0, 300));
    var trackingNote = '\n\n---\n' + tracking.join('\n');

    var payload = {
      fields: [
        { name: 'company',   value: company },
        { name: 'busyo',     value: readField(fd, 'department') },
        { name: 'lastname',  value: fullName },
        { name: 'firstname', value: fullName },
        { name: 'email',     value: email },
        { name: 'message',   value: message + trackingNote }
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
      .then(showThanks)
      .catch(function (err) {
        console.error('HubSpot submission error:', err);
        submitBtn.disabled = false;
        submitBtn.classList.remove('is-sending');
        showError('送信に失敗しました。お手数ですが、もう一度お試しください。');
      });
  });
})();
