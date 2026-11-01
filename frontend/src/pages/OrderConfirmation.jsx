import React from "react";
import {
  FiCheck,
  FiArrowLeft,
  FiClipboard,
  FiClock,
  FiMapPin,
  FiCreditCard,
  FiPhone,
} from "react-icons/fi";
import "./OrderConfirmation.css";

function OrderConfirmation({ order, onClose, onViewOrders }) {
  if (!order) {
    return (
      <div className="confirmation-page">
        <div className="confirmation-empty">
          <div className="confirmation-empty-icon">
            <FiClipboard />
          </div>

          <h2>No order found</h2>
          <p>We couldn't find the order details.</p>

          <button
            type="button"
            className="confirmation-primary-btn"
            onClick={() => {
              if (onClose) {
                onClose();
              }
            }}
          >
            <FiArrowLeft />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  const items = Array.isArray(order.items) ? order.items : [];

  const totalAmount = Number(
    order.totalAmount ?? order.total ?? 0
  );

  const orderNumber =
    order.orderNumber ||
    (order.backendOrderId
      ? `SP${String(order.backendOrderId).padStart(6, "0")}`
      : "SP000000");

  const orderType =
    order.orderType === "DINE_IN"
      ? "Dine In"
      : order.orderType === "TAKEAWAY"
      ? "Takeaway"
      : order.orderType || "Dine In";

  const paymentMethod =
    order.paymentMethod || "Cash on Delivery";

  const paymentStatus =
    order.paymentStatus ||
    (paymentMethod.toLowerCase().includes("cash")
      ? "Pending"
      : "Pending");

  const status =
    order.status ||
    "PENDING";

  const formattedStatus =
    String(status)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const formattedPaymentStatus =
    String(paymentStatus)
      .toLowerCase()
      .replace(/_/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase());

  const createdAt = order.createdAt
    ? new Date(order.createdAt)
    : new Date();

  const formattedDate = Number.isNaN(createdAt.getTime())
    ? "Just now"
    : createdAt.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });

  const handleBackToMenu = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const handleViewOrders = () => {
    if (typeof onViewOrders === "function") {
      onViewOrders();
    }
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-orb confirmation-orb-one" />
      <div className="confirmation-orb confirmation-orb-two" />

      <main className="confirmation-container">
        {/* Top navigation */}
        <div className="confirmation-topbar">
          <button
            type="button"
            className="confirmation-back-btn"
            onClick={handleBackToMenu}
            aria-label="Back to menu"
          >
            <FiArrowLeft />
            <span>Back to menu</span>
          </button>

          <span className="confirmation-brand">
            Sai Parathas & More
          </span>
        </div>

        {/* Success hero */}
        <section className="confirmation-hero">
          <div className="confirmation-check-wrap">
            <div className="confirmation-check-circle">
              <FiCheck />
            </div>
          </div>

          <p className="confirmation-eyebrow">
            ORDER CONFIRMED
          </p>

          <h1>
            Your order
            <br />
            <span>is on its way.</span>
          </h1>

          <p className="confirmation-subtitle">
            Thanks for ordering from Sai Parathas & More.
            <br />
            We’ve received your order successfully.
          </p>

          <div className="confirmation-order-number">
            <span>Order</span>
            <strong>#{orderNumber}</strong>
          </div>
        </section>

        {/* Main card */}
        <section className="confirmation-card">
          {/* Order status */}
          <div className="confirmation-status-row">
            <div>
              <span className="confirmation-small-label">
                Current status
              </span>

              <div className="confirmation-status">
                <span className="confirmation-status-dot" />
                {formattedStatus}
              </div>
            </div>

            <div className="confirmation-time">
              <FiClock />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="confirmation-divider" />

          {/* Order information */}
          <div className="confirmation-info-grid">
            <div className="confirmation-info-item">
              <div className="confirmation-info-icon">
                <FiMapPin />
              </div>

              <div>
                <span>Order type</span>
                <strong>{orderType}</strong>
              </div>
            </div>

            <div className="confirmation-info-item">
              <div className="confirmation-info-icon">
                <FiCreditCard />
              </div>

              <div>
                <span>Payment</span>
                <strong>{paymentMethod}</strong>
              </div>
            </div>

            {order.tableNumber && (
              <div className="confirmation-info-item">
                <div className="confirmation-info-icon table-icon">
                  <span>{order.tableNumber}</span>
                </div>

                <div>
                  <span>Table</span>
                  <strong>{order.tableNumber}</strong>
                </div>
              </div>
            )}

            {order.customerPhone && (
              <div className="confirmation-info-item">
                <div className="confirmation-info-icon">
                  <FiPhone />
                </div>

                <div>
                  <span>Contact</span>
                  <strong>{order.customerPhone}</strong>
                </div>
              </div>
            )}
          </div>

          <div className="confirmation-divider" />

          {/* Payment status */}
          <div className="confirmation-payment-row">
            <div>
              <span className="confirmation-small-label">
                Payment status
              </span>

              <strong className="confirmation-payment-status">
                {formattedPaymentStatus}
              </strong>
            </div>

            <span
              className={`confirmation-payment-pill ${
                String(paymentStatus).toLowerCase() === "paid"
                  ? "is-paid"
                  : "is-pending"
              }`}
            >
              {String(paymentStatus).toLowerCase() === "paid"
                ? "Paid"
                : "Pending"}
            </span>
          </div>

          <div className="confirmation-divider" />

          {/* Items */}
          <div className="confirmation-items-section">
            <div className="confirmation-section-heading">
              <div>
                <span className="confirmation-small-label">
                  Your order
                </span>
                <h2>Your items</h2>
              </div>

              <span className="confirmation-item-count">
                {items.length} {items.length === 1 ? "item" : "items"}
              </span>
            </div>

            {items.length > 0 ? (
              <div className="confirmation-items">
                {items.map((item, index) => {
                  const quantity = Number(
                    item.quantity ?? 1
                  );

                  const price = Number(
                    item.price ??
                      item.unitPrice ??
                      item.menuItem?.price ??
                      0
                  );

                  const itemTotal =
                    price * quantity;

                  const itemName =
                    item.name ||
                    item.menuItemName ||
                    item.menuItem?.name ||
                    "Menu item";

                  return (
                    <div
                      className="confirmation-item"
                      key={
                        item.id ||
                        item.menuItemId ||
                        `${itemName}-${index}`
                      }
                    >
                      <div className="confirmation-item-number">
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="confirmation-item-main">
                        <strong>{itemName}</strong>

                        <span>
                          {quantity} × ₹{price.toFixed(0)}
                        </span>
                      </div>

                      <strong className="confirmation-item-total">
                        ₹{itemTotal.toFixed(0)}
                      </strong>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="confirmation-no-items">
                <p>No item details available.</p>
              </div>
            )}
          </div>

          {/* Total */}
          <div className="confirmation-total-box">
            <div>
              <span>Total amount</span>
              <small>Including all selected items</small>
            </div>

            <strong>
              ₹{totalAmount.toFixed(0)}
            </strong>
          </div>

          {/* Instructions */}
          {order.instructions && (
            <div className="confirmation-instructions">
              <span className="confirmation-small-label">
                Special instructions
              </span>

              <p>{order.instructions}</p>
            </div>
          )}
        </section>

        {/* Bottom actions */}
        <section className="confirmation-actions">
          <button
            type="button"
            className="confirmation-primary-btn"
            onClick={handleBackToMenu}
          >
            <FiArrowLeft />
            Back to Menu
          </button>

          <button
            type="button"
            className="confirmation-secondary-btn"
            onClick={handleViewOrders}
          >
            <FiClipboard />
            View My Orders
          </button>
        </section>

        <p className="confirmation-footer-text">
          Made with love at Sai Parathas & More
        </p>
      </main>
    </div>
  );
}

export default OrderConfirmation;