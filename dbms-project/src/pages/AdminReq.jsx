import React, { useEffect, useState } from "react";
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
            setRequests(response.data);
        } catch (err) {
            setError("Failed to fetch requests");
        }
    };

    const approveRequest = async (request) => {
        try {
            await api.post(`/approve-seller/${request.request_id}`, {
                user_id: request.user_id
            });
            fetchRequests(); // Refresh
        } catch (err) {
            console.error("Approval failed", err);
        }
    };

    const rejectRequest = async (request_id) => {
        try {
            await api.delete(`/reject-request/${request_id}`);
            fetchRequests(); // Refresh
        } catch (err) {
            console.error("Rejection failed", err);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 text-white p-8">
            <h1 className="text-3xl font-extrabold mb-6 text-center">Pending Seller Requests</h1>

            {error && <p className="text-red-400 mb-4 text-center">{error}</p>}

            {requests.length === 0 ? (
                <p className="text-center text-gray-300">No pending requests.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.map((req) => (
                        <div
                            key={req.request_id}
                            className="bg-gray-800 bg-opacity-60 backdrop-blur-md p-6 rounded-xl shadow-xl border border-gray-700 transition hover:shadow-2xl"
                        >
                            <p><span className="text-gray-400 font-medium">User ID:</span> {req.user_id}</p>
                            <p><span className="text-gray-400 font-medium">Business Name:</span> {req.b_name}</p>
                            <p><span className="text-gray-400 font-medium">Description:</span> {req.b_description}</p>
                            <p><span className="text-gray-400 font-medium">Submitted At:</span> {new Date(req.submitted_at).toLocaleString()}</p>

                            <div className="flex gap-4 mt-4 justify-end">
                                <button
                                    onClick={() => approveRequest(req)}
                                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => rejectRequest(req.request_id)}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-md transition"
                                >
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminRequestsPage;
