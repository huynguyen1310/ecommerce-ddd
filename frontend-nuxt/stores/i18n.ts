import { defineStore } from 'pinia'

export const useI18nStore = defineStore('i18n', () => {
  const locale = ref('en')
  const translations = ref({})
  const supportedLocales = ref([{ code: 'en', name: 'English', native: 'English', flag: '🇺🇸' }])
  const config = useRuntimeConfig()
  const apiBaseUrl = process.server ? config.apiGatewayInternalUrl : config.public.apiGatewayUrl

  async function fetchLocales() {
    try {
      const locales = await $fetch(`${apiBaseUrl}/api/locales`)
      supportedLocales.value = locales || supportedLocales.value
    } catch {}
  }

  async function loadTranslations(loc) {
    const l = loc || locale.value
    if (l === 'en') { translations.value = {}; return }
    try {
      const t = await $fetch(`${apiBaseUrl}/api/translations?locale=${l}`)
      translations.value = t || {}
    } catch { translations.value = {} }
  }

  const enFallback = {
    'nav.orders': 'Orders', 'nav.cart': 'Cart', 'nav.wishlist': 'Wishlist',
    'nav.login': 'Login', 'nav.logout': 'Logout', 'nav.search': 'Search products...',
    'nav.messages': 'Messages', 'nav.my_shop': 'My Shop', 'nav.admin': 'Admin',
    'nav.profile': 'Profile', 'nav.become_vendor': 'Become a Vendor',
    'nav.products': 'Back to catalog', 'home.trending': 'Trending Now',
    'home.new_arrivals': 'New Arrivals', 'home.recently_viewed': 'Recently Viewed',
    'home.view_all': 'View All', 'cart.title': 'Shopping Cart',
    'cart.empty': 'Your cart is empty', 'cart.checkout': 'Checkout',
    'cart.total': 'Total', 'cart.savings': 'You Save',
    'search.title': 'Search', 'search.filter': 'Filters',
    'search.sort': 'Sort by', 'search.in_stock': 'In Stock',
    'search.out_of_stock': 'Out of Stock', 'product.add_to_cart': 'Add to Cart',
    'product.out_of_stock': 'Out of Stock', 'product.related': 'Related Products',
    'product.reviews': 'Reviews', 'orders.title': 'My Orders',
    'orders.pending': 'Pending', 'orders.shipped': 'Shipped',
    'orders.delivered': 'Delivered', 'orders.cancelled': 'Cancelled',
    'auth.login_title': 'Log In', 'auth.register_title': 'Register',
    'auth.email': 'Email', 'auth.password': 'Password',
    'common.loading': 'Loading...', 'common.error': 'Error',
    'common.save': 'Save', 'common.cancel': 'Cancel', 'common.delete': 'Delete',
    'common.edit': 'Edit', 'common.create': 'Create', 'common.search': 'Search',
    'common.seconds': 's', 'common.minutes': 'm', 'common.hours': 'h',
    'common.days': 'd', 'common.and': 'and', 'common.left': 'left',
    'promo.flash_sale': 'Flash Sale', 'promo.timer': 'Ends in',
    'footer.copyright': '© 2026 E-Shop DDD Demo. All rights reserved.',
  }

  function $t(key) {
    return translations.value[key] || enFallback[key] || key
  }

  async function setLocale(loc) {
    locale.value = loc
    localStorage.setItem('locale', loc)
    await loadTranslations(loc)
  }

  async function init() {
    await fetchLocales()
    const saved = localStorage.getItem('locale') || 'en'
    await setLocale(saved)
  }

  function localeHeader() {
    return locale.value !== 'en' ? { 'Accept-Language': locale.value } : {}
  }

  return { locale, translations, supportedLocales, $t, setLocale, init, localeHeader, fetchLocales, loadTranslations }
})
