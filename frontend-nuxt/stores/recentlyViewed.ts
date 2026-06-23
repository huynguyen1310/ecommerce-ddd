import { defineStore } from 'pinia'

export const useRecentlyViewedStore = defineStore('recentlyViewed', {
  state: () => ({ items: [], _hydrated: false }),
  getters: {
    count: (state) => state.items.length,
  },
  actions: {
    hydrate() {
      if (this._hydrated || !process.client) return
      this._hydrated = true
      try {
        const saved = JSON.parse(localStorage.getItem('recentlyViewed') || '[]')
        this.items = saved
      } catch {}
    },
    track(product) {
      this.hydrate()
      this.items = this.items.filter(i => i.id !== product.id)
      this.items.unshift({ id: product.id, name: product.name, price: product.price, imageUrl: product.imageUrl, category: product.category })
      if (this.items.length > 12) this.items.length = 12
      this._save()
    },
    _save() {
      if (process.client) localStorage.setItem('recentlyViewed', JSON.stringify(this.items))
    },
  },
})
