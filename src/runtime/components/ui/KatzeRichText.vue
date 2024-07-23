<script setup lang="ts">
import { parse, type HTMLElement } from 'node-html-parser'
import { onMounted, ref, watch } from '#imports'

const props = defineProps({
  content: String,
})

const htmlElements = ref<HTMLElement[]>()

onMounted(() => {
  updateHtmlElements(props.content || '')
})

watch(() => props.content, (content) => {
  updateHtmlElements(content || '')
})

const updateHtmlElements = (content: string) => {
  if (!content) return
  const parsedContent = parse(content)
  htmlElements.value = parsedContent.childNodes as HTMLElement[]
}

updateHtmlElements(props.content || '')

const getElementTag = (element: HTMLElement) => {
  return element.rawTagName
}
const getElementContent = (element: HTMLElement) => {
  return element.innerHTML
}
</script>

<template>
  <component
    :is="getElementTag(element)"
    v-for="(element, index) in htmlElements"
    :key="index+element.rawTagName"
    v-hypertext="getElementContent(element)"
  />
</template>
