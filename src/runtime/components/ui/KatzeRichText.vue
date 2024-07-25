<script setup lang="ts">
import { onMounted, ref, watch } from '#imports'

const props = defineProps({
  content: String,
})

interface Node {
  type: string
}

interface ElementNode extends Node {
  tag: string
  nodes: Node[]
}

interface TextNode extends Node {
  text: string
}

interface RecursiveElementNode extends ElementNode {
  parent?: RecursiveElementNode
}

const parseIntoNodes = (html: string): Node[] => {
  // loop through characters
  const characters = html.split('')

  let tagOpen = false
  let tagEnd = false

  let currentElementTag = ''
  let currentTextContent = ''
  let currentElement: RecursiveElementNode | undefined = undefined

  const elementTree = []

  for (let i = 0; i < characters.length; i++) {
    const char = characters[i]

    if (tagOpen) {
      if (char === '/') {
        tagEnd = true
      }
      else if (char === '>') {
        tagOpen = false
        if (tagEnd) {
          // AN ELEMENT HAS ENDED
          if (currentElement) {
            currentElement = currentElement.parent
          }
        }
        else {
          // AN ELEMENT HAS STARTED
          const parent: RecursiveElementNode | undefined = currentElement
          currentElement = {
            tag: currentElementTag,
            nodes: [],
            parent,
            type: 'element',
          }
          if (parent) {
            parent.nodes.push(currentElement)
          }
          else {
            elementTree.push(currentElement)
          }

          if (currentElementTag === 'br') {
            currentElement = parent
            tagOpen = false
          }
        }
      }
      else {
        currentElementTag += char
      }
      continue
    }

    if (char === '<') {
      if (currentTextContent) {
        // A TEXT NODE HAS ENDED
        const textNode: TextNode = {
          text: currentTextContent,
          type: 'text',
        }
        currentTextContent = ''
        if (currentElement) {
          currentElement.nodes.push(textNode)
        }
        else {
          elementTree.push(textNode)
        }
      }
      currentElementTag = ''
      tagOpen = true
      tagEnd = false

      continue
    }

    currentTextContent += char
  }

  return elementTree
}

const nodesToHtml = (nodes: Node[]): string => {
  let html = ''
  for (const node of nodes) {
    if (node.type === 'element') {
      const element = node as ElementNode
      html += `<${element.tag}>${nodesToHtml(element.nodes)}</${element.tag}>`
    }
    else if (node.type === 'text') {
      const text = node as TextNode
      html += text.text
    }
  }
  return html
}

const parsedNodes = ref<Node[]>(parseIntoNodes(props.content || ''))

onMounted(() => {
  parsedNodes.value = parseIntoNodes(props.content || '')
})

watch(() => props.content, (content) => {
  parsedNodes.value = parseIntoNodes(content || '')
})

const getElementTag = (element: Node) => {
  if (element.type === 'element') {
    return (element as ElementNode).tag
  }
  return 'span'
}
const getElementContent = (element: Node) => {
  return element.type === 'element' ? nodesToHtml((element as ElementNode).nodes) : ''
}
</script>

<template>
  <component
    :is="getElementTag(element)"
    v-for="(element, index) in parsedNodes"
    :key="index+element.type"
    v-hypertext="getElementContent(element)"
  />
</template>
