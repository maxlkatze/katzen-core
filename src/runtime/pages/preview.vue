<script setup lang="ts">
import type { RouteRecordRaw } from 'vue-router'
import { useRouter } from '#app'
import { defineAsyncComponent } from '#imports'

const router = useRouter()

const routes = router.options.routes

const filteredRoutes = routes.filter(route => (route.name !== 'katzen-preview' && route.name !== 'katzen-cms-login'))

const selectedRoute = ref<RouteRecordRaw>({
  name: '',
  path: '',
})

const Route = ref<any>(undefined)

const hoverPosition = ref<HTMLElement | null>(null)
const routeWrapper = ref<HTMLElement | null>(null)
const selectMenu = ref<HTMLElement | null>(null)

const hoveredElement = ref<HTMLElement | null>(null)
const selectedElement = ref<HTMLElement | null>(null)

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
          // find all elements
          const elements = routeWrapper.value?.querySelectorAll('*[kat-e]')

          if (elements) {
            elements.forEach((element: HTMLElement) => {
              element.addEventListener('mouseover', () => {
                hoveredElement.value = element
              })
              element.addEventListener('mouseleave', () => {
                hoveredElement.value = null
              })
              element.addEventListener('click', (event) => {
                selectedElement.value = element
                event.stopPropagation();
                event.preventDefault();
              })
            })
          }
        }
      })
    })

    observer.observe(routeWrapper.value as Node, {
      childList: true,
      subtree: true,
    })
  },
)

watch(hoveredElement, () => {
  if (hoverPosition.value && hoveredElement.value) {
    const elementPositionAbsolute = hoveredElement.value.getBoundingClientRect()
    hoverPosition.value.style.top = `${elementPositionAbsolute.top}px`
    hoverPosition.value.style.left = `${elementPositionAbsolute.left}px`
    hoverPosition.value.style.width = `${elementPositionAbsolute.width}px`
    hoverPosition.value.style.height = `${elementPositionAbsolute.height}px`
  }
  else if (!hoveredElement.value) {
    hoverPosition.value.style = ''
  }
})

watch(selectedElement, () => {
  if (selectedElement.value && selectMenu.value) {
    const calculatedPixel = 2 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    selectMenu.value.style.top = `${selectedElement.value.getBoundingClientRect().top - calculatedPixel}px`
    selectMenu.value.style.left = `${selectedElement.value.getBoundingClientRect().left}px`
  }
  else {
    selectMenu.value.style = ''
  }
})


const logout = () => {
  const tokenCookie = useCookie('token')
  tokenCookie.value = '';
  router.push('/preview-login')
}
</script>

<template>
  <div class="h-screen flex flex-row">
    <div class="w-52 h-full bg-slate-700 flex flex-col gap-5">
      <p @click="logout">Logout</p>
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
      class="absolute z-20 -top-full -left-full bg-red-400/20 border-2 rounded border-red-500"
    />
  </div>

  <!-- selected overlay -->
  <div class="absolute inset-0 opacity-50 z-10 select-none touch-none pointer-events-none">
    <div
      ref="selectMenu"
      class="absolute z-20 -top-full -left-full flex flex-row h-8 cursor-pointer pointer-events-auto"
    >
      <span>EDIT</span>
      <span @click.prevent="selectedElement=undefined;">CLOSE</span>
    </div>
  </div>
</template>

<style scoped>

</style>
