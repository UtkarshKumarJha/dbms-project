import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import logo from '../assets/logo.png';


const Navbar = () => {
    const userId = localStorage.getItem("userId");
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdmin = async () => {
            if (userId) {
                try {
                    const response = await api.get(`/is-admin/${userId}`);
                    setIsAdmin(response.data.isAdmin);
                } catch (error) {
                    console.error("Failed to check admin:", error);
                }
            }
        };
        checkAdmin();
    }, [userId]);

    return (
        <nav className="bg-gray-900 p-4 flex sticky justify-between shadow-lg">
            <h1>
                <Link
                    className="flex items-center space-x-2 text-yellow-500 text-xl font-bold hover:text-yellow-400 transition duration-300"
                    to="/"
                >
                    <img src={logo} alt="Bazario Logo" className="w-8 h-8" />

                    <span>BAZARIO</span>
                </Link>
            </h1>

            <div className="flex items-center space-x-4">
                <Link
                    className="text-white px-4 hover:text-yellow-500 transition duration-300"
                    to="/"
                >
                    Home
                </Link>
                <Link
                    className="text-white px-4 hover:text-yellow-500 transition duration-300"
                    to="/products"
                >
                    Products
                </Link>
                <Link
                    className="text-white px-4 hover:text-yellow-500 transition duration-300"
                    to={`/cart/${userId}`}
                >
                    Cart
                </Link>
                <Link
                    className="text-white px-4 hover:text-yellow-500 transition duration-300"
                    to="/orders"
                >
                    Orders
                </Link>

                {isAdmin && (
                    <Link
                        className="text-white px-4 hover:text-yellow-500 transition duration-300"
                        to="/admin/requests"
                    >
                        Requests
                    </Link>
                )}

                {userId ? (
                    <Link
                        className="text-white px-4 hover:text-yellow-500 transition duration-300"
                        to={`/profile/${userId}`}
                    >
                        Profile
                    </Link>
                ) : (
                    <Link
                        className="text-white px-4 hover:text-yellow-500 transition duration-300"
                        to="/login"
                    >
                        Login
                    </Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
