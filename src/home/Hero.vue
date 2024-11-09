<script setup lang="ts">
import home2 from "../assets/landing.png"
import home3 from "../assets/home_3.jpg"
</script>

<template>
    <section id="sluzby" class="bg-white dark:bg-zinc-900">
        <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 lg:px-6">
            <div class="text-center text-zinc-900">
                <h3 class="mb-8 text-3xl text-zinc-200">
                    Pokud si přejete přistavit betonovou pumpu
                </h3>
                <a href="/rezervace" :class="[
                    'inline-flex items-center text-lg font-medium',
                    'text-primary-600 hover:text-primary-800 dark:text-primary-500 dark:hover:text-primary-700',
                    'border border-primary-600 hover:border-primary-800 dark:border-primary-500 dark:hover:border-primary-700',
                    'px-5 py-2.5 rounded-md',
                ]">
                    Vytvořte poptávku zde
                    <svg class="ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20"
                        xmlns="http://www.w3.org/2000/svg">
                        <path fill-rule="evenodd"
                            d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                            clip-rule="evenodd"></path>
                    </svg>
                </a>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 my-12 lg:my-24 justify-stretch space-x-8">
                <div class="flex mb-2 md:flex-col md:mb-0 h-128">
                    <div class="mr-4 w-auto h-36 md:w-full md:h-full rounded-lg flex bg-white">
                        <img class="w-full my-auto rounded-lg transform scale-x-[-1]" :src="home3"
                            alt="Ilustrace" />
                    </div>
                    <div>
                        <h3 class="text-xl font-bold md:mt-4 mb-2.5 text-zinc-900 dark:text-white">
                            Dovoz betonových směsí
                        </h3>
                        <p class="text-zinc-500 dark:text-zinc-400">
                            Dovoz betonových směsí dle výběru zákazníka
                        </p>
                    </div>
                </div>
                <div class="col-span-2 flex mb-2 md:flex-col md:mb-0 h-128">
                    <div class="mr-4 w-auto h-36 md:w-full md:h-full rounded-lg flex bg-white">
                        <img class="w-full my-auto" :src="home2" alt="Ilustrace" />
                    </div>
                    <div>
                        <h3 class="text-xl font-bold md:mt-4 mb-2.5 text-zinc-900 dark:text-white">
                            Ušetříte čas i peníze
                        </h3>
                        <p class="text-zinc-500 dark:text-zinc-400">
                            Ušetříte spoustu dřiny, peněz i času
                        </p>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>
