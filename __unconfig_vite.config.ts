
let __unconfig_data;
let __unconfig_stub = function (data = {}) { __unconfig_data = data };
__unconfig_stub.default = (data = {}) => { __unconfig_data = data };
import { defineConfig } from "vite"
import Vue from "@vitejs/plugin-vue"
import * as path from "path"

// https://vitejs.dev/config/
const __unconfig_default =  defineConfig({
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

if (typeof __unconfig_default === "function") __unconfig_default(...[{"command":"serve","mode":"development"}]);export default __unconfig_data;