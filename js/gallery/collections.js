(function() {
    const _doc = document;
    const _win = window;

    _doc.addEventListener("DOMContentLoaded", function() {
        const _g = _doc.getElementById("gallery");
        if (!_g) return;

        const _u = _g.dataset.json;
        const _f = _g.dataset.folder;

        const _t = _doc.getElementById('toggle-theme');
        if (_t) {
            _t.addEventListener('click', () => {
                _doc.body.classList.toggle('dark-mode');
                localStorage.setItem('theme', _doc.body.classList.contains('dark-mode') ? 'dark' : 'light');
            });
        }
        if (localStorage.getItem('theme') === 'dark') _doc.body.classList.add('dark-mode');

        const _fix = () => {
            [_doc.body, _doc.documentElement].forEach(el => {
                el.style.setProperty('margin-right', '0px', 'important');
                el.style.setProperty('padding-right', '0px', 'important');
            });
        };
        new MutationObserver(_fix).observe(_doc.body, { attributes: true, attributeFilter: ['style', 'class'] });

        _doc.addEventListener('contextmenu', e => {
            if (e.target.closest('#gallery') || e.target.closest('.fancybox__container')) e.preventDefault();
        });

        const _showB = () => {
            let b = _doc.querySelector('.insta-banner');
            if (!b) {
                b = _doc.createElement('div');
                b.className = 'insta-banner';
                b.innerHTML = "N'oublie pas d'identifier <b>@photography.by.arthur</b> !";
                Object.assign(b.style, { fontSize: '14px', height: '50px', padding: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', transition: 'none', boxSizing: 'border-box' });
                _doc.body.appendChild(b);
            }
            _win.setTimeout(() => {
                b.style.transition = 'transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)';
                b.classList.add('is-visible');
            }, 10);
        };

        _win.addEventListener('click', () => _doc.querySelector('.insta-banner')?.classList.remove('is-visible'));

        function _prot(fb) {
            const _apply = () => {
                const s = fb.getSlide();
                if (!s?.$el) return;
                const c = s.$el.querySelector('.fancybox__content');
                if (!c || c.querySelector('.__fancy-p')) return;
                const o = _doc.createElement('div');
                o.className = '__fancy-p';
                Object.assign(o.style, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999, background: 'transparent', pointerEvents: 'auto' });
                o.addEventListener('contextmenu', e => e.preventDefault());
                c.appendChild(o);
            };
            fb.on('Carousel.change', _apply);
            _apply();
        }

        function _share(fb) {
            const tb = fb.$container.querySelector('.fancybox__toolbar__items--right') || fb.$container.querySelector('.fancybox__toolbar');
            if (tb && !fb.$container.querySelector('.btn-insta-share')) {
                const btn = _doc.createElement('button');
                btn.className = 'f-button btn-insta-share';
                btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg><span class="btn-text" style="margin-left:10px;">Partager</span>`;
                btn.onclick = async (e) => {
                    e.preventDefault(); e.stopPropagation();
                    const n = fb.getSlide().src.split('/').pop();
                    const u = _win.location.origin + _f + '/protected/' + n;
                    _showB();
                    try {
                        const r = await fetch(u);
                        const bl = await r.blob();
                        const fi = new File([bl], n, { type: bl.type });
                        if (navigator.canShare && navigator.canShare({ files: [fi] })) {
                            await navigator.share({ files: [fi], title: 'Photo' });
                        } else { _win.open(u, '_blank'); }
                    } catch (err) { _win.open(u, '_blank'); }
                };
                tb.prepend(btn);
            }
        }

        fetch(_u).then(r => r.json()).then(data => {
            let nC = _win.innerWidth <= 600 ? 1 : (_win.innerWidth <= 1024 ? 2 : 4);
            const cols = Array.from({ length: nC }, () => {
                const c = _doc.createElement("div");
                c.className = "gallery-column";
                _g.appendChild(c);
                return c;
            });

            data.forEach((img, i) => {
                const w = _doc.createElement("div");
                w.className = "img-wrapper";
                const l = _doc.createElement("a");
                l.href = _f + '/' + img.file;
                l.className = "fancy-trigger";
                l.dataset.index = i;
                const im = _doc.createElement("img");
                im.src = _f + '/thumbs/' + img.file;
                im.style.height = (img.height || 200) + 'px';
                im.loading = "lazy";
                const ov = _doc.createElement('div');
                Object.assign(ov.style, { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 });
                l.append(im, ov);
                w.appendChild(l);
                cols[i % nC].appendChild(w);
            });

            _g.classList.add("is-ready");

            _g.addEventListener("click", e => {
                const t = e.target.closest(".fancy-trigger");
                if (!t) return;
                e.preventDefault();
                Fancybox.show(data.map(img => ({ src: _f + '/' + img.file, type: "image", caption: img.caption })), {
                    startIndex: parseInt(t.dataset.index),
                    Toolbar: { display: ["close"] },
                    dragToClose: false,
                    Image: { wheel: "slide", click: false, doubleClick: false, fit: "contain" },
                    Click: { content: false, backdrop: "close" },
                    on: {
                        ready: fb => { _fix(); _prot(fb); _share(fb); fb.$container.addEventListener('contextmenu', ev => ev.preventDefault()); },
                        closing: () => { _doc.documentElement.style.overflowY = 'scroll'; }
                    }
                });
            });
        });
    });
})();


