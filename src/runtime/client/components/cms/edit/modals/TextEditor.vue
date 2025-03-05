<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ContentValue } from '../../../../../types/ContentTypes'

const props = defineProps<{
  value: ContentValue
}>()

const emit = defineEmits<{
  (e: 'save', value: string): void
}>()

// Convert ContentValue to string
const textValue = ref('')

onMounted(() => {
  textValue.value = typeof props.value === 'string' ? props.value : ''
})

const handleSave = () => {
  emit('save', textValue.value)
}
</script>

<template>
  <div class="space-y-4">
    <div class="space-y-2">
      <label for="content-text" class="block text-sm font-medium text-gray-700">Text Content</label>
      <textarea
        id="content-text"
        v-model="textValue"
        rows="6"
        class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        placeholder="Enter text content here..."
      ></textarea>
    </div>

    <div class="flex justify-end">
      <button
        @click="handleSave"
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>
