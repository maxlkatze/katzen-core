<script setup lang="ts">
// EMITS
defineEmits(['deploy', 'close'])
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex justify-center items-center ontop">
    <div class="bg-white p-5 rounded border-black border-2 flex flex-col gap-5">
      <p class="font-mono font-bold uppercase">
        Deploy Content
      </p>
      <p class="font-mono">
        Are you sure you want to publish the changes?
      </p>
      <p class="font-mono">
        This will trigger a rebuild of the website.
      </p>
      <div class="flex flex-row gap-5 font-mono">
        <button
          class="bg-black text-white px-5 py-3 rounded-2xl"
          @click="$emit('deploy')"
        >
          Deploy
        </button>
        <button
          class="bg-red-500 text-white px-5 py-3 rounded-2xl"
          @click="$emit('close')"
        >
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
