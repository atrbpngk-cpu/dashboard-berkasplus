// js/loading.js

window.USE_GLOBAL_LOADING = true;

const GlobalLoading = (() => {
    const el = document.getElementById(
        "globalLoading"
    );
    const textEl =
        document.getElementById(
            "globalLoadingText"
        );
    if (!el) {
        console.warn(
            "[GlobalLoading] #globalLoading tidak ditemukan"
        );
        return {};
    }
    let counter = 0;
    let pendingUserAction = false;
    let lastUserAction = 0;
    document.addEventListener(
        "click",
        (e) => {
            const target =
                e.target.closest(                   `
                    button,
                    a,
                    input[type=submit],
                    .btn,
                    [data-loading]
                    `
                );
            if (!target)
                return;
            pendingUserAction = true;
            lastUserAction =
                Date.now();
        },
        true
    );

    document.addEventListener(
        "submit",
        () => {
            pendingUserAction =
                true;
            lastUserAction =
                Date.now();
        },
        true
    );
    function consumeUserAction() {
        if (
            !pendingUserAction
        ) {
            return false;
        }
        pendingUserAction =
            false;
        return true;
    }

    function show(
        text =
        "Sedang memproses data..."
    ) {
        counter++;
        if (textEl) {
            textEl.textContent =
                text;
        }
        el.classList.remove(
            "hidden"
        );
        el.classList.add(
            "flex"
        );
    }

    function hide() {
        counter = Math.max(
            0,
            counter - 1
        );
        if (
            counter === 0
        ) {
            el.classList.add(
                "hidden"
            );
            el.classList.remove(
                "flex"
            );
        }
    }
    function forceHide() {
        counter = 0;
        el.classList.add(
            "hidden"
        );
        el.classList.remove(
            "flex"
        );
    }

    async function run(
        callback,
        text =
        "Sedang memproses data..."
    ) {
        show(text);
        try {
            return await callback();
        }
        finally {
            hide();
        }

    }
    const originalFetch =
        window.fetch;
    window.fetch =
        async (...args) => {
        const opt =
            args[1] || {};
        const headers =
            opt.headers || {};
        const silent =
            headers[
                "X-SILENT"
            ] === "1";
        const noLoading =
            headers[
                "X-NO-LOADING"
            ] === "1";
        const url =
            String(
                args[0] || ""
            ).toLowerCase();
        let action = "";
        try {
            const parsed =
                new URL(
                    url,
                    location.origin
                );
            action =
                (
                    parsed
                    .searchParams
                    .get(
                        "action"
                    ) || ""
                )
                .toLowerCase();
        }
        catch {
            action = "";
        }

        const ignoredActions = [
            "inbox",
            "inboxuser",
            "inboxboxuser",
            "inboxrekapseksi",
            "inboxbebanpu",
            "inboxpu"
        ];

        const ignoredRequest =
            ignoredActions.includes(
                action
            ) ||
            url.includes(
                "poll"
            ) ||
            url.includes(
                "heartbeat"
            ) ||
            url.includes(
                "socket"
            ) ||
            url.includes(
                "analytics"
            ) ||
            url.includes(
                "logger"
            );
        if (
            ignoredRequest ||
            silent ||
            noLoading
        ) {
            return originalFetch(
                ...args
            );
        }

        const useLoading =
            window
            .USE_GLOBAL_LOADING ===
            true &&
            consumeUserAction();
        if (
            useLoading
        ) {
            show();
        }
        try {
            return await originalFetch(
                ...args
            );
        }
        finally {
            if (
                useLoading
            ) {
                hide();
            }
        }
    };

    window.addEventListener(
        "pageshow",
        forceHide
    );
    window.addEventListener(
        "beforeunload",
        forceHide
    );

    return {
        show,
        hide,
        forceHide,
        run,
        get counter() {
            return counter;
        },
        get lastAction() {
            return lastUserAction;
        }
    };
})();
