<script setup lang="ts">
import { useAppNotificationStore } from '~/stores/notification'

definePageMeta({ middleware: 'auth' })
const notif = useAppNotificationStore()

onMounted(() => {
  notif.fetchNotifications()
  notif.fetchUnreadCount()
})
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-8">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-2xl font-bold">Notifications</h1>
      <button
        v-if="notif.unreadCount > 0"
        class="text-sm text-blue-600 hover:underline"
        @click="notif.markAllRead()"
      >
        Mark all as read
      </button>
    </div>

    <div v-if="notif.loading" class="text-center py-8 text-gray-400">Loading...</div>

    <div v-else-if="notif.notifications.length === 0" class="text-center py-8 text-gray-400">
      No notifications yet
    </div>

    <div v-else class="space-y-2">
      <NuxtLink
        v-for="n in notif.notifications"
        :key="n.id"
        :to="n.link || '#'"
        class="block p-4 rounded-lg border transition-colors"
        :class="n.is_read ? 'bg-white border-gray-200' : 'bg-blue-50 border-blue-200'"
        @click="!n.is_read && notif.markRead(n.id)"
      >
        <div class="flex items-start justify-between gap-2">
          <div>
            <p class="font-medium text-sm" :class="n.is_read ? 'text-gray-700' : 'text-gray-900'">
              {{ n.title }}
            </p>
            <p class="text-sm text-gray-500 mt-0.5">{{ n.body }}</p>
          </div>
          <span v-if="!n.is_read" class="w-2 h-2 bg-blue-500 rounded-full shrink-0 mt-2" />
        </div>
        <p class="text-xs text-gray-400 mt-1">{{ new Date(n.created_at).toLocaleDateString() }}</p>
      </NuxtLink>
    </div>
  </div>
</template>
