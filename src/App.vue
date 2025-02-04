<script setup lang="ts">
import { RouterView, useRoute } from "vue-router";
import { ref } from "vue";
import { Menu } from "lucide-vue-next";
import logo from "@/assets/logo.png";

const route = useRoute();
const isMenuOpen = ref(false);
const toggleMenu = () => (isMenuOpen.value = !isMenuOpen.value);
</script>

<template>
  <header class="bg-zinc-800 p-4 h-16 text-zinc-100">
    <div class="flex justify-between items-center mx-auto container">
      <RouterLink to="/">
        <img :src="logo" alt="Beton Teplice" class="h-10" />
      </RouterLink>
      <button @click="toggleMenu" class="lg:hidden">
        <Menu />
      </button>
      <nav
        :class="{ hidden: !isMenuOpen }"
        class="lg:block lg:relative absolute"
      >
        <ul
          class="flex lg:flex-row flex-col lg:space-x-4 space-y-2 lg:space-y-0"
        >
          <li><a href="/#sluzby" class="hover:text-yellow-400">Služby</a></li>
          <li>
            <a href="/rezervace" class="hover:text-yellow-400">Poptávka</a>
          </li>
          <li><a href="/#cenik" class="hover:text-yellow-400">Ceník</a></li>
          <li>
            <a href="/obchodni-podminky" class="hover:text-yellow-400"
              >Obchodní&nbsp;podmínky</a
            >
          </li>
        </ul>
      </nav>
    </div>
  </header>
  <main class="bg-white min-h-[calc(100vh-4rem)] text-black">
    <RouterView :key="route.fullPath" />
  </main>
  <footer class="bg-white dark:bg-zinc-800 p-4 md:p-8 lg:p-10">
    <div class="mx-auto max-w-screen-xl text-center">
      <a
        href="#"
        class="flex justify-center items-center font-semibold text-2xl text-zinc-900 dark:text-white"
      >
        <img :src="logo" />
      </a>
      <p class="my-6 text-zinc-500 dark:text-zinc-400"></p>
      <ul
        class="flex flex-wrap justify-center items-center mb-6 text-zinc-900 dark:text-white"
      >
        <li>
          <a href="/obchodni-podminky" class="mr-4 md:mr-6 hover:underline"
            >Obchodní Podmínky</a
          >
        </li>
        <li>
          <a
            href="/zpracovani-osobnich-udaju"
            class="mr-4 md:mr-6 hover:underline"
            >Zásady Zpracování Osobních Údajů</a
          >
        </li>
      </ul>
      <span class="text-sm text-zinc-500 sm:text-center dark:text-zinc-400"
        >&copy; 2016-{{ new Date().getFullYear() }}
        <a href="/" class="hover:underline">Beton Teplice s.r.o.</a>. Všechna
        práva vyhrazena.</span
      >
    </div>
  </footer>
</template>
