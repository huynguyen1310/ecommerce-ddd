/**
 * @interface ICatalogClient
 *
 * Contract for fetching product data from Catalog service.
 * Implementations: CatalogClient
 */

class ICatalogClient {
  /** @returns {Promise<Array<object>>} */
  async fetchProducts() { throw new Error('Not implemented'); }
}

module.exports = { ICatalogClient };
