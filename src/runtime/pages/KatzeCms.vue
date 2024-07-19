<script setup lang="ts">
import MainView from '../components/views/MainView.vue'
import EditView from '../components/views/EditView.vue'
import { loadFetchContent } from '../composables/useUiComponents'
import { definePageMeta, ref, useCookie, useRouter } from '#imports'

definePageMeta({
  layout: 'cms',
})

const router = useRouter()
const currentView = ref<'MainView' | 'EditView'>('MainView')

loadFetchContent()

const logout = () => {
  const tokenCookie = useCookie('token')
  tokenCookie.value = ''
  router.push('/katze-login')
}
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
