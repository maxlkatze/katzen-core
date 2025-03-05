import { ref } from 'vue'
import { useRouter } from 'vue-router'
import type { Route } from '../../../types/EditTypes'

export const useRouteFinder = () => {
  // Get router instance
  const router = useRouter()

  // Refs
  const routes = ref<Route[]>([])
  const isLoading = ref(false)

  /**
   * Loads all routes from Vue Router
   * Filters out system routes and formats them consistently
   */
  const loadRoutes = () => {
    try {
      // Get routes from Vue Router
      const routerRoutes = router.options.routes

      // Filter routes that don't start with special prefixes
      const filteredRouterRoutes = routerRoutes.filter((route) => {
        const routeName = route.name?.toString() || ''
        return (
          !routeName.startsWith('katze-cms')
        )
      })

      // Map routes to our Route format
      routes.value = filteredRouterRoutes.map(route => ({
        name: route.name?.toString() || route.path,
        path: route.path,
        slug: route.path.split('/').filter(Boolean).pop() || (route.name?.toString() || '').toLowerCase(),
        component: route.component,
      }))
    }
    catch (err) {
      console.error('Failed to load routes:', err)
    }
    finally {
      isLoading.value = false
    }

    return routes.value
  }

  /**
   * Find a route by slug
   */
  const findRouteBySlug = (slug: string): Route | undefined => {
    // Ensure routes are loaded
    if (routes.value.length === 0) {
      loadRoutes()
    }

    // Find route by slug
    return routes.value.find(route => route.slug === slug)
  }

  /**
   * Find a route by path
   */
  const findRouteByPath = (path: string): Route | undefined => {
    // Ensure routes are loaded
    if (routes.value.length === 0) {
      loadRoutes()
    }

    // Find route by path
    return routes.value.find(route => route.path === path)
  }

  /**
   * Get a route that matches either a path or slug
   */
  const getRoute = (pathOrSlug: string): Route | undefined => {
    // Ensure routes are loaded
    if (routes.value.length === 0) {
      loadRoutes()
    }

    // Try to find by path first
    let route = routes.value.find(route => route.path === pathOrSlug)

    // If not found, try by slug
    if (!route) {
      route = routes.value.find(route => route.slug === pathOrSlug)
    }

    return route
  }

  /**
   * Search routes by name or path
   */
  const searchRoutes = (query: string) => {
    if (!query) return routes.value

    const searchQuery = query.toLowerCase()
    return routes.value.filter(route =>
      route.name.toLowerCase().includes(searchQuery)
      || route.path.toLowerCase().includes(searchQuery),
    )
  }

  // Initial load of routes
  loadRoutes()

  return {
    routes,
    isLoading,
    loadRoutes,
    findRouteBySlug,
    findRouteByPath,
    getRoute,
    searchRoutes,
  }
}
