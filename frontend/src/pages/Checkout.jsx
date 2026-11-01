
import { useMemo, useState } from "react";
import {
  FaArrowLeft,
  FaCheckCircle,
  FaCreditCard,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaPhone,
  FaShoppingBag,
  FaUser,
  FaUtensils,
} from "react-icons/fa";

import "./Checkout.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function Checkout({
  cart = [],
  total = 0,
  restaurantId = 1,
  onBack,
  onOrderPlaced,
}) {
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    orderType: "Dine In",
    tableNumber: "",
    instructions: "",
    paymentMethod: "Cash on Delivery",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const cartTotal = useMemo(() => {
    if (typeof total === "number" && total > 0) {
      return total;
    }

    return cart.reduce(
      (sum, item) =>
        sum + Number(item.price || 0) * Number(item.quantity || 0),
      0
    );
  }, [cart, total]);

  const itemCount = useMemo(
    () =>
      cart.reduce(
        (count, item) => count + Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    if (error) {
      setError("");
    }
  };

  const handleOrderTypeChange = (value) => {
    setForm((previous) => ({
      ...previous,
      orderType: value,
      tableNumber: value === "Dine In" ? previous.tableNumber : "",
    }));

    setError("");
  };

  const handlePaymentMethodChange = (value) => {
    setForm((previous) => ({
      ...previous,
      paymentMethod: value,
    }));

    setError("");
  };

  const validateForm = () => {
    const name = form.name.trim();
    const mobile = form.mobile.trim();
    const tableNumber = form.tableNumber.trim();

    if (cart.length === 0) {
      return "Your cart is empty.";
    }

    if (!name) {
      return "Please enter your name.";
    }

    if (!/^[6-9]\d{9}$/.test(mobile)) {
      return "Please enter a valid 10-digit mobile number.";
    }

    if (form.orderType === "Dine In" && !tableNumber) {
      return "Please enter your table number.";
    }

    if (!form.paymentMethod) {
      return "Please select a payment method.";
    }

    return "";
  };

  const placeOrder = async () => {
    const validationError = validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const backendItems = cart.map((item) => ({
        menuItemId: item.id,
        quantity: Number(item.quantity),
      }));

      const requestBody = {
        customerName: form.name.trim(),
        customerPhone: form.mobile.trim(),
        paymentMethod: form.paymentMethod,
        orderType: form.orderType,
        tableNumber:
          form.orderType === "Dine In"
            ? form.tableNumber.trim()
            : "",
        instructions: form.instructions.trim(),
        items: backendItems,
      };

      const response = await fetch(
        `${API}/api/orders/restaurant/${restaurantId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(requestBody),
        }
      );

      if (!response.ok) {
        let message = "Unable to place the order.";

        try {
          const data = await response.json();

          if (data?.message) {
            message = data.message;
          }
        } catch {
          // Ignore invalid JSON response.
        }

        throw new Error(message);
      }

      const backendOrder = await response.json();

      const localOrder = {
        ...form,
        name: form.name.trim(),
        mobile: form.mobile.trim(),
        tableNumber:
          form.orderType === "Dine In"
            ? form.tableNumber.trim()
            : "",
        instructions: form.instructions.trim(),

        items: cart.map((item) => ({
          ...item,
          quantity: Number(item.quantity),
        })),

        total: Number(
          backendOrder.totalAmount ?? cartTotal
        ),

        orderNumber: `SP${String(
          backendOrder.id || Date.now()
        ).padStart(6, "0")}`,

        backendOrderId: backendOrder.id,

        status: backendOrder.status || "PENDING",

        paymentStatus:
          form.paymentMethod === "Cash on Delivery"
            ? "Pending"
            : "Payment Pending",

        createdAt:
          backendOrder.createdAt || new Date().toISOString(),

        restaurantId,
      };

      const existingOrders = JSON.parse(
        localStorage.getItem("saiParathasOrders") || "[]"
      );

      localStorage.setItem(
        "saiParathasOrders",
        JSON.stringify([localOrder, ...existingOrders])
      );

      /*
       * IMPORTANT:
       * Menu.jsx receives this order through onOrderPlaced.
       *
       * COD:
       * Menu will directly show Order Confirmation.
       *
       * UPI/Card:
       * Menu will send this order to Payment.jsx.
       */
      if (typeof onOrderPlaced === "function") {
        onOrderPlaced(localOrder);
      }
    } catch (err) {
      console.error("Checkout error:", err);

      setError(
        err?.message ||
          "Something went wrong while placing your order. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-empty">
          <div className="checkout-empty-icon">
            <FaShoppingBag />
          </div>

          <h2>Your cart is empty</h2>

          <p>
            Add something delicious from the menu before
            continuing to checkout.
          </p>

          <button
            type="button"
            className="checkout-back-button"
            onClick={onBack}
          >
            <FaArrowLeft />
            Back to Menu
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="checkout-background-shape checkout-shape-one" />
      <div className="checkout-background-shape checkout-shape-two" />

      <header className="checkout-header">
        <button
          type="button"
          className="checkout-back"
          onClick={onBack}
          disabled={loading}
          aria-label="Back to menu"
        >
          <FaArrowLeft />
        </button>

        <div className="checkout-header-title">
          <span>SAI PARATHAS & MORE</span>
          <h1>Checkout</h1>
        </div>

        <div className="checkout-header-bag">
          <FaShoppingBag />
          <span>{itemCount}</span>
        </div>
      </header>

      <main className="checkout-container">
        <section className="checkout-intro">
          <div>
            <span className="checkout-eyebrow">
              Almost there
            </span>

            <h2>
              Let&apos;s get your
              <br />
              order ready.
            </h2>

            <p>
              Enter your details and choose how you&apos;d
              like to enjoy your meal.
            </p>
          </div>

          <div className="checkout-intro-icon">
            <FaUtensils />
          </div>
        </section>

        <div className="checkout-layout">
          <div className="checkout-form-column">
            {/* CUSTOMER DETAILS */}
            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <FaUser />
                </div>

                <div>
                  <span>01</span>
                  <h3>Your details</h3>
                </div>
              </div>

              <div className="checkout-fields">
                <div className="checkout-field">
                  <label htmlFor="checkout-name">
                    Full name
                  </label>

                  <div className="checkout-input-wrapper">
                    <FaUser />

                    <input
                      id="checkout-name"
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="Enter your name"
                      maxLength={80}
                      autoComplete="name"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="checkout-field">
                  <label htmlFor="checkout-mobile">
                    Mobile number
                  </label>

                  <div className="checkout-input-wrapper">
                    <FaPhone />

                    <input
                      id="checkout-mobile"
                      type="tel"
                      name="mobile"
                      value={form.mobile}
                      onChange={handleChange}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      inputMode="numeric"
                      autoComplete="tel"
                      disabled={loading}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* ORDER TYPE */}
            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <FaMapMarkerAlt />
                </div>

                <div>
                  <span>02</span>
                  <h3>How are you dining?</h3>
                </div>
              </div>

              <div className="checkout-order-types">
                <button
                  type="button"
                  className={`checkout-option ${
                    form.orderType === "Dine In"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleOrderTypeChange("Dine In")
                  }
                  disabled={loading}
                >
                  <div className="checkout-option-icon">
                    <FaUtensils />
                  </div>

                  <div>
                    <strong>Dine In</strong>
                    <span>Enjoy it at the restaurant</span>
                  </div>

                  {form.orderType === "Dine In" && (
                    <FaCheckCircle className="checkout-check" />
                  )}
                </button>

                <button
                  type="button"
                  className={`checkout-option ${
                    form.orderType === "Takeaway"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handleOrderTypeChange("Takeaway")
                  }
                  disabled={loading}
                >
                  <div className="checkout-option-icon">
                    <FaShoppingBag />
                  </div>

                  <div>
                    <strong>Takeaway</strong>
                    <span>Pack it up and take it with you</span>
                  </div>

                  {form.orderType === "Takeaway" && (
                    <FaCheckCircle className="checkout-check" />
                  )}
                </button>
              </div>

              {form.orderType === "Dine In" && (
                <div className="checkout-field checkout-table-field">
                  <label htmlFor="checkout-table">
                    Table number
                  </label>

                  <div className="checkout-input-wrapper">
                    <FaMapMarkerAlt />

                    <input
                      id="checkout-table"
                      type="text"
                      name="tableNumber"
                      value={form.tableNumber}
                      onChange={handleChange}
                      placeholder="e.g. 12"
                      maxLength={20}
                      disabled={loading}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* INSTRUCTIONS */}
            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <FaUtensils />
                </div>

                <div>
                  <span>03</span>
                  <h3>Special instructions</h3>
                </div>
              </div>

              <div className="checkout-field">
                <label htmlFor="checkout-instructions">
                  Anything we should know?
                </label>

                <textarea
                  id="checkout-instructions"
                  name="instructions"
                  value={form.instructions}
                  onChange={handleChange}
                  placeholder="Less spicy, extra chutney, no onions..."
                  maxLength={1000}
                  rows={4}
                  disabled={loading}
                />

                <div className="checkout-character-count">
                  {form.instructions.length}/1000
                </div>
              </div>
            </section>

            {/* PAYMENT */}
            <section className="checkout-card">
              <div className="checkout-section-heading">
                <div className="checkout-section-icon">
                  <FaCreditCard />
                </div>

                <div>
                  <span>04</span>
                  <h3>Payment method</h3>
                </div>
              </div>

              <div className="checkout-payment-options">
                <button
                  type="button"
                  className={`checkout-payment-option ${
                    form.paymentMethod ===
                    "Cash on Delivery"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePaymentMethodChange(
                      "Cash on Delivery"
                    )
                  }
                  disabled={loading}
                >
                  <div className="payment-option-icon cash">
                    <FaMoneyBillWave />
                  </div>

                  <div className="payment-option-content">
                    <strong>Cash on Delivery</strong>
                    <span>
                      Pay when your order is delivered
                    </span>
                  </div>

                  <div className="payment-radio">
                    {form.paymentMethod ===
                      "Cash on Delivery" && (
                      <span />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className={`checkout-payment-option ${
                    form.paymentMethod === "UPI"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePaymentMethodChange("UPI")
                  }
                  disabled={loading}
                >
                  <div className="payment-option-icon upi">
                    <FaCreditCard />
                  </div>

                  <div className="payment-option-content">
                    <strong>UPI</strong>
                    <span>
                      Continue to secure online payment
                    </span>
                  </div>

                  <div className="payment-radio">
                    {form.paymentMethod === "UPI" && (
                      <span />
                    )}
                  </div>
                </button>

                <button
                  type="button"
                  className={`checkout-payment-option ${
                    form.paymentMethod === "Card"
                      ? "active"
                      : ""
                  }`}
                  onClick={() =>
                    handlePaymentMethodChange("Card")
                  }
                  disabled={loading}
                >
                  <div className="payment-option-icon card">
                    <FaCreditCard />
                  </div>

                  <div className="payment-option-content">
                    <strong>Card</strong>
                    <span>
                      Continue to secure card payment
                    </span>
                  </div>

                  <div className="payment-radio">
                    {form.paymentMethod === "Card" && (
                      <span />
                    )}
                  </div>
                </button>
              </div>
            </section>

            {error && (
              <div className="checkout-error" role="alert">
                <span>!</span>
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* ORDER SUMMARY */}
          <aside className="checkout-summary">
            <div className="checkout-summary-inner">
              <div className="checkout-summary-top">
                <div>
                  <span>Your order</span>
                  <h3>Order summary</h3>
                </div>

                <div className="checkout-summary-count">
                  {itemCount}{" "}
                  {itemCount === 1 ? "item" : "items"}
                </div>
              </div>

              <div className="checkout-summary-items">
                {cart.map((item) => {
                  const itemQuantity = Number(
                    item.quantity || 0
                  );

                  const itemPrice =
                    Number(item.price || 0) *
                    itemQuantity;

                  return (
                    <div
                      className="checkout-summary-item"
                      key={item.id}
                    >
                      <div className="checkout-summary-item-image">
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                          />
                        ) : (
                          <FaUtensils />
                        )}
                      </div>

                      <div className="checkout-summary-item-info">
                        <strong>{item.name}</strong>

                        <span>
                          Qty {itemQuantity}
                        </span>
                      </div>

                      <strong className="checkout-summary-item-price">
                        ₹{itemPrice.toFixed(0)}
                      </strong>
                    </div>
                  );
                })}
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-summary-row">
                <span>Subtotal</span>
                <strong>
                  ₹{Number(cartTotal).toFixed(0)}
                </strong>
              </div>

              <div className="checkout-summary-row muted">
                <span>Taxes & charges</span>
                <span>Included</span>
              </div>

              <div className="checkout-summary-divider" />

              <div className="checkout-total">
                <div>
                  <span>Total</span>
                  <small>Inclusive of applicable charges</small>
                </div>

                <strong>
                  ₹{Number(cartTotal).toFixed(0)}
                </strong>
              </div>

              <button
                type="button"
                className="checkout-place-order"
                onClick={placeOrder}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="checkout-spinner" />
                    Processing...
                  </>
                ) : form.paymentMethod ===
                  "Cash on Delivery" ? (
                  <>
                    Place Order
                    <span>₹{Number(cartTotal).toFixed(0)}</span>
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <span>₹{Number(cartTotal).toFixed(0)}</span>
                  </>
                )}
              </button>

              <div className="checkout-secure-note">
                <FaCheckCircle />
                <span>
                  Your order details are securely processed.
                </span>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default Checkout;
