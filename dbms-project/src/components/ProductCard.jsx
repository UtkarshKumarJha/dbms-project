import React from 'react';

const ProductCard = ({ product }) => (
    <div
        style={{
            border: '1px solid #333',
            padding: '1rem',
            borderRadius: '1rem',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
            background: 'linear-gradient(to bottom right, #1e293b, #0f172a)',
            color: '#fff',
            textAlign: 'center',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transformStyle: 'preserve-3d',
            cursor: 'pointer',
        }}
        onMouseEnter={e => {
            e.currentTarget.style.transform = 'perspective(1000px) rotateY(5deg) rotateX(5deg)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.5)';
        }}
        onMouseLeave={e => {
            e.currentTarget.style.transform = 'perspective(1000px) rotateY(0deg) rotateX(0deg)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
        }}
    >
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.5rem' }}>{product.name}</h2>
        <img
            src={product.image}
            alt={product.name}
            style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '0.5rem', marginBottom: '0.5rem' }}
        />
        <p style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '1.1rem' }}>₹{product.price}</p>
    </div>
);

export default ProductCard;
