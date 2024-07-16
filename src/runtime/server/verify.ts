import jwt from 'jsonwebtoken'
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
  const verify = jwt.verify(token, useRuntimeConfig().secret)

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
