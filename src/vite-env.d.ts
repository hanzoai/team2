/// <reference types="vite/client" />

// `@hanzo/font` publishes a stylesheet and no types for it, so a side-effect
// import of one is a compile error under `moduleResolution: bundler` — which
// the bundler resolves perfectly well. Declaring the module says what is true:
// importing it has an effect and no value.
declare module '*.css'
declare module '@hanzo/font/css'
