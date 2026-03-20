import React from "react";
import "./creditNote.css";

export default function CreditNotePreview({
  template = "standard-credit",
  order,
}) {
  const customer = order?.customer || {};
  const items = order?.lineItems?.edges || [];

  const total =
    order?.totalPriceSet?.shopMoney?.amount || "0.00";

  return (
    <div className={`credit-note-root ${template}`}>
      {/* HEADER */}
      <header className="credit-note-header">
        <h2>CREDIT NOTE</h2>
      </header>

      {/* META */}
      <section className="credit-note-meta">
        <div>
          <strong>Credit Note:</strong> CN-{order?.name || "0001"}
        </div>
        <div>
          <strong>Date:</strong>{" "}
          {new Date().toDateString()}
        </div>
      </section>

      {/* CUSTOMER */}
      <section className="credit-note-address">
        <strong>Customer</strong>
        <p>
          {customer.firstName || "Customer"}{" "}
          {customer.lastName || ""}
        </p>
        <p>{customer.email || "customer@email.com"}</p>
      </section>

      {/* ADJUSTMENTS */}
      <table className="credit-note-table">
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Refund</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>
                No adjustments
              </td>
            </tr>
          ) : (
            items.map(({ node }, index) => {
              const rate =
                node.originalUnitPriceSet?.shopMoney?.amount ||
                "0.00";
              const refund = (
                parseFloat(rate) * node.quantity
              ).toFixed(2);

              return (
                <tr key={index}>
                  <td>{node.title}</td>
                  <td>{node.quantity}</td>
                  <td>₹{refund}</td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* TOTAL */}
      <footer className="credit-note-footer">
        <strong>Total Credit: ₹{total}</strong>
      </footer>
    </div>
  );
}
