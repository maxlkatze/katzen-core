<script setup lang="ts">
import { onMounted, ref } from '#imports'

// PROPS & EMITS
defineProps({
  routeComponent: Object,
  emulateMobile: Boolean,
})

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
              // if a element remove all events but not when attribute ghost is set
              if (element.tagName.toUpperCase() === 'A' && !element.hasAttribute('ghost')) {
                const newElement = element.cloneNode(true) as HTMLElement
                newElement.setAttribute('ghost', '')
                element.replaceWith(newElement)
                return
              }
              if (element.hasAttribute('listening')) {
                return
              }
              element.addEventListener('mouseover', () => {
                console.log('hover')
                emit('hoverElement', element)
              })
              element.addEventListener('mouseleave', () => {
                emit('hoverElement', undefined)
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
</script>

<template>
  <div
    ref="routeWrapper"
    class="flex-1 bg-slate-50 relative w-0 flex justify-center items-center"
    :class="{ '!w-full': routeComponent }"
  >
    <!-- mobile size: width: 768px height: 1024px -->
    <div
      class="size-full bg-gray-300"
      :class="emulateMobile?['max-w-[390px]', 'max-h-[844px]']:[]"
    >
      <div class="size-full bg-white overflow-y-scroll route-container">
        <routeComponent v-if="routeComponent" />
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
