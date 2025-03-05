<script setup lang="ts">
import { useKatzeRichText } from '#imports'

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
  },
)

const content = useKatzeRichText({
  key: props.id,
  default: props.defaultContent,
})
</script>

<template>
  <div
    v-hypertext="content"
    :kat-e="id"
  />
</template>
