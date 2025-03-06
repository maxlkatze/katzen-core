<script setup lang="ts">
import { effect, isRef, useKatzeText } from '#imports'

const props = defineProps(
  {
    id: {
      type: String,
      required: true,
    },
    defaultContent: {
      type: String,
      default: '',
    },
    element: {
      type: String,
      default: 'p',
    },
  },
)

const content = useKatzeText({
  key: props.id,
  default: props.defaultContent,
})

effect(() => {
  if (isRef(content)) {
    console.log('Content Updated!', content.value)
    // set innerHTML
    const element = document.querySelector(`[kat-e="${props.id}"]`)
    console.log('Element', element)
    if (element) {
      element.innerHTML = content.value as string
      console.log('Element Updated!')
    }
  }
})
</script>

<template>
  <component
    :is="element"
    :kat-e="props.id"
  >
    {{ content }}
  </component>
</template>

<style scoped>

</style>
