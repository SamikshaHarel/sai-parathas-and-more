
import { useEffect, useState } from "react";
import {
  FiSave,
  FiRefreshCw,
  FiDownload,
  FiPrinter,
  FiCopy,
  FiCheck,
  FiUpload,
  FiX,
  FiInstagram,
  FiFacebook,
  FiMessageCircle,
} from "react-icons/fi";
import { QRCodeCanvas } from "qrcode.react";
import "./RestaurantSettings.css";

const API = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";
const RESTAURANT_ID = 1;

const EMPTY_FORM = {
  name: "",
  tagline: "",
  phone: "",
  email: "",
  address: "",
  openingHours: "",
  logoUrl: "",
  footerDescription: "",
  instagramUrl: "",
  facebookUrl: "",
  whatsappUrl: "",
};

function RestaurantSettings() {
  const [form, setForm] = useState(EMPTY_FORM);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const customerMenuUrl = `${window.location.origin}/`;

  /* ================================
     LOAD RESTAURANT
  ================================= */

  const loadRestaurant = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `${API}/api/restaurants/${RESTAURANT_ID}`
      );

      if (!response.ok) {
        throw new Error(
          "Unable to load restaurant details."
        );
      }

      const data = await response.json();

      setForm({
        name: data.name || "",
        tagline: data.tagline || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        openingHours: data.openingHours || "",
        logoUrl: data.logoUrl || "",
        footerDescription:
          data.footerDescription || "",
        instagramUrl: data.instagramUrl || "",
        facebookUrl: data.facebookUrl || "",
        whatsappUrl: data.whatsappUrl || "",
      });
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Unable to load restaurant details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRestaurant();
  }, []);

  /* ================================
     FORM CHANGE
  ================================= */

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((oldForm) => ({
      ...oldForm,
      [name]: value,
    }));

    setSaved(false);
    setError("");
  };

  /* ================================
     LOGO UPLOAD
  ================================= */

  const handleLogoChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError(
        "Please select a valid image file."
      );
      event.target.value = "";
      return;
    }

    const maxSize = 2 * 1024 * 1024;

    if (file.size > maxSize) {
      setError(
        "Logo must be smaller than 2 MB."
      );
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm((oldForm) => ({
        ...oldForm,
        logoUrl: reader.result,
      }));

      setSaved(false);
      setError("");
    };

    reader.onerror = () => {
      setError(
        "Unable to read the selected logo."
      );
    };

    reader.readAsDataURL(file);
  };

  const removeLogo = () => {
    setForm((oldForm) => ({
      ...oldForm,
      logoUrl: "",
    }));

    setSaved(false);
  };

  /* ================================
     SAVE
  ================================= */

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!form.name.trim()) {
      setError(
        "Restaurant name is required."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");
      setSaved(false);

      const payload = {
        name: form.name.trim(),
        tagline: form.tagline.trim(),
        phone: form.phone.trim(),
        email: form.email.trim(),
        address: form.address.trim(),
        openingHours:
          form.openingHours.trim(),

        logoUrl: form.logoUrl || "",

        footerDescription:
          form.footerDescription.trim(),

        instagramUrl:
          form.instagramUrl.trim(),

        facebookUrl:
          form.facebookUrl.trim(),

        whatsappUrl:
          form.whatsappUrl.trim(),

        active: true,
      };

      const response = await fetch(
        `${API}/api/restaurants/${RESTAURANT_ID}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify(payload),
        }
      );

      if (!response.ok) {
        let message =
          "Unable to save restaurant details.";

        try {
          const data = await response.json();

          if (data?.message) {
            message = data.message;
          }
        } catch {
          // Ignore non-JSON response
        }

        if (response.status === 401) {
          message =
            "Your session has expired. Please log in again.";
        }

        if (response.status === 403) {
          message =
            "You do not have permission to update restaurant settings.";
        }

        throw new Error(message);
      }

      const data = await response.json();

      setForm({
        name: data.name || "",
        tagline: data.tagline || "",
        phone: data.phone || "",
        email: data.email || "",
        address: data.address || "",
        openingHours:
          data.openingHours || "",
        logoUrl: data.logoUrl || "",
        footerDescription:
          data.footerDescription || "",
        instagramUrl:
          data.instagramUrl || "",
        facebookUrl:
          data.facebookUrl || "",
        whatsappUrl:
          data.whatsappUrl || "",
      });

      setSaved(true);
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
          "Unable to save restaurant details."
      );
    } finally {
      setSaving(false);
    }
  };

  /* ================================
     DOWNLOAD QR
  ================================= */

  const downloadQR = () => {
    const canvas =
      document.getElementById(
        "restaurant-qr"
      );

    if (!canvas) {
      return;
    }

    const image =
      canvas.toDataURL("image/png");

    const link =
      document.createElement("a");

    link.download =
      "sai-parathas-customer-qr.png";

    link.href = image;

    link.click();
  };

  /* ================================
     PRINT QR
  ================================= */

  const printQR = () => {
    const canvas =
      document.getElementById(
        "restaurant-qr"
      );

    if (!canvas) {
      return;
    }

    const image =
      canvas.toDataURL("image/png");

    const printWindow =
      window.open(
        "",
        "_blank",
        "width=700,height=800"
      );

    if (!printWindow) {
      setError(
        "Please allow pop-ups to print the QR code."
      );
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>
            ${form.name || "Restaurant"} - QR Code
          </title>

          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
              text-align: center;
            }

            .print-container {
              padding: 40px;
            }

            h1 {
              margin: 0 0 8px;
              font-size: 30px;
            }

            p {
              margin: 0 0 25px;
              color: #666;
            }

            img {
              width: 320px;
              height: 320px;
            }

            .scan {
              margin-top: 22px;
              font-size: 18px;
              font-weight: bold;
            }
          </style>
        </head>

        <body>
          <div class="print-container">

            <h1>
              ${form.name || "Restaurant"}
            </h1>

            <p>
              Scan to view menu and place your order
            </p>

            <img
              src="${image}"
              alt="Restaurant QR Code"
            />

            <div class="scan">
              Scan to Order
            </div>

          </div>
        </body>
      </html>
    `);

    printWindow.document.close();

    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  /* ================================
     COPY MENU LINK
  ================================= */

  const copyMenuLink = async () => {
    try {
      await navigator.clipboard.writeText(
        customerMenuUrl
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to copy the menu link."
      );
    }
  };

  /* ================================
     LOADING
  ================================= */

  if (loading) {
    return (
      <div className="restaurant-settings">
        <div className="settings-message">
          Loading restaurant settings...
        </div>
      </div>
    );
  }

  /* ================================
     UI
  ================================= */

  return (
    <div className="restaurant-settings">

      <header className="settings-header">

        <div>
          <p className="settings-label">
            OWNER PANEL
          </p>

          <h1>
            Restaurant Settings
          </h1>

          <p className="settings-subtitle">
            Manage your restaurant identity,
            customer information and footer
          </p>
        </div>

        <button
          className="settings-refresh-btn"
          onClick={loadRestaurant}
          type="button"
          disabled={saving}
        >
          <FiRefreshCw />
          Refresh
        </button>

      </header>

      <main className="settings-content">

        {error && (
          <div className="settings-error">
            {error}
          </div>
        )}

        {/* ================================
            RESTAURANT INFORMATION
        ================================= */}

        <section className="settings-card">

          <div className="settings-card-heading">

            <div>
              <h2>
                Restaurant Information
              </h2>

              <p>
                This information is shown to your customers.
              </p>
            </div>

          </div>

          <form
            className="settings-form"
            onSubmit={handleSubmit}
          >

            <div className="settings-grid">

              <label>
                Restaurant Name

                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Sai Parathas & More"
                  disabled={saving}
                  required
                />
              </label>

              <label>
                Tagline

                <input
                  name="tagline"
                  value={form.tagline}
                  onChange={handleChange}
                  placeholder="Delicious parathas, made fresh"
                  disabled={saving}
                />
              </label>

              <label>
                Phone

                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  placeholder="Restaurant phone"
                  disabled={saving}
                />
              </label>

              <label>
                Email

                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="restaurant@email.com"
                  disabled={saving}
                />
              </label>

              <label className="full-width">
                Address

                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Restaurant address"
                  rows="3"
                  disabled={saving}
                />
              </label>

              <label className="full-width">
                Opening Hours

                <input
                  name="openingHours"
                  value={form.openingHours}
                  onChange={handleChange}
                  placeholder="10:00 AM - 11:00 PM"
                  disabled={saving}
                />
              </label>

            </div>

            {/* ================================
                BRANDING
            ================================= */}

            <div className="settings-subsection">

              <div className="settings-subsection-heading">

                <div>
                  <h3>
                    Restaurant Logo
                  </h3>

                  <p>
                    Add your restaurant logo.
                    It will appear on the customer menu.
                  </p>
                </div>

              </div>

              <div className="logo-management">

                {form.logoUrl ? (

                  <div className="logo-preview">

                    <img
                      src={form.logoUrl}
                      alt="Restaurant logo preview"
                    />

                    <button
                      type="button"
                      className="remove-logo-btn"
                      onClick={removeLogo}
                      disabled={saving}
                      title="Remove logo"
                      aria-label="Remove restaurant logo"
                    >
                      <FiX />
                    </button>

                  </div>

                ) : (

                  <label className="logo-upload-box">

                    <FiUpload />

                    <strong>
                      Upload Logo
                    </strong>

                    <span>
                      Choose an image from your device
                    </span>

                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleLogoChange}
                      disabled={saving}
                    />

                  </label>

                )}

                <div className="logo-upload-info">

                  <strong>
                    Recommended
                  </strong>

                  <span>
                    Square PNG or WEBP
                  </span>

                  <span>
                    Maximum 2 MB
                  </span>

                </div>

              </div>

            </div>

            {/* ================================
                FOOTER
            ================================= */}

            <div className="settings-subsection">

              <div className="settings-subsection-heading">

                <div>
                  <h3>
                    Customer Footer
                  </h3>

                  <p>
                    Manage the information customers
                    see at the bottom of your menu.
                  </p>
                </div>

              </div>

              <div className="settings-grid">

                <label className="full-width">
                  Footer Description

                  <textarea
                    name="footerDescription"
                    value={form.footerDescription}
                    onChange={handleChange}
                    placeholder="Fresh food, warm service and delicious moments."
                    rows="3"
                    maxLength="500"
                    disabled={saving}
                  />

                  <small>
                    A short description about your restaurant.
                  </small>
                </label>

                <label>
                  <span className="field-icon">
                    <FiInstagram />
                    Instagram
                  </span>

                  <input
                    name="instagramUrl"
                    value={form.instagramUrl}
                    onChange={handleChange}
                    placeholder="https://instagram.com/yourrestaurant"
                    disabled={saving}
                  />
                </label>

                <label>
                  <span className="field-icon">
                    <FiFacebook />
                    Facebook
                  </span>

                  <input
                    name="facebookUrl"
                    value={form.facebookUrl}
                    onChange={handleChange}
                    placeholder="https://facebook.com/yourrestaurant"
                    disabled={saving}
                  />
                </label>

                <label>
                  <span className="field-icon">
                    <FiMessageCircle />
                    WhatsApp
                  </span>

                  <input
                    name="whatsappUrl"
                    value={form.whatsappUrl}
                    onChange={handleChange}
                    placeholder="https://wa.me/919999999999"
                    disabled={saving}
                  />
                </label>

              </div>

            </div>

            {/* ================================
                SAVE
            ================================= */}

            <div className="settings-form-footer">

              <button
                className="save-settings-btn"
                type="submit"
                disabled={saving}
              >
                <FiSave />

                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>

              {saved && (
                <span className="saved-message">
                  <FiCheck />
                  Changes saved
                </span>
              )}

            </div>

          </form>

        </section>

        {/* ================================
            QR CODE
        ================================= */}

        <section className="qr-card">

          <div className="qr-info">

            <p className="qr-label">
              CUSTOMER QR CODE
            </p>

            <h2>
              Let customers scan & order
            </h2>

            <p>
              Place this QR code on your tables,
              counter, packaging or promotional material.
            </p>

            <div className="menu-link-box">

              <span>
                Customer Menu
              </span>

              <strong>
                {customerMenuUrl}
              </strong>

            </div>

            <div className="qr-actions">

              <button
                className="qr-action-btn primary"
                onClick={downloadQR}
                type="button"
              >
                <FiDownload />
                Download QR
              </button>

              <button
                className="qr-action-btn"
                onClick={printQR}
                type="button"
              >
                <FiPrinter />
                Print QR
              </button>

              <button
                className="qr-action-btn"
                onClick={copyMenuLink}
                type="button"
              >
                {copied ? (
                  <FiCheck />
                ) : (
                  <FiCopy />
                )}

                {copied
                  ? "Copied"
                  : "Copy Menu Link"}
              </button>

            </div>

          </div>

          <div className="qr-preview">

            <div className="qr-box">

              <QRCodeCanvas
                id="restaurant-qr"
                value={customerMenuUrl}
                size={260}
                level="H"
                includeMargin={true}
              />

            </div>

            <p>
              Scan to Order
            </p>

          </div>

        </section>

      </main>

    </div>
  );
}

export default RestaurantSettings;
