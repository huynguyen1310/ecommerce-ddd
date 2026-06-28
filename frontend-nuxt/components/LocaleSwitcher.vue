<template>
  <div class="relative shrink-0" ref="menuRef">
    <button @click="open = !open" class="flex items-center gap-1 text-sm text-gray-600 hover:text-indigo-600 transition-colors px-1.5 py-1">
      <span>{{ current?.flag }}</span>
      <span class="hidden sm:inline text-xs font-medium">{{ current?.code?.toUpperCase() }}</span>
      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/></svg>
    </button>
    <div v-if="open" class="absolute right-0 top-full mt-1 w-36 bg-white rounded-xl border border-gray-100 shadow-lg z-50 py-1 overflow-hidden">
      <button v-for="l in i18n.supportedLocales" :key="l.code" @click="switchLocale(l.code)" class="flex items-center gap-2 w-full px-3 py-2 text-sm hover:bg-gray-50 transition-colors" :class="l.code === i18n.locale ? 'font-bold text-indigo-600 bg-indigo-50' : 'text-gray-700'">
        <span>{{ l.flag }}</span>
        <span>{{ l.native }}</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const i18n = useI18nStore()
const open = ref(false)
const menuRef = ref(null)
const current = computed(() => i18n.supportedLocales.find(l => l.code === i18n.locale) || i18n.supportedLocales[0])

function switchLocale(code) {
  i18n.setLocale(code)
  open.value = false
}

onMounted(() => {
  document.addEventListener('click', (e) => {
    if (menuRef.value && !menuRef.value.contains(e.target)) open.value = false
  })
})
</script>
