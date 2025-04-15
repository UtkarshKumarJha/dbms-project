import React from 'react';

const ProductCard = ({ product }) => (
    <div className="bg-gray-800 border border-gray-600 p-4 rounded-lg shadow-lg transition-transform transform hover:scale-105 hover:shadow-2xl">
        <h2 className="text-lg font-semibold text-yellow-500">{product.name}</h2>
        <p className="text-gray-400">{product.image}</p>
        <p className="text-yellow-400 font-bold">₹{product.price}</p>
    </div>
);

export default ProductCard;
