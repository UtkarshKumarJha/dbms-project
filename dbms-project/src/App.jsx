import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify"; // ✅ Toast import
import "react-toastify/dist/ReactToastify.css";  // ✅ Toast CSS import

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ProductPage from "./pages/ProductPage";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Orders from "./pages/Orders";
import Profile from "./pages/Profile";
import ProductDetails from "./components/ProductDetails";
import Login from "./pages/Login";
import Signup from "./pages/SignUp";
import OrderSummary from "./components/OrderSummary";
import AdminRequestsPage from "./pages/AdminReq";
import AddProduct from "./pages/AddProduct";
import ForgotPassword from "./pages/ForgotPassword";
import AddDiscount from "./pages/AddDiscount";


function App() {
  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Navbar />

      {/* ✅ Toast container (place outside Routes but inside Router) */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/cart/:userId" element={<Cart />} />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/orders" element={<Orders />} />
        <Route path="/product/:id" element={<ProductDetails cart={cart} setCart={setCart} />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/profile/:userId" element={<Profile />} />
        <Route path="/ordersummary/:orderid" element={<OrderSummary />} />
        <Route path="/admin/requests" element={<AdminRequestsPage />} />
        <Route path="/add-product" element={<AddProduct />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/add-discount" element={<AddDiscount />} />
      </Routes>
    </Router>
  );
}

export default App;
