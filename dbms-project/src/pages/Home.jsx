import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import api from "../services/api";

// Get the base URL for images from your environment variables
const baseURL = import.meta.env.VITE_API_BASE_URL;

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        // Fetch only a few products for the homepage for better performance
        api.get("/products?limit=10") // You can add a limit parameter to your API
            .then(response => setProducts(response.data))
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
                                {/* ✨ FIX: Wrap the card with a Link to the product's detail page */}
                                <Link to={`/product/${product._id}`}>
                                    <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 transition-transform transform hover:scale-105 h-full flex flex-col justify-between">
                                        <img
                                            // ✨ FIX: Construct the correct image URL from the 'images' array
                                            src={
                                                product.images && product.images.length > 0
                                                    ? `${baseURL}${product.images[0]}`
                                                    : "/placeholder.png" // A placeholder image in your public folder
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