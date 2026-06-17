export default defineNuxtRouteMiddleware((to, from) => {
  const auth = useAuthStore()
  
  if (to.path.startsWith('/admin')) {
    if (!auth.isLoggedIn) {
      return navigateTo('/login')
    }
    if (!auth.isAdmin) {
      return navigateTo('/')
    }
  }
})
