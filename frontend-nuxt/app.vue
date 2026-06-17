<script setup>
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
onMounted(() => {
  auth.init()
})
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
