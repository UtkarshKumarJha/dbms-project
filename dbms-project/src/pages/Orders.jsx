import React, { useEffect, useState } from "react";
import api from "../services/api";
import OrderSummary from "../components/OrderSummary";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("userId");
    const navigate = useNavigate();

    useEffect(() => {
        if (!userId) {
            toast.error("You are not logged in");
            setLoading(false);
            navigate("/login");
            return;
        }

        api.get(`/orders?userId=${userId}`)
            .then(response => {
                const groupedOrders = groupOrders(response.data);
                setOrders(groupedOrders);
                setLoading(false);
            })
            .catch(() => {
                setError("Error fetching orders");
                setLoading(false);
            });
    }, [userId]);

    const groupOrders = (ordersData) => {
        const ordersMap = new Map();
        ordersData.forEach((row) => {
            const uniqueKey = `${row.date}`;
            if (!ordersMap.has(uniqueKey)) {
                ordersMap.set(uniqueKey, {
                    order_id: row.order_id,
                    status: row.status,
                    location: row.location,
                    date: row.date,
                    total_price: 0,
                    items: [],
                });
            }
            const order = ordersMap.get(uniqueKey);
            order.items.push({
                product_id: row.product_id,
                name: row.name,
                price: row.price,
                image: row.image,
                quantity: row.quantity,
            });
            order.total_price += row.price * row.quantity;
        });
        return Array.from(ordersMap.values());
    };

    if (loading) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-white text-lg">
                Loading your orders...
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex justify-center items-center bg-gradient-to-b from-gray-900 to-black text-red-400 text-lg">
                {error}
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-gray-950 via-gray-900 to-black px-4 py-10">
            <h1 className="text-4xl font-extrabold text-white mb-8 drop-shadow-sm">
                Your Orders
            </h1>
            <div className="w-full max-w-5xl space-y-6">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div
                            key={order.order_id}
                            className="backdrop-blur-md bg-white bg-opacity-5 border border-gray-700 rounded-2xl p-5 shadow-lg"
                        >
                            <OrderSummary order={order} />
                        </div>
                    ))
                ) : (
                    <p className="text-gray-300 text-center text-lg">No orders found.</p>
                )}
            </div>
        </div>
    );
};

export default Orders;
