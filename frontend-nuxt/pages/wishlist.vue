<template>
  <div class="max-w-5xl mx-auto">
    <div class="flex items-center justify-between mb-8">
      <div>
        <h1 class="text-4xl font-black text-gray-900 tracking-tight">Wishlist</h1>
        <p class="text-gray-500 mt-2 text-lg">Products you've saved for later.</p>
      </div>
      <span class="text-sm text-gray-400 font-medium">{{ wishlist.count }} items</span>
    </div>

    <div v-if="wishlist.items.length === 0" class="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300">
      <span class="text-6xl mb-4 block">♡</span>
      <h2 class="text-2xl font-bold text-gray-900">Your wishlist is empty</h2>
      <p class="text-gray-500 mb-8">Save products you love by tapping the heart icon.</p>
      <NuxtLink to="/" class="px-8 py-3 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors">Browse Products</NuxtLink>
    </div>

    <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      <div v-for="item in wishlist.items" :key="item.id" class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
        <div class="relative">
          <NuxtLink :to="`/products/${item.id}`" class="h-40 bg-gray-50 flex items-center justify-center overflow-hidden">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="w-full h-full object-cover" loading="lazy" />
            <span v-else class="text-4xl text-gray-400">📦</span>
          </NuxtLink>
          <button @click="wishlist.remove(item.id)" class="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 text-rose-500 hover:bg-white flex items-center justify-center transition-colors shadow-sm">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div class="p-4 flex flex-col flex-grow">
          <NuxtLink :to="`/products/${item.id}`" class="mb-2">
            <h3 class="font-bold text-gray-900 line-clamp-1 hover:text-indigo-600">{{ item.name }}</h3>
          </NuxtLink>
          <div class="flex items-center justify-between mt-auto pt-3 border-t border-gray-50">
            <span class="text-xl font-black text-indigo-600">${{ Number(item.price).toFixed(2) }}</span>
            <button @click="addToCart(item)" class="px-4 py-2 bg-indigo-600 text-white text-sm font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">Add to Cart</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useWishlistStore } from '~/stores/wishlist'
import { useCartStore } from '~/stores/cart'
import { useNotificationStore } from '~/stores/notifications'

const wishlist = useWishlistStore()
const cart = useCartStore()
const notifications = useNotificationStore()

onMounted(() => wishlist.hydrate())

const addToCart = (item) => {
  cart.addToCart(item)
  wishlist.remove(item.id)
}
</script>
