import React, { useEffect, useState } from "react";
import api from "../services/api";
import OrderSummary from "../components/OrderSummary"; // ✅ Import the reusable component

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const userId = localStorage.getItem("userId");

    useEffect(() => {
        if (!userId) {
            setError("User not logged in");
            setLoading(false);
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

    if (loading) return <div className="text-center text-lg p-10">Loading...</div>;
    if (error) return <div className="text-center text-lg p-10 text-red-500">{error}</div>;

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-950 to-gray-400 p-10">
            <h1 className="text-3xl font-bold text-white mb-6">Your Orders</h1>
            <div className="w-full max-w-4xl">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <OrderSummary key={order.order_id} order={order} />
                    ))
                ) : (
                    <p className="text-white">No orders found.</p>
                )}
            </div>
        </div>
    );
};

export default Orders;
