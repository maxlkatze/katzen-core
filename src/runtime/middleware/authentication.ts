import { defineNuxtRouteMiddleware, useCookie, useRuntimeConfig } from '#imports'

export default defineNuxtRouteMiddleware(async (to) => {
  const checkAuth = import.meta.client ? clientSideAuthentication : serverSideAuthentication
  console.log('Middleware injected in: ' + (import.meta.client ? 'client' : 'server'))
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
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const jwt = require('jsonwebtoken')
  return jwt.verify(token.value, useRuntimeConfig().secret)
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
