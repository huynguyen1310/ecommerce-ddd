// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiIdentityUrl: process.env.API_IDENTITY_URL || 'http://localhost:3002',
      apiCatalogUrl: process.env.API_CATALOG_URL || 'http://localhost:8000',
      apiOrderUrl: process.env.API_ORDER_URL || 'http://localhost:3001',
      apiPaymentUrl: process.env.API_PAYMENT_URL || 'http://localhost:3003',
      apiReviewUrl: process.env.API_REVIEW_URL || 'http://localhost:4000',
    },
    // Server-side only variables
    apiCatalogInternalUrl: process.env.API_CATALOG_INTERNAL_URL || 'http://catalog-service:9000',
    apiOrderInternalUrl: process.env.API_ORDER_INTERNAL_URL || 'http://order-service:3000',
    apiIdentityInternalUrl: process.env.API_IDENTITY_INTERNAL_URL || 'http://identity-service:3002',
    apiReviewInternalUrl: process.env.API_REVIEW_INTERNAL_URL || 'http://review-service:4000',
  }
})
