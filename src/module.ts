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
      const contentStorage = await useContentStorage(_nuxt.options.runtimeConfig)
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

    await installModule('@nuxtjs/tailwindcss', {
      exposeConfig: true,
      config: {
        content: {
          files: [
            resolver.resolve('runtime/client/components/**/*.{vue,mjs,ts}'),
            resolver.resolve('runtime/client/components/**/**/*.{vue,mjs,ts}'),
            resolver.resolve('runtime/client/pages/**/*.{vue,mjs,ts}'),
            resolver.resolve('runtime/client/pages/**/**/*.{vue,mjs,ts}'),
            resolver.resolve('runtime/client/layouts/**/*.{vue,mjs,ts}'),
            resolver.resolve('runtime/client/*.{mjs,js,ts}'),
          ],
        },
      },
    })

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
  },
})

const katzeLog = (message: string) => {
  console.log('\x1B[42m\x1B[30m Katze \x1B[0m ' + message)
}

const katzeError = (message: string) => {
  console.log('\x1B[41m\x1B[30m !Katze \x1B[0m ' + message)
}
