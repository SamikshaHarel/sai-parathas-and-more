
import {
    FaArrowLeft,
    FaCheckCircle,
    FaClock,
    FaCreditCard,
    FaMapMarkerAlt,
    FaPrint,
    FaReceipt,
    FaUser,
} from "react-icons/fa";

import { restaurantData } from "../data/restaurantData";
import "./OrderDetails.css";

const normalizeOrderStatus = (status) => {
    const value = String(status || "PENDING").trim().toUpperCase();

    if (value === "PLACED" || value === "NEW") return "PENDING";
    return value;
};

const formatOrderStatus = (status) => {
    const labels = {
        PENDING: "Order Placed",
        ACCEPTED: "Accepted",
        PREPARING: "Preparing",
        READY: "Ready",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
    };

    const value = normalizeOrderStatus(status);
    return labels[value] || value;
};

function OrderDetails({ order, onBack }) {
    const formatDateTime = (date) => {
        if (!date) return "Date unavailable";

        const parsed = new Date(date);

        if (Number.isNaN(parsed.getTime())) {
            return "Date unavailable";
        }

        return parsed.toLocaleString("en-IN", {
            day: "2-digit",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const paymentIcon =
        order?.paymentMethod === "Cash on Delivery" ? (
            <FaClock />
        ) : (
            <FaCreditCard />
        );

    const handlePrint = () => {
        if (!order) return;

        const receipt = document.querySelector(
            ".order-details-container"
        );

        if (!receipt) {
            alert("Receipt could not be found.");
            return;
        }

        const printWindow = window.open(
            "",
            "_blank",
            "width=850,height=900"
        );

        if (!printWindow) {
            alert("Please allow pop-ups to print the receipt.");
            return;
        }

        const styles = Array.from(
            document.querySelectorAll(
                'link[rel="stylesheet"], style'
            )
        )
            .map((element) => element.outerHTML)
            .join("\n");

        const safeOrderNumber = String(
            order.orderNumber || "Receipt"
        ).replace(/[<>&"']/g, "");

        printWindow.document.open();

        printWindow.document.write(`
            <!DOCTYPE html>
            <html>
                <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>Receipt ${safeOrderNumber}</title>
                    ${styles}

                    <style>
                        @page {
                            size: A4 portrait;
                            margin: 8mm;
                        }

                        html,
                        body {
                            width: 100% !important;
                            height: auto !important;
                            min-height: 0 !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible !important;
                            background: #fff !important;
                        }

                        body {
                            color: #222 !important;
                            font-family: Arial, Helvetica, sans-serif !important;
                            font-size: 9pt !important;
                            line-height: 1.2 !important;
                        }

                        .order-details-container,
                        .order-details-page {
                            display: block !important;
                            position: static !important;
                            width: 100% !important;
                            max-width: none !important;
                            height: auto !important;
                            min-height: 0 !important;
                            max-height: none !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: visible !important;
                            transform: none !important;
                            border: 0 !important;
                            border-radius: 0 !important;
                            box-shadow: none !important;
                            background: #fff !important;
                        }

                        .no-print,
                        .checkout-header,
                        .order-details-actions,
                        button {
                            display: none !important;
                        }

                        .print-header {
                            margin: 0 0 7px !important;
                            padding: 0 0 7px !important;
                            border-bottom: 1px dashed #999 !important;
                            text-align: center !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .print-header h1 {
                            margin: 0 0 3px !important;
                            font-size: 18pt !important;
                            line-height: 1.15 !important;
                        }

                        .print-contact,
                        .print-address,
                        .print-header p {
                            margin: 3px 0 !important;
                            font-size: 8pt !important;
                            overflow-wrap: anywhere !important;
                        }

                        .order-details-hero {
                            margin: 0 0 7px !important;
                            padding: 7px 0 !important;
                            text-align: center !important;
                            border-bottom: 1px dashed #999 !important;
                            background: #fff !important;
                            color: #222 !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .order-details-success-icon,
                        .order-details-item-image {
                            display: none !important;
                        }

                        .order-details-hero h2 {
                            margin: 3px 0 !important;
                            font-size: 15pt !important;
                        }

                        .order-details-hero p,
                        .order-details-label,
                        .order-details-status {
                            font-size: 8pt !important;
                        }

                        .order-details-status {
                            display: inline-block !important;
                            margin-top: 3px !important;
                            padding: 2px 6px !important;
                            border: 1px solid #999 !important;
                            background: #fff !important;
                            color: #222 !important;
                        }

                        .order-details-section {
                            margin: 0 0 7px !important;
                            padding: 0 0 7px !important;
                            border: 0 !important;
                            border-bottom: 1px dashed #bbb !important;
                            background: #fff !important;
                            break-inside: auto !important;
                            page-break-inside: auto !important;
                        }

                        .order-details-title {
                            margin: 0 0 5px !important;
                            font-size: 10pt !important;
                            break-after: avoid !important;
                            page-break-after: avoid !important;
                        }

                        .order-details-info-grid,
                        .order-details-payment {
                            display: grid !important;
                            grid-template-columns: 1fr 1fr !important;
                            gap: 4px 12px !important;
                        }

                        .order-details-info-box,
                        .order-details-payment > div {
                            min-width: 0 !important;
                            padding: 3px 0 !important;
                            border: 0 !important;
                            background: #fff !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .order-details-info-box span,
                        .order-details-payment span {
                            display: block !important;
                            margin-bottom: 2px !important;
                            font-size: 8pt !important;
                        }

                        .order-details-info-box strong,
                        .order-details-payment strong {
                            font-size: 8.5pt !important;
                            overflow-wrap: anywhere !important;
                        }

                        .order-details-item {
                            display: flex !important;
                            align-items: center !important;
                            justify-content: space-between !important;
                            gap: 8px !important;
                            padding: 5px 0 !important;
                            border-bottom: 1px dotted #ccc !important;
                            background: #fff !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .order-details-item-left {
                            display: flex !important;
                            gap: 6px !important;
                            min-width: 0 !important;
                        }

                        .order-details-item h3 {
                            margin: 0 0 2px !important;
                            font-size: 9pt !important;
                        }

                        .order-details-item span {
                            font-size: 8pt !important;
                        }

                        .order-details-item > strong {
                            flex-shrink: 0 !important;
                            font-size: 9pt !important;
                        }

                        .order-details-bill {
                            width: 100% !important;
                            max-width: 250px !important;
                            margin: 6px 0 0 auto !important;
                        }

                        .bill-row,
                        .bill-grand-total {
                            display: flex !important;
                            justify-content: space-between !important;
                            gap: 10px !important;
                            padding: 4px 0 !important;
                            font-size: 9pt !important;
                        }

                        .bill-grand-total {
                            margin-top: 3px !important;
                            padding-top: 6px !important;
                            border-top: 1px solid #222 !important;
                            font-size: 10pt !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .print-footer {
                            margin-top: 6px !important;
                            padding-top: 7px !important;
                            border-top: 1px dashed #999 !important;
                            text-align: center !important;
                            font-size: 8pt !important;
                            line-height: 1.2 !important;
                            break-inside: avoid !important;
                            page-break-inside: avoid !important;
                        }

                        .print-footer p,
                        .print-footer strong,
                        .print-footer span {
                            display: block !important;
                            margin: 2px 0 !important;
                            font-size: 8pt !important;
                        }

                        * {
                            box-shadow: none !important;
                            text-shadow: none !important;
                            animation: none !important;
                            transition: none !important;
                        }
                    </style>
                </head>

                <body>
                    ${receipt.outerHTML}
                </body>
            </html>
        `);

        printWindow.document.close();

        printWindow.onload = async () => {
            try {
                if (printWindow.document.fonts?.ready) {
                    await printWindow.document.fonts.ready;
                }
            } catch {
                // Continue if web fonts cannot load.
            }

            printWindow.focus();
            printWindow.print();
        };
    };

    if (!order) {
        return (
            <div className="order-details-page">
                <main className="order-details-container">
                    <section className="order-details-empty">
                        <FaReceipt />
                        <h2>Order not found</h2>
                        <p>This order could not be found.</p>

                        <button
                            type="button"
                            className="order-details-back-btn"
                            onClick={onBack}
                        >
                            <FaArrowLeft />
                            Back to Orders
                        </button>
                    </section>
                </main>
            </div>
        );
    }

    const items = Array.isArray(order.items) ? order.items : [];
    const total = Number(order.total ?? order.totalAmount) || 0;
    const currentStatus = normalizeOrderStatus(order.status);

    return (
        <div className="order-details-page">
            <header className="checkout-header no-print">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Go back"
                >
                    <FaArrowLeft />
                </button>

                <div>
                    <span>{restaurantData.name}</span>
                    <h1>Order Details</h1>
                </div>
            </header>

            <main className="order-details-container">
                <section className="print-header">
                    <h1>{restaurantData.name}</h1>

                    {restaurantData.tagline && (
                        <p>{restaurantData.tagline}</p>
                    )}

                    <div className="print-contact">
                        {restaurantData.phone && (
                            <span>Phone: {restaurantData.phone}</span>
                        )}
                        {restaurantData.phone && <span>•</span>}
                        <span>Order Receipt</span>
                    </div>

                    {restaurantData.address && (
                        <div className="print-address">
                            {restaurantData.address}
                        </div>
                    )}

                    {restaurantData.email && (
                        <div className="print-contact">
                            <span>{restaurantData.email}</span>
                        </div>
                    )}
                </section>

                <section className="order-details-hero">
                    <div className="order-details-success-icon">
                        <FaCheckCircle />
                    </div>

                    <span className="order-details-label">ORDER RECEIPT</span>

                    <h2>{order.orderNumber || `#${order.backendOrderId || ""}`}</h2>

                    <p>Placed on {formatDateTime(order.createdAt)}</p>

                    <span
                        className={`order-details-status status-${currentStatus.toLowerCase()}`}
                        aria-live="polite"
                    >
                        {formatOrderStatus(currentStatus)}
                    </span>
                </section>

                <section className="order-details-section">
                    <h2 className="order-details-title">
                        <FaUser />
                        Customer Details
                    </h2>

                    <div className="order-details-info-grid">
                        <div className="order-details-info-box">
                            <span>Name</span>
                            <strong>
                                {order.name || order.customerName || "Guest"}
                            </strong>
                        </div>

                        <div className="order-details-info-box">
                            <span>Mobile</span>
                            <strong>
                                {order.mobile ||
                                    order.customerPhone ||
                                    "Not provided"}
                            </strong>
                        </div>

                        <div className="order-details-info-box">
                            <span>Order Type</span>
                            <strong>{order.orderType || "Not specified"}</strong>
                        </div>

                        {order.tableNumber != null && (
                            <div className="order-details-info-box">
                                <span>Table Number</span>
                                <strong>{order.tableNumber}</strong>
                            </div>
                        )}
                    </div>
                </section>

                <section className="order-details-section">
                    <h2 className="order-details-title">
                        <FaReceipt />
                        Order Items
                    </h2>

                    <div className="order-details-items">
                        {items.length === 0 ? (
                            <p>Item details are unavailable for this order.</p>
                        ) : (
                            items.map((item, index) => {
                                const price = Number(
                                    item.price ?? item.menuItem?.price
                                ) || 0;
                                const quantity = Number(item.quantity) || 1;
                                const name =
                                    item.name ||
                                    item.menuItem?.name ||
                                    "Menu Item";

                                return (
                                    <div
                                        className="order-details-item"
                                        key={item.id ?? `${name}-${index}`}
                                    >
                                        <div className="order-details-item-left">
                                            <div className="order-details-item-image">
                                                {item.emoji || "🍽️"}
                                            </div>

                                            <div className="order-details-item-info">
                                                <h3>{name}</h3>
                                                <span>
                                                    ₹{price.toFixed(2)} × {quantity}
                                                </span>
                                            </div>
                                        </div>

                                        <strong>
                                            ₹{(price * quantity).toFixed(2)}
                                        </strong>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="order-details-bill">
                        <div className="bill-row">
                            <span>Subtotal</span>
                            <strong>₹{total.toFixed(2)}</strong>
                        </div>

                        <div className="bill-row">
                            <span>Tax</span>
                            <strong>₹0.00</strong>
                        </div>

                        <div className="bill-grand-total">
                            <span>Grand Total</span>
                            <strong>₹{total.toFixed(2)}</strong>
                        </div>
                    </div>
                </section>

                <section className="order-details-section">
                    <h2 className="order-details-title">
                        {paymentIcon}
                        Payment Details
                    </h2>

                    <div className="order-details-payment">
                        <div>
                            <span>Payment Method</span>
                            <strong>{order.paymentMethod || "Not specified"}</strong>
                        </div>

                        
                    </div>
                </section>

                {order.instructions && (
                    <section className="order-details-section">
                        <h2 className="order-details-title">
                            <FaMapMarkerAlt />
                            Special Instructions
                        </h2>

                        <div className="order-details-instructions">
                            {order.instructions}
                        </div>
                    </section>
                )}

                <section className="print-footer">
                    <p>Thank you for ordering from</p>
                    <strong>{restaurantData.name}</strong>

                    {restaurantData.address && (
                        <span>{restaurantData.address}</span>
                    )}

                    {restaurantData.phone && (
                        <span>Phone: {restaurantData.phone}</span>
                    )}

                    <span>We hope to serve you again!</span>
                </section>

                <div className="order-details-actions no-print">
                    <button
                        type="button"
                        className="order-details-print-btn"
                        onClick={handlePrint}
                    >
                        <FaPrint />
                        Print Order
                    </button>

                    <button
                        type="button"
                        className="order-details-back-btn"
                        onClick={onBack}
                    >
                        <FaArrowLeft />
                        Back to My Orders
                    </button>
                </div>
            </main>
        </div>
    );
}

export default OrderDetails;
