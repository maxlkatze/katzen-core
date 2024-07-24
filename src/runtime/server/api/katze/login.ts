import { useAuthentication } from '../../../composables/useAuthentication'
import type { LoginResponse } from '../../../types/server/ServerResponses'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'
import type { CmsUser } from '~/src/module'

export default defineEventHandler(async (event): Promise<LoginResponse> => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody(event)
  const username = body.username
  const password = body.password
  const users = runtimeConfig.users as CmsUser[]

  const user = users.find(user => user.name == username && user.password == password)
  if (!user) {
    return {
      success: false,
      message: 'Invalid username or password',
    }
  }

  const authentication = useAuthentication()
  const token = authentication.generateToken(user.name, runtimeConfig.secret || '')
  return {
    success: true,
    token,
  }
})
