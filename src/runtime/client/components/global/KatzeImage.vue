<script setup lang="ts">
import { useKatzeImage } from '#imports'

const props = defineProps(
  {
    id: {
      type: String,
      required: true,
    },
    defaultSrc: {
      type: String,
      default: '',
    },
    defaultAlt: {
      type: String,
      default: '',
    },
  },
)

const content = useKatzeImage({
  key: props.id,
  default: {
    src: props.defaultSrc,
    alt: props.defaultAlt,
  },
})
</script>

<template>
  <img
    :src="content.src"
    :alt="content.alt"
    :kat-e="id"
  >
</template>

<style scoped>

</style>
