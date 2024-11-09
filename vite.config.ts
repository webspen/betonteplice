import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import * as path from "path"

// https://vitejs.dev/config/
export default defineConfig({
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "src"),
        },
    },
    server: {
        host: true,
        port: 4001,
    },
    plugins: [
        Vue(),
    ],
})
