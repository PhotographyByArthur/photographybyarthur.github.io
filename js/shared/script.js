(function() {
    fetch('/shared/nav.html')
        .then(res => res.ok ? res.text() : Promise.reject('Nav non trouvée'))
        .then(data => {
            const placeholder = document.getElementById('nav-placeholder');
            if (!placeholder) return;
            placeholder.innerHTML = data;

            const root = document.documentElement;
            const icon = document.getElementById("theme-icon");
            if (icon) {
                const isDark = root.classList.contains("dark-mode");
                icon.src = isDark ? "/assets/icons/theme-dark.svg" : "/assets/icons/theme-light.svg";
                icon.alt = isDark ? "Mode sombre" : "Mode clair";
            }

            const trigger = document.querySelector('.no-click');
            const sub = trigger ? trigger.nextElementSibling : null;

            if (trigger && sub) {
                trigger.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const isOpen = sub.classList.toggle('show');
                    trigger.classList.toggle('active', isOpen);
                });

                document.addEventListener('click', (e) => {
                    if (!sub.contains(e.target) && !trigger.contains(e.target)) {
                        sub.classList.remove('show');
                        trigger.classList.remove('active');
                    }
                });

                const parent = trigger.parentElement;
                if (parent) {
                    parent.addEventListener('mouseenter', () => trigger.classList.add('active'));
                    parent.addEventListener('mouseleave', () => trigger.classList.remove('active'));
                }
            }
        })
        .catch(err => console.error(err));

    window.addEventListener("load", () => {
        document.documentElement.style.visibility = "visible";
    });
})();