import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ReviewSection from "./ReviewSection";
import { toast } from "react-toastify";

const ProductDetails = ({ cart, setCart }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedQuantity, setSelectedQuantity] = useState(1);
    const [availableStock, setAvailableStock] = useState(0);

    useEffect(() => {
        api.get(`/products/${id}`)
            .then(response => {
                setProduct(response.data);
                setAvailableStock(response.data.quantity);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="text-center p-10">Loading...</div>;
    if (error) return <div className="text-center text-red-500 p-10">{error}</div>;
    if (!product) return <div className="text-center p-10">Product not found</div>;

    const addToCart = async () => {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            toast.warn("Please login to add items to your cart.");
            return navigate("/login");
        }

        try {
            await api.post("/addtocart", {
                userId,
                product_id: product.product_id,
                quantity: selectedQuantity,
                price: product.price
            });

            setCart([...cart, { ...product, quantity: selectedQuantity }]);
            navigate(`/cart/${userId}`);
        } catch (err) {
            console.error("Error adding to cart:", err.message);
            toast.error("Something went wrong while adding to cart.");
        }
    };

    const buyNow = () => {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            toast.warn("Please login to proceed to checkout.");
            return navigate("/login");
        }

        navigate("/checkout", {
            state: {
                product: { ...product, quantity: selectedQuantity, product_image: product.image }
            }
        });
    };

    const handleQuantityChange = (newQuantity) => {
        if (newQuantity >= 1 && newQuantity <= availableStock) {
            setSelectedQuantity(newQuantity);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-gray-800 py-10">
            <div className="max-w-4xl bg-gray-900 p-8 rounded-2xl shadow-xl flex flex-col md:flex-row gap-8">
                <img src={product.image} alt={product.name} className="w-80 h-80 object-cover rounded-lg shadow-md" />

                <div className="flex flex-col w-full">
                    <h1 className="text-3xl font-bold text-yellow-500">{product.name}</h1>
                    <p className="text-xl text-gray-400">Brand: {product.brand}</p>
                    {product.discount ? (
                        <div className="mt-4">
                            <p className="text-gray-500 line-through text-lg">₹{product.price}</p>
                            <p className="text-2xl font-bold text-yellow-400">
                                ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                            </p>
                            <p className="text-green-600 font-semibold">{product.discount}% Off</p>
                        </div>
                    ) : (
                        <p className="text-2xl font-bold text-yellow-400 mt-4">₹{product.price}</p>
                    )}

                    <p className="mt-4 text-gray-300 whitespace-pre-line">{product.details}</p>

                    <div className="mt-6 flex items-center gap-6">
                        <div className="flex items-center border border-gray-500 rounded-md">
                            <button onClick={() => handleQuantityChange(selectedQuantity - 1)} className="px-4 py-2 bg-gray-700 text-yellow-500" disabled={selectedQuantity <= 1}>
                                -
                            </button>
                            <span className="px-6 py-2 text-lg text-yellow-400">{selectedQuantity}</span>
                            <button onClick={() => handleQuantityChange(selectedQuantity + 1)} className="px-4 py-2 bg-gray-700 text-yellow-500" disabled={selectedQuantity >= availableStock}>
                                +
                            </button>
                        </div>

                        <button onClick={addToCart} className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700" disabled={selectedQuantity <= 0}>
                            Add to Cart
                        </button>
                        <button onClick={buyNow} className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700" disabled={selectedQuantity <= 0}>
                            Buy Now
                        </button>
                    </div>
                </div>
            </div>

            <ReviewSection productId={id} />
        </div>
    );
};

export default ProductDetails;
