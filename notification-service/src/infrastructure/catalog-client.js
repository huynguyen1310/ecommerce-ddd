/** @implements {import('../domain/ports/ICatalogClient').ICatalogClient} */
class CatalogClient {
  constructor(baseUrl) {
    this.baseUrl = baseUrl;
  }

  async fetchProducts() {
    try {
      const response = await fetch(this.baseUrl);
      if (!response.ok) return [];
      return await response.json();
    } catch (error) {
      console.error('[Catalog Client] Failed to fetch products:', error.message);
      return [];
    }
  }
}

module.exports = CatalogClient;
