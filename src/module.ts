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
import { createStorage } from 'unstorage'
import fsDriver from 'unstorage/drivers/fs'
import type { Storage } from 'unstorage'
import { defu } from 'defu'

import pkg from '../package.json'

export interface CmsUser {
  name: string
  password: string
}

export interface ModuleOptions {
  users: CmsUser[]
  secret: string
  projectLocation: string
  storage?: Storage
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'KatzenCore',
    configKey: 'katzenCore',
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
  },

  hooks: {
    'nitro:build:before': async (nuxt) => {
      // load content from git storage
      console.log('NITRO BUILD HOOK')
    },
    'vite:serverCreated': (viteServer, env) => {
      console.log('VITE HOOK')
    },
    'nitro:build:public-assets': (nuxt) => {
      console.log('NITRO BUILD PUBLIC')
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

    if (!_options.storage) {
      _options.storage = createStorage({
        driver: fsDriver({ base: _options.projectLocation + '/' + 'public/' }),
      })
    }
    const storage = _options.storage
    // extend nuxt with storage as runtimeConfig does not work with objects


    await installModules()
    await addImports()

    addPlugin(resolve('./runtime/plugins/chtml.plugin'))

    addLayout({
      src: resolve('runtime/layouts/cmsLayout.vue'),
    }, 'cms-layout')

    // ADD BACKEND CMS PAGE
    extendPages(
      (pages) => {
        const pageList = [
          {
            name: 'katze-cms',
            path: '/cms',
            file: resolve('runtime/pages/KatzeCms.vue'),
          },
          {
            name: 'katze-cms-login',
            path: '/katze-login',
            file: resolve('runtime/pages/KatzeLogin.vue'),
          },
        ]
        pages.push(...pageList)
      })

    _nuxt.options.runtimeConfig.users = _options.users
    _nuxt.options.runtimeConfig.secret = _options.secret
    _nuxt.options.runtimeConfig.projectLocation = _options.projectLocation + (_options.projectLocation.endsWith('/') ? '' : '/')
    const content = await storage.getItem('content.katze.json')
    console.log(content)
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
