function addressBlock(addr) {
  if (!addr) return '';
  const { name, street, city, state, zip, country } = addr;
  return `
    <div style="margin-top: 16px;">
      <h3 style="font-size: 14px; color: #6b7280; text-transform: uppercase; letter-spacing: 1px; margin: 0 0 8px;">Shipping To</h3>
      <p style="margin: 2px 0; color: #374151;">${name}</p>
      <p style="margin: 2px 0; color: #374151;">${street}</p>
      <p style="margin: 2px 0; color: #374151;">${city}, ${state} ${zip}</p>
      <p style="margin: 2px 0; color: #374151;">${country}</p>
    </div>
  `;
}

function formatDate(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

function customerName(orderData) {
  return orderData.shipping_address?.name || 'Valued Customer';
}

class EmailTemplate {
  static formatPaymentConfirmation(paymentData, transactionId) {
    const name = paymentData.shipping_address?.name || 'Valued Customer';
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Payment Received! 💳</h1>
          <p style="margin: 4px 0 0; opacity: 0.9;">Hi ${name}, your payment was successful.</p>
          <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.75;">Order #${paymentData.order_id}</p>
        </div>
        <div style="padding: 24px;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; color: #166534; margin: 0;">Transaction ID</p>
            <p style="font-size: 18px; font-weight: bold; color: #14532d; margin: 4px 0; font-family: monospace;">${transactionId}</p>
          </div>
          ${addressBlock(paymentData.shipping_address)}
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 24px;">
            Your order is being processed and you'll receive a shipping confirmation soon.
          </p>
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
            Need help? <a href="mailto:support@example.com" style="color: #059669;">Contact us</a>
          </p>
        </div>
      </div>
    `;
  }

  static formatOrderConfirmation(orderData, enrichedItems, trackingNumber) {
    const itemsHtml = enrichedItems.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 12px;">
          <div style="font-weight: bold;">${item.name}</div>
          <div style="font-size: 11px; color: #6b7280; font-family: monospace;">ID: ${item.product_id}</div>
        </td>
        <td style="padding: 12px; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px; text-align: right;">$${Number(item.price).toFixed(2)}</td>
      </tr>
    `).join('');

    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Order Confirmed! 🎉</h1>
          <p style="margin: 4px 0 0; opacity: 0.9;">Hi ${customerName(orderData)}, your order is confirmed.</p>
          <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.75;">Order #${orderData.order_id}</p>
        </div>
        <div style="padding: 24px;">
          <p style="font-size: 13px; color: #6b7280; margin: 0 0 20px;">Order placed ${formatDate(orderData.ordered_at)}</p>

          <h2 style="font-size: 16px; margin: 0 0 12px; color: #111827;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">
                <th style="padding: 10px 12px;">Product</th>
                <th style="padding: 10px 12px; text-align: center;">Qty</th>
                <th style="padding: 10px 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin-top: 16px; text-align: right; padding-top: 16px; border-top: 2px solid #f3f4f6;">
            <p style="font-size: 22px; font-weight: bold; color: #4f46e5; margin: 0;">Total: $${Number(orderData.total).toFixed(2)}</p>
          </div>

          ${addressBlock(orderData.shipping_address)}

          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px;">
            <h3 style="margin: 0; color: #166534; font-size: 14px;">📦 Shipping Started</h3>
            <p style="margin: 4px 0 0; font-size: 13px; color: #14532d;">Your package is being tracked with <strong>${trackingNumber}</strong> via FedEx.</p>
          </div>

          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 24px;">
            Need help? <a href="mailto:support@example.com" style="color: #4f46e5;">Contact us</a>
          </p>
        </div>
      </div>
    `;
  }

  static formatOrderShipped(orderData, trackingNumber, carrier) {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #059669, #10b981); color: white; padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; font-size: 24px;">Your Order Has Shipped! 🚚</h1>
          <p style="margin: 4px 0 0; opacity: 0.9;">Hi ${customerName(orderData)}, your package is on its way.</p>
          <p style="margin: 8px 0 0; font-size: 13px; opacity: 0.75;">Order #${orderData.order_id}</p>
        </div>
        <div style="padding: 24px;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; color: #166534; margin: 0;">Carrier</p>
            <p style="font-size: 18px; font-weight: bold; color: #14532d; margin: 4px 0;">${carrier || 'FedEx'}</p>
            <hr style="border: 0; border-top: 1px solid #bbf7d0; margin: 16px 0;" />
            <p style="font-size: 14px; color: #166534; margin: 0;">Tracking Number</p>
            <p style="font-size: 24px; font-weight: black; color: #14532d; margin: 4px 0; letter-spacing: 2px; font-family: monospace;">${trackingNumber}</p>
          </div>
          ${addressBlock(orderData.shipping_address)}
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 24px;">
            You can track your package using the tracking number above.
          </p>
          <p style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 16px;">
            Need help? <a href="mailto:support@example.com" style="color: #059669;">Contact us</a>
          </p>
        </div>
      </div>
    `;
  }
}

module.exports = EmailTemplate;
