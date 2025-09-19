import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';

const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        images: [],  // array for multiple images
        video: '',
        quantity: 1,
    });

    const [message, setMessage] = useState('');
    const [dragOver, setDragOver] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) : value,
        }));
    };

    // Drag & drop handlers
    const handleDrop = (e) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    };

    const handleImageInput = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => setDragOver(false);

    const removeImage = (idx) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, i) => i !== idx),
        }));
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const userId = localStorage.getItem('userId');
        const brandRes = await api.get(`/checkbrand/${userId}`);

        const data = new FormData();
        data.append("user_id", userId);
        data.append("name", formData.name);
        data.append("price", formData.price);
        data.append("details", formData.description);
        data.append("category", formData.category);
        data.append("brand", brandRes.data.brand);
        data.append("quantity", formData.quantity);

        formData.images.forEach((file) => {
            data.append("images", file); // multiple images
        });

        const response = await api.post('/add-product', data, {
            headers: { "Content-Type": "multipart/form-data" }
        });

        setMessage(response.data.message || "Product added!");
        setFormData({ name: '', price: '', description: '', category: '', images: [], video: '', quantity: 1 });
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
                className="w-full max-w-2xl p-8 rounded-2xl bg-gray-800 bg-opacity-70 backdrop-blur-lg shadow-2xl border border-gray-700"
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
                    {/* Basic fields */}
                    {[
                        { name: 'name', type: 'text', placeholder: 'Product Name' },
                        { name: 'price', type: 'number', placeholder: 'Price' },
                        { name: 'category', type: 'text', placeholder: 'Category' },
                        { name: 'quantity', type: 'number', placeholder: 'Quantity', min: 1 },
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

                    {/* Drag and Drop for images */}
                    <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        className={`w-full p-6 border-2 rounded-lg text-center cursor-pointer transition ${
                            dragOver ? 'border-blue-500 bg-blue-900 bg-opacity-30' : 'border-gray-600 bg-gray-700'
                        }`}
                    >
                        <p className="text-white">Drag & Drop Images Here or Click to Upload</p>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageInput}
                            className="hidden"
                            id="fileInput"
                        />
                        <label htmlFor="fileInput" className="block mt-2 text-blue-400 cursor-pointer underline">
                            Browse Files
                        </label>
                    </div>

                    {/* Image preview */}
                    <div className="flex flex-wrap gap-3 mt-3">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative">
                                <img
                                    src={img}
                                    alt={`preview-${idx}`}
                                    className="w-24 h-24 object-cover rounded-lg border border-gray-600"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-6 h-6 text-xs"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Video URL */}
                    <input
                        type="text"
                        name="video"
                        placeholder="Video URL (optional)"
                        value={formData.video}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />

                    {/* Description */}
                    <textarea
                        name="description"
                        placeholder="Description"
                        value={formData.description}
                        onChange={handleChange}
                        rows={4}
                        required
                        className="w-full px-4 py-3 bg-gray-700 text-white border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder-gray-400"
                    />

                    {/* Submit */}
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
