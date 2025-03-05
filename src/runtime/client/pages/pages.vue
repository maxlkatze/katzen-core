<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useRouteFinder } from '../composables/cms/useRouteFinder'
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'katze-cms-layout',
})

const { isLoading, loadRoutes, routes } = useRouteFinder()
const searchQuery = ref('')

// Filter routes based on search query
const filteredRoutes = computed(() => {
  if (!searchQuery.value)
    return routes.value

  const query = searchQuery.value.toLowerCase()
  return routes.value.filter(route =>
    route.name.toLowerCase().includes(query)
    || route.path.toLowerCase().includes(query),
  )
})

onMounted(() => {
  loadRoutes()
})
</script>

<template>
  <div class="max-w-7xl mx-auto py-6 px-4">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-medium text-gray-900">
        Pages
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Select a page to edit its content
      </p>
    </div>

    <!-- Search and Filter -->
    <div class="mb-6">
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search pages..."
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
    </div>

    <!-- Loading State -->
    <div
      v-if="isLoading"
      class="flex justify-center py-12"
    >
      <svg
        class="animate-spin h-6 w-6 text-indigo-500"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          fill="none"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>

    <!-- Pages List -->
    <div
      v-else-if="filteredRoutes.length > 0"
      class="border border-gray-200 rounded-md overflow-hidden"
    >
      <div
        v-for="(route, index) in filteredRoutes"
        :key="route.path"
        :class="['flex items-center px-4 py-3 hover:bg-gray-50 transition-colors',
                 index !== filteredRoutes.length - 1 ? 'border-b border-gray-200' : '']"
      >
        <div class="flex-1">
          <h3 class="font-medium text-gray-900">
            {{ route.name }}
          </h3>
          <p class="text-sm text-gray-500">
            {{ route.path }}
          </p>
        </div>
        <NuxtLink
          :to="`/cms/page/${route.slug || route.path}`"
          class="ml-4 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Edit
        </NuxtLink>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-else
      class="text-center py-12 border border-gray-200 rounded-md"
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
        No pages found
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        Try adjusting your search or filter to find what you're looking for.
      </p>
    </div>
  </div>
</template>

<style scoped>
/* Clean minimal styles */
</style>
