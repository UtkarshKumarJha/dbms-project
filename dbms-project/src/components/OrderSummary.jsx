import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const OrderSummary = ({ order }) => {
    const [stockMap, setStockMap] = useState({});
    const [loadingStock, setLoadingStock] = useState(true);

    const formatCurrency = (amount) =>
        new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: "INR",
        }).format(amount);

    useEffect(() => {
        const fetchStock = async () => {
            try {
                const productIds = order.items.map(item => item.product_id).join(",");
                const response = await api.get(`/products/stock-check?ids=${productIds}`);

                const stockObj = {};
                response.data.forEach(p => {
                    stockObj[p.product_id] = p.quantity;
                });

                setStockMap(stockObj);
                setLoadingStock(false);
            } catch (err) {
                console.error("Failed to fetch stock", err);
                setLoadingStock(false);
            }
        };

        if (order?.items?.length > 0) {
            fetchStock();
        }
    }, [order]);

    const handleCancelOrder = async () => {
        const reason = prompt("Please enter a reason for cancellation:");
        if (!reason) return;

        try {
            const response = await api.put(`/orders/${order.order_id}/cancel`, { reason });

            if (response.status === 200) {
                toast.success("Order cancelled successfully.");
                setTimeout(() => window.location.reload(), 2000); // wait before reload to show toast
            } else {
                toast.error("Failed to cancel order. Try again later.");
            }
        } catch (error) {
            console.error(error);
            toast.error("An error occurred while cancelling the order.");
        }
    };

    const subtotal = order?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const totalDiscount = order?.items?.reduce((acc, item) => {
        if (item.discount) {
            return acc + (item.price * item.discount / 100) * item.quantity;
        }
        return acc;
    }, 0);

    const totalAfterDiscount = subtotal - totalDiscount;

    const isCancelable = !["Cancelled", "Delivered"].includes(order?.status);

    const calculateDiscountedPrice = (item) => {
        if (item.discount) {
            const discountAmount = (item.price * item.discount) / 100;
            return item.price - discountAmount;
        }
        return item.price;
    };

    return (
        <div
            key={order?.order_id}
            className="bg-gray-800 p-6 rounded-lg shadow-lg mb-4 transition transform hover:scale-105 border border-gray-500"
        >
            <h2 className="text-xl font-semibold text-yellow-500">
                Order #{order?.order_id ?? "N/A"}
            </h2>
            <p className="text-gray-300"><strong>Status:</strong> {order?.status || "Pending"}</p>
            <p className="text-gray-300"><strong>Delivery Address:</strong> {order?.location || "Not Available"}</p>
            <p className="text-gray-300"><strong>Date:</strong> {order?.date ? new Date(order.date).toLocaleDateString() : "Not Available"}</p>
            <p className="text-yellow-400 font-bold"><strong>Total:</strong> {formatCurrency(order?.total_price || 0)}</p>

            <div className="mt-4 space-y-3">
                {order?.items?.length > 0 ? (
                    order.items.map((item) => {
                        const availableQty = stockMap[item.product_id];
                        const isOutOfStock = availableQty !== undefined && item.quantity > availableQty;
                        const discountedPrice = calculateDiscountedPrice(item);

                        return (
                            <div
                                key={`${order.order_id}-${item.product_id}`}
                                className="flex items-center space-x-6 bg-gray-700 p-4 rounded-lg shadow"
                            >
                                <img
                                    src={item.image || "https://via.placeholder.com/100"}
                                    alt={item.name}
                                    className="w-20 h-20 object-cover rounded-lg"
                                />
                                <div>
                                    <p className="text-lg font-semibold text-yellow-300">
                                        <Link
                                            to={`/product/${item.product_id}`}
                                            className="text-yellow-500 hover:underline"
                                        >
                                            {item.name || "Product Name"}
                                        </Link>
                                    </p>
                                    <p className="text-gray-400"><strong>Quantity:</strong> {item.quantity}</p>
                                    <p className="text-gray-300">
                                        <strong>Price:</strong> {formatCurrency(item.price)}
                                    </p>
                                    {item.discount && (
                                        <p className="text-gray-400">
                                            <strong>Price After Discount:</strong> {formatCurrency(discountedPrice)} × {item.quantity} = {formatCurrency(discountedPrice * item.quantity)}
                                        </p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                ) : (
                    <p className="text-gray-500">No products found in this order.</p>
                )}
            </div>

            {isCancelable && (
                <div className="mt-6">
                    <button
                        onClick={handleCancelOrder}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
                    >
                        Cancel Order
                    </button>
                </div>
            )}
        </div>
    );
};

export default OrderSummary;
