<template>
  <div class="max-w-3xl mx-auto text-center py-12">
    <div v-if="loading" class="py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-gray-500 font-medium">Loading order details...</p>
    </div>

    <div v-else-if="error" class="py-20 bg-white rounded-3xl border border-dashed border-gray-300">
      <span class="text-6xl mb-4 block">🔍</span>
      <h2 class="text-2xl font-bold text-gray-900">Order not found</h2>
      <NuxtLink to="/orders" class="text-indigo-600 hover:underline mt-2 inline-block">&larr; My Orders</NuxtLink>
    </div>

    <div v-else class="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-green-600 p-10 text-white">
        <div class="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
        </div>
        <h1 class="text-3xl font-black mb-2">Order Confirmed!</h1>
        <p class="opacity-80">Thank you for your purchase.</p>
      </div>

      <div class="p-8 text-left">
        <div class="bg-gray-50 rounded-2xl p-6 mb-6 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs text-gray-400 uppercase font-bold tracking-widest">Order Number</span>
            <span class="text-sm font-bold text-gray-900 font-mono">#{{ order.id.substring(0, 8).toUpperCase() }}</span>
          </div>
          <div class="flex items-center justify-between mb-4">
            <span class="text-xs text-gray-400 uppercase font-bold tracking-widest">Status</span>
            <span class="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold uppercase">{{ order.status }}</span>
          </div>
          <div class="flex items-center justify-between">
            <span class="text-xs text-gray-400 uppercase font-bold tracking-widest">Total Paid</span>
            <span class="text-xl font-black text-indigo-600">${{ Number(order.total).toFixed(2) }}</span>
          </div>
        </div>

        <div v-if="order.shippingAddress" class="mb-6">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Shipping To</h3>
          <div class="bg-gray-50 rounded-2xl p-6 border border-gray-100">
            <p class="font-bold text-gray-900">{{ order.shippingAddress.name }}</p>
            <p class="text-sm text-gray-500">{{ order.shippingAddress.street }}</p>
            <p class="text-sm text-gray-500">{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zip }}</p>
            <p class="text-sm text-gray-500">{{ order.shippingAddress.country }}</p>
          </div>
        </div>

        <div class="border-t border-gray-100 pt-6">
          <h3 class="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Items</h3>
          <div class="space-y-3">
            <div v-for="item in order.items" :key="item.productId" class="flex items-center justify-between py-2">
              <div class="flex items-center gap-3">
                <span class="text-sm font-mono text-gray-400 bg-gray-100 px-2 py-0.5 rounded">{{ item.quantity }}x</span>
                <span class="text-sm font-medium text-gray-700">Product {{ item.productId.substring(0, 8) }}</span>
              </div>
              <span class="text-sm font-bold text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</span>
            </div>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-gray-100">
          <NuxtLink :to="`/orders/${order.id}`" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors text-center">Track Order</NuxtLink>
          <NuxtLink to="/orders" class="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center">All Orders</NuxtLink>
          <NuxtLink to="/" class="flex-1 py-3 border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition-colors text-center">Continue Shopping</NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const config = useRuntimeConfig()
const auth = useAuthStore()
const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const order = ref(null)
const loading = ref(true)
const error = ref(false)

onMounted(async () => {
  try {
    const data = await $fetch(`${baseUrl}/orders/${route.params.id}`, { headers: authHeaders() })
    order.value = data
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>
