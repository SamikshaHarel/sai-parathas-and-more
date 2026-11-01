
import { useEffect, useState } from "react";
import {
  FiEdit2,
  FiPlus,
  FiPower,
  FiRefreshCw,
  FiTrash2,
} from "react-icons/fi";
import "./OwnerOffers.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const RESTAURANT_ID = 1;

const EMPTY_FORM = {
  title: "",
  type: "PERCENTAGE",
  discount: "",
  validFrom: "",
  validUntil: "",
  message: "",
};

// Include the existing login session cookie in every API request.
const apiFetch = (url, options = {}) =>
  fetch(url, {
    ...options,
    credentials: "include",
  });

async function getApiError(response) {
  const body = await response.text();

  if (body) {
    try {
      const data = JSON.parse(body);
      return (
        data.message ||
        data.error ||
        data.detail ||
        body
      );
    } catch {
      return body;
    }
  }

  return `Request failed with status ${response.status}`;
}

function OwnerOffers() {
  const [offers, setOffers] = useState([]);
  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadOffers = async () => {
    setLoading(true);

    try {
      setError("");

      const response = await apiFetch(
        `${API}/api/offers/restaurant/${RESTAURANT_ID}`
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      const data = await response.json();

      if (!Array.isArray(data)) {
        throw new Error(
          "The server did not return an offers list."
        );
      }

      setOffers(data);
    } catch (err) {
      console.error("Load offers error:", err);
      setError(`Unable to load offers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOffers();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((oldForm) => ({
      ...oldForm,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setError("");
    setNotice("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setNotice("");

    if (!form.title.trim()) {
      setError("Offer title is required.");
      return;
    }

    const discount = Number(form.discount);

    if (
      form.discount === "" ||
      !Number.isFinite(discount) ||
      discount <= 0
    ) {
      setError("Enter a valid discount greater than zero.");
      return;
    }

    if (form.type === "PERCENTAGE" && discount > 100) {
      setError("Percentage discount cannot exceed 100%.");
      return;
    }

    if (!form.validFrom || !form.validUntil) {
      setError("Please select the offer validity period.");
      return;
    }

    const startDate = new Date(form.validFrom);
    const endDate = new Date(form.validUntil);

    if (
      Number.isNaN(startDate.getTime()) ||
      Number.isNaN(endDate.getTime())
    ) {
      setError("Please enter valid offer dates.");
      return;
    }

    if (endDate <= startDate) {
      setError("Offer end date must be after the start date.");
      return;
    }

    const payload = {
      title: form.title.trim(),
      type: form.type,
      discount,
      validFrom: form.validFrom,
      validUntil: form.validUntil,
      message: form.message.trim(),
      active: true,
    };

    try {
      setSaving(true);

      const isEditing = editingId !== null;

      const response = await apiFetch(
        isEditing
          ? `${API}/api/offers/${editingId}`
          : `${API}/api/offers/restaurant/${RESTAURANT_ID}`,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setForm(EMPTY_FORM);
      setEditingId(null);

      setNotice(
        isEditing
          ? "Offer updated successfully."
          : "Offer created successfully."
      );

      await loadOffers();
    } catch (err) {
      console.error("Save offer error:", err);
      setError(`Unable to save offer: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (offer) => {
    setEditingId(offer.id);
    setError("");
    setNotice("");

    setForm({
      title: offer.title || "",
      type: offer.type || "PERCENTAGE",
      discount: offer.discount ?? "",
      validFrom: offer.validFrom
        ? offer.validFrom.slice(0, 16)
        : "",
      validUntil: offer.validUntil
        ? offer.validUntil.slice(0, 16)
        : "",
      message: offer.message || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const toggleActive = async (offer) => {
    try {
      setError("");
      setNotice("");

      const response = await apiFetch(
        `${API}/api/offers/${offer.id}/active?active=${!offer.active}`,
        { method: "PATCH" }
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      setNotice(
        `Offer ${!offer.active ? "activated" : "deactivated"} successfully.`
      );

      await loadOffers();
    } catch (err) {
      console.error("Update offer status error:", err);
      setError(`Unable to update offer: ${err.message}`);
    }
  };

  const deleteOffer = async (id) => {
    if (!window.confirm("Delete this offer?")) {
      return;
    }

    try {
      setError("");
      setNotice("");

      const response = await apiFetch(
        `${API}/api/offers/${id}`,
        { method: "DELETE" }
      );

      if (!response.ok) {
        throw new Error(await getApiError(response));
      }

      if (editingId === id) {
        setForm(EMPTY_FORM);
        setEditingId(null);
      }

      setNotice("Offer deleted successfully.");
      await loadOffers();
    } catch (err) {
      console.error("Delete offer error:", err);
      setError(`Unable to delete offer: ${err.message}`);
    }
  };

  const formatDate = (value) => {
    if (!value) return "Not set";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "Invalid date";
    }

    return date.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
    });
  };

  const getDiscountText = (offer) => {
    const amount = Number(offer.discount);

    if (offer.type === "PERCENTAGE") {
      return `${amount.toFixed(0)}% OFF`;
    }

    return `₹${amount.toFixed(0)} OFF`;
  };

  return (
    <div className="owner-offers">
      <header className="offers-header">
        <div>
          <p className="offers-label">OWNER PANEL</p>
          <h1>Offer Generator</h1>
          <p className="offers-subtitle">
            Create and manage offers for your customers
          </p>
        </div>

        <button
          className="offers-refresh-btn"
          onClick={loadOffers}
          type="button"
          disabled={loading}
        >
          <FiRefreshCw />
          {loading ? "Loading..." : "Refresh"}
        </button>
      </header>

      <main className="offers-content">
        {error && (
          <div className="offers-error" role="alert">
            {error}
          </div>
        )}

        {notice && (
          <div className="offers-success" role="status">
            {notice}
          </div>
        )}

        <section className="offer-form-card">
          <div className="offer-form-heading">
            <div>
              <h2>
                {editingId !== null
                  ? "Edit Offer"
                  : "Create New Offer"}
              </h2>

              <p>
                {editingId !== null
                  ? "Update the selected offer."
                  : "Create a promotional offer for your customers."}
              </p>
            </div>

            {editingId !== null && (
              <button
                className="cancel-offer-btn"
                onClick={resetForm}
                type="button"
              >
                Cancel
              </button>
            )}
          </div>

          <form className="offer-form" onSubmit={handleSubmit}>
            <div className="offer-form-grid">
              <label>
                Offer Title
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="Weekend Special"
                  required
                />
              </label>

              <label>
                Discount Type
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                >
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FLAT">Flat Amount</option>
                </select>
              </label>

              <label>
                Discount
                <div className="discount-input">
                  <input
                    name="discount"
                    type="number"
                    min="0.01"
                    max={
                      form.type === "PERCENTAGE"
                        ? "100"
                        : undefined
                    }
                    step="any"
                    value={form.discount}
                    onChange={handleChange}
                    placeholder={
                      form.type === "PERCENTAGE" ? "20" : "50"
                    }
                    required
                  />

                  <span>
                    {form.type === "PERCENTAGE" ? "%" : "₹"}
                  </span>
                </div>
              </label>

              <label>
                Valid From
                <input
                  name="validFrom"
                  type="datetime-local"
                  value={form.validFrom}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Valid Until
                <input
                  name="validUntil"
                  type="datetime-local"
                  value={form.validUntil}
                  onChange={handleChange}
                  min={form.validFrom || undefined}
                  required
                />
              </label>

              <label className="offer-message-field">
                Customer Message
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="🔥 Get 20% OFF this weekend!"
                  rows="3"
                />
              </label>
            </div>

            <button
              className="create-offer-btn"
              type="submit"
              disabled={saving}
            >
              {editingId !== null ? (
                <>
                  <FiEdit2 />
                  {saving ? "Saving..." : "Update Offer"}
                </>
              ) : (
                <>
                  <FiPlus />
                  {saving ? "Creating..." : "Create Offer"}
                </>
              )}
            </button>
          </form>
        </section>

        <section className="offers-list-section">
          <div className="offers-list-heading">
            <div>
              <h2>Your Offers</h2>
              <p>
                {offers.length} offer
                {offers.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="offers-message">
              Loading offers...
            </div>
          ) : offers.length === 0 ? (
            <div className="offers-message">
              {error
                ? "Offers could not be loaded. Check the API error above and refresh."
                : "No offers created yet."}
            </div>
          ) : (
            <div className="offers-list">
              {offers.map((offer) => (
                <article
                  className={
                    offer.active
                      ? "offer-card"
                      : "offer-card inactive"
                  }
                  key={offer.id}
                >
                  <div className="offer-card-main">
                    <div className="offer-discount">
                      {getDiscountText(offer)}
                    </div>

                    <div className="offer-details">
                      <div className="offer-title-row">
                        <h3>{offer.title}</h3>

                        <span
                          className={
                            offer.active
                              ? "offer-active-badge"
                              : "offer-inactive-badge"
                          }
                        >
                          {offer.active ? "Active" : "Inactive"}
                        </span>
                      </div>

                      <p className="offer-message">
                        {offer.message || "No customer message"}
                      </p>

                      <div className="offer-dates">
                        <div>
                          <span>From</span>
                          <strong>
                            {formatDate(offer.validFrom)}
                          </strong>
                        </div>

                        <div>
                          <span>Until</span>
                          <strong>
                            {formatDate(offer.validUntil)}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="offer-actions">
                    <button
                      className="offer-action edit"
                      onClick={() => startEdit(offer)}
                      title="Edit offer"
                      aria-label="Edit offer"
                      type="button"
                    >
                      <FiEdit2 />
                    </button>

                    <button
                      className="offer-action power"
                      onClick={() => toggleActive(offer)}
                      title={
                        offer.active
                          ? "Deactivate offer"
                          : "Activate offer"
                      }
                      aria-label={
                        offer.active
                          ? "Deactivate offer"
                          : "Activate offer"
                      }
                      type="button"
                    >
                      <FiPower />
                    </button>

                    <button
                      className="offer-action delete"
                      onClick={() => deleteOffer(offer.id)}
                      title="Delete offer"
                      aria-label="Delete offer"
                      type="button"
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

export default OwnerOffers;
