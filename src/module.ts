import {defineNuxtModule, addPlugin, createResolver, extendPages, installModule, addServerHandler} from '@nuxt/kit'

/*
THIS MODULE IS THE CORE OF THE KATZENFRAMEWORK
THIS ADDS UI ELEMENTS AND HELPER FUNCTIONS
ALSO AN EASY AND SIMPLE CMS WITH ITS OWN PATH AND LOCAL STORAGE
AND A BUILT IN AUTHENTICATION SYSTEM
 */

export interface ModuleOptions {}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'KatzenCore',
    configKey: 'katzencore',
  },
  // Default configuration options of the Nuxt module
  defaults: {},
  async setup(_options, _nuxt) {
    const { resolve } = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin(resolve('./runtime/plugin'))

    extendPages(
      (pages) => {
        pages.push({
          name: 'katzen-preview',
          path: '/preview',
          file: resolve('runtime/pages/preview.vue'),
        })
      })

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


    //add backend server
    addServerHandler(
      {
        route: '/katzen-core',
        handler: resolve('./runtime/server/index.ts'),
      }
    )
  },
})
