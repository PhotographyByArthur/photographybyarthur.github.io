document.addEventListener("DOMContentLoaded", function() {
    const _gal = document.getElementById("gallery");
    if (!_gal) return;

    // Récupération des paramètres via le HTML
    const _u = _gal.dataset.json;
    const _f = _gal.dataset.folder;

    // --- GESTION DU MODE SOMBRE ---
    const _themeBtn = document.getElementById('toggle-theme');
    if (_themeBtn) {
        _themeBtn.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('theme', isDark ? 'dark' : 'light');
        });
    }
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.add('dark-mode');
    }

    // --- FORCE LE MAINTIEN DU SCROLL (Correctif Fancybox) ---
    const _lockStyle = () => {
        [document.body, document.documentElement].forEach(el => {
            if (el.style.marginRight !== '0px') el.style.setProperty('margin-right', '0px', 'important');
            if (el.style.paddingRight !== '0px') el.style.setProperty('padding-right', '0px', 'important');
        });
    };
    const _observer = new MutationObserver(_lockStyle);
    _observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

    // --- BANNIÈRE INSTAGRAM ---
    const _showBanner = () => {
        let banner = document.querySelector('.insta-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'insta-banner';
            banner.innerHTML = "N'oublie pas d'identifier <b>@photography.by.arthur</b> !";
            document.body.appendChild(banner);
        }
        banner.classList.add('is-visible');
    };

    const _hideBanner = () => {
        const banner = document.querySelector('.insta-banner');
        if (banner) banner.classList.remove('is-visible');
    };

    window.addEventListener('click', _hideBanner);

    // --- PROTECTIONS FANCYBOX ---
    function _protectSlide(fb) {
        const apply = () => {
            const slide = fb.getSlide();
            if (!slide || !slide.$el) return;
            const content = slide.$el.querySelector('.fancybox__content');
            if (!content || content.querySelector('.__fancy-p')) return;
            
            const overlay = document.createElement('div');
            overlay.className = '__fancy-p';
            Object.assign(overlay.style, { 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                background: 'transparent', zIndex: 999, pointerEvents: 'auto'
            });
            overlay.addEventListener('contextmenu', e => e.preventDefault());
            content.appendChild(overlay);
        };
        apply();
        fb.on('Carousel.change', apply);
    }

    // --- BOUTON DE PARTAGE CORRIGÉ (MOBILE) ---
    function _setupShareBtn(fb) {
        const toolbar = fb.$container.querySelector('.fancybox__toolbar__items--right') || fb.$container.querySelector('.fancybox__toolbar');
        
        if (toolbar && !fb.$container.querySelector('.btn-insta-share')) {
            const btn = document.createElement('button');
            btn.className = 'f-button btn-insta-share';
            btn.setAttribute('type', 'button');
            btn.style.pointerEvents = "auto";
            
            btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg><span class="btn-text" style="margin-left:10px;">Partager</span>`;
            
            btn.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();

                const slide = fb.getSlide();
                const fileName = slide.src.split('/').pop();
                
                // CORRECTION : Construction de l'URL absolue pour le mobile
                const absoluteProtectedUrl = window.location.origin + _f + '/protected/' + fileName;

                _showBanner();

                if (navigator.share) {
                    try {
                        await navigator.share({
                            title: 'Partage Photo',
                            text: 'Regarde cette photo !',
                            url: absoluteProtectedUrl
                        });
                    } catch (err) {
                        window.open(absoluteProtectedUrl, '_blank');
                    }
                } else {
                    window.open(absoluteProtectedUrl, '_blank');
                }
            });
            toolbar.prepend(btn);
        }
    }

    // --- CHARGEMENT DES DONNÉES ET GÉNÉRATION ---
    fetch(_u)
        .then(res => res.ok ? res.json() : Promise.reject("Erreur JSON"))
        .then(images => {
            // Préparation des items pour Fancybox
            const fancyboxItems = images.map(img => ({
                src: _f + '/' + img.file,
                caption: img.caption,
                type: "image",
            }));

            // Création des colonnes responsive
            let numCols = window.innerWidth <= 600 ? 1 : (window.innerWidth <= 1024 ? 2 : 4);
            _gal.innerHTML = ""; 
            const columnElements = [];
            for (let i = 0; i < numCols; i++) {
                const col = document.createElement("div");
                col.className = "gallery-column";
                _gal.appendChild(col);
                columnElements.push(col);
            }

            // Distribution des images
            images.forEach((img, index) => {
                const targetColumn = columnElements[index % numCols];
                const wrapper = document.createElement("div");
                wrapper.className = "img-wrapper";

                const anchor = document.createElement("a");
                anchor.href = _f + '/' + img.file;
                anchor.className = "fancy-trigger";
                anchor.dataset.index = index;

                // Anti-clic droit sur la vignette
                anchor.addEventListener('contextmenu', ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                }, { capture: true });

                const image = document.createElement("img");
                Object.assign(image, {
                    src: _f + '/thumbs/' + img.file,
                    alt: img.alt || "",
                    draggable: false
                });
                image.style.height = `${img.height || 200}px`;
                image.style.pointerEvents = "none";

                // Overlay de protection invisible
                const protectOverlay = document.createElement('div');
                Object.assign(protectOverlay.style, { 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 
                });

                anchor.append(image, protectOverlay);
                wrapper.appendChild(anchor);
                targetColumn.appendChild(wrapper);
            });

            _gal.classList.add("is-ready");

            // --- GESTION DU CLIC POUR OUVRIR FANCYBOX ---
            _gal.addEventListener("click", (e) => {
                const trigger = e.target.closest(".fancy-trigger");
                if (!trigger) return;
                e.preventDefault();

                Fancybox.show(fancyboxItems, {
                    startIndex: parseInt(trigger.dataset.index),
                    Toolbar: { display: ["close"] },
                    Thumbs: false,
                    dragToClose: false,
                    Click: { content: false, backdrop: "close" },
                    Image: { click: false, wheel: "slide", fit: "contain" },
                    on: {
                        ready: (fb) => {
                            _lockStyle();
                            _protectSlide(fb);
                            _setupShareBtn(fb);
                            // Anti-clic droit global dans Fancybox
                            fb.$container.addEventListener('contextmenu', ev => ev.preventDefault());
                        },
                        closing: () => {
                            document.documentElement.style.overflowY = 'scroll';
                            _hideBanner();
                        }
                    }
                });
            });
        });
});
