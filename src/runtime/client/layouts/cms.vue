<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'

// Get current route for reactive navigation
const route = useRoute()

// Navigation data with Lucide-inspired icons
const navigation = {
  items: [
    {
      title: 'Dashboard',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="7" height="9" x="3" y="3" rx="1" /><rect width="7" height="5" x="14" y="3" rx="1" /><rect width="7" height="9" x="14" y="12" rx="1" /><rect width="7" height="5" x="3" y="16" rx="1" /></svg>',
      to: '/cms/dashboard',
    },
    {
      title: 'Pages',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="8" y1="13" x2="16" y2="13" /><line x1="8" y1="17" x2="16" y2="17" /><line x1="8" y1="9" x2="11" y2="9" /></svg>',
      to: '/cms/pages',
    },
    {
      title: 'Media',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" /></svg>',
      to: '/cms/media',
    },
    {
      title: 'Site Settings',
      icon: '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" /><circle cx="12" cy="12" r="3" /></svg>',
      to: '/cms/site-settings',
    },
  ],
}

// Function to check if a route is active
const isActive = (path: string) => {
  // Check if current route path matches navigation item path
  // For exact matches like the dashboard root '/cms'
  if (path === '/cms' && route.path === '/cms') {
    return true
  }
  // For other routes, check if the current route starts with the path
  // This handles nested routes and child components
  return path !== '/cms' && route.path.startsWith(path)
}

// Toggle sidebar collapsed state
const isSidebarCollapsed = ref(false)
const toggleSidebar = () => {
  isSidebarCollapsed.value = !isSidebarCollapsed.value
}
const isMobile = ref(false)
onMounted(() => {
  onResize()
  window.addEventListener('resize', onResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', onResize)
})

const onResize = () => {
  isMobile.value = window.innerWidth < 768
  if (isMobile.value) {
    isSidebarCollapsed.value = true
  }
}

// Logout state
const isLoggingOut = ref(false)

/**
 * Handle logout
 * Clears authentication tokens and redirects to login page
 */
const handleLogout = async () => {
  try {
    isLoggingOut.value = true

    // Clear authentication tokens
    localStorage.removeItem('auth_token')
    // Remove from cookie
    const tokenCookie = useCookie('auth_token')
    tokenCookie.value = null

    // Add a small delay for visual feedback
    setTimeout(() => {
      // Redirect to login page
      window.location.href = '/cms'
    }, 300)
  }
  catch (error) {
    console.error('Logout error:', error)
    isLoggingOut.value = false
  }
}
</script>

<template>
  <div class="h-svh w-svw flex font-sans bg-gray-50">
    <!-- Sidebar -->
    <aside
      class="bg-white border-r border-gray-100 flex flex-col transition-all duration-300 ease-in-out"
      :class="isSidebarCollapsed ? 'w-16' : 'w-64'"
    >
      <!-- Logo section -->
      <div class="px-4 py-6 border-b border-gray-100 flex items-center justify-between">
        <h1
          class="font-medium text-gray-900"
          :class="isSidebarCollapsed ? 'text-sm' : 'text-lg'"
        >
          <svg
            width="24px"
            height="24px"
            viewBox="0 0 512 512"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M374.762,186.866h0a54.1,54.1,0,0,0-51.305-36.706H280V21.552l-18.263,2.609c-41.429,5.918-73.7,26.912-95.907,62.4-16.011,25.581-23.454,53.8-26.908,74.906-23.847,18.348-44.593,43.611-61.738,75.2-14.449,26.618-26.41,57.816-35.552,92.729-15.447,58.99-17.538,107.921-17.619,109.975L24.005,496H56V440.364c.4-8.231,10.476-188.35,107.032-256.936l5.66-4.021.93-6.881C174.437,136.9,191.077,78.058,248,59.971V182.16h75.457a22.12,22.12,0,0,1,21,14.974h0c12.757,37.656,34.677,84.777,68.839,106.921l-10.274,38.528a62.688,62.688,0,0,1-62.54,46.87c-28.668-.86-58.506,2.88-88.689,11.111L240,403.779V496h32V428.468a265.353,265.353,0,0,1,67.52-7.03,94.97,94.97,0,0,0,94.418-70.61l17.088-64.081L438.3,281.293C414.5,271.093,391.936,237.558,374.762,186.866Z"
            />
          </svg>
        </h1>
        <button
          v-if="!isMobile"
          class="text-gray-500 hover:text-gray-700 focus:outline-none"
          @click="toggleSidebar"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path
              v-if="isSidebarCollapsed"
              d="m9 18 6-6-6-6"
            />
            <path
              v-else
              d="m15 18-6-6 6-6"
            />
          </svg>
        </button>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 py-4 overflow-y-auto">
        <div
          v-if="!isSidebarCollapsed"
          class="px-3 mb-2 text-xs font-medium text-gray-400 uppercase tracking-wider"
        >
          Navigation
        </div>
        <div class="space-y-1 px-3">
          <NuxtLink
            v-for="item in navigation.items"
            :key="item.to"
            :to="item.to"
            exact-active-class="active"
            class="flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200"
            :class="[
              isActive(item.to)
                ? 'bg-indigo-50 text-indigo-600'
                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900',
            ]"
          >
            <span
              class="flex-shrink-0"
              :class="[
                isActive(item.to) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-500',
              ]"
              v-html="item.icon"
            />
            <span
              v-if="!isSidebarCollapsed"
              class="ml-3 truncate"
            >
              {{ item.title }}
            </span>
          </NuxtLink>
        </div>
      </nav>

      <!-- User profile section -->
      <div class="border-t border-gray-100 p-4">
        <button
          :disabled="isLoggingOut"
          class="flex items-center w-full rounded-md px-3 py-2 text-sm font-medium transition-all duration-200 hover:bg-red-50 text-gray-700 hover:text-red-600"
          :class="[isSidebarCollapsed ? 'justify-center' : 'justify-start']"
          @click="handleLogout"
        >
          <div
            class="flex items-center justify-center h-8 w-8 rounded-full"
            :class="isLoggingOut ? 'bg-gray-100 text-gray-400' : 'bg-red-100 text-red-600'"
          >
            <template v-if="isLoggingOut">
              <svg
                class="animate-spin h-4 w-4"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  class="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  stroke-width="4"
                />
                <path
                  class="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            </template>
            <template v-else>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line
                  x1="21"
                  y1="12"
                  x2="9"
                  y2="12"
                />
              </svg>
            </template>
          </div>
          <span
            v-if="!isSidebarCollapsed"
            class="ml-3"
          >Logout</span>
        </button>
      </div>
    </aside>

    <!-- Main content -->
    <main class="flex-1 overflow-auto">
      <div class="p-1 md:p-6 h-full">
        <slot />
      </div>
    </main>
  </div>
</template>
