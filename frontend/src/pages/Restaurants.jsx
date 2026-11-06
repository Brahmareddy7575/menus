import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import API from "../services/api";
import { getRestaurantImage } from "../services/imageMap";
import {
  Store,
  MapPin,
  Phone,
  Clock,
  Star,
  UtensilsCrossed,
  ArrowRight,
  Search,
} from "lucide-react";

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true);
        const res = await API.get("restaurants/");
        setRestaurants(res.data);
      } catch (err) {
        console.error("Failed to load restaurants:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  const filteredRestaurants = restaurants.filter(
    (r) =>
      r.name.toLowerCase().includes(search.toLowerCase()) ||
      r.address.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="page-wrapper restaurants-page">
      {/* Page Title & Search Header */}
      <div className="restaurants-header">
        <div className="header-text">
          <div className="badge-chip">
            <Store size={15} />
            <span>Featured Kitchens</span>
          </div>
          <h1>Gourmet Restaurants & Cloud Kitchens</h1>
          <p>
            Handpicked culinary destinations preparing authentic flavors with the
            freshest local ingredients.
          </p>
        </div>

        {/* Search Bar */}
        <div className="restaurant-search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by restaurant name, cuisine, or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="catalog-loading-state">
          <div className="spinner" />
          <p>Connecting to premium kitchens...</p>
        </div>
      ) : filteredRestaurants.length === 0 ? (
        <div className="empty-catalog-state">
          <Store size={48} className="empty-icon" />
          <h3>No restaurants found</h3>
          <p>No kitchens matched your search criteria.</p>
          <button onClick={() => setSearch("")} className="btn-primary-action">
            View All Kitchens
          </button>
        </div>
      ) : (
        <div className="restaurants-grid">
          {filteredRestaurants.map((restaurant, idx) => (
            <div className="restaurant-card" key={restaurant.id}>
              {/* Cover Image & Badges */}
              <div className="restaurant-img-wrapper">
                <img
                  src={getRestaurantImage(restaurant, idx)}
                  alt={restaurant.name}
                  className="restaurant-img"
                  loading="lazy"
                />
                <div className="restaurant-badges">
                  <span
                    className={`status-pill ${
                      restaurant.is_open ? "status-open" : "status-closed"
                    }`}
                  >
                    <span className="pulse-dot" />
                    {restaurant.is_open ? "Open Now" : "Closed"}
                  </span>

                  <span className="rating-pill">
                    <Star size={13} className="star-icon" />
                    <span>4.8</span>
                  </span>
                </div>
              </div>

              {/* Restaurant Details */}
              <div className="restaurant-info">
                <div className="restaurant-title-row">
                  <h2>{restaurant.name}</h2>
                  <div className="delivery-time-badge">
                    <Clock size={13} />
                    <span>25-35 min</span>
                  </div>
                </div>

                <div className="restaurant-meta-item">
                  <MapPin size={15} className="meta-icon" />
                  <span>{restaurant.address}</span>
                </div>

                <div className="restaurant-meta-item">
                  <Phone size={15} className="meta-icon" />
                  <span>{restaurant.phone}</span>
                </div>

                {restaurant.food_count > 0 && (
                  <div className="restaurant-food-count">
                    <UtensilsCrossed size={14} />
                    <span>{restaurant.food_count} Signature Dishes Available</span>
                  </div>
                )}

                {/* Explore Menu CTA */}
                <Link
                  to={`/foods?restaurant=${restaurant.id}`}
                  className="btn-explore-restaurant"
                >
                  <span>Explore Menu</span>
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}