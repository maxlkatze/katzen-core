import { useAuthentication } from '../composables/useAuthentication'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'
import type { CmsUser } from '~/src/module'

export default defineEventHandler(async (event) => {
  // get username and password inside post json
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody(event)
  const username = body.username
  const password = body.password
  const users = runtimeConfig.users as CmsUser[]

  // check if user exists
  const user = users.find(user => user.name == username && user.password == password)
  if (!user) {
    return {
      success: false,
      body: {
        message: 'Invalid credentials',
      },
    }
  }

  const authentication = useAuthentication()
  // generate token
  const token = authentication.generateToken(user.name, runtimeConfig.secret || '')
  // return token
  return {
    success: true,
    body: {
      token,
    },
  }
})
