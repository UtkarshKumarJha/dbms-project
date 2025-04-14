import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import api from "../services/api";
import DeliveryMap from "../components/DeliveryMaps";

const Checkout = () => {
    const locationState = useLocation();
    const navigate = useNavigate();

    const cart = locationState.state?.cart || [];
    const singleProduct = locationState.state?.product || null;

    const [latLng, setLatLng] = useState(null);
    const [address, setAddress] = useState("");
    const [buildingName, setBuildingName] = useState(""); // Store building name
    const [quantity, setQuantity] = useState(singleProduct ? 1 : null);
    const [availableStock, setAvailableStock] = useState(0);

    const items = singleProduct
        ? [{ ...singleProduct, quantity }]
        : cart;

    if (items.length === 0)
        return <div className="text-center p-10">Your cart is empty.</div>;

    // 🔁 Fetch address from lat/lng
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
                    "User-Agent": "EcoWiseApp/1.0" // Required by Nominatim
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
                alert("Please select your delivery location on the map and enter the building name.");
                return;
            }
            if (item.quantity > availableStock) {
                alert("Quantity exceeds available stock.");
                return;
            }

            const orderData = {
                userId,
                items: items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })),
                location: `${buildingName},${address}` // Combined address and building name
            };

            await api.post("/create-order", orderData);
            navigate("/orders");
        } catch (err) {
            console.error("Error placing order:", err.message);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-50 py-10">
            <div className="max-w-3xl bg-white p-8 rounded-2xl shadow-xl w-full">
                <h1 className="text-3xl font-bold mb-6">Checkout</h1>

                <div className="flex flex-col space-y-4">
                    {items.map((item) => (
                        <div key={item.product_id} className="flex items-center justify-between border p-4 rounded-lg shadow-md bg-white">
                            <img src={item.image} alt={item.product_name} className="w-16 h-16 object-cover rounded-lg" />
                            <div className="flex-1 ml-4">
                                <h2 className="text-lg font-semibold">{item.product_name}</h2>
                                <p className="text-gray-600">₹{item.price} x {item.quantity}</p>
                            </div>

                            {singleProduct ? (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                                        className="px-2 py-1 bg-gray-200 rounded"
                                    >
                                        −
                                    </button>
                                    <span className="text-lg font-semibold">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(prev => prev + 1)}
                                        className="px-2 py-1 bg-gray-200 rounded"
                                    >
                                        +
                                    </button>
                                </div>
                            ) : (
                                <p className="font-bold text-blue-600">₹{item.price * item.quantity}</p>
                            )}
                        </div>
                    ))}
                </div>

                {/* Map-based Location Selection */}
                <div className="mt-6">
                    <h2 className="text-lg font-semibold mb-2">Select Delivery Location</h2>
                    <DeliveryMap onLocationSelect={handleLocationSelect} />
                    {address && (
                        <p className="mt-2 text-sm text-gray-700">
                            Selected Address: <span className="font-mono">{address}</span>
                        </p>
                    )}
                </div>

                {/* Building Name Input */}
                <div className="mt-4">
                    <label htmlFor="buildingName" className="block text-sm font-semibold">Building Name</label>
                    <input
                        type="text"
                        id="buildingName"
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        className="mt-2 p-2 border border-gray-300 rounded w-full"
                        placeholder="Enter building name or specific location"
                        required
                    />
                </div>

                <button
                    onClick={placeOrder}
                    className="mt-6 bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700"
                >
                    Confirm & Place Order
                </button>
            </div>
        </div>
    );
};

export default Checkout;
