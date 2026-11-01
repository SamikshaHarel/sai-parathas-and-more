
import { useEffect, useState } from "react";
import {
  FiBell,
  FiGift,
  FiHome,
  FiMenu,
  FiRefreshCw,
  FiSettings
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./OwnerAdmin.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const RESTAURANT_ID = 1;

const STATUSES = [
    "PENDING",
    "ACCEPTED",
    "PREPARING",
    "READY",
    "COMPLETED",
    "CANCELLED",
];

function OwnerAdmin() {
    const navigate = useNavigate();

    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [updating, setUpdating] = useState(null);

    const [unreadNotifications, setUnreadNotifications] =
        useState(0);

    /* ================================
       LOAD ORDERS
    ================================= */

    const loadOrders = async () => {
        try {
            setError("");

            const response = await fetch(
                `${API}/api/orders/restaurant/${RESTAURANT_ID}`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error("Could not load orders");
            }

            const data = await response.json();

            setOrders(data);
        } catch (err) {
            console.error(err);
            setError("Unable to load orders.");
        } finally {
            setLoading(false);
        }
    };

    /* ================================
       LOAD UNREAD NOTIFICATIONS
    ================================= */

    const loadUnreadNotifications = async () => {
        try {
            const response = await fetch(
                `${API}/api/notifications/restaurant/${RESTAURANT_ID}/unread`,
                {
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Could not load notifications"
                );
            }

            const data = await response.json();

            setUnreadNotifications(data.length);
        } catch (err) {
            console.error(
                "Notification loading error:",
                err
            );
        }
    };

    /* ================================
       INITIAL LOAD + AUTO REFRESH
    ================================= */

    useEffect(() => {
        loadOrders();
        loadUnreadNotifications();

        const timer = setInterval(() => {
            loadOrders();
            loadUnreadNotifications();
        }, 10000);

        return () => clearInterval(timer);
    }, []);

    /* ================================
       UPDATE ORDER STATUS
    ================================= */

    const changeStatus = async (orderId, status) => {
        try {
            setUpdating(orderId);
            setError("");

            const response = await fetch(
                `${API}/api/orders/${orderId}/status?status=${status}`,
                {
                    method: "PATCH",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(
                    "Could not update status"
                );
            }

            const updated = await response.json();

            setOrders((oldOrders) =>
                oldOrders.map((order) =>
                    order.id === updated.id
                        ? updated
                        : order
                )
            );
        } catch (err) {
            console.error(err);
            setError(
                "Unable to update order status."
            );
        } finally {
            setUpdating(null);
        }
    };

    /* ================================
       DASHBOARD CALCULATIONS
    ================================= */

    const pending = orders.filter(
        (order) => order.status === "PENDING"
    ).length;

    const completed = orders.filter(
        (order) => order.status === "COMPLETED"
    ).length;

    const sales = orders
        .filter(
            (order) => order.status !== "CANCELLED"
        )
        .reduce(
            (sum, order) =>
                sum + Number(order.totalAmount || 0),
            0
        );

    /* ================================
       UI
    ================================= */

    return (
        <div className="owner-admin-layout">

            {/* ================================
                SIDEBAR
            ================================= */}

            <aside className="owner-sidebar">

                <div className="sidebar-brand">

                    <div className="brand-icon">
                        🍽️
                    </div>

                    <div>
                        <strong>
                            Sai Parathas
                        </strong>

                        <span>
                            & More
                        </span>
                    </div>

                </div>

                <nav className="sidebar-nav">

                    {/* MANAGEMENT */}

                    <p className="sidebar-section-title">
                        MANAGEMENT
                    </p>

                    <button
                        className="sidebar-link active"
                        onClick={() =>
                            navigate("/owner-admin")
                        }
                        type="button"
                    >
                        <FiHome />

                        <span>
                            Dashboard
                        </span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/owner-menu")
                        }
                        type="button"
                    >
                        <FiMenu />

                        <span>
                            Menu
                        </span>
                    </button>

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate(
                                "/restaurant-settings"
                            )
                        }
                        type="button"
                    >
                        <FiSettings />

                        <span>
                            Restaurant Settings
                        </span>
                    </button>

                    {/* GROWTH */}

                    <p className="sidebar-section-title">
                        GROWTH
                    </p>

                    {/* OFFERS */}

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate("/owner-offers")
                        }
                        type="button"
                    >
                        <FiGift />

                        <span>
                            Offers
                        </span>
                    </button>

                    {/* NOTIFICATIONS */}

                    <button
                        className="sidebar-link"
                        onClick={() =>
                            navigate(
                                "/owner-notifications"
                            )
                        }
                        type="button"
                    >
                        <FiBell />

                        <span>
                            Notifications
                        </span>

                        {unreadNotifications > 0 && (
                            <small className="notification-sidebar-badge">
                                {unreadNotifications > 99
                                    ? "99+"
                                    : unreadNotifications}
                            </small>
                        )}
                    </button>

                    {/* PLATFORM */}

                </nav>

                <div className="sidebar-footer">

                    <span>
                        OWNER PANEL
                    </span>

                    <strong>
                        Restaurant #1
                    </strong>

                </div>

            </aside>

            {/* ================================
                MAIN DASHBOARD
            ================================= */}

            <main className="owner-admin">

                <header className="admin-header">

                    <div>

                        <p className="admin-label">
                            OWNER PANEL
                        </p>

                        <h1>
                            Dashboard
                        </h1>

                        <p className="admin-subtitle">
                            Manage your restaurant orders
                        </p>

                    </div>

                    <button
                        className="refresh-btn"
                        onClick={() => {
                            loadOrders();
                            loadUnreadNotifications();
                        }}
                        type="button"
                    >
                        <FiRefreshCw />

                        Refresh
                    </button>

                </header>

                {/* ================================
                    STATS
                ================================= */}

                <section className="stats-grid">

                    <div className="stat-card">

                        <span>
                            Total Orders
                        </span>

                        <strong>
                            {orders.length}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Pending
                        </span>

                        <strong>
                            {pending}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Completed
                        </span>

                        <strong>
                            {completed}
                        </strong>

                    </div>

                    <div className="stat-card">

                        <span>
                            Total Sales
                        </span>

                        <strong>
                            ₹{sales.toFixed(2)}
                        </strong>

                    </div>

                </section>

                {/* ================================
                    ORDERS
                ================================= */}

                <section className="orders-section">

                    <div className="section-heading">

                        <div>

                            <h2>
                                Incoming Orders
                            </h2>

                            <p>
                                Orders placed by customers
                            </p>

                        </div>

                        <span className="live-badge">
                            ● Live
                        </span>

                    </div>

                    {error && (
                        <div className="admin-message error">
                            {error}
                        </div>
                    )}

                    {loading ? (

                        <div className="admin-message">
                            Loading orders...
                        </div>

                    ) : orders.length === 0 ? (

                        <div className="admin-message">
                            No orders yet.
                        </div>

                    ) : (

                        <div className="orders-list">

                            {orders.map((order) => (

                                <div
                                    className="order-card"
                                    key={order.id}
                                >

                                    {/* ORDER HEADER */}

                                    <div className="order-top">

                                        <div>

                                            <h3>
                                                Order #{order.id}
                                            </h3>

                                            <p>
                                                {order.customerName ||
                                                    "Guest Customer"}
                                            </p>

                                        </div>

                                        <span className="status">
                                            {order.status}
                                        </span>

                                    </div>

                                    {/* ORDER ITEMS */}

                                    <div className="ordered-items">

                                        <h4>
                                            Ordered Items
                                        </h4>

                                        {order.items &&
                                        order.items.length > 0 ? (

                                            order.items.map((item) => (

                                                <div
                                                    className="ordered-item"
                                                    key={item.id}
                                                >

                                                    <div>

                                                        <strong>
                                                            {item.menuItem?.name ||
                                                                "Menu Item"}
                                                        </strong>

                                                        <span>
                                                            Qty: {item.quantity}
                                                        </span>

                                                    </div>

                                                    <strong>
                                                        ₹
                                                        {Number(
                                                            item.price *
                                                                item.quantity
                                                        ).toFixed(2)}
                                                    </strong>

                                                </div>

                                            ))

                                        ) : (

                                            <p className="no-items">
                                                No item details available.
                                            </p>

                                        )}

                                    </div>

                                    {/* ORDER INFORMATION */}

                                    <div className="order-info">

                                        <div>

                                            <span>
                                                Phone
                                            </span>

                                            <strong>
                                                {order.customerPhone ||
                                                    "Not provided"}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Order Type
                                            </span>

                                            <strong>
                                                {order.orderType ||
                                                    "Not specified"}
                                            </strong>

                                        </div>

                                        {order.orderType ===
                                            "Dine In" &&
                                            order.tableNumber && (

                                                <div>

                                                    <span>
                                                        Table
                                                    </span>

                                                    <strong>
                                                        {order.tableNumber}
                                                    </strong>

                                                </div>

                                            )}

                                        <div>

                                            <span>
                                                Payment
                                            </span>

                                            <strong>
                                                {order.paymentMethod ||
                                                    "Not specified"}
                                            </strong>

                                        </div>

                                        <div>

                                            <span>
                                                Total
                                            </span>

                                            <strong>
                                                ₹
                                                {Number(
                                                    order.totalAmount || 0
                                                ).toFixed(2)}
                                            </strong>

                                        </div>

                                    </div>

                                    {/* CUSTOMER INSTRUCTIONS */}

                                    {order.instructions && (

                                        <div className="order-instructions">

                                            <span>
                                                Customer Instructions
                                            </span>

                                            <p>
                                                {order.instructions}
                                            </p>

                                        </div>

                                    )}

                                    {/* STATUS CONTROLS */}

                                    <div className="status-controls">

                                        <span>
                                            Update status
                                        </span>

                                        <div className="status-buttons">

                                            {STATUSES.map(
                                                (status) => (

                                                    <button
                                                        key={status}
                                                        className={
                                                            order.status ===
                                                            status
                                                                ? "status-btn active"
                                                                : "status-btn"
                                                        }
                                                        disabled={
                                                            updating ===
                                                            order.id
                                                        }
                                                        onClick={() =>
                                                            changeStatus(
                                                                order.id,
                                                                status
                                                            )
                                                        }
                                                        type="button"
                                                    >
                                                        {status}
                                                    </button>

                                                )
                                            )}

                                        </div>

                                    </div>

                                    {/* ORDER FOOTER */}

                                    <div className="order-footer">

                                        <span>
                                            {order.createdAt
                                                ? new Date(
                                                    order.createdAt
                                                ).toLocaleString(
                                                    "en-IN"
                                                )
                                                : ""}
                                        </span>

                                    </div>

                                </div>

                            ))}

                        </div>

                    )}

                </section>

            </main>

        </div>
    );
}

export default OwnerAdmin;
