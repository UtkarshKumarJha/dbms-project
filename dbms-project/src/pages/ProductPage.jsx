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
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-indigo-950 via-blue-900 to-blue-700 text-white px-4 py-10">
            <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg tracking-wide">Our Products</h1>
            <p className="text-lg mb-6 text-gray-200">Find the best gadgets & accessories for your needs</p>

            {isSeller && (
                <div className="mb-6 flex flex-wrap gap-4 justify-center">
                    <Link
                        to="/add-product"
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-md transition"
                    >
                        + Add Product
                    </Link>
                    <Link
                        to="/add-discount"
                        className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 rounded-full font-bold shadow-md transition"
                    >
                        + Add Discount
                    </Link>
                </div>
            )}

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search for products..."
                className="mb-6 px-4 py-3 rounded-full w-80 border-none shadow-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center items-center text-sm sm:text-base text-white">
                <span className="font-semibold">Filters:</span>

                {/* Category */}
                <select
                    className="px-4 py-2 rounded-lg bg-white text-gray-800 shadow-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((category, i) => (
                        <option key={i} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                {/* Brand */}
                <select
                    className="px-4 py-2 rounded-lg bg-white text-gray-800 shadow-md"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                >
                    {brands.map((brand, i) => (
                        <option key={i} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>

                {/* Price Range */}
                <input
                    type="number"
                    placeholder="Min ₹"
                    className="px-3 py-2 rounded-lg shadow-md w-24 text-gray-800"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, e.target.value))}
                />
                <input
                    type="number"
                    placeholder="Max ₹"
                    className="px-3 py-2 rounded-lg shadow-md w-24 text-gray-800"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(0, e.target.value))}
                />

                {/* Discount */}
                <select
                    className="px-4 py-2 rounded-lg bg-white text-gray-800 shadow-md"
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

            {/* Products Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl w-full px-6">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div
                            key={product.product_id}
                            className="bg-white rounded-2xl shadow-xl p-5 transition-transform transform hover:scale-105 hover:shadow-2xl"
                        >
                            <img
                                src={product.image}
                                alt={product.name}
                                className="w-full h-48 object-cover rounded-lg mb-3 border border-gray-200"
                            />
                            <h2 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h2>

                            {product.discount ? (
                                <div className="mt-2">
                                    <p className="text-red-500 line-through text-sm">₹{product.price}</p>
                                    <p className="text-blue-600 text-lg font-bold">
                                        ₹{(product.price * (1 - product.discount / 100)).toFixed(2)}
                                    </p>
                                    <p className="text-green-600 text-sm font-medium">{product.discount}% Off</p>
                                </div>
                            ) : (
                                <p className="text-blue-600 text-lg font-bold mt-2">₹{product.price}</p>
                            )}

                            <Link
                                to={`/product/${product.product_id}`}
                                className="mt-3 inline-block text-indigo-600 hover:underline font-medium"
                            >
                                View Details
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-white text-xl mt-10 font-semibold">No products found</p>
                )}
            </div>
        </div>
    );
};

export default ProductPage;
