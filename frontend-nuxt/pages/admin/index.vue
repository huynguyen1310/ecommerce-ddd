<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Admin</h1>
        <p class="text-gray-500 mt-2 text-lg">Manage shops and returns.</p>
      </div>
      <button @click="fetchData" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">
        Refresh
      </button>
    </div>

    <div class="flex gap-2 mb-6">
      <button @click="tab = 'shops'" :class="['px-4 py-2 rounded-lg text-sm font-bold transition-colors', tab === 'shops' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">Shops</button>
      <button @click="tab = 'returns'" :class="['px-4 py-2 rounded-lg text-sm font-bold transition-colors', tab === 'returns' ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">Returns</button>
    </div>

    <div v-if="tab === 'shops'" class="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900">Shops</h2>
        <span class="text-xs text-gray-400 font-medium">{{ shops.length }} total</span>
      </div>
      <div class="p-6">
        <div v-if="shops.length === 0" class="text-center text-gray-400 text-sm py-8">No shops yet.</div>
        <div v-else class="space-y-3">
          <div v-for="s in shops" :key="s.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-bold text-gray-900">{{ s.name }}</p>
              <p class="text-xs text-gray-500">{{ s.slug }} · {{ s.description || 'No description' }}</p>
              <p class="text-xs text-gray-400 mt-0.5">Owner: {{ s.ownerId?.slice(0, 8) }}...</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', s.status === 'active' ? 'bg-emerald-100 text-emerald-700' : s.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700']">{{ s.status }}</span>
              <button v-if="s.status === 'pending'" @click="approveShop(s.id)" class="px-3 py-1 bg-indigo-600 text-white text-xs font-bold rounded-lg hover:bg-indigo-700">Approve</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="tab === 'returns'" class="bg-white rounded-xl border border-gray-100 shadow-sm">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900">Return Requests</h2>
        <span class="text-xs text-gray-400 font-medium">{{ returns.length }} total</span>
      </div>
      <div class="p-6">
        <div v-if="returns.length === 0" class="text-center text-gray-400 text-sm py-8">No return requests.</div>
        <div v-else class="space-y-3">
          <div v-for="rr in returns" :key="rr.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
            <div>
              <p class="text-sm font-bold text-gray-900">Order #{{ rr.orderId.slice(0, 8) }}</p>
              <p class="text-xs text-gray-500">Reason: {{ rr.reason }} · ${{ Number(rr.refundAmount).toFixed(2) }}</p>
              <p class="text-xs text-gray-400">Buyer: {{ rr.buyerId.slice(0, 8) }}... · Shop: {{ rr.shopId.slice(0, 8) }}...</p>
            </div>
            <div class="flex items-center gap-3">
              <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', rr.status === 'pending' ? 'bg-amber-100 text-amber-700' : rr.status === 'approved' ? 'bg-green-100 text-green-700' : rr.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-purple-100 text-purple-700']">{{ rr.status }}</span>
              <button v-if="rr.status !== 'refunded'" @click="forceRefund(rr.id)" :disabled="loading === rr.id" class="px-3 py-1 bg-purple-600 text-white text-xs font-bold rounded-lg hover:bg-purple-700 disabled:opacity-50">{{ loading === rr.id ? '...' : 'Force Refund' }}</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'
const auth = useAuthStore()
const notifications = useNotificationStore()
const config = useRuntimeConfig()
const baseUrl = () => process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const shops = ref([])
const returns = ref([])
const tab = ref('shops')
const loading = ref('')

async function fetchData() {
  await Promise.all([fetchShops(), fetchReturns()])
}

async function fetchShops() {
  shops.value = await $fetch(`${baseUrl()}/shops/admin/all`, { headers: authHeaders() })
}

async function fetchReturns() {
  try {
    returns.value = await $fetch(`${baseUrl()}/orders/admin/returns`, { headers: authHeaders() })
  } catch {}
}

async function approveShop(id) {
  try {
    await $fetch(`${baseUrl()}/shops/admin/${id}/approve`, { method: 'PATCH', headers: authHeaders() })
    notifications.success('Shop approved')
    fetchShops()
  } catch (err) {
    notifications.error(err.data?.error || 'Failed to approve shop')
  }
}

async function forceRefund(id) {
  loading.value = id
  try {
    await $fetch(`${baseUrl()}/orders/admin/returns/${id}/force-refund`, { method: 'POST', headers: authHeaders() })
    notifications.success('Refund processed')
    await fetchReturns()
  } catch (err) {
    notifications.error(err.data?.message || 'Failed to process refund')
  } finally {
    loading.value = ''
  }
}

onMounted(fetchData)

definePageMeta({ middleware: 'auth' })
</script>

<style scoped>
</style>
