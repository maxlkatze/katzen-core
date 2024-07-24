import { authenticationFailure } from '../../../utils/AuthFlow'
import type { ContentGetResponse } from '../../../../types/server/ServerResponses'
import { useContentStorage } from '../../../../storage/StorageManagement'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<ContentGetResponse> => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody(event) || {}
  const token = body.token || ''
  const authFailure = await authenticationFailure(token)
  if (authFailure) return authFailure

  const content = body.content || {}
  if (!content) {
    return {
      success: false,
      message: 'No content provided',
    }
  }
  const storage = await useContentStorage(runtimeConfig)
  const storedContent = await storage.getItem(runtimeConfig.storageKey) as object
  let savedContent = storedContent || {}
  savedContent = { ...savedContent, ...content }
  await storage.setItem(runtimeConfig.storageKey, savedContent)

  return {
    success: true,
    content: savedContent,
  }
})
