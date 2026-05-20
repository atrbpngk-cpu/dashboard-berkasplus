// js/loading.js
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
        return {};
    }

    let active = false;

    let timer = null;

    // ==========================================
    // SHOW MANUAL ONLY
    // ==========================================

    function show(
        text=
        "Sedang memproses data..."
    ){

        clearTimeout(
            timer
        );

        active=true;

        textEl.textContent =
        text;

        el.classList.remove(
            "hidden"
        );

        el.classList.add(
            "flex"
        );

    }

    // ==========================================
    // HIDE
    // ==========================================

    function hide(){

        active=false;

        timer=
        setTimeout(()=>{

            if(active)
            return;

            el.classList.add(
                "hidden"
            );

            el.classList.remove(
                "flex"
            );

        },200);

    }

    // ==========================================
    // FORCE
    // ==========================================

    function forceHide(){

        active=false;

        clearTimeout(
            timer
        );

        el.classList.add(
            "hidden"
        );

        el.classList.remove(
            "flex"
        );

    }

    // ==========================================
    // TRACK PROMISE
    // ==========================================

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

    // ==========================================
    // WAIT DOM
    // ==========================================

    async function waitRender(){

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

    }

    // ==========================================
    // NONAKTIF AUTO FETCH
    // ==========================================

    window.fetch =
    window.fetch.bind(
        window
    );

    return {

        show,
        hide,
        forceHide,
        trackPromise,
        waitRender

    };

})();
