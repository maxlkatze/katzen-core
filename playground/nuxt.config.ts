export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2024-07-08',
  pages: true,
  katzenCore: {
    projectLocation: './playground',
  },
})
