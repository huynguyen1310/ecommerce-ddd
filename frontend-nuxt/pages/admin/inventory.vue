<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Inventory Management</h1>
        <p class="text-gray-500 mt-2 text-lg">Staff Dashboard for catalog control.</p>
      </div>
      <div class="flex gap-4">
        <button @click="showAddModal = true" class="px-6 py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2 shadow-lg shadow-indigo-100">
          <span>Add Product</span>
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
        <button @click="fetchProducts" class="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-indigo-100">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Add Product Modal -->
    <div v-if="showAddModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/50 backdrop-blur-sm">
      <div class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 border border-gray-100">
        <h2 class="text-2xl font-black text-gray-900 mb-6">Create New Product</h2>
        <form @submit.prevent="addProduct" class="space-y-4">
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Product Name</label>
            <input v-model="newProduct.name" type="text" required class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. Advanced DDD Book" />
          </div>
          <div>
            <label class="block text-xs font-bold text-gray-400 uppercase mb-1">SKU</label>
            <input v-model="newProduct.sku" type="text" required class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" placeholder="e.g. BK-DDD-001" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Price ($)</label>
              <input v-model.number="newProduct.price" type="number" step="0.01" required class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
            <div>
              <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Initial Stock</label>
              <input v-model.number="newProduct.stock" type="number" required class="w-full px-4 py-2 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <div class="flex gap-4 mt-8">
            <button type="button" @click="showAddModal = false" class="flex-1 py-3 border border-gray-200 text-gray-500 font-bold rounded-xl hover:bg-gray-50 transition-colors">Cancel</button>
            <button type="submit" class="flex-1 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100">Create Product</button>
          </div>
        </form>
      </div>
    </div>

    <div class="flex items-center gap-3 mb-6">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
        </svg>
        <input v-model="searchQuery" type="text" placeholder="Search products..." class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm" />
      </div>
      <span class="text-sm text-gray-400 font-medium whitespace-nowrap">{{ paginationMeta.total }} products</span>
    </div>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <table class="w-full text-left border-collapse">
        <thead class="bg-gray-50 border-b border-gray-100">
          <tr>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Product</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">SKU</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Current Stock</th>
            <th class="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          <tr v-for="product in products" :key="product.id" class="hover:bg-gray-50/50 transition-colors">
            <td class="px-6 py-4">
              <div class="font-bold text-gray-900">{{ product.name }}</div>
              <div class="text-xs text-gray-400 font-mono">{{ product.id }}</div>
            </td>
            <td class="px-6 py-4 text-gray-500 font-mono text-sm">{{ product.sku }}</td>
            <td class="px-6 py-4">
              <span :class="[
                'px-3 py-1 rounded-full text-xs font-bold',
                product.stock > 10 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              ]">
                {{ product.stock }} units
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center gap-3">
                <input 
                  type="number" 
                  v-model.number="updateValues[product.id]" 
                  class="w-20 px-2 py-1 border rounded-lg text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button 
                  @click="updateStock(product.id)" 
                  class="p-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors"
                  title="Update Stock"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                  </svg>
                </button>
                <button 
                  @click="deleteProduct(product.id)" 
                  class="p-2 bg-rose-50 text-rose-600 rounded-lg hover:bg-rose-100 transition-colors"
                  title="Delete Product"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div v-if="paginationMeta.lastPage > 1" class="flex items-center justify-center gap-2 mt-6">
      <button @click="goToPage(paginationMeta.page - 1)" :disabled="paginationMeta.page <= 1" class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50">← Prev</button>
      <button v-for="p in visiblePages" :key="p" @click="goToPage(p)" :class="['w-10 h-10 rounded-lg text-sm font-bold transition-colors', p === paginationMeta.page ? 'bg-indigo-600 text-white' : 'border border-gray-200 hover:bg-gray-50']">{{ p }}</button>
      <button @click="goToPage(paginationMeta.page + 1)" :disabled="paginationMeta.page >= paginationMeta.lastPage" class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50">Next →</button>
    </div>
  </div>
</template>

<script setup>
import { useNotificationStore } from '~/stores/notifications'
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
const notifications = useNotificationStore()
const config = useRuntimeConfig()
const authHeaders = () => auth.token ? { Authorization: `Bearer ${auth.token}` } : {}

const products = ref([])
const updateValues = ref({})
const showAddModal = ref(false)
const newProduct = ref({ name: '', sku: '', price: 0, stock: 0 })
const searchQuery = ref('')
const paginationMeta = ref({ total: 0, page: 1, perPage: 20, lastPage: 1 })

const visiblePages = computed(() => {
  const { page, lastPage } = paginationMeta.value
  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(lastPage, page + 2)
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

const buildUrl = (page = 1) => {
  const params = new URLSearchParams({ page, per_page: 20 })
  if (searchQuery.value) params.set('search', searchQuery.value)
  return params
}

const fetchProducts = async (page = 1) => {
  try {
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    const data = await $fetch(`${baseUrl}/api/products?${buildUrl(page)}`)
    products.value = data.data
    paginationMeta.value = data.meta
    products.value.forEach(p => {
      updateValues.value[p.id] = p.stock
    })
  } catch (err) {
    console.error('Fetch error:', err)
    notifications.error('Failed to fetch products')
  }
}

const goToPage = (page) => {
  if (page < 1 || page > paginationMeta.value.lastPage) return
  fetchProducts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const addProduct = async () => {
  try {
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    await $fetch(`${baseUrl}/api/products`, {
      method: 'POST',
      headers: authHeaders(),
      body: newProduct.value
    })
    notifications.success('Product created successfully!')
    showAddModal.value = false
    newProduct.value = { name: '', sku: '', price: 0, stock: 0 }
    fetchProducts()
  } catch (err) {
    notifications.error('Failed to create product. Check if SKU is unique.')
  }
}

const updateStock = async (id) => {
  const newStock = updateValues.value[id]
  try {
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    await $fetch(`${baseUrl}/api/products/${id}/stock`, {
      method: 'PATCH',
      headers: authHeaders(),
      body: { stock: newStock }
    })
    notifications.success('Stock updated!')
    fetchProducts()
  } catch (err) {
    notifications.error('Failed to update stock')
  }
}

const deleteProduct = async (id) => {
  if (!confirm('Are you sure you want to delete this product?')) return
  try {
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    await $fetch(`${baseUrl}/api/products/${id}`, {
      method: 'DELETE',
      headers: authHeaders()
    })
    notifications.success('Product deleted')
    fetchProducts()
  } catch (err) {
    notifications.error('Failed to delete product')
  }
}

let debounceTimer
watch(searchQuery, () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchProducts(1), 300)
})

onMounted(() => fetchProducts(1))

definePageMeta({
  middleware: 'auth'
})
</script>
