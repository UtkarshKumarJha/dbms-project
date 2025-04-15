import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api from "../services/api";

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/products")
            .then(response => setProducts(response.data))
            .catch(error => console.error("Error fetching products:", error));
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-950 to-black text-white px-4 py-12 flex flex-col items-center">
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
                    Browse Products
                </Link>
            </div>

            <div className="w-full max-w-6xl">
                {products.length === 0 ? (
                    <p className="text-center text-gray-500 text-lg">No products available.</p>
                ) : (
                    <Swiper
                        modules={[Navigation, Autoplay]}
                        spaceBetween={30}
                        slidesPerView={3}
                        navigation
                        autoplay={{ delay: 3000 }}
                        loop={true}
                        breakpoints={{
                            640: { slidesPerView: 1 },
                            768: { slidesPerView: 2 },
                            1024: { slidesPerView: 3 },
                        }}
                    >
                        {products.map((product) => (
                            <SwiperSlide key={product._id}>
                                <div className="p-5 bg-white/5 backdrop-blur-md rounded-2xl shadow-xl border border-white/10 transition-transform transform hover:scale-105">
                                    <img
                                        src={product.image}
                                        alt={product.name}
                                        className="w-full h-60 object-cover rounded-xl mb-4 border border-white/10"
                                    />
                                    <h2 className="text-xl font-semibold text-white mb-1 truncate">{product.name}</h2>
                                    <p className="text-amber-400 text-lg font-bold">₹{product.price}</p>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                )}
            </div>
        </div>
    );
};

export default Home;
