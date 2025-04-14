import React from "react";
import { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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

function App() {

  const [cart, setCart] = useState([]);

  return (
    <Router>
      <Navbar />
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
      </Routes>
    </Router>
  );
}

export default App;
