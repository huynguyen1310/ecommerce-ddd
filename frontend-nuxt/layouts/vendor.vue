<template>
  <div class="min-h-screen bg-gray-50">
    <div v-if="suspended" class="flex items-center justify-center min-h-screen">
      <div class="text-center max-w-md px-8">
        <div class="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m0 0v2m0-2h2m-2 0H10m9.364-7.364A9 9 0 1112 3a9 9 0 017.364 4.636z"/></svg>
        </div>
        <h1 class="text-2xl font-black text-gray-900 mb-2">Shop Suspended</h1>
        <p class="text-gray-500 mb-6">Your shop has been suspended. Contact the administrator for more information.</p>
        <NuxtLink to="/" class="px-6 py-2.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors">Back to Store</NuxtLink>
      </div>
    </div>
    <div v-else class="flex">
      <!-- Sidebar -->
      <aside class="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col sticky top-0 h-screen">
        <div class="px-5 py-6 border-b border-gray-100">
          <NuxtLink to="/vendor/dashboard" class="flex items-center gap-2.5">
            <div class="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center text-sm font-black">S</div>
            <div>
              <p class="font-black text-gray-900 leading-tight">{{ shop?.name || 'Shop' }}</p>
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Vendor Dashboard</p>
            </div>
          </NuxtLink>
        </div>

        <nav class="flex-1 p-3 space-y-1">
          <NuxtLink to="/vendor/dashboard" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="isActive('/vendor/dashboard') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            Dashboard
          </NuxtLink>
          <NuxtLink to="/vendor/products" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold transition-all"
            :class="isActive('/vendor/products') ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-100'">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>
            Products
          </NuxtLink>
        </nav>

        <div class="p-3 border-t border-gray-100">
          <NuxtLink to="/" class="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Back to Store
          </NuxtLink>
        </div>
      </aside>

      <!-- Main -->
      <main class="flex-1 min-h-screen">
        <div class="max-w-6xl mx-auto px-8 py-8">
          <slot />
        </div>
      </main>
    </div>
    <NotificationToast />
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()
const base = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

const shop = ref(null)
const suspended = ref(false)
let pollTimer = null

function isActive(path) {
  return route.path.startsWith(path)
}

onMounted(async () => {
  await fetchShop()
  pollTimer = setInterval(fetchShop, 10000)
})

watch(() => route.path, async () => {
  if (route.path.startsWith('/vendor')) await fetchShop()
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})

async function fetchShop() {
  try {
    shop.value = await $fetch(`${base}/shops/my`, { headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {} })
    suspended.value = shop.value?.status === 'suspended'
  } catch (e) {
    if (e?.response?.status === 403) suspended.value = true
  }
}
</script>
