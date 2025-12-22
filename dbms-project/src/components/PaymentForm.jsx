import React, { useMemo, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const cardTypeFromNumber = (num = "") => {
  const n = num.replace(/\s+/g, "");
  if (/^4[0-9]{0,}$/.test(n)) return "visa";
  if (/^(5[1-5]|2[2-7])[0-9]{0,}$/.test(n)) return "mastercard";
  if (/^3[47][0-9]{0,}$/.test(n)) return "amex";
  if (/^(6011|65|64[4-9]|622)[0-9]{0,}$/.test(n)) return "discover";
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

const validateExpiry = (expiry) => {
  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiry)) {
    return { valid: false, message: "Invalid format (MM/YY)" };
  }

  const [month, year] = expiry.split("/").map(Number);
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear() % 100;
  const currentMonth = currentDate.getMonth() + 1;

  if (year < currentYear) {
    return { valid: false, message: "Card has expired" };
  }

  if (year === currentYear && month < currentMonth) {
    return { valid: false, message: "Card has expired" };
  }

  // Check if expiry is too far in future (more than 10 years)
  if (year > currentYear + 10) {
    return { valid: false, message: "Invalid expiry year" };
  }

  return { valid: true, message: "Valid expiry" };
};

const validateCardLength = (cardNumber, cardType) => {
  const cleanNumber = cardNumber.replace(/\s+/g, "");
  
  if (cardType === "amex") {
    return cleanNumber.length === 15;
  }
  return cleanNumber.length === 16;
};

const validateCVV = (cvv, cardType) => {
  if (cardType === "amex") {
    return /^\d{4}$/.test(cvv);
  }
  return /^\d{3}$/.test(cvv);
};

export default function PaymentForm({ userId, amount, items, location }) {
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [loading, setLoading] = useState("");
  const [errors, setErrors] = useState({});

  const navigate = useNavigate();

  const cardType = useMemo(() => cardTypeFromNumber(cardNumber), [cardNumber]);
  const isValidCard = useMemo(() => luhnCheck(cardNumber), [cardNumber]);
  const expiryValidation = useMemo(() => validateExpiry(expiry), [expiry]);

  const validateForm = () => {
    const newErrors = {};

    // Card holder validation
    if (!cardHolder.trim()) {
      newErrors.cardHolder = "Card holder name is required";
    } else if (cardHolder.trim().length < 3) {
      newErrors.cardHolder = "Name too short";
    } else if (!/^[a-zA-Z\s]+$/.test(cardHolder)) {
      newErrors.cardHolder = "Only letters allowed";
    }

    // Card number validation
    if (!cardNumber) {
      newErrors.cardNumber = "Card number is required";
    } else if (!isValidCard) {
      newErrors.cardNumber = "Invalid card number";
    } else if (!validateCardLength(cardNumber, cardType)) {
      newErrors.cardNumber = `Invalid length for ${cardType}`;
    } else if (cardType === "unknown") {
      newErrors.cardNumber = "Card type not supported";
    }

    // Expiry validation
    if (!expiry) {
      newErrors.expiry = "Expiry date is required";
    } else if (!expiryValidation.valid) {
      newErrors.expiry = expiryValidation.message;
    }

    // CVV validation
    if (!cvv) {
      newErrors.cvv = "CVV is required";
    } else if (!validateCVV(cvv, cardType)) {
      newErrors.cvv = cardType === "amex" ? "AmEx requires 4 digits" : "CVV must be 3 digits";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error("Please fix all errors before submitting");
      return;
    }

    // Additional security check for amount
    if (!amount || amount <= 0) {
      toast.error("Invalid payment amount");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post("http://localhost:5000/make-payment", {
        userId,
        amount,
        cardNumber: cardNumber.replace(/\s/g, ""),
        cardHolder: cardHolder.trim(),
        expiry,
        cvv,
        cardType
      });

      if (res.data.status === "success") {
        toast.success("Payment successful!");
        await api.post("create-order", { userId, items, location });
        
        // Clear sensitive data
        setCardNumber("");
        setCardHolder("");
        setExpiry("");
        setCvv("");
        
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

  const handleCardNumberChange = (e) => {
    const formatted = formatCardNumber(e.target.value);
    setCardNumber(formatted);
    if (errors.cardNumber) {
      setErrors(prev => ({ ...prev, cardNumber: "" }));
    }
  };

  const handleExpiryChange = (e) => {
    const formatted = formatExpiry(e.target.value);
    setExpiry(formatted);
    if (errors.expiry) {
      setErrors(prev => ({ ...prev, expiry: "" }));
    }
  };

  const handleCvvChange = (e) => {
    const maxLength = cardType === "amex" ? 4 : 3;
    const value = e.target.value.replace(/\D/g, "").slice(0, maxLength);
    setCvv(value);
    if (errors.cvv) {
      setErrors(prev => ({ ...prev, cvv: "" }));
    }
  };

  const handleCardHolderChange = (e) => {
    setCardHolder(e.target.value.toUpperCase());
    if (errors.cardHolder) {
      setErrors(prev => ({ ...prev, cardHolder: "" }));
    }
  };

  return (
    <div className="w-full">
      <form
        onSubmit={handleSubmit}
        className="space-y-4 bg-gray-800 p-6 rounded-xl shadow-lg"
      >
        {/* Card Holder */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Card Holder *
          </label>
          <input
            type="text"
            value={cardHolder}
            onChange={handleCardHolderChange}
            placeholder="Full Name"
            className={`w-full p-3 rounded bg-gray-900 border ${
              errors.cardHolder ? "border-red-500" : "border-gray-700"
            } text-white focus:ring-2 focus:ring-yellow-500`}
            required
          />
          {errors.cardHolder && (
            <p className="text-red-400 text-xs mt-1">{errors.cardHolder}</p>
          )}
        </div>

        {/* Card Number */}
        <div>
          <label className="block text-sm text-gray-300 mb-1">
            Card Number *
          </label>
          <div className="relative">
            <input
              type="text"
              value={cardNumber}
              onChange={handleCardNumberChange}
              placeholder="1234 5678 9012 3456"
              maxLength={19}
              className={`w-full p-3 rounded bg-gray-900 border ${
                errors.cardNumber ? "border-red-500" : 
                cardNumber && isValidCard ? "border-green-500" : "border-gray-700"
              } text-white focus:ring-2 focus:ring-yellow-500`}
              required
            />
            {cardType !== "unknown" && cardNumber.length > 4 && (
              <span className="absolute right-3 top-3 text-xs text-gray-400 uppercase">
                {cardType}
              </span>
            )}
          </div>
          {errors.cardNumber && (
            <p className="text-red-400 text-xs mt-1">{errors.cardNumber}</p>
          )}
          {cardNumber && isValidCard && !errors.cardNumber && (
            <p className="text-green-400 text-xs mt-1">✓ Valid card number</p>
          )}
        </div>

        {/* Expiry and CVV */}
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">
              Expiry (MM/YY) *
            </label>
            <input
              type="text"
              value={expiry}
              onChange={handleExpiryChange}
              placeholder="MM/YY"
              maxLength={5}
              className={`w-full p-3 rounded bg-gray-900 border ${
                errors.expiry ? "border-red-500" :
                expiry && expiryValidation.valid ? "border-green-500" : "border-gray-700"
              } text-white focus:ring-2 focus:ring-yellow-500`}
              required
            />
            {errors.expiry && (
              <p className="text-red-400 text-xs mt-1">{errors.expiry}</p>
            )}
            {expiry && expiryValidation.valid && !errors.expiry && (
              <p className="text-green-400 text-xs mt-1">✓ Valid</p>
            )}
          </div>

          <div className="flex-1">
            <label className="block text-sm text-gray-300 mb-1">
              CVV * {cardType === "amex" && "(4 digits)"}
            </label>
            <input
              type="password"
              value={cvv}
              onChange={handleCvvChange}
              placeholder={cardType === "amex" ? "1234" : "123"}
              maxLength={cardType === "amex" ? 4 : 3}
              className={`w-full p-3 rounded bg-gray-900 border ${
                errors.cvv ? "border-red-500" : "border-gray-700"
              } text-white focus:ring-2 focus:ring-yellow-500`}
              required
            />
            {errors.cvv && (
              <p className="text-red-400 text-xs mt-1">{errors.cvv}</p>
            )}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-gray-900 p-3 rounded-lg border border-gray-700">
          <p className="text-xs text-gray-400 flex items-center gap-2">
            <span className="text-green-400">🔒</span>
            Your payment information is encrypted and secure
          </p>
        </div>

        {/* Submit Button */}
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
            } transition-all`}
          >
            {loading ? "Processing..." : "Pay Securely"}
          </button>
        </div>
      </form>
    </div>
  );
}