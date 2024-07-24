import { authenticationFailure } from '../../../utils/AuthFlow'
import type { ContentDeployResponse } from '../../../../types/server/ServerResponses'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<ContentDeployResponse> => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody(event) || {}
  const token = body.token || ''
  const authFailure = await authenticationFailure(token)
  if (authFailure) return authFailure

  const deployHookURL = runtimeConfig.deployHookURL
  if (!deployHookURL) {
    return {
      success: false,
      missingDeployHookURL: true,
    }
  }

  const response = await fetch(deployHookURL, {
    method: 'GET',
  })
  if (response.ok) {
    return {
      success: true,
    }
  }
  return {
    success: false,
    message: await response.text(),
  }
})
