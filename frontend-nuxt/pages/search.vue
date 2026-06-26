<template>
  <div class="flex gap-8">
    <!-- Faceted sidebar -->
    <aside class="w-64 shrink-0 hidden lg:block">
      <div class="sticky top-24 space-y-6">
        <div>
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Category</h3>
          <div class="space-y-1">
            <button @click="filters.category = ''; page = 1; fetchResults()" :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors', !filters.category ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50']">All Categories</button>
            <button v-for="cat in categories" :key="cat" @click="filters.category = cat; page = 1; fetchResults()" :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors', filters.category === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50']">{{ cat }}</button>
          </div>
        </div>

        <div>
          <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Price Range</h3>
          <div class="space-y-1">
            <button v-for="r in priceRanges" :key="r.label" @click="filters.min_price = r.min; filters.max_price = r.max; page = 1; fetchResults()" :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors', filters.min_price === r.min && filters.max_price === r.max ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50']">{{ r.label }}</button>
          </div>
        </div>

        <div>
          <label class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
            <input type="checkbox" v-model="filters.in_stock" @change="page = 1; fetchResults()" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
            <span class="text-sm font-bold text-gray-700">In Stock Only</span>
          </label>
        </div>

        <button v-if="hasActiveFilters" @click="clearFilters" class="text-sm text-rose-600 font-bold hover:underline">Clear all filters</button>
      </div>
    </aside>

    <!-- Results -->
    <div class="flex-1 min-w-0">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-3xl font-black text-gray-900 tracking-tight">Search</h1>
          <p v-if="query" class="text-sm text-gray-400 mt-1">
            {{ pagination.total }} result{{ pagination.total !== 1 ? 's' : '' }} for <span class="font-bold text-gray-600">"{{ query }}"</span>
          </p>
        </div>
        <select v-model="sort" @change="fetchResults" class="text-sm border border-gray-200 rounded-xl px-3 py-2.5 bg-white focus:border-indigo-300 outline-none">
          <option value="">Relevance</option>
          <option value="price:asc">Price ↑</option>
          <option value="price:desc">Price ↓</option>
          <option value="name:asc">Name A-Z</option>
          <option value="name:desc">Name Z-A</option>
        </select>
      </div>

      <!-- Mobile filters -->
      <div class="flex gap-2 mb-4 lg:hidden overflow-x-auto">
        <button @click="showMobileFilters = !showMobileFilters" class="shrink-0 px-4 py-2 border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50">
          <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/></svg>
          Filters
        </button>
        <button v-for="cat in categories.slice(0, 5)" :key="cat" @click="filters.category = filters.category === cat ? '' : cat; page = 1; fetchResults()" :class="['shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-colors', filters.category === cat ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200']">{{ cat }}</button>
      </div>

      <!-- Mobile filter drawer -->
      <div v-if="showMobileFilters" class="fixed inset-0 z-50 lg:hidden">
        <div class="absolute inset-0 bg-black/30" @click="showMobileFilters = false"></div>
        <div class="absolute left-0 top-0 bottom-0 w-72 bg-white shadow-2xl p-6 overflow-y-auto">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-lg font-black text-gray-900">Filters</h2>
            <button @click="showMobileFilters = false" class="text-gray-400 hover:text-gray-600"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg></button>
          </div>
          <div class="space-y-6">
            <div>
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Category</h3>
              <div class="space-y-1">
                <button @click="filters.category = ''; page = 1; fetchResults()" :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors', !filters.category ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50']">All</button>
                <button v-for="cat in categories" :key="cat" @click="filters.category = cat; page = 1; fetchResults()" :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors', filters.category === cat ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50']">{{ cat }}</button>
              </div>
            </div>
            <div>
              <h3 class="text-xs font-black text-gray-400 uppercase tracking-wider mb-3">Price Range</h3>
              <div class="space-y-1">
                <button v-for="r in priceRanges" :key="r.label" @click="filters.min_price = r.min; filters.max_price = r.max; page = 1; fetchResults()" :class="['w-full text-left px-3 py-2 rounded-lg text-sm font-bold transition-colors', filters.min_price === r.min && filters.max_price === r.max ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600 hover:bg-gray-50']">{{ r.label }}</button>
              </div>
            </div>
            <label class="flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
              <input type="checkbox" v-model="filters.in_stock" @change="page = 1; fetchResults()" class="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
              <span class="text-sm font-bold text-gray-700">In Stock Only</span>
            </label>
            <button v-if="hasActiveFilters" @click="clearFilters" class="text-sm text-rose-600 font-bold hover:underline">Clear all filters</button>
          </div>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div v-for="n in 6" :key="n" class="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
      </div>

      <!-- Empty -->
      <div v-else-if="results.length === 0" class="text-center py-20">
        <div class="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <svg class="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
        </div>
        <p class="text-gray-400 font-bold mb-1">No results found</p>
        <p class="text-sm text-gray-300">Try a different search term or adjust your filters.</p>
      </div>

      <!-- Results grid -->
      <div v-else class="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <NuxtLink v-for="r in results" :key="r.id" :to="`/products/${r.id}`" class="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow group">
          <div class="aspect-square bg-gray-50 relative overflow-hidden">
            <img v-if="r.imageUrl" :src="r.imageUrl" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <span v-else class="flex items-center justify-center h-full text-4xl text-gray-300">📦</span>
            <div v-if="r.category" class="absolute top-2 left-2 bg-white/90 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider text-gray-700">{{ r.category }}</div>
            <div v-if="!r.inStock" class="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center">
              <span class="bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-lg rotate-[-5deg] shadow-lg uppercase">Out of Stock</span>
            </div>
          </div>
          <div class="p-4">
            <p class="font-bold text-gray-900 truncate">{{ r.name }}</p>
            <p v-if="r.shop?.name" class="text-xs text-gray-400 mt-0.5">by {{ r.shop.name }}</p>
            <p class="text-lg font-black text-indigo-600 mt-1">${{ Number(r.price).toFixed(2) }}</p>
          </div>
        </NuxtLink>
      </div>

      <!-- Pagination -->
      <div v-if="pagination.total > pagination.perPage" class="flex items-center justify-center gap-4">
        <button @click="page = Math.max(1, page - 1); fetchResults()" :disabled="page <= 1" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50">← Prev</button>
        <span class="text-sm text-gray-400 font-bold">Page {{ page }} of {{ lastPage }}</span>
        <button @click="page = Math.min(lastPage, page + 1); fetchResults()" :disabled="page >= lastPage" class="px-5 py-2.5 border border-gray-200 rounded-xl text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50">Next →</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
const cart = useCartStore()
const route = useRoute()
const config = useRuntimeConfig()
const base = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

const query = ref(route.query.q || '')
const results = ref([])
const categories = ref([])
const loading = ref(true)
const page = ref(1)
const lastPage = ref(1)
const sort = ref('')
const showMobileFilters = ref(false)

const pagination = ref({ total: 0, page: 1, perPage: 20 })

const filters = ref({
  category: route.query.category || '',
  min_price: route.query.min_price || '',
  max_price: route.query.max_price || '',
  in_stock: route.query.in_stock === 'true',
})

const priceRanges = [
  { label: 'Under $25', min: 0, max: 25 },
  { label: '$25 to $50', min: 25, max: 50 },
  { label: '$50 to $100', min: 50, max: 100 },
  { label: '$100 to $200', min: 100, max: 200 },
  { label: 'Over $200', min: 200, max: '' },
]

const hasActiveFilters = computed(() => filters.value.category || filters.value.min_price !== '' || filters.value.max_price !== '' || filters.value.in_stock)

function clearFilters() {
  filters.value = { category: '', min_price: '', max_price: '', in_stock: false }
  page.value = 1
  fetchResults()
}

async function fetchResults() {
  loading.value = true
  const params = new URLSearchParams({ q: query.value, page: String(page.value), per_page: '20' })
  if (filters.value.category) params.set('category', filters.value.category)
  if (filters.value.min_price !== '' && filters.value.min_price !== null) params.set('min_price', String(filters.value.min_price))
  if (filters.value.max_price !== '' && filters.value.max_price !== null) params.set('max_price', String(filters.value.max_price))
  if (filters.value.in_stock) params.set('in_stock', 'true')
  if (sort.value) params.set('sort', sort.value)

  try {
    const res = await $fetch(`${base}/api/products/search?${params}`)
    results.value = res.data || []
    pagination.value = res.meta
    lastPage.value = Math.ceil(res.meta.total / res.meta.per_page)
  } catch { results.value = []; pagination.value = { total: 0, page: 1, perPage: 20 } }
  finally { loading.value = false }
}

async function fetchCategories() {
  try { categories.value = await $fetch(`${base}/api/products/categories`) }
  catch {}
}

watch(() => route.query.q, (q) => {
  if (q && q !== query.value) { query.value = q; page.value = 1; fetchResults() }
})

onMounted(() => {
  fetchCategories()
  if (query.value) fetchResults()
  else loading.value = false
})
</script>
