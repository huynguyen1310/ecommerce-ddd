export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()

  if (to.path.startsWith('/admin')) {
    if (!auth.isLoggedIn) {
      return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
    }
    if (!auth.isAdmin) {
      return navigateTo('/')
    }
  }

  if (to.path.startsWith('/vendor')) {
    if (!auth.isLoggedIn) {
      return navigateTo('/login?redirect=' + encodeURIComponent(to.fullPath))
    }
  }
})
