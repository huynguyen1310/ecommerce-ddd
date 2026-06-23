const EmailTemplate = require('../domain/email-template');

class SendPaymentEmailUseCase {
  constructor(mailProvider) {
    this.mailProvider = mailProvider;
  }

  async execute(paymentData) {
    const { order_id, transaction_id, customer_email, shipping_address } = paymentData;
    if (!customer_email) {
      console.log(`[Notification] No customer email for payment ${order_id}, skipping.`);
      return;
    }
    const html = EmailTemplate.formatPaymentConfirmation(paymentData, transaction_id);

    const info = await this.mailProvider.sendMail({
      to: customer_email,
      subject: `Payment Confirmed for Order #${order_id}`,
      html: html,
    });

    console.log(`[Notification] Payment confirmation sent for Order ${order_id} to ${customer_email}: ${info.messageId}`);
  }
}

module.exports = SendPaymentEmailUseCase;
