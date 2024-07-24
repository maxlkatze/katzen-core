<script setup lang="ts">
import { EditorContent, useEditor } from '@tiptap/vue-3'
import StarterKit from '@tiptap/starter-kit'
import Highlight from '@tiptap/extension-highlight'
import Placeholder from '@tiptap/extension-placeholder'
import { Extension } from '@tiptap/core'
import type { RouteComponent } from 'vue-router'
import { ComponentType, type KatzenUIComponent, useUiStore } from '../../stores/UiStore'
import type { ImageContent } from '../../composables/useUiComponents'
import { computed, defineAsyncComponent, onMounted, ref, shallowRef, useCookie, watch } from '#imports'
import { useAsyncData, useRouter } from '#app'





const hoverPosition = ref<HTMLElement | null>(null)
const routeWrapper = ref<HTMLElement | null>(null)

const hoveredElement = ref<HTMLElement | null>(null)
const selectedElement = ref<HTMLElement | null>(null)

const currentSelectedKey = ref<string | undefined>(undefined)
const currentSelectedComponent = ref<KatzenUIComponent | undefined>(undefined)

const selectedImage = ref<string | undefined>(undefined)



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


</script>
