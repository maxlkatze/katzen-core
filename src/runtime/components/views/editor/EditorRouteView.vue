<script setup lang="ts">
import {useRouter} from '#app';
import {computed, defineAsyncComponent, ref, shallowRef, watch} from '#imports';
import type {RouteComponent} from 'vue-router';

defineEmits(['openHomePage'])

const router = useRouter()
const routes = router.options.routes
const filteredRoutes = computed((): Route[] => {
  const filteredRoutes = routes.filter(route => (route.name !== 'katze-cms' && route.name !== 'katze-cms-login'))
  return filteredRoutes.map(route => ({
    name: route.name?.toString() || route.path,
    path: route.path,
    component: route.component,
  }))
})
type Lazy<T> = () => Promise<T>
interface Route {
  name: string
  path: string
  component: Lazy<RouteComponent> | RouteComponent | undefined | null
}

const selectedRoute = ref<Route>({
  name: '',
  path: '',
  component: undefined,
})

const Route = shallowRef<unknown>(undefined)


watch(selectedRoute, async () => {
  const route = selectedRoute.value
  if (route.path && route.component) {
    // if route component is not a function wrap it in a function
    let implementation: Lazy<RouteComponent>
    if (typeof route.component === 'function') {
      implementation = route.component as Lazy<RouteComponent>
    }
    else {
      implementation = async () => route.component as RouteComponent
    }
    Route.value = defineAsyncComponent(implementation)
  }
  selectedElement.value = null
})
</script>

<template>
  <div class="h-screen w-full flex flex-row">
    <div
      class="w-full h-full bg-amber-50 flex flex-col"
      :class="{ '!w-52': Route!==undefined }"
    >
      <div
        class="flex flex-row gap-2 justify-center p-2 m-4 border-black border-2 rounded hover:drop-shadow cursor-pointer transition-all"
        @click="$emit('openHomePage')"
      >
        <img
          src="../../../assets/icons/back_arrow.svg"
          class="size-6"
          alt="arrow_back"
        >
        <p
          class="font-mono font-bold uppercase"
        >
          Back to Menu
        </p>
      </div>
      <div class="flex flex-col items-center justify-center">
        <h2 class="font-mono text-xl uppercase font-bold m-0 p-0">
          Edit Pages
        </h2>
      </div>
      <!--  grid when no route is selected -->
      <div
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-10 flex-col gap-2 h-full my-2 overflow-y-auto w-full items-start justify-start px-2"
        :class="{ '[&>*]:max-w-96': Route === undefined, '!flex': Route !== undefined }"
      >
        <div
          v-for="route in filteredRoutes"
          :key="route.path"
          class="w-full px-2 py-1 border-black border-2 rounded hover:bg-black/10 hover:animate-pulse cursor-pointer"
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
      class="flex-1 bg-slate-50 overflow-y-scroll relative w-0"
      :class="{ '!w-full': Route }"
    >
      <component
        :is="Route"
        v-if="Route"
      />
    </div>
  </div>
</template>

<style scoped>

</style>
