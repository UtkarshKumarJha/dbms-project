import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        image: '',
        brand: '',
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
        <div className="max-w-xl mx-auto mt-10 bg-gradient-to-br from-gray-900 to-gray-800 shadow-2xl rounded-xl p-8 text-white">
            <h2 className="text-3xl font-bold mb-6 text-center text-white">Add a New Product</h2>

            {message && (
                <div className="mb-4 text-sm text-center text-black bg-green-300 px-4 py-2 rounded">
                    {message}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="text"
                    name="name"
                    placeholder="Product Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="text"
                    name="category"
                    placeholder="Category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="number"
                    name="quantity"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={handleChange}
                    min="1"
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <input
                    type="text"
                    name="image"
                    placeholder="Image URL"
                    value={formData.image}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition duration-200"
                >
                    Add Product
                </button>
            </form>
        </div>
    );
};

export default AddProduct;
