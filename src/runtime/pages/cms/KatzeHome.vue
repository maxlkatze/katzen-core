<script setup lang="ts">
import { definePageMeta, ref, useCookie, useRouter } from '#imports'

definePageMeta({
  layout: 'cms-layout',
})

const router = useRouter()
const userMenuOpen = ref(false)

const logout = () => {
  const tokenCookie = useCookie('token')
  tokenCookie.value = ''
  router.push('/katze-login')
}
</script>

<template>
  <div class="min-h-screen w-full flex flex-col justify-center items-center bg-amber-50">
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
          :class="userMenuOpen?['h-auto', 'pt-10', 'pb-2']:['border-transparent']"
        >
          <p
            class="text-red-400 drop-shadow hover:animate-pulse cursor-pointer"
            @click="logout"
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
          <NuxtLink
            class="flex flex-col items-center group/button cursor-zoom-in "
            to="/cms/edit/"
          >
            <div class="size-32 rounded border-black border-2 group-hover/button:animate-pulse p-4">
              <img
                src="../../assets/icons/edit.svg"
                class="size-full p-2 transition-all drop-shadow group-hover/button:scale-90"
                alt="Edit"
              >
            </div>
            <p class="font-bold uppercase font-mono leading-5">
              Edit Pages
            </p>
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
