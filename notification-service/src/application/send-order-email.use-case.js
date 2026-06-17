const EmailTemplate = require('../domain/email-template');

class SendOrderEmailUseCase {
  constructor(catalogClient, mailProvider) {
    this.catalogClient = catalogClient;
    this.mailProvider = mailProvider;
  }

  async execute(orderData) {
    const { order_id, items } = orderData;
    const trackingNumber = `TRK-${Math.random().toString(36).substring(2, 11).toUpperCase()}`;

    // Enrich items
    const allProducts = await this.catalogClient.fetchProducts();
    const enrichedItems = items.map(item => {
      const product = allProducts.find(p => p.id === item.product_id);
      return {
        ...item,
        name: product ? product.name : 'Unknown Product'
      };
    });

    const html = EmailTemplate.formatOrderConfirmation(orderData, enrichedItems, trackingNumber);

    const info = await this.mailProvider.sendMail({
      to: "customer@example.com",
      subject: `Success! Order Confirmed #${order_id}`,
      html: html,
    });

    console.log(`[Notification Use Case] Email sent for Order ${order_id}: ${info.messageId}`);
  }
}

module.exports = SendOrderEmailUseCase;
