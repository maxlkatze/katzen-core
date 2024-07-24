import type { ServerResponse } from '../../../types/server/ServerResponses'
import { authenticationFailure } from '../../utils/AuthFlow'
import { defineEventHandler, readBody } from '#imports'

export default defineEventHandler(async (event): Promise<ServerResponse> => {
  const body = await readBody(event) || {}
  const token = body.token || ''
  const authFailure = await authenticationFailure(token)
  if (authFailure) return authFailure

  return {
    success: true,
  }
})
