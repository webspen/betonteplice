import { createApp } from "vue"
import { createRouter, createWebHistory } from "vue-router"
import { plugin, defaultConfig } from "@formkit/vue"
import { cs } from "@formkit/i18n"
import { createMultiStepPlugin, createLocalStoragePlugin } from "@formkit/addons"
import { genesisIcons } from "@formkit/icons"
import { createHead } from "@unhead/vue"
import { rootClasses } from "./assets/formkit.theme"
import App from "./App.vue"
import "@formkit/addons/css/multistep"
import "@/assets/style.css"

const app = createApp(App)
app.use(createRouter({
    history: createWebHistory(),
    routes: [
        {
            path: "/",
            component: () => import("./home/View.vue"),
        }, {
            path: "/admin",
            component: () => import("./admin/View.vue"),
        }, {
            path: "/rezervace",
            component: () => import("./form/View.vue"),
        }, {
            path: "/obchodni-podminky",
            component: () => import("./Terms.vue"),
        }, {
            path: "/zpracovani-osobnich-udaju",
            component: () => import("./Privacy.vue"),
        },
    ]
}))
app.use(createHead())
app.use(plugin, defaultConfig({
    config: {
        rootClasses,
        icons: { ...genesisIcons },
        locales: { cs },
        locale: "cs",
    },
    plugins: [
        createMultiStepPlugin(),
        createLocalStoragePlugin({
            // plugin defaults:
            prefix: "form",
            key: undefined,
            control: undefined,
            maxAge: 3600000, // 1 hour
            debounce: 200,
            beforeSave: undefined,
            beforeLoad: undefined
        }),
    ],
}))
app.mount("#app")
