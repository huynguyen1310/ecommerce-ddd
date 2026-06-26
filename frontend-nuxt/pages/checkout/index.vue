<template>
  <div class="max-w-5xl mx-auto">
    <h1 class="text-4xl font-black text-gray-900 mb-8 tracking-tight">Checkout</h1>

    <div v-if="checkoutItems.length === 0" class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
      <span class="text-6xl mb-4 block">🛒</span>
      <h2 class="text-2xl font-bold text-gray-900">Nothing to checkout</h2>
      <NuxtLink to="/cart" class="text-indigo-600 hover:underline mt-2 inline-block">Back to cart</NuxtLink>
    </div>

    <div v-else-if="checkoutItems.length > 0" class="grid grid-cols-1 lg:grid-cols-5 gap-8">
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
          <div class="space-y-6 mb-6">
            <div v-for="(group, shopKey) in groupedItems" :key="shopKey">
              <p class="text-xs font-bold text-gray-400 uppercase mb-2">{{ group.shopName }}</p>
              <div v-for="item in group.items" :key="item.productId" class="flex items-center gap-3 mb-3">
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
          </div>

          <div class="border-t border-gray-100 pt-4 space-y-2">
            <div class="flex justify-between text-sm text-gray-600"><span>Subtotal</span><span>${{ subtotal.toFixed(2) }}</span></div>
            <div class="flex justify-between text-sm text-gray-600"><span>Shipping</span><span class="text-green-600 font-medium">Free</span></div>
            <div v-if="couponDiscount" class="flex justify-between text-sm text-green-600"><span>Discount ({{ appliedCoupon }})</span><span>-${{ couponDiscount.toFixed(2) }}</span></div>
            <div class="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t border-gray-100 mt-2"><span>Total</span><span class="text-indigo-600">${{ finalTotal.toFixed(2) }}</span></div>
          </div>

          <div class="mt-6 pt-6 border-t border-gray-100">
            <div class="flex gap-2">
              <input v-model="couponInput" @keyup.enter="applyCoupon" type="text" placeholder="Coupon code" class="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm uppercase" maxlength="20" />
              <button @click="applyCoupon" :disabled="couponLoading || !couponInput" class="px-4 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm">{{ couponLoading ? '...' : 'Apply' }}</button>
            </div>
            <p v-if="couponError" class="text-red-500 text-xs mt-1">{{ couponError }}</p>
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
const route = useRoute()
const config = useRuntimeConfig()

const selectedIds = computed(() => {
  const q = route.query.items
  return q ? new Set(q.split(',').filter(Boolean)) : new Set()
})
const checkoutItems = computed(() => cart.items.filter(i => selectedIds.value.has(i.productId)))

const address = ref({ name: '', street: '', city: '', state: '', zip: '', country: 'US' })
const submitting = ref(false)
const groupedItems = computed(() => {
  const groups = {}
  for (const item of checkoutItems.value) {
    const key = item.shopId || '__noshop__'
    if (!groups[key]) groups[key] = { shopName: item.shopName || 'Other', items: [] }
    groups[key].items.push(item)
  }
  return groups
})

const subtotal = computed(() => checkoutItems.value.reduce((s, i) => s + i.price * i.quantity, 0))
const couponInput = ref('')
const couponLoading = ref(false)
const couponError = ref('')
const appliedCoupon = ref('')
const couponDiscount = ref(0)

const finalTotal = computed(() => Math.max(0, subtotal.value - couponDiscount.value))

async function applyCoupon() {
  couponError.value = ''
  couponLoading.value = true
  try {
    const res = await $fetch(`${config.public.apiGatewayUrl}/coupons/validate`, {
      method: 'POST',
      body: { code: couponInput.value.toUpperCase(), orderTotal: subtotal.value },
    })
    appliedCoupon.value = res.code
    couponDiscount.value = res.discount
    couponInput.value = ''
    notifications.success(`Coupon applied! You save $${res.discount.toFixed(2)}`)
  } catch (err) {
    couponDiscount.value = 0
    appliedCoupon.value = ''
    couponError.value = err.data?.message || 'Invalid coupon code'
  } finally {
    couponLoading.value = false
  }
}

const submitOrder = async () => {
  if (!auth.isLoggedIn) {
    notifications.error('Please log in to place an order')
    return router.push('/login')
  }
  submitting.value = true
  try {
    const order = await cart.checkout(address.value, appliedCoupon.value || undefined, checkoutItems.value)
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
