import { ref, reactive } from "vue"

export const form = reactive({
    // id
    // status
    // created_at
    // updated_at

    date: new Date().toISOString().split("T")[0]  as string | undefined, // date
    time: "07:00", // time

    customer_type: "pravnicka" as string,
    customer_name: undefined as string | undefined,
    customer_vat: undefined as boolean | undefined,
    customer_cid: undefined as string | undefined,
    customer_vat_number: undefined as string | undefined,

    customer_phone: undefined as string | undefined,
    customer_email: undefined as string | undefined,

    contact_name: undefined as string | undefined,
    contact_phone: undefined as string | undefined,
    contact_email: undefined as string | undefined,

    address_type: undefined as string | undefined,
    address_street: undefined as string | undefined,
    address_city: undefined as string | undefined,
    address_zip: undefined as string | undefined,
    address_country: undefined as string | undefined,
    address_note: undefined as string | undefined,

    config: {
        typBetonu: undefined as string | undefined,
        tloustkaKameniva: 8 as number | undefined,
        kvalita: undefined as string | undefined,
        vyska: undefined as string | undefined,
        poznamka: undefined as string | undefined,
    },
})

export const metadata = reactive({
    contactSameAsResponsible: true,
    confirmation: false,
    remember: false,
})

export const step = ref<number>(1)
