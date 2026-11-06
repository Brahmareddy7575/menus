import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import API from "../services/api";
import { useCart } from "../context/CartContext";
import { getFoodImage, isVeg } from "../services/imageMap";
import {
  Search,
  Filter,
  Plus,
  Minus,
  UtensilsCrossed,
  Store,
  Flame,
} from "lucide-react";

export default function Foods() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const selectedCategory = searchParams.get("category") || "all";
  const selectedRestaurant = searchParams.get("restaurant") || "all";
  const [dietaryFilter, setDietaryFilter] = useState("all"); // 'all', 'veg', 'nonveg'
  const [sortBy, setSortBy] = useState("default");

  const { addToCart, updateQuantity, getItemQuantity, getItemCartId } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [foodsRes, catsRes, restsRes] = await Promise.all([
          API.get("foods/"),
          API.get("categories/"),
          API.get("restaurants/"),
        ]);
        setFoods(foodsRes.data);
        setCategories(catsRes.data);
        setRestaurants(restsRes.data);
      } catch (err) {
        console.error("Failed to fetch food catalog:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Sync state with URL params if changed externally
  // Filtered and sorted foods
  const filteredFoods = useMemo(() => {
    let result = [...foods];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (f) =>
          f.name.toLowerCase().includes(q) ||
          (f.description && f.description.toLowerCase().includes(q)) ||
          (f.category_name && f.category_name.toLowerCase().includes(q)) ||
          (f.restaurant_name && f.restaurant_name.toLowerCase().includes(q))
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      result = result.filter(
        (f) => String(f.category) === String(selectedCategory)
      );
    }

    // Restaurant filter
    if (selectedRestaurant !== "all") {
      result = result.filter(
        (f) => String(f.restaurant) === String(selectedRestaurant)
      );
    }

    // Dietary filter
    if (dietaryFilter === "veg") {
      result = result.filter((f) => isVeg(f));
    } else if (dietaryFilter === "nonveg") {
      result = result.filter((f) => !isVeg(f));
    }

    // Sorting
    if (sortBy === "price-low") {
      result.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-high") {
      result.sort((a, b) => Number(b.price) - Number(a.price));
    } else if (sortBy === "name") {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [foods, searchQuery, selectedCategory, selectedRestaurant, dietaryFilter, sortBy]);

  const handleCategorySelect = (catId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (catId === "all") {
      nextParams.delete("category");
    } else {
      nextParams.set("category", catId);
    }
    setSearchParams(nextParams);
  };

  const handleRestaurantSelect = (restId) => {
    const nextParams = new URLSearchParams(searchParams);
    if (restId === "all") {
      nextParams.delete("restaurant");
    } else {
      nextParams.set("restaurant", restId);
    }
    setSearchParams(nextParams);
  };

  const resetFilters = () => {
    setSearchQuery("");
    setDietaryFilter("all");
    setSortBy("default");
    setSearchParams({});
  };

  return (
    <div className="page-wrapper foods-page">
      {/* Hero Header Banner */}
      <section className="food-hero-banner">
        <div className="banner-content">
          <div className="banner-badge">
            <Flame size={16} className="flame-icon" />
            <span>Fastest Gourmet Delivery in Town</span>
          </div>
          <h1>Indulge in Handcrafted Flavors & Royal Delights</h1>
          <p>
            Explore signature dum biryanis, wood-fired pizzas, sizzlers, and
            desserts crafted by top culinary masters.
          </p>

          {/* Search Box in Hero */}
          <div className="hero-search-box">
            <Search className="hero-search-icon" size={22} />
            <input
              type="text"
              placeholder="Search for biryani, butter chicken, pizza, drinks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                className="hero-search-clear"
                onClick={() => setSearchQuery("")}
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Category Pills Bar */}
      <section className="category-scroll-container">
        <div className="category-chips">
          <button
            className={`cat-chip ${selectedCategory === "all" ? "active" : ""}`}
            onClick={() => handleCategorySelect("all")}
          >
            <span>All Dishes</span>
            <span className="cat-count">{foods.length}</span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-chip ${
                String(selectedCategory) === String(cat.id) ? "active" : ""
              }`}
              onClick={() => handleCategorySelect(cat.id)}
            >
              <span>{cat.name}</span>
              {cat.food_count > 0 && (
                <span className="cat-count">{cat.food_count}</span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Filter and Control Bar */}
      <section className="controls-bar">
        <div className="controls-left">
          {/* Restaurant Filter Dropdown */}
          <div className="filter-select-wrapper">
            <Store size={16} className="select-icon" />
            <select
              value={selectedRestaurant}
              onChange={(e) => handleRestaurantSelect(e.target.value)}
            >
              <option value="all">All Kitchens & Restaurants</option>
              {restaurants.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Dietary Toggle Pills */}
          <div className="dietary-toggle-group">
            <button
              className={`diet-btn ${dietaryFilter === "all" ? "active" : ""}`}
              onClick={() => setDietaryFilter("all")}
            >
              All
            </button>
            <button
              className={`diet-btn veg-btn ${
                dietaryFilter === "veg" ? "active" : ""
              }`}
              onClick={() => setDietaryFilter("veg")}
            >
              <span className="veg-dot" />
              Veg Only
            </button>
            <button
              className={`diet-btn nonveg-btn ${
                dietaryFilter === "nonveg" ? "active" : ""
              }`}
              onClick={() => setDietaryFilter("nonveg")}
            >
              <span className="nonveg-dot" />
              Non-Veg
            </button>
          </div>
        </div>

        <div className="controls-right">
          {/* Sort Selector */}
          <div className="filter-select-wrapper">
            <Filter size={16} className="select-icon" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="default">Featured / Default</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Dish Name (A-Z)</option>
            </select>
          </div>
        </div>
      </section>

      {/* Results Count & Active Filters summary */}
      <div className="results-summary">
        <p>
          Showing <strong>{filteredFoods.length}</strong> delicacies
          {selectedCategory !== "all" && (
            <span>
              {" "}
              in "
              {categories.find((c) => String(c.id) === String(selectedCategory))
                ?.name || "Category"}
              "
            </span>
          )}
          {selectedRestaurant !== "all" && (
            <span>
              {" "}
              from "
              {restaurants.find((r) => String(r.id) === String(selectedRestaurant))
                ?.name || "Kitchen"}
              "
            </span>
          )}
        </p>

        {(selectedCategory !== "all" ||
          selectedRestaurant !== "all" ||
          dietaryFilter !== "all" ||
          searchQuery) && (
          <button onClick={resetFilters} className="btn-reset-filters">
            Reset All Filters
          </button>
        )}
      </div>

      {/* Foods Grid */}
      {loading ? (
        <div className="catalog-loading-state">
          <div className="spinner" />
          <p>Preparing menu delicacies...</p>
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="empty-catalog-state">
          <UtensilsCrossed size={48} className="empty-icon" />
          <h3>No dishes matched your selection</h3>
          <p>Try searching for a different item or clear the active filters.</p>
          <button onClick={resetFilters} className="btn-primary-action">
            Browse All Items
          </button>
        </div>
      ) : (
        <div className="food-grid">
          {filteredFoods.map((food) => {
            const quantity = getItemQuantity(food.id);
            const cartItemId = getItemCartId(food.id);
            const vegStatus = isVeg(food);

            return (
              <div className="food-card" key={food.id}>
                {/* Food Image and Badges */}
                <div className="food-image-wrapper">
                  <img
                    src={getFoodImage(food)}
                    alt={food.name}
                    className="food-card-img"
                    loading="lazy"
                  />
                  <div className="food-badges-overlay">
                    {/* Veg / Non-Veg Indicator */}
                    <span
                      className={`dietary-indicator ${
                        vegStatus ? "veg-indicator" : "nonveg-indicator"
                      }`}
                      title={vegStatus ? "Pure Vegetarian" : "Non-Vegetarian"}
                    >
                      <span className="dot" />
                    </span>

                    {food.category_name && (
                      <span className="category-pill-tag">
                        {food.category_name}
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="food-card-content">
                  <div className="food-card-header">
                    <h3 className="food-title">{food.name}</h3>
                    {food.restaurant_name && (
                      <div className="food-restaurant-tag">
                        <Store size={13} />
                        <span>{food.restaurant_name}</span>
                      </div>
                    )}
                  </div>

                  {food.description && (
                    <p className="food-description">{food.description}</p>
                  )}

                  {/* Price and Cart Action */}
                  <div className="food-card-footer">
                    <div className="food-price-box">
                      <span className="currency-symbol">₹</span>
                      <span className="price-amount">{food.price}</span>
                    </div>

                    {quantity > 0 ? (
                      <div className="stepper-control">
                        <button
                          onClick={() =>
                            updateQuantity(
                              cartItemId,
                              food.id,
                              quantity - 1
                            )
                          }
                          className="stepper-btn"
                          aria-label="Decrease quantity"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="stepper-val">{quantity}</span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              cartItemId,
                              food.id,
                              quantity + 1
                            )
                          }
                          className="stepper-btn"
                          aria-label="Increase quantity"
                        >
                          <Plus size={14} />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(food.id, 1, food.name)}
                        className="btn-add-cart"
                      >
                        <Plus size={16} />
                        <span>Add</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}