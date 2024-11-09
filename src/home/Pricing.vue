<script setup>
const pricingData = [
    { service: "Přistavení pumpy na stavbu do vzdálenosti 25 km (25 metrům hadic v ceně)", price: "3750,- Kč" },
    { service: "Každá započatá hodina na stavbě od příjezdu až po odjezd pumpy", price: "1600,- Kč" },
    { service: "Doprava nad 25 Km", price: "25,- Kč/km" },
    { service: "Běžný metr hadic nad 25 m", price: "75,- Kč/m" },
    { service: "Umytí stroje mimo stavbu", price: "3500,- Kč" },
    { service: "Zmařený výjezd, storno poplatek - zrušení rezervace v předchozí den po 10:00 h dopoledne", price: "3750,- Kč" }
]
</script>

<template>
    <section id="cenik" class="container mx-auto py-8">
        <h2 class="text-2xl font-bold mb-6">Ceník</h2>
        <table class="min-w-full border-collapse border border-gray-300">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-4 py-2 text-left">Služba</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Cena</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in pricingData" :key="index">
                    <td class="border border-gray-300 px-4 py-2">{{ item.service }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.price }}</td>
                </tr>
            </tbody>
        </table>
    </section>
</template>
