(function() {
    const _0x1 = document;
    const _0x2 = window;

    _0x1.addEventListener("DOMContentLoaded", function() {
        const _a = _0x1.getElementById("gallery");
        if (!_a) return;

        const _b = _a.dataset.json;
        const _c = _a.dataset.folder;

        const _d = _0x1.getElementById('toggle-theme');
        if (_d) {
            _d.addEventListener('click', () => {
                _0x1.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', _0x1.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
        }
        if (localStorage.getItem('theme') === 'dark') _0x1.body.classList.add('dark-mode');

        const _e = () => {
            [_0x1.body, _0x1.documentElement].forEach(el => {
                el.style.setProperty('margin-right', '0px', 'important');
                el.style.setProperty('padding-right', '0px', 'important');
            });
        };
        new MutationObserver(_e).observe(_0x1.body, { attributes: true, attributeFilter: ['style', 'class'] });

        // Protection clic droit
        _0x1.addEventListener('contextmenu', e => {
            if (e.target.closest('#gallery') || e.target.closest('.fancybox__container')) e.preventDefault();
        });

        const _f = () => {
            let g = _0x1.querySelector('.insta-banner');
            if (!g) {
                g = _0x1.createElement('div');
                g.className = 'insta-banner';
                g.innerHTML = "N'oublie pas d'identifier <b>@photography.by.arthur</b> !";
                Object.assign(g.style, { fontSize: '14px', height: '50px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transition: 'none', boxSizing: 'border-box' });
                _0x1.body.appendChild(g);
            }
            _0x2.setTimeout(() => {
                g.style.transition = 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
                g.classList.add('is-visible');
            }, 10);
        };

        _0x2.addEventListener('click', () => _0x1.querySelector('.insta-banner')?.classList.remove('is-visible'));

        function _h(fb) {
            const _i = () => {
                const s = fb.getSlide();
                if (!s?.$el) return;
                const c = s.$el.querySelector('.fancybox__content');
                if (!c || c.querySelector('.__fancy-p')) return;
                const o = _0x1.createElement('div');
                o.className = '__fancy-p';
                Object.assign(o.style, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999, background: 'transparent', pointerEvents: 'auto' });
                o.addEventListener('contextmenu', e => e.preventDefault());
                c.appendChild(o);
            };
            fb.on('Carousel.change', _i);
            _i();
        }

        function _j(fb) {
            const tb = fb.$container.querySelector('.fancybox__toolbar__items--right') || fb.$container.querySelector('.fancybox__toolbar');
            if (tb && !fb.$container.querySelector('.btn-insta-share')) {
                const bt = _0x1.createElement('button');
                bt.className = 'f-button btn-insta-share';
                bt.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg><span class="btn-text" style="margin-left:10px;">Partager</span>`;
                bt.onclick = async (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const n = fb.getSlide().src.split('/').pop();
                    const u = _0x2.location.origin + _c + '/protected/' + n;
                    _f();
                    try {
                        const r = await fetch(u);
                        const bl = await r.blob();
                        const fi = new File([bl], n, { type: bl.type });
                        if (navigator.canShare && navigator.canShare({ files: [fi] })) {
                            await navigator.share({ files: [fi], title: 'Photo' });
                        } else { _0x2.open(u, '_blank'); }
                    } catch (err) { _0x2.open(u, '_blank'); }
                };
                tb.prepend(bt);
            }
        }
        fetch(_b).then(r => r.json()).then(data => {
            let nC = _0x2.innerWidth <= 600 ? 1 : (_0x2.innerWidth <= 1024 ? 2 : 4);
            const cols = Array.from({ length: nC }, () => {
                const c = _0x1.createElement("div");
                c.className = "gallery-column";
                _a.appendChild(c);
                return c;
            });

            data.forEach((img, i) => {
                const w = _0x1.createElement("div");
                w.className = "img-wrapper";
                const link = _0x1.createElement("a");
                link.href = _c + '/' + img.file;
                link.className = "fancy-trigger";
                link.dataset.index = i;
                const im = _0x1.createElement("img");
                im.src = _c + '/thumbs/' + img.file;
                im.style.height = (img.height || 200) + 'px';
                im.loading = "lazy";
                const ov = _0x1.createElement('div');
                Object.assign(ov.style, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 });
                link.append(im, ov);
                w.appendChild(link);
                cols[i % nC].appendChild(w);
            });

            _a.classList.add("is-ready");

            _a.addEventListener("click", e => {
                const t = e.target.closest(".fancy-trigger");
                if (!t) return;
                e.preventDefault();
                Fancybox.show(data.map(img => ({ src: _c + '/' + img.file, type: "image", caption: img.caption })), {
                    startIndex: parseInt(t.dataset.index),
                    Toolbar: { display: ["close"] },
                    dragToClose: false,
                    Image: { wheel: "slide", click: false, doubleClick: false, fit: "contain" },
                    Click: { content: false, backdrop: "close" },
                    on: {
                        ready: fb => { _e(); _h(fb); _j(fb); fb.$container.addEventListener('contextmenu', ev => ev.preventDefault()); },
                        closing: () => { _0x1.documentElement.style.overflowY = 'scroll'; }
                    }
                });
            });
        });
    });
})();