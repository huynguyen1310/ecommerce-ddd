<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav class="container mx-auto px-4 h-14 flex items-center gap-1.5">
        <NuxtLink to="/" class="text-xl font-bold text-indigo-600 tracking-tight shrink-0">E-Shop</NuxtLink>

        <div class="relative flex-1 max-w-sm min-w-0">
          <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
          <input
            v-model="searchQuery"
            @input="onSearchInput"
            @focus="searchFocused = true"
            @blur="onSearchBlur"
            @keydown.enter="goToSearch"
            placeholder="Search products..."
            class="w-full pl-9 pr-8 py-2 rounded-xl border border-gray-200 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none text-sm transition-all bg-gray-50 focus:bg-white"
          />
          <button v-if="searchQuery" @click="searchQuery = ''; searchResults = []; searchFocused = false" class="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>

          <div v-if="searchFocused && searchResults.length > 0" class="absolute top-full mt-1 left-0 right-0 bg-white rounded-xl border border-gray-100 shadow-xl z-50 py-2 max-h-80 overflow-y-auto">
            <NuxtLink v-for="r in searchResults" :key="r.id" :to="`/products/${r.id}`" @click="searchFocused = false; searchQuery = ''" class="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
              <div class="w-10 h-10 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                <img v-if="r.imageUrl" :src="r.imageUrl" class="w-full h-full object-cover" />
                <span v-else class="flex items-center justify-center h-full text-lg">📦</span>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-bold text-gray-900 truncate">{{ r.name }}</p>
                <p class="text-xs text-gray-400">${{ Number(r.price).toFixed(2) }}<span v-if="r.shop_name"> · {{ r.shop_name }}</span></p>
              </div>
              <span v-if="!r.in_stock" class="text-[10px] font-bold text-rose-500 shrink-0">OOS</span>
            </NuxtLink>
            <NuxtLink :to="`/search?q=${searchQuery}`" @click="searchFocused = false" class="flex items-center gap-2 px-4 py-2.5 text-sm font-bold text-indigo-600 hover:bg-indigo-50 border-t border-gray-50 mt-1">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
              View all results for "{{ searchQuery }}"
            </NuxtLink>
          </div>
        </div>

        <div class="flex items-center gap-1.5 text-sm flex-1 justify-end">
          <NuxtLink v-if="auth.isLoggedIn" to="/orders" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium px-2 py-1.5 shrink-0">My Orders</NuxtLink>
          <NuxtLink to="/wishlist" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center gap-1 px-1.5 py-1.5 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/></svg>
            <span class="hidden sm:inline">Wishlist</span>
            <span v-if="wishlist.count > 0" class="px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">{{ wishlist.count }}</span>
          </NuxtLink>
          <NuxtLink v-if="auth.isLoggedIn" to="/messages" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center px-2 py-1.5 shrink-0">
            Messages
            <span v-if="chatUnread > 0" class="ml-1 px-1.5 py-0.5 text-xs bg-rose-500 text-white rounded-full">{{ chatUnread > 99 ? '99+' : chatUnread }}</span>
          </NuxtLink>
          <NuxtLink v-if="auth.isLoggedIn" to="/notifications" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center px-1.5 py-1.5 shrink-0 relative">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"/></svg>
            <span v-if="notifUnread > 0" class="absolute -top-0.5 -right-0.5 px-1 py-0.5 text-[10px] bg-rose-500 text-white rounded-full min-w-[16px] text-center leading-none">{{ notifUnread > 99 ? '99+' : notifUnread }}</span>
          </NuxtLink>
          <NuxtLink to="/cart" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center gap-1 px-1.5 py-1.5 shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"/></svg>
            <span class="hidden sm:inline">Cart</span>
            <span v-if="cartCount > 0" class="ml-1 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full">{{ cartCount > 99 ? '99+' : cartCount }}</span>
          </NuxtLink>
          <div v-if="auth.isLoggedIn" class="relative border-l pl-1.5 ml-1 profile-menu shrink-0">
            <button @click="showMenu = !showMenu" class="flex items-center gap-1 text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors px-1.5 py-1.5">
              <span class="hidden sm:inline max-w-[100px] truncate">{{ auth.user?.email }}</span>
              <svg class="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            </button>
            <div v-if="showMenu" class="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1.5 overflow-hidden">
              <NuxtLink to="/profile" @click="showMenu = false" class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Profile</NuxtLink>
              <NuxtLink v-if="auth.isVendor" to="/vendor/dashboard" @click="showMenu = false" class="block px-4 py-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">My Shop</NuxtLink>
              <NuxtLink v-else-if="!auth.isAdmin" to="/vendor/create" @click="showMenu = false" class="block px-4 py-2 text-sm text-indigo-600 font-bold hover:bg-indigo-50 transition-colors">Become a Vendor</NuxtLink>
              <NuxtLink v-if="auth.isAdmin" to="/admin" @click="showMenu = false" class="block px-4 py-2 text-sm text-amber-600 font-bold hover:bg-amber-50 transition-colors">Admin</NuxtLink>
              <hr class="my-1 border-gray-100" />
              <button @click="handleLogout" class="block w-full text-left px-4 py-2 text-sm text-rose-600 font-bold hover:bg-rose-50 transition-colors">Logout</button>
            </div>
          </div>
          <NuxtLink v-else to="/login" class="px-3 py-1.5 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium shrink-0 text-sm">Login</NuxtLink>
        </div>
      </nav>
    </header>

    <main class="flex-grow container mx-auto px-4 py-8">
      <slot />
    </main>

    <NotificationToast />

    <footer class="bg-white border-t py-12">
      <div class="container mx-auto px-4 text-center text-gray-500">
        <p>&copy; 2026 E-Shop DDD Demo. All rights reserved.</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useCartStore } from '~/stores/cart'
import { useWishlistStore } from '~/stores/wishlist'
import { useAuthStore } from '~/stores/auth'
import { useAppNotificationStore } from '~/stores/notification'

const cartStore = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()
const appNotif = useAppNotificationStore()
const router = useRouter()
const config = useRuntimeConfig()
const showMenu = ref(false)
const chatUnread = ref(0)
let unreadTimer = null

const cartCount = computed(() => cartStore.items.reduce((sum, item) => sum + item.quantity, 0))
const notifUnread = computed(() => appNotif.unreadCount)
const apiBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

// Search
const searchQuery = ref('')
const searchResults = ref([])
const searchFocused = ref(false)
let searchTimer = null

function onSearchInput() {
  clearTimeout(searchTimer)
  if (searchQuery.value.length < 2) { searchResults.value = []; return }
  searchTimer = setTimeout(fetchSuggestions, 250)
}

async function fetchSuggestions() {
  try {
    const res = await $fetch(`${apiBaseUrl}/api/products/autocomplete?q=${encodeURIComponent(searchQuery.value)}`)
    searchResults.value = (res || []).slice(0, 6)
  } catch { searchResults.value = [] }
}

function onSearchBlur() {
  setTimeout(() => { searchFocused.value = false }, 200)
}

function goToSearch() {
  if (searchQuery.value.length >= 2) {
    window.location.href = `/search?q=${encodeURIComponent(searchQuery.value)}`
  }
}

const fetchUnread = async () => {
  if (!auth.isLoggedIn) return
  try {
    const apiBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl
    const { count } = await $fetch(`${apiBaseUrl}/chat/unread-count`, { headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {} })
    chatUnread.value = count
  } catch {}
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  wishlist.hydrate()
  cartStore.fetchCart()
  document.addEventListener('click', handleClickOutside)
  fetchUnread()
  appNotif.fetchUnreadCount()
  unreadTimer = setInterval(() => {
    fetchUnread()
    appNotif.fetchUnreadCount()
  }, 10000)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  if (unreadTimer) clearInterval(unreadTimer)
})

const handleClickOutside = (e) => {
  if (showMenu.value && !e.target.closest('.profile-menu')) showMenu.value = false
}

watch(() => auth.isLoggedIn, () => cartStore.fetchCart())
</script>
