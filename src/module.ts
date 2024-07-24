import {
  addComponentsDir,
  addImportsDir,
  addLayout,
  addPlugin,
  addRouteMiddleware,
  addServerScanDir,
  createResolver,
  defineNuxtModule,
  extendPages,
  installModule,
} from '@nuxt/kit'

import pkg from '../package.json'
import { useContentStorage } from './runtime/storage/StorageManagement'

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
    updateCheck().then(
      (latestVersion) => {
        katzeError('There is a new version of Katze available')
        console.info('\x1B[43m\x1B[30m Please update your package with \x1B[0m npm i @maxlkatze/cms^' + latestVersion)
        console.info('\x1B[43m\x1B[30m If you\'re already on the @latest version run: \x1B[0m npm update')
        console.info('\x1B[43m\x1B[30m Current version: ' + pkg.version + ' Latest version: ' + latestVersion + '\x1B[0m')
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
    const { resolve } = createResolver(import.meta.url)

    // MODULE INSTALLATION & AUTO IMPORTS
    await installModules()
    await addImports()

    // LAYOUTS
    addLayout({
      filename: 'cms-layout.vue',
      getContents: () => '<template><slot /></template>',
    }, 'cms-layout')

    // PLUGINS
    addPlugin(resolve('runtime/plugins/chtml.plugin'))

    // PAGES
    extendPages(
      (pages) => {
        const pageList = [
          {
            name: 'katze-cms-home',
            path: '/cms',
            file: resolve('runtime/pages/cms/KatzeHome.vue'),
          },
          {
            name: 'katze-cms-edit',
            path: '/cms/edit',
            file: resolve('runtime/pages/cms/KatzeEditor.vue'),
          },
          {
            name: 'katze-cms-login',
            path: '/katze-login',
            file: resolve('runtime/pages/KatzeLogin.vue'),
          },
        ]
        pages.push(...pageList)
      })

    // MIDDLEWARE
    addRouteMiddleware({
      name: 'auth',
      path: resolve('runtime/middleware/authentication'),
      global: true,
    })

    // BACKEND HANDLERS
    addServerScanDir(resolve('runtime/server'))

    // EXPORTED FRONTEND COMPONENTS
    await addComponentsDir({
      path: resolve('runtime/components/ui'),
    })
  },
})

const addImports = async () => {
  const { resolve } = createResolver(import.meta.url)
  addImportsDir(resolve('runtime/composables'))
  addImportsDir(resolve('runtime/components'))
  addImportsDir(resolve('runtime/stores'))
  addImportsDir(resolve('runtime/middleware'))
}

const installModules = async () => {
  const { resolve } = createResolver(import.meta.url)

  await installModule('@nuxtjs/tailwindcss', {
    exposeConfig: true,
    config: {
      darkMode: 'class',
      content: {
        files: [
          resolve('runtime/components/**/*.{vue,mjs,ts}'),
          resolve('runtime/pages/**/*.{vue,mjs,ts}'),
          resolve('runtime/*.{mjs,js,ts}'),
        ],
      },
    },
  })
  await installModule('@pinia/nuxt', {
    storesDirs: [
      './runtime/stores/**',
    ],
  })
}
const updateCheck = async () => {
  const version = pkg.version
  const https = await import('node:https')
  return new Promise<string>((resolve) => {
    https.get('https://registry.npmjs.org/@maxlkatze/cms/latest', (res) => {
      let data = ''
      res.on('data', (chunk) => {
        data += chunk
      })
      res.on('end', () => {
        const latestVersion = JSON.parse(data).version
        if (version !== latestVersion) {
          resolve(latestVersion)
        }
      })
    })
  })
}

const katzeLog = (message: string) => {
  console.log('\x1B[42m\x1B[30m Katze \x1B[0m ' + message)
}

const katzeError = (message: string) => {
  console.log('\x1B[41m\x1B[30m !Katze \x1B[0m ' + message)
}
