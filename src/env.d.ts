/// <reference types="vite/client" />
/// <reference types="@formkit/vue" />

declare module '*.vue' {
    import type { DefineComponent } from 'vue'
    const component: DefineComponent<{}, {}, any>
    export default component
}

interface ImportMetaEnv {
    readonly VITE_API_URL: string
    // add other env variables here
}

interface ImportMeta {
    readonly env: ImportMetaEnv
} 