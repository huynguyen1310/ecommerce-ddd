<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-indigo-600 tracking-tight">E-Shop</NuxtLink>
        
        <div class="flex items-center space-x-6">
          <NuxtLink to="/" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Home</NuxtLink>
          <NuxtLink v-if="auth.isLoggedIn" to="/orders" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium">My Orders</NuxtLink>
          <NuxtLink to="/wishlist" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center">
            Wishlist
            <span v-if="wishlist.count > 0" class="ml-1 px-2 py-0.5 text-xs bg-rose-500 text-white rounded-full">{{ wishlist.count }}</span>
          </NuxtLink>
          <NuxtLink to="/cart" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center">
            Cart
            <span v-if="cartCount > 0" class="ml-1 px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">{{ cartCount }}</span>
          </NuxtLink>
          <div v-if="auth.isLoggedIn" class="relative border-l pl-4 profile-menu">
            <button @click="showMenu = !showMenu" class="flex items-center gap-1.5 text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">
              {{ auth.user?.email }}
              <svg class="w-3.5 h-3.5 transition-transform" :class="showMenu && 'rotate-180'" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
            </button>
            <div v-if="showMenu" class="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1.5 overflow-hidden">
              <NuxtLink to="/profile" @click="showMenu = false" class="block px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">Profile</NuxtLink>
              <NuxtLink v-if="auth.isAdmin" to="/admin" @click="showMenu = false" class="block px-4 py-2.5 text-sm text-amber-600 font-bold hover:bg-amber-50 transition-colors">⚡ Admin Dashboard</NuxtLink>
              <hr class="my-1.5 border-gray-100" />
              <button @click="handleLogout" class="block w-full text-left px-4 py-2.5 text-sm text-rose-600 font-bold hover:bg-rose-50 transition-colors">Logout</button>
            </div>
          </div>
          <NuxtLink v-else to="/login" class="px-4 py-2 rounded-lg border border-indigo-600 text-indigo-600 hover:bg-indigo-50 transition-colors font-medium">Login</NuxtLink>
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

const cartStore = useCartStore()
const wishlist = useWishlistStore()
const auth = useAuthStore()
const router = useRouter()
const showMenu = ref(false)

const cartCount = computed(() => cartStore.items.reduce((sum, item) => sum + item.quantity, 0))

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(() => {
  wishlist.hydrate()
  cartStore.fetchCart()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const handleClickOutside = (e) => {
  if (showMenu.value && !e.target.closest('.profile-menu')) showMenu.value = false
}

watch(() => auth.isLoggedIn, () => cartStore.fetchCart())
</script>
