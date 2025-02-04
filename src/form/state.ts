import { ref } from "vue"

export const form = ref({
    // Base fields
    id: undefined as string | undefined,
    status: undefined as string | undefined,
    created_at: undefined as string | undefined,
    updated_at: undefined as string | undefined,

    // Date and Time
    date: new Date().toISOString().split("T")[0] as string | undefined,
    time: "07:00" as string | undefined,

    // Customer Information
    customer_type: "pravnicka" as string,
    customer_name: undefined as string | undefined,
    customer_vat: false as boolean,
    customer_cid: undefined as string | undefined,
    customer_vat_number: undefined as string | undefined,
    customer_phone: undefined as string | undefined,
    customer_email: undefined as string | undefined,

    // Contact Information
    contact_name: undefined as string | undefined,
    contact_phone: undefined as string | undefined,
    contact_email: undefined as string | undefined,

    // Address Information
    address_type: "existing" as string,
    address_street: undefined as string | undefined,
    address_state: undefined as string | undefined,
    address_city: undefined as string | undefined,
    address_zip: undefined as string | undefined,
    address_country: "CZ" as string,
    address_note: undefined as string | undefined,

    // Configuration
    config: {
        type: undefined as string | undefined,
        thickness: 8 as number,
        quality: undefined as string | undefined,
        height: undefined as number | undefined,
        hose_length: undefined as number | undefined,
        description: undefined as string | undefined,
        volume_height: undefined as number | undefined,
    },
})
