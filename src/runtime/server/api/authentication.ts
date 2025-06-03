import { useAuthentication } from '../../client/composables/cms/useAuthentication'
import type { CmsUser } from '../../types/ModuleTypes'
import { defineEventHandler, readBody, useRuntimeConfig, createError } from '#imports'

/**
 * Authentication API endpoint
 * Handles login/authentication and token generation using jose
 */
export default defineEventHandler(async (event) => {
  try {
    // Get request body
    const body = await readBody(event) || {}
    const { username, password, action } = body

    // Get runtime config for secrets
    const runtimeConfig = useRuntimeConfig()
    const authentication = useAuthentication()

    switch (action) {
      case 'login':
        return await handleLogin(username, password, authentication, runtimeConfig)

      case 'verify':
        return await handleVerify(body.token, authentication, runtimeConfig)

      case 'refresh':
        return await handleRefresh(body.token, authentication, runtimeConfig)

      default:
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid action',
        })
    }
  }
  catch (error) {
    return {
      success: false,
      body: {
        message: error || 'Authentication error',
      },
    }
  }
})

/**
 * Handle login action
 * Validates credentials against user list from module configuration
 */
async function handleLogin(
  username: string,
  password: string,
  authentication: ReturnType<typeof useAuthentication>,
  runtimeConfig: ReturnType<typeof useRuntimeConfig>,
) {
  if (!username || !password) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Username and password required',
    })
  }

  // Get users from runtime config
  const users = runtimeConfig.users as CmsUser[] || [] as CmsUser[]

  // Find matching user
  const user = users.find(u => u.name === username && u.password === password)

  if (!user) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid credentials',
    })
  }

  // Generate token
  const token = await authentication.generateToken({
    username: user.name,
    role: 'admin', // Default to admin if no role specified
  }, runtimeConfig.secret, '12h')

  return {
    success: true,
    body: {
      message: 'Login successful',
      token,
      user: {
        username: user.name,
        role: 'admin',
      },
    },
  }
}

/**
 * Handle token verification
 */
async function handleVerify(
  token: string,
  authentication: ReturnType<typeof useAuthentication>,
  runtimeConfig: ReturnType<typeof useRuntimeConfig>,
) {
  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token required',
    })
  }

  const isValid = await authentication.verifyToken(token, runtimeConfig.secret)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    })
  }

  const userData = authentication.decodeToken(token)

  return {
    success: true,
    body: {
      message: 'Token is valid',
      user: userData,
    },
  }
}

/**
 * Handle token refresh action
 */
async function handleRefresh(
  token: string,
  authentication: ReturnType<typeof useAuthentication>,
  runtimeConfig: ReturnType<typeof useRuntimeConfig>,
) {
  if (!token) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Token required',
    })
  }

  const isValid = await authentication.verifyToken(token, runtimeConfig.secret)

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token for refresh',
    })
  }

  const userData = authentication.decodeToken(token)

  if (!userData) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    })
  }

  // Generate new token
  const newToken = await authentication.generateToken(userData, runtimeConfig.secret, '12h')

  return {
    success: true,
    body: {
      message: 'Token refreshed',
      token: newToken,
      user: userData,
    },
  }
}
