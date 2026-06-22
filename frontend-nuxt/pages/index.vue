<template>
  <div>
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Digital Catalog</h1>
        <p class="text-gray-500 mt-2 text-lg">Browse our curated collection of expert knowledge.</p>
      </div>
      <div class="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100 flex items-center gap-2">
        <span class="text-indigo-600 font-bold">{{ products.length }}</span>
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

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <ProductCard
        v-for="product in products"
        :key="product.id"
        :product="product"
        :avg-rating="productRatings[product.id]?.avg || 0"
        :review-count="productRatings[product.id]?.count || 0"
        @add-to-cart="cart.addToCart"
      />
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

const fetchProducts = async () => {
  try {
    const config = useRuntimeConfig()
    const baseUrl = process.server ? config.apiCatalogInternalUrl : config.public.apiCatalogUrl
    const data = await $fetch(`${baseUrl}/api/products`)
    products.value = data
    fetchAllRatings(data)
  } catch (err) {
    console.error('Index fetch error:', err)
    notifications.error('Failed to load products')
  } finally {
    loading.value = false
  }
}

const fetchAllRatings = async (prods) => {
  const config = useRuntimeConfig()
  const baseUrl = process.server ? config.apiReviewInternalUrl : config.public.apiReviewUrl
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

onMounted(fetchProducts)
</script>
