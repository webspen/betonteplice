<script setup lang="ts">
import { ref, computed } from "vue"
import RequestSection from "../components/admin/RequestSection.vue"
import type { UserRequest } from "../types"
import fakeData from "../assets/fake_data.json"
import { useAsyncState } from "@vueuse/core"
import DatePicker from "@vuepic/vue-datepicker"
import "@vuepic/vue-datepicker/dist/main.css"

// Sample data (you can replace with real data)
// const requests = useAsyncState<UserRequest[]>(async () => {
//     // await new Promise(resolve => setTimeout(resolve, 1000))3 // Wait for 2 seconds
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
    <h2 class="text-center font-semibold text-3xl my-5">Admin</h2>
    <section class="m-5 border border-secondary-200 rounded-md p-5 max-w-screen-lg mx-auto flex flex-col lg:flex-row gap-5">
        <div class="p-5">
            <label for="date" class="block text-lg mb-2.5 font-medium text-gray-700">
                Kalendář rezervací
            </label>
            <DatePicker id="date" dark inline :enableTimePicker="false" :disabledWeekDays="[0, 6]"
                class="mb-5 mx-auto" required locale="cs" autoApply
                :loading="requests.isLoading.value" preventMinMaxNavigation disableYearSelect />
        </div>
        <div class="p-5">
            <label for="metrics" class="block text-lg mb-2.5 font-medium text-gray-700">
                Metriky
            </label>
            <dl id="metrics" class="grid grid-cols-2 gap-2.5">
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
    <section class="m-5 border border-secondary-200 rounded-md p-5 max-w-screen-lg mx-auto">
        <div class="p-6">
            <h1 class="text-2xl font-bold mb-4">Správa poptávek</h1>

            <RequestSection title="Čekající" :requests="waitingRequests" />
            <RequestSection title="Přijaté" :requests="acceptedRequests" />
            <RequestSection title="Zamítnuté" :requests="rejectedRequests" />
            <RequestSection title="Zrušené klientem" :requests="canceledRequests" />
        </div>
    </section>
</template>
