<script setup lang="ts">
import { type ContentGetResponse } from '../../types/server/ServerResponses'
import { setFetchedContent } from '../../composables/useUiComponents'
import { onMounted, useCookie } from '#imports'
import ActionsOverlay from '../../components/views/editor/overlays/ActionsOverlay.vue';
import EditContentOverlay from '../../components/views/editor/overlays/EditContentOverlay.vue';
import HoverOverlay from '../../components/views/editor/overlays/HoverOverlay.vue';
import ErrorOverlay from '../../components/views/editor/overlays/ErrorOverlay.vue';
import EditorRouteView from '../../components/views/editor/EditorRouteView.vue';

onMounted(async () => {
  const tokenCookie = useCookie('token')
  const token = tokenCookie.value

  const response = await $fetch<ContentGetResponse>('/api/katze/content/get', {
    method: 'POST',
    body: {
      token,
    },
  },
  )

  if (response.success && response.content) {
    setFetchedContent(response.content)
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex flex-col justify-center items-center bg-amber-50">
    <EditorRouteView />

    <div class="fixed inset-0 bg-black/50 flex justify-center items-center katze-edit-ontop select-none touch-none pointer-events-none [&>*]:pointer-events-auto">
      <ActionsOverlay />
      <EditContentOverlay />
      <HoverOverlay />
      <ErrorOverlay />
    </div>
  </div>
</template>

<style>
.katze-edit-ontop {
  z-index: 1000;
}
.overflow-y-auto {
  scrollbar-width: thin;
}
</style>
