function initializeHeaderEffects() {
    const header = document.querySelector(".kh-header");

    if (!header || header.dataset.fxInitialized === "true") return;

    header.dataset.fxInitialized = "true";

    header.addEventListener("pointermove", (event) => {
        if (event.pointerType !== "mouse") return;

        const rect = header.getBoundingClientRect();

        header.style.setProperty("--mx", `${event.clientX - rect.left}px`);
        header.style.setProperty("--my", `${event.clientY - rect.top}px`);
        header.style.setProperty("--kh-lit", "1");
    });

    header.addEventListener("pointerleave", () => {
        header.style.setProperty("--kh-lit", "0");
    });
}

function startHeaderEffects() {
    initializeHeaderEffects();
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startHeaderEffects, { once: true });
} else {
    startHeaderEffects();
}

const headerObserver = new MutationObserver(startHeaderEffects);

headerObserver.observe(document.documentElement, {
    childList: true,
    subtree: true
});
