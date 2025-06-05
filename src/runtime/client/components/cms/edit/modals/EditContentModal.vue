<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import type { ContentType, ContentValue } from '../../../../../types/ContentTypes'
import TextEditor from './TextEditor.vue'
import RichTextEditor from './RichTextEditor.vue'
import ImageEditor from './ImageEditor.vue'
import CustomComponentEditor from './CustomComponentEditor.vue'

const props = defineProps<{
  show: boolean
  contentKey: string
  contentType: ContentType
  contentValue: ContentValue
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'save', key: string, value: ContentValue): void
}>()

const modalRef = ref<HTMLElement | null>(null)
const contentValueRef = ref<ContentValue>(props.contentValue)

// Watch for content value changes from parent
watch(() => props.contentValue, (newValue) => {
  contentValueRef.value = newValue
})

// Watch for show changes to lock/unlock body scroll
watch(() => props.show, (newShow) => {
  if (newShow) {
    document.body.style.overflow = 'hidden'
  }
  else {
    document.body.style.overflow = ''
  }
})

// Close on escape key
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

// Close on click outside
const handleClickOutside = (event: MouseEvent) => {
  if (modalRef.value && !modalRef.value.contains(event.target as Node)) {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeyDown)
  document.addEventListener('mousedown', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyDown)
  document.removeEventListener('mousedown', handleClickOutside)
  document.body.style.overflow = ''
})

// Handle save from child components
const handleSave = (value: ContentValue) => {
  emit('save', props.contentKey, value)
  emit('close')
}

// Get the appropriate editor component based on content type
const getEditorComponent = () => {
  console.log(props.contentType)
  switch (props.contentType) {
    case 'text':
      return TextEditor
    case 'richText':
      return RichTextEditor
    case 'image':
      return ImageEditor
    case 'customComponent':
      return CustomComponentEditor
    default:
      return TextEditor
  }
}
</script>

<template>
  <Teleport to="body">
    <div
      v-if="show"
      class="fixed inset-0 z-[60] flex items-center justify-center"
    >
      <!-- Backdrop -->
      <div class="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm" />

      <!-- Modal -->
      <div
        ref="modalRef"
        class="bg-white rounded-lg shadow-xl w-full max-w-2xl mx-4 z-[60] max-h-[90vh] flex flex-col"
      >
        <!-- Header -->
        <div class="flex items-center justify-between p-4 border-b">
          <h3 class="font-medium text-lg">
            Edit Content: {{ contentKey }}
          </h3>
          <button
            class="text-gray-400 hover:text-gray-600 focus:outline-none"
            @click="emit('close')"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="flex-1 overflow-auto p-4">
          <component
            :is="getEditorComponent()"
            :value="contentValueRef"
            :content-key="contentKey"
            @save="handleSave"
          />
        </div>

        <!-- Footer -->
        <div class="p-4 border-t flex justify-end space-x-2">
          <button
            class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
            @click="emit('close')"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>
