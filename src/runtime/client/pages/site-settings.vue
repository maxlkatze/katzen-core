<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAuthentication } from '../composables/cms/useAuthentication'
import { useContentSource } from '../composables/cms/useContentSource'
import { useRuntimeConfig, definePageMeta } from '#imports'

definePageMeta({
  layout: 'katze-cms-layout',
})

// Get the public runtime config
const runtimeConfig = useRuntimeConfig().public
const searchQuery = ref('')
const expandedSections = ref<Record<string, boolean>>({})

// Parse the runtime config for display
const configEntries = computed(() => {
  const entries: Array<{ key: string, value: unknown, path: string, type: string }> = []

  // Recursive function to flatten nested objects
  const processObject = (obj: unknown, path: string = '') => {
    if (!obj) return

    Object.entries(obj).forEach(([key, value]) => {
      const currentPath = path ? `${path}.${key}` : key
      const type = typeof value

      if (type === 'object' && value !== null && !Array.isArray(value)) {
        // Add the parent object entry
        entries.push({
          key,
          value: '{...}',
          path: currentPath,
          type: 'object',
        })

        // Process nested properties
        processObject(value, currentPath)
      }
      else {
        // Add leaf entries
        entries.push({
          key,
          value: formatValue(value),
          path: currentPath,
          type: Array.isArray(value) ? 'array' : type,
        })
      }
    })
  }

  processObject(runtimeConfig)
  return entries
})

// Filter entries based on search
const filteredEntries = computed(() => {
  if (!searchQuery.value) return configEntries.value

  const query = searchQuery.value.toLowerCase()
  return configEntries.value.filter(entry =>
    entry.key.toLowerCase().includes(query)
    || entry.path.toLowerCase().includes(query)
    || String(entry.value).toLowerCase().includes(query),
  )
})

// Group entries by their parent object
const groupedEntries = computed(() => {
  const groups: Record<string, typeof configEntries.value> = {}

  filteredEntries.value.forEach((entry) => {
    const parts = entry.path.split('.')

    if (parts.length === 1) {
      // Top-level entries
      if (!groups['root']) groups['root'] = []
      groups['root'].push(entry)
    }
    else {
      // Nested entries - group by parent
      const parentPath = parts.slice(0, -1).join('.')
      if (!groups[parentPath]) groups[parentPath] = []
      groups[parentPath].push(entry)
    }
  })

  return groups
})

// Function to format values for display
function formatValue(value: unknown): string {
  if (value === null) return 'null'
  if (value === undefined) return 'undefined'

  if (Array.isArray(value)) {
    if (value.length === 0) return '[]'
    return `[${value.length} items]`
  }

  if (typeof value === 'object') {
    return '{...}'
  }

  if (typeof value === 'string') {
    if (value.length > 100) {
      return `"${value.substring(0, 100)}..."`
    }
    return `"${value}"`
  }

  return String(value)
}

// Toggle section expanded state
function toggleSection(section: string) {
  expandedSections.value[section] = !expandedSections.value[section]
}

// Check if a section is expanded
function isSectionExpanded(section: string): boolean {
  return !!expandedSections.value[section]
}

// Initialize with root section expanded
onMounted(() => {
  expandedSections.value['root'] = true
})

// Get appropriate icon for value type
function getTypeIcon(type: string): string {
  switch (type) {
    case 'string':
      return 'text-green-500'
    case 'number':
      return 'text-blue-500'
    case 'boolean':
      return 'text-purple-500'
    case 'object':
      return 'text-yellow-500'
    case 'array':
      return 'text-red-500'
    default:
      return 'text-gray-500'
  }
}

const auth = useAuthentication()

const uploadContent = async () => {
  // open a file dialog to select a config file (json)
  const fileInput = document.createElement('input')
  fileInput.type = 'file'
  fileInput.accept = '.json'
  fileInput.onchange = async (event) => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (!file) return

    const token = auth.getToken()
    if (!token) {
      throw new Error('Authentication required. Please log in again.')
    }
    const content = await file.text()
    const jsonContent = JSON.parse(content)
    const response = await $fetch('/cms/api/content', {
      method: 'POST',
      body: {
        token,
        action: 'save',
        content: jsonContent,
      },
    })

    if (response.success) {
      // Reload the page to reflect changes
      window.location.reload()
    }
    else {
      console.error('Failed to upload config:', response.error)
      alert('Failed to upload config: ' + response.error)
    }
  }
  fileInput.click()
}

const contentSource = useContentSource()
const downloadConfig = async () => {
  const content = contentSource.content
  if (!content) {
    alert('No content available to download.')
    return
  }
  // Convert content to JSON string
  const jsonContent = JSON.stringify(content, null, 2)
  // Create a Blob from the JSON string
  const blob = new Blob([jsonContent], { type: 'application/json' })
  // Create a link element to trigger download
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = 'site-config.json'
  // Append link to the body
  document.body.appendChild(link)
  // Trigger the download
  link.click()
}
</script>

<template>
  <div class="max-w-7xl mx-auto py-6 px-4">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-medium text-gray-900">
        Site Settings
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        View the runtime configuration values for your site
      </p>
    </div>

    <!-- Search -->
    <div class="mb-6 flex flex-row">
      <div class="relative max-w-md">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search configuration..."
          class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        >
        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle
              cx="11"
              cy="11"
              r="8"
            />
            <line
              x1="21"
              y1="21"
              x2="16.65"
              y2="16.65"
            />
          </svg>
        </span>
      </div>
      <div class="ml-4 flex items-center">
        <!-- button to upload config file and replace the serverside config -->
        <cms-ui-button
          class="ml-2 text-white"
          variant="primary"
          @click="uploadContent"
        >
          Upload Config
        </cms-ui-button>

        <cms-ui-button
          class="ml-2 text-white"
          variant="secondary"
          @click="downloadConfig"
        >
          Download Config
        </cms-ui-button>
      </div>
    </div>

    <!-- Config Display -->
    <div class="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
      <!-- Root section -->
      <div
        v-if="groupedEntries['root']"
        class="border-b border-gray-200"
      >
        <div
          class="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
          @click="toggleSection('root')"
        >
          <h3 class="text-sm font-medium text-gray-700">
            Root Configuration
          </h3>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-5 w-5 text-gray-500 transition-transform"
            :class="{ 'rotate-180': isSectionExpanded('root') }"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </div>

        <div
          v-if="isSectionExpanded('root')"
          class="border-t border-gray-100"
        >
          <div
            v-for="entry in groupedEntries['root']"
            :key="entry.path"
            class="px-4 py-3 border-b border-gray-100 flex items-start"
          >
            <div :class="`mr-2 mt-1 ${getTypeIcon(entry.type)}`">
              <svg
                v-if="entry.type === 'string'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="entry.type === 'number'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="entry.type === 'boolean'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="entry.type === 'object'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582a1 1 0 00-.646.942v4.5a1 1 0 00.646.942l3.954 1.582V15a1 1 0 001 1h4a1 1 0 001-1v-1.131l3.96-1.584a1 1 0 00.64-.94v-4.5a1 1 0 00-.64-.94L15 5.87V3a1 1 0 00-1-1h-4zm1 2h2v1.193l1 .4v4.814l-1 .4V13h-2v-1.193l-1-.4V7.593l1-.4V4z"
                  clip-rule="evenodd"
                />
              </svg>
              <svg
                v-else-if="entry.type === 'array'"
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
              </svg>
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                class="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fill-rule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                  clip-rule="evenodd"
                />
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-baseline mb-1">
                <span class="font-medium text-gray-800">{{ entry.key }}</span>
                <span class="ml-2 text-xs text-gray-500">{{ entry.type }}</span>
              </div>
              <div class="text-sm text-gray-600 break-all">
                {{ entry.value }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Nested sections -->
      <template
        v-for="(entries, section) in groupedEntries"
        :key="section"
      >
        <div
          v-if="section !== 'root'"
          class="border-b border-gray-200 last:border-b-0"
        >
          <div
            class="flex items-center justify-between px-4 py-3 bg-gray-50 cursor-pointer hover:bg-gray-100"
            @click="toggleSection(section)"
          >
            <h3 class="text-sm font-medium text-gray-700">
              {{ section }}
            </h3>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5 text-gray-500 transition-transform"
              :class="{ 'rotate-180': isSectionExpanded(section) }"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </div>

          <div
            v-if="isSectionExpanded(section)"
            class="border-t border-gray-100"
          >
            <div
              v-for="entry in entries"
              :key="entry.path"
              class="px-4 py-3 border-b border-gray-100 last:border-b-0 flex items-start"
            >
              <div :class="`mr-2 mt-1 ${getTypeIcon(entry.type)}`">
                <svg
                  v-if="entry.type === 'string'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 0l-2 2a1 1 0 101.414 1.414L8 10.414l1.293 1.293a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="entry.type === 'number'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="entry.type === 'boolean'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="entry.type === 'object'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M10 2a1 1 0 00-1 1v1.323l-3.954 1.582a1 1 0 00-.646.942v4.5a1 1 0 00.646.942l3.954 1.582V15a1 1 0 001 1h4a1 1 0 001-1v-1.131l3.96-1.584a1 1 0 00.64-.94v-4.5a1 1 0 00-.64-.94L15 5.87V3a1 1 0 00-1-1h-4zm1 2h2v1.193l1 .4v4.814l-1 .4V13h-2v-1.193l-1-.4V7.593l1-.4V4z"
                    clip-rule="evenodd"
                  />
                </svg>
                <svg
                  v-else-if="entry.type === 'array'"
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                </svg>
                <svg
                  v-else
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fill-rule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline mb-1">
                  <span class="font-medium text-gray-800">{{ entry.key }}</span>
                  <span class="ml-2 text-xs text-gray-500">{{ entry.type }}</span>
                </div>
                <div class="text-sm text-gray-600 break-all">
                  {{ entry.value }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <!-- Empty State -->
      <div
        v-if="Object.keys(groupedEntries).length === 0"
        class="py-12 text-center"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 class="mt-2 text-sm font-medium text-gray-900">
          No configuration found
        </h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ searchQuery ? 'Try adjusting your search terms.' : 'There are no public runtime configuration values available.' }}
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.rotate-180 {
  transform: rotate(180deg);
}
</style>
