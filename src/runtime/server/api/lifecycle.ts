import { useContentStorage } from '../../storage/ContentStorage'
import { defineEventHandler, useRuntimeConfig } from '#imports'

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

/**
 * Keep storage alive using a CRON job
 */
export default defineEventHandler(async () => {
  const runtimeConfig = useRuntimeConfig()
  const storage = useContentStorage(runtimeConfig)

  if (storage) {
    // Keep storage alive
    (await storage).getItem(runtimeConfig.storageKey)
    // write a temp item to storage to keep it alive
    await (await storage).setItem('keep-alive', Date.now().toString())
    return {
      success: true,
      body: {
        message: 'Storage connection kept alive',
      },
    }
  }
  else {
    return {
      success: false,
      body: {
        message: 'Storage connection failed',
      },
    }
  }
})
