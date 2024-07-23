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

import pkg from '../package.json'
import { useContentStorage } from './runtime/storage/StorageManagement'

export interface CmsUser {
  name: string
  password: string
}

export interface ModuleOptions {
  users: CmsUser[]
  secret: string
  projectName: string
  projectLocation: string
  storage: {
    type: 'azure-app-configuration' | 'cloudflare-kv-binding' | 'fs' | 'github' | 'mongodb' | 'netlify-blobs' | 'planetscale' | 'redis' | 'vercel-kv'
    options: object
  }
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
    projectName: 'defaultProject',
    projectLocation: './',
    storage: {
      type: 'fs',
      options: {
        base: './',
      },
    },
  },
  async setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)
    updateCheck().then(
      (latestVersion) => {
        console.warn('\x1B[41m There is a new version of KatzeCMS available \x1B[0m')
        console.info('\x1B[42m Please update your package with \x1B[0m npm i @maxlkatze/cms@latest')
        console.info('\x1B[42m If you\'re already on the @latest version run: \x1B[0m npm update @maxlkatze/cms')
        console.info('\x1B[42m Current version: ' + pkg.version + ' Latest version: ' + latestVersion + '\x1B[0m')
      },
    )

    await installModules()
    await addImports()

    addPlugin(resolve('./runtime/plugins/chtml.plugin'))

    addLayout({
      src: resolve('./runtime/layouts/cmsLayout.vue'),
    }, 'cms-layout')

    // ADD BACKEND CMS PAGE
    extendPages(
      (pages) => {
        const pageList = [
          {
            name: 'katze-cms',
            path: '/cms',
            file: resolve('./runtime/pages/KatzeCms.vue'),
          },
          {
            name: 'katze-cms-login',
            path: '/katze-login',
            file: resolve('./runtime/pages/KatzeLogin.vue'),
          },
        ]
        pages.push(...pageList)
      })

    _nuxt.options.runtimeConfig.users = _options.users
    _nuxt.options.runtimeConfig.secret = _options.secret
    _nuxt.options.runtimeConfig.storage = _options.storage
    _nuxt.options.runtimeConfig.projectName = _options.projectName
    _nuxt.options.runtimeConfig.projectLocation = _options.projectLocation + (_options.projectLocation.endsWith('/') ? '' : '/')
    const storageKey = _options.projectName + '_katze_content'
    _nuxt.options.runtimeConfig.storageKey = storageKey
    _nuxt.options.runtimeConfig.deployHookURL = _options.deployHookURL

    const contentStorage = await useContentStorage(_nuxt.options.runtimeConfig)
    let content = await contentStorage.getItem(storageKey)
    if (content === null) {
      content = {}
    }
    _nuxt.options.runtimeConfig.public.content = content
    // console.info('Katze loaded ' + Object.entries(content).length + ' entries from content storage')

    addRouteMiddleware({
      name: 'auth',
      path: resolve('./runtime/middleware/authentication'),
      global: true,
    })

    addServerHandler(
      {
        route: '/login-cms',
        handler: resolve('./runtime/server/login'),
      },
    )

    addServerHandler(
      {
        route: '/verify-cms',
        handler: resolve('./runtime/server/verify'),
      },
    )

    addServerHandler(
      {
        route: '/content-cms',
        handler: resolve('./runtime/server/content'),
      },
    )

    // ADD FRONTEND COMPONENTS
    await addComponentsDir({
      path: resolve('./runtime/components/ui'),
    })
  },
})

const addImports = async () => {
  const { resolve } = createResolver(import.meta.url)
  addImportsDir(resolve('./runtime/composables'))
  addImportsDir(resolve('./runtime/components'))
  addImportsDir(resolve('./runtime/stores'))
  addImportsDir(resolve('./runtime/middleware'))
}

const installModules = async () => {
  const { resolve } = createResolver(import.meta.url)

  await installModule('@nuxtjs/tailwindcss', {
    // module configuration
    exposeConfig: true,
    config: {
      darkMode: 'class',
      content: {
        files: [
          resolve('./runtime/components/**/*.{vue,mjs,ts}'),
          resolve('./runtime/pages/**/*.{vue,mjs,ts}'),
          resolve('./runtime/*.{mjs,js,ts}'),
        ],
      },
    },
  })

  await installModule('@nuxt/image')
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
