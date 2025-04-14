import React, { useState, useEffect } from "react";
import api from "../services/api";

const AddDiscount = () => {
    const [productId, setProductId] = useState("");
    const [discount, setDiscount] = useState("");
    const [products, setProducts] = useState([]);

    useEffect(() => {
        api.get("/products").then(res => setProducts(res.data)).catch(console.error);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/add-discount", { product_id: productId, discount });
            alert("Discount added!");
        } catch (err) {
            alert("Error adding discount");
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-lg mt-10">
            <h2 className="text-2xl font-bold mb-4">Add Discount</h2>
            <form onSubmit={handleSubmit}>
                <label className="block mb-2 font-semibold">Select Product:</label>
                <select
                    value={productId}
                    onChange={(e) => setProductId(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    required
                >
                    <option value="">Choose product</option>
                    {products.map((p) => (
                        <option key={p.product_id} value={p.product_id}>
                            {p.name}
                        </option>
                    ))}
                </select>

                <label className="block mb-2 font-semibold">Discount (%):</label>
                <input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded mb-4"
                    min={1}
                    max={90}
                    required
                />

                <button
                    type="submit"
                    className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                    Submit
                </button>
            </form>
        </div>
    );
};

export default AddDiscount;
