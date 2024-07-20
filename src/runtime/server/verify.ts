import { useAuthentication } from '../composables/useAuthentication'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const body = await readBody(event)
  const token = body.token || ''
  if (!token) {
    return {
      success: false,
      body: {
        message: 'No token provided',
      },
    }
  }
  const runtimeConfig = useRuntimeConfig()
  const authentication = useAuthentication()

  const verify = authentication.verifyToken(token, runtimeConfig.secret || '')

  if (!verify) {
    return {
      success: false,
      body: {
        message: 'Invalid token',
      },
    }
  }

  return {
    success: true,
    body: {
      message: 'Token is valid',
    },
  }
})
