<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Admin Dashboard</h1>
        <p class="text-gray-500 mt-2 text-lg">Overview of your store.</p>
      </div>
      <NuxtLink to="/admin/inventory" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100">
        Inventory Management
      </NuxtLink>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Products</p>
        <p class="text-3xl font-black text-gray-900">{{ stats.totalProducts }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Orders</p>
        <p class="text-3xl font-black text-gray-900">{{ stats.totalOrders }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Revenue</p>
        <p class="text-3xl font-black text-gray-900">${{ Number(stats.totalRevenue).toFixed(2) }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Total Users</p>
        <p class="text-3xl font-black text-gray-900">{{ stats.totalUsers }}</p>
      </div>
      <div class="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
        <p class="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Active Coupons</p>
        <p class="text-3xl font-black text-gray-900">{{ coupons.length }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">Recent Orders</h2>
          <span class="text-xs text-gray-400 font-medium">{{ orders.length }} total</span>
        </div>
        <div v-if="orders.length === 0" class="p-6 text-center text-gray-400 text-sm">No orders yet.</div>
        <div v-else class="divide-y divide-gray-100">
          <div v-for="order in orders.slice(0, 5)" :key="order.id" class="px-6 py-4 flex items-center justify-between hover:bg-gray-50/50">
            <div>
              <p class="text-sm font-bold text-gray-900">#{{ order.id.slice(0, 8) }}</p>
              <p class="text-xs text-gray-400">{{ new Date(order.createdAt).toLocaleDateString() }}</p>
            </div>
            <div class="text-right">
              <p class="text-sm font-bold text-gray-900">${{ Number(order.total).toFixed(2) }}</p>
              <p v-if="order.couponCode" class="text-xs text-green-600">Coupon: {{ order.couponCode }} (-${{ Number(order.discount).toFixed(2) }})</p>
              <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', order.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' : order.status === 'SHIPPED' ? 'bg-blue-100 text-blue-700' : order.status === 'CANCELLED' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700']">{{ order.status }}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="bg-white rounded-xl border border-gray-100 shadow-sm">
        <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 class="text-lg font-bold text-gray-900">Users</h2>
          <span class="text-xs text-gray-400 font-medium">{{ users.length }} total</span>
        </div>
        <div v-if="users.length === 0" class="p-6 text-center text-gray-400 text-sm">No users found.</div>
        <div v-else class="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
          <div v-for="user in users" :key="user.id" class="px-6 py-3 flex items-center justify-between hover:bg-gray-50/50">
            <div>
              <p class="text-sm font-bold text-gray-900">{{ user.email }}</p>
              <p class="text-xs text-gray-400">ID: {{ user.id?.slice(0, 8) }}</p>
            </div>
            <span :class="['text-xs font-bold px-2 py-0.5 rounded-full', user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-600']">{{ user.role }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="bg-white rounded-xl border border-gray-100 shadow-sm mt-8">
      <div class="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
        <h2 class="text-lg font-bold text-gray-900">Coupon Management</h2>
        <span class="text-xs text-gray-400 font-medium">{{ coupons.length }} total</span>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div class="lg:col-span-2">
            <div v-if="coupons.length === 0" class="text-center text-gray-400 text-sm py-8">No coupons created yet.</div>
            <div v-else class="space-y-3">
              <div v-for="c in coupons" :key="c.id" class="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div>
                  <p class="text-sm font-bold text-gray-900">{{ c.code }}</p>
                  <p class="text-xs text-gray-500">{{ c.discountType === 'PERCENTAGE' ? `${c.discountValue}% off` : `$${Number(c.discountValue).toFixed(2)} off` }}{{ c.minOrderAmount ? ` (min $${Number(c.minOrderAmount).toFixed(2)})` : '' }}</p>
                </div>
                <div class="text-right text-xs">
                  <p :class="c.isActive ? 'text-green-600' : 'text-red-500'">{{ c.isActive ? 'Active' : 'Inactive' }}</p>
                  <p class="text-gray-400">{{ c.usedCount }}/{{ c.maxUses || '∞' }} used{{ c.expiresAt ? ` · expires ${new Date(c.expiresAt).toLocaleDateString()}` : '' }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="border-l border-gray-100 pl-6">
            <h3 class="text-sm font-bold text-gray-900 mb-4">Create Coupon</h3>
            <form @submit.prevent="createCoupon" class="space-y-3">
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Code</label>
                <input v-model="form.code" type="text" required maxlength="20" placeholder="SAVE10" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm uppercase" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Type</label>
                  <select v-model="form.discountType" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm bg-white">
                    <option value="PERCENTAGE">%</option>
                    <option value="FIXED">$</option>
                  </select>
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Value</label>
                  <input v-model.number="form.discountValue" type="number" min="0" step="0.01" required placeholder="10" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Min Order (optional)</label>
                <input v-model.number="form.minOrderAmount" type="number" min="0" step="0.01" placeholder="50" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
              </div>
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Max Uses</label>
                  <input v-model.number="form.maxUses" type="number" min="0" placeholder="100" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                </div>
                <div>
                  <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Expires</label>
                  <input v-model="form.expiresAt" type="date" class="w-full px-3 py-2 rounded-lg border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm" />
                </div>
              </div>
              <button type="submit" :disabled="creating" class="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all disabled:opacity-50 text-sm">{{ creating ? 'Creating...' : 'Create Coupon' }}</button>
            </form>
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

const stats = ref({ totalProducts: 0, totalOrders: 0, totalRevenue: 0, totalUsers: 0 })
const orders = ref([])
const users = ref([])
const coupons = ref([])
const creating = ref(false)
const form = ref({ code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: null, maxUses: 0, expiresAt: '' })

async function createCoupon() {
  creating.value = true
  try {
    const body = { ...form.value }
    if (!body.minOrderAmount) delete body.minOrderAmount
    if (!body.maxUses) delete body.maxUses
    if (!body.expiresAt) delete body.expiresAt
    await $fetch(`${baseUrl()}/coupons`, { method: 'POST', headers: { 'Content-Type': 'application/json', ...authHeaders() }, body })
    notifications.success(`Coupon ${body.code} created`)
    coupons.value = await $fetch(`${baseUrl()}/coupons`, { headers: authHeaders() })
    form.value = { code: '', discountType: 'PERCENTAGE', discountValue: 0, minOrderAmount: null, maxUses: 0, expiresAt: '' }
  } catch (err) {
    notifications.error(err.data?.message || 'Failed to create coupon')
  } finally {
    creating.value = false
  }
}

onMounted(async () => {
  try {
    const [productsData, ordersData, usersData, couponsData] = await Promise.all([
      $fetch(`${baseUrl()}/api/products?per_page=1`),
      $fetch(`${baseUrl()}/orders`, { headers: authHeaders() }),
      $fetch(`${baseUrl()}/users`, { headers: authHeaders() }),
      $fetch(`${baseUrl()}/coupons`, { headers: authHeaders() }),
    ])
    stats.value.totalProducts = productsData.meta.total
    orders.value = ordersData
    stats.value.totalOrders = ordersData.length
    stats.value.totalRevenue = ordersData.reduce((s, o) => s + Number(o.total), 0)
    users.value = usersData
    stats.value.totalUsers = usersData.length
    coupons.value = couponsData
  } catch (err) {
    console.error('Dashboard fetch error:', err)
    notifications.error('Failed to load dashboard data')
  }
})

definePageMeta({ middleware: 'auth' })
</script>

<style scoped>
</style>
