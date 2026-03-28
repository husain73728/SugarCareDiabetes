(() => {
    const transitionDuration = 220;
    let isNavigating = false;

    const style = document.createElement("style");
    style.textContent = `
        body.page-transition-enabled {
            opacity: 0;
            transition: opacity ${transitionDuration}ms ease;
        }

        body.page-transition-enabled.page-transition-in {
            opacity: 1;
        }

        body.page-transition-enabled.page-transition-out {
            opacity: 0;
            pointer-events: none;
        }
    `;
    document.head.appendChild(style);

    function isInternalPageLink(link) {
        if (!link || !link.href || link.target === "_blank" || link.hasAttribute("download")) {
            return false;
        }

        const href = link.getAttribute("href");
        if (!href || href.startsWith("#") || href.startsWith("mailto:") || href.startsWith("tel:")) {
            return false;
        }

        const url = new URL(link.href, window.location.href);
        return url.origin === window.location.origin && url.pathname !== window.location.pathname;
    }

    document.body.classList.add("page-transition-enabled");

    requestAnimationFrame(() => {
        document.body.classList.add("page-transition-in");
    });

    document.addEventListener("click", (event) => {
        const link = event.target.closest("a");

        if (
            isNavigating ||
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            !isInternalPageLink(link)
        ) {
            return;
        }

        event.preventDefault();
        isNavigating = true;

        document.body.classList.remove("page-transition-in");
        document.body.classList.add("page-transition-out");

        window.setTimeout(() => {
            window.location.href = link.href;
        }, transitionDuration);
    });

    window.addEventListener("pageshow", () => {
        isNavigating = false;
        document.body.classList.remove("page-transition-out");
        document.body.classList.add("page-transition-in");
    });
})();
