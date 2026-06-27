<script setup>
import { useAuthStore } from '~/stores/auth'
const auth = useAuthStore()
if (process.client) auth.init()
</script>

<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>
