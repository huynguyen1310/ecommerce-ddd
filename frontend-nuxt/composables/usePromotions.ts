export const usePromotions = () => {
  const promotions = ref<any[]>([])
  const loaded = ref(false)
  const config = useRuntimeConfig()
  const base = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

  async function fetchAllActive() {
    try {
      promotions.value = await $fetch(`${base}/api/promotions?active=true`)
    } catch { promotions.value = [] }
    loaded.value = true
  }

  function getBestPromotion(productId: string, shopId?: string) {
    if (!loaded.value) return null
    const now = new Date()
    for (const p of promotions.value) {
      if (!p.is_active || new Date(p.end_at) < now || new Date(p.start_at) > now) continue
      if (shopId && p.shop_id !== shopId) continue
      if (p.conditions?.product_ids && p.conditions.product_ids.includes(productId)) return p
    }
    return null
  }

  function getShopPromotions(shopId: string) {
    if (!loaded.value) return []
    const now = new Date()
    return promotions.value.filter(p =>
      p.shop_id === shopId && p.is_active &&
      new Date(p.start_at) <= now && new Date(p.end_at) >= now
    )
  }

  return { promotions, loaded, fetchAllActive, getBestPromotion, getShopPromotions }
}
