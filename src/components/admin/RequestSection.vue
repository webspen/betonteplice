<script setup lang="ts">
import { ref } from "vue"
import type { UserRequest } from "../../types"

interface Props {
    title: string
    requests: UserRequest[]
}

defineProps<Props>()

const expandedIndex = ref<number | null>(null)

const toggleDetails = (index: number) => {
    expandedIndex.value = expandedIndex.value === index ? null : index
}

const acceptRequest = (request: UserRequest) => {
    // Implement accept request logic here
    console.log("Accept request", request)
}

const rejectRequest = (request: UserRequest) => {
    // Implement reject request logic here
    console.log("Reject request", request)
}

const formatDate = (date: string) => new Date(date).toLocaleDateString()
const formatTime = (time: string | { hours: number; minutes: number }) => typeof time === "string" ? time : `${time.hours}:${time.minutes < 10 ? '0' : ''}${time.minutes}`
</script>

<template>
    <div v-if="requests.length" class="mb-6">
        <h2 class="text-xl font-semibold mb-2">{{ title }}</h2>
        <div v-for="(request, index) in requests" :key="index"
            class="mb-4 border p-4 rounded-lg bg-gray-100">
            <div class="flex justify-between">
                <div>
                    <p><strong>{{ request.subject.obchodniJmeno }}</strong> - {{
                        request.address.adresa }}, {{ request.address.mesto }}</p>
                    <p class="text-sm text-gray-600">Rezervace: {{
                        formatDate(request.reservation.date) }} v {{
                            formatTime(request.reservation.time) }}</p>
                </div>
                <div class="space-x-2">
                    <button @click="acceptRequest(request)"
                        class="bg-green-500 text-white py-1 px-3 rounded">Přijmout</button>
                    <button @click="rejectRequest(request)"
                        class="bg-red-500 text-white py-1 px-3 rounded">Zamítnout</button>
                </div>
            </div>

            <!-- Collapsible Details -->
            <div v-if="expandedIndex === index">
                <div class="mt-2">
                    <p><strong>Concrete Type:</strong> {{ request.configuration.typBetonu }}</p>
                    <p><strong>Details:</strong> {{ request.configuration.poznamka }}</p>
                    <p><strong>Responsible:</strong> {{ request.persons.responsible.jmeno }} - {{
                        request.persons.responsible.telefon }}</p>
                    <p><strong>Address:</strong> {{ request.address.adresa }}</p>
                    <p><strong>Note:</strong> {{ request.address.poznamka }}</p>
                </div>
            </div>

            <!-- Toggle Button for Collapse -->
            <button @click="toggleDetails(index)" class="mt-2 text-blue-500 text-sm">
                {{ expandedIndex === index ? "Méně" : "Více" }}
            </button>
        </div>
    </div>
</template>
