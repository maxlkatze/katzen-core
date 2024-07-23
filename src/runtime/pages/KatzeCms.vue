<script setup lang="ts">
import MainView from '../components/views/MainView.vue'
import EditView from '../components/views/EditView.vue'
import { setFetchedContent } from '../composables/useUiComponents'
import { definePageMeta, onMounted, ref, useCookie, useRouter } from '#imports'

definePageMeta({
  layout: 'cms-layout',
})

const router = useRouter()
const currentView = ref<'MainView' | 'EditView'>('MainView')

const logout = () => {
  const tokenCookie = useCookie('token')
  tokenCookie.value = ''
  router.push('/katze-login')
}

onMounted(async () => {
  const tokenCookie = useCookie('token')
  if (!tokenCookie.value) {
    return
  }
  const token = tokenCookie.value

  interface ContentCmsResponse {
    success: boolean
    body?: {
      content: Record<string, string>
    }
  }
  const response = await $fetch('/content-cms', {
    method: 'POST',
    body: {
      token,
      action: 'get',
    },
  },
  ) as ContentCmsResponse

  if (response.success && response.body) {
    setFetchedContent(response.body.content)
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex flex-col justify-center items-center bg-amber-50">
    <template v-if="currentView === 'MainView'">
      <MainView
        @logout="logout"
        @open-edit-page="currentView = 'EditView'"
      />
    </template>

    <template v-else-if="currentView === 'EditView'">
      <EditView @open-home-page="currentView = 'MainView'" />
    </template>
  </div>
</template>

<style scoped>

</style>
