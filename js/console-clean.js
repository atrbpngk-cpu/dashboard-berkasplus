// console-clean.js
if (!window.APP_CONFIG?.DEBUG) {
    console.log  = () => {};
    console.info = () => {};
    console.warn = () => {};
    console.debug = () => {};
  }