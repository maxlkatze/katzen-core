<script setup lang="ts">

import {computed, ref, useCookie} from '#imports';

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
</script>

<template>
  <div class="fixed flex gap-2 bottom-0 right-0 m-4 katze-edit-ontop">
    <button
      class="relative bg-black text-white px-5 py-3 rounded-2xl transition-all flex items-center justify-center border-2 border-black"
      title="Save Changes"
      :class="{ '!text-black': hasSaveState,
                'bg-white': hasSaveState }"
      @click="saveUiContent"
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
      @click="publishPopup = true"
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
  </div>

  <!-- publish popup -->
  <div
    v-if="publishPopup"
    class="fixed inset-0 bg-black/50 flex justify-center items-center katze-edit-ontop"
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
</template>

<style scoped>

</style>
