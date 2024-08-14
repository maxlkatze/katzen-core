<script setup lang="ts">
const editableText = useKatzeText({
  key: 'editable_text',
  default: 'Katze is a Nuxt module that allows you to manage your content on the fly. This is an editable text.',
})
const buttonText = useKatzeText({ key: 'button_text', default: 'The text on this button is also editable.' })

const richTextExample = useKatzeRichText({ key: 'rich_text_example',
  default: '<span>This is a rich text example. You can edit this text add italics and boldness and more.</span>',
})

const customImage = useKatzeImage({ key: 'custom_image', default: { src: '/images/test.svg', alt: 'Placeholder Image' } })
</script>

<template>
  <div class="size-full flex flex-col items-center">
    <NuxtLink
      class="bg-red-500 hover:bg-red-700 text-white font-bold p-4 m-2 w-1/2 text-center transition-colors
       rounded"
      to="/cms"
    >
      Go to CMS
    </NuxtLink>
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
      <NuxtLink
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        kat-e="button_text"
        to="/animation_test"
      >
        Hardcoded Text and {{ buttonText }}
      </NuxtLink>

      <p
        class="text-2xl"
        kat-e="rich_text_example"
      >
        <katze-rich-text :content="richTextExample" />
      </p>

      <div
        class="w-52 h-52"
        kat-e="custom_image"
      >
        <img
          class="size-full"
          :src="customImage.src"
          :alt="customImage.alt"
        >
      </div>

      <div class="flex flex-row gap-5">
        <NuxtLink
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          to="/addon_device"
        >
          Device Addon
        </NuxtLink>

        <NuxtLink
          class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          to="/animation_test"
        >
          Animation Addon
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
