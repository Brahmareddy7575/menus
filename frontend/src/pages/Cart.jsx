import { useState } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import API from "../services/api";
import { getFoodImage } from "../services/imageMap";
import {
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  ArrowRight,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  Tag,
  CreditCard,
  UtensilsCrossed,
} from "lucide-react";

export default function Cart() {
  const { cart, updateQuantity, removeFromCart, clearCart, showToast } = useCart();
  const { isAuthenticated, openAuthModal, user } = useAuth();

  const [address, setAddress] = useState("Flat 402, Sunshine Heights, Main Road, Guntur");
  const [addressType, setAddressType] = useState("Home");
  const [couponCode, setCouponCode] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(null);

  // If not logged in
  if (!isAuthenticated) {
    return (
      <div className="page-wrapper empty-page-wrapper">
        <div className="empty-cart-card">
          <div className="empty-icon-circle">
            <ShoppingBag size={48} />
          </div>
          <h2>Sign in to view your cart</h2>
          <p>
            Your delicious selections will be securely saved under your personal
            account.
          </p>
          <button
            onClick={() => openAuthModal("login")}
            className="btn-primary-action"
          >
            Sign In / Register
          </button>
        </div>
      </div>
    );
  }

  // If order was just placed successfully
  if (orderSuccess) {
    return (
      <div className="page-wrapper empty-page-wrapper">
        <div className="order-success-card">
          <div className="success-icon-box">
            <CheckCircle2 size={56} className="success-check-icon" />
          </div>
          <span className="success-pill">Order Confirmed</span>
          <h2>Thank you, {user?.name || user?.username}!</h2>
          <p className="order-id-text">Order ID #{orderSuccess.id}</p>
          <p className="order-summary-note">
            Your hot & fresh food order for{" "}
            <strong>₹{orderSuccess.total_amount}</strong> has been sent to{" "}
            <strong>{orderSuccess.restaurant_name || "the restaurant"}</strong>.
          </p>

          <div className="order-address-box">
            <MapPin size={18} />
            <span>Delivering to: {orderSuccess.delivery_address}</span>
          </div>

          <div className="success-actions">
            <Link to="/orders" className="btn-primary-action">
              <span>Track in My Orders</span>
              <ArrowRight size={16} />
            </Link>
            <Link to="/foods" className="btn-secondary-action">
              <span>Order More Food</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];

  if (items.length === 0) {
    return (
      <div className="page-wrapper empty-page-wrapper">
        <div className="empty-cart-card">
          <div className="empty-icon-circle">
            <ShoppingBag size={48} />
          </div>
          <h2>Your Cravee Cart is Empty</h2>
          <p>
            Explore our curated menu of mouthwatering biryanis, pizzas, and
            delicacies waiting for you.
          </p>
          <Link to="/foods" className="btn-primary-action">
            <UtensilsCrossed size={18} />
            <span>Browse Menu</span>
          </Link>
        </div>
      </div>
    );
  }

  const subtotal = items.reduce(
    (sum, item) => sum + Number(item.price) * item.quantity,
    0
  );
  const deliveryFee = subtotal > 500 ? 0 : 40;
  const platformFee = 5;
  const taxes = Math.round(subtotal * 0.05);
  const grandTotal = Math.max(
    0,
    subtotal + deliveryFee + platformFee + taxes - discount
  );

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (couponCode.trim().toUpperCase() === "CRAVEE50") {
      const discountVal = Math.min(100, Math.round(subtotal * 0.2));
      setDiscount(discountVal);
      setCouponApplied(true);
      showToast(`Coupon applied! Saved ₹${discountVal} 🎉`, "success");
    } else {
      showToast("Invalid coupon code. Try 'CRAVEE50'", "error");
    }
  };

  const handlePlaceOrder = async () => {
    if (!address.trim()) {
      showToast("Please enter a valid delivery address", "error");
      return;
    }

    setIsPlacingOrder(true);
    try {
      const res = await API.post("orders/", {
        delivery_address: `${addressType}: ${address}`,
      });
      setOrderSuccess(res.data.order);
      showToast("Order placed successfully! 🚀", "success");
    } catch (err) {
      console.error("Order placement failed:", err);
      showToast(
        err.response?.data?.error || "Could not place order. Please try again.",
        "error"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="page-wrapper cart-page">
      <div className="cart-header-title">
        <h1>Your Shopping Cart</h1>
        <p>Review items, address, and checkout for immediate kitchen preparation.</p>
      </div>

      <div className="cart-layout-grid">
        {/* Left Column: Cart Items & Address */}
        <div className="cart-left-col">
          {/* Items Card */}
          <div className="cart-panel items-panel">
            <div className="panel-title-row">
              <h2>Items ({items.length})</h2>
              <button
                onClick={clearCart}
                className="btn-clear-cart"
                title="Remove all items"
              >
                Clear Cart
              </button>
            </div>

            <div className="cart-items-list">
              {items.map((item) => {
                const foodMock = {
                  name: item.food_name,
                  image: item.food_image,
                  category_name: item.category_name,
                };

                return (
                  <div className="cart-item-row" key={item.id}>
                    <img
                      src={getFoodImage(foodMock)}
                      alt={item.food_name}
                      className="cart-item-thumb"
                    />

                    <div className="cart-item-info">
                      <h3 className="cart-item-name">{item.food_name}</h3>
                      {item.restaurant_name && (
                        <span className="cart-item-kitchen">
                          {item.restaurant_name}
                        </span>
                      )}
                      <span className="cart-item-unit-price">
                        ₹{item.price} each
                      </span>
                    </div>

                    <div className="cart-item-controls">
                      {/* Stepper */}
                      <div className="stepper-control small-stepper">
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.food,
                              item.quantity - 1
                            )
                          }
                          className="stepper-btn"
                          aria-label="Decrease"
                        >
                          <Minus size={13} />
                        </button>
                        <span className="stepper-val">{item.quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.food,
                              item.quantity + 1
                            )
                          }
                          className="stepper-btn"
                          aria-label="Increase"
                        >
                          <Plus size={13} />
                        </button>
                      </div>

                      <div className="cart-item-subtotal">
                        ₹{Number(item.price) * item.quantity}
                      </div>

                      <button
                        onClick={() => removeFromCart(item.id, item.food)}
                        className="btn-remove-item"
                        title="Remove from cart"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Delivery Address Card */}
          <div className="cart-panel address-panel">
            <div className="panel-title-row">
              <h2>
                <MapPin size={20} className="panel-icon" />
                Delivery Address
              </h2>
            </div>

            <div className="address-tags">
              {["Home", "Work", "Other"].map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={`address-tag-btn ${
                    addressType === tag ? "active" : ""
                  }`}
                  onClick={() => setAddressType(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>

            <textarea
              className="address-textarea"
              rows={3}
              placeholder="Enter complete building, street, landmark, and flat number..."
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {/* Right Column: Bill Details & Checkout */}
        <div className="cart-right-col">
          {/* Coupon Box */}
          <div className="cart-panel coupon-panel">
            <form onSubmit={handleApplyCoupon} className="coupon-form">
              <Tag size={18} className="coupon-icon" />
              <input
                type="text"
                placeholder="Promo Code (use: CRAVEE50)"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
              />
              <button type="submit" className="btn-apply-coupon">
                Apply
              </button>
            </form>
            {couponApplied && (
              <span className="coupon-success-msg">
                ✓ Coupon CRAVEE50 applied (-₹{discount})
              </span>
            )}
          </div>

          {/* Bill Summary */}
          <div className="cart-panel summary-panel">
            <h2>Bill Details</h2>

            <div className="bill-row">
              <span>Item Total</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>

            <div className="bill-row">
              <span>Delivery Partner Fee</span>
              <span>
                {deliveryFee === 0 ? (
                  <span className="free-tag">FREE</span>
                ) : (
                  `₹${deliveryFee}`
                )}
              </span>
            </div>

            <div className="bill-row">
              <span>Platform Fee</span>
              <span>₹{platformFee}</span>
            </div>

            <div className="bill-row">
              <span>GST & Restaurant Charges</span>
              <span>₹{taxes}</span>
            </div>

            {discount > 0 && (
              <div className="bill-row discount-row">
                <span>Promo Discount</span>
                <span>-₹{discount}</span>
              </div>
            )}

            <div className="bill-divider" />

            <div className="bill-row total-row">
              <span>To Pay</span>
              <span className="total-amount-display">₹{grandTotal.toFixed(2)}</span>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPlacingOrder}
              className="btn-checkout"
            >
              <CreditCard size={18} />
              <span>
                {isPlacingOrder
                  ? "Confirming Order..."
                  : `Place Order • ₹${grandTotal.toFixed(2)}`}
              </span>
            </button>

            <div className="secure-badge">
              <ShieldCheck size={16} />
              <span>Safe & Contactless Delivery Guaranteed</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}