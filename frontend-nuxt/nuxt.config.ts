// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  modules: ['@pinia/nuxt', '@nuxtjs/tailwindcss'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiGatewayUrl: process.env.API_GATEWAY_URL || 'http://localhost:8080',
    },
    // Server-side only (Docker internal network)
    apiGatewayInternalUrl: process.env.API_GATEWAY_INTERNAL_URL || 'http://api-gateway:8080',
  }
})
