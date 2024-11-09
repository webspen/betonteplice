<script setup lang="ts">
import { computed } from "vue"
import { useVModel, useAsyncState } from "@vueuse/core"
import type { DatePickerMarker } from "@vuepic/vue-datepicker"
import DatePicker from "@vuepic/vue-datepicker"
import "@vuepic/vue-datepicker/dist/main.css"

const props = defineProps<{
    modelValue: Record<string, any>
}>()
const emit = defineEmits(["update:modelValue"])

const model = useVModel(props, "modelValue", emit)

const tomorrow = new Date()
tomorrow.setDate(tomorrow.getDate() + 1)
model.value = { date: tomorrow, time: { hours: 7, minutes: 0 } }

// const in30Days = new Date()
// in30Days.setDate(in30Days.getDate() + 30)

const disabledDates = useAsyncState<string[]>(async () => {
    await new Promise(resolve => setTimeout(resolve, 2000)) // Wait for 2 seconds
    return [
        "2024-09-29",
        "2024-10-06",
        "2024-10-10",
        "2024-10-13",
        "2024-10-16",
        "2024-10-17",
        "2024-10-18",
    ]
}, [])

const markers = computed<DatePickerMarker[]>(() => [
    {
        date: "2024-09-29",
        color: "red",
        type: "line",
        tooltip: [{ text: "Obsazeno", }],
    },
    {
        date: "2024-10-06",
        color: "red",
        type: "line",
        tooltip: [{ text: "Obsazeno" }],
    },
    {
        date: "2024-10-10",
        color: "red",
        type: "line",
        tooltip: [{ text: "Obsazeno" }],
    },
    {
        date: "2024-10-13",
        color: "red",
        type: "line",
        tooltip: [{ text: "Obsazeno" }],
    },
    {
        date: "2024-10-16",
        color: "red",
        type: "line",
        tooltip: [{ text: "Obsazeno" }],
    },
    {
        date: "2024-10-17",
        color: "red",
        type: "line",
        tooltip: [{ text: "Obsazeno" }],
    },
    {
        date: "2024-10-18",
        color: "red",
        type: "line",
        tooltip: [{ text: "Obsazeno" }],
    },
])
</script>

<template>
    <FormKit type="group" v-model="model" name="reservation">
        <label for="date"
            class="block text-lg mb-2.5 font-medium text-gray-700 dark:text-gray-300">Datum&nbsp;rezervace</label>
        <DatePicker v-if="!model.dohoda" id="date" v-model="model.date" dark inline
            :enableTimePicker="false" :minDate="tomorrow" :disabledDates="disabledDates.state.value"
            :disabledWeekDays="[0, 6]" :markers="markers" class="mb-5 mx-auto" required locale="cs"
            autoApply :loading="disabledDates.isLoading.value" preventMinMaxNavigation
            disableYearSelect />
        <label for="time"
            class="block text-lg mb-2.5 font-medium text-gray-700 dark:text-gray-300">Čas
            příjezdu (v kolik máme přijet)</label>
        <DatePicker id="time" v-model="model.time" inline timePicker dark
            :minTime="{ hours: 6, minutes: 0 }"
            :maxTime="{ hours: 14, minutes: 15 }" required class="mb-5 mx-auto" autoApply
            :minutesIncrement="15" :minutesGridIncrement="15" preventMinMaxNavigation />
        <p class="text-sm text-gray-400">Rezervace je možná pouze od 7:00 do 14:00</p>
    </FormKit>
</template>

<style>
:root {
    --dp-font-family: "Inter", sans-serif;
    --dp-menu-padding: 1rem;
    --dp-menu-min-width: 20rem;
    --dp-font-size: 1.25rem;
    --dp-time-font-size: 3rem;
    --dp-cell-size: 2.5rem;
    --dp-border-radius: 0.75rem;
    --dp-cell-border-radius: 0.75rem;
}

.dp__theme_dark {
    --dp-primary-color: #9a7d0d;
    --dp-background-color: #18181B;
}
</style>
