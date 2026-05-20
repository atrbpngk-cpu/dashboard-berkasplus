// ======================================================
// GLOBAL LOADING SMART FINAL
// js/loading.js
// ======================================================

window.USE_GLOBAL_LOADING = true;

const GlobalLoading = (() => {

    const el =
    document.getElementById(
        "globalLoading"
    );

    const textEl =
    document.getElementById(
        "globalLoadingText"
    );

    if(!el){

        console.warn(
            "[GlobalLoading] tidak ditemukan"
        );

        return {};
    }

    let counter = 0;

    let renderWait = false;

    // ==================================================
    // SHOW
    // ==================================================

    function show(
        text="Sedang memproses data..."
    ){

        counter++;

        if(textEl){

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

    // ==================================================
    // HIDE
    // ==================================================

    function hide(){

        counter =
        Math.max(
            0,
            counter-1
        );

        if(
            counter===0
            &&
            !renderWait
        ){

            el.classList.add(
                "hidden"
            );

            el.classList.remove(
                "flex"
            );

        }

    }

    // ==================================================
    // FORCE
    // ==================================================

    function forceHide(){

        counter=0;

        renderWait=false;

        el.classList.add(
            "hidden"
        );

        el.classList.remove(
            "flex"
        );

    }

    // ==================================================
    // WAIT DOM RENDER
    // ==================================================

    async function waitRender(){

        renderWait=true;

        await new Promise(
            r=>
            requestAnimationFrame(
                ()=>{

                    requestAnimationFrame(
                        r
                    );

                }
            )
        );

        renderWait=false;

        if(counter===0){

            forceHide();

        }

    }

    // ==================================================
    // TRACK PROMISE
    // ==================================================

    async function trackPromise(
        promise,
        text=
        "Sedang memproses data..."
    ){

        show(text);

        try{

            const result =
            await promise;

            await waitRender();

            return result;

        }

        finally{

            hide();

        }

    }

    // ==================================================
    // FETCH WRAPPER
    // TIDAK AUTO LOADING
    // ==================================================

    const originalFetch =
    window.fetch;

    window.fetch =
    (...args)=>
    originalFetch(
        ...args
    );

    return {

        show,

        hide,

        forceHide,

        waitRender,

        trackPromise
    };
})();
