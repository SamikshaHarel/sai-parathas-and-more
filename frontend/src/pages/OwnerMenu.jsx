
import { useCallback, useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiPower,
  FiRefreshCw,
  FiTrash2,
  FiUpload,
  FiX,
} from "react-icons/fi";
import "./OwnerMenu.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const RESTAURANT_ID = 1;

const EMPTY_FORM = {
  name: "",
  description: "",
  price: "",
  category: "Paratha",
  imageUrl: "",
};

const CATEGORIES = ["Paratha", "Combo", "Beverage", "Dessert"];

async function getErrorMessage(response, fallbackMessage) {
  const responseText = await response.text();

  let serverMessage = responseText;

  if (responseText) {
    try {
      const data = JSON.parse(responseText);
      serverMessage =
        data?.message ||
        data?.error ||
        data?.detail ||
        responseText;
    } catch {
      // Keep the plain-text server response.
    }
  }

  switch (response.status) {
    case 401:
      return "Your session has expired. Please log in again.";

    case 403:
      return "Access denied. Please log in with the restaurant owner account.";

    case 404:
      return "The requested menu item or endpoint was not found. Refresh the menu and try again.";

    case 400:
      return serverMessage && serverMessage !== responseText
        ? serverMessage
        : "The menu item information is invalid. Please check the form.";

    case 413:
      return "The uploaded image or request is too large. Choose an image smaller than 5 MB.";

    case 500:
      return "The server encountered an error while saving the menu item. Check the Spring Boot terminal for the underlying exception.";

    default:
      return serverMessage || `${fallbackMessage} (HTTP ${response.status})`;
  }
}

function OwnerMenu() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  /* ================================
     LOAD ALL MENU ITEMS
  ================================= */

  const loadItems = useCallback(async () => {
    setLoading(true);

    try {
      setError("");

      const response = await fetch(
        `${API}/api/menu-items/restaurant/${RESTAURANT_ID}/all`,
        {
          method: "GET",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const message = await getErrorMessage(
          response,
          "Could not load menu items."
        );

        console.error("Menu loading failed:", {
          status: response.status,
          message,
        });

        throw new Error(message);
      }

      const data = await response.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Menu loading error:", err);
      setError(err.message || "Unable to load menu items.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  /* ================================
     FORM CHANGE
  ================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((oldForm) => ({
      ...oldForm,
      [name]: value,
    }));

    setError("");
  };

  /* ================================
     IMAGE UPLOAD
  ================================= */

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) return;

    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WEBP image.");
      event.target.value = "";
      return;
    }

    const maxSize = 5 * 1024 * 1024;

    if (file.size > maxSize) {
      setError("Image must be smaller than 5 MB.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        setError("Unable to read the selected image.");
        return;
      }

      setForm((oldForm) => ({
        ...oldForm,
        imageUrl: reader.result,
      }));

      setError("");
    };

    reader.onerror = () => {
      setError("Unable to read the selected image.");
    };

    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const removeImage = () => {
    setForm((oldForm) => ({
      ...oldForm,
      imageUrl: "",
    }));
    setError("");
  };

  /* ================================
     RESET FORM
  ================================= */

  const resetForm = () => {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setError("");
  };

  /* ================================
     SAVE / UPDATE MENU ITEM
  ================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const trimmedName = form.name.trim();
    const trimmedDescription = form.description.trim();
    const numericPrice = Number(form.price);

    if (!trimmedName) {
      setError("Item name is required.");
      return;
    }

    if (
      form.price === "" ||
      !Number.isFinite(numericPrice) ||
      numericPrice <= 0
    ) {
      setError("Enter a valid price greater than 0.");
      return;
    }

    if (!form.category) {
      setError("Please select a category.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        name: trimmedName,
        description: trimmedDescription,
        price: numericPrice,
        category: form.category,
        imageUrl: form.imageUrl || "",
      };

      const isEditing = editingId !== null;
      const url = isEditing
        ? `${API}/api/menu-items/${editingId}`
        : `${API}/api/menu-items/restaurant/${RESTAURANT_ID}`;

      const response = await fetch(url, {
        method: isEditing ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const responseText = await response.text();

        console.error("Menu save failed:", {
          status: response.status,
          statusText: response.statusText,
          response: responseText,
          editingId,
          url,
        });

        // Re-create a response-like object because its body has been read.
        const message = await getErrorMessage(
          new Response(responseText, {
            status: response.status,
            statusText: response.statusText,
          }),
          isEditing
            ? "Could not update menu item."
            : "Could not add menu item."
        );

        throw new Error(message);
      }

      // Read the response only if the server actually returned a body.
      if (response.status !== 204) {
        const responseText = await response.text();

        if (responseText) {
          try {
            JSON.parse(responseText);
          } catch {
            // The server may return a plain-text success message.
          }
        }
      }

      resetForm();
      await loadItems();
    } catch (err) {
      console.error("Menu save error:", err);
      setError(err.message || "Unable to save menu item.");
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     EDIT ITEM
  ================================= */

  const startEdit = (item) => {
    setEditingId(item.id);

    setForm({
      name: item.name || "",
      description: item.description || "",
      price: item.price ?? "",
      category: item.category || "Paratha",
      imageUrl: item.imageUrl || "",
    });

    setError("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  /* ================================
     DELETE ITEM
  ================================= */

  const deleteItem = async (id) => {
    const confirmed = window.confirm("Delete this menu item?");

    if (!confirmed) return;

    try {
      setError("");

      const response = await fetch(`${API}/api/menu-items/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!response.ok) {
        const responseText = await response.text();

        console.error("Menu delete failed:", {
          status: response.status,
          response: responseText,
          id,
        });

        const message = await getErrorMessage(
          new Response(responseText, {
            status: response.status,
            statusText: response.statusText,
          }),
          "Could not delete menu item."
        );

        throw new Error(message);
      }

      if (editingId === id) {
        resetForm();
      }

      await loadItems();
    } catch (err) {
      console.error("Menu delete error:", err);
      setError(err.message || "Unable to delete menu item.");
    }
  };

  /* ================================
     TOGGLE AVAILABILITY
  ================================= */

  const toggleAvailability = async (item) => {
    try {
      setError("");

      const nextAvailability = !item.available;

      const response = await fetch(
        `${API}/api/menu-items/${item.id}/availability?available=${nextAvailability}`,
        {
          method: "PATCH",
          credentials: "include",
        }
      );

      if (!response.ok) {
        const responseText = await response.text();

        console.error("Availability update failed:", {
          status: response.status,
          response: responseText,
          itemId: item.id,
        });

        const message = await getErrorMessage(
          new Response(responseText, {
            status: response.status,
            statusText: response.statusText,
          }),
          "Could not update availability."
        );

        throw new Error(message);
      }

      await loadItems();
    } catch (err) {
      console.error("Availability update error:", err);
      setError(
        err.message || "Unable to update menu item availability."
      );
    }
  };

  /* ================================
     UI
  ================================= */

  return (
    <div className="owner-menu">
      <header className="owner-menu-header">
        <div>
          <p className="owner-menu-label">OWNER PANEL</p>

          <h1>Menu Management</h1>

          <p className="owner-menu-subtitle">
            Add, edit and manage your restaurant menu
          </p>
        </div>

        <button
          className="owner-menu-refresh"
          onClick={loadItems}
          type="button"
          disabled={loading || saving}
        >
          <FiRefreshCw />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <main className="owner-menu-content">
        {error && (
          <div className="owner-menu-error" role="alert">
            {error}
          </div>
        )}

        <section className="menu-form-card">
          <div className="menu-form-heading">
            <div>
              <h2>
                {editingId !== null
                  ? "Edit Menu Item"
                  : "Add Menu Item"}
              </h2>

              <p>
                {editingId !== null
                  ? "Update the selected item."
                  : "Create a new item for your menu."}
              </p>
            </div>

            {editingId !== null && (
              <button
                className="cancel-edit-btn"
                onClick={resetForm}
                type="button"
                disabled={saving}
              >
                <FiX />
                Cancel
              </button>
            )}
          </div>

          <form className="menu-form" onSubmit={handleSubmit}>
            <div className="form-grid">
              <label>
                Item Name
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Cheese Paratha"
                  maxLength="100"
                  disabled={saving}
                  required
                />
              </label>

              <label>
                Price
                <input
                  name="price"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.price}
                  onChange={handleChange}
                  placeholder="e.g. 120"
                  disabled={saving}
                  required
                />
              </label>

              <label>
                Category
                <select
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  disabled={saving}
                  required
                >
                  {CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </label>

              <label className="description-field">
                Description
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe the item..."
                  rows="3"
                  maxLength="500"
                  disabled={saving}
                />
              </label>

              <div className="image-upload-field">
                <span className="image-upload-label">
                  Item Image
                </span>

                {form.imageUrl ? (
                  <div className="image-preview-box">
                    <img
                      src={form.imageUrl}
                      alt="Menu item preview"
                    />

                    <button
                      type="button"
                      className="remove-image-btn"
                      onClick={removeImage}
                      title="Remove image"
                      aria-label="Remove image"
                      disabled={saving}
                    >
                      <FiX />
                    </button>
                  </div>
                ) : (
                  <label className="upload-image-btn">
                    <FiUpload />

                    <span>Upload from Device</span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                      disabled={saving}
                    />
                  </label>
                )}

                <small>JPG, PNG or WEBP • Max 5 MB</small>
              </div>
            </div>

            <button
              className="save-menu-btn"
              type="submit"
              disabled={saving}
            >
              {editingId !== null ? (
                <>
                  <FiEdit2 />
                  {saving ? "Saving..." : "Update Item"}
                </>
              ) : (
                <>
                  <FiPlus />
                  {saving ? "Adding..." : "Add Item"}
                </>
              )}
            </button>
          </form>
        </section>

        <section className="menu-items-section">
          <div className="menu-items-heading">
            <div>
              <h2>Menu Items</h2>

              <p>
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="owner-menu-message">
              Loading menu...
            </div>
          ) : items.length === 0 ? (
            <div className="owner-menu-message">
              No menu items found.
            </div>
          ) : (
            <div className="owner-menu-list">
              {items.map((item) => (
                <article
                  className={
                    item.available
                      ? "owner-menu-item"
                      : "owner-menu-item unavailable"
                  }
                  key={item.id}
                >
                  <div className="owner-menu-item-main">
                    <div className="owner-menu-item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <span>🍽️</span>
                      )}
                    </div>

                    <div className="owner-menu-item-info">
                      <div className="item-name-row">
                        <h3>{item.name}</h3>

                        <span
                          className={
                            item.available
                              ? "available-badge"
                              : "unavailable-badge"
                          }
                        >
                          {item.available
                            ? "Available"
                            : "Unavailable"}
                        </span>
                      </div>

                      <p>{item.description || "No description"}</p>

                      <div className="item-meta">
                        <strong>
                          ₹{Number(item.price || 0).toFixed(0)}
                        </strong>

                        <span>{item.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="owner-menu-item-actions">
                    <button
                      className="menu-action edit"
                      onClick={() => startEdit(item)}
                      title="Edit item"
                      aria-label={`Edit ${item.name}`}
                      type="button"
                      disabled={saving}
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      className="menu-action power"
                      onClick={() => toggleAvailability(item)}
                      title={
                        item.available
                          ? "Mark unavailable"
                          : "Mark available"
                      }
                      aria-label={
                        item.available
                          ? `Mark ${item.name} unavailable`
                          : `Mark ${item.name} available`
                      }
                      type="button"
                      disabled={saving}
                    >
                      <FiPower />
                    </button>

                    <button
                      className="menu-action delete"
                      onClick={() => deleteItem(item.id)}
                      title="Delete item"
                      aria-label={`Delete ${item.name}`}
                      type="button"
                      disabled={saving}
                    >
                      <FiTrash2 />
                    </button>
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

export default OwnerMenu;
