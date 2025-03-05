<script setup lang="ts">
import { computed } from 'vue'
import { useNavigation } from '../composables/cms/useNavigation'
import { useGitHubNews } from '../composables/cms/useGitHubNews'
import { definePageMeta } from '#imports'

definePageMeta({
  layout: 'katze-cms-layout',
})

const { newsArticles, isLoading, error, refreshNews } = useGitHubNews()

const navigation = useNavigation()

const recentNews = computed(() => newsArticles.value.slice(0, 3))

const navigationWithoutDashboard = navigation.items.filter(item => item.to !== '/cms/dashboard')
</script>

<template>
  <!-- show quick actions on top to edit pages, go to the media options or to the site settings, below that show a news section with the current changes to the cms -->
  <div class="grid grid-rows-[auto,1fr] h-full">
    <div class="bg-gray-50 p-4 rounded-xl">
      <h2 class="text-lg font-bold">
        Quick Actions
      </h2>
      <div class="grid grid-cols-2 gap-4 mt-4">
        <NuxtLink
          v-for="action in navigationWithoutDashboard"
          :key="action.to"
          :to="action.to"
          class="p-4 rounded-xl bg-white border border-gray-200 flex flex-col items-center hover:shadow-md transition-all duration-200 hover:bg-gray-50"
        >
          <div
            class="rounded-full p-4 mb-3"
            v-html="action.icon"
          />
          <h3 class="font-medium text-gray-800">
            Edit {{ action.title }}
          </h3>
        </NuxtLink>
      </div>
      <div class="p-4 rounded-xl col-span-2 mt-6 bg-white border border-gray-200">
        <div class="flex justify-between items-center">
          <h2 class="text-lg font-bold">
            News
          </h2>
          <button
            class="text-sm text-blue-600 hover:underline flex items-center"
            :disabled="isLoading"
            @click="refreshNews"
          >
            <span v-if="isLoading">Loading...</span>
            <span v-else>Refresh</span>
          </button>
        </div>

        <div
          v-if="error"
          class="mt-4 p-3 bg-red-50 text-red-600 rounded-md text-sm"
        >
          {{ error }}
        </div>

        <div class="mt-4 space-y-4">
          <div
            v-if="isLoading"
            class="text-sm text-gray-500"
          >
            Loading news articles...
          </div>

          <div v-else-if="recentNews.length > 0">
            <div
              v-for="article in recentNews"
              :key="article.id"
              class="p-3 border-b border-gray-100 last:border-b-0"
            >
              <div class="flex justify-between items-start">
                <h3 class="font-medium text-gray-800">
                  {{ article.title }}
                </h3>
                <span class="text-xs text-gray-500">{{ new Date(article.date).toLocaleDateString() }}</span>
              </div>
              <p class="text-sm text-gray-600 mt-1">
                {{ article.content }}
              </p>
              <div class="flex gap-2 mt-2">
                <span
                  v-for="tag in article.tags"
                  :key="tag"
                  class="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full"
                >
                  {{ tag }}
                </span>
              </div>
              <p class="text-xs text-gray-500 mt-2">
                By {{ article.author }}
              </p>
            </div>
          </div>

          <p
            v-else
            class="text-sm text-gray-500"
          >
            No news articles found.
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
