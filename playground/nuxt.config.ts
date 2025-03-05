export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2025-03-03',
  katze: {
    projectLocation: './playground',
    secret: 'secret123',
    users: [
      {
        name: 'admin',
        password: 'admin123',
      },
    ],
    storage: {
      type: 'fs',
      options: {
        base: './',
      },
    },
  },
})
