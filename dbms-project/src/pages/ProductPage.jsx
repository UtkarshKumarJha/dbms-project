import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedDiscount, setSelectedDiscount] = useState("All");
    const [isSeller, setIsSeller] = useState(false);

    const userId = localStorage.getItem("userId"); // Assuming user ID is stored in localStorage

    useEffect(() => {
        api.get("/products")
            .then(response => {
                setProducts(response.data);
            })
            .catch(error => {
                console.error("Error fetching products:", error);
            });

        // Check if user is a seller
        if (userId) {
            api.get(`/is-verified/${userId}`)
                .then(response => {
                    setIsSeller(response.data.isSeller); // Backend should return { isSeller: true/false }
                })
                .catch(error => {
                    console.error("Error checking seller status:", error);
                });
        }
    }, [userId]);

    // Get unique categories and brands for filters
    const categories = ["All", ...new Set(products.map(product => product.category))];
    const brands = ["All", ...new Set(products.map(product => product.brand))];

    // Filtering Logic
    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPrice =
            (!minPrice || product.price >= parseFloat(minPrice)) &&
            (!maxPrice || product.price <= parseFloat(maxPrice));

        const matchesDiscount =
            selectedDiscount === "All" ||
            (product.discount >= parseInt(selectedDiscount));

        return matchesCategory && matchesBrand && matchesSearch && matchesPrice && matchesDiscount;
    });

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-blue-950 to-gray-400 text-black p-10">
            <h1 className="text-4xl font-extrabold text-white mb-2">Our Products</h1>
            <p className="text-white text-lg mb-6">Find the best gadgets & accessories for your needs</p>

            {/* Show Add Product Button Only If User is a Seller */}
            {isSeller && (
                <Link
                    to="/add-product"
                    className="mb-6 px-6 py-3 bg-green-600 text-white rounded-lg font-semibold shadow-md hover:bg-green-700 transition"
                >
                    + Add Product
                </Link>
            )}

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search for products..."
                className="mb-4 px-4 py-2 border border-gray-300 rounded-lg shadow-md w-72"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Filters Container */}
            <div className="flex flex-wrap gap-4 mb-6 justify-center">
                <div className="text-white font-bold">Filter Based On:</div>
                {/* Category Filter */}
                <div className="text-white">Category:</div>
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((category, index) => (
                        <option key={index} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {/* Brand Filter */}
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-md"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                >
                    {brands.map((brand, index) => (
                        <option key={index} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>

                {/* Price Range Filter */}
                <input
                    type="number"
                    placeholder="Min Price"
                    className="px-3 py-2 border border-gray-300 rounded-lg shadow-md w-28"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, e.target.value))}
                />
                <input
                    type="number"
                    placeholder="Max Price"
                    className="px-3 py-2 border border-gray-300 rounded-lg shadow-md w-28"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(0, e.target.value))}
                />

                {/* Discount Filter */}
                <select
                    className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-md"
                    value={selectedDiscount}
                    onChange={(e) => setSelectedDiscount(e.target.value)}
                >
                    <option value="All">Any Discount</option>
                    <option value="10">10% or more</option>
                    <option value="20">20% or more</option>
                    <option value="30">30% or more</option>
                    <option value="40">40% or more</option>
                </select>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-6 max-w-6xl">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div key={product.product_id} className="p-4 bg-white rounded-lg shadow-lg transform transition duration-300 hover:shadow-xl hover:scale-105">
                            <img src={product.image} alt={product.name} className="w-full h-48 object-cover rounded-md" />
                            <div className="mt-3 text-center">
                                <h2 className="text-lg font-semibold text-gray-800">{product.name}</h2>
                                <p className="text-blue-600 font-bold text-lg">₹{product.price}</p>
                                <p className="text-green-600 font-semibold">{product.discount}% Off</p>
                                <Link to={`/product/${product.product_id}`} className="text-blue-500 hover:underline">
                                    View Details
                                </Link>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-white text-lg mt-6">No products found</p>
                )}
            </div>
        </div >
    );
};

export default ProductPage;
