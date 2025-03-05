<script setup lang="ts">
import { useKatzeText } from '#imports'

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
