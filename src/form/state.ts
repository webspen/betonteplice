import { ref, reactive } from "vue"
import { useAsyncState } from "@vueuse/core"

export const form = reactive({
    // id
    // status
    // created_at
    // updated_at

    date: null as string | null, // date
    time: "07:00", // time

    customer_type: null as string | null,
    customer_name: null as string | null,
    customer_vat: null as boolean | null,
    customer_cid: null as string | null,
    customer_vat_number: null as string | null,

    customer_phone: null as string | null,
    customer_email: null as string | null,

    contact_name: null as string | null,
    contact_phone: null as string | null,
    contact_email: null as string | null,

    address_type: null as string | null,
    address_street: null as string | null,
    address_city: null as string | null,
    address_zip: null as string | null,
    address_country: null as string | null,
    address_note: null as string | null,

    config: {
        typBetonu: null as string | null,
        tloustkaKameniva: 8 as number | null,
        kvalita: null as string | null,
        vyska: null as string | null,
        poznamka: null as string | null,
    },
})

export const metadata = reactive({
    contactSameAsResponsible: true,
    confirmation: false,
    remember: false,
})

export const step = ref<number>(1)
