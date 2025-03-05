<script setup lang="ts">
// implement model into input component
defineProps({
  placeholder: {
    type: String,
    default: '',
  },
  type: {
    type: String,
    default: 'text',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  error: {
    type: Boolean,
    default: false,
  },
})
const model = defineModel({
  type: String,
})
</script>

<template>
  <input
    v-model="model"
    :placeholder="placeholder"
    :type="type"
    :disabled="disabled"
    :class="{
      'border-red-500': error,
    }"
    class="px-5 py-2 rounded-2xl border-black border-2"
  >
</template>

<style scoped>

</style>
