<script setup lang="ts">
import { onMounted, ref, watch } from '#imports'

// PROPS & EMITS
defineProps({
  routeComponent: Object,
  emulateMobile: Boolean,
})

const currentHoveredElement = ref<HTMLElement | undefined>(undefined)

const emit = defineEmits(['hoverElement', 'selectKey'])

// ELEMENTS
const routeWrapper = ref<HTMLElement | null>(null)

// HOOKS
onMounted(
  () => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          // find all kat-e elements
          const elements = routeWrapper.value?.querySelectorAll('*[kat-e]')
          if (elements) {
            elements.forEach((element: Element) => {
              if (!(element instanceof HTMLElement)) {
                return
              }
              if (element.hasAttribute('listening')) {
                return
              }
              element.addEventListener('mouseover', () => {
                console.log('hover')
                emit('hoverElement', element)
                currentHoveredElement.value = element
              })
              element.addEventListener('mouseleave', (event) => {
                // Check if we're moving to our overlay
                const relatedTarget = event.relatedTarget as HTMLElement
                if (relatedTarget && relatedTarget.closest('.element-overlay-container')) {
                  return // Don't trigger mouseleave when moving to our overlay
                }

                emit('hoverElement', undefined)
                currentHoveredElement.value = undefined
              })
              element.addEventListener('click', (event) => {
                // cancel click event
                event.preventDefault()
                event.stopPropagation()
                event.stopImmediatePropagation()

                const attribute = element.getAttribute('kat-e')
                if (attribute) {
                  emit('selectKey', attribute)
                }
                event.stopPropagation()
                event.preventDefault()
              })
              element.setAttribute('listening', '')
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

// the overlay should overlay a box with a editing "pen" icon on the top right corner of the element
// the overlay should have a blue background with 10% opacity, and red border 2px width and dotted

const elementPosition = ref({ x: 0, y: 0, width: 0, height: 0 })

watch(currentHoveredElement, (element) => {
  if (element) {
    const rect = element.getBoundingClientRect()
    // remove the parent position from the location ( get relative to parent )
    elementPosition.value = {
      x: rect.x - routeWrapper.value!.getBoundingClientRect().x,
      y: rect.y - routeWrapper.value!.getBoundingClientRect().y,
      width: rect.width,
      height: rect.height,
    }
  }
})

// when scrollContainer scrolls update element position
const scrollContainer = ref<HTMLElement | null>(null)
watch(scrollContainer, (container) => {
  if (container) {
    container.addEventListener('scroll', () => {
      if (currentHoveredElement.value) {
        const rect = currentHoveredElement.value.getBoundingClientRect()
        // remove the parent position from the location ( get relative to parent )
        elementPosition.value = {
          x: rect.x - routeWrapper.value!.getBoundingClientRect().x,
          y: rect.y - routeWrapper.value!.getBoundingClientRect().y,
          width: rect.width,
          height: rect.height,
        }
      }
    })
  }
})

// Handle the overlay element itself
const handleOverlayMouseLeave = (event: MouseEvent) => {
  const relatedTarget = event.relatedTarget as HTMLElement
  if (!relatedTarget?.hasAttribute('kat-e') || relatedTarget !== currentHoveredElement.value) {
    emit('hoverElement', undefined)
    currentHoveredElement.value = undefined
  }
}
</script>

<template>
  <div
    ref="routeWrapper"
    class="flex-1 bg-gray-200 relative w-0 flex justify-center items-center"
    :class="{ '!w-full': routeComponent }"
  >
    <!-- mobile size: width: 768px height: 1024px -->
    <div
      class="size-full bg-gray-300 drop-shadow-lg"
      :class="emulateMobile?['max-w-[390px]', 'max-h-[844px]']:[]"
    >
      <div
        ref="scrollContainer"
        class="relative size-full bg-white overflow-y-scroll route-container max-h-[calc(100svh-6.25rem)]"
      >
        <routeComponent v-if="routeComponent" />

        <!-- overlays for content editing (eg. element overlays) -->
        <div class="fixed inset-0 pointer-events-none touch-none z-[1000] overflow-hidden">
          <div
            v-if="currentHoveredElement"
            class="absolute element-overlay-container"
            :style="{ top: elementPosition.y + 'px', left: elementPosition.x + 'px', width: elementPosition.width + 'px', height: elementPosition.height + 'px' }"
            @mouseleave="handleOverlayMouseLeave"
            @click="() => emit('selectKey', currentHoveredElement?.getAttribute('kat-e'))"
          >
            <div class="absolute inset-0 bg-blue-500/10 border-6 border-indigo-500 border-dashed box-border rounded transition-all duration-200 group">
              <!-- Edit icon in top right corner -->
              <div class="absolute -top-3 -right-3 bg-blue-500 text-white p-1 rounded-full shadow-md transform transition-transform duration-200 hover:scale-110">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.element-overlay-container {
  pointer-events: auto;
  cursor: pointer;
  z-index: 100;
}
</style>
