import { defineStore } from 'pinia'

export const useWishlistStore = defineStore('wishlist', {
  state: () => ({ items: [], _hydrated: false }),
  getters: {
    ids: (state) => new Set(state.items.map(i => i.id)),
    count: (state) => state.items.length,
  },
  actions: {
    hydrate() {
      if (this._hydrated || !process.client) return
      this._hydrated = true
      try {
        const saved = JSON.parse(localStorage.getItem('wishlist') || '[]')
        this.items = saved
      } catch {}
    },
    toggle(product) {
      this.hydrate()
      const idx = this.items.findIndex(i => i.id === product.id)
      if (idx >= 0) this.items.splice(idx, 1)
      else this.items.push({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl })
      this._save()
    },
    has(id) {
      this.hydrate()
      return this.items.some(i => i.id === id)
    },
    remove(id) {
      this.hydrate()
      this.items = this.items.filter(i => i.id !== id)
      this._save()
    },
    _save() {
      if (process.client) localStorage.setItem('wishlist', JSON.stringify(this.items))
    },
  },
})
