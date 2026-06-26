import { defineStore } from 'pinia'
import { useAuthStore } from './auth'

function baseUrl(): string {
  const config = useRuntimeConfig()
  return process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
}

function authHeaders(): Record<string, string> {
  const auth = useAuthStore()
  return auth.token ? { Authorization: `Bearer ${auth.token}` } : {}
}

export const useAppNotificationStore = defineStore('appNotification', {
  state: () => ({
    notifications: [] as any[],
    unreadCount: 0,
    loading: false,
  }),
  actions: {
    async fetchNotifications(page = 1) {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      this.loading = true
      try {
        const data = await $fetch(`${baseUrl()}/notifications`, {
          params: { user_id: auth.user.id, page },
          headers: authHeaders(),
        })
        this.notifications = data.data
      } catch (err) {
        console.error('Failed to fetch notifications', err)
      } finally {
        this.loading = false
      }
    },
    async fetchUnreadCount() {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      try {
        const data = await $fetch(`${baseUrl()}/notifications/unread-count`, {
          params: { user_id: auth.user.id },
          headers: authHeaders(),
        })
        this.unreadCount = data.count
      } catch (err) {
        console.error('Failed to fetch unread count', err)
      }
    },
    async markRead(id: string) {
      try {
        await $fetch(`${baseUrl()}/notifications/${id}/read`, {
          method: 'PATCH',
          headers: authHeaders(),
        })
        const n = this.notifications.find(n => n.id === id)
        if (n) n.is_read = true
        this.unreadCount = Math.max(0, this.unreadCount - 1)
      } catch (err) {
        console.error('Failed to mark read', err)
      }
    },
    async markAllRead() {
      const auth = useAuthStore()
      if (!auth.user?.id) return
      try {
        await $fetch(`${baseUrl()}/notifications/read-all`, {
          method: 'POST',
          body: { user_id: auth.user.id },
          headers: authHeaders(),
        })
        this.notifications.forEach(n => n.is_read = true)
        this.unreadCount = 0
      } catch (err) {
        console.error('Failed to mark all read', err)
      }
    },
  },
})
