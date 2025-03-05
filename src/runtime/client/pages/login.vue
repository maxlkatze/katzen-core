<script setup lang="ts">
import { ref } from 'vue'
import { useAuthentication } from '../composables/cms/useAuthentication'
import { useRouter } from '#app'

const username = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')
const router = useRouter()

// Get authentication utilities
const auth = useAuthentication()

/**
 * Handle login form submission
 */
const handleLogin = async () => {
  // Reset error state
  error.value = ''

  // Basic form validation
  if (!username.value || !password.value) {
    error.value = 'Username and password are required'
    return
  }

  try {
    isLoading.value = true

    // Call login API
    const response = await $fetch('/cms/api/auth', {
      method: 'POST',
      body: {
        action: 'login',
        username: username.value,
        password: password.value,
      },
    })

    if (response.success) {
      // Store token in both localStorage and cookie
      auth.setToken(response.body.token)

      // Navigate to CMS dashboard
      router.push('/cms/dashboard/')
    }
    else {
      error.value = response.body?.message || 'Login failed'
    }
  }
  catch (err: any) {
    console.error('Login error:', err)
    error.value = err.message || 'An error occurred during login'
  }
  finally {
    isLoading.value = false
  }
}

/**
 * Handle Enter key press for form submission
 */
const handleKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handleLogin()
  }
}
</script>

<template>
  <div class="w-svw h-svh grid place-items-center font-mono">
    <div class="flex flex-col justify-center items-center gap-5 w-80">
      <img
        src="../assets/logo_outlines.svg"
        class="h-60"
        alt="CMS-Katze"
      >

      <!-- Login Form -->
      <form
        class="w-full space-y-4"
        @submit.prevent="handleLogin"
      >
        <!-- Username Field -->
        <cms-ui-input
          v-model="username"
          placeholder="Username"
          autocomplete="username"
          :disabled="isLoading"
          class="w-full"
          @keydown="handleKeyDown"
        />

        <!-- Password Field -->
        <cms-ui-input
          v-model="password"
          placeholder="Password"
          type="password"
          autocomplete="current-password"
          :disabled="isLoading"
          class="w-full"
          @keydown="handleKeyDown"
        />

        <!-- Error Message -->
        <div
          v-if="error"
          class="text-red-500 text-sm p-2 bg-red-50 border border-red-200 rounded"
        >
          {{ error }}
        </div>

        <!-- Submit Button -->
        <cms-ui-button
          type="submit"
          :disabled="isLoading"
          class="w-full"
        >
          <template v-if="isLoading">
            <svg
              class="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
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
            Logging in...
          </template>
          <template v-else>
            Login
          </template>
        </cms-ui-button>
      </form>
    </div>
  </div>
</template>

<style scoped>
/* No changes to styles */
</style>
