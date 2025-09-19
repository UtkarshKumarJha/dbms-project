import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

const AdminRequestsPage = () => {
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState("");

    useEffect(() => {
        fetchRequests();
    }, []);

    const fetchRequests = async () => {
        try {
            const response = await api.get("/pending-requests");
            console.log("Requests:", response.data);
            setRequests(response.data);
        } catch (err) {
            setError("Failed to fetch requests");
        }
    };

    const approveRequest = async (request) => {
        try {
            await api.post(`/approve-seller/${request._id}`, {
                user_id: request.user._id
            });
            fetchRequests();
        } catch (err) {
            console.error("Approval failed", err);
        }
    };

    const rejectRequest = async (request_id) => {
        try {
            await api.delete(`/reject-request/${request_id}`);
            fetchRequests();
        } catch (err) {
            console.error("Rejection failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-8 text-white">
            <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="text-4xl font-extrabold mb-8 text-center"
            >
                📝 Pending Seller Requests
            </motion.h1>

            {error && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-red-400 text-center mb-6"
                >
                    {error}
                </motion.p>
            )}

            {requests.length === 0 ? (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center text-gray-400"
                >
                    No pending requests.
                </motion.p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {requests.map((req, index) => (
                        <motion.div
                            key={req.request_id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.4, delay: index * 0.1 }}
                            whileHover={{ scale: 1.02 }}
                            className="p-6 bg-gray-800 bg-opacity-50 border border-gray-700 rounded-2xl shadow-xl backdrop-blur-lg transition-all"
                        >

                            <p className="mb-2"><span className="font-semibold">Name:</span> {req.user.name}</p>

                            <p className="mb-2"><span className="font-semibold">Email:</span> {req.user.email}</p>

                            <p className="mb-2"><span className="font-semibold">Phone No:</span> {req.user.phone_no}</p>

                            <p className="mb-2"><span className="font-semibold">Business Name:</span> {req.b_name}</p>

                            <p className="mb-2"><span className="font-semibold">Description:</span> {req.b_description}</p>

                            <p className="mb-4"><span className="font-semibold">Submitted At:</span> {new Date(req.submitted_at).toLocaleString()}</p>
                            <div className="flex justify-between">
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => approveRequest(req)}
                                    className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold shadow-md transition"
                                >
                                    ✅ Approve
                                </motion.button>
                                <motion.button
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => rejectRequest(req.request_id)}
                                    className="bg-red-500 hover:bg-red-700 px-4 py-2 rounded-lg text-white font-semibold shadow-md transition"
                                >
                                    ✖ Reject
                                </motion.button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminRequestsPage;
