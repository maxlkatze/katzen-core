import { createStorage, type Storage, type Driver } from 'unstorage'
import type { RuntimeConfig } from 'nuxt/schema'
import type { Connector } from 'db0'
import type { ExtendedRuntimeConfig } from '../types/ModuleTypes'

interface StorageManagementDriver extends Storage {
  publishContent: (content: string) => Promise<void>
  close: () => Promise<void>
}

interface DynamicModuleImport {
  default: (opts: unknown) => Driver
}

interface DynamicConnectorImport {
  default: (opts: unknown) => Connector
}

interface DynamicNitroPackConnectorImport {
  (opts: unknown): Connector
}

interface DynamicNitroPackImport {
  (opts: unknown): Driver
}

type DatabaseOptions = {
  type: 'bunSqlite' | 'cloudflareD1' | 'mysql' | 'postgresql'
  options: Record<string, unknown>
}

export const useContentStorage = async (_runtimeConfig: RuntimeConfig): Promise<StorageManagementDriver> => {
  const runtimeConfig = _runtimeConfig as ExtendedRuntimeConfig
  let module: unknown
  switch (runtimeConfig.storage.type) {
    case 'azure-app-configuration':
      module = await import('unstorage/drivers/azure-app-configuration')
      break
    case 'cloudflare-kv-binding':
      module = await import('unstorage/drivers/cloudflare-kv-binding')
      break
    case 'fs':
      module = await import('unstorage/drivers/fs')
      break
    case 'github':
      module = await import('unstorage/drivers/github')
      break
    case 'mongodb':
      module = await import('unstorage/drivers/mongodb')
      break
    case 'netlify-blobs':
      module = await import('unstorage/drivers/netlify-blobs')
      break
    case 'planetscale':
      module = await import('unstorage/drivers/planetscale')
      break
    case 'redis':
      module = await import('unstorage/drivers/redis')
      break
    case 'upstash':
      module = await import('unstorage/drivers/upstash')
      break
    case 'db0':
      module = await import('unstorage/drivers/db0')
      break
    case 'vercel-kv':
      module = await import('unstorage/drivers/vercel-kv')
      break
    default:
      throw new Error(`Driver ${runtimeConfig.storage.type} not found`)
  }

  let options = runtimeConfig.storage.options || {}
  let type: unknown

  // if the driver is db0, the type is the connector type / database options is inside options
  if (runtimeConfig.storage.type === 'db0') {
    const databaseOptions = options as DatabaseOptions
    // type ( bunSqlite, cloudflareD1, mysql(mysql2), postgresql
    if (!databaseOptions.type) {
      throw new Error('DB0 storage driver requires a "type" option to be specified')
    }
    // database options
    if (!databaseOptions.options) {
      throw new Error('DB0 storage driver requires a "options" option to be specified')
    }
    switch (databaseOptions.type) {
      case 'bunSqlite':
        type = await import('db0/connectors/bun-sqlite')
        break
      case 'cloudflareD1':
        type = await import('db0/connectors/cloudflare-d1')
        break
      case 'mysql':
        type = await import('db0/connectors/mysql2')
        break
      case 'postgresql':
        type = await import('db0/connectors/postgresql')
        break
      default:
        throw new Error(`DB0 storage driver does not support "${databaseOptions.type}" type`)
    }

    let connector: Connector
    try {
      const nitroPackImport = type as DynamicNitroPackConnectorImport
      connector = nitroPackImport(databaseOptions.options) as Connector
    }
    catch (e1) {
      try {
        const moduleImport = type as DynamicConnectorImport
        connector = moduleImport.default(databaseOptions.options) as Connector
      }
      catch (e2) {
        console.log('\x1B[41m\x1B[30m !Katze \x1B[0m Have you installed the db0 connector for the storage type? Consult the db0 documentation for more information')
        throw new Error(`Connector ${databaseOptions.type} could not be imported, possible error: ${e1}, ${e2}`)
      }
    }
    options = {
      database: connector,
      table: 'katze_content',
    }
  }

  let driver: Driver
  try {
    const nitroPackImport = module as DynamicNitroPackImport
    driver = nitroPackImport(options) as Driver
  }
  catch (e1) {
    try {
      const moduleImport = module as DynamicModuleImport
      driver = moduleImport.default(options) as Driver
    }
    catch (e2) {
      console.log('\x1B[41m\x1B[30m !Katze \x1B[0m Have you installed the driver for the storage type? Consult the unstorage documentation for more information')
      throw new Error(`Driver ${runtimeConfig.storage.type} could not be imported, possible error: ${e1}, ${e2}`)
    }
  }

  const storage = createStorage<object>({
    driver,
  }) as StorageManagementDriver

  // Add custom method to publish content
  storage.publishContent = async (content) => {
    // TODO GITHUB ETC
    console.log('Publishing content', content)
  }

  // Add close method to properly close connections
  storage.close = async () => {
    if (runtimeConfig.storage.type === 'redis') {
      try {
        console.log('\x1B[42m\x1B[30m Katze \x1B[0m Closing Redis connection')

        // Use proper type checking to avoid "possibly undefined" errors
        interface RedisDriver extends Driver {
          getInstance?: () => {
            quit: () => Promise<void> | void
          }
        }

        const redisDriver = driver as RedisDriver

        // Check if getInstance exists before calling it
        if (redisDriver.getInstance && typeof redisDriver.getInstance === 'function') {
          const instance = redisDriver.getInstance()
          if (instance && typeof instance.quit === 'function') {
            await instance.quit()
            console.log('\x1B[42m\x1B[30m Katze \x1B[0m Redis connection closed successfully')
          }
        }
      }
      catch (err) {
        console.error('\x1B[41m\x1B[30m !Katze \x1B[0m Error closing Redis connection:', err)
      }
    }
  }

  return storage
}
