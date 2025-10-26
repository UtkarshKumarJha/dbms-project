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
    const [passwordStrength, setPasswordStrength] = useState({
        isValid: false,
        message: "",
        strength: ""
    });
    const navigate = useNavigate();

    useEffect(() => {
        const isLoggedIn = localStorage.getItem("userId");
        if (isLoggedIn) {
            navigate("/products");
        }
    }, [navigate]);

    const checkPasswordStrength = (password) => {
        if (password.length === 0) {
            return { isValid: false, message: "", strength: "" };
        }

        const minLength = 8;
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumber = /[0-9]/.test(password);
        const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);

        let strength = 0;
        let messages = [];

        if (password.length < minLength) {
            messages.push(`at least ${minLength} characters`);
        } else {
            strength++;
        }

        if (!hasUpperCase) {
            messages.push("one uppercase letter");
        } else {
            strength++;
        }

        if (!hasLowerCase) {
            messages.push("one lowercase letter");
        } else {
            strength++;
        }

        if (!hasNumber) {
            messages.push("one number");
        } else {
            strength++;
        }

        if (!hasSpecialChar) {
            messages.push("one special character");
        } else {
            strength++;
        }

        const isValid = messages.length === 0;
        const message = isValid 
            ? "Strong password!" 
            : `Password must include: ${messages.join(", ")}`;

        let strengthLevel = "";
        if (strength <= 2) strengthLevel = "weak";
        else if (strength <= 3) strengthLevel = "medium";
        else if (strength <= 4) strengthLevel = "good";
        else strengthLevel = "strong";

        return { isValid, message, strength: strengthLevel };
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });

        if (name === "password") {
            setPasswordStrength(checkPasswordStrength(value));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!passwordStrength.isValid) {
            setError("Please use a stronger password");
            return;
        }

        try {
            console.log("Form Data:", formData);
            const userResponse = await api.post("/signup", formData);
            console.log("User Response:", userResponse.data);
            const user_id = userResponse.data.user_id;

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
            setError(err.response?.data?.message || "Signup failed");
        }
    };

    const getStrengthColor = () => {
        switch (passwordStrength.strength) {
            case "weak": return "text-red-500";
            case "medium": return "text-yellow-500";
            case "good": return "text-blue-500";
            case "strong": return "text-green-500";
            default: return "text-gray-400";
        }
    };

    const getStrengthBarColor = () => {
        switch (passwordStrength.strength) {
            case "weak": return "bg-red-500";
            case "medium": return "bg-yellow-500";
            case "good": return "bg-blue-500";
            case "strong": return "bg-green-500";
            default: return "bg-gray-600";
        }
    };

    const getStrengthWidth = () => {
        switch (passwordStrength.strength) {
            case "weak": return "w-1/4";
            case "medium": return "w-2/4";
            case "good": return "w-3/4";
            case "strong": return "w-full";
            default: return "w-0";
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-800 to-gray-600">
            <form onSubmit={handleSubmit} className="bg-gray-900 p-8 rounded-lg shadow-2xl w-96 transition-all transform hover:scale-105 hover:shadow-3xl">
                <h2 className="text-3xl font-bold text-center mb-6 text-white drop-shadow-lg">Sign Up</h2>

                {error && <p className="text-red-500 text-center mb-3">{error}</p>}

                <input type="text" name="name" placeholder="Full Name" required
                    className="w-full p-3 border-2 border-gray-700 rounded mt-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" onChange={handleChange} />

                <input type="email" name="email" placeholder="Email" required
                    className="w-full p-3 border-2 border-gray-700 rounded mt-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" onChange={handleChange} />

                <div className="mt-2">
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        required
                        className="w-full p-3 border-2 border-gray-700 rounded bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" 
                        onChange={handleChange} 
                    />
                    
                    {formData.password && (
                        <>
                            <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                                <div 
                                    className={`h-2 rounded-full transition-all duration-300 ${getStrengthBarColor()} ${getStrengthWidth()}`}
                                ></div>
                            </div>
                            <p className={`text-xs mt-1 ${getStrengthColor()}`}>
                                {passwordStrength.message}
                            </p>
                        </>
                    )}
                </div>

                <input type="tel" name="phone_no" placeholder="Phone Number" required
                    className="w-full p-3 border-2 border-gray-700 rounded mt-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600" onChange={handleChange} />

                <label className="flex items-center mt-3 text-white">
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
                            className="w-full p-3 border-2 border-gray-700 rounded mt-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            onChange={handleChange}
                        />
                        <textarea
                            name="b_description"
                            placeholder="Business Description"
                            required
                            className="w-full p-3 border-2 border-gray-700 rounded mt-2 bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                            onChange={handleChange}
                        />
                    </>
                )}

                <button 
                    type="submit" 
                    className="w-full bg-blue-600 text-white py-3 rounded-lg mt-4 hover:bg-blue-700 transition-all transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={formData.password && !passwordStrength.isValid}
                >
                    Sign Up
                </button>
            </form>
        </div>
    );
};

export default Signup;