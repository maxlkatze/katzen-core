<script setup lang="ts">
const rich_text = useKatzeRichText({ key: 'rich_text' })
</script>

<template>
  <div>
    <h1>Test Page</h1>
    <div class="flex flex-col">
      <div class="flex flex-row">
        <p
          class="text-2xl min-w-20 min-h-20"
          kat-e="rich_text"
        >
          <katze-rich-text :content="rich_text" />
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
