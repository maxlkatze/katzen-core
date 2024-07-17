<script setup lang="ts">
import { onMounted, ref, watch } from '#imports'

const props = defineProps({
  content: String,
})

const htmlELements = ref<Element[]>([])

onMounted(() => {
  updateHtmlElements(props.content || '')
})

watch(() => props.content, content => updateHtmlElements(content || ''))

const updateHtmlElements = (content: string) => {
  if (!content) return
  const parsedContent = new DOMParser().parseFromString(content, 'text/html')
  const elements = parsedContent.body.children
  htmlELements.value = Array.from(elements)
}

const getElementTag = (element: Element) => {
  return element.tagName.toLowerCase()
}
const getElementContent = (element: Element) => {
  return element.innerHTML
}
</script>

<template>
  <component
    :is="getElementTag(element)"
    v-for="(element, index) in htmlELements"
    :key="index"
    v-html="getElementContent(element)"
  />
</template>
