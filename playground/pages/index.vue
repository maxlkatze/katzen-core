<script setup lang="ts">
const editableText = useKatzeText({
  key: 'editable_text',
  default: 'Katze is a Nuxt module that allows you to manage your content on the fly. This is an editable text.',
})
const buttonText = useKatzeText({ key: 'button_text', default: 'The text on this button is also editable.' })

const richTextExample = useKatzeRichText({ key: 'rich_text_example',
  default: '<span>This is a rich text example. You can edit this text add italics and boldness and more.</span>',
})
</script>

<template>
  <div class="size-full flex flex-col items-center">
    <h1 class="text-4xl font-bold font-mono py-20">
      Katze CMS Playground
    </h1>
    <div class="flex flex-col gap-5">
      <p
        class="text-2xl"
        kat-e="editable_text"
      >
        {{ editableText }}
      </p>
      <button
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        kat-e="button_text"
      >
        {{ buttonText }}
      </button>

      <p
        class="text-2xl"
        kat-e="rich_text_example"
      >
        <katze-rich-text :content="richTextExample" />
      </p>
    </div>
  </div>
</template>

<style scoped>

</style>
