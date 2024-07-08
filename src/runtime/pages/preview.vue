<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import { useRouter } from '#app'
import { defineAsyncComponent } from '#imports'

const router = useRouter()

const routes = router.options.routes

const filteredRoutes = routes.filter(route => route.name !== 'katzen-preview')

const selectedRoute = ref<RouteRecordRaw>({
  name: '',
  path: '',
})

const Route = ref<any>(undefined)

const hoverPosition = ref<HTMLElement | null>(null)
const routeWrapper = ref<HTMLElement | null>(null)

watch(selectedRoute, async () => {
  if (selectedRoute.value.path) {
    Route.value = await defineAsyncComponent(() => import(`~/pages/${selectedRoute.value.name}.vue`))
  }
})

onMounted(
  // add mutation observer to routeWrapper
  () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // add to each child a hover event
          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              console.log('node', node)
              node.addEventListener('mouseover', (event) => {
                console.log('mouseover', event)
                if (hoverPosition.value) {
                  const elementPositionAbsolute = node.getBoundingClientRect()
                  hoverPosition.value.style.top = `${elementPositionAbsolute.top}px`
                  hoverPosition.value.style.left = `${elementPositionAbsolute.left}px`
                  hoverPosition.value.style.width = `${elementPositionAbsolute.width}px`
                  hoverPosition.value.style.height = `${elementPositionAbsolute.height}px`
                }
              })
            }
          })
        }
      })
    })

    observer.observe(routeWrapper.value as Node, {
      childList: true,
      subtree: true,
    })
  },
)
</script>

<template>
  <div class="h-screen flex flex-row">
    <div class="w-52 h-full bg-slate-700 flex flex-col gap-5">
      <h2 class="text-white font-bold text-center p-4">
        Pages
      </h2>

      <div
        v-for="route in filteredRoutes"
        :key="route.path"
        class="p-4 bg-amber-50/10"
        @click="selectedRoute = route"
      >
        <p class="text-gray-100 opacity-50 uppercase text-sm">
          {{ route.path }}
        </p>
        <p class="text-white uppercase font-bold">
          {{ route.name }}
        </p>
      </div>
    </div>
    <div
      ref="routeWrapper"
      class="flex-1 bg-slate-50 overflow-y-scroll relative"
    >
      <component
        :is="Route"
        v-if="Route"
      />
    </div>
  </div>

  <!-- hover overlay -->
  <div class="absolute inset-0 opacity-50 z-10 select-none touch-none pointer-events-none">
    <div
      ref="hoverPosition"
      class="absolute z-20 bg-red-400/20 border-2 rounded border-red-500"
    />
  </div>
</template>

<style scoped>

</style>
