import type { RouteLocationNormalized } from 'vue-router'
import { useAuthentication } from '../composables/cms/useAuthentication'
import { defineNuxtRouteMiddleware, useCookie, useRuntimeConfig } from '#imports'

/**
 * Authentication middleware for protecting routes
 * Handles both client-side and server-side authentication
 */
export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  // Choose authentication method based on environment
  const checkAuth = import.meta.client ? clientSideAuthentication : serverSideAuthentication

  // If on login page and already authenticated, redirect to CMS
  if (to.path === '/cms') {
    if (await checkAuth()) {
      if (import.meta.client) {
        window.location.href = '/cms/dashboard'
      }
      return '/cms/dashboard'
    }
    // Allow access to login page if not authenticated
    return
  }

  // For CMS routes that require authentication
  if (to.path.startsWith('/cms')) {
    if (!await checkAuth()) {
      // Not authenticated, redirect to login
      if (import.meta.client) {
        window.location.href = '/cms'
      }
      return '/cms'
    }
    // Authenticated, allow access to CMS routes
    return
  }
})

/**
 * Server-side authentication verification
 * Directly verifies the token using the jose library
 */
const serverSideAuthentication = async () => {
  // Get token from cookie
  const token = useCookie('auth_token')
  if (!token.value) return false

  // Verify token on server
  const runtimeConfig = useRuntimeConfig()
  const authentication = useAuthentication()
  return await authentication.verifyToken(token.value, runtimeConfig.secret || '')
}

/**
 * Client-side authentication verification
 * Makes API call to verify token
 */
const clientSideAuthentication = async () => {
  // Try cookie first
  const tokenCookie = useCookie('auth_token')

  // Fallback to localStorage if no cookie (handles both authentication methods)
  const authentication = useAuthentication()
  const tokenValue = tokenCookie.value || authentication.getToken()

  if (!tokenValue) return false

  // Verify via API call
  try {
    const authResponse = await $fetch('/cms/api/auth', {
      method: 'POST',
      body: {
        action: 'verify',
        token: tokenValue,
      },
    })

    return authResponse.success === true
  }
  catch (error) {
    console.error('Authentication verification failed:', error)
    return false
  }
}
