import { useContentStorage } from '../../storage/ContentStorage'
import { defineEventHandler, useRuntimeConfig } from '#imports'

/**
 * Keep storage alive using a CRON job
 */
export default defineEventHandler(async () => {
  const runtimeConfig = useRuntimeConfig()
  const storage = useContentStorage(runtimeConfig)

  // Check if CRON job is enabled
  if (runtimeConfig.cronJob) {
    // Keep storage alive
    (await storage).getItem(runtimeConfig.storageKey)
    return {
      success: true,
      body: {
        message: 'Storage connection kept alive',
      },
    }
  }
  else {
    // If not, return a message indicating that the CRON job is disabled
    return {
      success: false,
      body: {
        message: 'CRON job is disabled',
      },
    }
  }
})
