import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import ReviewSection from "./ReviewSection";
import { toast } from "react-toastify";
import CryptoJS from "crypto-js";

const baseURL = import.meta.env.VITE_API_BASE_URL;
const KEY = CryptoJS.enc.Hex.parse(import.meta.env.VITE_SECRET_KEY);

// Decryption function
function decryptField(field) {
  try {
    if (!field) {
      console.warn("decryptField: field is null/undefined");
      return "";
    }
    
    if (typeof field !== "object") {
      console.warn("decryptField: field is not an object, got:", typeof field, field);
      return String(field);
    }
    
    if (!field.data || !field.iv) {
      console.warn("decryptField: missing data or iv", field);
      return "";
    }

    const ciphertext = CryptoJS.enc.Base64.parse(field.data);
    const iv = CryptoJS.enc.Hex.parse(field.iv);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext },
      KEY,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      console.error("Decryption produced empty result");
      return "";
    }
    
    return result;
    
  } catch (error) {
    console.error("Decryption error:", error, "Field:", field);
    return "";
  }
}

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
                console.log("=== RAW ENCRYPTED PRODUCT RESPONSE ===");
                console.log(JSON.stringify(response.data, null, 2));

                // Decrypt the product data
                const decrypted = {
                    ...response.data,
                    name: decryptField(response.data.name),
                    details: decryptField(response.data.details),
                    price: parseFloat(decryptField(response.data.price)) || 0,
                    brand: decryptField(response.data.brand),
                    category: decryptField(response.data.category),
                    quantity: parseInt(decryptField(response.data.quantity)) || 0,
                    // discount and images are not encrypted
                };

                console.log("=== DECRYPTED PRODUCT ===");
                console.log(decrypted);

                setProduct(decrypted);
                setAvailableStock(decrypted.quantity);
            })
            .catch(err => setError(err.message))
            .finally(() => setLoading(false));
    }, [id]);

    if (loading) return <div className="text-center p-10 text-white">Loading...</div>;
    if (error) return <div className="text-center text-red-500 p-10">{error}</div>;
    if (!product) return <div className="text-center p-10 text-white">Product not found</div>;

    const addToCart = async () => {
        const userId = localStorage.getItem("userId");

        if (!userId) {
            toast.warn("Please login to add items to your cart.");
            return navigate("/login");
        }

        try {
            await api.post("/addtocart", {
                userId,
                product_id: product._id,
                quantity: selectedQuantity,
                price: product.price
            });

            setCart([...cart, { ...product, quantity: selectedQuantity }]);
            toast.success("Added to cart!");
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
                product: { 
                    ...product, 
                    quantity: selectedQuantity, 
                    // Use the first image from the images array
                    product_image: product.images && product.images.length > 0 
                        ? product.images[0] 
                        : null
                }
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
                <div className="flex gap-4 overflow-x-auto">
                    {product.images && product.images.length > 0 ? (
                        product.images.map((img, idx) => (
                            <img
                                key={idx}
                                src={`${baseURL}${img}`}  
                                alt={`${product.name}-${idx}`}
                                className="w-40 h-40 object-cover rounded-lg shadow-md"
                            />
                        ))
                    ) : (
                        <img
                            src="/placeholder.png"
                            alt="No image"
                            className="w-40 h-40 object-cover rounded-lg shadow-md"
                        />
                    )}
                </div>
                <div className="flex flex-col w-full">
                    <h1 className="text-3xl font-bold text-yellow-500">{product.name}</h1>
                    <p className="text-xl text-gray-400">Brand: {product.brand}</p>
                    <p className="text-sm text-gray-500">Category: {product.category}</p>
                    <p className="text-sm text-gray-500 mt-2">
                        Available Stock: <span className="font-semibold text-yellow-400">{availableStock}</span>
                    </p>
                    
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
                            <button 
                                onClick={() => handleQuantityChange(selectedQuantity - 1)} 
                                className="px-4 py-2 bg-gray-700 text-yellow-500 hover:bg-gray-600" 
                                disabled={selectedQuantity <= 1}
                            >
                                -
                            </button>
                            <span className="px-6 py-2 text-lg text-yellow-400">{selectedQuantity}</span>
                            <button 
                                onClick={() => handleQuantityChange(selectedQuantity + 1)} 
                                className="px-4 py-2 bg-gray-700 text-yellow-500 hover:bg-gray-600" 
                                disabled={selectedQuantity >= availableStock}
                            >
                                +
                            </button>
                        </div>

                        <button 
                            onClick={addToCart} 
                            className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={selectedQuantity <= 0 || availableStock === 0}
                        >
                            Add to Cart
                        </button>
                        <button 
                            onClick={buyNow} 
                            className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed" 
                            disabled={selectedQuantity <= 0 || availableStock === 0}
                        >
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