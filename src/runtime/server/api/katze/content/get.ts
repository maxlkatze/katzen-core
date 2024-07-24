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

  const storage = await useContentStorage(runtimeConfig)
  const savedContent = await storage.getItem(runtimeConfig.storageKey)
  const content = (savedContent as object) || {}
  return {
    success: true,
    content,
  }
})
