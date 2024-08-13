<script setup lang="ts">
import { ref, watch } from '#imports'

// PROPS
const props = defineProps({
  hoveredElement: {
    type: Object as () => HTMLElement | undefined,
  },
})

// ELEMENTS
const hoverPosition = ref<HTMLElement | null>(null)

// WATCHERS
watch(() => props.hoveredElement, () => {
  if (!hoverPosition.value) return
  const updatePosition = () => {
    if (hoverPosition.value && props.hoveredElement) {
      const elementPositionAbsolute = props.hoveredElement.getBoundingClientRect()
      hoverPosition.value.style.top = `${elementPositionAbsolute.top}px`
      hoverPosition.value.style.left = `${elementPositionAbsolute.left}px`
      hoverPosition.value.style.width = `${elementPositionAbsolute.width}px`
      hoverPosition.value.style.height = `${elementPositionAbsolute.height}px`
    }
  }
  const routeContainer = document.querySelector('.route-container')
  if (!routeContainer) return
  if (props.hoveredElement) {
    updatePosition()
    window.addEventListener('resize', updatePosition)
    routeContainer.addEventListener('scroll', updatePosition)
  }
  else {
    hoverPosition.value.removeAttribute('style')
    window.removeEventListener('resize', updatePosition)
    routeContainer.removeEventListener('scroll', updatePosition)
  }
})
</script>

<template>
  <div class="absolute inset-0 opacity-50 select-none touch-none pointer-events-none ontop">
    <div
      ref="hoverPosition"
      class="absolute z-20 -top-full -left-full bg-red-400/20 border-2 rounded border-red-500"
    />
  </div>
</template>

<style scoped>

</style>
