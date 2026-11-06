import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { useAuth } from "../context/AuthContext";
import {
  Clock,
  Store,
  MapPin,
  CheckCircle,
  Package,
  Bike,
  UtensilsCrossed,
  RefreshCw,
  ArrowRight,
} from "lucide-react";

export default function Orders() {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await API.get("orders/");
      setOrders(res.data);
    } catch (err) {
      console.error("Failed to fetch order history:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isCancelled = false;
    if (isAuthenticated) {
      API.get("orders/")
        .then((res) => {
          if (!isCancelled) {
            setOrders(res.data);
          }
        })
        .catch((err) => {
          console.error("Failed to fetch order history:", err);
        })
        .finally(() => {
          if (!isCancelled) {
            setLoading(false);
          }
        });
    } else {
      queueMicrotask(() => {
        if (!isCancelled) {
          setLoading(false);
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="page-wrapper empty-page-wrapper">
        <div className="empty-cart-card">
          <div className="empty-icon-circle">
            <Clock size={48} />
          </div>
          <h2>Sign in to view your orders</h2>
          <p>Track your active food deliveries and view past invoices.</p>
          <button
            onClick={() => openAuthModal("login")}
            className="btn-primary-action"
          >
            Sign In Now
          </button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="status-badge status-delivered">
            <CheckCircle size={14} /> Delivered
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="status-badge status-delivery">
            <Bike size={14} /> Out for Delivery
          </span>
        );
      case "PREPARING":
        return (
          <span className="status-badge status-preparing">
            <Package size={14} /> Preparing
          </span>
        );
      case "ACCEPTED":
        return <span className="status-badge status-accepted">Accepted</span>;
      case "CANCELLED":
        return <span className="status-badge status-cancelled">Cancelled</span>;
      default:
        return <span className="status-badge status-placed">Order Placed</span>;
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="page-wrapper orders-page">
      <div className="orders-header">
        <div>
          <h1>My Orders History</h1>
          <p>Real-time order tracking and invoice records.</p>
        </div>
        <button
          onClick={fetchOrders}
          className="btn-refresh-orders"
          title="Refresh orders"
        >
          <RefreshCw size={16} />
          <span>Refresh</span>
        </button>
      </div>

      {loading ? (
        <div className="catalog-loading-state">
          <div className="spinner" />
          <p>Loading your orders...</p>
        </div>
      ) : orders.length === 0 ? (
        <div className="empty-orders-state">
          <UtensilsCrossed size={52} className="empty-icon" />
          <h2>No orders placed yet</h2>
          <p>Your culinary journey starts now. Pick from our chef specials!</p>
          <Link to="/foods" className="btn-primary-action">
            <span>Explore Menu</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order.id}>
              {/* Card Header */}
              <div className="order-card-header">
                <div className="order-main-info">
                  <div className="order-restaurant-row">
                    <Store size={18} className="order-store-icon" />
                    <h3>{order.restaurant_name || "Gourmet Kitchen"}</h3>
                  </div>
                  <span className="order-timestamp">
                    Order #{order.id} • {formatDate(order.created_at)}
                  </span>
                </div>

                <div className="order-status-box">
                  {getStatusBadge(order.status)}
                </div>
              </div>

              {/* Items List */}
              <div className="order-card-items">
                {order.items &&
                  order.items.map((item, idx) => (
                    <div className="order-item-line" key={idx}>
                      <span className="order-item-qty">{item.quantity}x</span>
                      <span className="order-item-name">{item.food_name}</span>
                      <span className="order-item-price">
                        ₹{Number(item.price) * item.quantity}
                      </span>
                    </div>
                  ))}
              </div>

              {/* Order Footer */}
              <div className="order-card-footer">
                <div className="order-address-snippet">
                  <MapPin size={15} />
                  <span>{order.delivery_address}</span>
                </div>

                <div className="order-total-box">
                  <span className="total-label">Total Paid:</span>
                  <span className="total-val">₹{order.total_amount}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
