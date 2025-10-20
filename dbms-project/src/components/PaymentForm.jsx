import React, { useState } from "react";
import axios from "axios";

export default function PaymentForm({ userId, amount }) {
  const [form, setForm] = useState({
    cardNumber: "",
    cardHolder: "",
    expiry: "",
    cvv: "",
    amount: amount || ""
  });
  const [result, setResult] = useState(null);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post("http://localhost:5000/make-payment", {
        userId,
        ...form
      });
      setResult(res.data);
    } catch (err) {
      setResult({ error: err.response?.data?.error || "Payment failed" });
    }
  };

  return (
    <div className="mt-6 border-t pt-4 border-gray-600">
      <h2 className="text-lg font-semibold text-white mb-2">Payment Details</h2>
      <form onSubmit={handleSubmit} className="space-y-2">
        <input
          name="cardNumber"
          placeholder="Card Number"
          onChange={handleChange}
          value={form.cardNumber}
          required
          className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-white"
        />
        <input
          name="cardHolder"
          placeholder="Card Holder"
          onChange={handleChange}
          value={form.cardHolder}
          required
          className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-white"
        />
        <input
          name="expiry"
          placeholder="Expiry (MM/YY)"
          onChange={handleChange}
          value={form.expiry}
          required
          className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-white"
        />
        <input
          name="cvv"
          placeholder="CVV"
          type="password"
          onChange={handleChange}
          value={form.cvv}
          required
          className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-white"
        />
        <input
          name="amount"
          placeholder="Amount"
          type="number"
          onChange={handleChange}
          value={form.amount}
          required
          className="p-2 border border-gray-600 rounded w-full bg-gray-700 text-white"
        />
        <button
          type="submit"
          className="bg-gold border border-white text-white px-6 py-3 rounded-lg shadow-md hover:bg-yellow-600"
        >
          Pay Now
        </button>
      </form>
      {result && (
        <div className="mt-4 bg-gray-900 p-4 rounded">
          <h3 className="text-white font-bold">Payment Result</h3>
          <pre className="text-green-400">{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}