<script setup lang="ts">
import type { RouteComponent } from 'vue-router'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouteFinder } from '../../composables/cms/useRouteFinder'
import type { Lazy } from '../../../types/EditTypes'
import { useContentSource } from '../../composables/cms/useContentSource'
import { ContentType, type ContentValue } from '../../../types/ContentTypes'
import { useAuthentication } from '../../composables/cms/useAuthentication'
import { defineAsyncComponent, definePageMeta, shallowRef, useRoute } from '#imports'

definePageMeta({
  layout: 'katze-cms-layout',
})

const contentSource = useContentSource()
await contentSource.enableCMSMode()

// UI state
const isMobile = ref(false)
const showChangesDropdown = ref(false)
const changesButtonRef = ref<HTMLElement | null>(null)
const isSaving = ref(false)
const isDeploying = ref(false)
const saveSuccess = ref<boolean | null>(null)
const deploySuccess = ref<boolean | null>(null)
const errorMessage = ref('')

// Modal state
const showEditModal = ref(false)
const selectedContentKey = ref('')
const selectedContentValue = ref<ContentValue>('')
const selectedContentType = ref<ContentType>(ContentType.Text)

const route = useRoute()
const auth = useAuthentication()

onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)

  // Close dropdown when clicking outside
  document.addEventListener('click', (event) => {
    if (changesButtonRef.value && !changesButtonRef.value.contains(event.target as Node)) {
      showChangesDropdown.value = false
    }
  })
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
  document.removeEventListener('click', () => {})
})

const onResize = () => {
  isMobile.value = window.innerWidth < 768
}

const routeId = route.params.id as string

if (!routeId) {
  throw new Error('Route ID is required')
}

const RouteComponent = shallowRef<unknown | undefined>(undefined)
const routeFinder = useRouteFinder()
const foundRoute = routeFinder.findRouteBySlug(routeId)
if (!foundRoute) {
  throw new Error('Route not found')
}

let implementation: Lazy<RouteComponent>
if (typeof foundRoute.component === 'function') {
  implementation = foundRoute.component as Lazy<RouteComponent>
}
else {
  implementation = async () => foundRoute.component as RouteComponent
}
RouteComponent.value = defineAsyncComponent(implementation)

// Add computed property for changes
const changesCount = computed(() => contentSource.editContentStorage.changes.value)
const hasChanges = computed(() => Object.keys(changesCount.value).length > 0)

// Function to toggle changes dropdown
const toggleChangesDropdown = (event: Event) => {
  event.stopPropagation()
  showChangesDropdown.value = !showChangesDropdown.value
}

// Function to revert a change
const revertChange = (key: string, event: Event) => {
  event.stopPropagation()
  contentSource.editContentStorage.revertChangeByKey(key)
}

// Function to get a truncated preview of the content
const getContentPreview = (value: unknown): string => {
  if (value === null || value === undefined) return 'null'

  const stringValue = String(value)
  if (stringValue.length <= 30) return stringValue

  return stringValue.substring(0, 27) + '...'
}

// Function to open the edit modal
const openEditModal = (key: string, value: ContentValue, event: Event) => {
  event.stopPropagation()

  // Determine content type
  let contentType: ContentType = ContentType.Text

  if (typeof value === 'object' && value !== null && 'src' in value && 'alt' in value) {
    contentType = ContentType.Image
  }
  else if (typeof value === 'string' && (
    value.includes('</') // Contains closing HTML tag
    || value.includes('<p>') // Contains paragraph tag
    || value.includes('<h') // Contains heading tag
    || value.includes('<div') // Contains div tag
  )) {
    contentType = ContentType.RichText
  }

  selectedContentKey.value = key
  selectedContentValue.value = value
  selectedContentType.value = contentType
  showEditModal.value = true
  showChangesDropdown.value = false // Close the dropdown
}

// Function to save edited content
const saveEditedContent = (key: string, value: ContentValue) => {
  contentSource.editContentStorage.updateContentByKey(key, value)
}

const handleClickOnElement = (key: string) => {
  openEditModal(key, contentSource.editContentStorage.editContent.value[key], new Event('click'))
}

/**
 * Save changes to the backend
 */
const saveChanges = async () => {
  if (!hasChanges.value) return

  saveSuccess.value = null
  errorMessage.value = ''
  isSaving.value = true

  try {
    const token = auth.getToken()
    if (!token) {
      throw new Error('Authentication required. Please log in again.')
    }

    const response = await $fetch('/cms/api/content', {
      method: 'POST',
      body: {
        token,
        action: 'save',
        content: changesCount.value,
      },
    })

    if (response.success) {
      saveSuccess.value = true
      // Optional: Reset changes after successful save
      // await contentSource.editContentStorage.loadContent()
    }
    else {
      saveSuccess.value = false
      errorMessage.value = response.body?.message || 'Failed to save changes'
    }
  }
  catch (error) {
    saveSuccess.value = false
    errorMessage.value = error as string || 'An error occurred while saving'
  }
  finally {
    isSaving.value = false

    // Clear success message after a delay
    if (saveSuccess.value) {
      setTimeout(() => {
        saveSuccess.value = null
      }, 3000)
    }
  }
}

/**
 * Deploy changes
 */
const deployChanges = async () => {
  deploySuccess.value = null
  errorMessage.value = ''
  isDeploying.value = true

  try {
    const token = auth.getToken()
    if (!token) {
      throw new Error('Authentication required. Please log in again.')
    }

    const response = await $fetch('/cms/api/content', {
      method: 'POST',
      body: {
        token,
        action: 'deploy',
      },
    })

    if (response.success) {
      deploySuccess.value = true
    }
    else {
      deploySuccess.value = false
      errorMessage.value = response.body?.message || 'Failed to deploy changes'
    }
  }
  catch (error) {
    deploySuccess.value = false
    errorMessage.value = error as string || 'An error occurred during deployment'
  }
  finally {
    isDeploying.value = false

    // Clear success message after a delay
    if (deploySuccess.value) {
      setTimeout(() => {
        deploySuccess.value = null
      }, 3000)
    }
  }
}
</script>

<template>
  <div class="flex flex-col size-full">
    <div class="border-b flex flex-col md:flex-row pb-2 md:pb-1 items-center justify-between drop-shadow-sm shadow-sm z-50">
      <p class="font-mono px-2 font-bold">
        Edit: {{ routeId }}
      </p>
      <ClientOnly>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-5">
          <!-- Changes Button with counter -->
          <div
            ref="changesButtonRef"
            class="relative"
          >
            <cms-ui-button
              class="relative"
              @click="toggleChangesDropdown($event)"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="size-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M3 3v18h18" />
                <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
              </svg>
              Changes
              <!-- Changes counter badge -->
              <span
                v-if="hasChanges"
                class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold"
              >
                {{ Object.keys(changesCount).length }}
              </span>
            </cms-ui-button>

            <!-- Changes dropdown -->
            <div
              v-show="showChangesDropdown && hasChanges"
              class="absolute right-0 top-full mt-2 w-80 bg-white shadow-xl rounded-lg overflow-hidden z-10 border border-gray-200"
            >
              <div class="p-3 bg-gray-50 border-b flex items-center justify-between">
                <h3 class="font-medium text-gray-800">
                  Content Changes
                </h3>
                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded">
                  {{ Object.keys(changesCount).length }} {{ Object.keys(changesCount).length === 1 ? 'item' : 'items' }}
                </span>
              </div>
              <div class="max-h-80 overflow-y-auto divide-y divide-gray-100">
                <div
                  v-for="(value, key) in changesCount"
                  :key="key"
                  class="p-3 hover:bg-gray-50"
                >
                  <!-- Changed item details -->
                  <div class="mb-2">
                    <div class="font-medium text-sm mb-1 text-gray-700">
                      {{ key }}
                    </div>
                    <div class="text-xs bg-gray-50 p-2 rounded border border-gray-200 text-gray-600 font-mono">
                      {{ getContentPreview(value) }}
                    </div>
                  </div>
                  <!-- Action buttons -->
                  <div class="flex justify-end gap-2">
                    <button
                      class="text-blue-600 hover:text-blue-800 text-xs px-3 py-1 rounded-md hover:bg-blue-50 border border-blue-200 flex items-center gap-1"
                      @click="openEditModal(key, value, $event)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                      </svg>
                      Edit
                    </button>
                    <button
                      class="text-red-600 hover:text-red-800 text-xs px-3 py-1 rounded-md hover:bg-red-50 border border-red-200 flex items-center gap-1"
                      @click="revertChange(key, $event)"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        class="size-3"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                      >
                        <path d="M3 12h18M3 12l5-5M3 12l5 5" />
                      </svg>
                      Revert
                    </button>
                  </div>
                </div>
              </div>
              <div
                v-if="hasChanges"
                class="p-2 bg-gray-50 border-t text-center"
              >
                <button
                  class="text-xs text-gray-600 hover:text-gray-800"
                  @click="showChangesDropdown = false"
                >
                  Close
                </button>
              </div>
            </div>
          </div>

          <!-- Save Button -->
          <cms-ui-button
            :disabled="!hasChanges || isSaving"
            :class="{ 'opacity-50 cursor-not-allowed': !hasChanges || isSaving }"
            @click="saveChanges"
          >
            <template v-if="isSaving">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </template>
            <template v-else>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="size-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
            </template>
          </cms-ui-button>

          <!-- Publish (Deploy) Button -->
          <cms-ui-button
            :disabled="isDeploying"
            :class="{ 'opacity-50 cursor-not-allowed': isDeploying }"
            @click="deployChanges"
          >
            <template v-if="isDeploying">
              <svg
                class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Publishing...
            </template>
            <template v-else>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                class="size-5"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line
                  x1="12"
                  y1="3"
                  x2="12"
                  y2="15"
                />
              </svg>
              Publish
            </template>
          </cms-ui-button>
        </div>
      </ClientOnly>
    </div>

    <!-- Status messages -->
    <div
      v-if="saveSuccess === true || deploySuccess === true"
      class="bg-green-50 border-l-4 border-green-500 p-4 mt-2"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-green-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-green-700">
            {{ saveSuccess ? 'Changes saved successfully!' : 'Changes published successfully!' }}
          </p>
        </div>
      </div>
    </div>

    <div
      v-if="errorMessage"
      class="bg-red-50 border-l-4 border-red-500 p-4 mt-2"
    >
      <div class="flex">
        <div class="flex-shrink-0">
          <svg
            class="h-5 w-5 text-red-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clip-rule="evenodd"
            />
          </svg>
        </div>
        <div class="ml-3">
          <p class="text-sm text-red-700">
            {{ errorMessage }}
          </p>
        </div>
      </div>
    </div>

    <div class="size-full flex-1 flex">
      <ClientOnly>
        <cms-edit-page-view
          v-if="RouteComponent"
          :route-component="RouteComponent"
          :emulate-mobile="false"
          @select-key="handleClickOnElement"
        />
      </ClientOnly>
    </div>

    <!-- Edit Content Modal -->
    <cms-edit-modals-edit-content-modal
      :show="showEditModal"
      :content-key="selectedContentKey"
      :content-type="selectedContentType"
      :content-value="selectedContentValue"
      @close="showEditModal = false"
      @save="saveEditedContent"
    />
  </div>
</template>

<style scoped>
/* No changes to styles */
</style>
