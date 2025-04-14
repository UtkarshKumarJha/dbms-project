import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

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
        <nav className="bg-blue-950 p-4 flex sticky justify-between">
            <h1><Link className="text-white text-xl" to="/">ShopEz</Link></h1>
            <div>
                <Link className="text-white px-4" to="/">Home</Link>
                <Link className="text-white px-4" to="/products">Products</Link>
                <Link className="text-white px-4" to={`/cart/${userId}`}>Cart</Link>
                <Link className="text-white px-4" to="/orders">Orders</Link>

                {isAdmin && (
                    <Link className="text-white px-4" to="/admin/requests">Requests</Link>
                )}

                {userId ? (
                    <Link className="text-white px-4" to={`/profile/${userId}`}>Profile</Link>
                ) : (
                    <Link className="text-white px-4" to="/login">Login</Link>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
