<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-4xl font-black text-gray-900 mb-8 tracking-tight">Checkout</h1>

    <div v-if="cart.items.length === 0" class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
      <span class="text-6xl mb-4 block">🛒</span>
      <h2 class="text-2xl font-bold text-gray-900">Your cart is empty</h2>
      <NuxtLink to="/" class="text-indigo-600 hover:underline mt-2 inline-block">Go shopping</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-5 gap-8">
      <div class="lg:col-span-3 space-y-6">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-lg font-bold text-gray-900 mb-6">Shipping Address</h2>
          <form @submit.prevent="submitOrder" class="space-y-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Full Name</label>
              <input v-model="address.name" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" placeholder="John Doe" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Street Address</label>
              <input v-model="address.street" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" placeholder="123 Main St" />
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">City</label>
                <input v-model="address.city" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" placeholder="New York" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">State</label>
                <input v-model="address.state" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" placeholder="NY" />
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">ZIP Code</label>
                <input v-model="address.zip" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" placeholder="10001" />
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Country</label>
                <input v-model="address.country" type="text" required class="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" placeholder="US" />
              </div>
            </div>
          </form>
        </div>
      </div>

      <div class="lg:col-span-2">
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sticky top-24">
          <h2 class="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>
          <div class="space-y-4 mb-6">
            <div v-for="item in cart.items" :key="item.productId" class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
                <span v-else class="flex items-center justify-center h-full text-lg">📦</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-900 truncate">{{ item.name }}</p>
                <p class="text-xs text-gray-400">Qty: {{ item.quantity }}</p>
              </div>
              <p class="text-sm font-bold text-gray-900">${{ (item.price * item.quantity).toFixed(2) }}</p>
            </div>
          </div>
          <div class="border-t border-gray-100 pt-4 space-y-2">
            <div class="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${{ subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between text-sm text-gray-600"><span>Shipping</span><span class="text-green-600 font-medium">Free</span></div>
            <div class="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2"><span>Total</span><span class="text-indigo-600">${{ subtotal.toFixed(2) }}</span></div>
          </div>
          <button @click="submitOrder" :disabled="submitting" class="w-full mt-6 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50 text-lg">
            {{ submitting ? 'Placing Order...' : 'Place Order' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'

const cart = useCartStore()
const auth = useAuthStore()
const notifications = useNotificationStore()
const router = useRouter()

const address = ref({ name: '', street: '', city: '', state: '', zip: '', country: 'US' })
const submitting = ref(false)
const subtotal = computed(() => cart.items.reduce((s, i) => s + i.price * i.quantity, 0))

const submitOrder = async () => {
  if (!auth.isLoggedIn) {
    notifications.error('Please log in to place an order')
    return router.push('/login')
  }
  submitting.value = true
  try {
    const order = await cart.checkout(address.value)
    notifications.success('Order placed! Redirecting to payment...')
    router.push(`/checkout/${order.id}`)
  } catch (err) {
    notifications.error('Failed to place order. Please try again.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => cart.fetchCart())
</script>
