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
    
</template>
