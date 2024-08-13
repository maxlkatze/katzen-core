<script setup lang="ts">
// PROPS & EMITS
defineProps({
  messages: Array,
})
defineEmits(['close'])
</script>

<template>
  <div
    class="fixed inset-0 bg-black/50 flex justify-center items-center ontop"
  >
    <div class="bg-white p-5 rounded border-black border-2 flex flex-col gap-5">
      <p class="font-mono font-bold uppercase flex flex-row">
        Something went wrong
        <img
          src="../../../../assets/icons/fail.svg"
          class="size-6 ml-auto cursor-pointer"
          alt="fail"
        >
      </p>
      <div class="flex flex-col items-center gap-2 max-w-96">
        <p
          v-for="(message, index) in messages"
          :key="index"
          class="font-mono"
        >
          {{ message }}
        </p>
        <button
          class="bg-black text-white px-5 py-3 rounded-2xl max-w-56 w-full"
          @click="$emit('close')"
        >
          Close
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
