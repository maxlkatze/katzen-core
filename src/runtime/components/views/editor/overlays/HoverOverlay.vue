<script setup lang="ts">
import {watch} from '#imports';

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
</script>

<template>
  <div class="absolute inset-0 opacity-50 select-none touch-none pointer-events-none katze-edit-ontop">
    <div
      ref="hoverPosition"
      class="absolute z-20 -top-full -left-full bg-red-400/20 border-2 rounded border-red-500"
    />
  </div>
</template>

<style scoped>

</style>
