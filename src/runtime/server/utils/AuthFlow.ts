import { useAuthentication } from '../../composables/useAuthentication'
import type { ServerResponse } from '../../types/server/ServerResponses'
import { useRuntimeConfig } from '#imports'

export const authenticationFailure = async (token: string): Promise<ServerResponse | undefined> => {
  const runtimeConfig = useRuntimeConfig()

  if (!token) {
    return {
      success: false,
      message: 'No token provided',
    }
  }

  const authentication = useAuthentication()
  const verify = authentication.verifyToken(token, runtimeConfig.secret || '')
  if (!verify) {
    return {
      success: false,
      message: 'Invalid token',
    }
  }
  return undefined
}
