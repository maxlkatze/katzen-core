<script setup lang="ts">
import { computed } from '#imports'
import type { RequestState } from '~/src/runtime/types/EditTypes'

// PROPS & EMITS
const props = defineProps({
  emulateMobile: Boolean,
  isMobile: Boolean,
  saveState: {
    type: Object as () => RequestState,
    required: true,
  },
  publishState: {
    type: Object as () => RequestState,
    required: true,
  },
})
defineEmits(['toggleEmulateMobile', 'saveContent', 'deployChanges'])

// COMPUTED
const hasSaveState = computed(() => props.saveState.loading || props.saveState.success || props.saveState.failed)
const hasPublishState = computed(() => props.publishState.loading || props.publishState.success || props.publishState.failed)
</script>

<template>
  <div class="fixed flex gap-2 bottom-0 right-0 m-4 ontop">
    <button
      class="relative bg-black text-white px-5 py-3 rounded-2xl transition-all flex items-center justify-center border-2 border-black"
      title="Save Changes"
      :class="{ '!text-black': hasSaveState,
                'bg-white': hasSaveState }"
      @click="$emit('saveContent')"
    >
      <img
        src="../../../../assets/icons/disk.svg"
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
            src="../../../../assets/icons/loading.svg"
            class="size-4 animate-spin"
            alt="loading"
          >
        </template>
        <template v-if="saveState.success">
          <img
            src="../../../../assets/icons/check.svg"
            class="size-4"
            alt="check"
          >
        </template>
        <template v-if="saveState.failed">
          <img
            src="../../../../assets/icons/fail.svg"
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
      @click="$emit('deployChanges')"
    >
      <img
        src="../../../../assets/icons/publish.svg"
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
            src="../../../../assets/icons/loading.svg"
            class="size-4 animate-spin"
            alt="loading"
          >
        </template>
        <template v-if="publishState.success">
          <img
            src="../../../../assets/icons/check.svg"
            class="size-4"
            alt="check"
          >
        </template>
        <template v-if="publishState.failed">
          <img
            src="../../../../assets/icons/fail.svg"
            class="size-4"
            alt="fail"
          >
        </template>
      </span>
    </button>

    <button
      v-if="!isMobile"
      class="relative bg-black text-white px-5 py-3 rounded-2xl transition-all flex items-center justify-center border-2 border-black"
      :title="emulateMobile?'Switch to Desktop View':'Switch to Mobile View'"
      @click="$emit('toggleEmulateMobile')"
    >
      <img
        v-if="emulateMobile"
        src="../../../../assets/icons/phone.svg"
        class="size-4 transition-all duration-300 invert"
        alt="phone"
      >
      <img
        v-else
        src="../../../../assets/icons/desktop.svg"
        class="size-4 transition-all duration-300 invert"
        alt="desktop"
      >
    </button>
  </div>
</template>

<style scoped>

</style>
