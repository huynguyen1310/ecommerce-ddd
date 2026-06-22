<template>
  <div v-if="loading" class="max-w-4xl mx-auto">
    <div class="h-8 w-48 bg-gray-100 animate-pulse rounded mb-8"></div>
    <div class="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
  </div>

  <div v-else-if="error" class="text-center py-20">
    <span class="text-6xl mb-4 block">🔍</span>
    <h2 class="text-2xl font-bold text-gray-900">Order not found</h2>
    <NuxtLink to="/orders" class="text-indigo-600 hover:underline mt-2 inline-block">&larr; Back to orders</NuxtLink>
  </div>

  <div v-else class="max-w-4xl mx-auto">
    <NuxtLink to="/orders" class="text-sm text-indigo-600 hover:underline mb-6 inline-block">&larr; Back to orders</NuxtLink>

    <div class="flex items-start justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Order #{{ order.id.substring(0, 8).toUpperCase() }}</h1>
        <p class="text-gray-400 mt-1">{{ formatDate(order.createdAt) }}</p>
      </div>
      <span :class="getStatusBadgeClass(order.status)" class="px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider">
        <span class="mr-1">{{ getStatusIcon(order.status) }}</span>
        {{ order.status }}
      </span>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-6">
      <h2 class="text-lg font-black text-gray-900 mb-6">Status Timeline</h2>
      <div class="relative">
        <div class="absolute left-4 top-2 bottom-2 w-0.5 bg-gray-200"></div>
        <div class="space-y-8">
          <div v-for="(step, i) in timeline" :key="i" class="relative flex items-start gap-4">
            <div :class="step.done ? 'bg-indigo-600 ring-4 ring-indigo-100' : 'bg-gray-200'" class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span v-if="step.done" class="text-white text-xs font-bold">✓</span>
              <span v-else class="text-gray-400 text-xs">○</span>
            </div>
            <div class="pt-1">
              <p :class="step.done ? 'text-gray-900 font-bold' : 'text-gray-400'" class="text-sm">{{ step.label }}</p>
              <p v-if="step.done && step.date" class="text-xs text-gray-400 mt-0.5">{{ formatDate(step.date) }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="order.status === 'SHIPPED' && tracking" class="bg-blue-50 border border-blue-200 rounded-2xl p-6 mb-6">
      <div class="flex items-center gap-4">
        <span class="text-3xl">📦</span>
        <div>
          <h3 class="font-bold text-blue-900">Shipped via {{ tracking.carrier }}</h3>
          <p class="text-blue-700 font-mono text-sm mt-0.5">{{ tracking.tracking_number }}</p>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
      <div class="p-6 border-b border-gray-100">
        <h2 class="text-lg font-black text-gray-900">Items ({{ order.items.length }})</h2>
      </div>
      <div v-for="item in order.items" :key="item.productId" class="px-6 py-4 border-b border-gray-50 last:border-b-0 flex items-center justify-between">
        <div class="flex items-center gap-3">
          <span class="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-1 rounded">{{ item.quantity }}x</span>
          <div>
            <p class="font-medium text-gray-900">Product {{ item.productId.substring(0, 8) }}</p>
            <p class="text-xs text-gray-400 font-mono">{{ item.productId }}</p>
          </div>
        </div>
        <p class="text-lg font-black text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</p>
      </div>
      <div class="px-6 py-4 bg-gray-50 flex items-center justify-between">
        <p class="text-sm font-bold text-gray-600 uppercase tracking-wider">Total</p>
        <p class="text-2xl font-black text-indigo-600">${{ order.total }}</p>
      </div>
    </div>

    <div v-if="order.status === 'PENDING'" class="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
      <p class="text-amber-800 font-bold mb-2">Payment pending</p>
      <p class="text-amber-600 text-sm mb-4">Complete payment to process your order.</p>
      <NuxtLink :to="`/checkout/${order.id}`" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-sm inline-block">
        Pay Now
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const route = useRoute()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const order = ref(null)
const tracking = ref(null)
const loading = ref(true)
const error = ref(false)

const timeline = computed(() => [
  { label: 'Order placed', done: true, date: order.value?.createdAt },
  { label: 'Payment confirmed', done: order.value?.status === 'PAID' || order.value?.status === 'SHIPPED', date: null },
  { label: 'Shipped', done: order.value?.status === 'SHIPPED', date: null },
])

const getStatusIcon = (status) => {
  switch (status) {
    case 'PENDING': return '⏳'
    case 'PAID': return '✅'
    case 'SHIPPED': return '📦'
    case 'CANCELLED': return '❌'
    default: return '📄'
  }
}

const getStatusBadgeClass = (status) => {
  switch (status) {
    case 'PENDING': return 'bg-amber-100 text-amber-700'
    case 'PAID': return 'bg-green-100 text-green-700'
    case 'SHIPPED': return 'bg-blue-100 text-blue-700'
    case 'CANCELLED': return 'bg-rose-100 text-rose-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(async () => {
  try {
    const data = await $fetch(`${apiBaseUrl}/orders/${route.params.id}`, { headers: authHeaders() })
    order.value = data
  } catch {
    error.value = true
    loading.value = false
    return
  }
  loading.value = false

  if (order.value.status === 'SHIPPED') {
    try {
      const data = await $fetch(`${apiBaseUrl}/shipments/${order.value.id}`, { headers: authHeaders() })
      tracking.value = data
    } catch { /* not found yet */ }
  }
})
</script>
