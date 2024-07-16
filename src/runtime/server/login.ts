import jwt from 'jsonwebtoken'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'
import type { CmsUser } from '~/src/module'

export default defineEventHandler(async (event) => {
  // get username and password inside post json
  const body = await readBody(event)
  const username = body.username
  const password = body.password
  const users = useRuntimeConfig().users as CmsUser[]

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
  // generate token
  const token = jwt.sign({ username }, 'secret', { expiresIn: '1d' })
  // return token
  return {
    success: true,
    body: {
      token,
    },
  }
})
