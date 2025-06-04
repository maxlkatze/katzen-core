<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import type { ContentValue, ContentImage } from '../../../../../types/ContentTypes'
import { useAuthentication } from '../../../../composables/cms/useAuthentication'

const props = defineProps<{
  value: ContentValue
}>()

const emit = defineEmits<{
  (e: 'save', value: ContentImage): void
}>()

// Form data
const imageData = ref<ContentImage>({
  src: '',
  alt: '',
})

// Image source type (internal or external)
const isExternalSource = ref(false)
const externalUrl = ref('')

// Images from the API
const availableImages = ref<string[]>([])
const isLoading = ref(true)
const error = ref<string | null>(null)

// Get the selected image index
const selectedImageIndex = ref(-1)

onMounted(async () => {
  // Initialize the image data from props
  if (typeof props.value === 'object' && props.value !== null) {
    imageData.value = {
      src: (props.value as ContentImage).src || '',
      alt: (props.value as ContentImage).alt || '',
    }

    // Determine if the current image is external
    // A simple check - if the URL doesn't match any available image, it's likely external
    // We'll set this more accurately after fetching images
    isExternalSource.value = imageData.value.src?.startsWith('http') || false
    if (isExternalSource.value) {
      externalUrl.value = imageData.value.src
    }
  }

  // Fetch available images
  await fetchImages()

  // Set selected image based on current value if it's an internal image
  if (imageData.value.src && !isExternalSource.value) {
    const index = availableImages.value.findIndex(img => img === imageData.value.src)
    if (index !== -1) {
      selectedImageIndex.value = index
    }
    else if (imageData.value.src) {
      // If we couldn't find the image in available images, it must be external
      isExternalSource.value = true
      externalUrl.value = imageData.value.src
    }
  }
})

/**
 * Fetch images from the API
 */
const fetchImages = async () => {
  isLoading.value = true
  error.value = null

  try {
    const auth = useAuthentication()
    const token = auth.getToken()

    try {
      const jsonResponse = await $fetch('/cms/images.json', {
        method: 'GET',
      }) as {
        images?: string[]
      } | null

      if (jsonResponse) {
        availableImages.value = jsonResponse.images || []
      }
      return
    }
    catch (e) {
      console.error('Error fetching images.json:', e)
    }

    const response = await $fetch('/cms/api/content', {
      method: 'POST',
      body: {
        token,
        action: 'imageList',
      },
    })

    if (response.success) {
      availableImages.value = response.body.images || []
    }
    else {
      error.value = response.body.message || 'Failed to fetch images'
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
 * Select an image
 */
const selectImage = (index: number) => {
  selectedImageIndex.value = index
  if (index >= 0 && index < availableImages.value.length) {
    imageData.value.src = availableImages.value[index]
  }
}

/**
 * Toggle between internal and external image source
 */
const toggleSourceType = () => {
  isExternalSource.value = !isExternalSource.value

  // Reset the image source when switching modes
  if (isExternalSource.value) {
    imageData.value.src = externalUrl.value
    selectedImageIndex.value = -1
  }
  else {
    externalUrl.value = imageData.value.src
    imageData.value.src = selectedImageIndex.value >= 0 ? availableImages.value[selectedImageIndex.value] : ''
  }
}

/**
 * Update the image source when external URL changes
 */
const updateExternalSource = () => {
  if (isExternalSource.value) {
    imageData.value.src = externalUrl.value
  }
}

/**
 * Computed property to determine if the Save button should be enabled
 */
const canSave = computed(() => {
  if (isExternalSource.value) {
    return !!externalUrl.value
  }
  else {
    return selectedImageIndex.value >= 0
  }
})

/**
 * Handle save
 */
const handleSave = () => {
  // Ensure the correct source is set before saving
  if (isExternalSource.value) {
    imageData.value.src = externalUrl.value
  }
  emit('save', imageData.value)
}
</script>

<template>
  <div class="space-y-6">
    <!-- Source Type Toggle -->
    <div class="flex items-center justify-between px-1">
      <span class="text-sm font-medium text-gray-700">Image Source</span>
      <div class="flex items-center space-x-2">
        <span
          :class="{ 'font-medium': !isExternalSource }"
          class="text-sm text-gray-600"
        >Internal</span>
        <button
          type="button"
          class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          :class="isExternalSource ? 'bg-blue-600' : 'bg-gray-200'"
          @click="toggleSourceType"
        >
          <span
            aria-hidden="true"
            class="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
            :class="isExternalSource ? 'translate-x-5' : 'translate-x-0'"
          />
        </button>
        <span
          :class="{ 'font-medium': isExternalSource }"
          class="text-sm text-gray-600"
        >External</span>
      </div>
    </div>

    <!-- External URL Input (only visible when external source is selected) -->
    <div
      v-if="isExternalSource"
      class="space-y-2"
    >
      <label
        for="external-url"
        class="block text-sm font-medium text-gray-700"
      >External Image URL</label>
      <input
        id="external-url"
        v-model="externalUrl"
        type="url"
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="https://example.com/image.jpg"
        @input="updateExternalSource"
      >
      <p class="text-xs text-gray-500">
        Enter the full URL of an external image you want to use.
      </p>

      <!-- External Image Preview -->
      <div
        v-if="externalUrl"
        class="mt-4 border rounded-md p-4 bg-gray-50"
      >
        <h3 class="font-medium mb-2">
          External Image Preview
        </h3>
        <div class="flex justify-center">
          <img
            :src="externalUrl"
            :alt="imageData.alt || 'External image'"
            class="max-h-48 object-contain rounded"
            @error="error = 'Invalid image URL or image cannot be loaded'"
          >
        </div>
        <p class="mt-2 text-sm text-gray-600 break-all">
          {{ externalUrl }}
        </p>
      </div>
    </div>

    <!-- Internal Image Selection (only visible when internal source is selected) -->
    <div v-if="!isExternalSource">
      <div
        v-if="isLoading"
        class="text-center py-8"
      >
        <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900" />
        <p class="mt-2 text-gray-600">
          Loading images...
        </p>
      </div>

      <div
        v-else-if="error"
        class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
      >
        <p>{{ error }}</p>
        <button
          class="mt-2 text-sm underline"
          @click="fetchImages"
        >
          Try again
        </button>
      </div>

      <div v-else>
        <!-- Image Grid -->
        <div class="space-y-2">
          <h3 class="font-medium text-gray-700">
            Select an Image
          </h3>

          <div class="grid grid-cols-3 gap-2">
            <template
              v-for="(image, index) in availableImages"
              :key="index"
            >
              <div
                class="aspect-square border rounded-md overflow-hidden cursor-pointer relative"
                :class="{ 'ring-2 ring-blue-500': selectedImageIndex === index }"
                @click="selectImage(index)"
              >
                <img
                  :src="image"
                  :alt="`Image ${index + 1}`"
                  class="object-cover w-full h-full"
                >
              </div>
            </template>

            <!-- Empty placeholders to ensure 3x3 grid when fewer than 9 images -->
            <template
              v-for="index in Math.max(0, 9 - availableImages.length)"
              :key="`empty-${index}`"
            >
              <div class="aspect-square bg-gray-200 rounded-md" />
            </template>
          </div>
        </div>

        <!-- Selected Image Preview -->
        <div
          v-if="selectedImageIndex >= 0 && selectedImageIndex < availableImages.length"
          class="mt-6 border rounded-md p-4 bg-gray-50"
        >
          <h3 class="font-medium mb-2">
            Selected Image
          </h3>
          <div class="flex justify-center">
            <img
              :src="availableImages[selectedImageIndex]"
              :alt="imageData.alt || 'Selected image'"
              class="max-h-48 object-contain rounded"
            >
          </div>
          <p class="mt-2 text-sm text-gray-600 break-all">
            {{ availableImages[selectedImageIndex] }}
          </p>
        </div>
      </div>
    </div>

    <!-- Alt Text Input (for both modes) -->
    <div class="space-y-2 mt-6">
      <label
        for="image-alt"
        class="block text-sm font-medium text-gray-700"
      >Alt Text</label>
      <input
        id="image-alt"
        v-model="imageData.alt"
        type="text"
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Describe the image for accessibility"
      >
      <p class="text-xs text-gray-500">
        Provide descriptive text for screen readers and SEO.
      </p>
    </div>

    <div class="flex justify-end">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        :disabled="!canSave"
        @click="handleSave"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>
