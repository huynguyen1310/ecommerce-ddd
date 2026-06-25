<template>
  <div v-if="loading" class="text-center py-20"><p class="text-gray-400">Loading shop...</p></div>
  <div v-else-if="!shop" class="text-center py-20">
    <span class="text-6xl mb-4 block">🔍</span>
    <h2 class="text-2xl font-bold text-gray-900">Shop not found</h2>
    <NuxtLink to="/" class="text-indigo-600 hover:underline mt-2 inline-block">Back to catalog</NuxtLink>
  </div>
  <div v-else>
    <NuxtLink to="/" class="text-sm text-indigo-600 hover:underline mb-6 inline-block">&larr; Back to catalog</NuxtLink>
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-6">
          <div class="w-20 h-20 bg-indigo-100 rounded-2xl flex items-center justify-center text-3xl font-black text-indigo-600">{{ shop.name.charAt(0) }}</div>
          <div>
            <h1 class="text-3xl font-black text-gray-900">{{ shop.name }}</h1>
            <p v-if="shop.description" class="text-gray-500 mt-1">{{ shop.description }}</p>
          </div>
        </div>
        <button
          v-if="auth.isLoggedIn"
          @click="openChat"
          class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 transition-colors"
        >
          Message Shop
        </button>
      </div>
    </div>

    <h2 class="text-xl font-black text-gray-900 mb-6">Products</h2>
    <div v-if="products.length === 0" class="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-300">
      <span class="text-4xl mb-2 block">📦</span>
      <p class="text-gray-500">This shop has no products yet.</p>
    </div>
    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      <NuxtLink v-for="p in products" :key="p.id" :to="`/products/${p.id}`" class="group bg-white rounded-xl border border-gray-100 hover:border-indigo-200 hover:shadow-md transition-all p-4">
        <div class="h-32 bg-gray-50 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
          <img v-if="p.imageUrl" :src="p.imageUrl" :alt="p.name" class="w-full h-full object-cover" />
          <span v-else class="text-4xl">📦</span>
        </div>
        <p class="text-sm font-bold text-gray-900 truncate group-hover:text-indigo-600">{{ p.name }}</p>
        <p class="text-sm font-bold text-indigo-600 mt-1">${{ Number(p.price).toFixed(2) }}</p>
        <p class="text-xs text-gray-400 mt-1">{{ p.stock > 0 ? 'In Stock' : 'Out of Stock' }}</p>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const baseUrl = () => process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

const shop = ref(null)
const products = ref([])
const loading = ref(true)

function openChat() {
  const q = new URLSearchParams({ shop: route.params.id, shopName: shop.value.name })
  router.push(`/messages?${q}`)
}

onMounted(async () => {
  try {
    const [shopData, productsData] = await Promise.all([
      $fetch(`${baseUrl()}/shops/${route.params.id}`),
      $fetch(`${baseUrl()}/shops/${route.params.id}/products`),
    ])
    shop.value = shopData
    products.value = productsData.data || []
  } catch {
    shop.value = null
  } finally {
    loading.value = false
  }
})
</script>
