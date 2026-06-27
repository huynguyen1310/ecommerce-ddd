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
      <div class="bg-gray-50 relative overflow-hidden group" style="height:256px">
        <Transition :name="slideDir" mode="out-in">
          <img
            v-if="currentImage"
            :key="currentImage"
            :src="currentImage"
            :alt="product.name"
            class="w-full h-full object-cover absolute inset-0"
          />
          <span v-else :key="'placeholder'" class="absolute inset-0 flex items-center justify-center text-6xl text-gray-400">📦</span>
        </Transition>
        <span v-if="promo.getBestPromotion(product.id, product.shop_id)" class="absolute top-3 left-3 bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
          <div class="flex items-center gap-1">
            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
            -{{ promo.getBestPromotion(product.id, product.shop_id)?.rewards?.percent_off ?? 0 }}% FLASH
          </div>
          <PromotionTimer :end-at="promo.getBestPromotion(product.id, product.shop_id).end_at" class="text-white/80" />
        </span>
        <span v-else-if="product.category" class="absolute top-3 left-3 bg-indigo-600/90 text-white text-xs font-black px-3 py-1.5 rounded-lg uppercase tracking-wider">
          {{ product.category }}
        </span>
        <button
          v-if="displayImages.length > 1"
          @click="prevImage"
          class="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700 text-xl font-bold z-10"
        >‹</button>
        <button
          v-if="displayImages.length > 1"
          @click="nextImage"
          class="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-700 text-xl font-bold z-10"
        >›</button>
        <div v-if="displayImages.length > 1" class="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
          <button
            v-for="(img, i) in displayImages"
            :key="i"
            @click="selectedImageIndex = i"
            :class="[
              'w-2 h-2 rounded-full transition-all',
              i === selectedImageIndex ? 'bg-white shadow-lg w-4' : 'bg-white/60 hover:bg-white/80'
            ]"
          />
        </div>
      </div>
      <div class="p-8">
        <div class="flex justify-between items-start mb-2">
          <div>
            <h1 class="text-3xl font-black text-gray-900">{{ product.name }}</h1>
            <p v-if="product.shop" class="text-sm text-gray-400 mt-1">Sold by <NuxtLink :to="`/shops/${product.shop.id}`" class="text-indigo-600 font-bold hover:underline">{{ product.shop.name }}</NuxtLink></p>
          </div>
          <div v-if="promo.getBestPromotion(product.id, product.shop_id)" class="text-right">
            <span class="text-3xl font-black text-rose-600">${{ (Number(displayPrice) * (1 - (promo.getBestPromotion(product.id, product.shop_id)?.rewards?.percent_off ?? 0) / 100)).toFixed(2) }}</span>
            <p class="text-sm text-gray-400 line-through">${{ Number(displayPrice).toFixed(2) }}</p>
          </div>
          <span v-else class="text-3xl font-black text-indigo-600">${{ displayPrice }}</span>
        </div>
        <p class="text-gray-400 text-xs font-mono mb-4">SKU: {{ displaySku }}</p>
        <p v-if="product.description" class="text-gray-600 mb-6">{{ product.description }}</p>
        <p v-else class="text-gray-600 mb-6">High-quality product for your digital collection.</p>

        <div v-if="variants.length > 0" class="mb-6">
          <label class="block text-xs font-bold text-gray-400 uppercase mb-2">Variant</label>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="v in variants"
              :key="v.id"
              @click="selectedVariant = v"
              :class="[
                'px-4 py-2 rounded-xl border text-sm font-bold transition-all',
                selectedVariant?.id === v.id
                  ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                  : 'border-gray-200 hover:border-gray-300 text-gray-600'
              ]"
            >
              {{ variantLabel(v) }}
              <span class="ml-1 text-indigo-600">${{ variantPrice(v) }}</span>
            </button>
          </div>
        </div>

        <div class="flex items-center gap-4 mb-6">
          <span v-if="displayStock > 0" class="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-100">In Stock ({{ displayStock }} available)</span>
          <span v-else class="text-sm font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-lg border border-rose-100">Out of Stock</span>
          <div class="flex items-center gap-2">
            <button
              v-if="!isOwnProduct"
              @click="addToCart"
              :disabled="displayStock === 0"
              :class="[
                'px-6 py-3 font-black rounded-xl transition-all shadow-lg active:scale-95',
                displayStock === 0
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              ]"
            >
              {{ displayStock === 0 ? 'Out of Stock' : 'Add to Cart' }}
            </button>
            <button
              v-if="auth.isLoggedIn && product.shop && !isOwnProduct"
              @click="openChat"
              class="px-4 py-3 font-bold rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all text-sm"
            >
              Chat
            </button>
          </div>
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

      <div v-else-if="reviews.length === 0 && !isOwnProduct" class="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
        <span class="text-4xl mb-2 block">💬</span>
        <p class="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
      <div v-else-if="reviews.length === 0 && isOwnProduct" class="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl">
        <span class="text-4xl mb-2 block">📋</span>
        <p class="text-gray-500">No reviews yet for this product.</p>
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

      <div v-if="auth.isLoggedIn && !isOwnProduct" class="border-t border-gray-100 pt-6">
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
      <div v-else-if="auth.isLoggedIn && !isOwnProduct" class="border-t border-gray-100 pt-6 text-center">
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
const router = useRouter()
const config = useRuntimeConfig()
const apiBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
const promo = usePromotions()

const product = ref(null)
const reviews = ref([])
const relatedProducts = ref([])
const loading = ref(true)
const reviewsLoading = ref(true)
const error = ref(false)
const newRating = ref(0)
const newText = ref('')
const variants = ref([])
const selectedVariant = ref(null)
const vendorShop = ref(null)

const isOwnProduct = computed(() => vendorShop.value && product.value?.shop?.id === vendorShop.value?.id)
const selectedImageIndex = ref(0)
const slideDir = ref('slide-right')
const displayImages = computed(() => {
  if (selectedVariant.value?.imageUrl) return [selectedVariant.value.imageUrl]
  const imgs = product.value?.images || []
  return imgs.length > 0 ? imgs : (product.value?.imageUrl ? [product.value.imageUrl] : [])
})
const currentImage = computed(() => displayImages.value[selectedImageIndex.value] || null)

function prevImage() {
  slideDir.value = 'slide-right'
  selectedImageIndex.value = (selectedImageIndex.value - 1 + displayImages.value.length) % displayImages.value.length
  resetCycle()
}
function nextImage() {
  slideDir.value = 'slide-left'
  selectedImageIndex.value = (selectedImageIndex.value + 1) % displayImages.value.length
  resetCycle()
}

let autoCycle
function resetCycle() {
  clearInterval(autoCycle)
  autoCycle = setInterval(() => { if (displayImages.value.length > 1) nextImage() }, 4000)
}
onMounted(() => resetCycle())
onUnmounted(() => clearInterval(autoCycle))

watch(selectedVariant, () => { selectedImageIndex.value = 0 })

const displayPrice = computed(() => selectedVariant.value?.price ?? product.value?.price ?? 0)
const displaySku = computed(() => selectedVariant.value?.sku ?? product.value?.sku ?? '')
const displayStock = computed(() => selectedVariant.value?.stock ?? product.value?.stock ?? 0)

function variantLabel(v) {
  const attrs = v.attributes || {}
  const parts = Object.values(attrs).filter(Boolean)
  return parts.length ? parts.join(' / ') : v.sku
}

function variantPrice(v) {
  return v.price ?? product.value?.price ?? 0
}

const authHeaders = () => {
  if (!auth.token) return {}
  return { Authorization: `Bearer ${auth.token}` }
}

function addToCart() {
  cart.addToCart({ ...product.value, selectedVariant: selectedVariant.value })
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

  if (auth.isLoggedIn) {
    try {
      const shop = await $fetch(`${apiBaseUrl}/shops/my`, { headers: authHeaders() })
      vendorShop.value = shop
    } catch { /* not a vendor */ }
  }

  try {
    const [reviewsData, relatedData, variantData] = await Promise.all([
      $fetch(`${apiBaseUrl}/products/${route.params.id}/reviews`),
      $fetch(`${apiBaseUrl}/api/products/${route.params.id}/related`),
      $fetch(`${apiBaseUrl}/api/products/${route.params.id}/variants`).catch(() => ({ data: [] })),
    ])
    reviews.value = reviewsData
    relatedProducts.value = relatedData
    variants.value = variantData.data || []
  } catch {
    console.error('Failed to load reviews/related')
  } finally {
    reviewsLoading.value = false
  }

  promo.fetchAllActive()

  // Record view
  $fetch(`${apiBaseUrl}/api/products/view`, {
    method: 'POST',
    body: { user_id: auth.user?.id || 'anonymous', product_id: route.params.id },
  }).catch(() => {})
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

function openChat() {
  const shop = product.value.shop
  if (!shop) return
  const q = new URLSearchParams({
    shop: shop.id,
    shopName: shop.name,
    product: product.value.id,
    productName: product.value.name,
  })
  router.push(`/messages?${q}`)
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

<style scoped>
.slide-left-enter-active, .slide-left-leave-active,
.slide-right-enter-active, .slide-right-leave-active {
  transition: all .5s ease;
}
.slide-left-enter-from { transform: translateX(100%); }
.slide-left-leave-to   { transform: translateX(-100%); }
.slide-right-enter-from { transform: translateX(-100%); }
.slide-right-leave-to   { transform: translateX(100%); }
</style>
