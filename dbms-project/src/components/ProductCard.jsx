import React from 'react';
const ProductCard = ({ product }) => (
    <div className="border p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold">{product.name}</h2>
        <p className="text-gray-600">{product.image}</p>
        <p className="text-blue-600 font-bold">₹{product.price}</p>
    </div>
);

export default ProductCard;
