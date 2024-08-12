<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/core'
import type { RouteComponent } from 'vue-router'
import { ComponentType, type KatzenUIComponent, useUiStore } from '../../stores/UiStore'
import type { ImageContent } from '../../composables/useUiComponents'
import { computed, defineAsyncComponent, onMounted, onUnmounted, ref, shallowRef, useCookie, watch } from '#imports'
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
    component: route.component,
  }))
})
type Lazy<T> = () => Promise<T>
interface Route {
  name: string
  path: string
  component: Lazy<RouteComponent> | RouteComponent | undefined | null
}

const selectedRoute = ref<Route>({
  name: '',
  path: '',
  component: undefined,
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
  const route = selectedRoute.value
  if (route.path && route.component) {
    // if route component is not a function wrap it in a function
    let implementation: Lazy<RouteComponent>
    if (typeof route.component === 'function') {
      implementation = route.component as Lazy<RouteComponent>
    }
    else {
      implementation = async () => route.component as RouteComponent
    }
    Route.value = defineAsyncComponent(implementation)
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
              element.removeAttribute('href')
              element.removeAttribute('target')
              element.addEventListener('click', (event) => {
                if (selectedElement.value === element) {
                  return
                }
                selectedElement.value = element

                //cancel click event
                event.preventDefault()
                event.stopPropagation()
                event.stopImmediatePropagation()

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
                      if (component.type === ComponentType.Text) {
                        editor.value?.commands.setContent(component.content as string)
                      }
                      else if (component.type === ComponentType.RichText) {
                        const parser = new DOMParser()
                        const dom = parser.parseFromString(component.content as string, 'text/html')
                        const pTags = dom.querySelectorAll('span')
                        const newDom = document.createElement('body')
                        pTags.forEach((pTag) => {
                          const p = document.createElement('p')
                          p.innerHTML = pTag.innerHTML
                          newDom.appendChild(p)
                        })
                        editor.value?.commands.setContent(newDom.innerHTML as string)
                      }
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

    window.addEventListener('resize', resizeListener)
  },
)

const resizeListener = () => {
  viewPortHeight.value = window.innerHeight
  viewPortWidth.value = window.innerWidth
}

onUnmounted(() => {
  window.removeEventListener('resize', resizeListener)
})

watch(hoveredElement, () => {
  const updatePosition = () => {
    if (hoverPosition.value && hoveredElement.value) {
      const elementPositionAbsolute = hoveredElement.value.getBoundingClientRect()
      hoverPosition.value.style.top = `${elementPositionAbsolute.top}px`
      hoverPosition.value.style.left = `${elementPositionAbsolute.left}px`
      hoverPosition.value.style.width = `${elementPositionAbsolute.width}px`
      hoverPosition.value.style.height = `${elementPositionAbsolute.height}px`
    }
  }
  if (hoverPosition.value && hoveredElement.value) {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition)
  }
  else if (!hoveredElement.value && hoverPosition.value) {
    hoverPosition.value.removeAttribute('style')
    window.removeEventListener('resize', updatePosition)
    window.removeEventListener('scroll', updatePosition)
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
        console.log(html)
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

const saveState = ref({
  loading: false,
  success: false,
  failed: false,
})

const hasSaveState = computed(() => saveState.value.loading || saveState.value.success || saveState.value.failed)

const saveUiContent = async () => {
  saveState.value.loading = true
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
  saveState.value.loading = false
  saveState.value.success = data.success
  saveState.value.failed = !data.success

  setTimeout(() => {
    saveState.value.success = false
    saveState.value.failed = false
  }, 2000)
}

interface PublishResponse {
  success: boolean
  missingDeployHookURL?: boolean
}

const publishPopup = ref(false)

const publishState = ref({
  loading: false,
  success: false,
  failed: false,
})

const hasPublishState = computed(() => publishState.value.loading || publishState.value.success || publishState.value.failed)

const deployContent = async () => {
  publishPopup.value = false

  publishState.value.loading = true
  const token = useCookie('token')
  console.log('deploy')
  const data: PublishResponse = await $fetch('/content-cms', {
    method: 'POST',
    body: {
      token: token.value,
      action: 'deploy',
    },
  })
  publishState.value.loading = false
  publishState.value.success = data.success
  publishState.value.failed = !data.success

  if (data.missingDeployHookURL) {
    errorPopup.value = true
    errorMessages.value.push('You need to set a deploy hook URL in the environment variables to publish the content.')
    errorMessages.value.push('If you\'re running the project locally, you can restart the server manually.')
  }

  setTimeout(() => {
    publishState.value.success = false
    publishState.value.failed = false
  }, 2000)
}

const errorPopup = ref(false)
const errorMessages = ref<string[]>([])

const closeErrorPopup = () => {
  errorPopup.value = false
  errorMessages.value = []
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

const mobileView = ref(false)
const viewPortHeight = ref(0)
const viewPortWidth = ref(0)

watch(mobileView, () => {
  if (mobileView.value) {
    // set meta viewport width to 768px
    // find if meta[name=viewport] exists if not create it
    const metaViewport = document.querySelector('meta[name=viewport]')
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=768, initial-scale=1')
    }
    else {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=768'
      document.head.appendChild(meta)
    }
  }
  else {
    // set meta viewport width to device-width
    // find if meta[name=viewport] exists if not create it
    const metaViewport = document.querySelector('meta[name=viewport]')
    if (metaViewport) {
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1')
    }
    else {
      const meta = document.createElement('meta')
      meta.name = 'viewport'
      meta.content = 'width=device-width'
      document.head.appendChild(meta)
    }
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
      <!--  grid when no route is selected -->
      <div
        class="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-4 xl:grid-cols-6 2xl:grid-cols-10 flex-col gap-2 h-full my-2 overflow-y-auto w-full items-start justify-start px-2"
        :class="{ '[&>*]:max-w-96': Route === undefined, '!flex': Route !== undefined }"
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
      class="flex-1 bg-slate-50 relative w-0 flex justify-center items-center"
      :class="{ '!w-full': Route }"
    >
      <!-- mobile size: width: 768px height: 1024px -->
      <div
        class="size-full bg-gray-300"
        :class="mobileView?['max-w-[390px]', 'max-h-[844px]']:[]"
      >
        <div class="size-full bg-white overflow-y-scroll route-container">
          <Route
            v-if="Route"
            :component="Route"
          />
        </div>
      </div>
    </div>

    <!-- hover overlay -->
    <div class="absolute inset-0 opacity-50 select-none touch-none pointer-events-none ontop">
      <div
        ref="hoverPosition"
        class="absolute z-20 -top-full -left-full bg-red-400/20 border-2 rounded border-red-500"
      />
    </div>

    <!-- selected overlay -->
    <div
      v-if="selectedElement"
      class="absolute inset-0 select-none touch-none pointer-events-none flex justify-center items-center ontop"
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

    <!-- Save Button -->
    <div class="fixed flex gap-2 bottom-0 right-0 m-4 ontop">
      <button
        class="relative bg-black text-white px-5 py-3 rounded-2xl transition-all flex items-center justify-center border-2 border-black"
        title="Save Changes"
        :class="{ '!text-black': hasSaveState,
                  'bg-white': hasSaveState }"
        @click="saveUiContent"
      >
        <img
          src="../../assets/icons/disk.svg"
          class="size-4 transition-all duration-300"
          :class="{ invert: !hasSaveState }"
          alt="loading"
        >
        <span
          class="transition-all duration-300 w-0 ml-0"
          :class="{ '!w-4': hasSaveState,
                    '!ml-2': hasSaveState }"
        >
          <template v-if="saveState.loading">
            <img
              src="../../assets/icons/loading.svg"
              class="size-4 animate-spin"
              alt="loading"
            >
          </template>
          <template v-if="saveState.success">
            <img
              src="../../assets/icons/check.svg"
              class="size-4"
              alt="check"
            >
          </template>
          <template v-if="saveState.failed">
            <img
              src="../../assets/icons/fail.svg"
              class="size-4"
              alt="fail"
            >
          </template>
        </span>
      </button>

      <!-- publish button -->
      <button
        class="relative bg-black text-white px-5 py-3 rounded-2xl transition-all flex items-center justify-center border-2 border-black"
        title="Deploy Content"
        :class="{ '!text-black': hasPublishState,
                  'bg-white': hasPublishState }"
        @click="publishPopup = true"
      >
        <img
          src="../../assets/icons/publish.svg"
          class="size-4 transition-all duration-300"
          :class="{ invert: !hasPublishState }"
          alt="loading"
        >
        <span
          class="transition-all duration-300 w-0 ml-0"
          :class="{ '!w-4': hasPublishState,
                    '!ml-2': hasPublishState }"
        >
          <template v-if="publishState.loading">
            <img
              src="../../assets/icons/loading.svg"
              class="size-4 animate-spin"
              alt="loading"
            >
          </template>
          <template v-if="publishState.success">
            <img
              src="../../assets/icons/check.svg"
              class="size-4"
              alt="check"
            >
          </template>
          <template v-if="publishState.failed">
            <img
              src="../../assets/icons/fail.svg"
              class="size-4"
              alt="fail"
            >
          </template>
        </span>
      </button>

      <button
        class="relative bg-black text-white px-5 py-3 rounded-2xl transition-all flex items-center justify-center border-2 border-black"
        :title="mobileView?'Switch to Desktop View':'Switch to Mobile View'"
        @click="mobileView = !mobileView"
      >
        <img
          v-if="mobileView"
          src="../../assets/icons/phone.svg"
          class="size-4 transition-all duration-300 invert"
          :class="{ invert: mobileView }"
          alt="phone"
        >
        <img
          v-else
          src="../../assets/icons/desktop.svg"
          class="size-4 transition-all duration-300 invert"
          :class="{ invert: mobileView }"
          alt="desktop"
        >
      </button>
    </div>

    <!-- publish popup -->
    <div
      v-if="publishPopup"
      class="fixed inset-0 bg-black/50 flex justify-center items-center ontop"
    >
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
            @click="deployContent"
          >
            Deploy
          </button>
          <button
            class="bg-red-500 text-white px-5 py-3 rounded-2xl"
            @click="publishPopup = false"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
    <!-- error popup -->
    <div
      v-if="errorPopup"
      class="fixed inset-0 bg-black/50 flex justify-center items-center ontop"
    >
      <div class="bg-white p-5 rounded border-black border-2 flex flex-col gap-5">
        <p class="font-mono font-bold uppercase flex flex-row">
          Something went wrong
          <img
            src="../../assets/icons/fail.svg"
            class="size-6 ml-auto cursor-pointer"
            alt="close"
            @click="closeErrorPopup"
          >
        </p>
        <div class="flex flex-col items-center gap-2 max-w-96">
          <p
            v-for="(message, index) in errorMessages"
            :key="index"
            class="font-mono"
          >
            {{ message }}
          </p>
          <button
            class="bg-black text-white px-5 py-3 rounded-2xl max-w-56 w-full"
            @click="closeErrorPopup"
          >
            Close
          </button>
        </div>
      </div>
    </div>
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

.ontop {
  z-index: 1000;
}

.route-container *[kat-e] {
  min-height: 24px;
  min-width: 24px;
  position: relative;
}

.route-container *[kat-e]:before {
  content: '';
  display: block;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;

  border: 2px dashed rgb(255 207 207 / 85%);
}
</style>
