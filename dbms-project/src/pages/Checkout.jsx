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
    const [buildingName, setBuildingName] = useState(""); // Store building name
    const [quantity, setQuantity] = useState(singleProduct ? 1 : null);
    const [availableStock, setAvailableStock] = useState(0);
    const [stockMap, setStockMap] = useState({}); // product_id -> available stock



    const items = singleProduct
        ? [{ ...singleProduct, quantity }]
        : cart;

    if (items.length === 0)
        return <div className="text-center p-10">Your cart is empty.</div>;

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
                        console.log("Stock for product", item.product_id, ":", res.data.quantity);
                    }
                    setStockMap(newStockMap);
                }
            } catch (err) {
                console.error("Error fetching stock data:", err);
            }
        };

        fetchStock();
    }, [singleProduct, cart]);


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
                toast.error("Please select your delivery location and enter the building name.");
                return;
            }

            if (singleProduct) {
                if (quantity > availableStock) {
                    toast.error(`Only ${availableStock} item(s) available in stock.`);
                    return;
                }
            } else {
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
            }


            const orderData = {
                userId,
                items: items.map(item => ({
                    product_id: item.product_id,
                    quantity: item.quantity,
                    price: item.price
                })),
                location: `${buildingName},${address}`
            };

            await api.post("/create-order", orderData);
            navigate("/orders");
        } catch (err) {
            console.error("Error placing order:", err.message);
        }
    };
    const subtotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    const totalDiscount = items.reduce((acc, item) => {
        if (item.discount) {
            return acc + (item.price * item.discount / 100) * item.quantity;
        }
        return acc;
    }, 0);

    const totalAfterDiscount = subtotal - totalDiscount;



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
                                {item.discount ? (
                                    <div className="text-gray-600">
                                        <p className="text-blue-600 font-semibold">
                                            ₹{(item.price * (1 - item.discount / 100)).toFixed(2)} x {item.quantity} = ₹{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                                        </p>
                                        <p className="text-green-600 text-sm">{item.discount}% Off</p>
                                    </div>
                                ) : (
                                    <p className="text-gray-600">₹{item.price} x {item.quantity}</p>
                                )}
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
                <div className="mt-6 border-t pt-4">
                    <h2 className="text-lg font-semibold mb-2">Order Summary</h2>
                    <div className="flex justify-between text-gray-700">
                        <span>Subtotal:</span>
                        <span>₹{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-700">
                        <span>Total Discount:</span>
                        <span className="text-green-600">- ₹{totalDiscount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-blue-800 text-lg mt-2">
                        <span>Total Payable:</span>
                        <span>₹{totalAfterDiscount.toFixed(2)}</span>
                    </div>
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
