import { useState, useEffect } from "react";
import React from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

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
            removeFromCart(cart_id); // If quantity is 0, remove item
            return;
        }

        // Optimistically update UI
        setCart(cart.map(item =>
            item.cart_id === cart_id ? { ...item, quantity: newQuantity } : item
        ));

        // Send update request to backend
        api.put("/cart/update", { cart_id, quantity: newQuantity })
            .then(fetchCart) // Refresh cart after update
            .catch(error => console.error("Error updating quantity:", error));
    };

    const removeFromCart = (cart_id) => {
        api.delete(`/cart/remove/${cart_id}`)
            .then(() => fetchCart()) // Refresh cart after deletion
            .catch(error => console.error("Error removing item from cart:", error));
    };

    const placeOrder = () => {
        if (cart.length === 0) return;

        navigate("/checkout", {
            state: { cart }
        });
    };

    return (
        <div className="p-10 m-10 max-w-lg mx-auto bg-gradient-to-b from-blue-950 to-gray-400 rounded-lg shadow-lg">
            <h1 className="text-3xl font-bold mb-6 text-center text-white">Your Cart</h1>
            {cart.length > 0 ? (
                cart.map(item => (
                    <div key={item.cart_id} className="flex items-center justify-between border border-gray-300 p-4 rounded-lg shadow-md bg-white mb-3">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-800">{item.product_name}</h2>
                            <p className="text-gray-600">₹{item.price} x {item.quantity} = ₹{item.price * item.quantity}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <button
                                className="px-3 py-1 rounded-md bg-red-500 hover:bg-red-600 text-white font-semibold transition duration-200"
                                onClick={() => updateQuantity(item.cart_id, item.quantity - 1)}
                            >-</button>
                            <span className="w-6 text-center font-bold text-gray-800">{item.quantity}</span>
                            <button
                                className="px-3 py-1 rounded-md bg-green-500 hover:bg-green-600 text-white font-semibold transition duration-200"
                                onClick={() => updateQuantity(item.cart_id, item.quantity + 1)}
                            >+</button>
                        </div>
                    </div>
                ))
            ) : (
                <p className="text-center text-white text-lg">Your cart is empty.</p>
            )}

            {cart.length > 0 && (
                <button
                    onClick={placeOrder}
                    className="mt-4 w-full bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 transition"
                >
                    Buy Now
                </button>
            )}
        </div>
    );
};

export default Cart;
