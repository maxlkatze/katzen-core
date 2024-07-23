import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { useAuthentication } from '../composables/useAuthentication'
import { useContentStorage } from '../storage/StorageManagement'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()

  const body = await readBody(event) || {}
  const token = body.token || ''
  const action = body.action || ''

  if (!token) {
    return {
      success: false,
      body: {
        message: 'No token provided',
      },
    }
  }

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

  if (action == 'get') {
    const storage = await useContentStorage(runtimeConfig)
    const savedContent = await storage.getItem(runtimeConfig.storageKey)
    return {
      success: true,
      body: {
        message: 'Content fetched',
        content: savedContent,
      },
    }
  }

  if (action == 'save') {
    const content = body.content || {}
    if (!content) {
      return {
        success: false,
        body: {
          message: 'No content provided',
        },
      }
    }
    const storage = await useContentStorage(runtimeConfig)
    let savedContent = await storage.getItem(runtimeConfig.storageKey)
    savedContent = { ...savedContent as object, ...content }
    await storage.setItem(runtimeConfig.storageKey, savedContent)

    return {
      success: true,
      body: {
        message: 'Content saved',
      },
    }
  }

  if (action == 'imageList') {
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

  if (action == 'deploy') {
    const deployHookURL = runtimeConfig.deployHookURL
    if (!deployHookURL) {
      return {
        success: false,
        body: {
          message: 'No deploy hook URL provided',
        },
      }
    }

    const response = await fetch(deployHookURL, {
      method: 'GET',
    })
    if (response.ok) {
      return {
        success: true,
        body: {
          message: 'Content deployed',
        },
      }
    }
    return {
      success: false,
      body: {
        message: 'Content deploy failed',
      },
    }
  }

  return {
    success: false,
    body: {
      message: 'Invalid action',
    },
  }
})
