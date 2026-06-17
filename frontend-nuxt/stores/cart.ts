import { defineStore } from 'pinia'
import { useAuthStore } from './auth'
import { useNotificationStore } from './notifications'

export const useCartStore = defineStore('cart', {
  state: () => ({
    items: [] as Array<{ productId: string; name: string; quantity: number; price: number }>
  }),
  actions: {
    addToCart(product: any) {
      const notifications = useNotificationStore()
      const existing = this.items.find(i => i.productId === product.id)
      if (existing) {
        existing.quantity++
      } else {
        this.items.push({ ...product, productId: product.id, quantity: 1 })
      }
      notifications.success(`Added ${product.name} to cart`)
    },
    async checkout() {
      const config = useRuntimeConfig()
      const auth = useAuthStore()
      const baseUrl = process.server ? config.apiOrderInternalUrl : config.public.apiOrderUrl
      
      const payload = {
        customerId: auth.user?.id || '550e8400-e29b-41d4-a716-446655440100',
        items: this.items.map(i => ({
          productId: i.productId,
          quantity: i.quantity,
          price: i.price
        }))
      }

      try {
        const response = await fetch(`${baseUrl}/orders`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': auth.token ? `Bearer ${auth.token}` : ''
          },
          body: JSON.stringify(payload)
        })
        
        if (response.ok) {
          const data = await response.json()
          this.items = []
          return data
        } else {
          throw new Error('Failed to create order')
        }
      } catch (error) {
        console.error('Error during checkout:', error)
        throw error
      }
    }
  }
})
