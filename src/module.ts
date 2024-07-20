import {
  addComponentsDir,
  addImportsDir, addLayout,
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

export interface CmsUser {
  name: string
  password: string
}

export interface ModuleOptions {
  users: CmsUser[]
  secret: string
  projectLocation: string
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
  async setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    console.info('[KATZE] Module installed;')

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
    const storage = createStorage({
      driver: fsDriver({ base: _nuxt.options.runtimeConfig.projectLocation + '/' + 'public/' }),
    })
    const content = await storage.hasItem('content.katze.json') ? await storage.getItem('content.katze.json') as object : {}
    _nuxt.options.runtimeConfig.public.content = content
    console.info('[KATZE] Content loaded from storage with ' + Object.entries(content).length + ' entries')

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
  console.log('Make sure to install the following modules:')
  console.log('npm install @nuxtjs/tailwindcss @nuxt/image @pinia/nuxt')

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
