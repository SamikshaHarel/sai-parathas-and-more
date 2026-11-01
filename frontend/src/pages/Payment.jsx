
import { useState } from "react";
import {
    FaArrowLeft,
    FaCheck,
    FaCreditCard,
    FaLock,
    FaMobileAlt,
    FaShieldAlt,
    FaArrowRight,
} from "react-icons/fa";

function Payment({
    order,
    onPaymentComplete,
    onBack,
}) {
    const [cardForm, setCardForm] = useState({
        cardNumber: "",
        cardName: "",
        expiry: "",
        cvv: "",
    });

    const [upiId, setUpiId] = useState("");
    const [selectedUpiApp, setSelectedUpiApp] =
        useState("");
    const [error, setError] = useState("");
    const [processing, setProcessing] =
        useState(false);

    const handleCardChange = (event) => {
        const { name, value } = event.target;

        let formattedValue = value;

        if (name === "cardNumber") {
            formattedValue = value
                .replace(/\D/g, "")
                .slice(0, 16)
                .replace(/(.{4})/g, "$1 ")
                .trim();
        }

        if (name === "expiry") {
            formattedValue = value
                .replace(/\D/g, "")
                .slice(0, 4);

            if (formattedValue.length >= 3) {
                formattedValue =
                    formattedValue.slice(0, 2) +
                    "/" +
                    formattedValue.slice(2);
            }
        }

        if (name === "cvv") {
            formattedValue = value
                .replace(/\D/g, "")
                .slice(0, 3);
        }

        setCardForm((current) => ({
            ...current,
            [name]: formattedValue,
        }));

        setError("");
    };

    const completePayment = () => {
        setProcessing(true);

        setTimeout(() => {
            const updatedOrder = {
                ...order,
                paymentStatus: "Paid",
                status: "Placed",
            };

            onPaymentComplete(updatedOrder);
        }, 900);
    };

    const handleCardPayment = (event) => {
        event.preventDefault();

        const cardNumber =
            cardForm.cardNumber.replace(/\s/g, "");

        if (cardNumber.length !== 16) {
            setError(
                "Please enter a valid 16-digit card number."
            );
            return;
        }

        if (!cardForm.cardName.trim()) {
            setError(
                "Please enter the name on the card."
            );
            return;
        }

        if (
            !/^\d{2}\/\d{2}$/.test(
                cardForm.expiry
            )
        ) {
            setError(
                "Please enter expiry date in MM/YY format."
            );
            return;
        }

        if (cardForm.cvv.length !== 3) {
            setError(
                "Please enter a valid 3-digit CVV."
            );
            return;
        }

        completePayment();
    };

    const handleUpiPayment = (event) => {
        event.preventDefault();

        if (!selectedUpiApp && !upiId.trim()) {
            setError(
                "Choose a UPI app or enter your UPI ID."
            );
            return;
        }

        if (upiId.trim()) {
            const upiPattern =
                /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+$/;

            if (!upiPattern.test(upiId.trim())) {
                setError("Please enter a valid UPI ID.");
                return;
            }
        }

        completePayment();
    };

    const isCard =
        order.paymentMethod === "Card";

    return (
        <div className="payment-page app-screen">
            <div className="payment-background-shape payment-shape-one" />
            <div className="payment-background-shape payment-shape-two" />

            <header className="payment-header">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={processing}
                    className="screen-back-button"
                >
                    <FaArrowLeft />
                </button>

                <div>
                    <span>SAI PARATHAS & MORE</span>
                    <h1>
                        {isCard
                            ? "Card payment"
                            : "UPI payment"}
                    </h1>
                </div>

                <div className="payment-secure-badge">
                    <FaLock />
                    <span>Secure</span>
                </div>
            </header>

            <main className="payment-container">
                <section className="payment-intro">
                    <span>CHECKOUT</span>
                    <h2>
                        One last step.
                        <br />
                        <em>You're almost there.</em>
                    </h2>
                </section>

                <section className="payment-summary">
                    <div className="payment-summary-left">
                        <div className="payment-summary-icon">
                            {isCard ? (
                                <FaCreditCard />
                            ) : (
                                <FaMobileAlt />
                            )}
                        </div>

                        <div>
                            <span>
                                PAYMENT FOR ORDER
                            </span>

                            <strong>
                                {order.orderNumber}
                            </strong>
                        </div>
                    </div>

                    <div className="payment-amount">
                        <span>Amount</span>
                        <strong>
                            ₹{order.total}
                        </strong>
                    </div>
                </section>

                <section className="payment-card">
                    <div className="payment-card-title">
                        <div className="payment-card-number">
                            <span>
                                {isCard ? "02" : "02"}
                            </span>
                        </div>

                        <div>
                            <h2>
                                {isCard
                                    ? "Card details"
                                    : "Choose your UPI"}
                            </h2>

                            <p>
                                {isCard
                                    ? "Enter your card information below."
                                    : "Select an app or enter your UPI ID."}
                            </p>
                        </div>
                    </div>

                    {isCard ? (
                        <form
                            onSubmit={
                                handleCardPayment
                            }
                        >
                            <div className="payment-form-group">
                                <label>
                                    Card number
                                </label>

                                <input
                                    type="text"
                                    name="cardNumber"
                                    value={
                                        cardForm.cardNumber
                                    }
                                    onChange={
                                        handleCardChange
                                    }
                                    placeholder="1234 5678 9012 3456"
                                    inputMode="numeric"
                                />
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    Name on card
                                </label>

                                <input
                                    type="text"
                                    name="cardName"
                                    value={
                                        cardForm.cardName
                                    }
                                    onChange={
                                        handleCardChange
                                    }
                                    placeholder="Your name"
                                />
                            </div>

                            <div className="payment-form-row">
                                <div className="payment-form-group">
                                    <label>
                                        Expiry
                                    </label>

                                    <input
                                        type="text"
                                        name="expiry"
                                        value={
                                            cardForm.expiry
                                        }
                                        onChange={
                                            handleCardChange
                                        }
                                        placeholder="MM/YY"
                                        inputMode="numeric"
                                    />
                                </div>

                                <div className="payment-form-group">
                                    <label>
                                        CVV
                                    </label>

                                    <input
                                        type="password"
                                        name="cvv"
                                        value={
                                            cardForm.cvv
                                        }
                                        onChange={
                                            handleCardChange
                                        }
                                        placeholder="•••"
                                        inputMode="numeric"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="payment-form-error">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="pay-now-btn"
                                disabled={
                                    processing
                                }
                            >
                                {processing ? (
                                    <>
                                        <span className="mini-spinner" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaLock />
                                        Pay ₹
                                        {order.total}
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    ) : (
                        <form
                            onSubmit={
                                handleUpiPayment
                            }
                        >
                            <div className="upi-apps">
                                <button
                                    type="button"
                                    className={
                                        selectedUpiApp ===
                                        "Google Pay"
                                            ? "upi-app selected"
                                            : "upi-app"
                                    }
                                    onClick={() => {
                                        setSelectedUpiApp(
                                            "Google Pay"
                                        );
                                        setUpiId("");
                                        setError("");
                                    }}
                                >
                                    <span className="upi-logo gpay">
                                        G
                                    </span>
                                    <strong>
                                        Google Pay
                                    </strong>
                                    <small>
                                        Tap to select
                                    </small>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        selectedUpiApp ===
                                        "PhonePe"
                                            ? "upi-app selected"
                                            : "upi-app"
                                    }
                                    onClick={() => {
                                        setSelectedUpiApp(
                                            "PhonePe"
                                        );
                                        setUpiId("");
                                        setError("");
                                    }}
                                >
                                    <span className="upi-logo phonepe">
                                        P
                                    </span>
                                    <strong>
                                        PhonePe
                                    </strong>
                                    <small>
                                        Tap to select
                                    </small>
                                </button>

                                <button
                                    type="button"
                                    className={
                                        selectedUpiApp ===
                                        "Paytm"
                                            ? "upi-app selected"
                                            : "upi-app"
                                    }
                                    onClick={() => {
                                        setSelectedUpiApp(
                                            "Paytm"
                                        );
                                        setUpiId("");
                                        setError("");
                                    }}
                                >
                                    <span className="upi-logo paytm">
                                        Pay
                                    </span>
                                    <strong>
                                        Paytm
                                    </strong>
                                    <small>
                                        Tap to select
                                    </small>
                                </button>
                            </div>

                            {selectedUpiApp && (
                                <div className="selected-payment-app">
                                    <FaCheck />
                                    <span>
                                        {selectedUpiApp} selected
                                    </span>
                                </div>
                            )}

                            <div className="payment-divider">
                                <span>OR ENTER UPI ID</span>
                            </div>

                            <div className="payment-form-group">
                                <label>
                                    UPI ID
                                </label>

                                <input
                                    type="text"
                                    value={upiId}
                                    onChange={(
                                        event
                                    ) => {
                                        setUpiId(
                                            event.target
                                                .value
                                        );
                                        setSelectedUpiApp(
                                            ""
                                        );
                                        setError("");
                                    }}
                                    placeholder="example@upi"
                                />
                            </div>

                            {error && (
                                <p className="payment-form-error">
                                    {error}
                                </p>
                            )}

                            <button
                                type="submit"
                                className="pay-now-btn"
                                disabled={
                                    processing
                                }
                            >
                                {processing ? (
                                    <>
                                        <span className="mini-spinner" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <FaMobileAlt />
                                        Pay ₹
                                        {order.total}
                                        <FaArrowRight />
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    <div className="payment-security">
                        <FaShieldAlt />

                        <div>
                            <strong>
                                Your payment is protected
                            </strong>

                            <span>
                                Payment details are handled
                                securely.
                            </span>
                        </div>
                    </div>
                </section>

                <div className="payment-demo-notice">
                    <FaCheck />

                    <div>
                        <strong>
                            Preview payment mode
                        </strong>

                        <span>
                            This screen currently simulates
                            payment success. Real gateway
                            verification can be connected
                            later.
                        </span>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default Payment;
