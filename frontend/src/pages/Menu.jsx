
import { useEffect, useMemo, useState } from "react";
import {
  FiArrowDown,
  FiBell,
  FiChevronRight,
  FiClock,
  FiMapPin,
  FiMinus,
  FiPlus,
  FiShoppingBag,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { useParams } from "react-router-dom";

import Checkout from "./Checkout";
import OrderConfirmation from "./OrderConfirmation";
import Orders from "./Orders";
import Payment from "./Payment";

import "./Menu.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

const DEFAULT_CATEGORIES = [
  "All",
  "Paratha",
  "Combo",
  "Beverage",
  "Dessert",
];

const FALLBACK_RESTAURANT = {
  id: 1,
  name: "SAI PARATHAS & MORE",
  tagline: "Fresh • Delicious • Made With Love",
  footerDescription: "Fresh Indian food, made with love.",
  phone: "+91 8329498717",
  address: "Your Restaurant Address",
  openingHours: "Open Daily: 9:00 AM - 11:00 PM",
  instagramUrl: "",
  facebookUrl: "",
  whatsappUrl: "",
  logoUrl: "",
};

function formatPrice(value) {
  return `₹${Number(value || 0).toFixed(0)}`;
}

/**
 * Supports:
 * 1. Normal image URLs
 * 2. data:image/jpeg;base64,... data URLs
 * 3. Raw Base64 strings
 * 4. Base64 strings with whitespace/newlines
 */
function getMenuImageSource(item) {
  const possibleImage =
    item?.imageUrl ??
    item?.imageURL ??
    item?.image ??
    item?.photoUrl ??
    item?.photo ??
    "";

  if (typeof possibleImage !== "string") {
    return "";
  }

  const image = possibleImage.trim();

  if (!image) {
    return "";
  }

  if (
    image.startsWith("https://") ||
    image.startsWith("http://") ||
    image.startsWith("blob:") ||
    image.startsWith("/")
  ) {
    return image;
  }

  if (image.startsWith("data:image/")) {
    return image;
  }

  // Handle Base64 strings stored with a data URL prefix.
  if (image.startsWith("data:")) {
    const commaIndex = image.indexOf(",");

    if (commaIndex !== -1) {
      const metadata = image.slice(0, commaIndex);
      const payload = image.slice(commaIndex + 1);

      if (metadata.includes("base64") && payload.trim()) {
        return `${metadata},${payload.replace(/\s/g, "")}`;
      }
    }

    return "";
  }

  // Handle raw Base64 strings returned by the API.
  const normalized = image.replace(/\s/g, "");

  if (
    normalized.length > 100 &&
    /^[A-Za-z0-9+/]+={0,2}$/.test(normalized)
  ) {
    return `data:image/jpeg;base64,${normalized}`;
  }

  return image;
}

/**
 * Displays the actual menu item image.
 * If an image is unavailable, displays a clean placeholder
 * without category emojis or food icons.
 */
function FoodImage({
  item,
  className = "",
  compact = false,
}) {
  const [failed, setFailed] = useState(false);

  const imageSource = getMenuImageSource(item);

  useEffect(() => {
    setFailed(false);
  }, [imageSource]);

  const showPlaceholder = !imageSource || failed;

  return (
    <div
      className={[
        "food-image",
        compact ? "food-image-compact" : "",
        showPlaceholder ? "food-image-fallback" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      aria-label={`${item?.name || "Food item"} image`}
    >
      {!showPlaceholder ? (
        <img
          src={imageSource}
          alt={item?.name || "Food item"}
          loading="lazy"
          onError={() => setFailed(true)}
        />
      ) : (
        <div
          className="food-image-placeholder"
          aria-label="Food image unavailable"
        />
      )}
    </div>
  );
}

function Menu() {
  const { restaurantId } = useParams();
  const RESTAURANT_ID = Number(restaurantId) || 1;

  const [restaurant, setRestaurant] = useState(
    FALLBACK_RESTAURANT
  );
  const [menuItems, setMenuItems] = useState([]);

  const [selectedCategory, setSelectedCategory] = useState("All");
  const [cart, setCart] = useState([]);

  const [loading, setLoading] = useState(true);
  const [menuError, setMenuError] = useState("");

  const [showCart, setShowCart] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const [checkoutData, setCheckoutData] = useState(null);
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  const [notifications, setNotifications] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);

  const [scrollY, setScrollY] = useState(0);
  const [heroLoaded, setHeroLoaded] = useState(false);

  /* -----------------------------------------------------------
     LOAD RESTAURANT + MENU
  ----------------------------------------------------------- */
useEffect(() => {
  let mounted = true;
  let heroTimer;

  async function loadData() {
    setLoading(true);
    setMenuError("");

    try {
      const menuResponse = await fetch(
        `${API}/api/menu-items/restaurant/${RESTAURANT_ID}`
      );

      if (!menuResponse.ok) {
        throw new Error("Menu could not be loaded.");
      }

      const menuData = await menuResponse.json();

      if (!mounted) return;

      setMenuItems(Array.isArray(menuData) ? menuData : []);

      // Restaurant details are optional.
      try {
        const restaurantResponse = await fetch(
          `${API}/api/restaurants/${RESTAURANT_ID}`
        );

        if (restaurantResponse.ok) {
          const restaurantData = await restaurantResponse.json();

          if (mounted) {
            setRestaurant({
              ...FALLBACK_RESTAURANT,
              ...restaurantData,
            });
          }
        }
      } catch (error) {
        console.error("Restaurant details loading error:", error);
      }
    } catch (error) {
      console.error("Menu loading error:", error);

      if (mounted) {
        setMenuError(
          "Unable to load the latest menu. Please refresh the page."
        );
      }
    } finally {
      if (mounted) {
        setLoading(false);

        heroTimer = setTimeout(() => {
          setHeroLoaded(true);
        }, 100);
      }
    }
  }

  loadData();

  return () => {
    mounted = false;
    clearTimeout(heroTimer);
  };
}, [RESTAURANT_ID]);

  /* -----------------------------------------------------------
     PARALLAX
  ----------------------------------------------------------- */

  useEffect(() => {
    let ticking = false;
    let animationFrame;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;

      animationFrame = window.requestAnimationFrame(() => {
        setScrollY(window.scrollY);
        ticking = false;
      });
    };

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);

      if (animationFrame) {
        window.cancelAnimationFrame(animationFrame);
      }
    };
  }, []);

  /* -----------------------------------------------------------
     NOTIFICATIONS
  ----------------------------------------------------------- */

 
const loadNotifications = async () => {
  try {
    const response = await fetch(
      `${API}/api/notifications/restaurant/${RESTAURANT_ID}`
    );

    if (!response.ok) {
      throw new Error(
        `Could not load notifications (${response.status})`
      );
    }

    const data = await response.json();

    setNotifications(Array.isArray(data) ? data : []);
  } catch (error) {
    console.error("Notification loading error:", error);
  }
};

  useEffect(() => {
    loadNotifications();
  }, [RESTAURANT_ID]);

  /* -----------------------------------------------------------
     CATEGORIES
  ----------------------------------------------------------- */

  const categories = useMemo(() => {
    const databaseCategories = menuItems
      .map((item) => item.category)
      .filter(Boolean)
      .map((category) => category.trim());

    const uniqueCategories = [...new Set(databaseCategories)];

    return [
      "All",
      ...uniqueCategories.filter(
        (category) =>
          category.toLowerCase() !== "all" &&
          category.toLowerCase() !== "beverages" &&
          category.toLowerCase() !== "desserts"
      ),
    ];
  }, [menuItems]);

  const visibleCategories =
    categories.length > 1
      ? categories
      : DEFAULT_CATEGORIES;

  /* -----------------------------------------------------------
     FILTER MENU
  ----------------------------------------------------------- */

  const filteredItems = useMemo(() => {
    if (selectedCategory === "All") {
      return menuItems;
    }

    return menuItems.filter(
      (item) =>
        String(item.category || "").toLowerCase() ===
        selectedCategory.toLowerCase()
    );
  }, [menuItems, selectedCategory]);

  /* -----------------------------------------------------------
     CART
  ----------------------------------------------------------- */

  const cartCount = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total + Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const cartTotal = useMemo(
    () =>
      cart.reduce(
        (total, item) =>
          total +
          Number(item.price || 0) *
            Number(item.quantity || 0),
        0
      ),
    [cart]
  );

  const addToCart = (item) => {
    setCart((currentCart) => {
      const existing = currentCart.find(
        (cartItem) => cartItem.id === item.id
      );

      if (existing) {
        return currentCart.map((cartItem) =>
          cartItem.id === item.id
            ? {
                ...cartItem,
                quantity:
                  Number(cartItem.quantity || 0) + 1,
              }
            : cartItem
        );
      }

      return [
        ...currentCart,
        {
          ...item,
          quantity: 1,
        },
      ];
    });

    setSelectedItem(null);
  };

  const increaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart.map((item) =>
        item.id === id
          ? {
              ...item,
              quantity: Number(item.quantity || 0) + 1,
            }
          : item
      )
    );
  };

  const decreaseQuantity = (id) => {
    setCart((currentCart) =>
      currentCart
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity: Number(item.quantity || 0) - 1,
              }
            : item
        )
        .filter(
          (item) => Number(item.quantity || 0) > 0
        )
    );
  };

  const removeFromCart = (id) => {
    setCart((currentCart) =>
      currentCart.filter((item) => item.id !== id)
    );
  };

  /* -----------------------------------------------------------
     OVERLAY HELPERS
  ----------------------------------------------------------- */

  const closeAllOverlays = () => {
    setShowCart(false);
    setShowNotifications(false);
    setShowOrders(false);
    setShowCheckout(false);
    setShowPayment(false);
    setShowConfirmation(false);
    setSelectedItem(null);
  };

  const openCart = () => {
    setShowNotifications(false);
    setShowOrders(false);
    setShowCart(true);
  };

  const openNotifications = () => {
    setShowCart(false);
    setShowOrders(false);
    setShowNotifications(true);
  };

  const openOrders = () => {
    setShowCart(false);
    setShowNotifications(false);
    setShowOrders(true);
  };

  /* -----------------------------------------------------------
     CHECKOUT
  ----------------------------------------------------------- */

  const handleCheckout = () => {
    if (cart.length === 0) return;

    setShowCart(false);
    setShowCheckout(true);
  };

  const handleOrderPlaced = (order) => {
    if (!order) return;

    const paymentMethod = String(
      order.paymentMethod || ""
    ).toLowerCase();

    if (paymentMethod.includes("cash")) {
      setShowCheckout(false);
      setShowPayment(false);
      setCart([]);
      setConfirmedOrder(order);
      setShowConfirmation(true);

      loadNotifications();
      return;
    }

    setCheckoutData(order);
    setShowCheckout(false);
    setShowPayment(true);
  };

  const handlePaymentSuccess = (updatedOrder) => {
    if (!updatedOrder) return;

    setShowPayment(false);
    setCart([]);
    setConfirmedOrder(updatedOrder);
    setShowConfirmation(true);

    loadNotifications();

    try {
      const existingOrders = JSON.parse(
        localStorage.getItem("saiParathasOrders") || "[]"
      );

      const exists = existingOrders.some(
        (order) =>
          order.backendOrderId === updatedOrder.backendOrderId
      );

      const updatedOrders = exists
        ? existingOrders.map((order) =>
            order.backendOrderId === updatedOrder.backendOrderId
              ? updatedOrder
              : order
          )
        : [updatedOrder, ...existingOrders];

      localStorage.setItem(
        "saiParathasOrders",
        JSON.stringify(updatedOrders)
      );
    } catch (error) {
      console.error("Order history update error:", error);
    }
  };

  /* -----------------------------------------------------------
     NOTIFICATION COUNT
  ----------------------------------------------------------- */

  const unreadCount = notifications.filter(
    (notification) =>
      notification.read === false ||
      notification.isRead === false
  ).length;

  /* -----------------------------------------------------------
     KEYBOARD
  ----------------------------------------------------------- */

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;

      if (selectedItem) {
        setSelectedItem(null);
        return;
      }

      if (showConfirmation) {
        setShowConfirmation(false);
        return;
      }

      if (showPayment) {
        setShowPayment(false);
        return;
      }

      if (showCheckout) {
        setShowCheckout(false);
        return;
      }

      if (showOrders) {
        setShowOrders(false);
        return;
      }

      if (showNotifications) {
        setShowNotifications(false);
        return;
      }

      if (showCart) {
        setShowCart(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    selectedItem,
    showConfirmation,
    showPayment,
    showCheckout,
    showOrders,
    showNotifications,
    showCart,
  ]);

  /* -----------------------------------------------------------
     RENDER
  ----------------------------------------------------------- */

  return (
    <div className="menu-page">
      {/* TOP NAVIGATION */}

      <header className="site-nav">
        <button
          className="brand-button"
          onClick={() => {
            closeAllOverlays();
            window.scrollTo({
              top: 0,
              behavior: "smooth",
            });
          }}
        >
         {restaurant.logoUrl ? (
  <img
    className="brand-logo"
    src={restaurant.logoUrl}
    alt={`${restaurant.name} logo`}
    onError={(event) => {
      event.currentTarget.style.display = "none";
    }}
  />
) : (
  <span className="brand-mark">S</span>
)}

          <span className="brand-text">
            <strong>{restaurant.name}</strong>
            <small>
              {restaurant.tagline ||
                "Fresh • Delicious • Made With Love"}
            </small>
          </span>
        </button>

        <div className="nav-actions">
          <button
            className="nav-icon-button"
            onClick={openNotifications}
            aria-label="Notifications"
          >
            <FiBell />

            {unreadCount > 0 && (
              <span className="notification-dot">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          <button
            className="orders-button"
            onClick={openOrders}
          >
            <FiShoppingBag />
            <span>Orders</span>
          </button>

          <button
            className="cart-button"
            onClick={openCart}
          >
            <FiShoppingBag />
            <span>Cart</span>

            {cartCount > 0 && (
              <span className="cart-count">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </header>

      <main>
        {/* HERO */}

        <section
          className={`hero-section ${
            heroLoaded ? "hero-loaded" : ""
          }`}
        >
          <div
            className="hero-orbit orbit-one"
            style={{
              transform: `translate3d(0, ${
                scrollY * -0.18
              }px, 0) rotate(${scrollY * 0.03}deg)`,
            }}
          >
            ✦
          </div>

          <div
            className="hero-orbit orbit-two"
            style={{
              transform: `translate3d(0, ${
                scrollY * 0.12
              }px, 0) rotate(${scrollY * -0.04}deg)`,
            }}
          >
            +
          </div>

          <div
            className="hero-orbit orbit-three"
            style={{
              transform: `translate3d(0, ${
                scrollY * -0.1
              }px, 0)`,
            }}
          >
            ●
          </div>

          <div
            className="hero-orbit orbit-four"
            style={{
              transform: `translate3d(0, ${
                scrollY * 0.2
              }px, 0) rotate(${scrollY * 0.05}deg)`,
            }}
          >
            ✦
          </div>

          <div className="hero-shape shape-one" />
          <div className="hero-shape shape-two" />

          <div
            className="hero-content"
            style={{
              transform: `translate3d(0, ${
                scrollY * -0.08
              }px, 0)`,
            }}
          >
            <p className="hero-eyebrow">
              <span />
              FRESH • HOT • HOMEMADE
              <span />
            </p>

            <h1>
              GOOD FOOD,
              <em>GOOD MOOD.</em>
            </h1>

            <p className="hero-description">
              Something delicious is waiting for you.
            </p>

            <div className="hero-meta">
              <span>
                <FiClock />
                {restaurant.openingHours ||
                  "Open Daily: 9:00 AM - 11:00 PM"}
              </span>

              <span>
                <FiMapPin />
                {restaurant.address ||
                  "Your Restaurant Address"}
              </span>
            </div>

            <button
              className="hero-cta"
              onClick={() => {
                document
                  .getElementById("menu-section")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  });
              }}
            >
              <span>Explore menu</span>
              <FiArrowDown />
            </button>
          </div>

          <div className="hero-scroll">
            <span>SCROLL TO EXPLORE</span>
            <FiArrowDown />
          </div>
        </section>

        {/* MARQUEE */}

        <section className="marquee-section">
          <div className="marquee-track">
            <span>PARATHAS</span>
            <b>✦</b>
            <span>CHAAS</span>
            <b>✦</b>
            <span>COMBOS</span>
            <b>✦</b>
            <span>DESSERTS</span>
            <b>✦</b>
            <span>PARATHAS</span>
            <b>✦</b>
            <span>CHAAS</span>
            <b>✦</b>
            <span>COMBOS</span>
            <b>✦</b>
            <span>DESSERTS</span>
            <b>✦</b>
          </div>
        </section>

        {/* CATEGORIES */}

        <section className="category-section">
          <div className="section-intro">
            <span>A LITTLE SOMETHING</span>
            <h2>
              Pick your
              <br />
              <i>favourite.</i>
            </h2>
          </div>

          <div className="category-list">
            {visibleCategories.map((category, index) => (
              <button
                key={category}
                className={`category-pill ${
                  selectedCategory === category ? "active" : ""
                }`}
                onClick={() => setSelectedCategory(category)}
                style={{
                  "--category-delay": `${index * 60}ms`,
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </section>

        {/* MENU */}

        <section className="menu-section" id="menu-section">
          <div className="menu-heading">
            <div>
              <span>OUR MENU</span>
              <h2>
                Made with
                <br />
                <i>love.</i>
              </h2>
            </div>

            <div className="menu-count">
              {filteredItems.length}{" "}
              {filteredItems.length === 1 ? "item" : "items"}
            </div>
          </div>

          {menuError && (
            <div className="menu-error">
              <span>{menuError}</span>
              <button onClick={() => window.location.reload()}>
                Refresh
              </button>
            </div>
          )}

          {loading ? (
            <div className="menu-loading">
              <div className="loading-circle" />
              <p>Getting the good stuff...</p>
            </div>
          ) : filteredItems.length === 0 ? (
            <div className="empty-menu">
              <div className="empty-symbol">✦</div>
              <h3>
                Nothing here
                <br />
                yet.
              </h3>
              <p>Try another category or check back soon.</p>
            </div>
          ) : (
            <div className="menu-grid">
              {filteredItems.map((item, index) => (
                <article
                  className={`menu-card menu-card-${index % 4}`}
                  key={item.id}
                  style={{
                    "--card-delay": `${index * 70}ms`,
                  }}
                  onClick={() => setSelectedItem(item)}
                >
                  <div className="menu-card-top">
                    <span className="food-category">
                      {item.category || "Special"}
                    </span>
                  </div>

                  <FoodImage
                    item={item}
                    className="menu-card-image"
                  />

                  <div className="menu-card-middle">
                    <h3>{item.name}</h3>
                    <p>
                      {item.description ||
                        "Freshly made and delicious."}
                    </p>
                  </div>

                  <div className="menu-card-bottom">
                    <strong>{formatPrice(item.price)}</strong>

                    <button
                      className="add-button"
                      onClick={(event) => {
                        event.stopPropagation();
                        addToCart(item);
                      }}
                      aria-label={`Add ${item.name}`}
                    >
                      <FiPlus />
                      <span>Add</span>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* BRAND STATEMENT */}

        <section className="statement-section">
          <div
            className="statement-star"
            style={{
              transform: `translateY(${
                scrollY * -0.12
              }px) rotate(${scrollY * 0.08}deg)`,
            }}
          >
            ✦
          </div>

          <span>A LITTLE MORE</span>
          <h2>
            Made to make
            <br />
            you <i>hungry.</i>
          </h2>

          <p>
            Simple ingredients. Big flavours. The kind of
            food that turns a normal day into a good one.
          </p>

          <div className="statement-line">
            <span />
            <b>MADE WITH LOVE</b>
            <span />
          </div>
        </section>

        {/* MINI CATEGORY BUBBLES */}

        <section className="taste-section">
          <div className="taste-card taste-one">
            <div className="taste-icon" />
            <span>PARATHAS</span>
          </div>

          <div className="taste-card taste-two">
            <div className="taste-icon" />
            <span>CHAAS</span>
          </div>

          <div className="taste-card taste-three">
            <div className="taste-icon" />
            <span>COMBOS</span>
          </div>

          <div className="taste-card taste-four">
            <div className="taste-icon" />
            <span>SWEETS</span>
          </div>
        </section>
      </main>

      {/* FOOTER */}

      <footer className="site-footer">
        <div className="footer-main">
          <div className="footer-brand">
           {restaurant.logoUrl ? (
  <img
    className="footer-logo-image"
    src={restaurant.logoUrl}
    alt={`${restaurant.name} logo`}
    onError={(event) => {
      event.currentTarget.style.display = "none";
    }}
  />
) : (
  <div className="footer-logo">S</div>
)}

            <div>
              <h3>{restaurant.name}</h3>
              <p>
                {restaurant.tagline ||
                  "Fresh • Delicious • Made With Love"}
              </p>
            </div>
          </div>

          <p className="footer-description">
            {restaurant.footerDescription ||
              "Fresh Indian food, made with love."}
          </p>

          <div className="footer-details">
            {restaurant.address && (
              <div>
                <FiMapPin />
                <span>{restaurant.address}</span>
              </div>
            )}

            {restaurant.phone && (
              <div>
                <FiShoppingBag />
                <span>{restaurant.phone}</span>
              </div>
            )}

            {restaurant.openingHours && (
              <div>
                <FiClock />
                <span>{restaurant.openingHours}</span>
              </div>
            )}
          </div>

          <div className="footer-socials">
            {restaurant.instagramUrl && (
              <a
                href={restaurant.instagramUrl}
                target="_blank"
                rel="noreferrer"
              >
                Instagram
              </a>
            )}

            {restaurant.facebookUrl && (
              <a
                href={restaurant.facebookUrl}
                target="_blank"
                rel="noreferrer"
              >
                Facebook
              </a>
            )}

            {restaurant.whatsappUrl && (
              <a
                href={restaurant.whatsappUrl}
                target="_blank"
                rel="noreferrer"
              >
                WhatsApp
              </a>
            )}
          </div>
        </div>

        <div className="footer-bottom">
          <span>
            © {new Date().getFullYear()} {restaurant.name}
          </span>
          <span>Fresh • Delicious • Made With Love</span>
        </div>
      </footer>

      {/* STICKY CART */}

      {cartCount > 0 && (
        <div className="floating-cart">
          <div>
            <span>{cartCount} items</span>
            <strong>{formatPrice(cartTotal)}</strong>
          </div>

          <button onClick={openCart}>
            View cart
            <FiChevronRight />
          </button>
        </div>
      )}

      {/* CART DRAWER */}

      {showCart && (
        <div
          className="overlay-root"
          onClick={() => setShowCart(false)}
        >
          <aside
            className="cart-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span>YOUR ORDER</span>
                <h2>Your cart.</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowCart(false)}
                aria-label="Close cart"
              >
                <FiX />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="drawer-empty">
                <div>🛒</div>
                <h3>Your cart is empty.</h3>
                <p>Add something delicious.</p>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <FoodImage
                        item={item}
                        compact
                        className="cart-item-image"
                      />

                      <div className="cart-item-info">
                        <h3>{item.name}</h3>
                        <span>{formatPrice(item.price)}</span>

                        <div className="quantity-control">
                          <button
                            onClick={() => decreaseQuantity(item.id)}
                            aria-label={`Decrease ${item.name} quantity`}
                          >
                            <FiMinus />
                          </button>

                          <strong>{item.quantity}</strong>

                          <button
                            onClick={() => increaseQuantity(item.id)}
                            aria-label={`Increase ${item.name} quantity`}
                          >
                            <FiPlus />
                          </button>
                        </div>
                      </div>

                      <button
                        className="remove-cart-item"
                        onClick={() => removeFromCart(item.id)}
                        aria-label={`Remove ${item.name}`}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div>
                    <span>Subtotal</span>
                    <strong>{formatPrice(cartTotal)}</strong>
                  </div>

                  <button
                    className="checkout-button"
                    onClick={handleCheckout}
                  >
                    Continue to checkout
                    <FiChevronRight />
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* NOTIFICATION DRAWER */}

      {showNotifications && (
        <div
          className="overlay-root"
          onClick={() => setShowNotifications(false)}
        >
          <aside
            className="notification-drawer"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="drawer-header">
              <div>
                <span>UPDATES</span>
                <h2>Notifications.</h2>
              </div>

              <button
                className="close-button"
                onClick={() => setShowNotifications(false)}
                aria-label="Close notifications"
              >
                <FiX />
              </button>
            </div>

            {notifications.length === 0 ? (
              <div className="drawer-empty">
                <div>✦</div>
                <h3>No new updates.</h3>
                <p>
                  We'll let you know when something happens.
                </p>
              </div>
            ) : (
              <div className="notification-list">
                {notifications.map((notification, index) => (
                  <div
                    className="notification-card"
                    key={
                      notification.id ||
                      `notification-${index}`
                    }
                  >
                    <div className="notification-icon">
                      <FiBell />
                    </div>

                    <div>
                      <h3>{notification.title || "Update"}</h3>
                      <p>
                        {notification.message ||
                          notification.content ||
                          ""}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </aside>
        </div>
      )}

      {/* ITEM POPUP */}

      {selectedItem && (
        <div
          className="item-modal-overlay"
          onClick={() => setSelectedItem(null)}
        >
          <div
            className="item-modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="modal-close"
              onClick={() => setSelectedItem(null)}
              aria-label="Close item details"
            >
              <FiX />
            </button>

            <FoodImage
              item={selectedItem}
              className="item-modal-image"
            />

            <span className="modal-category">
              {selectedItem.category || "SPECIAL"}
            </span>

            <h2>{selectedItem.name}</h2>

            <p>
              {selectedItem.description ||
                "Freshly made and delicious."}
            </p>

            <div className="modal-bottom">
              <strong>{formatPrice(selectedItem.price)}</strong>

              <button onClick={() => addToCart(selectedItem)}>
                <FiPlus />
                Add to cart
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHECKOUT */}

      {showCheckout && (
        <div className="screen-layer">
          <Checkout
            cart={cart}
            total={cartTotal}
            restaurantId={RESTAURANT_ID}
            onBack={() => {
              setShowCheckout(false);
              setShowCart(true);
            }}
            onOrderPlaced={handleOrderPlaced}
          />
        </div>
      )}

      {/* PAYMENT */}

      {showPayment && (
        <div className="screen-layer">
          <Payment
            order={checkoutData}
            onBack={() => {
              setShowPayment(false);
              setShowCheckout(true);
            }}
            onPaymentComplete={handlePaymentSuccess}
          />
        </div>
      )}

      {/* ORDERS */}

      {showOrders && (
        <div className="screen-layer">
          <Orders
            restaurantId={RESTAURANT_ID}
            onBack={() => setShowOrders(false)}
          />
        </div>
      )}

      {/* ORDER CONFIRMATION */}

      {showConfirmation && (
        <div className="screen-layer confirmation-layer">
          <OrderConfirmation
            order={confirmedOrder}
            onClose={() => setShowConfirmation(false)}
            onViewOrders={() => {
              setShowConfirmation(false);
              setShowOrders(true);
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Menu;
