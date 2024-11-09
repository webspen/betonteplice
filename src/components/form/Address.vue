<script setup lang="ts">
import { onMounted } from "vue"
import { useVModel } from "@vueuse/core"
// import { useScript } from "@unhead/vue"
import { Loader, } from "@googlemaps/js-api-loader"

const props = defineProps<{
    modelValue: Record<string, any>
}>()
const emit = defineEmits(["update:modelValue"])
const model = useVModel(props, "modelValue", emit)

// useScript({
//     src: `https://maps.googleapis.com/maps/api/js?key=${import.meta.env.VITE_GOOGLE_MAPS_KEY}&libraries=places`,
// })

const druhyAdresy = [
    { value: "existujici", label: "Existující adresa" },
    { value: "pozemek", label: "Stavba - Pozemek" },
]

onMounted(async () => {
    const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_MAPS_KEY,
        version: "weekly",
        language: "cs",
    })

    const Places = await loader.importLibrary("places")

    const input = document.querySelector("input[name=adresa]")

    console.log("[Google Maps] input", input)

    //this object will be our second arg for the new instance of the Places API
    const options = {
        //    types: ["establishment"],
        componentRestrictions: { country: "cz" }, //limiter for the places api search
        fields: ["address_components", "geometry", "icon", "name"], //allows the api to accept these inputs and return similar ones
        strictBounds: false, //optional
    }

    // per the Google docs create the new instance of the import above. I named it Places.
    const autocomplete = new Places.Autocomplete(input, options)

    console.log("[Google Maps] autocomplete", autocomplete) //optional log but will show you the available methods and properties of the new instance of Places.

    //add the place_changed listener to display results when inputs change
    autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace() //this callback is inherent you will see it if you logged autocomplete
        console.log("[Google Maps] change - place", place)
        place.address_components.forEach((component: any) => {
            console.log("[Google Maps] change - component", component)
            if (component.types.includes("postal_code")) {
                model.value.psc = component.long_name
            } else if (component.types.includes("locality")) {
                model.value.mesto = component.long_name
            } else if (component.types.includes("administrative_area_level_1")) {
                model.value.kraj = component.long_name
            }
        })
    })
})
</script>

<template>
    
</template>
