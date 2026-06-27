<template>
  <span v-if="endAt" class="text-xs font-bold" :class="isUrgent ? 'text-rose-500' : 'text-gray-500'" :title="`Ends ${new Date(endAt).toLocaleString()}`">
    {{ display }}
  </span>
</template>

<script setup>
const props = defineProps({ endAt: { type: String, required: true } })

const now = ref(Date.now())
let timer

const diff = computed(() => Math.max(0, new Date(props.endAt).getTime() - now.value))
const isUrgent = computed(() => diff.value < 3600000) // < 1h
const isDays = computed(() => diff.value >= 86400000)

const display = computed(() => {
  const d = diff.value
  if (d <= 0) return 'Ended'
  const days = Math.floor(d / 86400000)
  const hrs = Math.floor((d % 86400000) / 3600000)
  const mins = Math.floor((d % 3600000) / 60000)
  const secs = Math.floor((d % 60000) / 1000)
  if (isDays.value) return `${days}d ${hrs}h left`
  if (hrs > 0) return `${hrs}h ${mins}m ${secs}s`
  return `${mins}m ${secs}s`
})

onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))
</script>
