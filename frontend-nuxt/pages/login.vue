<template>
  <div class="max-w-md mx-auto mt-16 p-8 bg-white rounded-xl shadow-lg border border-gray-100">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h1>
    <p class="text-gray-500 mb-8">Please enter your details to sign in.</p>
    
    <form @submit.prevent="handleLogin" class="space-y-6">
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Email Address</label>
        <input v-model="email" type="email" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="you@example.com" />
      </div>
      <div>
        <label class="block text-sm font-semibold text-gray-700 mb-2">Password</label>
        <input v-model="password" type="password" required class="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all" placeholder="••••••••" />
      </div>
      
      <button type="submit" :disabled="loading" class="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-md disabled:opacity-50">
        {{ loading ? 'Signing in...' : 'Sign In' }}
      </button>
    </form>
    
    <p class="mt-8 text-center text-gray-600">
      Don't have an account? 
      <NuxtLink to="/register" class="text-indigo-600 font-bold hover:underline">Sign up</NuxtLink>
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

const handleLogin = async () => {
  loading.value = true
  const success = await auth.login(email.value, password.value)
  loading.value = false
  if (success) {
    notifications.success('Logged in successfully!')
    router.push('/')
  } else {
    notifications.error('Login failed. Please check your credentials.')
  }
}
</script>
