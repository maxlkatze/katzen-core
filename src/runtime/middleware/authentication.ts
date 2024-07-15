export default defineNuxtRouteMiddleware(to => {

  const checkAuth = () => {
    const token = useCookie('token')
    if(!token.value) return false
    const jwt = require('jsonwebtoken');
    return jwt.verify(token.value, useRuntimeConfig().secret)
  }

  console.log('Hello from the middleware!')
  // skip middleware on client
  if (import.meta.client) return
  //if route is /preview-login and user is already logged in, redirect to /preview
  if(to.path === '/preview-login') {
    if(checkAuth()) {
      return '/preview'
    }
  }
  //route to is /preview
  if(to.path !== '/preview') return;
  if (!checkAuth()) {
    return '/preview-login'
  }
})
