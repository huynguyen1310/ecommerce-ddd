<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-black text-gray-900 mb-8 tracking-tight">Your Cart</h1>
    
    <div v-if="cart.items.length === 0" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
      <span class="text-6xl mb-4 block">🛒</span>
      <h2 class="text-2xl font-bold text-gray-900">Your cart is empty</h2>
      <p class="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
      <NuxtLink to="/" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">
        Start Shopping
      </NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-4">
        <div v-for="item in cart.items" :key="item.productId" class="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-4">
          <div class="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center text-2xl overflow-hidden">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
            <span v-else>📦</span>
          </div>
          <div class="flex-grow">
            <h3 class="font-bold text-gray-900">{{ item.name }}</h3>
            <div class="flex items-center gap-2 mt-2">
              <button @click="cart.updateQuantity(item.productId, item.quantity - 1)" class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold">−</button>
              <span class="w-8 text-center font-bold">{{ item.quantity }}</span>
              <button @click="cart.updateQuantity(item.productId, item.quantity + 1)" class="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold">+</button>
            </div>
          </div>
          <div class="text-right">
            <p class="font-black text-indigo-600">${{ (item.price * item.quantity).toFixed(2) }}</p>
            <p class="text-xs text-gray-400">${{ item.price.toFixed(2) }} / unit</p>
            <button @click="cart.removeFromCart(item.productId)" class="text-xs text-rose-500 hover:text-rose-700 font-bold mt-1">Remove</button>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
        <div class="space-y-4 mb-6 pb-6 border-b border-gray-100">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>${{ total.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span class="text-green-600 font-medium">Free</span>
          </div>
        </div>
        <div class="flex justify-between items-center mb-8">
          <span class="text-lg font-bold text-gray-900">Total</span>
          <span class="text-2xl font-black text-indigo-600">${{ total.toFixed(2) }}</span>
        </div>
        <button @click="handleCheckout" :disabled="loading" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50">
          {{ loading ? 'Processing...' : 'Place Order' }}
        </button>
        <p class="mt-4 text-center text-xs text-gray-400 flex items-center justify-center gap-1">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          Secure Checkout
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import { useNotificationStore } from '~/stores/notifications'

const cart = useCartStore()
const notifications = useNotificationStore()
const router = useRouter()
const total = computed(() => cart.items.reduce((sum, i) => sum + (i.price * i.quantity), 0))
const loading = ref(false)

const handleCheckout = () => {
  router.push('/checkout')
}

onMounted(() => cart.fetchCart())
</script>
