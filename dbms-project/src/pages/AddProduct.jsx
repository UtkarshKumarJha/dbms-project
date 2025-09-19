import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image: '',
        quantity: 1,
    });

    const [message, setMessage] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const userId = localStorage.getItem('userId');

            const payload = {
                user_id: userId,
                name: formData.name,
                price: formData.price,
                details: formData.description,
                category: formData.category,
                brand: (await api.get(`/checkbrand/${userId}`)).data.brand,
                image: formData.image,
                quantity: formData.quantity
            };

            const response = await api.post('/add-product', payload);
            setMessage(response.data.message || "Product added!");
            setFormData({
                name: '',
                price: '',
                description: '',
                category: '',
                image: '',
                quantity: 1,
            });
        } catch (error) {
            console.error("Upload error:", error);
            setMessage(error.response?.data?.message || "Error adding product.");
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-6">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                whileHover={{ scale: 1.01 }}
                className="w-full max-w-xl p-8 rounded-2xl bg-gray-800 bg-opacity-70 backdrop-blur-lg shadow-2xl border border-gray-700"
            >
                <h2 className="text-3xl font-bold text-white mb-6 text-center">🛍️ Add a New Product</h2>

                {message && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="mb-6 text-sm text-center text-white bg-green-600 px-4 py-2 rounded-lg shadow"
                    >
                        {message}
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    {[
                        { name: 'name', type: 'text', placeholder: 'Product Name' },
                        { name: 'price', type: 'number', placeholder: 'Price' },
                        { name: 'category', type: 'text', placeholder: 'Category' },
                        { name: 'quantity', type: 'number', placeholder: 'Quantity', min: 1 },
                        { name: 'image', type: 'text', placeholder: 'Image URL' },
                    ].map((field, idx) => (
                        <input
                            key={idx}
                            type={field.type}
                            name={field.name}
                            placeholder={field.placeholder}
                            value={formData[field.name]}
                            min={field.min || undefined}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                        />
                    ))}

                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />

                    <motion.button
                        type="submit"
                        whileTap={{ scale: 0.95 }}
                        whileHover={{ scale: 1.05 }}
                        className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-lg transition duration-300"
                    >
                        🚀 Add Product
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddProduct;
