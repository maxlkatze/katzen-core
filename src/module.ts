import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  installModule,
  extendPages,
  addComponentsDir,
  addLayout,
  addImportsDir,
  addRouteMiddleware,
  addServerHandler,
} from '@nuxt/kit'
import { defu } from 'defu'
import { join } from 'pathe'
import type { ModuleOptions as TailwindModuleOptions } from '@nuxtjs/tailwindcss'
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import type { ModuleOptions, StorageDefinition } from './runtime/types/ModuleTypes'
import { useContentStorage } from './runtime/storage/ContentStorage'

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'CMSKatze',
    configKey: 'katze',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    users: [],
    secret: 'secret',
    projectLocation: './',
    storageKey: 'katze_content.json',
  },
  async setup(_options: ModuleOptions, _nuxt) {
    const resolver = createResolver(import.meta.url)
    let contentStorage = null

    // Check for user array length to be greater than 0
    if (_options.users.length === 0) {
      katzeError('No users found in the configuration adding default user')
      _options.users = [
        {
          name: 'admin',
          password: 'admin',
        },
      ]
    }

    // SET RUNTIME CONFIG
    _nuxt.options.runtimeConfig.users = _options.users
    _nuxt.options.runtimeConfig.secret = _options.secret
    _nuxt.options.runtimeConfig.storageKey = _options.storageKey
    _nuxt.options.runtimeConfig.projectLocation = _options.projectLocation + (_options.projectLocation.endsWith('/') ? '' : '/')
    _nuxt.options.runtimeConfig.deployHookURL = _options.deployHookURL
    if (_options.storage) {
      _nuxt.options.runtimeConfig.storage = _options.storage as StorageDefinition
      // LOAD CONTENT STORAGE
      contentStorage = await useContentStorage(_nuxt.options.runtimeConfig)
      let content = await contentStorage.getItem(_options.storageKey)
      if (content === null) {
        content = {}
      }
      katzeLog('Loaded ' + Object.entries(content).length + ' entries from [' + _options.storage.type + '] storage')
      _nuxt.options.runtimeConfig.public.content = content // Set content to public runtime config
    }
    else {
      katzeError('No storage found in the configuration')
    }

    // Set up hooks to properly close connections
    _nuxt.hook('close', async () => {
      if (contentStorage && typeof contentStorage.close === 'function') {
        try {
          katzeLog('Closing storage connection')
          await contentStorage.close()
          katzeLog('Storage connection closed')
        }
        catch (err) {
          katzeError('Failed to close storage connection: ' + err)
        }
      }
    })

    // INSTALL TAILWIND
    _nuxt.hook('tailwindcss:config', (tailwindConfig) => {
      const contentPathsToAdd = [
        resolver.resolve('runtime/client/components/**/*.{vue,mjs,ts}'),
        resolver.resolve('runtime/client/components/**/**/*.{vue,mjs,ts}'),
        resolver.resolve('runtime/client/pages/**/*.{vue,mjs,ts}'),
        resolver.resolve('runtime/client/pages/**/**/*.{vue,mjs,ts}'),
        resolver.resolve('runtime/client/layouts/**/*.{vue,mjs,ts}'),
        resolver.resolve('runtime/client/*.{mjs,js,ts}'),
      ]

      // Handle different content configuration formats
      tailwindConfig.content = tailwindConfig.content ?? { files: [] }
      if (Array.isArray(tailwindConfig.content)) {
        tailwindConfig.content.push(...contentPathsToAdd)
      }
      else {
        tailwindConfig.content.files = tailwindConfig.content.files || []
        tailwindConfig.content.files.push(...contentPathsToAdd)
      }

      tailwindConfig.theme = tailwindConfig.theme ?? {}
      tailwindConfig.theme.extend = tailwindConfig.theme.extend ?? {}
    })
    const tailwindOptions = {
      exposeConfig: true,
      config: {
        darkMode: 'class',
      },
      configPath: [
        join(_nuxt.options.rootDir, 'tailwind.config'),
      ],
    } as Partial<TailwindModuleOptions>
    const userOptions = (_nuxt.options.tailwindcss || {})
    const mergedOptions = defu(tailwindOptions, userOptions) as TailwindModuleOptions
    await installModule('@nuxtjs/tailwindcss', mergedOptions)

    addLayout({
      src: resolver.resolve('runtime/client/layouts/cms.vue'),
    }, 'katze-cms-layout')

    addLayout({
      src: resolver.resolve('runtime/client/layouts/empty.vue'),
    }, 'katze-cms-empty')

    addComponentsDir({
      path: resolver.resolve('runtime/client/components/cms/ui'),
      prefix: 'cms-ui',
    })

    addComponentsDir({
      path: resolver.resolve('runtime/client/components/global'),
      preload: true,
      global: true,
    })

    addComponentsDir({
      path: resolver.resolve('runtime/client/components/cms/edit'),
      prefix: 'cms-edit',
      enabled: true,
    })

    addImportsDir(resolver.resolve('runtime/client/composables/global'))
    addImportsDir(resolver.resolve('runtime/client/pages'))
    addImportsDir(resolver.resolve('runtime/client/components'))

    addPlugin(resolver.resolve('runtime/client/plugins/chtml.plugin'))

    addRouteMiddleware({
      name: 'auth',
      path: resolver.resolve('runtime/client/middleware/authentication'),
      global: true,
    })

    extendPages(
      (pages) => {
        const pageList = [
          {
            name: 'katze-cms',
            path: '/cms',
            file: resolver.resolve('runtime/client/pages/login.vue'),
          },
          {
            name: 'katze-cms-dashboard',
            path: '/cms/dashboard',
            file: resolver.resolve('runtime/client/pages/dashboard.vue'),
          },
          {
            name: 'katze-cms-pages',
            path: '/cms/pages',
            file: resolver.resolve('runtime/client/pages/pages.vue'),
          },
          {
            name: 'katze-cms-page-edit',
            path: '/cms/page/:id',
            file: resolver.resolve('runtime/client/pages/page/[id].vue'),
          },
          {
            name: 'katze-cms-media',
            path: '/cms/media',
            file: resolver.resolve('runtime/client/pages/media.vue'),
          },
          {
            name: 'katze-cms-site-settings',
            path: '/cms/site-settings',
            file: resolver.resolve('runtime/client/pages/site-settings.vue'),
          },
        ]
        pages.push(...pageList)
      })

    addServerHandler(
      {
        route: '/cms/api/content',
        handler: resolver.resolve('runtime/server/api/content'),
      },
    )

    addServerHandler(
      {
        route: '/cms/api/auth',
        handler: resolver.resolve('runtime/server/api/authentication'),
      },
    )

    addServerHandler(
      {
        route: '/cms/api/lifecycle',
        handler: resolver.resolve('runtime/server/api/lifecycle'),
      },
    )

    // build hook to get the /public/images directory and write the array to a json
    _nuxt.hook('build:before', async () => {
      const fileStore = createStorage({
        driver: fsDriver({ base: `${_nuxt.options.runtimeConfig.projectLocation}/public/` }),
      })
      const files = await fileStore.getKeys('', {})
      const extensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp']
      const filteredImages = files
        .filter(key => extensions.some(ext => key.toLowerCase().endsWith(ext)))
        .map(key => `/${key.replace(/:/g, '/')}`)

      const imageList = {
        images: filteredImages,
      }
      const path = resolver.resolve(`${_nuxt.options.runtimeConfig.projectLocation}/server/images.json`)
      console.log('Writing images.json to', path, imageList)
      const fs = await import('node:fs/promises')
      await fs.writeFile(path, JSON.stringify(imageList, null, 2), 'utf-8')
    })
  },
})

const katzeLog = (message: string) => {
  console.log('\x1B[42m\x1B[30m Katze \x1B[0m ' + message)
}

const katzeError = (message: string) => {
  console.log('\x1B[41m\x1B[30m !Katze \x1B[0m ' + message)
}
