<script setup lang="ts">
import { ref } from '#imports'

const userMenuOpen = ref(false)

defineEmits(['logout', 'openEditPage'])
</script>

<template>
  <div class="flex flex-col h-screen w-full">
    <div class="flex flex-row w-full relative">
      <img
        src="../../assets/icons/person_settings.svg"
        class="size-10 p-2 transition-all drop-shadow cursor-alias relative z-40"
        alt="CMS-Katze"
        @click="userMenuOpen = !userMenuOpen"
      >

      <div

        class="absolute w-52 border-black border-b-2 border-r-2 rounded-br-xl flex flex-col gap-5 font-mono h-0 overflow-hidden transition-all duration-300 z-10"
        :class="{ 'h-auto': userMenuOpen, 'pt-10': userMenuOpen, 'pb-2': userMenuOpen, 'border-transparent': !userMenuOpen }"
      >
        <p
          class="text-red-400 drop-shadow hover:animate-pulse cursor-pointer"
          @click="$emit('logout')"
        >
          Logout
        </p>
      </div>
    </div>
    <div class="flex flex-col items-center justify-center h-full">
      <img
        src="../../assets/logo.svg"
        class="h-60"
        alt="CMS-Katze"
      >

      <div class="flex flex-row gap-5">
        <div
          class="flex flex-col items-center group/button cursor-zoom-in "
          @click="$emit('openEditPage')"
        >
          <div class="size-32 rounded border-black border-2 group-hover/button:animate-pulse p-4">
            <img
              src="../../assets/icons/edit.svg"
              class="size-full p-2 transition-all drop-shadow group-hover/button:scale-90"
              alt="CMS-Katze"
            >
          </div>
          <p class="font-bold uppercase font-mono leading-5">
            Edit Pages
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
