<script setup lang="ts">
import { useVModel } from "@vueuse/core"
const props = defineProps<{
    modelValue: Record<string, any>
}>()
const emit = defineEmits(["update:modelValue"])
const model = useVModel(props, "modelValue", emit)

const druhyBetonu = [
    { value: "vlastni", label: "Vlastní" },
    { value: "betonTeplice", label: "Potřebuji beton dodat - Teplice" },
    { value: "betonMimo", label: "Potřebuji beton dodat - mimo Teplice" },
]
</script>

<template>
    
</template>
