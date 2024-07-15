import {
  defineNuxtModule,
  addPlugin,
  createResolver,
  extendPages,
  installModule,
  addServerHandler, addComponentsDir, addRouteMiddleware,
} from '@nuxt/kit'

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
  users: CmsUser[],
  secret: string
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
  },
  async setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    await installModules()
    addPlugin(resolve('./runtime/plugin'))

    // ADD BACKEND CMS PAGE
    extendPages(
      (pages) => {
        const pageList = [
          {
            name: 'katzen-preview',
            path: '/preview',
            file: resolve('runtime/pages/preview.vue'),
          },
          {
            name: 'katzen-cms-login',
            path: '/preview-login',
            file: resolve('runtime/pages/login.vue'),
          },
        ]
        pages.push(...pageList)
      });

    _nuxt.options.runtimeConfig.users = _options.users
    _nuxt.options.runtimeConfig.secret = _options.secret

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

    // ADD FRONTEND COMPONENTS
    await addComponentsDir({
      path: resolve('runtime/components'),
    })
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
}
