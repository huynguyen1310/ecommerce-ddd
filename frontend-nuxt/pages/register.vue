<template>
  <div class="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
    <p class="text-gray-500 mb-8">Join us to start shopping today.</p>
    
    <form @submit.prevent="handleRegister" class="space-y-6">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <input v-model="email" type="email" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
        <input v-model="password" type="password" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
      </div>
      
      <button type="submit" :disabled="loading" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50">
        {{ loading ? 'Creating account...' : 'Create Account' }}
      </button>
    </form>
    
    <p class="mt-8 text-center text-gray-600">
      Already have an account? 
      <NuxtLink to="/login" class="text-indigo-600 font-bold hover:underline">Sign in</NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'
const auth = useAuthStore()
const notifications = useNotificationStore()
const router = useRouter()

onMounted(() => {
  if (auth.isLoggedIn) router.push('/')
})

const email = ref('')
const password = ref('')
const loading = ref(false)

const handleRegister = async () => {
  loading.value = true
  const result = await auth.register(email.value, password.value)
  loading.value = false
  if (result.success) {
    notifications.success('Account created! You can now login.')
    router.push('/login')
  } else {
    notifications.error(result.error)
  }
}
</script>
