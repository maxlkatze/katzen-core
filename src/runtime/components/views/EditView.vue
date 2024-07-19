<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/core'
import { ComponentType, type KatzenUIComponent, useUiStore } from '../../stores/UiStore'
import type { ImageContent } from '../../composables/useUiComponents'
import { computed, defineAsyncComponent, onMounted, ref, shallowRef, useCookie, watch } from '#imports'
import { useAsyncData, useRouter } from '#app'

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

const router = useRouter()
const routes = router.options.routes
const filteredRoutes = computed((): Route[] => {
  const filteredRoutes = routes.filter(route => (route.name !== 'katze-cms' && route.name !== 'katze-cms-login'))
  return filteredRoutes.map(route => ({
    name: route.name?.toString() || route.path,
    path: route.path,
  }))
})

interface Route {
  name: string
  path: string
}

const selectedRoute = ref<Route>({
  name: '',
  path: '',
})

const Route = shallowRef<unknown>(undefined)

const hoverPosition = ref<HTMLElement | null>(null)
const routeWrapper = ref<HTMLElement | null>(null)

const hoveredElement = ref<HTMLElement | null>(null)
const selectedElement = ref<HTMLElement | null>(null)

const currentSelectedKey = ref<string | undefined>(undefined)
const currentSelectedComponent = ref<KatzenUIComponent | undefined>(undefined)

const selectedImage = ref<string | undefined>(undefined)

watch(selectedRoute, async () => {
  if (selectedRoute.value.path) {
    Route.value = await defineAsyncComponent(() => import(`~/pages/${selectedRoute.value.name}.vue`))
  }
  selectedElement.value = null
})

onMounted(
  // add mutation observer to routeWrapper
  () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // find all elements
          const elements = routeWrapper.value?.querySelectorAll('*[kat-e]')

          if (elements) {
            elements.forEach((element: Element) => {
              if (!(element instanceof HTMLElement)) {
                return
              }
              element.addEventListener('mouseover', () => {
                hoveredElement.value = element
              })
              element.addEventListener('mouseleave', () => {
                hoveredElement.value = null
              })
              element.addEventListener('click', (event) => {
                if (selectedElement.value === element) {
                  return
                }
                selectedElement.value = element

                const attribute = selectedElement.value.getAttribute('kat-e')
                if (attribute) {
                  const component = uiStore.getComponents(attribute)
                  if (component) {
                    currentSelectedKey.value = attribute
                    currentSelectedComponent.value = component

                    if (component.type === ComponentType.Image) {
                      const content = component.content as ImageContent || { src: '', alt: '' }
                      editor.value?.commands.setContent(content.alt)
                      selectedImage.value = content.src
                    }
                    else {
                      editor.value?.commands.setContent(component.content as string)
                    }
                  }
                }
                event.stopPropagation()
                event.preventDefault()
              })
            })
          }
        }
      })
    })

    observer.observe(routeWrapper.value as Node, {
      childList: true,
      subtree: true,
    })
  },
)

watch(hoveredElement, () => {
  if (hoverPosition.value && hoveredElement.value) {
    const elementPositionAbsolute = hoveredElement.value.getBoundingClientRect()
    hoverPosition.value.style.top = `${elementPositionAbsolute.top}px`
    hoverPosition.value.style.left = `${elementPositionAbsolute.left}px`
    hoverPosition.value.style.width = `${elementPositionAbsolute.width}px`
    hoverPosition.value.style.height = `${elementPositionAbsolute.height}px`
  }
  else if (!hoveredElement.value && hoverPosition.value) {
    hoverPosition.value.removeAttribute('style')
  }
})

defineEmits(['openHomePage'])

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

const uiStore = useUiStore()

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

interface SaveResponse {
  success: boolean
}

const saveLoading = ref(false)
const saveSuccess = ref(false)
const saveUiContent = async () => {
  saveLoading.value = true
  const uiContent = uiStore.getUiContent()
  const token = useCookie('token')
  const data: SaveResponse = await $fetch('/content-cms', {
    method: 'POST',
    body: {
      token: token.value,
      content: uiContent,
      action: 'save',
    },
  })
  saveLoading.value = false
  saveSuccess.value = data.success

  setTimeout(() => {
    saveSuccess.value = false
  }, 2000)
}

interface ImageListResponse {
  body: {
    images: string[]
  }
}

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
const fillEmptySpace = computed(() => {
  const rest = 9 - imageResponse.value.body.images.length
  if (rest > 0) {
    return Array.from({ length: rest }).fill('')
  }

  // if not 3 last images, fill with empty strings
  const mod = imageResponse.value.body.images.length % 3
  if (mod > 0) {
    return Array.from({ length: 3 - mod }).fill('')
  }
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
  <div class="h-screen w-full flex flex-row">
    <div
      class="w-full h-full bg-amber-50 flex flex-col"
      :class="{ '!w-52': Route!==undefined }"
    >
      <div
        class="flex flex-row gap-2 justify-center p-2 m-4 border-black border-2 rounded hover:drop-shadow cursor-pointer transition-all"
        @click="$emit('openHomePage')"
      >
        <img
          src="../../assets/icons/back_arrow.svg"
          class="size-6"
          alt="arrow_back"
        >
        <p
          class="font-mono font-bold uppercase"
        >
          Back to Menu
        </p>
      </div>

      <div class="flex flex-col items-center justify-center">
        <h2 class="font-mono text-xl uppercase font-bold m-0 p-0">
          Edit Pages
        </h2>
      </div>

      <div
        class="flex flex-col flex-wrap gap-2 h-full my-2 overflow-y-auto w-full items-start justify-start px-2"
        :class="{ '[&>*]:max-w-48': Route === undefined, '!flex-row': Route === undefined }"
      >
        <div
          v-for="route in filteredRoutes"
          :key="route.path"
          class="w-full px-2 py-1 border-black border-2 rounded hover:bg-black/10 hover:animate-pulse cursor-pointer"
          :class="{ 'border-purple-400': selectedRoute.path === route.path }"
          @click="selectedRoute = route"
        >
          <p class="text-black opacity-50 uppercase text-sm font-mono">
            {{ route.path }}
          </p>
          <p class="text-black uppercase font-bold font-mono">
            {{ route.name }}
          </p>
        </div>
      </div>
    </div>
    <div
      ref="routeWrapper"
      class="flex-1 bg-slate-50 overflow-y-scroll relative w-0"
      :class="{ '!w-full': Route }"
    >
      <component
        :is="Route"
        v-if="Route"
      />
    </div>
  </div>

  <!-- hover overlay -->
  <div class="absolute inset-0 opacity-50 z-10 select-none touch-none pointer-events-none">
    <div
      ref="hoverPosition"
      class="absolute z-20 -top-full -left-full bg-red-400/20 border-2 rounded border-red-500"
    />
  </div>

  <!-- selected overlay -->
  <div
    v-if="selectedElement"
    class="absolute inset-0 z-10 select-none touch-none pointer-events-none flex justify-center items-center"
  >
    <div class="relative z-40  flex flex-col pointer-events-auto bg-white p-5 border-black border-2 rounded max-w-96 w-full">
      <div class="flex flex-row items-center mb-6">
        <p class="font-mono font-bold uppercase">
          Change Element Value
        </p>
        <img
          src="../../assets/icons/close.svg"
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
          <button
            class="bg-black text-white px-5 py-3 rounded-2xl transition-all flex
          justify-center content-center items-center justify-items-center border-2 border-black"
          >
            Upload Image
          </button>
          <span>OR</span>
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
              v-for="(image, index) in fillEmptySpace"
              :key="index"
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

  <!-- Save Button -->
  <div class="fixed bottom-0 right-0 m-4">
    <button
      class="bg-black text-white px-5 py-3 rounded-2xl transition-all flex items-center justify-center border-2 border-black"
      :class="{ '!text-black': saveSuccess || saveLoading, 'bg-white': saveSuccess || saveLoading }"
      @click="saveUiContent"
    >
      <img
        src="../../assets/icons/disk.svg"
        class="size-4 mr-2 transition-all duration-300"
        :class="{ invert: !saveSuccess && !saveLoading }"
        alt="loading"
      >
      Save Draft
      <span
        class="transition-all duration-300 w-0 ml-0"
        :class="{ '!w-4': saveLoading || saveSuccess, '!ml-2': saveLoading || saveSuccess }"
      >
        <template v-if="saveLoading">
          <img
            src="../../assets/icons/loading.svg"
            class="size-4 animate-spin"
            alt="loading"
          >
        </template>
        <template v-if="saveSuccess">
          <img
            src="../../assets/icons/check.svg"
            class="size-4"
            alt="check"
          >
        </template>
      </span>
    </button>
  </div>
</template>

<style>
.overflow-y-auto {
  scrollbar-width: thin;
}

*[data-placeholder]::before {
  color: #ccc;
  content: attr(data-placeholder);
  float: left;
  height: 0;
  pointer-events: none;
}
</style>
