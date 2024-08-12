<script setup lang="ts">
const section1 = ref<HTMLElement | null>(null)
const animation = useScrollAnimation({ element: section1 })

const globalScroll = useScrollAnimation({ global: true })
const screenScroll = useScrollAnimation({ screenHeight: true })
</script>

<template>
  <div>
    <h1>Animation Test Page</h1>
    <div class="flex flex-col">
      <div class="flex flex-row">
        <p>On this page the useAnimation Composables are tested</p>
      </div>
    </div>

    <div class="fixed bottom-0 left-0 font-bold text-2xl text-black bg-white p-4 border border-black rounded-lg">
      <span>GlobalScroll: {{ globalScroll }}</span>

      <br>

      <span>ScreenScroll: {{ screenScroll }}</span>
    </div>

    <div
      ref="section1"
      class="h-screen w-full bg-gray-100 flex flex-col items-center justify-between"
    >
      <h2>SECTION 1</h2>
      <p>{{ animation }}</p>
    </div>
    <div class="h-screen w-full bg-red-100 flex flex-col items-center justify-center">
      <h2>SECTION 2</h2>
    </div>

    <div class="h-screen w-full bg-red-100 flex flex-col items-center justify-center">
      <h2>SECTION 3</h2>
    </div>
  </div>
</template>

<style scoped>

</style>
