import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";
import DeliveryMap from "../components/DeliveryMaps";
import { toast } from 'react-toastify';

const Checkout = () => {
    const locationState = useLocation();
    const navigate = useNavigate();

    const cart = locationState.state?.cart || [];
    const singleProduct = locationState.state?.product || null;

    const [latLng, setLatLng] = useState(null);
    const [address, setAddress] = useState("");
    const [buildingName, setBuildingName] = useState("");
    const [quantity, setQuantity] = useState(singleProduct ? 1 : null);
    const [availableStock, setAvailableStock] = useState(0);
    const [stockMap, setStockMap] = useState({});

    const items = singleProduct ? [{ ...singleProduct, quantity }] : cart;

    useEffect(() => {
        const fetchStock = async () => {
            try {
                if (singleProduct) {
                    const res = await api.get(`/products/${singleProduct.product_id}`);
                    setAvailableStock(res.data.quantity);
                } else if (cart.length > 0) {
                    const newStockMap = {};
                    for (let item of cart) {
                        const res = await api.get(`/products/${item.product_id}`);
                        newStockMap[item.product_id] = res.data.quantity;
                    }
                    setStockMap(newStockMap);
                }
            } catch (err) {
                console.error("Error fetching stock data:", err);
            }
        };

        fetchStock();
    }, [singleProduct, cart]);

    const handleLocationSelect = async (latlng) => {
        setLatLng(latlng);
        try {
            const response = await axios.get("https://nominatim.openstreetmap.org/reverse", {
                params: {
                    lat: latlng.lat,
                    lon: latlng.lng,
                    format: "json"
                },
                headers: {
                    "Accept-Language": "en",
                    "User-Agent": "EcoWiseApp/1.0"
                }
            });
            setAddress(response.data.display_name);
        } catch (error) {
            console.error("Failed to reverse geocode:", error);
            setAddress("Unknown Location");
        }
    };

    const placeOrder = async () => {
        try {
            const userId = localStorage.getItem("userId");

            if (!address || !buildingName) {
                toast.error("Please select your delivery location and enter the building name.");
                return;
            }

            if (singleProduct && quantity > availableStock) {
                toast.error(`Only ${availableStock} item(s) available in stock.`);
                return;
            }

            const outOfStockItems = items.filter(
                (item) => item.quantity > (stockMap[item.product_id] || 0)
            );
            if (outOfStockItems.length > 0) {
                const itemNames = outOfStockItems
                    .map(item => `${item.product_name} (max: ${stockMap[item.product_id] || 0})`)
                    .join(", ");
                toast.error(`Some items exceed available stock: ${itemNames}`);
                return;
            }

            const orderData = {
                userId,
                items: items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })),
                location: `${buildingName}, ${address}`
            };

            await api.post("/create-order", orderData);
            toast.success("Order placed successfully!");
            navigate("/orders");
        } catch (err) {
            console.error("Error placing order:", err.message);
        }
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
                Your cart is empty.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white py-10 px-4">
            <div className="max-w-4xl mx-auto bg-gray-800 bg-opacity-70 backdrop-blur-md rounded-2xl shadow-2xl p-8 space-y-6 border border-gray-700">
                <h1 className="text-4xl font-extrabold text-center mb-4">Checkout</h1>

                <div className="space-y-4">
                    {items.map((item) => (
                        <div key={item.product_id} className="flex items-center gap-4 p-4 bg-gray-900 rounded-xl shadow border border-gray-700">
                            <img src={item.image} alt={item.product_name} className="w-20 h-20 rounded-lg object-cover" />
                            <div className="flex-1">
                                <h2 className="text-lg font-bold">{item.product_name}</h2>
                                <p className="text-gray-400">₹{item.price} x {item.quantity}</p>
                            </div>
                            {singleProduct ? (
                                <div className="flex items-center space-x-2">
                                    <button onClick={() => setQuantity(prev => Math.max(1, prev - 1))} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">−</button>
                                    <span className="text-lg font-semibold">{quantity}</span>
                                    <button onClick={() => setQuantity(prev => prev + 1)} className="bg-gray-700 px-3 py-1 rounded hover:bg-gray-600">+</button>
                                </div>
                            ) : (
                                <p className="font-semibold text-green-400">₹{item.price * item.quantity}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Map and Location */}
                <div>
                    <h2 className="text-xl font-semibold mb-2">Select Delivery Location</h2>
                    <div className="border border-gray-700 rounded-lg overflow-hidden shadow-md">
                        <DeliveryMap onLocationSelect={handleLocationSelect} />
                    </div>
                    {address && (
                        <p className="mt-2 text-sm text-gray-300">
                            <span className="text-gray-400">Selected Address:</span> <span className="font-mono">{address}</span>
                        </p>
                    )}
                </div>

                {/* Building name input */}
                <div>
                    <label htmlFor="buildingName" className="block text-sm font-medium text-gray-300 mb-1">
                        Building Name
                    </label>
                    <input
                        type="text"
                        id="buildingName"
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        placeholder="Enter building or landmark"
                        className="w-full p-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-white placeholder-gray-500"
                    />
                </div>

                <div className="text-center">
                    <button
                        onClick={placeOrder}
                        className="mt-6 bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg shadow-md transition"
                    >
                        Confirm & Place Order
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Checkout;
