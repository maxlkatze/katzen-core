<script setup lang="ts">

import {ComponentType, useUiStore} from '../../../../stores/UiStore';
import {Extension} from '@tiptap/core';
import {useEditor} from '@tiptap/vue-3';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Highlight from '@tiptap/extension-highlight';
import type {ImageContent} from '~/src/runtime/composables/useUiComponents';
import {useAsyncData} from '#app';
import {computed, useCookie, watch} from '#imports';

const uiStore = useUiStore()

const DisableEnter = Extension.create({
  addKeyboardShortcuts() {
    return {
      'Enter': () => {
        return currentSelectedComponent.value?.type == ComponentType.Text
      },
      'Shift-Enter': () => {
        return currentSelectedComponent.value?.type == ComponentType.Text
      },
      'Cmd-Enter': () => {
        return currentSelectedComponent.value?.type == ComponentType.Text
      },
      'Ctrl-Enter': () => {
        return currentSelectedComponent.value?.type == ComponentType.Text
      },
    }
  },
})

const editor = useEditor({
  content: '',
  editorProps: {
    attributes: {
      class: 'focus:outline-none py-4',
    },
  },
  extensions: [StarterKit.configure(), Placeholder.configure({
      placeholder: ({ node }) => {
        if (node.type.name === 'heading') {
          return 'What’s the title?'
        }

        return 'Write something …'
      },
    },
  ),
    Highlight.configure({
      HTMLAttributes: {
        class: 'hightlight-text',
      },
    }),
    DisableEnter,
  ],
  onUpdate({ editor }) {
    if (currentSelectedKey.value) {
      const html = editor.getHTML()
      const dom = new DOMParser().parseFromString(html, 'text/html')
      const text = dom.body.textContent || ''

      if (currentSelectedComponent.value?.type === ComponentType.RichText) {
        const newDom = document.createElement('body')
        const pTags = dom.querySelectorAll('p')
        pTags.forEach((pTag, index) => {
          const span = document.createElement('span')
          span.innerHTML = pTag.innerHTML
          newDom.appendChild(span)
          if (index !== pTags.length - 1) {
            const br = document.createElement('br')
            newDom.appendChild(br)
          }
        })
        uiStore.updateUiContent(currentSelectedKey.value, newDom.innerHTML)
      }
      else if (currentSelectedComponent.value?.type === ComponentType.Text) {
        uiStore.updateUiContent(currentSelectedKey.value, text)
      }
      else if (currentSelectedComponent.value?.type === ComponentType.Image) {
        const content = currentSelectedComponent.value.content as ImageContent || { src: '', alt: '' }
        uiStore.updateUiContent(currentSelectedKey.value, {
          src: content.src,
          alt: text,
        })
      }
    }
  },

})

interface MenuEntry {
  name: string
  click: () => void
  active: () => boolean
}

const menuEntries: MenuEntry[] = [
  {
    name: 'Bold',
    click: () => { editor.value?.chain().focus().toggleBold().run() },
    active: () => editor.value?.isActive('bold') || false,
  },
  {
    name: 'Italic',
    click: () => { editor.value?.chain().focus().toggleItalic().run() },
    active: () => editor.value?.isActive('italic') || false,
  },
  {
    name: 'Strike',
    click: () => { editor.value?.chain().focus().toggleStrike().run() },
    active: () => editor.value?.isActive('strike') || false,
  },
  {
    name: 'Highlight',
    click: () => { editor.value?.chain().focus().toggleHighlight().run() },
    active: () => editor.value?.isActive('highlight') || false,
  },
]


const { data: imageResponse } = useAsyncData(async () => await $fetch<ImageListResponse>('/content-cms', {
  method: 'POST',
  body: {
    token: useCookie('token').value,
    action: 'imageList',
  },
}), {
  default: (): ImageListResponse => ({
    body: {
      images: [],
    },
  }),
})

// if the images are not 9 in total, add empty strings to the array
const fillEmptySpace = computed((): string[] => {
  const rest = 9 - imageResponse.value.body.images.length
  if (rest > 0) {
    return Array.from({ length: rest }).fill('') as string[]
  }

  // if not 3 last images, fill with empty strings
  const mod = imageResponse.value.body.images.length % 3
  if (mod > 0) {
    return Array.from({ length: 3 - mod }).fill('') as string[]
  }

  return []
})

watch(selectedImage, () => {
  if (selectedImage.value && currentSelectedKey.value) {
    const content = currentSelectedComponent.value?.content as ImageContent || { src: '', alt: '' }
    uiStore.updateUiContent(currentSelectedKey.value, {
      src: selectedImage.value,
      alt: content.alt,
    })
  }
})
</script>

<template>
<div
  v-if="selectedElement"
  class="absolute inset-0 select-none touch-none pointer-events-none flex justify-center items-center katze-edit-ontop"
>
  <div class="relative z-40  flex flex-col pointer-events-auto bg-white p-5 border-black border-2 rounded max-w-96 w-full">
    <div class="flex flex-row items-center mb-6">
      <p class="font-mono font-bold uppercase">
        Change Element Value
      </p>
      <img
        src="../../../../assets/icons/close.svg"
        class="size-6 ml-auto cursor-pointer"
        alt="close"
        @click="selectedElement=null; currentSelectedKey=undefined"
      >
    </div>

    <div
      v-if="editor && currentSelectedComponent?.type === ComponentType.RichText"
      class="bg-white mb-2 border-b-2 border-black/10 pb-2"
    >
      <div class="flex flex-row flex-wrap gap-2">
        <button
          v-for="(entry, index) in menuEntries"
          :key="index"
          :class="entry.active()?'bg-amber-50':''"
          class="border border-b-2 p-0.5 border-black rounded "
          @click="entry.click"
        >
          {{ entry.name }}
        </button>
      </div>
    </div>
    <!-- IMAGE CHOOSER / UPLOAD -->

    <template v-if="currentSelectedComponent?.type === ComponentType.Image">
      <div class="flex flex-col items-center">
        <div class="h-72 w-72 grid grid-cols-3 grid-flow-row overflow-y-auto justify-center items-center">
          <div
            v-for="(image, index) in imageResponse.body.images"
            :key="index"
            class="w-full aspect-square"
          >
            <img
              :src="image"
              class="object-cover size-full hover:drop-shadow cursor-pointer border-2 border-transparent
                contain-inline-size hover:border-purple-400 transition-colors duration-300 rounded"
              alt="image"
              :class="{ 'border-yellow-500': selectedImage === image, 'animate-pulse': selectedImage === image }"
              @click="selectedImage = image"
            >
          </div>
          <div
            v-for="(k, i) in fillEmptySpace"
            :key="k+i"
            class="w-full contain-inline-size cursor-not-allowed rounded border-2 border-transparent aspect-square"
          >
            <div class="bg-gray-100 size-full" />
          </div>
        </div>
      </div>
      <p class="font-mono font-bold">
        ALT:
      </p>
    </template>

    <!-- TEXT INPUT -->
    <EditorContent
      class="size-full max-h-72 overflow-y-auto border-b-2 border-black"
      :editor="editor"
    />
  </div>
</div>
</template>

<style>
*[data-placeholder]::before {
  color: #ccc;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
