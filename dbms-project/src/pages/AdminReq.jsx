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
        <div className="min-h-screen bg-gray-100 p-8">
            <h1 className="text-3xl font-bold mb-6">Pending Seller Requests</h1>

            {error && <p className="text-red-500 mb-4">{error}</p>}

            {requests.length === 0 ? (
                <p>No pending requests.</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requests.map((req) => (
                        <div key={req.request_id} className="bg-white p-6 rounded shadow">
                            <p><strong>User ID:</strong> {req.user_id}</p>
                            <p><strong>Business Name:</strong> {req.b_name}</p>
                            <p><strong>Description:</strong> {req.b_description}</p>
                            <p><strong>Submitted At:</strong> {new Date(req.submitted_at).toLocaleString()}</p>

                            <div className="flex gap-4 mt-4">
                                <button
                                    onClick={() => approveRequest(req)}
                                    className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                >
                                    Approve
                                </button>
                                <button
                                    onClick={() => rejectRequest(req.request_id)}
                                    className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
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
