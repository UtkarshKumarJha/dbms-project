import React, { useState, useEffect } from "react";
import api from "../services/api";

const ReviewSection = ({ productId }) => {
    const [reviews, setReviews] = useState([]);
    const [newReview, setNewReview] = useState("");
    const [rating, setRating] = useState(5);

    // Fetch Reviews
    const fetchReviews = async () => {
        try {
            const response = await api.get(`/products/${productId}/reviews`);
            setReviews(response.data); // Set directly from API to prevent duplication
        } catch (err) {
            console.error("Error fetching reviews:", err.message);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, [productId]);


    const submitReview = async () => {
        if (!newReview.trim()) return;
        const userId = localStorage.getItem("userId");

        if (!userId) {
            alert("Please log in to submit a review.");
            return;
        }

        try {
            const orderCheck = await api.get(`/checkorder?user_id=${userId}&product_id=${productId}`);
            if (!orderCheck.data.exists) {
                alert("You can only review products you have purchased.");
                return;
            }

            await api.post(`/products/${productId}/addreviews`, {
                user_id: userId,
                review_text: newReview,
                rating: rating, // Make sure this matches your backend expectation
            });

            // Refresh reviews after submission
            fetchReviews();
            setNewReview(""); // Clear input
        } catch (err) {
            console.error("Error adding review:", err);
            alert("There was an error submitting your review.");
        }
    };


    return (
        <div className="max-w-4xl bg-white p-6 mt-10 rounded-2xl shadow-lg w-full">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Reviews</h2>

            {/* Review Input */}
            <div className="flex flex-col gap-4">
                <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="border border-gray-300 p-2 rounded-md w-full"
                >
                    {[5, 4, 3, 2, 1, 0].map((star) => (
                        <option key={star} value={star}>
                            {star > 0 ? `${star} ⭐` : 'No rating'}
                        </option>
                    ))}
                </select>
                <textarea
                    className="border border-gray-300 p-4 rounded-md w-full"
                    rows="3"
                    placeholder="Write your review..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                ></textarea>
                <button
                    onClick={submitReview}
                    className="bg-blue-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-blue-700"
                >
                    Submit Review
                </button>
            </div>

            {/* Display Reviews */}
            <div className="mt-6 space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-gray-100 p-4 rounded-lg shadow">
                            <p className="text-sm text-gray-900">User: {review.name}</p>
                            <p className="text-gray-700">{review.review_text}</p>
                            <p className="text-yellow-500">⭐ {review.rating}</p>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500">No reviews yet. Be the first to review!</p>
                )}
            </div>
        </div>
    );
};

export default ReviewSection;
