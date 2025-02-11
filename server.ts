// import calendar from "@googleapis/calendar"
import { handler as updateOrderStatusHandler } from "./src/functions/updateOrderStatus"
import { handler as createOrderHandler } from "./src/functions/createOrder"
import { handler as getOrdersHandler } from "./src/functions/getOrders"
import { handler as getOrderDatesHandler } from "./src/functions/getOrderDate"

const ALLOWED_ORIGIN = "*"

const corsHeaders = {
    "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Credentials": "true",
    "Access-Control-Max-Age": "86400",
}

export default {
    async fetch(req) {
        // calendar.calendar({
        //     version: "v3",
        //     auth: process.env.GOOGLE_API_KEY,
        // }).events.insert({
        //     requestBody: {
        //         summary: "Test event",
        //         description: "This is a test event",
        //         start: {
        //             dateTime: "2022-01-01T00:00:00Z",
        //             timeZone: "Europe/Prague",
        //         },
        //         end: {
        //             dateTime: "2022-01-01T01:00:00Z",
        //             timeZone: "Europe/Prague",
        //         }
        //     },
        // })

        // // Always add CORS headers to the response
        const headers = new Headers(corsHeaders)
        headers.set("Content-Type", "application/json")

        // Handle preflight requests
        if (req.method === "OPTIONS") {
            return new Response(null, {
                headers,
                status: 204,
            })
        }

        const url = new URL(req.url)

        try {
            // Create order
            if (url.pathname === "/api/orders" && req.method === "POST") {
                const response = await createOrderHandler({
                    body: await req.text(),
                    requestContext: {},
                    queryStringParameters: {},
                } as any)

                return new Response(response.body, {
                    status: response.statusCode,
                    headers
                })
            }

            // Get orders
            if (url.pathname === "/api/orders" && req.method === "GET") {
                const response = await getOrdersHandler({
                    queryStringParameters: Object.fromEntries(url.searchParams),
                    requestContext: {},
                } as any)

                return new Response(response.body, {
                    status: response.statusCode,
                    headers
                })
            }

            // Get order dates
            if (url.pathname === "/api/orders/dates" && req.method === "GET") {
                const response = await getOrderDatesHandler()

                return new Response(response.body, {
                    status: response.statusCode,
                    headers
                })
            }

            // Update order status
            if (url.pathname.match(/\/api\/orders\/\d+\/status/) && req.method === "PUT") {
                const orderId = url.pathname.split("/")[3]
                const response = await updateOrderStatusHandler({
                    pathParameters: { orderId },
                    body: await req.text(),
                    requestContext: {},
                } as any)

                return new Response(response.body, {
                    status: response.statusCode,
                    headers
                })
            }

            return new Response(JSON.stringify({ message: "Not Found" }), {
                status: 404,
                headers
            })
        } catch (error) {
            console.error("Server error:", error)
            return new Response(JSON.stringify({ message: "Internal Server Error" }), {
                status: 500,
                headers
            })
        }
    }
}
