import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../services/api";

const AddDiscount = () => {
    const [productId, setProductId] = useState("");
    const [discount, setDiscount] = useState("");
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/products")
            .then(res => setProducts(res.data))
            .catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/add-discount", { product_id: productId, discount });
            alert("🎉 Discount added!");
        } catch (err) {
            alert("⚠️ Error adding discount");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.02 }}
                className="w-full max-w-xl p-8 rounded-2xl bg-gray-800 bg-opacity-60 backdrop-blur-md shadow-2xl border border-gray-700"
            >
                <h2 className="text-3xl font-bold text-white mb-6 text-center">
                    🎯 Add Discount
                </h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-200">
                            Select Product:
                        </label>
                        <select
                            value={productId}
                            onChange={(e) => setProductId(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                        >
                            <option value="">Choose product</option>
                            {products.map((p) => (
                                <option key={p.product_id} value={p.product_id}>
                                    {p.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block mb-2 text-sm font-medium text-gray-200">
                            Discount (%):
                        </label>
                        <input
                            type="number"
                            value={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            className="w-full p-3 rounded-lg bg-gray-700 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min={1}
                            max={90}
                            required
                        />
                    </div>

                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        type="submit"
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-300"
                    >
                        💾 Submit
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddDiscount;
