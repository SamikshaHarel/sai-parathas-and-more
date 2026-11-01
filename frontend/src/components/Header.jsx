import { FaShoppingBag } from "react-icons/fa";

function Header({ cartCount, onCartClick }) {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="brand">
          <div className="brand-logo">SP</div>

          <div>
            <h1>Sai Parathas</h1>
            <span>& More</span>
          </div>
        </div>

        <button className="cart-button" onClick={onCartClick}>
          <FaShoppingBag />

          {cartCount > 0 && (
            <span className="cart-count">{cartCount}</span>
          )}
        </button>
      </div>
    </header>
  );
}

export default Header;