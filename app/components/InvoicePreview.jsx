import React from "react";
import "./invoice.css";

export default function InvoicePreview({ template = "celestial", order }) {
  // Safe fallbacks so preview never breaks
  const invoiceNumber = order?.name || "INV-0001";
  const invoiceDate = order?.createdAt
    ? new Date(order.createdAt).toDateString()
    : new Date().toDateString();

  const customer = order?.customer || {};
  const lineItems = order?.lineItems?.edges || [];

  const subtotal =
    order?.subtotalPriceSet?.shopMoney?.amount || "0.00";
  const tax =
    order?.totalTaxSet?.shopMoney?.amount || "0.00";
  const total =
    order?.totalPriceSet?.shopMoney?.amount || "0.00";

  return (
    <div className={`invoice-root ${template}`}>
      {/* HEADER */}
      <header className="invoice-header">
        <h2>TAX INVOICE</h2>
        <div>Original</div>
      </header>

      {/* META */}
      <section className="invoice-meta">
        <div>
          <strong>Invoice No:</strong> {invoiceNumber} <br />
          <strong>Date:</strong> {invoiceDate}
        </div>
        <div>
          <strong>GSTIN:</strong> 22AAAAA0000A1Z5
        </div>
      </section>

      {/* ADDRESSES */}
      <section className="invoice-address">
        <div>
          <strong>Billed To</strong>
          <p>
            {customer.firstName || "Customer"}{" "}
            {customer.lastName || ""}
          </p>
          <p>{customer.email || "customer@email.com"}</p>
        </div>

        <div>
          <strong>Ship To</strong>
          <p>
            {customer.firstName || "Customer"}{" "}
            {customer.lastName || ""}
          </p>
          <p>India</p>
        </div>
      </section>

      {/* ITEMS TABLE */}
      <table className="invoice-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Rate</th>
            <th>GST</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {lineItems.length === 0 ? (
            <tr>
              <td colSpan="5" style={{ textAlign: "center" }}>
                No items available
              </td>
            </tr>
          ) : (
            lineItems.map(({ node }, index) => {
              const rate =
                node.originalUnitPriceSet?.shopMoney?.amount || "0.00";
              const qty = node.quantity || 1;
              const gstRate = 18; // sample GST %
              const totalAmount =
                (parseFloat(rate) * qty * 1.18).toFixed(2);

              return (
                <tr key={index}>
                  <td>{node.title}</td>
                  <td>{qty}</td>
                  <td>₹{rate}</td>
                  <td>{gstRate}%</td>
                  <td>₹{totalAmount}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* TOTALS */}
      <footer className="invoice-footer">
        <div>Subtotal: ₹{subtotal}</div>
        <div>Tax: ₹{tax}</div>
        <strong>Total: ₹{total}</strong>
      </footer>
    </div>
  );
}
