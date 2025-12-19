// ----- COOKIES.JS -----
// Version PRODUCTION - Google Analytics GA4 conforme RGPD
(function() {
  const GA_ID = 'G-4YXJ32XNPV'; // 🔴 TON vrai ID GA4 ici

  function loadGA() {
    if (window.__ga_loaded) return;
    window.__ga_loaded = true;

    const gtagScript = document.createElement('script');
    gtagScript.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
    gtagScript.async = true;
    document.head.appendChild(gtagScript);

    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;

    gtag('js', new Date());
    gtag('config', GA_ID, {
      anonymize_ip: true
    });

    console.log("📊 Google Analytics GA4 chargé");
  }

  function waitForBanner(callback) {
    const interval = setInterval(() => {
      const banner = document.getElementById('cookie-banner');
      const acceptBtn = document.getElementById('accept-cookies');
      const refuseBtn = document.getElementById('decline-cookies');
      if (banner && acceptBtn && refuseBtn) {
        clearInterval(interval);
        callback(banner, acceptBtn, refuseBtn);
      }
    }, 200);
    setTimeout(() => clearInterval(interval), 10000);
  }

  function initCookies(banner, acceptBtn, refuseBtn) {
    const consent = localStorage.getItem('cookiesConsent');

    if (!consent) {
      banner.style.display = 'flex';
    }

    acceptBtn.addEventListener('click', () => {
      localStorage.setItem('cookiesConsent', 'accepted');
      loadGA();
      banner.style.display = 'none';
    });

    refuseBtn.addEventListener('click', () => {
      localStorage.setItem('cookiesConsent', 'refused');
      banner.style.display = 'none';
    });

    if (consent === 'accepted') {
      loadGA();
      banner.style.display = 'none';
    } else if (consent === 'refused') {
      banner.style.display = 'none';
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => waitForBanner(initCookies));
  } else {
    waitForBanner(initCookies);
  }
})();
