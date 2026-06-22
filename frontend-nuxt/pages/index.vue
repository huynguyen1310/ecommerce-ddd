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

    <div v-if="loading" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <div v-for="n in 4" :key="n" class="h-80 bg-gray-100 animate-pulse rounded-xl"></div>
    </div>

    <div v-else-if="products.length === 0" class="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-300">
      <span class="text-6xl mb-4 block">🔍</span>
      <h2 class="text-2xl font-bold text-gray-900">No products found</h2>
      <p class="text-gray-500">We couldn't find any products in our catalog right now.</p>
    </div>

    <div v-else>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <ProductCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :avg-rating="productRatings[product.id]?.avg || 0"
          :review-count="productRatings[product.id]?.count || 0"
          @add-to-cart="cart.addToCart"
        />
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

const fetchProducts = async (page = 1) => {
  loading.value = true
  try {
    const config = useRuntimeConfig()
    const baseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    const data = await $fetch(`${baseUrl}/api/products?page=${page}&per_page=12`)
    products.value = data.data
    paginationMeta.value = data.meta
    fetchAllRatings(data.data)
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

onMounted(() => fetchProducts(1))
</script>
