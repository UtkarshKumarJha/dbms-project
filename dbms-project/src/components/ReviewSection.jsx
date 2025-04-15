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
                rating: rating,
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
        <div className="max-w-4xl bg-gray-900 p-6 mt-10 rounded-2xl shadow-lg w-full">
            <h2 className="text-2xl font-bold text-yellow-500 mb-4">Reviews</h2>

            {/* Review Input */}
            <div className="flex flex-col gap-4">
                <select
                    value={rating}
                    onChange={(e) => setRating(Number(e.target.value))}
                    className="border border-gray-500 p-2 rounded-md w-full bg-gray-700 text-yellow-500"
                >
                    {[5, 4, 3, 2, 1].map((star) => (
                        <option key={star} value={star}>
                            {star > 0 ? `${star} ⭐` : 'No rating'}
                        </option>
                    ))}
                </select>
                <textarea
                    className="border border-gray-500 p-4 rounded-md w-full bg-gray-700 text-yellow-500"
                    rows="3"
                    placeholder="Write your review..."
                    value={newReview}
                    onChange={(e) => setNewReview(e.target.value)}
                ></textarea>
                <button
                    onClick={submitReview}
                    className="bg-yellow-600 text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-700"
                >
                    Submit Review
                </button>
            </div>

            {/* Display Reviews */}
            <div className="mt-6 space-y-4">
                {reviews.length > 0 ? (
                    reviews.map((review) => (
                        <div key={review.id} className="bg-gray-800 p-4 rounded-lg shadow">
                            <p className="text-sm text-yellow-500">User: {review.name}</p>
                            <p className="text-gray-300">{review.review_text}</p>
                            <p className="text-yellow-400">⭐ {review.rating}</p>
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
