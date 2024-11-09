import { EmailMessage } from "cloudflare:email"
import { createMimeMessage } from "mimetext"

export interface Env {
    readonly DB: D1Database
    readonly SEB: SendEmail
}

export default {
    async fetch(req: Request, env: Env): Promise<Response> {
        const { pathname } = new URL(req.url)

        if (pathname.startsWith("/admin")) {
            const auth = req.headers.get("Authorization")
        } else if (pathname === "/calendar" && req.method === "GET") {
            const calendar = await env.DB
                .prepare("select date, status from calendar")
                .all()
            return Response.json(calendar)
        } else if (pathname === "/submit" && req.method === "POST") {
            const body = await req.json()
            const message = createMimeMessage()
            message.setSender({ name: "BetonTeplice.cz", addr: "noreply@betonteplice.cz"})
            message.setRecipient("pumpa@betonteplice.cz")
            message.setSubject("Objednávka betonu")
            message.addMessage({
                contentType: "text/plain",
                data: JSON.stringify(body),
            })

            const email = new EmailMessage(
                "noreply@betonteplice.cz",
                "pumpa@betonteplice.cz",
                message.asRaw()
            )

            try {
                await env.SEB.send(email)
            } catch (e) {
                return new Response("Internal server error", { status: 500, statusText: e.message })
            }
        } else {
            return new Response("Not found", { status: 404 })
        }
    }
} satisfies ExportedHandler
