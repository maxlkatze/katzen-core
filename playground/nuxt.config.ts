export default defineNuxtConfig({
  modules: ['../src/module'],
  devtools: { enabled: true },
  compatibilityDate: '2024-07-08',
  pages: true,
  katze: {
    projectLocation: './playground',
    secret: 'secret123',
    users: [
      {
        name: 'admin',
        password: 'admin123',
      }
    ]
  },
})
