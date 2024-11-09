<template>
    <div class="container mx-auto py-8">
        <h2 class="text-2xl font-bold mb-6">Ceník Betonových Směsí</h2>
        <table class="min-w-full border-collapse border border-gray-300 overflow-x-auto">
            <thead>
                <tr class="bg-gray-100">
                    <th class="border border-gray-300 px-4 py-2 text-left">Třída pevnosti v tlaku
                    </th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Stupně vlivu prostředí
                        (Svp)</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Konzist.</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Kč/m³ bez DPH</th>
                    <th class="border border-gray-300 px-4 py-2 text-left">Kč/m³ s 21% DPH</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(item, index) in pricingData" :key="index">
                    <td class="border border-gray-300 px-4 py-2">{{ item.strengthClass }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.svp }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.consistency }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.priceWithoutVat }}</td>
                    <td class="border border-gray-300 px-4 py-2">{{ item.priceWithVat }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<script setup>
const pricingData = [
    { strengthClass: "C20/25", svp: "X0", consistency: "S3", priceWithoutVat: "3 090", priceWithVat: "3 739" },
    { strengthClass: "C20/25", svp: "X0 (T/90)", consistency: "S3", priceWithoutVat: "3 090", priceWithVat: "3 739" },
]
</script>
