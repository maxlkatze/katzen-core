<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Highlight from '@tiptap/extension-highlight'
import { Extension } from '@tiptap/core'
import type { KatzenUIComponent } from '../../../../stores/UiStore'
import { ComponentType, useUiStore } from '../../../../stores/UiStore'
import type { ImageListResponse, MenuEntry } from '../../../../types/EditTypes'
import { computed, type ImageContent, ref, useCookie, watch } from '#imports'
import { useAsyncData } from '#app'

// COMPOSABLE
const uiStore = useUiStore()

// PROPS & EMITS
const props = defineProps({
  selectedKey: {
    type: String,
  },
})

defineEmits(['close'])

// VARIABLES
const selectedComponent = ref<KatzenUIComponent | undefined>(undefined)
const selectedImage = ref<string | undefined>(undefined)

// EDITOR
const editor = useEditor({
  content: '',
  editorProps: {
    attributes: {
      class: 'focus:outline-none py-4',
    },
  },
  extensions: [
    StarterKit.configure(),
    Placeholder.configure({
      placeholder: ({ node }) => (node.type.name === 'heading' ? 'What’s the title?' : 'Write something …'),
    }),
    Highlight.configure({
      HTMLAttributes: {
        class: 'highlight-text',
      },
    }),
    Extension.create({
      addKeyboardShortcuts() {
        const isTextType = () => selectedComponent.value?.type === ComponentType.Text
        return {
          'Enter': isTextType,
          'Shift-Enter': isTextType,
          'Cmd-Enter': isTextType,
          'Ctrl-Enter': isTextType,
        }
      },
    }),
  ],
  onUpdate({ editor }) {
    if (!props.selectedKey || !selectedComponent.value) return

    const html = editor.getHTML()
    const dom = new DOMParser().parseFromString(html, 'text/html')
    const text = dom.body.textContent || ''
    const { type, content } = selectedComponent.value

    switch (type) {
      case ComponentType.RichText: {
        const spans = Array.from(dom.querySelectorAll('p'))
          .map(pTag => pTag.innerHTML.trim().length == 0 ? '' : `<span>${pTag.innerHTML}</span>`)
          .join('<br>')
        uiStore.updateUiContent(props.selectedKey, spans)
        break
      }
      case ComponentType.Text:
        uiStore.updateUiContent(props.selectedKey, text)
        break
      case ComponentType.Image: {
        const { src } = content as ImageContent || { src: '', alt: '' }
        uiStore.updateUiContent(props.selectedKey, { src, alt: text })
        break
      }
      default:
        break
    }
  },
})

// WATCHERS
watch(() => props.selectedKey, (value) => {
  if (!value) return

  const component = uiStore.getComponents(value)
  if (!component) return

  selectedComponent.value = component

  const { type, content } = component

  switch (type) {
    case ComponentType.Image: {
      const imageContent = content as ImageContent || { src: '', alt: '' }
      editor.value?.commands.setContent(imageContent.alt)
      selectedImage.value = imageContent.src
      break
    }
    case ComponentType.Text: {
      editor.value?.commands.setContent(content as string)
      break
    }
    case ComponentType.RichText: {
      const parser = new DOMParser()
      const dom = parser.parseFromString(content as string, 'text/html')
      const paragraphs = Array.from(dom.querySelectorAll('span'))
        .map(pTag => `<p>${pTag.innerHTML}</p>`)
        .join('')
      editor.value?.commands.setContent(paragraphs)
      break
    }
    default:
      break // Optional: Handle unexpected component types
  }
})

watch(selectedImage, () => {
  if (selectedImage.value && props.selectedKey) {
    const content = selectedComponent.value?.content as ImageContent || { src: '', alt: '' }
    uiStore.updateUiContent(props.selectedKey, {
      src: selectedImage.value,
      alt: content.alt,
    })
  }
})

// ASYNC DATA
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

// COMPUTED
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

// OPTIONS
const formattingOptions = [
  { name: 'Bold', command: 'toggleBold' },
  { name: 'Italic', command: 'toggleItalic' },
  { name: 'Strike', command: 'toggleStrike' },
  { name: 'Highlight', command: 'toggleHighlight' },
]

const menuEntries: MenuEntry[] = formattingOptions.map(({ name, command }) => ({
  name,
  click: () => editor.value?.chain().focus()[command]()?.run(),
  active: () => editor.value?.isActive(command) || false,
}))
</script>

<template>
  <div
    v-if="selectedKey"
    class="absolute inset-0 select-none touch-none pointer-events-none flex justify-center items-center ontop"
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
          @click="$emit('close')"
        >
      </div>

      <div
        v-if="editor && selectedComponent?.type === ComponentType.RichText"
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

      <template v-if="selectedComponent?.type === ComponentType.Image">
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

<style scoped>

</style>
