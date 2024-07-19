<script setup lang="ts">
const customImage = useKatzeImage({ key: 'image_link' })
</script>

<template>
  <div>
    <h1>Image Test</h1>
    <div class="flex flex-col">
      <div class="flex flex-row">
        <div
          class="w-52 h-52"
          kat-e="image_link"
        >
          <img
            class="size-full"
            :src="customImage.src"
            :alt="customImage.alt"
          >
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
