<script setup lang="ts">
import { useVModel } from "@vueuse/core"

const props = defineProps<{
    modelValue: Record<string, any>
}>()
const emit = defineEmits(["update:modelValue"])

const model = useVModel(props, "modelValue", emit)

const typyOsob = [
    { value: "fyzicka", label: "Fyzická osoba" },
    { value: "podnikatel", label: "Fyzická osoba podnikatel" },
    { value: "pravnicka", label: "Společnost" },
    { value: "baracnik", label: "Baráčník (osoba, která si staví vlastní rodinný dům)" },
]
</script>

<template>
    <FormKit type="group" v-model="model" name="subject">
        <FormKit type="select" name="typOsoby" v-model="model.typOsoby" label="Typ osoby"
            :options="typyOsob" required />
        <FormKit v-if="['podnikatel', 'pravnicka'].includes(model.typOsoby)" type="text" label="IČO" name="ico" min="8"
            max="8" validation="required|number" />
        <FormKit v-if="model.typOsoby !== 'baracnik'" type="checkbox" label="Plátce DPH" v-model="model.platceDph" />
        <FormKit v-if="(model.typOsoby !== 'baracnik') && model.platceDph" type="text" label="DIČ" name="dic" min="8" max="12" />
        <FormKit type="text" name="jmeno" v-model="model.jmeno"
            :label="model.typOsoby === 'pravnicka' ? 'Obchodní Jméno' : 'Jméno a Příjmení'"
            min="3" max="200" required />
    </FormKit>
</template>
