import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { toast } from "react-toastify";

const baseURL = import.meta.env.VITE_API_BASE_URL || ""; // If using CRA, switch to process.env.REACT_APP_API_BASE_URL

const isObjectId = (s) => /^[a-f\d]{24}$/i.test(s || "");
const isDataUri = (s) => typeof s === "string" && s.startsWith("data:");
const isBase64Like = (s) => typeof s === "string" && /^[A-Za-z0-9+/]+=*$/.test(s) && s.length > 100; // heuristic
const isAbsoluteUrl = (s) => typeof s === "string" && (s.startsWith("http://") || s.startsWith("https://"));
const isPathLike = (s) => typeof s === "string" && s.startsWith("/");

const getImageSrc = (img) => {
  if (!img) return "/placeholder.png"; // place a real placeholder in public/
  if (isDataUri(img)) return img;
  if (isAbsoluteUrl(img)) return img;
  if (isPathLike(img)) return `${baseURL}${img}`; // server-relative path like /image/<id> or /uploads/...
  if (isObjectId(img)) return `${baseURL}/image/${img}`; // GridFS file id -> our image endpoint
  if (isBase64Like(img)) return `data:image/jpeg;base64,${img}`; // raw base64 without prefix
  // Last resort: try as-is but fallback if it 404s will be handled by <img onError>
  return img;
};

const OrderSummary = ({ order }) => {
  const [stockMap, setStockMap] = useState({});
  const [loadingStock, setLoadingStock] = useState(true);

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);

  useEffect(() => {
    const fetchStock = async () => {
      try {
        const productIds = order.items.map(item => item.product_id).join(",");
        if (!productIds) {
          setStockMap({});
          setLoadingStock(false);
          return;
        }
        const response = await api.get(`/products/stock-check?ids=${productIds}`);

        const stockObj = {};
        (response.data || []).forEach(p => {
          const id = p._id || p.product_id || p.id;
          stockObj[id] = p.quantity ?? p.qty ?? 0;
        });

        setStockMap(stockObj);
        setLoadingStock(false);
      } catch (err) {
        console.error("Failed to fetch stock", err);
        setStockMap({});
        setLoadingStock(false);
      }
    };

    if (order?.items?.length > 0) {
      fetchStock();
    } else {
      setLoadingStock(false);
    }
  }, [order]);

  const handleCancelOrder = async () => {
    const reason = prompt("Please enter a reason for cancellation:");
    if (!reason) return;

    try {
      const response = await api.put(`/orders/${order.order_id}/cancel`, { reason });

      if (response.status === 200) {
        toast.success("Order cancelled successfully.");
        setTimeout(() => window.location.reload(), 1200);
      } else {
        toast.error("Failed to cancel order. Try again later.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while cancelling the order.");
    }
  };

  const subtotal = order?.items?.reduce((acc, item) => acc + item.price * item.quantity, 0) || 0;

  const totalDiscount = order?.items?.reduce((acc, item) => {
    if (item.discount) {
      return acc + (item.price * item.discount / 100) * item.quantity;
    }
    return acc;
  }, 0) || 0;

  const totalAfterDiscount = subtotal - totalDiscount;

  const isCancelable = !["Cancelled", "Delivered"].includes(order?.status);

  const calculateDiscountedPrice = (item) => {
    if (item.discount) {
      const discountAmount = (item.price * item.discount) / 100;
      return item.price - discountAmount;
    }
    return item.price;
  };

  return (
    <div
      key={order?.order_id}
      className="bg-gray-800 p-6 rounded-lg shadow-lg mb-4 transition transform hover:scale-105 border border-gray-500"
    >
      <h2 className="text-xl font-semibold text-yellow-500">
        Order #{order?.order_id ?? "N/A"}
      </h2>
      <p className="text-gray-300"><strong>Status:</strong> {order?.status || "Pending"}</p>
      <p className="text-gray-300"><strong>Delivery Address:</strong> {order?.location || "Not Available"}</p>
      <p className="text-gray-300"><strong>Date:</strong> {order?.date ? new Date(order.date).toLocaleDateString() : "Not Available"}</p>
      <p className="text-yellow-400 font-bold"><strong>Total:</strong> {formatCurrency(order?.total_price || 0)}</p>

      <div className="mt-4 space-y-3">
        {order?.items?.length > 0 ? (
          order.items.map((item) => {
            const availableQty = stockMap[item.product_id];
            const isOutOfStock = availableQty !== undefined && item.quantity > availableQty;
            const discountedPrice = calculateDiscountedPrice(item);

            // image candidate: item.image || item.product_image || item.product_image_url || item.product?.images?.[0]
            const imgCandidate = item.image || item.product_image || (item.product && item.product.images && item.product.images[0]) || null;
            const imgSrc = getImageSrc(imgCandidate);

            return (
              <div
                key={`${order.order_id}-${item.product_id}`}
                className="flex items-center space-x-6 bg-gray-700 p-4 rounded-lg shadow"
              >
                <img
                  src={imgSrc}
                  alt={item.name || "Product"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/placeholder.png";
                  }}
                  className="w-20 h-20 object-cover rounded-lg"
                />
                <div>
                  <p className="text-lg font-semibold text-yellow-300">
                    <Link
                      to={`/product/${item.product_id}`}
                      className="text-yellow-500 hover:underline"
                    >
                      {item.name || "Product Name"}
                    </Link>
                  </p>
                  <p className="text-gray-400"><strong>Quantity:</strong> {item.quantity}</p>
                  <p className="text-gray-300">
                    <strong>Price:</strong> {formatCurrency(item.price)}
                  </p>
                  {item.discount>0 && (
                    <p className="text-gray-400">
                      <strong>Price After Discount:</strong> {formatCurrency(discountedPrice)} × {item.quantity} = {formatCurrency(discountedPrice * item.quantity)}
                    </p>
                  )}
                  {isOutOfStock && (
                    <p className="text-red-400 font-semibold">Item out of stock (available: {availableQty})</p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-gray-500">No products found in this order.</p>
        )}
      </div>

      {isCancelable && (
        <div className="mt-6">
          <button
            onClick={handleCancelOrder}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition"
          >
            Cancel Order
          </button>
        </div>
      )}
    </div>
  );
};

export default OrderSummary;
