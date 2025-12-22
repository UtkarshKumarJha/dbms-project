import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import api from "../services/api";
import CryptoJS from "crypto-js";

// Get the base URL for images from your environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL;
const KEY = CryptoJS.enc.Hex.parse(import.meta.env.VITE_SECRET_KEY);

// Add the same decryptField function
function decryptField(field) {
  try {
    // Add validation
    if (!field) {
      console.warn("decryptField: field is null/undefined");
      return "";
    }
    
    if (typeof field !== "object") {
      console.warn("decryptField: field is not an object, got:", typeof field, field);
      return String(field); // If it's already a plain value, return it
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
    return ""; // Return empty string on error instead of crashing
  }
}

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch only a few products for the homepage
        api.get("/products?limit=10")
            .then(response => {
                console.log("=== HOME PAGE - RAW ENCRYPTED RESPONSE ===");
                console.log(JSON.stringify(response.data[0], null, 2));

                // Decrypt the products
                const decrypted = response.data.map((p, index) => {
                    try {
                        const obj = {
                            ...p,
                            name: decryptField(p.name),
                            price: parseFloat(decryptField(p.price)) || 0,
                            brand: decryptField(p.brand),
                            category: decryptField(p.category),
                            discount: p.discount && typeof p.discount === "object"
                                ? parseFloat(decryptField(p.discount)) || 0
                                : (p.discount || 0)
                        };
                        return obj;
                    } catch (err) {
                        console.error(`Error decrypting product ${index}:`, err);
                        return null;
                    }
                }).filter(p => p !== null);

                console.log("=== HOME PAGE - DECRYPTED PRODUCTS ===");
                console.table(decrypted);
                
                setProducts(decrypted);
            })
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white px-4 py-12 flex flex-col items-center">
            {/* Hero Section */}
            <div className="text-center mb-16">
                <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 text-white drop-shadow-md">
                    Welcome to <span className="text-amber-400">Bazario</span>
                </h1>
                <p className="text-md sm:text-lg text-gray-400 max-w-xl mx-auto leading-relaxed">
                    Explore the finest collection of gadgets & accessories. Quality meets affordability.
                </p>
                <Link
                    to="/products"
                    className="mt-6 inline-block bg-amber-400 text-black px-8 py-3 rounded-full font-bold text-base sm:text-lg shadow-lg hover:bg-amber-300 transition duration-300"
                >
                    Browse All Products
                </Link>
            </div>

            {/* Featured Products Carousel */}
            <div className="w-full max-w-6xl">
                 <h2 className="text-3xl font-bold text-center mb-8">Featured Products</h2>
                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">Loading featured products...</p>
                ) : (
                    <Swiper
                        modules={[Navigation, Autoplay, Pagination]}
                        spaceBetween={30}
                        navigation
                        pagination={{ clickable: true }}
                        autoplay={{ delay: 3500, disableOnInteraction: false }}
                        loop={true}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product._id}>
                                <Link to={`/product/${product._id}`}>
                                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 transition-transform transform hover:scale-105 h-full flex flex-col justify-between">
                                        <img
                                            src={
                                                product.images && product.images.length > 0
                                                    ? `${baseURL}${product.images[0]}`
                                                    : "/placeholder.png"
                                            }
                                            alt={product.name}
                                            className="w-full h-60 object-cover rounded-xl mb-4 border border-white/10"
                                        />
                                        <div>
                                            <h2 className="text-xl font-semibold text-white mb-1 truncate">{product.name}</h2>
                                            <p className="text-amber-400 text-lg font-bold">₹{product.price}</p>
                                        </div>
                                    </div>
                                </Link>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </div>
    );
};

export default Home;