import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const Signup = () => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",

        phone_no: "",
        b_name: "",
        b_description: ""
    });

    const [isSeller, setIsSeller] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
            navigate("/products"); // redirect to products if already logged in
        }
    }, [navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            // Step 1: Register as user
            console.log("Form Data:", formData);
            const userResponse = await api.post("/signup", formData);
            console.log("User Response:", userResponse.data);
            const user_id = userResponse.data.user_id;

            // Step 2: If seller, send to requests table
            if (isSeller) {
                await api.post("/register-seller", {
                    user_id: user_id,
                    email: formData.email,
                    b_name: formData.b_name,
                    b_description: formData.b_description
                });
            }

            alert("Signup successful. Please log in.");
            navigate("/login");

        } catch (err) {
            console.error(err);
            setError(err.response?.data?.error || "Signup failed");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-96">
                <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>

                {error && <p className="text-red-500 text-center">{error}</p>}

                <input type="text" name="name" placeholder="Full Name" required
                    className="w-full p-2 border rounded mt-2" onChange={handleChange} />

                <input type="email" name="email" placeholder="Email" required
                    className="w-full p-2 border rounded mt-2" onChange={handleChange} />

                <input type="password" name="password" placeholder="Password" required
                    className="w-full p-2 border rounded mt-2" onChange={handleChange} />

                <input type="tel" name="phone_no" placeholder="Phone Number" required
                    className="w-full p-2 border rounded mt-2" onChange={handleChange} />

                {/* Seller toggle */}
                <label className="flex items-center mt-3">
                    <input
                        type="checkbox"
                        checked={isSeller}
                        onChange={() => setIsSeller(!isSeller)}
                        className="mr-2"
                    />
                    Register as Seller
                </label>

                {isSeller && (
                    <>
                        <input
                            type="text"
                            name="b_name"
                            placeholder="Business Name"
                            required
                            className="w-full p-2 border rounded mt-2"
                            onChange={handleChange}
                        />
                        <textarea
                            name="b_description"
                            placeholder="Business Description"
                            required
                            className="w-full p-2 border rounded mt-2"
                            onChange={handleChange}
                        />
                    </>
                )}

                <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded mt-4 hover:bg-blue-700">
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Signup;
