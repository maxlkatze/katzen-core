import {
  addComponentsDir,
  addImportsDir,
  addLayout,
  addPlugin,
  addRouteMiddleware,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
  installModule,
} from '@nuxt/kit'

import { useContentStorage } from './runtime/storage/StorageManagement'
import { updateCheck } from './runtime/update'

export interface CmsUser {
  name: string
  password: string
}

export interface ModuleOptions {
  users: CmsUser[]
  secret: string
  projectLocation: string
  storage: {
    type: 'azure-app-configuration' | 'cloudflare-kv-binding' | 'fs' | 'github' | 'mongodb' | 'netlify-blobs' | 'planetscale' | 'redis' | 'vercel-kv'
    options: object
  }
  storageKey: string
  deployHookURL?: string
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'CMSKatze',
    configKey: 'katze',
  },
  // Default configuration options of the Nuxt module
  defaults: {
    users: [
      {
        name: 'admin',
        password: 'admin',
      },
    ],
    secret: 'secret',
    projectLocation: './',
    storage: {
      type: 'fs',
      options: {
        base: './',
      },
    },
    storageKey: 'katze_content.json',
  },
  async setup(_options, _nuxt) {
    const resolver = createResolver(import.meta.url)
    updateCheck().then(
      ({ currentVersion, latestVersion }) => {
        katzeError('There is a new version of Katze available')
        console.info('\x1B[43m\x1B[30m Please update your package with \x1B[0m npm i @maxlkatze/cms^' + latestVersion)
        console.info('\x1B[43m\x1B[30m If you\'re already on the @latest version run: \x1B[0m npm update')
        console.info('\x1B[43m\x1B[30m Current version: ' + currentVersion + ' Latest version: ' + latestVersion + '\x1B[0m')
      },
    )

    // SET RUNTIME CONFIG
    _nuxt.options.runtimeConfig.users = _options.users
    _nuxt.options.runtimeConfig.secret = _options.secret
    _nuxt.options.runtimeConfig.storage = _options.storage
    _nuxt.options.runtimeConfig.storageKey = _options.storageKey
    _nuxt.options.runtimeConfig.projectLocation = _options.projectLocation + (_options.projectLocation.endsWith('/') ? '' : '/')
    _nuxt.options.runtimeConfig.deployHookURL = _options.deployHookURL

    // LOAD CONTENT STORAGE
    const contentStorage = await useContentStorage(_nuxt.options.runtimeConfig)
    let content = await contentStorage.getItem(_options.storageKey)
    if (content === null) {
      content = {}
    }
    katzeLog('Loaded ' + Object.entries(content).length + ' entries from [' + _options.storage.type + '] storage')
    _nuxt.options.runtimeConfig.public.content = content // Set content to public runtime config

    // NUXTKIT SETUP
    await installModule('@nuxtjs/tailwindcss', {
      exposeConfig: true,
      config: {
        darkMode: 'class',
        content: {
          files: [
            resolver.resolve('runtime/components/**/*.{vue,mjs,ts}'),
            resolver.resolve('runtime/pages/**/*.{vue,mjs,ts}'),
            resolver.resolve('runtime/*.{mjs,js,ts}'),
          ],
        },
      },
    })
    await installModule('@pinia/nuxt', {
      storesDirs: [
        './runtime/stores/**',
      ],
    })

    addImportsDir(resolver.resolve('runtime/composables'))
    addImportsDir(resolver.resolve('runtime/components'))
    addImportsDir(resolver.resolve('runtime/stores'))
    addImportsDir(resolver.resolve('runtime/middleware'))

    addPlugin(resolver.resolve('runtime/plugins/chtml.plugin'))

    addLayout({
      filename: 'cms-layout.vue',
      getContents: () => '<template><slot /></template>',
    }, 'cms-layout')

    // ADD BACKEND CMS PAGE
    extendPages(
      (pages) => {
        const pageList = [
          {
            name: 'katze-cms',
            path: '/cms',
            file: resolver.resolve('runtime/pages/KatzeCms.vue'),
          },
          {
            name: 'katze-cms-login',
            path: '/katze-login',
            file: resolver.resolve('runtime/pages/KatzeLogin.vue'),
          },
        ]
        pages.push(...pageList)
      })

    addRouteMiddleware({
      name: 'auth',
      path: resolver.resolve('runtime/middleware/authentication'),
      global: true,
    })

    addServerHandler(
      {
        route: '/login-cms',
        handler: resolver.resolve('runtime/server/login'),
      },
    )

    addServerHandler(
      {
        route: '/verify-cms',
        handler: resolver.resolve('runtime/server/verify'),
      },
    )

    addServerHandler(
      {
        route: '/content-cms',
        handler: resolver.resolve('runtime/server/content'),
      },
    )

    // ADD FRONTEND COMPONENTS
    await addComponentsDir({
      path: resolver.resolve('runtime/components/ui'),
    })
  },
})

const katzeLog = (message: string) => {
  console.log('\x1B[42m\x1B[30m Katze \x1B[0m ' + message)
}

const katzeError = (message: string) => {
  console.log('\x1B[41m\x1B[30m !Katze \x1B[0m ' + message)
}
