<script setup lang="ts">
const buttonText = useKatzeText({ key: 'button_text' })
</script>

<template>
  <div>
    <h1>INDEX</h1>
    <div class="flex flex-col">
      <div class="flex flex-row">
        <p class="text-2xl">
          Hello World
        </p>
        <button
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          kat-e="button_text"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
