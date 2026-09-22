/* =========================================================================
   main.js — イチオシ採用 全ページ共通
   - CTA アンカーのスムーススクロール（scroll-margin-top は CSS §13 で担保）
   - IntersectionObserver による軽い入場アニメ（.rx-anim → .is-in）
   - ヘッダーナビ（スクロール背景 / ハンバーガー / Escで閉じる）
   - フローティングCTA（文言・遷移先は <body data-fab-label / data-fab-href> で上書き可）
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

/* フローティングお問い合わせボタン（左下固定・スクロール追従）
   - 全ページ共通。お問い合わせページ（#rx-contact-form あり）では出さない
   - 少しスクロールしたら表示し、以後ずっと追従（.is-visible をトグル）
   - DOM生成のみ（innerHTML不使用・ユーザー入力なし）
   - 文言・遷移先は <body data-fab-label="…" data-fab-href="…"> で上書き可
     （ホームは「無料診断を申し込む」→ contact.html?source=free-diagnosis） */
(function () {
  'use strict';

  if (document.getElementById('rx-contact-form')) return; // お問い合わせページ自身では出さない
  if (document.querySelector('.rx-fab')) return;          // 二重挿入ガード

  var fabLabel = document.body.getAttribute('data-fab-label') || 'お問い合わせ';
  var fabHref  = document.body.getAttribute('data-fab-href')  || 'contact.html';

  var SVGNS = 'http://www.w3.org/2000/svg';
  function svgEl(name, attrs) {
    var el = document.createElementNS(SVGNS, name);
    for (var k in attrs) el.setAttribute(k, attrs[k]);
    return el;
  }

  var fab = document.createElement('a');
  fab.className = 'rx-fab';
  fab.href = fabHref;
  fab.setAttribute('aria-label', fabLabel);

  var svg = svgEl('svg', {
    'class': 'rx-fab__icon', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor',
    'stroke-width': '1.9', 'stroke-linecap': 'round', 'stroke-linejoin': 'round', 'aria-hidden': 'true'
  });
  svg.appendChild(svgEl('path', { d: 'M4 5h16a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1H8l-4 3V6a1 1 0 0 1 1-1Z' }));
  svg.appendChild(svgEl('path', { d: 'm5 7 7 5 7-5' }));
  fab.appendChild(svg);

  var label = document.createElement('span');
  label.className = 'rx-fab__text';
  label.textContent = fabLabel;
  fab.appendChild(label);

  document.body.appendChild(fab);

  // 常時表示（最上部でも・上にスクロールしても消えない）。入場アニメだけ一度再生
  window.requestAnimationFrame(function () { fab.classList.add('is-visible'); });
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

  // 社内CRMの問い合わせ受信箱（/inbox）へ並行送信する。仕様は
  // ユーザーレベルスキル jou-crm-contact-web が正本。
  // CRM_TOKEN は総当たり抑止の門番であり機密ではない（静的サイトのJSに埋まる＝
  // ブラウザから読める前提の設計）。実質の防御はCRM側のIPレート制限とハニーポット。
  // ⚠️ ローテーションする場合は CRM側Vercel + 全HPリポジトリを同時に更新すること
  //    （1箇所ズレるとそのサイトだけ401になるが、HubSpotは正常なので気づきにくい）
  var CRM_ENDPOINT = 'https://contentsx-crm.vercel.app/api/inbound/web';
  var CRM_TOKEN    = 'ENoK7H4O60a8KdKlTal12exoV2rqSNlIb841sj3dSeo=';

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

    var department = readField(fd, 'department');

    var payload = {
      fields: [
        { name: 'company',   value: company },
        { name: 'busyo',     value: department },
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

    // CRM受信箱へも送る（HubSpotとは独立。失敗しても送信者には影響させない＝
    // CRMが落ちていてもHubSpot側の受付とサンクス表示は従来どおり動く）。
    // 受信データは承認されるまで web_inquiries に隔離される。
    try {
      fetch(CRM_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + CRM_TOKEN
        },
        body: JSON.stringify({
          site: 'ichioshi',
          company_name: company,
          department: department,
          full_name: fullName,
          email: email,
          message: message,
          page_url: window.location.href,
          utm_source: utmSource,
          utm_medium: utmMedium,
          utm_campaign: utmCampaign,
          referrer: document.referrer || null,
          hp: document.getElementById('website') ? document.getElementById('website').value : ''
        })
      }).catch(function (err) {
        console.warn('CRM inbound failed (ignored):', err);
      });
    } catch (err) {
      console.warn('CRM inbound skipped:', err);
    }

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
