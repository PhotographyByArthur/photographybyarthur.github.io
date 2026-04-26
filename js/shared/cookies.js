(function() {
    const GA_ID = 'G-4YXJ32XNPV';

    function loadGA() {
        if (window.__ga_loaded) return;
        window.__ga_loaded = true;

        const sc = document.createElement('script');
        sc.src = "https://www.googletagmanager.com/gtag/js?id=" + GA_ID;
        sc.async = true;
        document.head.appendChild(sc);

        window.dataLayer = window.dataLayer || [];
        function gtag(){ dataLayer.push(arguments); }
        window.gtag = gtag;

        gtag('js', new Date());
        gtag('config', GA_ID, { 'anonymize_ip': true });
    }

    function checkElements(cb) {
        const it = setInterval(() => {
            const b = document.getElementById('cookie-banner');
            const a = document.getElementById('accept-cookies');
            const d = document.getElementById('decline-cookies');
            if (b && a && d) {
                clearInterval(it);
                cb(b, a, d);
            }
        }, 200);
        setTimeout(() => clearInterval(it), 8000);
    }

    function init(b, a, d) {
        const c = localStorage.getItem('cookiesConsent');

        if (!c) b.style.display = 'flex';

        a.addEventListener('click', () => {
            localStorage.setItem('cookiesConsent', 'accepted');
            loadGA();
            b.style.display = 'none';
        });

        d.addEventListener('click', () => {
            localStorage.setItem('cookiesConsent', 'refused');
            b.style.display = 'none';
        });

        if (c === 'accepted') {
            loadGA();
            b.style.display = 'none';
        } else if (c === 'refused') {
            b.style.display = 'none';
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => checkElements(init));
    } else {
        checkElements(init);
    }
})();