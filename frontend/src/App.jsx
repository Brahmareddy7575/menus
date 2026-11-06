import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Navbar from "./components/Navbar";
import Toast from "./components/Toast";
import AuthModal from "./components/AuthModal";
import Foods from "./pages/Foods";
import Restaurants from "./pages/Restaurants";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <div className="app-container">
            <Navbar />
            <main className="main-content">
              <Routes>
                <Route path="/" element={<Navigate to="/foods" replace />} />
                <Route path="/foods" element={<Foods />} />
                <Route path="/restaurants" element={<Restaurants />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/orders" element={<Orders />} />
                <Route path="*" element={<Navigate to="/foods" replace />} />
              </Routes>
            </main>
            <AuthModal />
            <Toast />
          </div>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;