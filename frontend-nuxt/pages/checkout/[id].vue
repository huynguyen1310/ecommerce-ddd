<template>
  <div class="max-w-md mx-auto py-12">
    <div v-if="loading" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
      <p class="text-gray-500 font-medium italic">Preparing your checkout session...</p>
    </div>

    <div v-else-if="error" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-red-100">
      <span class="text-6xl mb-4 block">⚠️</span>
      <h2 class="text-2xl font-bold text-gray-900">Checkout Error</h2>
      <p class="text-gray-500 mb-8">{{ error }}</p>
      <NuxtLink to="/cart" class="px-8 py-3 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors">
        Back to Cart
      </NuxtLink>
    </div>

    <div v-else class="bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden">
      <div class="bg-indigo-600 p-8 text-white text-center">
        <h1 class="text-2xl font-black mb-2 tracking-tight">Complete Payment</h1>
        <p class="opacity-80 text-sm">Secure transaction for Order #{{ orderId }}</p>
      </div>

      <div class="p-8">
        <div class="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
          <span class="text-gray-500 font-medium">Amount to Pay</span>
          <span class="text-3xl font-black text-indigo-600">${{ orderData?.total || '...' }}</span>
        </div>

        <div class="space-y-4 mb-8">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Card Holder</label>
            <input type="text" value="Demo Customer" disabled class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-medium">
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-2 tracking-widest">Card Number</label>
            <input type="text" value="**** **** **** 4242" disabled class="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 font-mono tracking-widest">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4 mb-8">
          <button @click="processPayment('SUCCESS')" :disabled="processing" class="py-4 bg-green-600 hover:bg-green-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-green-200 disabled:opacity-50">
            {{ processing ? '...' : 'Pay Now' }}
          </button>
          <button @click="processPayment('FAILURE')" :disabled="processing" class="py-4 bg-red-50 hover:bg-red-100 text-red-600 font-black rounded-xl transition-all disabled:opacity-50">
            Cancel
          </button>
        </div>

        <p class="text-center text-xs text-gray-400 italic">
          This is a simulated payment gateway for demonstration purposes.
        </p>
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
const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const orderId = route.params.id
const orderData = ref(null)
const loading = ref(true)
const processing = ref(false)
const error = ref(null)

const fetchOrderData = async (retryCount = 0) => {
  try {
    const response = await fetch(`${config.public.apiGatewayUrl}/payments/${orderId}`, { headers: authHeaders() })
    if (response.ok) {
      orderData.value = await response.json()
      loading.value = false
    } else if (response.status === 404 && retryCount < 10) {
      // Inventory deduction might be in progress, retry
      console.log('Order not ready in payment service, retrying...')
      setTimeout(() => fetchOrderData(retryCount + 1), 1000)
    } else {
      error.value = "Order not found or not ready for payment."
      loading.value = false
    }
  } catch (err) {
    error.value = "Failed to connect to payment service."
    loading.value = false
  }
}

const processPayment = async (status) => {
  processing.value = true
  try {
    const response = await fetch(`${config.public.apiGatewayUrl}/payments/${orderId}/process`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify({ status })
    })

    if (response.ok) {
      if (status === 'SUCCESS') {
        notifications.success('Payment successful! Your order is being shipped.')
      } else {
        notifications.error('Payment cancelled. Order will be voided.')
      }
      router.push('/')
    } else {
      notifications.error('Failed to process payment.')
    }
  } catch (err) {
    notifications.error('Connection error during payment.')
  } finally {
    processing.value = false
  }
}

onMounted(() => {
  fetchOrderData()
})
</script>
