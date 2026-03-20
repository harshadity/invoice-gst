import React from "react";
import "./packagingSlip.css";

export default function PackagingSlipPreview({
  template = "standard-slip",
  order,
}) {
  const customer = order?.customer || {};
  const items = order?.lineItems?.edges || [];

  return (
    <div className={`packing-slip-root ${template}`}>
      {/* HEADER */}
      <header className="packing-slip-header">
        <h2>PACKING SLIP</h2>
      </header>

      {/* ORDER INFO */}
      <section className="packing-slip-meta">
        <div>
          <strong>Order:</strong> {order?.name || "#1001"}
        </div>
        <div>
          <strong>Date:</strong>{" "}
          {order?.createdAt
            ? new Date(order.createdAt).toDateString()
            : new Date().toDateString()}
        </div>
      </section>

      {/* SHIPPING */}
      <section className="packing-slip-address">
        <strong>Ship To</strong>
        <p>
          {customer.firstName || "Customer"}{" "}
          {customer.lastName || ""}
        </p>
        <p>{customer.email || "customer@email.com"}</p>
        <p>India</p>
      </section>

      {/* ITEMS */}
      <table className="packing-slip-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="2" style={{ textAlign: "center" }}>
                No items
              </td>
            </tr>
          ) : (
            items.map(({ node }, index) => (
              <tr key={index}>
                <td>{node.title}</td>
                <td>{node.quantity}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* FOOTER */}
      <footer className="packing-slip-footer">
        <p>This is a system generated packing slip.</p>
      </footer>
    </div>
  );
}
