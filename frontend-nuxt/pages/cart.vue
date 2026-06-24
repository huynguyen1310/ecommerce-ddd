<template>
  <div class="max-w-4xl mx-auto">
    <h1 class="text-4xl font-black text-gray-900 mb-8 tracking-tight">Your Cart</h1>

    <div v-if="cart.items.length === 0" class="text-center py-20 bg-white rounded-2xl shadow-sm border border-gray-100">
      <span class="text-6xl mb-4 block">🛒</span>
      <h2 class="text-2xl font-bold text-gray-900">Your cart is empty</h2>
      <p class="text-gray-500 mb-8">Looks like you haven't added anything yet.</p>
      <NuxtLink to="/" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">Start Shopping</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div class="lg:col-span-2 space-y-6">
        <div v-for="(group, shopKey) in grouped" :key="shopKey" class="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div class="px-5 py-3 border-b border-gray-100 flex items-center gap-3">
            <input type="checkbox" :checked="shopAllSelected(shopKey)" @change="toggleShop(shopKey)" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span class="font-bold text-gray-900">{{ group.shopName }}</span>
            <span class="text-xs text-gray-400">{{ group.items.length }} item{{ group.items.length !== 1 ? 's' : '' }}</span>
          </div>
          <div class="divide-y divide-gray-50">
            <div v-for="item in group.items" :key="item.productId" class="px-5 py-4 flex items-center gap-4">
              <input type="checkbox" :checked="isSelected(item.productId)" @change="toggleItem(item.productId)" class="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <div class="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-xl overflow-hidden flex-shrink-0">
                <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" />
                <span v-else>📦</span>
              </div>
              <div class="flex-grow min-w-0">
                <h3 class="font-bold text-gray-900 truncate">{{ item.name }}</h3>
                <div class="flex items-center gap-2 mt-1.5">
                  <button @click="cart.updateQuantity(item.productId, item.quantity - 1)" class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-sm">−</button>
                  <span class="w-7 text-center font-bold text-sm">{{ item.quantity }}</span>
                  <button @click="cart.updateQuantity(item.productId, item.quantity + 1)" class="w-7 h-7 rounded-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 font-bold text-sm">+</button>
                </div>
              </div>
              <div class="text-right">
                <p class="font-black text-indigo-600">${{ (item.price * item.quantity).toFixed(2) }}</p>
                <p class="text-xs text-gray-400">${{ item.price.toFixed(2) }}/ea</p>
                <button @click="cart.removeFromCart(item.productId)" class="text-xs text-rose-500 hover:text-rose-700 font-bold mt-1">Remove</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 h-fit sticky top-24">
        <h2 class="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
        <div class="space-y-4 mb-6 pb-6 border-b border-gray-100">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal ({{ selectedCount }} item{{ selectedCount !== 1 ? 's' : '' }})</span>
            <span>${{ selectedTotal.toFixed(2) }}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span class="text-green-600 font-medium">Free</span>
          </div>
        </div>
        <div class="flex justify-between items-center mb-6">
          <span class="text-lg font-bold text-gray-900">Total</span>
          <span class="text-2xl font-black text-indigo-600">${{ selectedTotal.toFixed(2) }}</span>
        </div>
        <button @click="handleCheckout" :disabled="selectedCount === 0 || loading" class="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl transition-all shadow-lg hover:shadow-indigo-200 disabled:opacity-50">
          {{ loading ? 'Processing...' : selectedCount === 0 ? 'Select items' : 'Place Order' }}
        </button>
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
const loading = ref(false)

const selected = ref(new Set())

const grouped = computed(() => {
  const groups = {}
  for (const item of cart.items) {
    const key = item.shopId || '__noshop__'
    if (!groups[key]) groups[key] = { shopName: item.shopName || 'Other', items: [] }
    groups[key].items.push(item)
  }
  return groups
})

const selectedItems = computed(() => cart.items.filter(i => selected.value.has(i.productId)))
const selectedCount = computed(() => selectedItems.value.length)
const selectedTotal = computed(() => selectedItems.value.reduce((s, i) => s + i.price * i.quantity, 0))

function isSelected(id) { return selected.value.has(id) }

function toggleItem(id) {
  const next = new Set(selected.value)
  if (next.has(id)) next.delete(id); else next.add(id)
  selected.value = next
}

function toggleShop(shopKey) {
  const group = grouped.value[shopKey]
  const allSelected = group.items.every(i => selected.value.has(i.productId))
  const next = new Set(selected.value)
  for (const item of group.items) {
    if (allSelected) next.delete(item.productId); else next.add(item.productId)
  }
  selected.value = next
}

function shopAllSelected(shopKey) {
  const group = grouped.value[shopKey]
  return group.items.length > 0 && group.items.every(i => selected.value.has(i.productId))
}

function handleCheckout() {
  if (selectedCount.value === 0) return
  const items = selectedItems.value
  router.push({ path: '/checkout', query: { items: items.map(i => i.productId).join(',') } })
}

watch(() => cart.items, (items) => {
  const next = new Set(selected.value)
  for (const item of items) {
    if (!next.has(item.productId)) next.add(item.productId)
  }
  selected.value = next
}, { immediate: true })

onMounted(() => cart.fetchCart())
</script>
