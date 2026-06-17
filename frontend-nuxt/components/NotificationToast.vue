<template>
  <div class="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-md w-full">
    <TransitionGroup name="list">
      <div 
        v-for="note in store.notifications" 
        :key="note.id"
        :class="[
          'p-4 rounded-xl shadow-2xl border flex items-center justify-between transition-all duration-300 transform',
          note.type === 'success' ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 
          note.type === 'error' ? 'bg-rose-50 border-rose-100 text-rose-800' : 
          'bg-indigo-50 border-indigo-100 text-indigo-800'
        ]"
      >
        <div class="flex items-center gap-3">
          <span v-if="note.type === 'success'" class="text-xl">✅</span>
          <span v-else-if="note.type === 'error'" class="text-xl">❌</span>
          <span v-else class="text-xl">ℹ️</span>
          <p class="font-medium">{{ note.message }}</p>
        </div>
        <button @click="store.notifications = store.notifications.filter(n => n.id !== note.id)" class="opacity-50 hover:opacity-100 p-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </TransitionGroup>
  </div>
</template>

<script setup>
import { useNotificationStore } from '~/stores/notifications'
const store = useNotificationStore()
</script>

<style scoped>
.list-enter-active, .list-leave-active { transition: all 0.4s ease; }
.list-enter-from { opacity: 0; transform: translateX(30px); }
.list-leave-to { opacity: 0; transform: scale(0.95); }
</style>
