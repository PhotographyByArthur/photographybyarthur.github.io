document.addEventListener("DOMContentLoaded", () => {
    const gallery = document.getElementById("gallery");
    if (!gallery) return;

    const jsonUrl = gallery.dataset.json;
    const folder = gallery.dataset.folder;

    const lockStyle = () => {
        [document.body, document.documentElement].forEach(el => {
            if (el.style.marginRight !== '0px') el.style.setProperty('margin-right', '0px', 'important');
            if (el.style.paddingRight !== '0px') el.style.setProperty('padding-right', '0px', 'important');
        });
    };
    const observer = new MutationObserver(lockStyle);
    observer.observe(document.body, { attributes: true, attributeFilter: ['style', 'class'] });

    const showBanner = () => {
        let banner = document.querySelector('.insta-banner');
        if (!banner) {
            banner = document.createElement('div');
            banner.className = 'insta-banner';
            banner.innerHTML = "N'oublie pas d'identifier <b>@photography.by.arthur</b> !";
            document.body.appendChild(banner);
        }
        banner.classList.add('is-visible');
    };

    const hideBanner = () => {
        const banner = document.querySelector('.insta-banner');
        if (banner) banner.classList.remove('is-visible');
    };

    window.addEventListener('click', hideBanner);

    function protectFancySlide(fb) {
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

    function setupInstaButton(fb) {
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
                const protectedUrl = new URL(`${folder}/protected/${fileName}`, window.location.origin).href;

                showBanner();

                if (navigator.share && window.location.protocol === 'https:') {
                    try {
                        await navigator.share({
                            title: 'Partage Photo',
                            text: 'Regarde cette œuvre !',
                            url: protectedUrl
                        });
                    } catch (err) {
                        window.open(protectedUrl, '_blank');
                    }
                } else {
                    window.open(protectedUrl, '_blank');
                }
            });
            toolbar.prepend(btn);
        }
    }

    fetch(jsonUrl)
        .then(res => res.ok ? res.json() : Promise.reject("Erreur JSON"))
        .then(images => {
            const fancyboxItems = images.map(img => ({
                src: `${folder}/${img.file}`,
                caption: img.caption,
                type: "image",
            }));

            let numCols = window.innerWidth <= 600 ? 1 : (window.innerWidth <= 1024 ? 2 : 4);
            gallery.innerHTML = ""; 
            const columnElements = [];
            for (let i = 0; i < numCols; i++) {
                const col = document.createElement("div");
                col.className = "gallery-column";
                gallery.appendChild(col);
                columnElements.push(col);
            }

            images.forEach((img, index) => {
                const targetColumn = columnElements[index % numCols];
                const wrapper = document.createElement("div");
                wrapper.className = "img-wrapper";

                const anchor = document.createElement("a");
                anchor.href = `${folder}/${img.file}`;
                anchor.className = "fancy-trigger";
                anchor.dataset.index = index;

                anchor.addEventListener('contextmenu', ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                }, { capture: true });

                const image = document.createElement("img");
                Object.assign(image, {
                    src: `${folder}/thumbs/${img.file}`,
                    alt: img.alt,
                    draggable: false
                });
                image.style.height = `${img.height || 200}px`;
                image.style.pointerEvents = "none";

                const protectOverlay = document.createElement('div');
                Object.assign(protectOverlay.style, { 
                    position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10 
                });

                anchor.append(image, protectOverlay);
                wrapper.appendChild(anchor);
                targetColumn.appendChild(wrapper);
            });

            gallery.classList.add("is-ready");

            gallery.addEventListener("click", (e) => {
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
                            lockStyle();
                            protectFancySlide(fb);
                            setupInstaButton(fb);
                            fb.$container.addEventListener('contextmenu', ev => ev.preventDefault());
                        },
                        closing: () => {
                            document.documentElement.style.overflowY = 'scroll';
                            hideBanner();
                        }
                    }
                });
            });
        });
});