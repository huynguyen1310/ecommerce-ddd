<template>
  <div class="min-h-screen flex flex-col bg-gray-50">
    <header class="bg-white shadow-sm border-b sticky top-0 z-50">
      <nav class="container mx-auto px-4 h-16 flex items-center justify-between">
        <NuxtLink to="/" class="text-2xl font-bold text-indigo-600 tracking-tight">E-Shop</NuxtLink>
        
        <div class="flex items-center space-x-6">
          <NuxtLink to="/" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium">Home</NuxtLink>
          <NuxtLink v-if="auth.isLoggedIn" to="/orders" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium">My Orders</NuxtLink>
          <NuxtLink v-if="auth.isAdmin" to="/admin/inventory" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium text-amber-600">Admin</NuxtLink>
          <NuxtLink to="/cart" class="text-gray-600 hover:text-indigo-600 transition-colors font-medium flex items-center">
            Cart
            <span v-if="cartCount > 0" class="ml-1 px-2 py-0.5 text-xs bg-indigo-600 text-white rounded-full">{{ cartCount }}</span>
          </NuxtLink>
          <div v-if="auth.isLoggedIn" class="flex items-center gap-4 border-l pl-4">
            <NuxtLink to="/profile" class="text-sm font-bold text-gray-900 hover:text-indigo-600 transition-colors">
              {{ auth.user?.email }}
            </NuxtLink>
            <button @click="handleLogout" class="text-sm text-rose-600 font-bold hover:underline">Logout</button>
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
import { useAuthStore } from '~/stores/auth'

const cartStore = useCartStore()
const auth = useAuthStore()
const router = useRouter()

const cartCount = computed(() => cartStore.items.reduce((sum, item) => sum + item.quantity, 0))

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>
