<script setup lang="ts">

import type {PropType} from 'vue';
import {computed, defineNuxtLink} from '#imports';

const props = defineProps(
  {
    link: String,
    katId: {
      type: String,
      default: 'not-set',
    },
    icon: {
      type: String,
      default: 'ArrowRight',
    },
    buttonType: {
      type: String as PropType<'link' | 'button'>,
      default: 'link',
    },
    color: {
      type: String as PropType<'bg-ce-primary' | 'bg-ce-secondary'>,
      default: 'bg-ce-primary',
    },
  },
)

const component = computed(() => {
  if (props.buttonType === 'link') return defineNuxtLink({})
  return 'button'
})
</script>

<template>
  <component
    :is="component"
    :kat-e="katId"
    kat-t="text"
    class="rounded-full bg-red-400 py-3 px-4
      text-center font-medium mt-3
      flex flex-row items-center justify-center cursor-pointer
      select-none transition-all hover:opacity-90 active:opacity-80"
    :class="color"
    :to="link"
  >
    <span>
      <slot />
    </span>
  </component>
</template>
