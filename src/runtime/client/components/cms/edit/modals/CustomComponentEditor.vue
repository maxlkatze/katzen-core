<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { ContentValue, CustomComponentArrayValue, CustomComponentAttribute, CustomComponentDefinition } from '../../../../../types/ContentTypes'
import { useContentSource } from '../../../../composables/cms/useContentSource'

const props = defineProps<{
  value: ContentValue
  contentKey: string
}>()

const emit = defineEmits<{
  (e: 'save', value: Record<string, any> | CustomComponentArrayValue): void
}>()

// Form data for editing attributes
const formData = ref<Record<string, any>>({})
const schema = ref<Record<string, CustomComponentAttribute>>({})
const isArray = ref(false)
const arrayItems = ref<Record<string, any>[]>([])

// We need to get the schema from the stored content options
// This requires access to the content source to get the schema
const contentSource = useContentSource()

onMounted(() => {
  // Get the schema from stored content options
  const storedContent = contentSource.getStoredContentByKey(props.contentKey)
  if (storedContent?.options && 'schema' in storedContent.options) {
    const options = storedContent.options as CustomComponentDefinition
    schema.value = options.schema
    isArray.value = options.isArray || false
  }

  if (typeof props.value === 'object' && props.value !== null) {
    if (Array.isArray(props.value)) {
      // Handle array of plain objects
      isArray.value = true
      const arrayValue = props.value as CustomComponentArrayValue
      arrayItems.value = arrayValue.map(item => ({ ...item }))
    }
    else {
      // Handle single custom component as plain object
      const plainObject = props.value as Record<string, any>
      formData.value = { ...plainObject }
    }
  }
})

const handleSave = () => {
  if (isArray.value) {
    // For arrays, emit the plain array
    emit('save', arrayItems.value as CustomComponentArrayValue)
  }
  else {
    // For single components, emit the plain object
    emit('save', formData.value)
  }
}

const addArrayItem = () => {
  const newItem: Record<string, any> = {}
  for (const [key, attribute] of Object.entries(schema.value)) {
    if (attribute.type === 'array') {
      newItem[key] = attribute.default || []
    }
    else if (attribute.type === 'image') {
      newItem[key] = attribute.default || { src: '', alt: '' }
    }
    else if (attribute.type === 'richtext') {
      newItem[key] = attribute.default || ''
    }
    else {
      newItem[key] = attribute.default
    }
  }
  arrayItems.value.push(newItem)
}

const removeArrayItem = (index: number) => {
  arrayItems.value.splice(index, 1)
}

const addArrayAttributeItem = (itemIndex: number, attributeKey: string) => {
  const attribute = schema.value[attributeKey]
  if (attribute.type === 'array') {
    let targetData: Record<string, any>

    if (itemIndex === -1) {
      // Single component mode
      if (!formData.value[attributeKey]) {
        formData.value[attributeKey] = []
      }
      targetData = formData.value
    }
    else {
      // Array component mode
      if (!arrayItems.value[itemIndex][attributeKey]) {
        arrayItems.value[itemIndex][attributeKey] = []
      }
      targetData = arrayItems.value[itemIndex]
    }

    let defaultValue: any = ''
    if (attribute.arrayItemType === 'number') {
      defaultValue = 0
    }
    else if (attribute.arrayItemType === 'boolean') {
      defaultValue = false
    }
    else if (attribute.arrayItemType === 'image') {
      defaultValue = { src: '', alt: '' }
    }
    else if (attribute.arrayItemType === 'object') {
      defaultValue = {}
    }

    targetData[attributeKey].push(defaultValue)
  }
}

const removeArrayAttributeItem = (itemIndex: number, attributeKey: string, arrayIndex: number) => {
  if (itemIndex === -1) {
    // Single component mode
    formData.value[attributeKey].splice(arrayIndex, 1)
  }
  else {
    // Array component mode
    arrayItems.value[itemIndex][attributeKey].splice(arrayIndex, 1)
  }
}

// Helper function to get the input type for HTML form elements
const getInputType = (attributeType: string): string => {
  switch (attributeType) {
    case 'number':
      return 'number'
    case 'boolean':
      return 'checkbox'
    default:
      return 'text'
  }
}
</script>

<template>
  <div class="space-y-4">
    <!-- Single Component Editor -->
    <div
      v-if="!isArray"
      class="space-y-2"
    >
      <label class="block text-sm font-medium text-gray-700">Custom Component Attributes</label>
      <div class="space-y-4">
        <div
          v-for="(attribute, key) in schema"
          :key="key"
          class="space-y-2"
        >
          <label
            :for="`attr-${key}`"
            class="block text-sm font-medium text-gray-700 capitalize"
          >
            {{ key }}
            <span class="text-xs text-gray-500">({{ attribute.type }}{{ attribute.arrayItemType ? `<${attribute.arrayItemType}>` : '' }})</span>
          </label>

          <!-- String input -->
          <input
            v-if="attribute.type === 'string'"
            :id="`attr-${key}`"
            v-model="formData[key]"
            type="text"
            class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="`Enter ${key}`"
          >

          <!-- Number input -->
          <input
            v-else-if="attribute.type === 'number'"
            :id="`attr-${key}`"
            v-model.number="formData[key]"
            type="number"
            class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="`Enter ${key}`"
          >

          <!-- Boolean input -->
          <div
            v-else-if="attribute.type === 'boolean'"
            class="flex items-center"
          >
            <input
              :id="`attr-${key}`"
              v-model="formData[key]"
              type="checkbox"
              class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            >
            <label
              :for="`attr-${key}`"
              class="ml-2 block text-sm text-gray-900"
            >
              Enable {{ key }}
            </label>
          </div>

          <!-- Rich Text input -->
          <textarea
            v-else-if="attribute.type === 'richtext'"
            :id="`attr-${key}`"
            v-model="formData[key]"
            rows="6"
            class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="`Enter ${key} (supports rich text)`"
          />

          <!-- Image input -->
          <div
            v-else-if="attribute.type === 'image'"
            class="space-y-2"
          >
            <input
              v-model="formData[key].src"
              type="text"
              placeholder="Image URL"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
            <input
              v-model="formData[key].alt"
              type="text"
              placeholder="Alt text"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
          </div>

          <!-- Array input -->
          <div
            v-else-if="attribute.type === 'array'"
            class="space-y-2"
          >
            <div class="flex justify-between items-center">
              <span class="text-sm text-gray-600">Array items ({{ attribute.arrayItemType }})</span>
              <button
                type="button"
                class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                @click="addArrayAttributeItem(-1, key)"
              >
                Add Item
              </button>
            </div>
            <div
              v-for="(item, index) in formData[key] || []"
              :key="index"
              class="flex items-center space-x-2"
            >
              <!-- String array item -->
              <input
                v-if="attribute.arrayItemType === 'string'"
                v-model="formData[key][index]"
                type="text"
                class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >

              <!-- Number array item -->
              <input
                v-else-if="attribute.arrayItemType === 'number'"
                v-model.number="formData[key][index]"
                type="number"
                class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >

              <!-- Boolean array item -->
              <input
                v-else-if="attribute.arrayItemType === 'boolean'"
                v-model="formData[key][index]"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >

              <!-- Image array item -->
              <div
                v-else-if="attribute.arrayItemType === 'image'"
                class="flex-1 space-x-2 flex"
              >
                <input
                  v-model="formData[key][index].src"
                  type="text"
                  placeholder="Image URL"
                  class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                <input
                  v-model="formData[key][index].alt"
                  type="text"
                  placeholder="Alt"
                  class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
              </div>

              <!-- Richtext array item -->
              <textarea
                v-else-if="attribute.arrayItemType === 'richtext'"
                v-model="formData[key][index]"
                rows="2"
                class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />

              <!-- Remove array item button -->
              <button
                type="button"
                class="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                @click="removeArrayAttributeItem(-1, key, index)"
              >
                ×
              </button>
            </div>
          </div>

          <!-- Object input (JSON textarea) -->
          <textarea
            v-else-if="attribute.type === 'object'"
            :id="`attr-${key}`"
            v-model="formData[key]"
            rows="4"
            class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="`Enter ${key} as JSON`"
          />

          <!-- Fallback for unknown types -->
          <input
            v-else
            :id="`attr-${key}`"
            v-model="formData[key]"
            type="text"
            class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            :placeholder="`Enter ${key}`"
          >
        </div>
      </div>
    </div>

    <!-- Array Component Editor -->
    <div
      v-else
      class="space-y-4"
    >
      <div class="flex justify-between items-center">
        <label class="block text-sm font-medium text-gray-700">Custom Component Array</label>
        <button
          type="button"
          class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
          @click="addArrayItem"
        >
          Add Component
        </button>
      </div>

      <div
        v-for="(item, itemIndex) in arrayItems"
        :key="itemIndex"
        class="border border-gray-200 rounded-lg p-4 space-y-4"
      >
        <div class="flex justify-between items-center">
          <h3 class="text-lg font-medium text-gray-700">
            Component {{ itemIndex + 1 }}
          </h3>
          <button
            type="button"
            class="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
            @click="removeArrayItem(itemIndex)"
          >
            Remove
          </button>
        </div>

        <div class="space-y-4">
          <div
            v-for="(attribute, key) in schema"
            :key="`${itemIndex}-${key}`"
            class="space-y-2"
          >
            <label class="block text-sm font-medium text-gray-700 capitalize">
              {{ key }}
              <span class="text-xs text-gray-500">({{ attribute.type }}{{ attribute.arrayItemType ? `<${attribute.arrayItemType}>` : '' }})</span>
            </label>

            <!-- Same input types as above but for array items -->
            <!-- String input -->
            <input
              v-if="attribute.type === 'string'"
              v-model="arrayItems[itemIndex][key]"
              type="text"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="`Enter ${key}`"
            >

            <!-- Number input -->
            <input
              v-else-if="attribute.type === 'number'"
              v-model.number="arrayItems[itemIndex][key]"
              type="number"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="`Enter ${key}`"
            >

            <!-- Boolean input -->
            <div
              v-else-if="attribute.type === 'boolean'"
              class="flex items-center"
            >
              <input
                v-model="arrayItems[itemIndex][key]"
                type="checkbox"
                class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              >
              <label class="ml-2 block text-sm text-gray-900">
                Enable {{ key }}
              </label>
            </div>

            <!-- Rich Text input -->
            <textarea
              v-else-if="attribute.type === 'richtext'"
              v-model="arrayItems[itemIndex][key]"
              rows="4"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="`Enter ${key} (supports rich text)`"
            />

            <!-- Image input -->
            <div
              v-else-if="attribute.type === 'image'"
              class="space-y-2"
            >
              <input
                v-model="arrayItems[itemIndex][key].src"
                type="text"
                placeholder="Image URL"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
              <input
                v-model="arrayItems[itemIndex][key].alt"
                type="text"
                placeholder="Alt text"
                class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
            </div>

            <!-- Array input -->
            <div
              v-else-if="attribute.type === 'array'"
              class="space-y-2"
            >
              <div class="flex justify-between items-center">
                <span class="text-sm text-gray-600">Array items ({{ attribute.arrayItemType }})</span>
                <button
                  type="button"
                  class="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                  @click="addArrayAttributeItem(itemIndex, key)"
                >
                  Add Item
                </button>
              </div>
              <div
                v-for="(subItem, subIndex) in arrayItems[itemIndex][key] || []"
                :key="subIndex"
                class="flex items-center space-x-2"
              >
                <!-- Same sub-item types as in single component -->
                <input
                  v-if="attribute.arrayItemType === 'string'"
                  v-model="arrayItems[itemIndex][key][subIndex]"
                  type="text"
                  class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >

                <input
                  v-else-if="attribute.arrayItemType === 'number'"
                  v-model.number="arrayItems[itemIndex][key][subIndex]"
                  type="number"
                  class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >

                <input
                  v-else-if="attribute.arrayItemType === 'boolean'"
                  v-model="arrayItems[itemIndex][key][subIndex]"
                  type="checkbox"
                  class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                >

                <div
                  v-else-if="attribute.arrayItemType === 'image'"
                  class="flex-1 space-x-2 flex"
                >
                  <input
                    v-model="arrayItems[itemIndex][key][subIndex].src"
                    type="text"
                    placeholder="Image URL"
                    class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                  <input
                    v-model="arrayItems[itemIndex][key][subIndex].alt"
                    type="text"
                    placeholder="Alt"
                    class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                </div>

                <textarea
                  v-else-if="attribute.arrayItemType === 'richtext'"
                  v-model="arrayItems[itemIndex][key][subIndex]"
                  rows="2"
                  class="flex-1 rounded-md border border-gray-300 shadow-sm px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />

                <button
                  type="button"
                  class="px-2 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                  @click="removeArrayAttributeItem(itemIndex, key, subIndex)"
                >
                  ×
                </button>
              </div>
            </div>

            <!-- Object input -->
            <textarea
              v-else-if="attribute.type === 'object'"
              v-model="arrayItems[itemIndex][key]"
              rows="4"
              class="w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              :placeholder="`Enter ${key} as JSON`"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-end">
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        @click="handleSave"
      >
        Save Changes
      </button>
    </div>
  </div>
</template>
