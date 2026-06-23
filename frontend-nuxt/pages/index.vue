<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Digital Catalog</h1>
        <p class="text-gray-500 mt-2 text-lg">Browse our curated collection of expert knowledge.</p>
      </div>
      <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center gap-2">
        <span class="text-indigo-600 font-bold">{{ paginationMeta.total }}</span>
        <span class="text-indigo-400">Products</span>
      </div>
    </div>

    <div class="flex flex-col sm:flex-row gap-3 mb-8">
      <div class="relative flex-1">
        <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/>
        </svg>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search products..."
          class="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm"
        />
      </div>
      <select
        v-model="selectedCategory"
        class="px-4 py-2.5 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition-all text-sm bg-white min-w-[160px]"
      >
        <option value="">All Categories</option>
        <option v-for="cat in categories" :key="cat" :value="cat">{{ cat }}</option>
      </select>
    </div>

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="n in 4" :key="n" class="h-80 bg-gray-100 animate-pulse rounded-xl"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
      <span class="text-6xl mb-4 block">🔍</span>
      <h2 class="text-2xl font-bold text-gray-900">No products found</h2>
      <p class="text-gray-500">We couldn't find any products in our catalog right now.</p>
    </div>

    <div v-else>
      <div :key="gridKey" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <div v-for="(product, i) in products" :key="product.id" class="card-in" :style="{ animationDelay: `${i * 60}ms` }">
          <ProductCard
            :product="product"
            :avg-rating="productRatings[product.id]?.avg || 0"
            :review-count="productRatings[product.id]?.count || 0"
            @add-to-cart="cart.addToCart"
          />
        </div>
      </div>

      <div v-if="paginationMeta.lastPage > 1" class="flex items-center justify-center gap-2">
        <button
          @click="goToPage(paginationMeta.page - 1)"
          :disabled="paginationMeta.page <= 1"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          ← Prev
        </button>
        <button
          v-for="p in visiblePages"
          :key="p"
          @click="goToPage(p)"
          :class="[
            'w-10 h-10 rounded-lg text-sm font-bold transition-colors',
            p === paginationMeta.page
              ? 'bg-indigo-600 text-white'
              : 'border border-gray-200 hover:bg-gray-50'
          ]"
        >
          {{ p }}
        </button>
        <button
          @click="goToPage(paginationMeta.page + 1)"
          :disabled="paginationMeta.page >= paginationMeta.lastPage"
          class="px-4 py-2 rounded-lg border border-gray-200 text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50"
        >
          Next →
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

const products = ref([])
const loading = ref(true)
const productRatings = ref({})
const paginationMeta = ref({ total: 0, page: 1, perPage: 12, lastPage: 1 })
const searchQuery = ref('')
const selectedCategory = ref('')
const categories = ref([])
const gridKey = ref(0)


const visiblePages = computed(() => {
  const { page, lastPage } = paginationMeta.value
  const pages = []
  const start = Math.max(1, page - 2)
  const end = Math.min(lastPage, page + 2)
  for (let i = start; i <= end; i++) {
    pages.push(i)
  }
  return pages
})

const buildUrl = (page = 1) => {
  const params = new URLSearchParams({ page, per_page: 12 })
  if (searchQuery.value) params.set('search', searchQuery.value)
  if (selectedCategory.value) params.set('category', selectedCategory.value)
  return params
}

const fetchProducts = async (page = 1) => {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    const params = buildUrl(page)
    const data = await $fetch(`${baseUrl}/api/products?${params}`)
    products.value = data.data
    paginationMeta.value = data.meta
    fetchAllRatings(data.data)
    gridKey.value++
  } catch (err) {
    console.error('Index fetch error:', err)
    notifications.error('Failed to load products')
  } finally {
    loading.value = false
  }
}

const goToPage = (page) => {
  if (page < 1 || page > paginationMeta.value.lastPage) return
  fetchProducts(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const fetchAllRatings = async (prods) => {
  const config = useRuntimeConfig()
  const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
  const results = {}
  await Promise.all(prods.map(async (p) => {
    try {
      const reviews = await $fetch(`${baseUrl}/products/${p.id}/reviews`)
      if (reviews.length > 0) {
        const sum = reviews.reduce((s, r) => s + r.rating, 0)
        results[p.id] = { avg: Math.round(sum / reviews.length), count: reviews.length }
      } else {
        results[p.id] = { avg: 0, count: 0 }
      }
    } catch {
      results[p.id] = { avg: 0, count: 0 }
    }
  }))
  productRatings.value = results
}

const fetchCategories = async () => {
  try {
    const config = useRuntimeConfig()
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    categories.value = await $fetch(`${baseUrl}/api/products/categories`)
  } catch {
    // non-critical
  }
}

let debounceTimer
watch([searchQuery, selectedCategory], () => {
  clearTimeout(debounceTimer)
  debounceTimer = setTimeout(() => fetchProducts(1), 300)
})

onMounted(() => {
  fetchProducts(1)
  fetchCategories()
})
</script>

<style scoped>
.card-in {
  animation: fadeUp 0.55s ease both;
}

@keyframes fadeUp {
  from {
    opacity: 0;
    transform: translateY(36px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
