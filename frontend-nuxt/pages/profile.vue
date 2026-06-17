<template>
  <div class="max-w-4xl mx-auto">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="h-32 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
      <div class="px-8 pb-8">
        <div class="relative flex justify-between items-end -mt-12 mb-8">
          <div class="p-2 bg-white rounded-2xl shadow-lg">
            <div class="w-24 h-24 bg-indigo-100 rounded-xl flex items-center justify-center text-4xl">
              👤
            </div>
          </div>
          <button @click="handleLogout" class="px-6 py-2 border border-rose-200 text-rose-600 font-bold rounded-lg hover:bg-rose-50 transition-colors">
            Logout
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div class="md:col-span-2 space-y-6">
            <div>
              <h1 class="text-3xl font-black text-gray-900 tracking-tight">User Profile</h1>
              <p class="text-gray-500">Manage your account settings and preferences.</p>
            </div>

            <div class="space-y-4">
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Email Address</label>
                <p class="text-gray-900 font-medium">{{ auth.user?.email }}</p>
              </div>
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">Account Role</label>
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-indigo-100 text-indigo-800 capitalize">
                  {{ auth.user?.role || 'Customer' }}
                </span>
              </div>
              <div class="p-4 bg-gray-50 rounded-xl border border-gray-100">
                <label class="block text-xs font-bold text-gray-400 uppercase mb-1">User ID</label>
                <p class="text-gray-900 font-mono text-xs">{{ auth.user?.id }}</p>
              </div>
            </div>
          </div>

          <div class="space-y-6">
            <div class="p-6 bg-indigo-50 rounded-2xl border border-indigo-100 text-center">
              <h3 class="text-lg font-bold text-indigo-900 mb-2">Quick Stats</h3>
              <div class="grid grid-cols-2 gap-4">
                <div class="bg-white p-3 rounded-xl shadow-sm">
                  <p class="text-2xl font-black text-indigo-600">{{ cartCount }}</p>
                  <p class="text-[10px] font-bold text-gray-400 uppercase">Cart Items</p>
                </div>
                <div class="bg-white p-3 rounded-xl shadow-sm">
                  <p class="text-2xl font-black text-indigo-600">0</p>
                  <p class="text-[10px] font-bold text-gray-400 uppercase">Orders</p>
                </div>
              </div>
            </div>
            
            <NuxtLink v-if="auth.isAdmin" to="/admin/inventory" class="block w-full py-4 bg-gray-900 text-white text-center font-bold rounded-xl hover:bg-black transition-colors shadow-lg">
              Go to Admin Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useCartStore } from '~/stores/cart'

const auth = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

const cartCount = computed(() => cartStore.items.reduce((sum, item) => sum + item.quantity, 0))

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

definePageMeta({
  middleware: 'auth'
})
</script>
