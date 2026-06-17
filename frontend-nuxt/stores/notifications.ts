import { defineStore } from 'pinia'

export const useNotificationStore = defineStore('notifications', {
  state: () => ({
    notifications: [] as Array<{ id: number; message: string; type: 'success' | 'error' | 'info' }>
  }),
  actions: {
    notify(message: string, type: 'success' | 'error' | 'info' = 'info') {
      const id = Date.now()
      this.notifications.push({ id, message, type })
      setTimeout(() => {
        this.notifications = this.notifications.filter(n => n.id !== id)
      }, 5000)
    },
    success(message: string) { this.notify(message, 'success') },
    error(message: string) { this.notify(message, 'error') }
  }
})
