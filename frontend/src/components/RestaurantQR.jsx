import { QRCodeCanvas } from "qrcode.react";
import { FaDownload, FaPrint } from "react-icons/fa";
import { restaurantData } from "../data/restaurantData";

const MENU_URL = "http://192.168.31.117:5173/";

function RestaurantQR() {
  const downloadQR = () => {
    const canvas = document.getElementById("restaurant-qr");

    if (!canvas) return;

    const pngUrl = canvas.toDataURL("image/png");

    const downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "sai-parathas-more-qr.png";
    downloadLink.click();
  };

  const printQR = () => {
    window.print();
  };

  return (
    <div className="restaurant-qr-page">
      <div className="restaurant-qr-card">
        <div className="restaurant-qr-header">
          <h1>{restaurantData.name}</h1>
          <p>{restaurantData.tagline}</p>
        </div>

        <div className="restaurant-qr-content">
          <div className="restaurant-qr-title">
            <h2>Scan to View Menu & Order</h2>
            <p>Point your phone camera at the QR code</p>
          </div>

          <div className="restaurant-qr-code">
            <QRCodeCanvas
              id="restaurant-qr"
              value={MENU_URL}
              size={280}
              bgColor="#ffffff"
              fgColor="#111111"
              level="H"
              includeMargin
            />
          </div>

          <p className="restaurant-qr-url">{MENU_URL}</p>

          <div className="restaurant-qr-actions no-print">
            <button
              type="button"
              className="restaurant-qr-download-btn"
              onClick={downloadQR}
            >
              <FaDownload />
              Download QR
            </button>

            <button
              type="button"
              className="restaurant-qr-print-btn"
              onClick={printQR}
            >
              <FaPrint />
              Print QR
            </button>
          </div>
        </div>

        <div className="restaurant-qr-footer">
          <strong>{restaurantData.name}</strong>
          <span>Fresh • Delicious • Made With Love</span>
          <small>Scan • Browse • Order</small>
        </div>
      </div>
    </div>
  );
}

export default RestaurantQR;