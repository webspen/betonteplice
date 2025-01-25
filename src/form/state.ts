import { reactive } from "vue"

export const form = reactive({
    date: new Date().toISOString().split("T")[0] as string | undefined, // date
    time: "07:00", // time

    value: {
        customer: {
            customer_type: "pravnicka" as string,
            customer_name: undefined as string | undefined,
            customer_vat: undefined as boolean | undefined,
            customer_cid: undefined as string | undefined,
            customer_vat_number: undefined as string | undefined,
        },

        contact: {
            customer_phone: undefined as string | undefined,
            customer_email: undefined as string | undefined,
            contact_name: undefined as string | undefined,
            contact_phone: undefined as string | undefined,
            contact_email: undefined as string | undefined,
        },

        address: {
            address_type: "existing" as string | undefined,
            address_street: undefined as string | undefined,
            address_state: undefined as string | undefined,
            address_city: undefined as string | undefined,
            address_zip: undefined as string | undefined,
            address_country: undefined as string | undefined,
            address_note: undefined as string | undefined,
        },

        config: {
            type: undefined as string | undefined,
            thickness: 8 as number | undefined,
            quality: undefined as string | undefined,
            height: undefined as string | undefined,
            hose_length: undefined as string | undefined,
            description: undefined as string | undefined,
        },
    },
})
