import fs from 'node:fs/promises'
import path from 'node:path'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import type { H3Event } from 'h3'
import { useAuthentication } from '../../client/composables/cms/useAuthentication'
import { useContentStorage } from '../../storage/ContentStorage'
import { defineEventHandler, readBody, useRuntimeConfig, createError } from '#imports'

/**
 * Content API handler
 * Handles various content-related actions: get, save, imageList, deploy
 */
export default defineEventHandler(async (event) => {
  try {
    // Get request body and extract parameters
    const body = await readBody(event) || {}
    const { token, action, content } = body

    // Validate token
    await verifyAuth(event, token)

    // Route to appropriate action handler
    switch (action) {
      case 'save':
        return await handleSaveContent(event, content)
      case 'imageList':
        return await handleImageList()
      case 'deploy':
        return await handleDeploy()
      default:
        return createError({
          statusCode: 400,
          statusMessage: 'Invalid action',
        })
    }
  }
  catch (error) {
    return {
      success: false,
      body: {
        message: 'An error occurred',
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
    }
  }
})

/**
 * Verify authentication token
 */
async function verifyAuth(event: H3Event, token?: string): Promise<void> {
  if (!token) {
    throw createError({
      statusCode: 401,
      statusMessage: 'No token provided',
    })
  }

  const runtimeConfig = useRuntimeConfig()
  const authentication = useAuthentication()
  const isValid = await authentication.verifyToken(token, runtimeConfig.secret || '')

  if (!isValid) {
    throw createError({
      statusCode: 401,
      statusMessage: 'Invalid token',
    })
  }
}

/**
 * Handle save content action
 */
async function handleSaveContent(event: H3Event, content: object) {
  if (!content || Object.keys(content).length === 0) {
    throw createError({
      statusCode: 400,
      statusMessage: 'No content provided',
    })
  }

  const runtimeConfig = useRuntimeConfig()
  const storage = await useContentStorage(runtimeConfig)
  let savedContent = await storage.getItem(runtimeConfig.storageKey)
  savedContent = { ...savedContent as object, ...content }
  await storage.setItem(runtimeConfig.storageKey, savedContent)

  if (runtimeConfig.storage.type === 'fs') {
    console.log('\x1B[42m\x1B[30m Katze \x1B[0m Restarting Nuxt...')
    try {
      await triggerNuxtRestart()
    }
    catch (error) {
      console.warn('Could not trigger Nuxt restart:', error)
    }
  }

  return {
    success: true,
    body: {
      message: 'Content saved',
    },
  }
}

/**
 * Handle image list action - fetches all images from public folder
 */
async function handleImageList() {
  const runtimeConfig = useRuntimeConfig()
  const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']

  const localStorage = createStorage({
    driver: fsDriver({ base: `${runtimeConfig.projectLocation}/public/` }),
  })
  const imageStorage = createStorage({
    driver: fsDriver({ base: `${runtimeConfig.projectLocation}/images/` }),
  })

  const fileStore = createStorage({
    driver: fsDriver({ base: `./../` }),
  })

  const files = await fileStore.getKeys('', {})

  const imageKeys = await localStorage.getKeys('', {})
  const imageKeys2 = await imageStorage.getKeys('', {})
  const mergedKeys = [...imageKeys, ...imageKeys2]
  const filteredImages = mergedKeys
    .filter(key => extensions.some(ext => key.toLowerCase().endsWith(ext)))
    .map(key => `/${key.replace(/:/g, '/')}`)

  return {
    success: true,
    body: {
      message: 'Images fetched',
      images: filteredImages,
      files,
    },
  }
}

/**
 * Handle deploy action - triggers deployment webhook
 */
async function handleDeploy() {
  const runtimeConfig = useRuntimeConfig()
  const deployHookURL = runtimeConfig.deployHookURL

  if (!deployHookURL) {
    return {
      success: false,
      missingDeployHookURL: true,
      body: {
        message: 'No deploy hook URL provided',
      },
    }
  }

  try {
    const response = await fetch(deployHookURL, {
      method: 'GET',
    })

    if (!response.ok) {
      throw new Error(`Deploy failed with status: ${response.status}`)
    }

    return {
      success: true,
      body: {
        message: 'Content deployed successfully',
      },
    }
  }
  catch (error) {
    return {
      success: false,
      body: {
        message: `Deploy failed: ${error}`,
      },
    }
  }
}

/**
 * Trigger a Nuxt restart by touching the restart.mjs file
 * This works in development mode when using filesystem storage
 */
async function triggerNuxtRestart() {
  // Find the project root directory
  const projectRoot = process.cwd()
  // Create or touch a restart marker file
  const restartFilePath = path.join(projectRoot, '.nuxt', 'restart.mjs')

  try {
    // Check if the file exists
    try {
      await fs.access(restartFilePath)
      // If it exists, update its timestamp
      const now = new Date()
      await fs.utimes(restartFilePath, now, now)
    }
    catch {
      // If it doesn't exist, create it
      const restartContent = `
// This file is used to trigger Nuxt restart
// Updated: ${new Date().toISOString()}
export default {}
      `
      await fs.writeFile(restartFilePath, restartContent, 'utf-8')
    }

    // For more reliable restarts, touch the nuxt.config file
    try {
      const configFiles = [
        path.join(projectRoot, 'nuxt.config.js'),
        path.join(projectRoot, 'nuxt.config.mjs'),
        path.join(projectRoot, 'nuxt.config.ts'),
        path.join(projectRoot, 'playground', 'nuxt.config.ts'),
      ]

      for (const configFile of configFiles) {
        try {
          await fs.access(configFile)
          const now = new Date()
          await fs.utimes(configFile, now, now)
          console.log('\x1B[42m\x1B[30m Katze \x1B[0m Touched configuration file:', configFile)
          break // Stop after finding and touching the first config file
        }
        catch {
          // File doesn't exist, try the next one
        }
      }
    }
    catch (error) {
      console.warn('Could not touch nuxt.config file:', error)
    }

    return true
  }
  catch (error) {
    console.error('Failed to trigger Nuxt restart:', error)
    return false
  }
}
