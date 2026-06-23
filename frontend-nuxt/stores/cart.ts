import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notifications'

function guestId(): string {
  if (process.client) {
    let id = localStorage.getItem('guest_id')
    if (!id) {
      id = crypto.randomUUID()
      localStorage.setItem('guest_id', id)
    }
    return id
  }
  return 'guest'
}

function baseUrl(): string {
  const config = useRuntimeConfig()
  return process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
}

function authHeaders(): Record<string, string> {
  const auth = useAuthStore()
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}

function userId(): string {
  const auth = useAuthStore()
  return auth.user?.id || guestId()
}

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as Array<{ productId: string; name: string; quantity: number; price: number; imageUrl?: string }>,
    loading: false,
  }),
  getters: {
    count: (state) => state.items.reduce((s, i) => s + i.quantity, 0),
    total: (state) => state.items.reduce((s, i) => s + i.price * i.quantity, 0),
  },
  actions: {
    async fetchCart() {
      this.loading = true
      try {
        const data = await $fetch(`${baseUrl()}/cart/${userId()}`, {
          headers: authHeaders(),
        })
        this.items = data
      } catch (e) {
        console.error('fetchCart error:', e)
      } finally {
        this.loading = false
      }
    },
    async addToCart(product: any) {
      const notifications = useNotificationStore()
      try {
        const data = await $fetch(`${baseUrl()}/cart/${userId()}/items`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: {
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.imageUrl || '',
            quantity: 1,
          },
        })
        this.items = data
        notifications.success(`Added ${product.name} to cart`)
      } catch (e) {
        console.error('addToCart error:', e)
        notifications.error('Failed to add to cart')
      }
    },
    async updateQuantity(productId: string, quantity: number) {
      try {
        const data = await $fetch(`${baseUrl()}/cart/${userId()}/items/${productId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json', ...authHeaders() },
          body: { quantity },
        })
        this.items = data
      } catch (e) {
        console.error('updateQuantity error:', e)
        useNotificationStore().error('Failed to update quantity')
      }
    },
    async removeFromCart(productId: string) {
      try {
        const data = await $fetch(`${baseUrl()}/cart/${userId()}/items/${productId}`, {
          method: 'DELETE',
          headers: authHeaders(),
        })
        this.items = data
      } catch (e) {
        console.error('removeFromCart error:', e)
        useNotificationStore().error('Failed to remove item')
      }
    },
    async checkout(address) {
      const auth = useAuthStore()
      const payload = {
        customerId: auth.user?.id || guestId(),
        customerEmail: auth.user?.email,
        items: this.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price,
        })),
        ...(address && { shippingAddress: address }),
      }

      try {
        const response = await fetch(`${baseUrl()}/orders`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: auth.token ? `Bearer ${auth.token}` : '',
          },
          body: JSON.stringify(payload),
        })

        if (response.ok) {
          const data = await response.json()
          await $fetch(`${baseUrl()}/cart/${userId()}`, {
            method: 'DELETE',
            headers: authHeaders(),
          })
          this.items = []
          return data
        }
        throw new Error('Failed to create order')
      } catch (error) {
        console.error('checkout error:', error)
        throw error
      }
    },
  },
})
