document.addEventListener("DOMContentLoaded", function() {
    const _gal = document.getElementById("gallery");
    if (!_gal) return;

    const _u = _gal.dataset.json;
    const _f = _gal.dataset.folder;

    const _tBt = document.getElementById('toggle-theme');
    if (_tBt) {
        _tBt.addEventListener('click', () => {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }
    if (localStorage.getItem('theme') === 'dark') document.body.classList.add('dark-mode');

    const _lS = () => {
        [document.body, document.documentElement].forEach(el => {
            el.style.setProperty('margin-right', '0px', 'important');
            el.style.setProperty('padding-right', '0px', 'important');
        });
    };
    const _obs = new MutationObserver(_lS);
    _obs.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

    document.addEventListener('contextmenu', e => {
        if (e.target.closest('#gallery') || e.target.closest('.fancybox__container')) {
            e.preventDefault();
        }
    });

    const _sB = () => {
        let b = document.querySelector('.insta-banner');
        if (!b) {
            b = document.createElement('div');
            b.className = 'insta-banner';
            b.innerHTML = "N'oublie pas d'identifier <b>@photography.by.arthur</b> !";
            
            // On utilise Flexbox pour un centrage parfait et on fige la taille
            Object.assign(b.style, {
                fontSize: '14px',
                height: '50px',
                padding: '0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                transition: 'none',
                boxSizing: 'border-box'
            });
            
            document.body.appendChild(b);
        }
        
        setTimeout(() => {
            b.style.transition = 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
            b.classList.add('is-visible');
        }, 10);
    };

    window.addEventListener('click', () => document.querySelector('.insta-banner')?.classList.remove('is-visible'));

    function _pFS(fb) {
        const apply = () => {
            const s = fb.getSlide();
            if (!s?.$el) return;
            const c = s.$el.querySelector('.fancybox__content');
            if (!c || c.querySelector('.__fancy-p')) return;
            
            const o = document.createElement('div');
            o.className = '__fancy-p';
            Object.assign(o.style, { 
                position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                zIndex: 999, background: 'transparent', pointerEvents: 'auto'
            });
            o.addEventListener('contextmenu', e => e.preventDefault());
            c.appendChild(o);
        };
        fb.on('Carousel.change', apply);
        apply();
    }

    function _sIB(fb) {
        const tb = fb.$container.querySelector('.fancybox__toolbar__items--right') || fb.$container.querySelector('.fancybox__toolbar');
        if (tb && !fb.$container.querySelector('.btn-insta-share')) {
            const bt = document.createElement('button');
            bt.className = 'f-button btn-insta-share';
            bt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg><span class="btn-text" style="margin-left:10px;">Partager</span>`;
            
            bt.onclick = async (e) => {
                e.preventDefault(); e.stopPropagation();
                const nm = fb.getSlide().src.split('/').pop();
                const pU = window.location.origin + _f + '/protected/' + nm;
                _sB();
                try {
                    const response = await fetch(pU);
                    const blob = await response.blob();
                    const file = new File([blob], nm, { type: blob.type });
                    if (navigator.canShare && navigator.canShare({ files: [file] })) {
                        await navigator.share({ files: [file], title: 'Photo' });
                    } else { window.open(pU, '_blank'); }
                } catch (err) { window.open(pU, '_blank'); }
            };
            tb.prepend(bt);
        }
    }

    fetch(_u).then(r => r.json()).then(data => {
        let nC = window.innerWidth <= 600 ? 1 : (window.innerWidth <= 1024 ? 2 : 4);
        const cols = Array.from({ length: nC }, () => {
            const c = document.createElement("div");
            c.className = "gallery-column";
            _gal.appendChild(c);
            return c;
        });

        data.forEach((img, i) => {
            const w = document.createElement("div");
            w.className = "img-wrapper";
            const a = document.createElement("a");
            a.href = _f + '/' + img.file;
            a.className = "fancy-trigger";
            a.dataset.index = i;

            const im = document.createElement("img");
            im.src = _f + '/thumbs/' + img.file;
            im.style.height = (img.height || 200) + 'px';
            im.loading = "lazy";

            const ov = document.createElement('div');
            Object.assign(ov.style, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 });

            a.append(im, ov);
            w.appendChild(a);
            cols[i % nC].appendChild(w);
        });

        _gal.classList.add("is-ready");

        _gal.addEventListener("click", e => {
            const t = e.target.closest(".fancy-trigger");
            if (!t) return;
            e.preventDefault();

            Fancybox.show(data.map(img => ({ 
                src: _f + '/' + img.file, 
                type: "image",
                caption: img.caption 
            })), {
                startIndex: parseInt(t.dataset.index),
                Toolbar: { display: ["close"] },
                dragToClose: false,
                Image: {
                    wheel: "slide",
                    click: false,
                    doubleClick: false,
                    fit: "contain"
                },
                Click: {
                    content: false,
                    backdrop: "close"
                },
                on: {
                    ready: fb => {
                        _lS();
                        _pFS(fb);
                        _sIB(fb);
                        fb.$container.addEventListener('contextmenu', ev => ev.preventDefault());
                    },
                    closing: () => {
                        document.documentElement.style.overflowY = 'scroll';
                    }
                }
            });
        });
    });
});
