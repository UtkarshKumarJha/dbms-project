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
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-blue-900 to-blue-700 text-white px-4 py-12 flex flex-col items-center">
            <div className="text-center mb-12">
                <h1 className="text-5xl font-extrabold mb-4 drop-shadow-lg tracking-wide">
                    Welcome to <span className="text-yellow-400">ShopEz</span>
                </h1>
                <p className="text-lg text-gray-300 max-w-xl mx-auto leading-relaxed">
                    Discover top deals on gadgets and accessories. Quality guaranteed, prices unmatched.
                </p>
                <Link
                    to="/products"
                    className="mt-6 inline-block bg-yellow-400 text-indigo-900 px-8 py-3 rounded-full font-bold text-lg shadow-lg hover:bg-yellow-300 transition duration-300"
                >
                    View Products
                </Link>
            </div>

            <div className="w-full max-w-6xl">
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
                        <SwiperSlide key={product.id}>
                            <div className="p-5 bg-white bg-opacity-20 backdrop-blur-md rounded-2xl shadow-2xl border border-white/30 transition-transform transform hover:scale-105">
                                <img
                                    src={product.image}
                                    alt={product.name}
                                    className="w-full h-60 object-cover rounded-xl mb-4 border border-white/20"
                                />
                                <h2 className="text-xl font-semibold text-black mb-1 truncate">{product.name}</h2>
                                <p className="text-black-300 text-lg font-bold">₹{product.price}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default Home;
