<script setup lang="ts">
import { ref, defineProps } from 'vue'
import type { Route } from '../../../types/EditTypes'
import { computed, watch } from '#imports'
import { useRouter } from '#app'

// COMPOSABLE
const router = useRouter()

// PROPS & EMITS
const props = defineProps(
  {
    isMobile: Boolean,
    selectedRoute: {
      type: Object as () => Route,
      required: true,
    },
  },
)
defineEmits(['selectRoute'])

// VARIABLES
const isSidebarOpen = ref(false) // for mobile devices
const routes = router.options.routes

// COMPUTED
const isRouteSelected = computed(() => props.selectedRoute.path !== '')
const filteredRoutes = computed((): Route[] => {
  const filteredRoutes = routes.filter(route => (!route.name?.toString().startsWith('katze-cms')))
  return filteredRoutes.map(route => ({
    name: route.name?.toString() || route.path,
    path: route.path,
    component: route.component,
  }))
})

// WATCHERS
watch(() => props.selectedRoute, () => {
  if (isSidebarOpen.value) {
    isSidebarOpen.value = false
  }
})
</script>

<template>
  <div
    v-if="isMobile && !isSidebarOpen && isRouteSelected"
    class="fixed top-0 left-0 z-50 bg-amber-50 w-12 h-12 flex flex-row items-center justify-center border-2 border-black rounded-br-xl"
  >
    <img
      src="../../../assets/icons/edit.svg"
      class="size-6 cursor-pointer"
      alt="menu"
      @click="isSidebarOpen = true"
    >
  </div>

  <div
    class="w-full h-full bg-amber-50 flex flex-col"
    :class="{ '!w-52': (isRouteSelected && !isMobile) || (isRouteSelected && isMobile && isSidebarOpen),
              '!w-0': isRouteSelected && isMobile && !isSidebarOpen,
              'fixed top-0 left-0 h-full z-40 overflow-hidden': isMobile }"
  >
    <div class="flex flex-row justify-center items-center">
      <NuxtLink
        class="flex flex-row gap-2 justify-center p-2 m-4 border-black border-2 rounded hover:drop-shadow cursor-pointer transition-all"
        :class="isMobile?'w-full':''"
        to="/cms/"
      >
        <img
          src="../../../assets/icons/back_arrow.svg"
          class="size-6"
          alt="arrow_back"
        >
        <p
          v-if="!isMobile"
          class="font-mono font-bold uppercase"
        >
          Back to Menu
        </p>
      </NuxtLink>
      <div
        v-if="isMobile && isRouteSelected"
        class="p-2 m-4 ml-0 border-black border-2 rounded hover:drop-shadow cursor-pointer transition-all flex justify-center items-center"
        @click="isSidebarOpen = false"
      >
        <img
          src="../../../assets/icons/close.svg"
          class="size-6"
          alt="close"
        >
      </div>
    </div>

    <div class="flex flex-col items-center justify-center">
      <h2 class="font-mono text-xl uppercase font-bold m-0 p-0">
        Edit Pages
      </h2>
    </div>
    <!--  grid when no route is selected -->
    <div
      class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-10 flex-col gap-2 h-full my-2 overflow-y-auto w-full items-start justify-start px-2"
      :class="[isRouteSelected ? '!flex' : '[&>*]:max-w-96']"
    >
      <div
        v-for="route in filteredRoutes"
        :key="route.path"
        class="w-full px-2 py-1 border-black border-2 rounded hover:bg-black/10 hover:animate-pulse cursor-pointer"
        :class="{ 'border-purple-400': selectedRoute.path === route.path }"
        @click="$emit('selectRoute', route)"
      >
        <p class="text-black opacity-50 uppercase text-sm font-mono">
          {{ route.path }}
        </p>
        <p class="text-black uppercase font-bold font-mono">
          {{ route.name }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
