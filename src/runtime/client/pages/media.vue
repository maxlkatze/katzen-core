<script setup lang="ts">
import { onMounted, ref, computed } from 'vue'
import { useAuthentication } from '../composables/cms/useAuthentication'
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'katze-cms-layout',
})

// State
const images = ref<string[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const selectedImage = ref<string | null>(null)
const showPreviewModal = ref(false)

// Authentication
const auth = useAuthentication()

// Fetch images on mount
onMounted(async () => {
  await fetchImages()
})

/**
 * Fetch images from the API
 */
const fetchImages = async () => {
  isLoading.value = true
  error.value = null

  try {
    const token = auth.getToken()
    if (!token) {
      throw new Error('Authentication required')
    }

    const response = await $fetch('/cms/api/content', {
      method: 'POST',
      body: {
        token,
        action: 'imageList',
      },
    })

    if (response.success) {
      images.value = response.body.images || []
    }
    else {
      error.value = response.body?.message || 'Failed to fetch images'
    }
  }
  catch (err) {
    error.value = err as string || 'An error occurred while fetching images'
  }
  finally {
    isLoading.value = false
  }
}

/**
 * Filter images based on search query
 */
const filteredImages = computed(() => {
  if (!searchQuery.value) return images.value

  const query = searchQuery.value.toLowerCase()
  return images.value.filter(image =>
    image.toLowerCase().includes(query),
  )
})

/**
 * Open image preview modal
 */
const openPreview = (image: string) => {
  selectedImage.value = image
  showPreviewModal.value = true
}

/**
 * Close image preview modal
 */
const closePreview = () => {
  showPreviewModal.value = false
  selectedImage.value = null
}

/**
 * Get file name from path
 */
const getFileName = (path: string) => {
  return path.split('/').pop() || path
}

/**
 * Get file extension
 */
const getFileExtension = (path: string) => {
  const fileName = getFileName(path)
  return fileName.split('.').pop()?.toUpperCase() || ''
}

/**
 * Format file size (placeholder - would need actual file size data)
 */
const getFileSize = () => {
  // This would typically come from the API
  // For now, returning a placeholder
  return '~100 KB'
}

/**
 * Format date (placeholder - would need actual file date data)
 */
const getFileDate = () => {
  // This would typically come from the API
  // For now, returning a placeholder
  return new Date().toLocaleDateString()
}
</script>

<template>
  <div class="max-w-7xl mx-auto py-6 px-4">
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-medium text-gray-900">
        Media Library
      </h1>
      <p class="text-sm text-gray-500 mt-1">
        Browse and manage media assets
      </p>
    </div>

    <!-- Search and Controls -->
    <div class="mb-6 flex flex-col md:flex-row gap-4 justify-between">
      <div class="relative max-w-md w-full">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search media files..."
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

      <button
        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        @click="fetchImages"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4 mr-2"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z" />
          <path d="M14 12l-4 4" />
          <path d="M14 8l-4 4" />
        </svg>
        Refresh
      </button>
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

    <!-- Error State -->
    <div
      v-else-if="error"
      class="text-center py-8 border border-red-100 rounded-md bg-red-50"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="mx-auto h-12 w-12 text-red-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-red-800">
        Error loading media
      </h3>
      <p class="mt-1 text-sm text-red-600">
        {{ error }}
      </p>
      <button
        class="mt-4 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        @click="fetchImages"
      >
        Try again
      </button>
    </div>

    <!-- Media Grid -->
    <div
      v-else-if="filteredImages.length > 0"
      class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4"
    >
      <div
        v-for="image in filteredImages"
        :key="image"
        class="group border border-gray-200 rounded-md overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
      >
        <!-- Image Preview -->
        <div
          class="aspect-square relative overflow-hidden bg-gray-100 flex items-center justify-center"
          @click="openPreview(image)"
        >
          <img
            :src="image"
            :alt="getFileName(image)"
            class="object-cover w-full h-full cursor-pointer"
          >

          <!-- Hover Overlay -->
          <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button class="p-2 bg-white rounded-full">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                class="h-5 w-5 text-gray-700"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path
                  fill-rule="evenodd"
                  d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                  clip-rule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>

        <!-- Image Info -->
        <div class="p-2">
          <div
            class="truncate text-sm font-medium text-gray-700"
            :title="getFileName(image)"
          >
            {{ getFileName(image) }}
          </div>
          <div class="flex justify-between items-center mt-1">
            <span class="text-xs text-gray-500">{{ getFileExtension(image) }}</span>
            <span class="text-xs text-gray-500">{{ getFileSize() }}</span>
          </div>
        </div>
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
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
      <h3 class="mt-2 text-sm font-medium text-gray-900">
        No media found
      </h3>
      <p class="mt-1 text-sm text-gray-500">
        {{ searchQuery ? 'Try adjusting your search to find what you\'re looking for.' : 'Upload images to get started.' }}
      </p>
    </div>

    <!-- Image Preview Modal -->
    <Teleport to="body">
      <div
        v-if="showPreviewModal && selectedImage"
        class="fixed inset-0 z-50 overflow-y-auto"
      >
        <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <!-- Background overlay -->
          <div
            class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
            @click="closePreview"
          />

          <!-- Modal panel -->
          <div class="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
            <div class="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div class="sm:flex sm:items-start">
                <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
                    {{ getFileName(selectedImage) }}
                  </h3>

                  <div class="flex flex-col lg:flex-row gap-6">
                    <!-- Image -->
                    <div class="flex-1 min-w-0 bg-gray-100 rounded-lg flex items-center justify-center p-2">
                      <img
                        :src="selectedImage"
                        :alt="getFileName(selectedImage)"
                        class="max-w-full max-h-96 object-contain"
                      >
                    </div>

                    <!-- Details -->
                    <div class="w-full lg:w-64">
                      <div class="border-b border-gray-200 pb-2 mb-2">
                        <h4 class="text-sm font-medium text-gray-500">
                          Details
                        </h4>
                      </div>

                      <div class="space-y-3">
                        <div>
                          <div class="text-xs text-gray-500">
                            File name
                          </div>
                          <div class="text-sm text-gray-900 break-all">
                            {{ getFileName(selectedImage) }}
                          </div>
                        </div>

                        <div>
                          <div class="text-xs text-gray-500">
                            URL
                          </div>
                          <div class="text-sm text-gray-900 break-all">
                            {{ selectedImage }}
                          </div>
                        </div>

                        <div>
                          <div class="text-xs text-gray-500">
                            Type
                          </div>
                          <div class="text-sm text-gray-900">
                            {{ getFileExtension(selectedImage) }} Image
                          </div>
                        </div>

                        <div>
                          <div class="text-xs text-gray-500">
                            Size
                          </div>
                          <div class="text-sm text-gray-900">
                            {{ getFileSize() }}
                          </div>
                        </div>

                        <div>
                          <div class="text-xs text-gray-500">
                            Date added
                          </div>
                          <div class="text-sm text-gray-900">
                            {{ getFileDate() }}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Modal footer -->
            <div class="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                @click="closePreview"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
/* No additional styles needed */
</style>
