/// <reference types="vite/client" />

export interface ImportMetaEnv {
    readonly VITE_GOOGLE_MAPS_KEY: string
    readonly VITE_API_URL: string
    readonly VITE_ADMIN_API_URL: string
}

export interface ImportMeta {
    readonly env: ImportMetaEnv
}
