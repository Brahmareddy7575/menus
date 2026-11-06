import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  UtensilsCrossed,
  Store,
  ShoppingBag,
  Clock,
  User,
  LogIn,
  LogOut,
  Sparkles,
} from "lucide-react";

export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout, openAuthModal, quickDemoLogin } = useAuth();
  const { cartCount } = useCart();

  const isActive = (path) => location.pathname === path;

  return (
    <header className="navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <Link to="/foods" className="brand-logo">
          <div className="logo-icon-box">
            <UtensilsCrossed className="logo-icon" size={22} />
          </div>
          <div className="brand-text">
            <span className="brand-title">Cravee</span>
            <span className="brand-subtitle">Gourmet Delivery</span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="nav-links">
          <Link
            to="/restaurants"
            className={`nav-link ${isActive("/restaurants") ? "active" : ""}`}
          >
            <Store size={18} />
            <span>Restaurants</span>
          </Link>

          <Link
            to="/foods"
            className={`nav-link ${isActive("/foods") || isActive("/") ? "active" : ""}`}
          >
            <UtensilsCrossed size={18} />
            <span>Menu & Foods</span>
          </Link>

          {isAuthenticated && (
            <Link
              to="/orders"
              className={`nav-link ${isActive("/orders") ? "active" : ""}`}
            >
              <Clock size={18} />
              <span>My Orders</span>
            </Link>
          )}
        </nav>

        {/* Right Action Section */}
        <div className="nav-actions">
          {/* Cart Button with Count Badge */}
          <Link to="/cart" className="cart-btn" aria-label="View shopping cart">
            <ShoppingBag size={20} />
            <span className="cart-btn-label">Cart</span>
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </Link>

          {/* User Auth Section */}
          {isAuthenticated ? (
            <div className="user-profile-menu">
              <div className="user-chip">
                <div className="user-avatar">
                  <User size={16} />
                </div>
                <div className="user-details">
                  <span className="user-name">{user?.name || user?.username}</span>
                  <span className="user-tag">Member</span>
                </div>
              </div>
              <button
                onClick={logout}
                className="btn-logout"
                title="Sign Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <button
                onClick={quickDemoLogin}
                className="btn-demo-login"
                title="1-Click Demo Login"
              >
                <Sparkles size={15} />
                <span>Demo User</span>
              </button>

              <button
                onClick={() => openAuthModal("login")}
                className="btn-primary-signin"
              >
                <LogIn size={16} />
                <span>Sign In</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
