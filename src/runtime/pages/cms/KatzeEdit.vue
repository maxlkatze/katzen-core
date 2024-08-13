<script setup lang="ts">
import { ref } from 'vue'
import type { RouteComponent } from 'vue-router'
import type { ContentCmsResponse, Route, Lazy, ApiResponse } from '../../types/EditTypes'
import {
  defineAsyncComponent, definePageMeta,
  onMounted,
  onUnmounted,
  setFetchedContent,
  shallowRef,
  useCookie,
  useUiStore,
  watch,
} from '#imports'

definePageMeta({
  layout: 'cms-layout',
})

// COMPOSABLE
const uiStore = useUiStore()

// VARIABLES
const isMobile = ref(false) // has the user device a mobile device
const selectedRoute = ref<Route>({
  name: '',
  path: '',
  component: undefined,
})
const RouteComponent = shallowRef<unknown>(undefined)
const hoveredElement = ref<Element | undefined>(undefined)
const selectedKey = ref<string | undefined>(undefined)
/* Mobile Emulation */
const emulateMobile = ref(false)
/* RequestStates */
const saveState = ref({ loading: false, success: false, error: false })
const publishState = ref({ loading: false, success: false, error: false })
/* PopupStates */
const deployPopup = ref(false)
const errorPopup = ref(false)
const errorMessages = ref<string[]>([])

// HOOKS
onMounted(async () => {
  const tokenCookie = useCookie('token')
  if (tokenCookie.value) {
    const response = await $fetch('/content-cms', {
      method: 'POST',
      body: {
        token: tokenCookie.value,
        action: 'get',
      },
    },
    ) as ContentCmsResponse
    if (response.success && response.body) {
      setFetchedContent(response.body.content)
    }
  }
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

// EVENTS
const onResize = () => {
  if (import.meta.server) return
  const container = document.querySelector('body')
  if (container) {
    const containerWidth = container.clientWidth
    isMobile.value = containerWidth < 768
  }
}
onResize()

// METHODS
const saveContentToStorage = async () => {
  saveState.value.loading = true
  const uiContent = uiStore.getUiContent()
  const token = useCookie('token')
  const data: ApiResponse = await $fetch('/content-cms', {
    method: 'POST',
    body: {
      token: token.value,
      content: uiContent,
      action: 'save',
    },
  })
  saveState.value = { loading: false, success: data.success, error: !data.success }
  setTimeout(() => {
    saveState.value = { loading: false, success: false, error: false }
  }, 2000)
}

const deployContent = async () => {
  deployPopup.value = false
  publishState.value.loading = true
  const token = useCookie('token')
  const data: ApiResponse = await $fetch('/content-cms', {
    method: 'POST',
    body: {
      token: token.value,
      action: 'deploy',
    },
  })
  publishState.value = { loading: false, success: data.success, error: !data.success }
  if (data.missingDeployHookURL) {
    errorPopup.value = true
    errorMessages.value.push('You need to set a deploy hook URL in the config to publish the content.')
    errorMessages.value.push('If you\'re running the project locally, you can restart the server manually.')
  }
  setTimeout(() => {
    publishState.value = { loading: false, success: false, error: false }
  }, 2000)
}

const closeErrorPopup = () => {
  errorPopup.value = false
  errorMessages.value = []
}

// WATCHERS
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
    RouteComponent.value = defineAsyncComponent(implementation)
  }
  selectedKey.value = undefined
})
</script>

<template>
  <div class="min-h-screen w-full flex flex-col justify-center items-center bg-amber-50 katze-edit-view">
    <div class="h-screen w-full flex flex-row">
      <EditPageList
        :is-mobile="isMobile"
        :selected-route="selectedRoute"
        @select-route="selectedRoute = $event"
      />

      <EditRouteView
        :route-component="RouteComponent"
        :emulate-mobile="emulateMobile"
        @hover-element="hoveredElement = $event"
        @select-key="selectedKey = $event"
      />

      <!-- hover overlay -->
      <EditOverlayHover :hovered-element="hoveredElement" />

      <!-- content edit overlay -->
      <EditOverlayContentEdit
        :selected-key="selectedKey"
        @close="selectedKey = undefined"
      />

      <!-- action buttons overlay -->
      <EditOverlayActionButtons
        :emulate-mobile="emulateMobile"
        :is-mobile="isMobile"
        :save-state="saveState"
        :publish-state="publishState"
        @toggle-emulate-mobile="emulateMobile = !emulateMobile"
        @save-content="saveContentToStorage"
        @deploy-changes="deployPopup=true"
      />

      <!-- publish popup -->
      <EditPopupDeployment
        v-if="deployPopup"
        @close="deployPopup = false"
        @deploy="deployContent"
      />

      <!-- error popup -->
      <EditPopupError
        v-if="errorPopup"
        :messages="errorMessages"
        @close="closeErrorPopup"
      />
    </div>
  </div>
</template>

<style>
.katze-edit-view .ontop {
  z-index: 1000;
}

.katze-edit-view .overflow-y-auto, .katze-edit-view .overflow-y-scroll {
  scrollbar-width: thin;
}

.katze-edit-view *[data-placeholder]::before {
  color: #ccc;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}

.katze-edit-view .route-container *[kat-e] {
  min-height: 24px;
  min-width: 24px;
  position: relative;
}

.katze-edit-view .route-container *[kat-e]:before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  border: 2px dashed rgb(255 207 207 / 85%);
}
</style>
