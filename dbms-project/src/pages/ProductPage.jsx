import { Link } from "react-router-dom";
import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import api from "../services/api"; // Import API service

const Home = () => {
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/products")
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white p-10">

            <div className="text-center mb-14">
                <h1 className="text-5xl font-extrabold mb-4 drop-shadow-2xl text-gradient-to-r from-indigo-500 via-blue-500 to-purple-500">
                    Welcome to ShopEz
                </h1>
                <p className="text-lg text-gray-300 max-w-lg mx-auto mb-8">
                    Discover the best deals on premium tech accessories and gadgets. Top quality products at unbeatable prices!
                </p>
                <Link to="/products" className="mt-5 inline-block bg-gradient-to-r from-teal-600 to-teal-800 text-white px-8 py-3 rounded-full font-semibold text-lg shadow-xl transform hover:scale-105 transition duration-300 hover:bg-teal-700 hover:shadow-2xl">
                    View Products
                </Link>
            </div>

            {/* Swiper Card Slider */}
            <div className="w-full max-w-6xl">
                <Swiper
                    modules={[Navigation, Autoplay]}
                    spaceBetween={20}
                    slidesPerView={3}
                    navigation
                    autoplay={{ delay: 2500 }}
                    loop={true}
                    breakpoints={{
                        640: { slidesPerView: 1 },
                        768: { slidesPerView: 2 },
                        1024: { slidesPerView: 3 },
                    }}
                >
                    {products.map((product) => (
                        <SwiperSlide key={product.id}>
                            <div className="p-6 border border-gray-700 rounded-xl bg-gradient-to-t from-gray-800 to-gray-900 backdrop-blur-xl shadow-2xl flex flex-col items-center text-center transition-all hover:scale-105 hover:shadow-3xl transform duration-300 hover:rotate-3d">
                                <img src={product.image} alt={product.name} className="w-44 h-44 object-cover rounded-lg mb-4 transition-all hover:scale-110 shadow-lg" />
                                <h2 className="text-lg font-semibold text-white mb-2">{product.name}</h2>
                                <p className="text-gray-400">₹{product.price}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>

        </div>
    );
};

export default Home;
