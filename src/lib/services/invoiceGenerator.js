// lib/services/invoiceGenerator.js

export function generateInvoiceHTML(order, seller) {
  const formatPrice = (price) => `₹${price.toLocaleString("en-IN")}`;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice #${order.orderNumber}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; padding: 40px; background: #f5f5f5; }
    .invoice { max-width: 800px; margin: 0 auto; background: white; padding: 40px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
    .header { border-bottom: 3px solid #2563eb; padding-bottom: 20px; margin-bottom: 30px; }
    .header h1 { color: #2563eb; font-size: 32px; margin-bottom: 10px; }
    .header .invoice-number { color: #666; font-size: 14px; }
    .company-info { margin-bottom: 30px; }
    .company-info h2 { color: #333; font-size: 18px; margin-bottom: 10px; }
    .company-info p { color: #666; line-height: 1.6; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px; }
    .info-box h3 { color: #333; font-size: 14px; margin-bottom: 10px; font-weight: bold; }
    .info-box p { color: #666; font-size: 13px; line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 30px 0; }
    thead { background: #f8f9fa; }
    th { text-align: left; padding: 12px; font-size: 12px; color: #666; border-bottom: 2px solid #e5e7eb; }
    td { padding: 12px; font-size: 13px; color: #333; border-bottom: 1px solid #e5e7eb; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .totals { margin-top: 20px; }
    .totals table { width: 300px; margin-left: auto; }
    .totals td { border: none; padding: 8px; }
    .totals .total-row { font-weight: bold; font-size: 16px; background: #f8f9fa; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #999; font-size: 12px; }
    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: bold; text-transform: uppercase; }
    .status-delivered { background: #d1fae5; color: #065f46; }
    .status-pending { background: #fef3c7; color: #92400e; }
    .status-processing { background: #dbeafe; color: #1e40af; }
    .status-shipped { background: #e0e7ff; color: #3730a3; }
  </style>
</head>
<body>
  <div class="invoice">
    <div class="header">
      <h1>INVOICE</h1>
      <p class="invoice-number">#${order.orderNumber}</p>
      <p class="invoice-number">Date: ${formatDate(order.createdAt)}</p>
    </div>

    <div class="company-info">
      <h2>${seller?.businessInfo?.businessName || seller?.storeInfo?.storeName || "Seller"}</h2>
      <p>${seller?.pickupAddress?.addressLine1 || seller?.storeInfo?.address || ""}</p>
      <p>${seller?.pickupAddress?.city || seller?.storeInfo?.city || ""}, ${seller?.pickupAddress?.state || seller?.storeInfo?.state || ""} ${
        seller?.pickupAddress?.pincode || seller?.storeInfo?.pincode || ""
      }</p>
      <p>GSTIN: ${seller?.businessInfo?.gstin || "N/A"}</p>
    </div>

    <div class="info-grid">
      <div class="info-box">
        <h3>BILL TO:</h3>
        <p><strong>${order.customer?.name || "Customer"}</strong></p>
        <p>${order.customer?.email || ""}</p>
        <p>${order.customer?.phone || ""}</p>
      </div>
      
      <div class="info-box">
        <h3>SHIP TO:</h3>
        <p><strong>${order.shippingAddress?.name || ""}</strong></p>
        <p>${order.shippingAddress?.addressLine1 || ""}</p>
        ${
          order.shippingAddress?.addressLine2
            ? `<p>${order.shippingAddress.addressLine2}</p>`
            : ""
        }
        <p>${order.shippingAddress?.city || ""}, ${
          order.shippingAddress?.state || ""
        } ${order.shippingAddress?.pincode || ""}</p>
        <p>${order.shippingAddress?.phone || ""}</p>
      </div>
    </div>

    <div style="margin-bottom: 20px;">
      <strong>Order Status:</strong> 
      <span class="status-badge status-${
        order.status
      }">${order.status?.toUpperCase()}</span>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 50%">ITEM DESCRIPTION</th>
          <th class="text-center" style="width: 10%">QTY</th>
          <th class="text-right" style="width: 20%">PRICE</th>
          <th class="text-right" style="width: 20%">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${order.items
          .map(
            (item) => `
          <tr>
            <td>
              <strong>${item.name || "Product"}</strong><br>
              ${
                item.sku
                  ? `<small style="color: #999;">SKU: ${item.sku}</small>`
                  : ""
              }
            </td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-right">${formatPrice(item.price)}</td>
            <td class="text-right">${formatPrice(
              item.price * item.quantity,
            )}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>

    <div class="totals">
      <table>
        <tr>
          <td>Subtotal:</td>
          <td class="text-right">${formatPrice(
            order.pricing?.subtotal || 0,
          )}</td>
        </tr>
        <tr>
          <td>Shipping:</td>
          <td class="text-right">${formatPrice(
            order.pricing?.shipping || 0,
          )}</td>
        </tr>
        <tr>
          <td>Tax (GST):</td>
          <td class="text-right">${formatPrice(order.pricing?.tax || 0)}</td>
        </tr>
        ${
          order.pricing?.discount > 0
            ? `
        <tr>
          <td>Discount:</td>
          <td class="text-right" style="color: #059669;">-${formatPrice(
            order.pricing.discount,
          )}</td>
        </tr>
        `
            : ""
        }
        <tr class="total-row">
          <td>TOTAL:</td>
          <td class="text-right">${formatPrice(order.pricing?.total || 0)}</td>
        </tr>
      </table>
    </div>

    <div class="footer">
      <p>Thank you for your business!</p>
      <p>This is a computer-generated invoice and does not require a signature.</p>
      ${
        seller?.storeInfo?.website
          ? `<p>Visit us at ${seller.storeInfo.website}</p>`
          : ""
      }
    </div>
  </div>
</body>
</html>
  `;
}
