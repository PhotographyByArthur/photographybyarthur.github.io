(function() {
    document.addEventListener("click", function(e) {
        var btn = e.target.closest("#toggle-theme");
        if (!btn) return;

        var root = document.documentElement;
        var icon = document.getElementById("theme-icon");
        if (!icon) return;

        var isDark = root.classList.toggle("dark-mode");

        icon.style.transition = "transform 0.2s ease";
        icon.style.transform = "scale(0.85) rotate(180deg)";

        setTimeout(function() {
            icon.style.transform = "scale(1) rotate(0deg)";
        }, 200);

        if (isDark) {
            localStorage.setItem("theme", "dark");
            icon.src = "/assets/icons/theme-dark.svg";
            icon.alt = "Mode sombre";
        } else {
            localStorage.setItem("theme", "light");
            icon.src = "/assets/icons/theme-light.svg";
            icon.alt = "Mode clair";
        }
    });
})();