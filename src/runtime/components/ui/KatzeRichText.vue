<script setup lang="ts">
import DOMParser from 'universal-dom-parser'
import { onMounted, ref, watch } from '#imports'

const props = defineProps({
  content: String,
})

const htmlElements = ref<Element[]>([])

onMounted(() => {
  updateHtmlElements(props.content || '')
})

watch(() => props.content, (content) => {
  updateHtmlElements(content || '')
})

const updateHtmlElements = (content: string) => {
  if (!content) return
  const parsedContent = new DOMParser().parseFromString(content, 'text/html')
  const elements = parsedContent.body.children
  htmlElements.value = Array.from(elements)
}
updateHtmlElements(props.content || '')

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
    v-for="(element, index) in htmlElements"
    :key="index+element.nodeName"
    v-hypertext="getElementContent(element)"
  />
</template>
