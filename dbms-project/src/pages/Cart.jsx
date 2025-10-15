import React, { useState, useEffect } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const Cart = () => {
    const [cart, setCart] = useState([]);
    const navigate = useNavigate();
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            toast.error("You are not logged in");
            navigate("/login");
            return;
        }
        fetchCart();
    }, []);

    const fetchCart = () => {
        api.get(`/cart/${userId}`)
            .then(response => setCart(response.data))
            .catch(error => console.error("Error fetching cart items:", error));
    };

    const updateQuantity = (cart_id, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(cart_id);
            return;
        }

        setCart(cart.map(item =>
            item.cart_id === cart_id ? { ...item, quantity: newQuantity } : item
        ));

        api.put("/cart/update", { cart_id, quantity: newQuantity, userId: userId })
            .then(fetchCart)
            .catch(error => console.error("Error updating quantity:", error));
    };

    const removeFromCart = (cart_id) => {
        api.delete(`/cart/remove/${userId}/${cart_id}`)
            .then(() => fetchCart())
            .catch(error => console.error("Error removing item from cart:", error));
    };

    const placeOrder = () => {
        if (cart.length === 0) return;
        console.log("Placing order with items:", cart);
        navigate("/checkout", { state: { cart } });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-bold text-center text-white mb-8"
            >
                🛒 Your Cart
            </motion.h1>

            {cart.length > 0 ? (
                cart.map((item, index) => (
                    <motion.div
                        key={item.cart_id}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gray-800 bg-opacity-70 backdrop-blur-md border border-gray-600 p-5 rounded-2xl mb-6 shadow-lg text-white"
                    >
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-white mb-1">{item.product_name}</h2>
                                {item.discount ? (
                                    <div>
                                        <p className="text-sm text-red-300 line-through">₹{item.price}</p>
                                        <p className="text-green-300 font-semibold">
                                            ₹{(item.price * (1 - item.discount / 100)).toFixed(2)} × {item.quantity} = ₹{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                                        </p>
                                        <p className="text-green-500 text-sm">{item.discount}% Off</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-300 font-medium">
                                        ₹{item.price} × {item.quantity} = ₹{item.price * item.quantity}
                                    </p>
                                )}
                            </div>
                            <div className="flex items-center space-x-2">
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg"
                                >−</motion.button>
                                <span className="w-6 text-center font-bold">{item.quantity}</span>
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded-lg"
                                >＋</motion.button>
                            </div>
                        </div>
                    </motion.div>
                ))
            ) : (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-300 text-lg mt-10"
                >
                    Your cart is empty.
                </motion.p>
            )}

            {cart.length > 0 && (
                <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={placeOrder}
                    className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-2xl shadow-lg transition duration-200"
                >
                    🚀 Buy Now
                </motion.button>
            )}
        </div>
    );
};

export default Cart;
