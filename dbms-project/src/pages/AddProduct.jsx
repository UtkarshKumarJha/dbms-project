import React, { useState } from 'react';
import { motion } from 'framer-motion';
import api from '../services/api';
import CryptoJS from 'crypto-js'; // npm install crypto-js

const KEY = CryptoJS.enc.Hex.parse(import.meta.env.VITE_SECRET_KEY);


const fileToWordArray = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
      resolve(wordArray);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const encryptFile = async (file) => {
  const wordArray = await fileToWordArray(file);
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(wordArray, KEY, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return {
    encryptedData: encrypted.toString(),
    iv: iv.toString(CryptoJS.enc.Hex)
  };
};



const AddProduct = () => {
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        description: '',
        category: '',
        images: [],
        video: null,
        quantity: 1,
    });

    const [message, setMessage] = useState('');
    const [dragOverImages, setDragOverImages] = useState(false);
    const [dragOverVideo, setDragOverVideo] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: name === 'quantity' ? parseInt(value) : value,
        }));
    };

    const handleImageDrop = (e) => {
        e.preventDefault();
        setDragOverImages(false);
        const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    };

    const handleVideoDrop = (e) => {
        e.preventDefault();
        setDragOverVideo(false);
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            setFormData(prev => ({ ...prev, video: file }));
        } else {
            setMessage("Only video files are allowed.");
        }
    };

    const handleImageInput = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({ ...prev, images: [...prev.images, ...files] }));
    };

    const handleVideoInput = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setFormData(prev => ({ ...prev, video: file }));
        } else {
            setMessage("Please upload a valid video file.");
        }
    };

    const encrypt = (text) => {
  const iv = CryptoJS.lib.WordArray.random(16);

  const encrypted = CryptoJS.AES.encrypt(text.toString(), KEY, {
    iv,
    mode: CryptoJS.mode.CBC,
    padding: CryptoJS.pad.Pkcs7
  });

  return JSON.stringify({
    data: encrypted.toString(),
    iv: iv.toString(CryptoJS.enc.Hex)
  });
};


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

            // Encrypt sensitive text fields
            data.append("name", encrypt(formData.name));
            data.append("price", encrypt(formData.price));
            data.append("details", encrypt(formData.description));
            data.append("category", encrypt(formData.category));
            data.append("brand", encrypt(brandRes.data.brand));
            data.append("quantity", encrypt(formData.quantity));

            // Encrypt and upload images
            for (const file of formData.images) {
                const encrypted = await encryptFile(file);
                const jsonBlob = new Blob([JSON.stringify(encrypted)], { type: "application/json" });
                data.append("images", jsonBlob, file.name + ".enc");
            }

            if (formData.video) {
            const encryptedVideo = await encryptFile(formData.video);
            const videoBlob = new Blob([JSON.stringify(encryptedVideo)], { type: "application/json" });
            data.append("video", videoBlob, formData.video.name + ".enc");
            }
            
            const response = await api.post('/add-product', data, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            setMessage(response.data.message || "Product added!");
            setFormData({ name: '', price: '', description: '', category: '', images: [], video: null, quantity: 1 });
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

                    {/* Image Upload */}
                    <div
                        onDrop={handleImageDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOverImages(true); }}
                        onDragLeave={() => setDragOverImages(false)}
                        className={`w-full p-6 border-2 rounded-lg text-center cursor-pointer transition ${
                            dragOverImages ? 'border-blue-500 bg-blue-900 bg-opacity-30' : 'border-gray-600 bg-gray-700'
                        }`}
                    >
                        <p className="text-white">Drag & Drop Images Here or Click to Upload</p>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleImageInput}
                            className="hidden"
                            id="imageInput"
                        />
                        <label htmlFor="imageInput" className="block mt-2 text-blue-400 cursor-pointer underline">
                            Browse Files
                        </label>
                    </div>

                    {/* Image Preview */}
                    <div className="flex flex-wrap gap-3 mt-3">
                        {formData.images.map((img, idx) => (
                            <div key={idx} className="relative">
                                <img
                                    src={URL.createObjectURL(img)}
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

                    {/* Video Upload */}
                    <div
                        onDrop={handleVideoDrop}
                        onDragOver={(e) => { e.preventDefault(); setDragOverVideo(true); }}
                        onDragLeave={() => setDragOverVideo(false)}
                        className={`w-full p-6 border-2 rounded-lg text-center cursor-pointer transition ${
                            dragOverVideo ? 'border-purple-500 bg-purple-900 bg-opacity-30' : 'border-gray-600 bg-gray-700'
                        }`}
                    >
                        <p className="text-white">Drag & Drop Video Here or Click to Upload</p>
                        <input
                            type="file"
                            accept="video/*"
                            onChange={handleVideoInput}
                            className="hidden"
                            id="videoInput"
                        />
                        <label htmlFor="videoInput" className="block mt-2 text-purple-400 cursor-pointer underline">
                            Browse Video
                        </label>
                    </div>

                    {/* Video Preview */}
                    {formData.video && (
                        <video
                            controls
                            className="w-full rounded-lg border border-gray-600 mt-3"
                            src={URL.createObjectURL(formData.video)}
                        />
                    )}

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
                        🚀 Add Product (Encrypted)
                    </motion.button>
                </form>
            </motion.div>
        </div>
    );
};

export default AddProduct;
