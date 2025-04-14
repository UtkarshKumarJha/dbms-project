import React, { useEffect, useState } from "react";
import api from "../services/api"; // Axios instance
import { useParams, useNavigate } from "react-router-dom";

const Profile = () => {
    const { userId } = useParams();  // Assuming userId is in the URL
    const navigate = useNavigate();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get(`/profile/${userId}`)
            .then(response => {
                console.log("Profile Data:", response.data); // Debugging line
                setProfile(response.data);
                setLoading(false);
            })
            .catch(error => {
                setError(error.response?.data?.message || "Error fetching profile");
                setLoading(false);
            });
    }, [userId]);

    // Logout function
    const handleLogout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        navigate("/login");
    };

    if (loading) return <div className="text-center text-lg p-10">Loading...</div>;
    if (error) return <div className="text-center text-lg p-10 text-red-500">{error}</div>;

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-950 to-gray-400">
            <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full flex flex-col items-center">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">Profile</h1>

                {/* Circular Profile Picture */}
                <div className="w-32 h-32 mb-6 rounded-full overflow-hidden border-4 border-blue-500 bg-gray-200 flex items-center justify-center text-2xl text-white font-semibold">
                    {profile.profile_picture ? (
                        <img
                            src={profile.profile_picture}
                            alt={`${profile.name}'s profile`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span>
                            {profile.name?.charAt(0).toUpperCase() || "?"}
                        </span>
                    )}
                </div>

                <div className="mb-4 w-full">
                    <p className="text-gray-700"><strong>Name:</strong> {profile.name}</p>
                </div>
                <div className="mb-4 w-full">
                    <p className="text-gray-700"><strong>Email:</strong> {profile.email}</p>
                </div>
                <div className="mb-4 w-full">
                    <p className="text-gray-700"><strong>Phone:</strong> {profile.phone_no}</p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="mt-6 w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;
