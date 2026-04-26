(function() {
    document.querySelectorAll('.gallery a img').forEach(function(img) {
        var link = img.closest('a');
        var parent = img.parentElement;

        // Sécurité de base sur l'image
        img.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        img.addEventListener('dragstart', function(e) { e.preventDefault(); });

        // Style de base
        Object.assign(img.style, {
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
            display: "block",
            width: "100%",
            objectFit: "cover"
        });

        if (getComputedStyle(parent).position === 'static') parent.style.position = 'relative';

        // Création de la couche de protection et d'effet
        var ov = document.createElement('div');
        Object.assign(ov.style, {
            position: 'absolute',
            top: 0, left: 0, width: '100%', height: '100%',
            background: 'transparent',
            cursor: 'pointer',
            zIndex: 10
        });

        // Gestion des effets
        ov.addEventListener('mouseover', function() {
            img.style.transform = 'scale(1.03)';
            img.style.boxShadow = '0 6px 20px rgba(0,0,0,0.2)';
        });
        ov.addEventListener('mouseout', function() {
            img.style.transform = 'scale(1)';
            img.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
        });

        // Mobile & Sécurité
        ov.addEventListener('contextmenu', function(e) { e.preventDefault(); });
        var t;
        ov.addEventListener('touchstart', function(e) { t = setTimeout(function() { e.preventDefault(); }, 600); }, { passive: false });
        ov.addEventListener('touchend', function() { clearTimeout(t); });
        
        if (link) {
            ov.addEventListener('click', function(e) {
                e.preventDefault();
                link.click();
            });
        }

        parent.appendChild(ov);
    });
})();