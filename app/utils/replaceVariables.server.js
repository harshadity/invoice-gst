export function replaceVariables(text, data) {
  if (!text) return "";

  return text
    .replace(/{{customer_name}}/g, data.customerName || "")
    .replace(/{{order_name}}/g, data.orderName || "")
    .replace(/{{order_total}}/g, data.orderTotal || "")
    .replace(/{{shop_name}}/g, data.shopName || "")
    .replace(/{{tracking_url}}/g, data.trackingUrl || "")
    .replace(/{{feedback_url}}/g, data.feedbackUrl || "");
}
