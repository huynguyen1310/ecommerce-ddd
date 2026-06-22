const EmailTemplate = require('../domain/email-template');

class SendShippedEmailUseCase {
  constructor(mailProvider) {
    this.mailProvider = mailProvider;
  }

  async execute(orderData) {
    const { order_id, tracking_number, carrier } = orderData;

    const html = EmailTemplate.formatOrderShipped(orderData, tracking_number, carrier);

    const info = await this.mailProvider.sendMail({
      to: "customer@example.com",
      subject: `Your Order #${order_id} Has Been Shipped!`,
      html: html,
    });

    console.log(`[Notification] Shipped email sent for Order ${order_id}: ${info.messageId}`);
  }
}

module.exports = SendShippedEmailUseCase;
