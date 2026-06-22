class EmailTemplate {
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
        <div style="background-color: #4f46e5; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0;">Order Confirmed!</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Order #${orderData.order_id}</p>
        </div>
        <div style="padding: 24px;">
          <h2 style="font-size: 18px; margin-bottom: 16px;">Order Summary</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <thead>
              <tr style="background-color: #f9fafb; text-align: left; font-size: 12px; text-transform: uppercase; color: #6b7280;">
                <th style="padding: 12px;">Product</th>
                <th style="padding: 12px; text-align: center;">Qty</th>
                <th style="padding: 12px; text-align: right;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          <div style="margin-top: 24px; text-align: right;">
            <p style="font-size: 20px; font-weight: bold; color: #4f46e5;">Total: $${Number(orderData.total).toFixed(2)}</p>
          </div>
          <hr style="border: 0; border-top: 1px solid #eee; margin: 24px 0;" />
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 16px; border-radius: 8px;">
            <h3 style="margin: 0; color: #166534; font-size: 14px;">📦 Shipping Started</h3>
            <p style="margin: 4px 0 0; font-size: 13px; color: #14532d;">Your package is being tracked with <strong>${trackingNumber}</strong> via FedEx.</p>
          </div>
        </div>
      </div>
    `;
  }
}

  static formatOrderShipped(orderData, trackingNumber, carrier) {
    return `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden;">
        <div style="background-color: #059669; color: white; padding: 24px; text-align: center;">
          <h1 style="margin: 0;">Your Order Has Shipped! 🚚</h1>
          <p style="margin: 8px 0 0; opacity: 0.9;">Order #${orderData.order_id}</p>
        </div>
        <div style="padding: 24px;">
          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; text-align: center;">
            <p style="font-size: 14px; color: #166534; margin: 0;">Carrier</p>
            <p style="font-size: 18px; font-weight: bold; color: #14532d; margin: 4px 0;">${carrier || 'FedEx'}</p>
            <hr style="border: 0; border-top: 1px solid #bbf7d0; margin: 16px 0;" />
            <p style="font-size: 14px; color: #166534; margin: 0;">Tracking Number</p>
            <p style="font-size: 24px; font-weight: black; color: #14532d; margin: 4px 0; letter-spacing: 2px; font-family: monospace;">${trackingNumber}</p>
          </div>
          <p style="color: #6b7280; font-size: 13px; text-align: center; margin-top: 24px;">
            You can track your package using the tracking number above.
          </p>
        </div>
      </div>
    `;
  }
}

module.exports = EmailTemplate;
