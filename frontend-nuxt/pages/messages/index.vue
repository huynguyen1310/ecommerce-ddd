<template>
  <div v-if="!auth.isLoggedIn" class="text-center py-20">
    <p class="text-gray-400 mb-4">Log in to view your messages.</p>
    <NuxtLink to="/login" class="text-indigo-600 hover:underline font-bold">Log in</NuxtLink>
  </div>

  <div v-else class="flex h-[calc(100vh-12rem)] -mx-4">
    <!-- Conversation List -->
    <div class="w-80 shrink-0 border-r border-gray-200 bg-white flex flex-col" :class="activeConv ? 'hidden lg:flex' : 'flex'">
      <div class="p-4 border-b border-gray-100">
        <h2 class="text-lg font-black text-gray-900">Messages</h2>
      </div>
      <div v-if="loading" class="flex-1 flex items-center justify-center"><p class="text-gray-400">Loading...</p></div>
      <div v-else-if="conversations.length === 0" class="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <span class="text-5xl mb-4">💬</span>
        <p class="text-gray-500 mb-2">No conversations yet</p>
        <p class="text-sm text-gray-400">Start by messaging a shop from a product page.</p>
      </div>
      <div v-else class="flex-1 overflow-y-auto divide-y divide-gray-50">
        <button
          v-for="conv in conversations"
          :key="conv.shop_id + (conv.buyer_id || '')"
          @click="openConversation(conv)"
          class="w-full flex items-start gap-3 text-left p-4 hover:bg-gray-50 transition-colors group"
          :class="activeConv && activeConv.shop_id === conv.shop_id && activeConv.buyer_id === conv.buyer_id ? 'bg-indigo-50' : ''"
        >
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
            {{ auth.isVendor && conv.buyer_email ? conv.buyer_email.charAt(0).toUpperCase() : (conv.shop_name ? conv.shop_name.charAt(0).toUpperCase() : 'S') }}
          </div>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between">
              <p class="text-sm font-bold text-gray-900 truncate">{{ auth.isVendor && conv.buyer_email ? conv.buyer_email : (conv.shop_name || 'Shop') }}</p>
              <div class="flex items-center gap-2 shrink-0">
                <button @click.stop="deleteConversation(conv)" class="text-gray-200 hover:text-red-500 transition-colors" title="Delete">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <p v-if="conv.last_message_at" class="text-xs text-gray-400">{{ timeAgo(conv.last_message_at) }}</p>
              </div>
            </div>
            <p v-if="auth.isVendor && conv.shop_name" class="text-xs text-gray-500">{{ conv.shop_name }}</p>
            <div class="flex items-center justify-between mt-0.5">
              <p class="text-sm text-gray-500 truncate">{{ conv.last_message || 'No messages' }}</p>
              <span v-if="conv.unread_count > 0" class="ml-2 px-1.5 py-0.5 text-xs bg-indigo-600 text-white rounded-full shrink-0">{{ conv.unread_count }}</span>
            </div>
          </div>
        </button>
      </div>
    </div>

    <!-- Active Chat -->
    <div class="flex-1 flex flex-col bg-white" :class="!activeConv ? 'hidden lg:flex' : 'flex'">
      <div v-if="!activeConv" class="flex-1 flex items-center justify-center text-gray-400">
        <div class="text-center">
          <span class="text-6xl mb-4 block">💬</span>
          <p>Select a conversation</p>
        </div>
      </div>
      <template v-else>
        <!-- Chat Header -->
        <div class="flex items-center gap-3 p-4 border-b border-gray-100">
          <button class="lg:hidden text-gray-500" @click="activeConv = null">&larr;</button>
          <div class="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-sm font-bold text-indigo-600">
            {{ auth.isVendor && activeConv.buyer_email ? activeConv.buyer_email.charAt(0).toUpperCase() : (activeConv.shop_name ? activeConv.shop_name.charAt(0).toUpperCase() : 'S') }}
          </div>
          <div>
            <p class="text-sm font-bold text-gray-900">{{ auth.isVendor && activeConv.buyer_email ? activeConv.buyer_email : (activeConv.shop_name || 'Shop') }}</p>
            <p v-if="auth.isVendor && activeConv.shop_name" class="text-xs text-gray-500">{{ activeConv.shop_name }}</p>
          </div>
          <NuxtLink v-if="activeConv.shop_id" :to="`/shops/${activeConv.shop_id}`" class="ml-auto text-xs text-indigo-600 hover:underline">View Shop</NuxtLink>
        </div>

        <!-- Messages -->
        <div ref="messagesContainer" class="flex-1 overflow-y-auto p-4 space-y-4">
          <div v-for="msg in messages" :key="msg.id" class="flex" :class="msg.buyer_id === auth.user.id ? 'justify-end' : 'justify-start'">
            <div class="max-w-sm" :class="msg.buyer_id === auth.user.id ? 'bg-indigo-600 text-white rounded-2xl rounded-br-md' : 'bg-gray-100 text-gray-900 rounded-2xl rounded-bl-md'">
              <p class="px-4 py-2.5 text-sm">{{ msg.message }}</p>
              <div v-if="msg.product_name" class="px-4 pb-2">
                <NuxtLink v-if="msg.product_id" :to="`/products/${msg.product_id}`" class="text-xs underline" :class="msg.buyer_id === auth.user.id ? 'text-indigo-200' : 'text-indigo-600'">
                  Regarding: {{ msg.product_name }}
                </NuxtLink>
                <span v-else class="text-xs" :class="msg.buyer_id === auth.user.id ? 'text-indigo-200' : 'text-gray-400'">Regarding: {{ msg.product_name }}</span>
              </div>
              <p class="px-4 pb-2 text-xs" :class="msg.buyer_id === auth.user.id ? 'text-indigo-200' : 'text-gray-400'">{{ formatTime(msg.created_at) }}</p>
            </div>
          </div>
          <div v-if="chatLoading" class="text-center text-gray-400 text-sm">Loading messages...</div>
        </div>

        <!-- Input -->
        <div class="border-t border-gray-100 p-4">
          <div v-if="activeConv.product_context" class="text-xs text-gray-500 mb-2 px-1">
            Chatting about: <NuxtLink :to="`/products/${activeConv.product_context.productId}`" class="text-indigo-600 underline">{{ activeConv.product_context.productName }}</NuxtLink>
            <button @click="activeConv.product_context = null" class="ml-2 text-gray-400 hover:text-gray-600">x</button>
          </div>
          <form @submit.prevent="sendMessage" class="flex gap-3">
            <input
              v-model="newMessage"
              type="text"
              placeholder="Type a message..."
              class="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400"
            />
            <button type="submit" :disabled="!newMessage.trim() || sending" class="px-5 py-2.5 bg-indigo-600 text-white font-bold rounded-xl text-sm hover:bg-indigo-700 disabled:bg-gray-300 disabled:text-gray-500 transition-colors">
              Send
            </button>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { useAuthStore } from '~/stores/auth'
import { useNotificationStore } from '~/stores/notifications'

const auth = useAuthStore()
const notifications = useNotificationStore()
const config = useRuntimeConfig()
const route = useRoute()
const router = useRouter()
const apiBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

const conversations = ref([])
const activeConv = ref(null)
const messages = ref([])
const loading = ref(true)
const chatLoading = ref(false)
const newMessage = ref('')
const sending = ref(false)
const messagesContainer = ref(null)
let pollTimer = null

const authHeaders = () => {
  if (!auth.token) return {}
  return { Authorization: `Bearer ${auth.token}` }
}

const timeAgo = (date) => {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'now'
  if (mins < 60) return `${mins}m`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h`
  return `${Math.floor(hrs / 24)}d`
}

const formatTime = (date) => {
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
}

const fetchConversations = async () => {
  try {
    const data = await $fetch(`${apiBaseUrl}/chat/conversations`, { headers: authHeaders() })
    conversations.value = data
  } catch (err) {
    console.error('Failed to fetch conversations:', err)
  } finally {
    loading.value = false
  }
}

const openConversation = async (conv) => {
  activeConv.value = conv
  chatLoading.value = true
  const params = new URLSearchParams()
  if (auth.isVendor && conv.buyer_id) params.set('buyerId', conv.buyer_id)
  const qs = params.toString()
  try {
    const data = await $fetch(`${apiBaseUrl}/chat/${conv.shop_id}${qs ? '?' + qs : ''}`, { headers: authHeaders() })
    messages.value = data
    // Mark as read
    await $fetch(`${apiBaseUrl}/chat/${conv.shop_id}/read`, { method: 'PATCH', headers: authHeaders() }).catch(() => {})
    conv.unread_count = 0
  } catch (err) {
    console.error('Failed to fetch messages:', err)
  } finally {
    chatLoading.value = false
    nextTick(() => {
      if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  }
}

const sendMessage = async () => {
  if (!newMessage.value.trim() || !activeConv.value) return
  sending.value = true
  const msg = newMessage.value
  newMessage.value = ''
  const body = { message: msg, shopName: activeConv.value.shop_name }
  if (activeConv.value.product_context) {
    body.productId = activeConv.value.product_context.productId
    body.productName = activeConv.value.product_context.productName
  }
  try {
    const data = await $fetch(`${apiBaseUrl}/chat/${activeConv.value.shop_id}`, {
      method: 'POST',
      headers: authHeaders(),
      body,
    })
    messages.value.push(data)
    nextTick(() => {
      if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    })
  } catch (err) {
    notifications.error('Failed to send message')
    console.error('Failed to send message:', err)
  } finally {
    sending.value = false
  }
}

const deleteConversation = async (conv) => {
  if (!confirm('Delete this conversation?')) return
  if (activeConv.value && activeConv.value.shop_id === conv.shop_id && activeConv.value.buyer_id === conv.buyer_id) activeConv.value = null
  const params = new URLSearchParams()
  if (auth.isVendor && conv.buyer_id) params.set('buyerId', conv.buyer_id)
  const qs = params.toString()
  try {
    await $fetch(`${apiBaseUrl}/chat/${conv.shop_id}${qs ? '?' + qs : ''}`, { method: 'DELETE', headers: authHeaders() })
    conversations.value = conversations.value.filter(c => !(c.shop_id === conv.shop_id && c.buyer_id === conv.buyer_id))
    notifications.success('Conversation deleted')
  } catch (err) {
    notifications.error('Failed to delete')
  }
}

const startPolling = () => {
  pollTimer = setInterval(async () => {
    if (activeConv.value) {
      const params = new URLSearchParams()
      if (auth.isVendor && activeConv.value.buyer_id) params.set('buyerId', activeConv.value.buyer_id)
      const qs = params.toString()
      try {
        const data = await $fetch(`${apiBaseUrl}/chat/${activeConv.value.shop_id}${qs ? '?' + qs : ''}`, { headers: authHeaders() })
        if (data.length !== messages.value.length) {
          messages.value = data
          nextTick(() => {
            if (messagesContainer.value) messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
          })
        }
      } catch {}
      // Mark as read when viewing the conversation
      await $fetch(`${apiBaseUrl}/chat/${activeConv.value.shop_id}/read`, { method: 'PATCH', headers: authHeaders() }).catch(() => {})
    }
    fetchConversations()
  }, 5000)
}

onMounted(async () => {
  await fetchConversations()

  // If route has shop param, auto-open that conversation
  if (route.query.shop) {
    const conv = {
      shop_id: route.query.shop,
      shop_name: route.query.shopName || 'Shop',
      buyer_id: route.query.buyerId || null,
      product_context: route.query.product ? { productId: route.query.product, productName: route.query.productName || '' } : null,
    }
    // Add to conversations if not already there
    const existing = conversations.value.find(c => c.shop_id === conv.shop_id)
    if (existing) {
      existing.product_context = conv.product_context
      await openConversation(existing)
    } else {
      conversations.value.unshift(conv)
      await openConversation(conv)
    }
  }

  startPolling()
})

onUnmounted(() => {
  if (pollTimer) clearInterval(pollTimer)
})
</script>
