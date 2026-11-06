import { createContext, useContext, useState, useEffect, useCallback } from "react";
import API from "../services/api";
import { useAuth } from "./AuthContext";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { isAuthenticated, openAuthModal } = useAuth();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "success") => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => {
      setToast((current) => (current && current.message === message ? null : current));
    }, 3500);
  }, []);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setCart(null);
      return;
    }
    try {
      setLoading(true);
      const res = await API.get("cart/");
      setCart(res.data);
    } catch (err) {
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    let isCancelled = false;
    if (isAuthenticated) {
      API.get("cart/")
        .then((res) => {
          if (!isCancelled) {
            setCart(res.data);
          }
        })
        .catch((err) => {
          console.error("Error fetching cart:", err);
        });
    } else {
      queueMicrotask(() => {
        if (!isCancelled) {
          setCart(null);
        }
      });
    }
    return () => {
      isCancelled = true;
    };
  }, [isAuthenticated]);

  const addToCart = async (foodId, quantity = 1, foodName = "Food item") => {
    if (!isAuthenticated) {
      showToast("Please sign in to order food", "info");
      openAuthModal("login");
      return false;
    }

    try {
      const res = await API.post("cart/add/", {
        food: foodId,
        quantity,
      });
      if (res.data?.cart) {
        setCart(res.data.cart);
      } else {
        await fetchCart();
      }
      showToast(`${foodName} added to cart! 🛒`, "success");
      return true;
    } catch (err) {
      console.error("Add to cart error:", err);
      showToast("Failed to add to cart. Please try again.", "error");
      return false;
    }
  };

  const updateQuantity = async (cartItemId, foodId, quantity) => {
    if (!isAuthenticated) return;
    try {
      const res = await API.post("cart/update/", {
        cart_item_id: cartItemId,
        food_id: foodId,
        quantity,
      });
      if (res.data?.cart) {
        setCart(res.data.cart);
      } else {
        await fetchCart();
      }
    } catch (err) {
      console.error("Update quantity error:", err);
      showToast("Could not update item quantity", "error");
    }
  };

  const removeFromCart = async (cartItemId, foodId) => {
    if (!isAuthenticated) return;
    try {
      const res = await API.post("cart/remove/", {
        cart_item_id: cartItemId,
        food_id: foodId,
      });
      if (res.data?.cart) {
        setCart(res.data.cart);
      } else {
        await fetchCart();
      }
      showToast("Item removed from cart", "info");
    } catch (err) {
      console.error("Remove from cart error:", err);
      showToast("Could not remove item", "error");
    }
  };

  const clearCart = async () => {
    if (!isAuthenticated) return;
    try {
      const res = await API.post("cart/clear/");
      if (res.data?.cart) {
        setCart(res.data.cart);
      } else {
        await fetchCart();
      }
      showToast("Cart cleared", "info");
    } catch (err) {
      console.error("Clear cart error:", err);
    }
  };

  const getItemQuantity = (foodId) => {
    if (!cart || !cart.items) return 0;
    const item = cart.items.find((i) => i.food === foodId);
    return item ? item.quantity : 0;
  };

  const getItemCartId = (foodId) => {
    if (!cart || !cart.items) return null;
    const item = cart.items.find((i) => i.food === foodId);
    return item ? item.id : null;
  };

  const cartCount = cart && cart.items ? cart.items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const cartTotal = cart ? Number(cart.total_amount || 0) : 0;

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        cartTotal,
        toast,
        showToast,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        refreshCart: fetchCart,
        getItemQuantity,
        getItemCartId,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
