import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const cardTypeFromNumber = (num = "") => {
  const n = num.replace(/\s+/g, "");
  if (/^4[0-9]{0,}$/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])[0-9]{0,}$/.test(n)) return "mastercard";
  return "unknown";
};

const luhnCheck = (value = "") => {
  const str = value.replace(/\s+/g, "");
  let sum = 0;
  let shouldDouble = false;
  for (let i = str.length - 1; i >= 0; i--) {
    let digit = parseInt(str.charAt(i), 10);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }
  return str.length > 0 && sum % 10 === 0;
};

const formatCardNumber = (val = "") =>
  val.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();

const formatExpiry = (val = "") => {
  const digits = val.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

export default function PaymentForm({ userId, amount,items,location }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const cardType = useMemo(() => cardTypeFromNumber(cardNumber), [cardNumber]);
  const isValidCard = useMemo(() => luhnCheck(cardNumber), [cardNumber]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidCard) return toast.error("Invalid card number");
    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry))
      return toast.error("Invalid expiry format");
    if (!/^\d{3,4}$/.test(cvv)) return toast.error("Invalid CVV");

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/make-payment", {
        userId,
        amount,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolder,
        expiry,
        cvv,
      });

      if (res.data.status === "success") {
        toast.success("Payment successful!");
        await api.post("create-order", { userId, items,location });
        navigate("/orders");
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || "Payment failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        <div>
          <label className="block text-sm text-gray-300 mb-1">Card Holder</label>
          <input
            type="text"
            value={cardHolder}
            onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
            placeholder="Full Name"
            className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500"
          />
        </div>

        <div>
          <label className="block text-sm text-gray-300 mb-1">Card Number</label>
          <input
            type="text"
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            placeholder="1234 5678 9012 3456"
            maxLength={19}
            className={`w-full p-3 rounded bg-gray-900 border ${
              cardNumber && !isValidCard ? "border-red-500" : "border-gray-700"
            } text-white focus:ring-2 focus:ring-yellow-500`}
          />
        </div>

        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">
              Expiry (MM/YY)
            </label>
            <input
              type="text"
              value={expiry}
              onChange={(e) => setExpiry(formatExpiry(e.target.value))}
              placeholder="MM/YY"
              maxLength={5}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">CVV</label>
            <input
              type="password"
              value={cvv}
              onChange={(e) =>
                setCvv(e.target.value.replace(/\D/g, "").slice(0, 4))
              }
              placeholder="123"
              maxLength={4}
              className="w-full p-3 rounded bg-gray-900 border border-gray-700 text-white focus:ring-2 focus:ring-yellow-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-700">
          <span className="text-lg font-semibold text-yellow-400">
            ₹{(amount || 0).toFixed(2)}
          </span>
          <button
            type="submit"
            disabled={loading}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              loading
                ? "bg-yellow-700 cursor-not-allowed"
                : "bg-yellow-500 hover:bg-yellow-600"
            }`}
          >
            {loading ? "Processing..." : "Pay Securely"}
          </button>
        </div>
      </form>
    </div>
  );
}
