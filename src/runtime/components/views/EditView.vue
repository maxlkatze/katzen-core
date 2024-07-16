<script setup lang="ts">
import { useRouter } from '#app'
import { computed, defineAsyncComponent, onMounted, ref, shallowRef, useCookie, watch } from '#imports'

const router = useRouter()
const routes = router.options.routes
const filteredRoutes = computed((): Route[] => {
  const filteredRoutes = routes.filter(route => (route.name !== 'katze-cms' && route.name !== 'katze-cms-login'))
  return filteredRoutes.map(route => ({
    name: route.name?.toString() || route.path,
    path: route.path,
  }))
})

interface Route {
  name: string
  path: string
}

const selectedRoute = ref<Route>({
  name: '',
  path: '',
})

const Route = shallowRef<unknown>(undefined)

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
            elements.forEach((element: Element) => {
              if (!(element instanceof HTMLElement)) {
                return
              }
              element.addEventListener('mouseover', () => {
                hoveredElement.value = element
              })
              element.addEventListener('mouseleave', () => {
                hoveredElement.value = null
              })
              element.addEventListener('click', (event) => {
                selectedElement.value = element
                event.stopPropagation()
                event.preventDefault()
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
  else if (!hoveredElement.value && hoverPosition.value) {
    hoverPosition.value.removeAttribute('style')
  }
})

watch(selectedElement, () => {
  if (selectedElement.value && selectMenu.value) {
    const calculatedPixel = 2 * Number.parseFloat(getComputedStyle(document.documentElement).fontSize)
    selectMenu.value.style.top = `${selectedElement.value.getBoundingClientRect().top - calculatedPixel}px`
    selectMenu.value.style.left = `${selectedElement.value.getBoundingClientRect().left}px`
  }
  else if (selectMenu.value) {
    selectMenu.value.removeAttribute('style')
  }
})

defineEmits(['openHomePage'])
</script>

<template>
  <div class="h-screen w-full flex flex-row">
    <div class="w-52 h-full bg-amber-50 flex flex-col">
      <div class="flex flex-row gap-2 justify-center p-2 m-4 border-black border-2 rounded hover:drop-shadow cursor-pointer transition-all">
        <img
          src="../../assets/icons/back_arrow.svg"
          class="size-6"
          alt="arrow_back"
        >
        <p
          class="font-mono font-bold uppercase"
          @click="$emit('openHomePage')"
        >
          Back to Menu
        </p>
      </div>

      <div class="flex flex-col items-center justify-center">
        <h2 class="font-mono text-xl uppercase font-bold m-0 p-0">
          Edit Pages
        </h2>
      </div>

      <div class="flex flex-col gap-2 h-full my-2 overflow-y-auto style">
        <div
          v-for="route in filteredRoutes"
          :key="route.path"
          class="px-2 py-1 border-black border-2 mx-2 rounded hover:bg-black/10 hover:animate-pulse cursor-pointer"
          :class="{ 'border-purple-400': selectedRoute.path === route.path }"
          @click="selectedRoute = route"
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
      <span @click.prevent="selectedElement=null;">CLOSE</span>
    </div>
  </div>
</template>

<style scoped>
.overflow-y-auto {
  scrollbar-width: thin;
}
</style>
