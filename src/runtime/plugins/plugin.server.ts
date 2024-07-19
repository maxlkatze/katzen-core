import jwt from 'jsonwebtoken'
import { defineNuxtPlugin } from '#imports'

export default defineNuxtPlugin((_nuxtApp) => {
  return {
    provide: {
      verifyJwtToken: (token: string, secret: string, options: object) => {
        return jwt.verify(token, secret, options)
      },
    },
  }
})
