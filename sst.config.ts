/// <reference path="./.sst/platform/config.d.ts" />

import { OrderEmailTemplateHtml, AdminEmailTemplateHtml } from "./src/email/templates"

export default $config({
    app(input) {
        return {
            name: "betonteplice",
            removal: input?.stage === "production" ? "retain" : "remove",
            home: "aws",
        }
    },
    async run() {
        const googleMapsKey = new sst.Secret("GoogleMapsKey")
        const aresApiUrl = new sst.Secret(
            "AresUrl",
            "https://ares.gov.cz/ekonomicke-subjekty-v-be/rest/ekonomicke-subjekty"
        )

        const email = new sst.aws.Email("Email", {
            sender: "betonteplice@gmail.com",
        })

        const orderFunction = new sst.aws.Function("Order", {
            handler: "./functions/customer.post",
            url: true,
        })

        const adminFunction = new sst.aws.Function("Admin", {
            handler: "./functions/admin/index.patch",
            url: true,
        })

        const orderEmail = new aws.ses.Template("OrderEmail", {
            html: OrderEmailTemplateHtml,
            name: "OrderEmail",
            subject: "{{title}}",
            text: "Chyba, prosím kontaktujte nás.",
        })

        const adminEmail = new aws.ses.Template("AdminEmail", {
            html: AdminEmailTemplateHtml,
            name: "AdminEmail",
            subject: "{{title}}",
            text: "Chyba při vytváření těla e-mailu.",
        })

        const frontend = new sst.aws.StaticSite("Frontend", {
            build: {
                command: "bun run build",
                output: "dist",
            },
            environment: {
                VITE_API_URL: orderFunction.url,
                VITE_ADMIN_API_URL: adminFunction.url,
                VITE_GOOGLE_MAPS_KEY: googleMapsKey.value,
                VITE_ARES_URL: aresApiUrl.value,
            },
        })

        return {
            frontend: frontend.url,
            email: {
                sender: email.sender,
                templates: [
                    orderEmail.name,
                    adminEmail.name,
                ],
            },
            functions: {
                customer: orderFunction.url,
                admin: adminFunction.url,
            },
        }
    },
})
