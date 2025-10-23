import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import PaymentForm from "../components/PaymentForm";

export default function PaymentPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { userId, amount,items,locations } = location.state || {};

  useEffect(() => {
    if (!userId || !amount || !locations || !items) {
      console.log("Invalid payment session:", { userId, amount, locations, items });
      toast.error("Invalid payment session");
      navigate("/checkout");
    }
  }, [userId, amount,locations,items, navigate]);

  if (!userId || !amount || !locations || !items ) return null;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-950 to-gray-900 text-white p-6">
      <div className="w-full max-w-4xl bg-gray-800/90 p-10 rounded-2xl shadow-2xl">
        <h1 className="text-3xl font-bold mb-6 text-yellow-400 text-center">
          Secure Payment
        </h1>

        <PaymentForm userId={userId} amount={amount} items={items} location={locations} />

        <div className="flex justify-center mt-6">
          <button
            onClick={() => navigate(-1)}
            className="text-sm text-gray-400 hover:text-gray-200 underline"
          >
            ← Back to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}
