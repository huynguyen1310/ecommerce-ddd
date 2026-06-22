<template>
  <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
    <NuxtLink :to="`/products/${product.id}`" class="h-48 bg-gray-50 flex items-center justify-center relative overflow-hidden">
      <img
        v-if="product.imageUrl"
        :src="product.imageUrl"
        :alt="product.name"
        class="w-full h-full object-cover"
        loading="lazy"
      />
      <span v-else class="text-4xl text-gray-400">📦</span>
      <div v-if="product.stock <= 5 && product.stock > 0" class="absolute top-2 right-2 bg-amber-100 text-amber-700 text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider border border-amber-200">
        Low Stock: {{ product.stock }}
      </div>
      <div v-else-if="product.stock === 0" class="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center">
        <span class="bg-rose-600 text-white text-xs font-black px-3 py-1.5 rounded-lg shadow-lg rotate-[-5deg] uppercase">Out of Stock</span>
      </div>
      <div v-if="product.category" class="absolute top-2 left-2 bg-indigo-600/90 text-white text-[10px] font-black px-2 py-1 rounded-md uppercase tracking-wider">
        {{ product.category }}
      </div>
    </NuxtLink>
    <div class="p-5 flex flex-col flex-grow">
      <NuxtLink :to="`/products/${product.id}`" class="flex justify-between items-start mb-1">
        <h3 class="text-lg font-bold text-gray-900 line-clamp-1 hover:text-indigo-600 transition-colors">{{ product.name }}</h3>
      </NuxtLink>
      <p v-if="product.description" class="text-gray-500 text-sm line-clamp-2 mb-3">{{ product.description }}</p>
      <p v-else class="text-gray-400 text-[10px] font-mono mb-3 uppercase tracking-tighter">SKU: {{ product.sku }}</p>

      <div class="flex items-center gap-2 mb-3">
        <div class="flex items-center">
          <span v-for="i in 5" :key="i" class="text-sm" :class="i <= (avgRating || 0) ? 'text-amber-400' : 'text-gray-200'">★</span>
        </div>
        <span class="text-xs text-gray-400 font-medium">({{ reviewCount || 0 }})</span>
      </div>

      <div class="flex items-center justify-between mt-auto pt-4 border-t border-gray-50">
        <div class="flex flex-col">
          <span class="text-2xl font-black text-indigo-600">${{ product.price }}</span>
          <span v-if="product.stock > 0" class="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">In Stock</span>
        </div>
        <button
          @click="$emit('add-to-cart', product)"
          :disabled="product.stock === 0"
          :class="[
            'px-5 py-2.5 text-sm font-black rounded-xl transition-all flex items-center gap-2 shadow-lg active:scale-95',
            product.stock === 0
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-100'
          ]"
        >
          <span>{{ product.stock === 0 ? 'Waitlist' : 'Add' }}</span>
          <svg v-if="product.stock > 0" xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  product: { type: Object, required: true },
  avgRating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
})
defineEmits(['add-to-cart'])
</script>
