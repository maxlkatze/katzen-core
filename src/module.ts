import fs from 'node:fs'
import {
  addComponentsDir,
  addImportsDir,
  addPlugin,
  addRouteMiddleware,
  addServerHandler,
  createResolver,
  defineNuxtModule,
  extendPages,
  installModule,
} from '@nuxt/kit'
import katze_content_path from './path'

/*
THIS MODULE IS THE CORE OF THE KATZENFRAMEWORK
THIS ADDS UI ELEMENTS AND HELPER FUNCTIONS
ALSO AN EASY AND SIMPLE CMS WITH ITS OWN PATH AND LOCAL STORAGE
AND A BUILT IN AUTHENTICATION SYSTEM
 */

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

    console.info('[KATZE] Module installed; Running Setup')

    await installModules()
    addPlugin(resolve('./runtime/plugin'))

    // ADD BACKEND CMS PAGE
    extendPages(
      (pages) => {
        const pageList = [
          {
            name: 'katze-cms',
            path: '/cms',
            file: resolve('runtime/pages/cms.vue'),
          },
          {
            name: 'katze-cms-login',
            path: '/katze-login',
            file: resolve('runtime/pages/login.vue'),
          },
        ]
        pages.push(...pageList)
      })

    _nuxt.options.runtimeConfig.users = _options.users
    _nuxt.options.runtimeConfig.secret = _options.secret
    _nuxt.options.runtimeConfig.projectLocation = _options.projectLocation + (_options.projectLocation.endsWith('/') ? '' : '/')
    const content_path = _nuxt.options.runtimeConfig.projectLocation + katze_content_path
    const content = fs.existsSync(content_path) ? JSON.parse(fs.readFileSync(content_path, 'utf8')) : {}
    _nuxt.options.runtimeConfig.public.content = content
    console.info('[KATZE] Content loaded from ' + content_path + ' with ' + Object.entries(content).length + ' entries')

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

    addImportsDir(resolve('runtime/composables'))
  },
})

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
  console.log('installing pinia')
  await installModule('@pinia/nuxt', {
    storesDirs: [
      './runtime/stores/**',
    ],
  })
}
