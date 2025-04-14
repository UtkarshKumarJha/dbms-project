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
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-950 to-gray-400 text-white p-10">

            <div className="text-center mb-10">
                <h1 className="text-4xl font-extrabold mb-3 drop-shadow-lg">Welcome to ShopEz</h1>
                <p className="text-lg text-gray-200 max-w-lg mx-auto">
                    Discover the best deals on tech accessories and gadgets. Quality products at unbeatable prices!
                </p>
                <Link to="/products" className="mt-5 inline-block bg-white text-blue-600 px-6 py-3 rounded-full font-semibold text-lg shadow-md hover:bg-blue-100 transition">
                    View Products
                </Link>
            </div>

            {/* Swiper Card Slider */}
            <div className="w-full max-w-5xl">
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
                            <div className="p-4 border rounded-xl bg-white bg-opacity-20 backdrop-blur-lg shadow-lg flex flex-col items-center text-center">
                                <img src={product.image} alt={product.name} className="w-40 h-40 object-cover rounded-lg mb-3" />
                                <h2 className="text-lg font-semibold text-black">{product.name}</h2>
                                <p className="text-gray-500">₹{product.price}</p>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>
            </div>
        </div>
    );
};

export default Home;
