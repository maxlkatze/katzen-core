import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { authenticationFailure } from '../../../utils/AuthFlow'
import type { ContentImageListResponse } from '../../../../types/server/ServerResponses'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event): Promise<ContentImageListResponse> => {
  const runtimeConfig = useRuntimeConfig()
  const body = await readBody(event) || {}
  const token = body.token || ''
  const authFailure = await authenticationFailure(token)
  if (authFailure) return authFailure

  // read all images from public folder and subfolders only show .png, .jpg, .jpeg, .gif, .svg, .webp
  const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
  const localStorage = createStorage({
    driver: fsDriver({ base: runtimeConfig.projectLocation + '/' + 'public/' }),
  })
  const imageKeys = await localStorage.getKeys('', {})
  const filteredKeys = imageKeys.filter((key) => {
    return extensions.includes(key.slice(-4))
  }).map((key) => {
    return '/' + key.replace(/:/g, '/')
  })

  return {
    success: true,
    images: filteredKeys,
  }
})
