import { Config } from "tailwindcss"
// @ts-ignore
import { default as typography } from "@tailwindcss/typography"

export default {
    content: [
        "./index.html",
        "./src/**/*.{vue,js,ts}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: "#facc16",
                    '50': '#fefce8',
                    '100': '#fef9c3',
                    '200': '#fef08a',
                    '300': '#fde047',
                    '400': '#facc16',
                    '500': '#eab308',
                    '600': '#ca8a04',
                    '700': '#a16207',
                    '800': '#854d0e',
                    '900': '#713f12',
                    '950': '#422006',
                },
            },
        },
    },
    plugins: [
        typography,
    ],
} as Config
