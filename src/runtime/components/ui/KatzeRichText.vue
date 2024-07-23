<script setup lang="ts">
import { onMounted, ref, watch } from '#imports'

// Load DOMParser for Server and Client
let DOMParser: unknown = undefined

if (import.meta.client) {
  if (window.DOMParser) {
    DOMParser = window.DOMParser
  }
}
else {
  try {
    const { JSDOM } = await import('jsdom')
    DOMParser = new JSDOM().window.DOMParser
  }
  catch (e) {
    console.error(e)
    throw new Error('DOMParser could not be loaded')
  }
}

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
  if (!DOMParser) return
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
