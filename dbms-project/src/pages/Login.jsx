import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("http://localhost:5000/login", { email, password });
            const userId = response.data.userId;
            localStorage.setItem("token", response.data.token);
            localStorage.setItem("userId", userId);
            navigate(`/profile/${userId}`); // Redirect after successful login
        } catch (err) {
            setError("Invalid email or password");
        }
    };

    return (
        <div className="flex justify-center items-center min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-black text-white">
            <div className="bg-black/50 p-8 rounded-xl shadow-2xl w-full max-w-md backdrop-blur-md">
                <h2 className="text-3xl font-semibold text-center text-white mb-6">Login</h2>
                {error && <p className="text-red-500 text-sm text-center mb-4">{error}</p>}
                <form onSubmit={handleLogin}>
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-medium">Email</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 mt-2 border border-gray-700 bg-gray-900 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label className="block text-gray-300 text-sm font-medium">Password</label>
                        <input
                            type="password"
                            className="w-full px-4 py-3 mt-2 border border-gray-700 bg-gray-900 text-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6 flex justify-between items-center">
                        <div>
                            <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
                                Forgot Password?
                            </Link>
                        </div>
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 focus:outline-none"
                    >
                        Login
                    </button>
                </form>
                <p className="text-center text-sm text-gray-400 mt-6">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-400 hover:underline">Sign up</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
