import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    token: null,
  }),
  actions: {
    async login(email, password) {
      const config = useRuntimeConfig()
      const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
      try {
        const data = await $fetch(`${baseUrl}/login`, {
          method: 'POST',
          body: { email, password },
        })
        this.token = data.token
        this.user = data.user
        // Store in localStorage for persistence
        if (process.client) {
          localStorage.setItem('auth_token', data.token)
          localStorage.setItem('auth_user', JSON.stringify(data.user))
        }
        return true
      } catch (err) {
        console.error('Login failed', err)
        return false
      }
    },
    async register(email, password) {
      const config = useRuntimeConfig()
      const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
      try {
        await $fetch(`${baseUrl}/register`, {
          method: 'POST',
          body: { email, password },
        })
        return { success: true }
      } catch (err) {
        console.error('Registration failed', err)
        const errorMessage = err.data?.error || 'Registration failed'
        return { success: false, error: errorMessage }
      }
    },
    logout() {
      this.user = null
      this.token = null
      if (process.client) {
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    },
    init() {
      if (process.client) {
        const token = localStorage.getItem('auth_token')
        const user = localStorage.getItem('auth_user')
        if (token && user) {
          this.token = token
          this.user = JSON.parse(user)
        }
      }
    }
  },
  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'admin',
    isVendor: (state) => state.user?.role === 'vendor',
  }
})
