(function() {
    const formatDate = (s) => {
        if (!s) return "";
        const d = new Date(s);
        return isNaN(d.getTime()) ? s : d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" });
    };

    fetch("/data/gallery/categories/sport.json")
        .then(r => r.json())
        .then(data => {
            const fG = document.getElementById("football-grid");
            const eG = document.getElementById("évènement-grid");
            if (!fG || !eG) return;

            data.forEach(e => {
                const c = document.createElement("a");
                c.className = `pin-card ${e.size || "medium"}`;
                c.href = e.link;

                c.addEventListener('contextmenu', ev => {
                    ev.preventDefault();
                    ev.stopPropagation();
                    c.blur(); 
                }, { capture: true });

                const i = document.createElement("img");
                Object.assign(i, { 
                    src: e.image, 
                    alt: e.title, 
                    width: e.width, 
                    height: e.height, 
                    draggable: false 
                });
                i.style.pointerEvents = "none";
                i.onload = () => i.classList.add("loaded");

                const s = document.createElement('div');
                s.className = '__protect-overlay';
                Object.assign(s.style, { 
                    position: 'absolute', 
                    top: 0, 
                    left: 0, 
                    width: '100%', 
                    height: '100%', 
                    zIndex: 10 
                });

                const o = document.createElement("div");
                o.className = "pin-overlay";
                o.style.zIndex = 11;
                o.innerHTML = `<h3>${e.title}</h3><p>${e.label} · ${formatDate(e.date)}</p>`;

                c.append(i, s, o);
                (e.category === "football" ? fG : eG).appendChild(c);
            });
        }).catch(err => console.error("Err:", err));
})();