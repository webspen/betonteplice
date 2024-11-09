<script setup lang="ts">
import { RouterView } from "vue-router"
import { ref } from "vue"
import { Menu } from "lucide-vue-next"
import logo from "@/assets/logo.png"

const isMenuOpen = ref(false)
const toggleMenu = () => isMenuOpen.value = !isMenuOpen.value
</script>

<template>
    <header class="h-16 bg-zinc-800 text-zinc-100 p-4">
        <div class="container mx-auto flex justify-between items-center">
            <RouterLink to="/">
                <!-- <h1 class="text-2xl font-bold">BETON <span class="text-yellow-400">TEPLICE</span>
                </h1> -->
                <img :src="logo" alt="Beton Teplice" class="h-10" />
            </RouterLink>
            <button @click="toggleMenu" class="lg:hidden">
                <Menu />
            </button>
            <nav :class="{ 'hidden': !isMenuOpen }" class="lg:block absolute lg:relative">
                <ul class="flex flex-col lg:flex-row space-y-2 lg:space-y-0 lg:space-x-4">
                    <li><a href="/#sluzby" class="hover:text-yellow-400">Služby</a></li>
                    <li><a href="/rezervace" class="hover:text-yellow-400">Poptávka</a></li>
                    <li><a href="/#cenik" class="hover:text-yellow-400">Ceník</a></li>
                    <li><a href="/obchodni-podminky"
                            class="hover:text-yellow-400">Obchodní&nbsp;podmínky</a></li>
                </ul>
            </nav>
        </div>
    </header>
    <main class="min-h-[calc(100vh-4rem)] bg-white text-black">
        <RouterView />
    </main>
    <footer class="p-4 bg-white md:p-8 lg:p-10 dark:bg-zinc-800">
        <div class="mx-auto max-w-screen-xl text-center">
            <a href="#"
                class="flex justify-center items-center text-2xl font-semibold text-zinc-900 dark:text-white">
                <img :src="logo" />
            </a>
            <p class="my-6 text-zinc-500 dark:text-zinc-400"></p>
            <ul
                class="flex flex-wrap justify-center items-center mb-6 text-zinc-900 dark:text-white">
                <li>
                    <a href="/obchodni-podminky" class="mr-4 hover:underline md:mr-6">Obchodní Podmínky</a>
                </li>
                <li>
                    <a href="/zpracovani-osobnich-udaju" class="mr-4 hover:underline md:mr-6">Zásady Zpracování Osobních Údajů</a>
                </li>
            </ul>
            <span class="text-sm text-zinc-500 sm:text-center dark:text-zinc-400">&copy; 2016-{{ new Date().getFullYear() }} <a
                    href="/" class="hover:underline">Beton Teplice s.r.o.</a>. Všechna práva vyhrazena.</span>
        </div>
    </footer>
</template>
