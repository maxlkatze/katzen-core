import jwt from 'jsonwebtoken'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import { defineEventHandler, readBody, useRuntimeConfig } from '#imports'

export default defineEventHandler(async (event) => {
  const runtimeConfig = useRuntimeConfig()
  const storage = createStorage({
    driver: fsDriver({ base: runtimeConfig.projectLocation + '/' + 'public/' }),
  })
  if (!await storage.hasItem('content.katze.json')) {
    await storage.setItem('content.katze.json', {})
  }
  let savedContent = await storage.getItem('content.katze.json')

  const body = await readBody(event) || {}
  const token = body.token || ''
  const action = body.action || ''
  const content = body.content || ''
  if (token && action == 'save') {
    const verify = jwt.verify(token, runtimeConfig.secret)
    if (!verify) {
      return {
        success: false,
        body: {
          message: 'Invalid token',
        },
      }
    }
    if (!content) {
      return {
        success: false,
        body: {
          message: 'No content provided',
        },
      }
    }
    // add or replace content inside content
    // merge data with content
    savedContent = { ...savedContent as object, ...content }
    await storage.setItem('content.katze.json', savedContent)

    return {
      success: true,
      body: {
        message: 'Content saved',
      },
    }
  }

  if (token && action == 'imageList') {
    const verify = jwt.verify(token, runtimeConfig.secret)
    if (!verify) {
      return {
        success: false,
        body: {
          message: 'Invalid token',
        },
      }
    }
    // read all images from public folder and subfolders only show .png, .jpg, .jpeg, .gif, .svg, .webp
    const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']

    const imageKeys = await storage.getKeys('', {})
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

  return {
    success: true,
    body: {
      message: 'Content fetched',
      content: savedContent,
    },
  }
})
