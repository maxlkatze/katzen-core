<script setup lang="ts">
import type { PropType } from 'vue'

defineProps(
  {
    src: {
      type: String,
      required: true,
    },
    alt: {
      type: String,
      default: '',
    },
    async: {
      type: Boolean,
      default: true,
    },
    loading: {
      type: String as PropType<'lazy' | 'eager'>,
      default: 'eager',
    },
    objectFit: {
      type: String as PropType<'cover' | 'contain' | 'fill' | 'none' | 'scale-down'>,
      default: 'cover',
    },
    showPlaceholder: {
      type: Boolean,
      default: true,
    },
    hideLoading: {
      type: Boolean,
      default: false,
    },
    sizes: {
      type: String,
      default: '300px md:600px lg:700px xl:800px',
    },
  },
)

const hideLoadingAnimation = ref(false)

const hidePlaceholder = () => {
  setTimeout(() => {
    hideLoadingAnimation.value = true
  }, 50)
}
</script>

<template>
  <div class="relative overflow-hidden select-none">
    <div
      v-if="!hideLoading"
      class="absolute -z-10 top-0 left-0
    bg-gray-100 rounded w-full h-full
    transition-all duration-300"
      :class="{ 'opacity-0': hideLoadingAnimation, 'animate-pulse': !hideLoadingAnimation }"
    />
    <NuxtImg
      ref="image"
      :src="src"
      :alt="alt"
      :decoding="async ? 'async' : 'sync'"
      :loading="loading"
      :placeholder="showPlaceholder ? true:15"
      :sizes="sizes"
      densities="1x"
      :placeholder-class="showPlaceholder? '' : 'opacity-0'"
      class="w-full h-full z-10 max-h-full"
      :style="{ objectFit }"
      @load="hidePlaceholder"
    />
  </div>
</template>

<style scoped>

</style>
