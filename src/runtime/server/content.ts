import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { useAuthentication } from '../composables/useAuthentication'
import { useContentStorage } from '../storage/StorageManagment'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const storage = await useContentStorage(runtimeConfig)

  const body = await readBody(event) || {}
  const token = body.token || ''
  const action = body.action || ''
  const content = body.content || ''

  if (token) {
    const authentication = useAuthentication()
    const verify = authentication.verifyToken(token, runtimeConfig.secret || '')
    if (!verify) {
      return {
        success: false,
        body: {
          message: 'Invalid token',
        },
      }
    }
  }
  if (token && action == 'save') {
    if (!content) {
      return {
        success: false,
        body: {
          message: 'No content provided',
        },
      }
    }
    let savedContent = await storage.getItem(runtimeConfig.storageKey)
    // add or replace content inside content
    // merge data with content
    savedContent = { ...savedContent as object, ...content }
    await storage.setItem(runtimeConfig.storageKey, savedContent)

    return {
      success: true,
      body: {
        message: 'Content saved',
      },
    }
  }

  if (token && action == 'imageList') {
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
      body: {
        message: 'Images fetched',
        images: filteredKeys,
      },
    }
  }
  const savedContent = await storage.getItem(runtimeConfig.storageKey)

  return {
    success: true,
    body: {
      message: 'Content fetched',
      content: savedContent,
    },
  }
})
