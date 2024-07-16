<script setup lang="ts">
defineProps({
  content: String,
})
</script>

<template>
  <div v-html="content" />
</template>
