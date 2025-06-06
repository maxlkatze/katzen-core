<script setup lang="ts">
import { watch, isRef, computed } from 'vue'
import type {
  CustomComponentSchema,
  CustomComponentArrayValue,
  CustomComponentContentType,
} from '../../../types/ContentTypes'
import { useKatzeCustomComponent } from '#imports'

const props = defineProps<{
  id: string
  schema: CustomComponentSchema
  defaultAttributes?: Record<string, unknown> | Array<Record<string, unknown>>
  isArray?: boolean
}>()

defineSlots<{
  default(props: { attributes: Record<string, CustomComponentContentType>, index?: number, length?: number }): unknown
  array(props: { items: Array<{ attributes: Record<string, unknown> }> }): unknown
}>()

const content = useKatzeCustomComponent({
  key: props.id,
  schema: props.schema,
  default: props.defaultAttributes,
  isArray: props.isArray,
})

// Computed property to get attributes from content
const attributes = computed(() => {
  if (isRef(content)) {
    const value = content.value
    if (Array.isArray(value)) {
      // For arrays, return first item or empty object
      const arrayValue = value as CustomComponentArrayValue as Array<Record<string, CustomComponentContentType>>
      return arrayValue.length > 0 ? arrayValue[0] : {}
    }
    else {
      // For single components, return plain object directly
      return (value as Record<string, CustomComponentContentType>) || {}
    }
  }
  else {
    if (Array.isArray(content)) {
      const arrayValue = content as CustomComponentArrayValue as Array<Record<string, CustomComponentContentType>>
      return arrayValue.length > 0 ? arrayValue[0] : {}
    }
    else {
      // For single components, return plain object directly
      return (content as Record<string, CustomComponentContentType>) || {}
    }
  }
})

// Computed property to get array items
const arrayItems = computed(() => {
  if (isRef(content)) {
    const value = content.value
    if (Array.isArray(value)) {
      const arrayValue = value as CustomComponentArrayValue as Array<Record<string, CustomComponentContentType>>
      return arrayValue.map(item => ({ attributes: item }))
    }
  }
  else {
    if (Array.isArray(content)) {
      const arrayValue = content as CustomComponentArrayValue as Array<Record<string, CustomComponentContentType>>
      return arrayValue.map(item => ({ attributes: item }))
    }
  }
  return []
})

// Watch for content changes and update the DOM element if needed
if (isRef(content)) {
  watch(content, (value) => {
    console.log('Custom Component Content Updated!', value)
    // You can add custom update logic here if needed
  })
}
</script>

<template>
  <div :kat-e="props.id">
    <!-- Single component mode -->
    <slot
      v-if="!props.isArray"
      :attributes="attributes"
    />

    <!-- Array component mode -->
    <slot
      v-else
      name="array"
      :items="arrayItems"
    >
      <!-- Default array rendering if no array slot provided -->
      <div
        v-for="(item, index) in arrayItems"
        :key="index"
        class="mb-4"
      >
        <slot
          :attributes="item.attributes"
          :index="index"
          :length="arrayItems.length"
        />
      </div>
    </slot>
  </div>
</template>

<style scoped>
</style>
