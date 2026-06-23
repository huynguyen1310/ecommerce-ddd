<template>
  <div class="max-w-5xl mx-auto">
    <div v-if="loading" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-gray-500 font-medium italic">Preparing your checkout session...</p>
    </div>

    <div v-else-if="error" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100">
      <span class="text-6xl mb-4 block">⚠️</span>
      <h2 class="text-2xl font-bold text-gray-900">Checkout Error</h2>
      <p class="text-gray-500 mb-8">{{ error }}</p>
      <NuxtLink to="/cart" class="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">Back to Cart</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div class="lg:col-span-3 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Order #{{ order.id?.substring(0, 8).toUpperCase() }}</h2>
          <div class="space-y-4">
            <div v-for="item in order.items" :key="item.productId" class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center text-lg">📦</div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-900 truncate">Product {{ item.productId.substring(0, 8) }}</p>
                <p class="text-xs text-gray-400">Qty: {{ item.quantity }} × ${{ Number(item.price).toFixed(2) }}</p>
              </div>
              <p class="text-sm font-bold text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
        </div>

        <div v-if="order.shippingAddress" class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-4">Shipping Address</h2>
          <p class="text-sm text-gray-700 font-medium">{{ order.shippingAddress.name }}</p>
          <p class="text-sm text-gray-500">{{ order.shippingAddress.street }}</p>
          <p class="text-sm text-gray-500">{{ order.shippingAddress.city }}, {{ order.shippingAddress.state }} {{ order.shippingAddress.zip }}</p>
          <p class="text-sm text-gray-500">{{ order.shippingAddress.country }}</p>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
          <div class="text-center mb-6 pb-6 border-b border-gray-100">
            <p class="text-xs text-gray-400 uppercase font-bold tracking-widest mb-1">Amount Due</p>
            <p class="text-3xl font-black text-indigo-600">${{ Number(order.total).toFixed(2) }}</p>
          </div>

          <div class="space-y-4 mb-6">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Card Holder</label>
              <input type="text" value="Demo Customer" disabled class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium">
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Card Number</label>
              <input type="text" value="**** **** **** 4242" disabled class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-mono tracking-widest">
            </div>
          </div>

          <button @click="processPayment('SUCCESS')" :disabled="processing" class="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-green-200 disabled:opacity-50 text-lg mb-3">
            {{ processing ? 'Processing...' : 'Pay Now' }}
          </button>
          <button @click="processPayment('FAILURE')" :disabled="processing" class="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-xl transition-all disabled:opacity-50">
            Cancel
          </button>

          <p class="text-center text-xs text-gray-400 italic mt-4">Demo payment — uses simulated card</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '~/stores/notifications'
import { useAuthStore } from '~/stores/auth'

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const notifications = useNotificationStore()
const auth = useAuthStore()
const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const orderId = route.params.id
const order = ref(null)
const loading = ref(true)
const processing = ref(false)
const error = ref(null)

const fetchData = async (retryCount = 0) => {
  try {
    const [orderRes] = await Promise.all([
      fetch(`${baseUrl}/orders/${orderId}`, { headers: authHeaders() }),
    ])
    if (orderRes.ok) {
      order.value = await orderRes.json()
      loading.value = false
      return
    }
    // Payment might not be ready yet (eventual consistency), retry
    const payRes = await fetch(`${baseUrl}/payments/${orderId}`, { headers: authHeaders() })
    if (payRes.ok || retryCount >= 10) {
      error.value = 'Payment session not ready. Please try again.'
      loading.value = false
    } else {
      setTimeout(() => fetchData(retryCount + 1), 1000)
    }
  } catch (err) {
    error.value = 'Failed to connect.'
    loading.value = false
  }
}

const processPayment = async (status) => {
  processing.value = true
  try {
    const response = await fetch(`${baseUrl}/payments/${orderId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status })
    })
    if (response.ok) {
      if (status === 'SUCCESS') {
        notifications.success('Payment successful!')
        router.push(`/order-success/${orderId}`)
      } else {
        notifications.error('Payment cancelled.')
        router.push('/orders')
      }
    } else {
      notifications.error('Failed to process payment.')
    }
  } catch {
    notifications.error('Connection error during payment.')
  } finally {
    processing.value = false
  }
}

onMounted(() => fetchData())
</script>
