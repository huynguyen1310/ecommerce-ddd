<template>
  <div v-if="loading" class="text-center py-20">
    <p class="text-gray-400">Loading product...</p>
  </div>

  <div v-else-if="error" class="text-center py-20">
    <span class="text-6xl mb-4 block">🔍</span>
    <h2 class="text-2xl font-bold text-gray-900">Product not found</h2>
    <NuxtLink to="/" class="text-indigo-600 hover:underline mt-2 inline-block">Back to catalog</NuxtLink>
  </div>

  <div v-else class="max-w-4xl mx-auto">
    <NuxtLink to="/" class="text-sm text-indigo-600 hover:underline mb-6 inline-block">&larr; Back to catalog</NuxtLink>

    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="h-64 bg-gray-50 flex items-center justify-center relative overflow-hidden">
        <img
          v-if="product.imageUrl"
          :src="product.imageUrl"
          :alt="product.name"
          class="w-full h-full object-cover"
        />
        <span v-else class="text-6xl text-gray-400">📦</span>
        <span v-if="product.category" class="absolute top-3 left-3 bg-indigo-600/90 text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
          {{ product.category }}
        </span>
      </div>
      <div class="p-8">
        <div class="flex justify-between items-start mb-2">
          <h1 class="text-3xl font-black text-gray-900">{{ product.name }}</h1>
          <span class="text-3xl font-black text-indigo-600">${{ product.price }}</span>
        </div>
        <p class="text-gray-400 text-xs font-mono mb-4">SKU: {{ product.sku }}</p>
        <p v-if="product.description" class="text-gray-600 mb-6">{{ product.description }}</p>
        <p v-else class="text-gray-600 mb-6">High-quality product for your digital collection.</p>

        <div class="flex items-center gap-4 mb-6">
          <span v-if="product.stock > 0" class="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">In Stock ({{ product.stock }} available)</span>
          <span v-else class="text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">Out of Stock</span>
          <button
            @click="cart.addToCart(product)"
            :disabled="product.stock === 0"
            :class="[
              'px-6 py-3 font-black rounded-xl transition-all shadow-lg active:scale-95',
              product.stock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                : 'bg-indigo-600 hover:bg-indigo-700 text-white'
            ]"
          >
            {{ product.stock === 0 ? 'Out of Stock' : 'Add to Cart' }}
          </button>
        </div>
      </div>
    </div>

    <div v-if="relatedProducts.length > 0" class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 class="text-xl font-black text-gray-900 mb-6">Related Products</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NuxtLink
          v-for="rp in relatedProducts"
          :key="rp.id"
          :to="`/products/${rp.id}`"
          class="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
        >
          <div class="h-24 bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
            <img v-if="rp.imageUrl" :src="rp.imageUrl" :alt="rp.name" class="w-full h-full object-cover" />
            <span v-else class="text-3xl">📦</span>
          </div>
          <p class="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600">{{ rp.name }}</p>
          <p class="text-sm font-bold text-indigo-600">${{ rp.price }}</p>
        </NuxtLink>
      </div>
    </div>

    <div v-if="recentlyViewed.items.length > 1" class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 class="text-xl font-black text-gray-900 mb-6">Recently Viewed</h2>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <NuxtLink
          v-for="rv in recentlyViewed.items.filter(i => i.id !== product.id).slice(0, 4)"
          :key="rv.id"
          :to="`/products/${rv.id}`"
          class="group p-4 rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all"
        >
          <div class="h-24 bg-gray-50 rounded-lg mb-2 flex items-center justify-center overflow-hidden">
            <img v-if="rv.imageUrl" :src="rv.imageUrl" :alt="rv.name" class="w-full h-full object-cover" />
            <span v-else class="text-3xl">📦</span>
          </div>
          <p class="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600">{{ rv.name }}</p>
          <p class="text-sm font-bold text-indigo-600">${{ rv.price }}</p>
        </NuxtLink>
      </div>
    </div>

    <div class="mt-8 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
      <h2 class="text-xl font-black text-gray-900 mb-6">Reviews ({{ reviews.length }})</h2>

      <div v-if="reviewsLoading" class="text-center py-8">
        <p class="text-gray-400">Loading reviews...</p>
      </div>

      <div v-else-if="reviews.length === 0" class="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
        <span class="text-4xl mb-2 block">💬</span>
        <p class="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>

      <div v-else class="space-y-4 mb-8">
        <div v-for="review in reviews" :key="review.id" class="border border-gray-100 rounded-xl p-5">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-1">
              <span v-for="i in 5" :key="i" class="text-lg" :class="i <= review.rating ? 'text-amber-400' : 'text-gray-200'">★</span>
              <span class="text-xs text-gray-400 ml-2">{{ new Date(review.createdAt).toLocaleDateString() }}</span>
            </div>
            <button
              v-if="auth.isLoggedIn && (auth.user.role === 'admin' || auth.user.id === review.customerId)"
              @click="deleteReview(review.id)"
              class="text-xs text-red-400 hover:text-red-600 font-bold uppercase tracking-wider"
            >
              Delete
            </button>
          </div>
          <p class="text-gray-700">{{ review.text }}</p>
        </div>
      </div>

      <div v-if="auth.isLoggedIn" class="border-t border-gray-100 pt-6">
        <h3 class="text-lg font-bold text-gray-900 mb-4">Write a Review</h3>
        <div class="flex items-center gap-1 mb-3">
          <button v-for="i in 5" :key="i" @click="newRating = i" class="text-2xl" :class="i <= newRating ? 'text-amber-400' : 'text-gray-300'">★</button>
        </div>
        <textarea
          v-model="newText"
          placeholder="Share your thoughts about this product..."
          class="w-full border border-gray-200 rounded-xl p-4 mb-4 resize-none"
          rows="3"
        ></textarea>
        <div class="flex justify-end">
          <button
            @click="submitReview"
            :disabled="!newRating || !newText.trim()"
            class="px-6 py-3 font-black rounded-xl bg-indigo-600 text-white disabled:bg-gray-300 disabled:text-gray-500 hover:bg-indigo-700 transition-colors"
          >
            Submit Review
          </button>
        </div>
      </div>
      <div v-else class="border-t border-gray-100 pt-6 text-center">
        <p class="text-gray-400">
          <NuxtLink to="/login" class="text-indigo-600 hover:underline">Log in</NuxtLink> to write a review.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'
import { useRecentlyViewedStore } from '~/stores/recentlyViewed'

const cart = useCartStore()
const auth = useAuthStore()
const notifications = useNotificationStore()
const recentlyViewed = useRecentlyViewedStore()
const route = useRoute()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

const product = ref(null)
const reviews = ref([])
const relatedProducts = ref([])
const loading = ref(true)
const reviewsLoading = ref(true)
const error = ref(false)
const newRating = ref(0)
const newText = ref('')

const authHeaders = () => {
  if (!auth.token) return {}
  return { Authorization: `Bearer ${auth.token}` }
}

onMounted(async () => {
  recentlyViewed.hydrate()
  try {
    const data = await $fetch(`${apiBaseUrl}/api/products/${route.params.id}`)
    product.value = data
    recentlyViewed.track(data)
  } catch {
    error.value = true
    loading.value = false
    return
  }
  loading.value = false

  try {
    const [reviewsData, relatedData] = await Promise.all([
      $fetch(`${apiBaseUrl}/products/${route.params.id}/reviews`),
      $fetch(`${apiBaseUrl}/api/products/${route.params.id}/related`),
    ])
    reviews.value = reviewsData
    relatedProducts.value = relatedData
  } catch {
    console.error('Failed to load reviews/related')
  } finally {
    reviewsLoading.value = false
  }
})

async function submitReview() {
  if (!newRating.value || !newText.value.trim()) return
  try {
    const data = await $fetch(`${apiBaseUrl}/reviews`, {
      method: 'POST',
      headers: authHeaders(),
      body: {
        productId: route.params.id,
        customerId: auth.user.id,
        rating: newRating.value,
        text: newText.value.trim(),
      },
    })
    reviews.value.unshift(data)
    newRating.value = 0
    newText.value = ''
  } catch (err) {
    console.error('Failed to submit review:', err)
  }
}

async function deleteReview(id) {
  try {
    await $fetch(`${apiBaseUrl}/reviews/${id}`, {
      method: 'DELETE',
      headers: authHeaders(),
    })
    reviews.value = reviews.value.filter(r => r.id !== id)
    notifications.success('Review deleted')
  } catch (err) {
    notifications.error('Failed to delete review')
    console.error('Failed to delete review:', err)
  }
}
</script>
