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
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-indigo-900 to-gray-800 p-8">
            <div className="bg-gradient-to-t from-gray-700 to-gray-900 rounded-xl shadow-2xl p-8 max-w-md w-full flex flex-col items-center">
                <h1 className="text-3xl font-bold text-white mb-6 drop-shadow-lg">Profile</h1>

                {/* Circular Profile Picture */}
                <div className="w-36 h-36 mb-6 rounded-full overflow-hidden border-4 border-teal-500 bg-gray-300 flex items-center justify-center text-3xl text-white font-semibold">
                    {profile.profile_picture ? (
                        <img
                            src={profile.profile_picture}
                            alt={`${profile.name}'s profile`}
                            className="w-full h-full object-cover"
                        />
                    ) : (
                        <span>{profile.name?.charAt(0).toUpperCase() || "?"}</span>
                    )}
                </div>

                <div className="mb-4 w-full">
                    <p className="text-lg text-gray-200"><strong>Name:</strong> {profile.name}</p>
                </div>
                <div className="mb-4 w-full">
                    <p className="text-lg text-gray-200"><strong>Email:</strong> {profile.email}</p>
                </div>
                <div className="mb-4 w-full">
                    <p className="text-lg text-gray-200"><strong>Phone:</strong> {profile.phone_no}</p>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="mt-6 w-full bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition-all ease-in-out duration-300 transform hover:scale-105">
                    Logout
                </button>
            </div>
        </div>
    );
};

export default Profile;
