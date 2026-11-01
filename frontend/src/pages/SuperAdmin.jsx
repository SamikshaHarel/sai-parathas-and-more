
import { useEffect, useState } from "react";
import {
    FiBarChart2,
    FiBell,
    FiHome,
    FiLogOut,
    FiRefreshCw,
    FiSettings,
    FiUsers
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import "./SuperAdmin.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

function SuperAdmin() {
  const navigate = useNavigate();

  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadRestaurants = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API}/api/restaurants`);

      if (!response.ok) {
        throw new Error("Could not load restaurants");
      }

      const data = await response.json();
      setRestaurants(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load restaurants.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurants();
  }, []);

  const activeRestaurants = restaurants.filter(
    (restaurant) => restaurant.active
  ).length;

  const inactiveRestaurants = restaurants.filter(
    (restaurant) => !restaurant.active
  ).length;

  return (
    <div className="super-admin-layout">

      <aside className="super-admin-sidebar">

        <div className="super-admin-brand">
          <div className="super-admin-brand-icon">
            🍽️
          </div>

          <div>
            <strong>Sai Parathas</strong>
            <span>Platform Admin</span>
          </div>
        </div>

        <nav className="super-admin-nav">

          <p className="super-admin-section-title">
            PLATFORM
          </p>

          <button
            className="super-admin-link active"
            type="button"
          >
            <FiHome />
            <span>Dashboard</span>
          </button>

          <button
            className="super-admin-link"
            type="button"
            onClick={() =>
              document
                .getElementById("restaurants-section")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            <FiUsers />
            <span>Restaurants</span>
          </button>

          <button
            className="super-admin-link"
            type="button"
          >
            <FiBarChart2 />
            <span>Analytics</span>
            <small>SOON</small>
          </button>

          <button
            className="super-admin-link"
            type="button"
          >
            <FiBell />
            <span>Notifications</span>
            <small>SOON</small>
          </button>

          <p className="super-admin-section-title">
            MANAGEMENT
          </p>

          <button
            className="super-admin-link"
            type="button"
            onClick={() => navigate("/owner-admin")}
          >
            <FiSettings />
            <span>Owner Panel</span>
          </button>

        </nav>

        <div className="super-admin-sidebar-footer">

          <span>SUPER ADMIN</span>

          <strong>Platform Owner</strong>

          <button
            type="button"
            onClick={() => navigate("/")}
          >
            <FiLogOut />
            Exit
          </button>

        </div>

      </aside>

      <main className="super-admin-main">

        <header className="super-admin-header">

          <div>
            <p className="super-admin-label">
              SUPER ADMIN
            </p>

            <h1>Platform Dashboard</h1>

            <p>
              Manage restaurants and the Sai Parathas platform.
            </p>
          </div>

          <button
            className="super-admin-refresh"
            type="button"
            onClick={loadRestaurants}
          >
            <FiRefreshCw />
            Refresh
          </button>

        </header>

        <section className="super-admin-stats">

          <div className="super-admin-stat-card">
            <span>Total Restaurants</span>
            <strong>{restaurants.length}</strong>
          </div>

          <div className="super-admin-stat-card">
            <span>Active</span>
            <strong>{activeRestaurants}</strong>
          </div>

          <div className="super-admin-stat-card">
            <span>Inactive</span>
            <strong>{inactiveRestaurants}</strong>
          </div>

        </section>

        <section
          className="super-admin-restaurants"
          id="restaurants-section"
        >

          <div className="super-admin-section-heading">

            <div>
              <h2>Restaurants</h2>
              <p>
                All restaurants registered on the platform.
              </p>
            </div>

            <span className="super-admin-live">
              ● Live
            </span>

          </div>

          {error && (
            <div className="super-admin-message error">
              {error}
            </div>
          )}

          {loading ? (
            <div className="super-admin-message">
              Loading restaurants...
            </div>
          ) : restaurants.length === 0 ? (
            <div className="super-admin-message">
              No restaurants found.
            </div>
          ) : (
            <div className="restaurant-list">

              {restaurants.map((restaurant) => (

                <div
                  className="restaurant-card"
                  key={restaurant.id}
                >

                  <div className="restaurant-icon">
                    🍽️
                  </div>

                  <div className="restaurant-details">

                    <div className="restaurant-title-row">

                      <h3>
                        {restaurant.name}
                      </h3>

                      <span
                        className={
                          restaurant.active
                            ? "restaurant-status active"
                            : "restaurant-status inactive"
                        }
                      >
                        {restaurant.active
                          ? "ACTIVE"
                          : "INACTIVE"}
                      </span>

                    </div>

                    <p>
                      {restaurant.tagline ||
                        "No tagline added"}
                    </p>

                    <div className="restaurant-meta">

                      <span>
                        Restaurant #{restaurant.id}
                      </span>

                      {restaurant.phone && (
                        <span>
                          {restaurant.phone}
                        </span>
                      )}

                      {restaurant.address && (
                        <span>
                          {restaurant.address}
                        </span>
                      )}

                    </div>

                  </div>

                  <button
                    className="restaurant-manage-btn"
                    type="button"
                    onClick={() =>
                      navigate("/owner-admin")
                    }
                  >
                    Manage
                  </button>

                </div>

              ))}

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default SuperAdmin;
