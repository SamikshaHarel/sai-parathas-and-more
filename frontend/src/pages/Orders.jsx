
import { useCallback, useEffect, useMemo, useState } from "react";
import {
    FaArrowLeft,
    FaArrowRight,
    FaReceipt,
    FaSearch,
    FaSyncAlt,
    FaTrash,
} from "react-icons/fa";

import OrderDetails from "./OrderDetails";
import "./Orders.css";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const RESTAURANT_ID = 1;
const STORAGE_KEY = "saiParathasOrders";
const REFRESH_INTERVAL = 5000;

const ORDER_STEPS = [
    { status: "PENDING", label: "Order placed" },
    { status: "ACCEPTED", label: "Accepted" },
    { status: "PREPARING", label: "Preparing" },
    { status: "READY", label: "Ready" },
    { status: "COMPLETED", label: "Completed" },
];

const normalizeStatus = (status) => {
    const value = String(status || "PENDING").trim().toUpperCase();

    if (["PLACED", "NEW"].includes(value)) return "PENDING";
    return value;
};

const formatStatus = (status) => {
    const labels = {
        PENDING: "Order placed",
        ACCEPTED: "Accepted",
        PREPARING: "Preparing",
        READY: "Ready",
        COMPLETED: "Completed",
        CANCELLED: "Cancelled",
    };

    const value = normalizeStatus(status);
    return labels[value] || value;
};

const getSavedOrders = () => {
    try {
        const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
        return Array.isArray(data) ? data : [];
    } catch (error) {
        console.error("Unable to read saved orders:", error);
        return [];
    }
};

const getBackendId = (order) => {
    const directId = order?.backendOrderId ?? order?.orderId;

    if (directId != null && String(directId).trim() !== "") {
        return String(directId).replace(/^#/, "");
    }

    const orderNumber = String(order?.orderNumber || "").trim();
    const match = orderNumber.match(/^#?(\d+)$/);

    return match ? match[1] : null;
};

const normalizeName = (name) =>
    String(name || "")
        .trim()
        .toLowerCase()
        .replace(/\s+/g, " ");

const getOrderTotal = (order) =>
    Number(order?.totalAmount ?? order?.total ?? 0);

const findMatchingBackendOrder = (savedOrder, backendOrders) => {
    // Prefer the actual database ID.
    const backendId = getBackendId(savedOrder);

    if (backendId) {
        const exactMatch = backendOrders.find(
            (item) => String(item.id) === backendId
        );

        if (exactMatch) return exactMatch;
    }

    // Fallback for older saved orders without a backend ID.
    // Match name, total, and creation time; do not guess if ambiguous.
    const savedName = normalizeName(
        savedOrder.name || savedOrder.customerName
    );
    const savedDate = new Date(savedOrder.createdAt).getTime();
    const savedTotal = getOrderTotal(savedOrder);

    if (!savedName || !Number.isFinite(savedDate)) return null;

    const candidates = backendOrders.filter((item) => {
        const backendName = normalizeName(
            item.customerName || item.name
        );
        const backendDate = new Date(item.createdAt).getTime();
        const backendTotal = getOrderTotal(item);

        return (
            backendName === savedName &&
            Number.isFinite(backendDate) &&
            Math.abs(backendDate - savedDate) <= 10 * 60 * 1000 &&
            Math.abs(backendTotal - savedTotal) < 0.01
        );
    });

    return candidates.length === 1 ? candidates[0] : null;
};

const formatDateTime = (date) => {
    if (!date) return "Date unavailable";

    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "Date unavailable";

    return parsed.toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    });
};

function OrderStatusTracker({ status }) {
    const currentStatus = normalizeStatus(status);

    if (currentStatus === "CANCELLED") {
        return (
            <div className="order-progress cancelled-message">
                <strong>Order cancelled</strong>
                <p>This order has been cancelled.</p>
            </div>
        );
    }

    const currentIndex = ORDER_STEPS.findIndex(
        (step) => step.status === currentStatus
    );

    const activeIndex = currentIndex < 0 ? 0 : currentIndex;
    const isCompleted = currentStatus === "COMPLETED";

    return (
        <div
            className="order-progress"
            aria-label={`Order status: ${formatStatus(currentStatus)}`}
        >
            <div className="progress-track">
                {ORDER_STEPS.map((step, index) => {
                    const isDone = index < activeIndex || isCompleted;
                    const isCurrent = index === activeIndex;

                    return (
                        <div
                            className={[
                                "progress-step",
                                isDone ? "is-complete" : "",
                                isCurrent ? "is-current" : "",
                            ]
                                .filter(Boolean)
                                .join(" ")}
                            key={step.status}
                        >
                            <span className="progress-dot">
                                {isDone ? "✓" : index + 1}
                            </span>
                            <span className="progress-label">{step.label}</span>
                        </div>
                    );
                })}
            </div>

            <p className="progress-caption">
                {isCompleted
                    ? "Your order is completed."
                    : `Current status: ${formatStatus(currentStatus)}`}
            </p>
        </div>
    );
}

function Orders({ onBack }) {
    const [orders, setOrders] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");
    const [paymentFilter, setPaymentFilter] = useState("All");
    const [sortBy, setSortBy] = useState("newest");
    const [selectedOrder, setSelectedOrder] = useState(null);

    const [serverAvailable, setServerAvailable] = useState(false);
    const [refreshing, setRefreshing] = useState(false);
    const [lastUpdated, setLastUpdated] = useState(null);

    const loadOrders = useCallback(async (showRefreshing = false) => {
        if (showRefreshing) setRefreshing(true);

        // Show saved history immediately while the API request runs.
        setOrders(getSavedOrders());

        try {
            const response = await fetch(
                `${API_BASE_URL}/api/orders/restaurant/${RESTAURANT_ID}`,
                {
                    method: "GET",
                    cache: "no-store",
                    credentials: "include",
                }
            );

            if (!response.ok) {
                throw new Error(`Orders API returned HTTP ${response.status}`);
            }

            const responseData = await response.json();
            const backendOrders = Array.isArray(responseData)
                ? responseData
                : Array.isArray(responseData?.orders)
                    ? responseData.orders
                    : null;

            if (!backendOrders) {
                throw new Error("Unexpected orders API response.");
            }

            const latestSavedOrders = getSavedOrders();

            const synchronizedOrders = latestSavedOrders.map((savedOrder) => {
                const backendOrder = findMatchingBackendOrder(
                    savedOrder,
                    backendOrders
                );

                if (!backendOrder) return savedOrder;

                return {
                    ...savedOrder,
                    backendOrderId: backendOrder.id,
                    status: normalizeStatus(backendOrder.status),
                    name:
                        backendOrder.customerName ||
                        backendOrder.name ||
                        savedOrder.name,
                    customerName:
                        backendOrder.customerName ||
                        backendOrder.name ||
                        savedOrder.customerName,
                    customerPhone:
                        backendOrder.customerPhone ||
                        savedOrder.customerPhone,
                    mobile:
                        backendOrder.customerPhone ||
                        savedOrder.mobile,
                    orderType:
                        backendOrder.orderType ||
                        savedOrder.orderType,
                    paymentMethod:
                        backendOrder.paymentMethod ||
                        savedOrder.paymentMethod,
                    paymentStatus:
                        backendOrder.paymentStatus ||
                        savedOrder.paymentStatus,
                    total:
                        backendOrder.totalAmount ??
                        savedOrder.total,
                    totalAmount:
                        backendOrder.totalAmount ??
                        savedOrder.totalAmount,
                    createdAt:
                        backendOrder.createdAt ||
                        savedOrder.createdAt,
                    tableNumber:
                        backendOrder.tableNumber ??
                        savedOrder.tableNumber,
                    instructions:
                        backendOrder.instructions ??
                        savedOrder.instructions,
                };
            });

            localStorage.setItem(
                STORAGE_KEY,
                JSON.stringify(synchronizedOrders)
            );

            setOrders(synchronizedOrders);
            setServerAvailable(true);
            setLastUpdated(new Date());

            // Refresh the order details view if it is currently open.
            setSelectedOrder((current) => {
                if (!current) return null;

                const currentId = getBackendId(current);

                const updatedOrder = synchronizedOrders.find((order) => {
                    const orderId = getBackendId(order);

                    if (currentId && orderId) {
                        return currentId === orderId;
                    }

                    return order.orderNumber === current.orderNumber;
                });

                return updatedOrder || current;
            });
        } catch (error) {
            console.error("Could not refresh order status:", error);
            setServerAvailable(false);
        } finally {
            if (showRefreshing) setRefreshing(false);
            else setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        loadOrders();

        const timer = window.setInterval(() => {
            loadOrders();
        }, REFRESH_INTERVAL);

        const handleFocus = () => loadOrders();

        window.addEventListener("focus", handleFocus);

        return () => {
            window.clearInterval(timer);
            window.removeEventListener("focus", handleFocus);
        };
    }, [loadOrders]);

    const deleteOrder = (orderNumber) => {
        const confirmed = window.confirm(
            "Are you sure you want to delete this order from your saved history?"
        );

        if (!confirmed) return;

        const updatedOrders = getSavedOrders().filter(
            (order) => order.orderNumber !== orderNumber
        );

        localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedOrders));
        setOrders(updatedOrders);

        if (selectedOrder?.orderNumber === orderNumber) {
            setSelectedOrder(null);
        }
    };

    const clearOrders = () => {
        const confirmed = window.confirm(
            "Are you sure you want to clear all order history from this browser?"
        );

        if (!confirmed) return;

        localStorage.removeItem(STORAGE_KEY);
        setOrders([]);
        setSelectedOrder(null);
    };

    const filteredAndSortedOrders = useMemo(() => {
        const search = searchTerm.trim().toLowerCase();

        const filtered = orders.filter((order) => {
            const matchesSearch =
                search === "" ||
                String(order.orderNumber || "")
                    .toLowerCase()
                    .includes(search) ||
                String(order.name || order.customerName || "")
                    .toLowerCase()
                    .includes(search);

            const matchesStatus =
                statusFilter === "All" ||
                normalizeStatus(order.status) === statusFilter;

            const matchesPayment =
                paymentFilter === "All" ||
                order.paymentMethod === paymentFilter;

            return matchesSearch && matchesStatus && matchesPayment;
        });

        return [...filtered].sort((a, b) => {
            if (sortBy === "oldest") {
                return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
            }

            if (sortBy === "highest") {
                return (
                    Number(b.total ?? b.totalAmount ?? 0) -
                    Number(a.total ?? a.totalAmount ?? 0)
                );
            }

            if (sortBy === "lowest") {
                return (
                    Number(a.total ?? a.totalAmount ?? 0) -
                    Number(b.total ?? b.totalAmount ?? 0)
                );
            }

            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
        });
    }, [orders, searchTerm, statusFilter, paymentFilter, sortBy]);

    const clearFilters = () => {
        setSearchTerm("");
        setStatusFilter("All");
        setPaymentFilter("All");
        setSortBy("newest");
    };

    const hasActiveFilters =
        searchTerm.trim() !== "" ||
        statusFilter !== "All" ||
        paymentFilter !== "All";

    const liveStatus = (
        <div className="orders-live-status">
            <span
                className={
                    serverAvailable
                        ? "status-indicator is-online"
                        : "status-indicator is-offline"
                }
            />

            {serverAvailable
                ? `Live order status${
                    lastUpdated
                        ? ` · Updated ${lastUpdated.toLocaleTimeString(
                            "en-IN",
                            {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                            }
                        )}`
                        : ""
                }`
                : "Unable to reach order service · Showing saved history"}

            <button
                type="button"
                className="orders-refresh-btn"
                onClick={() => loadOrders(true)}
                disabled={refreshing}
                aria-label="Refresh order status"
                title="Refresh order status"
            >
                <FaSyncAlt className={refreshing ? "is-spinning" : ""} />
            </button>
        </div>
    );

    if (selectedOrder) {
        return (
            <div className="orders-page app-screen">
                {liveStatus}

                <OrderStatusTracker status={selectedOrder.status} />

                <OrderDetails
                    order={selectedOrder}
                    onBack={() => setSelectedOrder(null)}
                />
            </div>
        );
    }

    return (
        <div className="orders-page app-screen">
            <div className="orders-background-shape orders-shape-one" />
            <div className="orders-background-shape orders-shape-two" />

            <header className="orders-header">
                <button
                    type="button"
                    onClick={onBack}
                    className="screen-back-button"
                    aria-label="Back to menu"
                >
                    <FaArrowLeft />
                </button>

                <div>
                    <span>SAI PARATHAS & MORE</span>
                    <h1>My orders</h1>
                </div>

                <div className="orders-count">
                    <strong>{orders.length}</strong>
                    <small>Total</small>
                </div>
            </header>

            <main className="orders-container">
                <section className="orders-intro">
                    <span>YOUR HISTORY</span>

                    <h2>
                        Good food
                        <br />
                        <em>is worth remembering.</em>
                    </h2>

                    <p>
                        Find your previous orders and revisit the details
                        anytime.
                    </p>

                    {liveStatus}
                </section>

                {orders.length === 0 ? (
                    <section className="empty-orders">
                        <div className="empty-orders-icon">
                            <FaReceipt />
                        </div>

                        <span>NOTHING HERE YET</span>

                        <h2>
                            Your first order
                            <br />
                            starts here.
                        </h2>

                        <p>
                            Once you place an order, you'll find all your
                            order details here.
                        </p>

                        <button type="button" onClick={onBack}>
                            Browse menu
                            <FaArrowRight />
                        </button>
                    </section>
                ) : (
                    <>
                        <section className="orders-toolbar">
                            <div className="orders-search">
                                <FaSearch />

                                <input
                                    type="text"
                                    placeholder="Search orders..."
                                    value={searchTerm}
                                    onChange={(event) =>
                                        setSearchTerm(event.target.value)
                                    }
                                />

                                {searchTerm && (
                                    <button
                                        type="button"
                                        onClick={() => setSearchTerm("")}
                                        aria-label="Clear search"
                                    >
                                        ×
                                    </button>
                                )}
                            </div>

                            <div className="orders-filters">
                                <select
                                    value={statusFilter}
                                    onChange={(event) =>
                                        setStatusFilter(event.target.value)
                                    }
                                    aria-label="Filter by order status"
                                >
                                    <option value="All">All status</option>
                                    <option value="PENDING">Order placed</option>
                                    <option value="ACCEPTED">Accepted</option>
                                    <option value="PREPARING">Preparing</option>
                                    <option value="READY">Ready</option>
                                    <option value="COMPLETED">Completed</option>
                                    <option value="CANCELLED">Cancelled</option>
                                </select>

                                <select
                                    value={paymentFilter}
                                    onChange={(event) =>
                                        setPaymentFilter(event.target.value)
                                    }
                                    aria-label="Filter by payment method"
                                >
                                    <option value="All">All payments</option>
                                    <option value="Cash on Delivery">Cash</option>
                                    <option value="COD">COD</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                </select>

                                <select
                                    value={sortBy}
                                    onChange={(event) =>
                                        setSortBy(event.target.value)
                                    }
                                    aria-label="Sort orders"
                                >
                                    <option value="newest">Newest</option>
                                    <option value="oldest">Oldest</option>
                                    <option value="highest">Highest total</option>
                                    <option value="lowest">Lowest total</option>
                                </select>
                            </div>
                        </section>

                        <div className="orders-list-heading">
                            <span>{filteredAndSortedOrders.length} orders</span>

                            {hasActiveFilters && (
                                <button type="button" onClick={clearFilters}>
                                    Clear filters
                                </button>
                            )}
                        </div>

                        {filteredAndSortedOrders.length === 0 ? (
                            <section className="empty-orders compact">
                                <div className="empty-orders-icon">
                                    <FaSearch />
                                </div>
                                <h2>No matching orders</h2>
                                <p>Try changing your filters.</p>
                                <button type="button" onClick={clearFilters}>
                                    Clear filters
                                </button>
                            </section>
                        ) : (
                            <div className="orders-list">
                                {filteredAndSortedOrders.map((order, index) => (
                                    <section
                                        className="order-card"
                                        key={
                                            order.backendOrderId ??
                                            order.orderNumber ??
                                            order.id ??
                                            index
                                        }
                                        style={{ "--order-index": index }}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <div className="order-card-header">
                                            <div>
                                                <span>ORDER</span>

                                                <h2>
                                                    {order.orderNumber ||
                                                        (order.backendOrderId
                                                            ? `#${order.backendOrderId}`
                                                            : "Order")}
                                                </h2>

                                                <small>
                                                    {formatDateTime(order.createdAt)}
                                                </small>
                                            </div>

                                            <div className="order-header-actions">
                                                <span
                                                    className={`order-status status-${normalizeStatus(
                                                        order.status
                                                    ).toLowerCase()}`}
                                                >
                                                    {formatStatus(order.status)}
                                                </span>

                                                <button
                                                    type="button"
                                                    className="delete-order-btn"
                                                    onClick={(event) => {
                                                        event.stopPropagation();
                                                        deleteOrder(order.orderNumber);
                                                    }}
                                                    title="Delete order"
                                                    aria-label="Delete order"
                                                >
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </div>

                                        <OrderStatusTracker status={order.status} />

                                        <div className="order-card-details">
                                            <div>
                                                <span>Customer</span>
                                                <strong>
                                                    {order.name ||
                                                        order.customerName ||
                                                        "Customer"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Order type</span>
                                                <strong>
                                                    {order.orderType || "Not specified"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Payment</span>
                                                <strong>
                                                    {order.paymentMethod || "Not specified"}
                                                </strong>
                                            </div>

                                            <div>
                                                <span>Payment status</span>
                                                <strong>
                                                    {order.paymentStatus || "Not available"}
                                                </strong>
                                            </div>
                                        </div>

                                        <div className="order-card-items">
                                            {(order.items || []).map((item, itemIndex) => (
                                                <div
                                                    className="order-card-item"
                                                    key={item.id ?? itemIndex}
                                                >
                                                    <span>
                                                        {item.quantity || 1}
                                                        {" × "}
                                                        {item.name ||
                                                            item.menuItem?.name ||
                                                            "Item"}
                                                    </span>

                                                    <strong>
                                                        ₹
                                                        {(
                                                            Number(
                                                                item.price ??
                                                                    item.menuItem?.price ??
                                                                    0
                                                            ) * Number(item.quantity || 1)
                                                        ).toFixed(2)}
                                                    </strong>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-card-footer">
                                            <div>
                                                <span>TOTAL</span>
                                                <strong>
                                                    ₹
                                                    {Number(
                                                        order.total ??
                                                            order.totalAmount ??
                                                            0
                                                    ).toFixed(2)}
                                                </strong>
                                            </div>

                                            <span className="view-order-details">
                                                View details
                                                <FaArrowRight />
                                            </span>
                                        </div>
                                    </section>
                                ))}
                            </div>
                        )}

                        {orders.length > 0 && (
                            <button
                                type="button"
                                className="clear-orders-btn"
                                onClick={clearOrders}
                            >
                                <FaTrash />
                                Clear order history
                            </button>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}

export default Orders;
