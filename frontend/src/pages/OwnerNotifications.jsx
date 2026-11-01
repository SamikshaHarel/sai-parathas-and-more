import { useEffect, useState } from "react";
import {
    FiBell,
    FiCheck,
    FiRefreshCw,
    FiTrash2,
} from "react-icons/fi";
import "./OwnerNotifications.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const RESTAURANT_ID = 1;

function OwnerNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(null);

  const loadNotifications = async () => {
    try {
      setError("");

      const response = await fetch(
        `${API}/api/notifications/restaurant/${RESTAURANT_ID}`
      );

      if (!response.ok) {
        throw new Error("Could not load notifications");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const unreadCount = notifications.filter(
    (notification) => !notification.read
  ).length;

  const markAsRead = async (id) => {
    try {
      setUpdating(id);
      setError("");

      const response = await fetch(
        `${API}/api/notifications/${id}/read`,
        {
          method: "PATCH",
        }
      );

      if (!response.ok) {
        throw new Error("Could not mark notification as read");
      }

      const updated = await response.json();

      setNotifications((oldNotifications) =>
        oldNotifications.map((notification) =>
          notification.id === updated.id
            ? updated
            : notification
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to mark notification as read.");
    } finally {
      setUpdating(null);
    }
  };

  const markAllAsRead = async () => {
    const unreadNotifications = notifications.filter(
      (notification) => !notification.read
    );

    for (const notification of unreadNotifications) {
      await markAsRead(notification.id);
    }
  };

  const deleteNotification = async (id) => {
    const confirmed = window.confirm(
      "Delete this notification?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setUpdating(id);
      setError("");

      const response = await fetch(
        `${API}/api/notifications/${id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        throw new Error("Could not delete notification");
      }

      setNotifications((oldNotifications) =>
        oldNotifications.filter(
          (notification) => notification.id !== id
        )
      );
    } catch (err) {
      console.error(err);
      setError("Unable to delete notification.");
    } finally {
      setUpdating(null);
    }
  };

  const formatDate = (value) => {
    if (!value) {
      return "Unknown time";
    }

    return new Date(value).toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  return (
    <div className="owner-notifications">

      {/* Header */}

      <header className="owner-notifications-header">

        <div>
          <p className="owner-notifications-label">
            OWNER PANEL
          </p>

          <h1>
            Notifications
          </h1>

          <p className="owner-notifications-subtitle">
            View updates and promotional notifications
          </p>
        </div>

        <div className="owner-notifications-header-actions">

          <button
            className="owner-notifications-refresh"
            onClick={loadNotifications}
            type="button"
          >
            <FiRefreshCw />
            Refresh
          </button>

        </div>

      </header>

      <main className="owner-notifications-content">

        {/* Error */}

        {error && (
          <div className="owner-notifications-error">
            {error}
          </div>
        )}

        {/* Summary */}

        <section className="notification-summary">

          <div className="notification-summary-icon">
            <FiBell />
          </div>

          <div>
            <span>Total Notifications</span>

            <strong>
              {notifications.length}
            </strong>
          </div>

          <div className="notification-summary-divider"></div>

          <div>
            <span>Unread</span>

            <strong>
              {unreadCount}
            </strong>
          </div>

          {unreadCount > 0 && (
            <button
              className="mark-all-read-btn"
              onClick={markAllAsRead}
              type="button"
            >
              <FiCheck />
              Mark all as read
            </button>
          )}

        </section>

        {/* Notifications */}

        <section className="owner-notification-list-section">

          <div className="owner-notification-list-heading">

            <div>
              <p>UPDATES</p>

              <h2>
                Notification Center
              </h2>
            </div>

            {unreadCount > 0 && (
              <span className="unread-count-badge">
                {unreadCount} unread
              </span>
            )}

          </div>

          {loading ? (
            <div className="owner-notification-message">
              Loading notifications...
            </div>
          ) : notifications.length === 0 ? (
            <div className="owner-notification-empty">

              <div className="empty-notification-icon">
                <FiBell />
              </div>

              <h3>
                No notifications yet
              </h3>

              <p>
                Notifications generated from offers
                will appear here.
              </p>

            </div>
          ) : (
            <div className="owner-notification-list">

              {notifications.map((notification) => (

                <article
                  className={
                    notification.read
                      ? "owner-notification-card"
                      : "owner-notification-card unread"
                  }
                  key={notification.id}
                >

                  <div className="owner-notification-icon">
                    <FiBell />
                  </div>

                  <div className="owner-notification-body">

                    <div className="owner-notification-title-row">

                      <div>
                        <h3>
                          {notification.title}
                        </h3>

                        {!notification.read && (
                          <span className="new-notification-label">
                            NEW
                          </span>
                        )}
                      </div>

                      <span className="owner-notification-date">
                        {formatDate(
                          notification.createdAt
                        )}
                      </span>

                    </div>

                    <p className="owner-notification-message">
                      {notification.message ||
                        "No message provided."}
                    </p>

                    <div className="owner-notification-actions">

                      {!notification.read && (
                        <button
                          className="notification-read-btn"
                          onClick={() =>
                            markAsRead(notification.id)
                          }
                          disabled={
                            updating === notification.id
                          }
                          type="button"
                        >
                          <FiCheck />

                          {updating === notification.id
                            ? "Updating..."
                            : "Mark as read"}
                        </button>
                      )}

                      <button
                        className="notification-delete-btn"
                        onClick={() =>
                          deleteNotification(
                            notification.id
                          )
                        }
                        disabled={
                          updating === notification.id
                        }
                        type="button"
                      >
                        <FiTrash2 />
                        Delete
                      </button>

                    </div>

                  </div>

                </article>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default OwnerNotifications;