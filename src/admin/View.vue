<script setup lang="ts">
import { ref, computed } from "vue"
import RequestSection from "../components/admin/RequestSection.vue"
import type { UserRequest } from "../types"
import { useAsyncState } from "@vueuse/core"
import DatePicker from "@vuepic/vue-datepicker"
import "@vuepic/vue-datepicker/dist/main.css"

// Sample data (you can replace with real data)
// const requests = useAsyncState<UserRequest[]>(async () => {
//     // await new Promise(resolve => setTimeout(resolve, 1000)) // Wait for 2 seconds
//     return fakeData.requests
// }, [])

const requests = {
    state: ref(fakeData),
    isLoading: ref(false),
}

const waitingRequests = computed(() => requests.state.value.filter(req => req.status === "pending"))
const acceptedRequests = computed(() => requests.state.value.filter(req => req.status === "accepted"))
const rejectedRequests = computed(() => requests.state.value.filter(req => req.status === "rejected"))
const canceledRequests = computed(() => requests.state.value.filter(req => req.status === "cancelled"))

</script>

<template>
    <h2 class="my-5 font-semibold text-3xl text-center">Admin</h2>
    <section class="flex lg:flex-row flex-col gap-5 border-secondary-200 m-5 mx-auto p-5 border rounded-md max-w-screen-lg">
        <div class="p-5">
            <label for="date" class="block mb-2.5 font-medium text-gray-700 text-lg">
                Kalendář rezervací
            </label>
            <DatePicker id="date" dark inline :enableTimePicker="false" :disabledWeekDays="[0, 6]"
                class="mx-auto mb-5" required locale="cs" autoApply
                :loading="requests.isLoading.value" preventMinMaxNavigation disableYearSelect />
        </div>
        <div class="p-5">
            <label for="metrics" class="block mb-2.5 font-medium text-gray-700 text-lg">
                Metriky
            </label>
            <dl id="metrics" class="gap-2.5 grid grid-cols-2">
                <dt>Pocet celkem:</dt>
                <dd>{{ requests.state.value.length }}</dd>
                <dt>Pocet prijatych:</dt>
                <dd>{{ acceptedRequests.length }}</dd>
                <dt>Pocet zrusenych: </dt>
                <dd>{{ canceledRequests.length }}</dd>
                <dt>Pocet cekajicich: </dt>
                <dd>{{ waitingRequests.length }}</dd>
                <dt>Pocet zamitnutych: </dt>
                <dd>{{ rejectedRequests.length }}</dd>
            </dl>
        </div>
    </section>
    <section class="border-secondary-200 m-5 mx-auto p-5 border rounded-md max-w-screen-lg">
        <div class="p-6">
            <h1 class="mb-4 font-bold text-2xl">Správa poptávek</h1>

            <RequestSection title="Čekající" :requests="waitingRequests" />
            <RequestSection title="Přijaté" :requests="acceptedRequests" />
            <RequestSection title="Zamítnuté" :requests="rejectedRequests" />
            <RequestSection title="Zrušené klientem" :requests="canceledRequests" />
        </div>
    </section>
</template>
