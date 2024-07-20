import type { RouteLocationNormalized } from 'vue-router'
import { defineNuxtRouteMiddleware, useCookie, useRuntimeConfig } from '#imports'
import { useAuthentication } from '~/src/runtime/composables/useAuthentication'

export default defineNuxtRouteMiddleware(async (to: RouteLocationNormalized) => {
  const checkAuth = import.meta.client ? clientSideAuthentication : serverSideAuthentication
  // if route is /preview-login and user is already logged in, redirect to /preview
  if (to.path === '/katze-login') {
    if (await checkAuth()) {
      if (import.meta.client) {
        window.location.href = '/cms'
      }
      return '/cms'
    }
  }
  // route to is /preview
  if (to.path !== '/cms') return
  if (!await checkAuth()) {
    if (import.meta.client) {
      window.location.href = '/katze-login'
    }
    return '/katze-login'
  }
})

const serverSideAuthentication = async () => {
  const token = useCookie('token')
  if (!token.value) return false
  const runtimeConfig = useRuntimeConfig()
  const authentication = useAuthentication()
  return authentication.verifyToken(token.value, runtimeConfig.secret || '')
}

const clientSideAuthentication = async () => {
  console.log('Client side authentication')
  const token = useCookie('token')
  if (!token.value) return false
  interface VerifyResponse {
    success: boolean
  }
  const authenticationResponse = await $fetch('/verify-cms', {
    method: 'POST',
    body: {
      token: token.value,
    },
  }) as VerifyResponse
  return authenticationResponse.success
}
