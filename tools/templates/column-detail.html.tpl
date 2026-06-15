<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <link rel="icon" type="image/png" sizes="32x32" href="../../images/favicon/favicon-32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="../../images/favicon/favicon-16.png">
  <link rel="apple-touch-icon" sizes="180x180" href="../../images/favicon/apple-touch-icon.png">
  <title>{{seo_title}}</title>
  <meta name="description" content="{{seo_description}}">
  <meta name="robots" content="index, follow">
  <link rel="canonical" href="{{page_url}}">
  <!-- OGP -->
  <meta property="og:title" content="{{seo_title}}">
  <meta property="og:description" content="{{seo_description}}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="{{page_url}}">
  <meta property="og:site_name" content="リクルートX">
  <meta property="og:locale" content="ja_JP">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="{{seo_title}}">
  <meta name="twitter:description" content="{{seo_description}}">
  <!-- Structured Data -->
  <script type="application/ld+json">{{article_jsonld}}</script>
  <script type="application/ld+json">{{breadcrumb_jsonld}}</script>
  <!-- CSP -->
  <meta http-equiv="Content-Security-Policy" content="default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://*.clarity.ms; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https:; object-src 'none'; base-uri 'self'; form-action 'self'">
  <!-- Google tag (gtag.js) — GA4 G-S2RDKPM1LE -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-S2RDKPM1LE"></script>
  <script src="../../js/ga4.js"></script>
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@500;600&family=Zen+Kaku+Gothic+Antique:wght@400;500;700&family=Inter:wght@500;700&display=swap">
  <link rel="stylesheet" href="../../css/tokens.css">
  <link rel="stylesheet" href="../../css/style.css">
  <link rel="stylesheet" href="../../css/column.css">
</head>
<body class="rx-jp-body">

  <header class="rx-nav" id="nav">
    <div class="rx-nav__inner">
      <a class="rx-nav__brand" href="../../index.html" aria-label="リクルートX トップへ">
        <img class="rx-nav__brand-img" src="../../images/logo/recruitx-logo.png" alt="リクルートX" width="570" height="160">
      </a>
      <nav class="rx-nav__menu" id="navMenu" aria-label="メインナビゲーション">
        <a class="rx-nav__link" href="../../index.html#service">サービス</a>
        <a class="rx-nav__link" href="../../case.html">事例</a>
        <a class="rx-nav__link" href="../../price.html">料金プラン</a>
        <a class="rx-nav__link" href="../../column.html" aria-current="page">コラム</a>
      </nav>
      <a class="rx-nav__cta" href="../../contact.html">
        <span class="rx-nav__cta-text">お問い合わせ</span>
        <span class="rx-nav__cta-alt" aria-hidden="true">Contact</span>
      </a>
      <button class="rx-nav__hamburger" type="button" aria-label="メニューを開く" aria-expanded="false" aria-controls="navMenu">
        <span></span><span></span><span></span>
      </button>
    </div>
  </header>

  <main>

    <article class="rx-cold">
      <div class="rx-cold__inner">
        <nav class="rx-cold__bread" aria-label="パンくず">
          <ol>
            <li><a href="../../">トップ</a></li>
            <li><a href="../../column.html">コラム</a></li>
            <li aria-current="page">{{title}}</li>
          </ol>
        </nav>

        <header class="rx-cold__head">
          <p class="rx-cold__meta">{{category}}<time class="rx-cold__date" datetime="{{date_ymd}}">{{date}}</time></p>
          <h1 class="rx-cold__title">{{title}}</h1>
        </header>

        <figure class="rx-cold__hero">{{hero_image}}</figure>

        <div class="rx-cold__body">
          {{content_html}}
        </div>
      </div>
    </article>

    <section class="rx-colrel" aria-labelledby="relHeading">
      <div class="rx-colrel__inner">
        <h2 class="rx-colrel__heading" id="relHeading">関連するコラム</h2>
        <ul class="rx-colrel__grid">{{related}}</ul>
      </div>
    </section>

    <!-- CTA バナー -->
    <section class="rx-colcta" aria-labelledby="colCtaHeading">
      <div class="rx-colcta__inner rx-anim">
        <div class="rx-colcta__art" aria-hidden="true">
          <svg viewBox="0 0 200 140" fill="none" xmlns="http://www.w3.org/2000/svg" role="img">
            <rect x="14" y="34" width="172" height="78" rx="10" fill="#fff" stroke="#f7c6dd" stroke-width="2"/>
            <circle cx="62" cy="58" r="15" fill="#fbe0ec"/><rect x="44" y="76" width="36" height="26" rx="8" fill="#f7c6dd"/>
            <circle cx="132" cy="58" r="15" fill="#fbe0ec"/><rect x="114" y="76" width="36" height="26" rx="8" fill="#f7c6dd"/>
            <path d="M86 64h28M86 74h20" stroke="#ec2d87" stroke-width="3" stroke-linecap="round"/>
          </svg>
        </div>
        <div class="rx-colcta__text">
          <h2 class="rx-colcta__heading" id="colCtaHeading">貴社の採用課題をプロが解決します</h2>
          <p class="rx-colcta__lead">採用でお悩みの方、まずは無料のオンライン相談で気軽にご相談ください。</p>
          <ul class="rx-colcta__points">
            <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5"/></svg>採用戦略のご相談</li>
            <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5"/></svg>自社に合った媒体のご提案</li>
            <li><svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8.5l3.2 3.2L13 5"/></svg>無料の改善診断</li>
          </ul>
        </div>
        <div class="rx-colcta__action">
          <span class="rx-colcta__badge"><b>60分</b>無料</span>
          <a class="rx-colcta__btn" href="../../contact.html">無料相談を予約する<svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10h14M11 4l6 6-6 6"/></svg></a>
          <p class="rx-colcta__note">オンラインで気軽に相談できます</p>
        </div>
      </div>
    </section>

    <div class="rx-cold__back">
      <a href="../../column.html"><svg viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M17 10H3M9 16l-6-6 6-6"/></svg>コラム一覧へ戻る</a>
    </div>

  </main>

  <footer class="rx-footer" role="contentinfo">
    <div class="rx-footer__inner">
      <div class="rx-footer__top">
        <div class="rx-footer__brand">
          <a class="rx-footer__logo" href="../../index.html" aria-label="リクルートX トップへ">
            <img class="rx-footer__logo-img" src="../../images/logo/recruitx-logo.png" alt="リクルートX" width="570" height="160">
          </a>
          <p class="rx-footer__tagline">求人広告に頼らない、SNS時代の採用へ。</p>
        </div>
        <nav class="rx-footer__nav" aria-label="フッターナビゲーション">
          <ul class="rx-footer__links">
            <li><a class="rx-footer__link" href="../../index.html#service">サービス</a></li>
            <li><a class="rx-footer__link" href="../../case.html">事例</a></li>
            <li><a class="rx-footer__link" href="../../contact.html">お問い合わせ</a></li>
            <li><a class="rx-footer__link" href="../../price.html">料金プラン</a></li>
            <li><a class="rx-footer__link" href="../../column.html">コラム</a></li>
          </ul>
        </nav>
      </div>
      <div class="rx-footer__bottom">
        <div class="rx-footer__company">
          <p class="rx-footer__company-service">リクルートX（RecruitX）</p>
          <p class="rx-footer__company-name">運営：コンテンツエックス株式会社 ／ Contents X Co., Ltd.</p>
        </div>
        <p class="rx-footer__copyright"><small>&#169; 2026 Contents X Co., Ltd.</small></p>
      </div>
    </div>
  </footer>

  <script src="../../js/main.js" defer></script>

</body>
</html>
