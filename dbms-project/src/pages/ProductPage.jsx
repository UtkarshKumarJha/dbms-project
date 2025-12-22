import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import CryptoJS from "crypto-js";

const KEY = CryptoJS.enc.Hex.parse(import.meta.env.VITE_SECRET_KEY);

const baseURL = import.meta.env.VITE_API_BASE_URL;


function decryptField(field) {
  try {
    // Add validation
    if (!field) {
      console.warn("decryptField: field is null/undefined");
      return "";
    }
    
    if (typeof field !== "object") {
      console.warn("decryptField: field is not an object, got:", typeof field, field);
      return String(field); // If it's already a plain value, return it
    }
    
    if (!field.data || !field.iv) {
      console.warn("decryptField: missing data or iv", field);
      return "";
    }

    console.log("Decrypting field:", { 
      dataLength: field.data.length, 
      ivLength: field.iv.length,
      dataSample: field.data.substring(0, 20) + "..."
    });

    const ciphertext = CryptoJS.enc.Base64.parse(field.data);
    const iv = CryptoJS.enc.Hex.parse(field.iv);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext },
      KEY,
      {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      }
    );

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!result) {
      console.error("Decryption produced empty result");
      return "";
    }
    
    console.log("Successfully decrypted:", result);
    return result;
    
  } catch (error) {
    console.error("Decryption error:", error, "Field:", field);
    return ""; // Return empty string on error instead of crashing
  }
}


const ProductPage = () => {
    const [products, setProducts] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [selectedBrand, setSelectedBrand] = useState("All");
    const [searchTerm, setSearchTerm] = useState("");
    const [minPrice, setMinPrice] = useState("");
    const [maxPrice, setMaxPrice] = useState("");
    const [selectedDiscount, setSelectedDiscount] = useState("All");
    const [isSeller, setIsSeller] = useState(false);

    const userId = localStorage.getItem("userId");

    // ✅ CHECK IF USER IS A SELLER
    useEffect(() => {
        if (userId) {
            api.get(`/is-verified/${userId}`)
                .then(res => {
                    setIsSeller(res.data.isSeller);
                })
                .catch(err => console.error("Error checking seller status:", err));
        }
    }, [userId]);

    // FETCH PRODUCTS
    useEffect(() => {
        api.get("/products")
            .then(res => {
                console.log("=== RAW ENCRYPTED RESPONSE ===");
                console.log(JSON.stringify(res.data[0], null, 2));

                const decrypted = res.data.map((p, index) => {
                    try {
                        console.log(`\n--- Decrypting product ${index} ---`);
                        
                        const obj = {
                            ...p,
                            name: decryptField(p.name),
                            price: parseFloat(decryptField(p.price)) || 0,
                            brand: decryptField(p.brand),
                            category: decryptField(p.category),
                            discount: p.discount && typeof p.discount === "object"
                                ? parseFloat(decryptField(p.discount)) || 0
                                : (p.discount || 0)
                        };

                        console.log("DECRYPTED PRODUCT:", obj);
                        return obj;
                    } catch (err) {
                        console.error(`Error decrypting product ${index}:`, err);
                        return null;
                    }
                }).filter(p => p !== null);

                console.log("=== FULL DECRYPTED ARRAY ===");
                console.table(decrypted);

                setProducts(decrypted);
            })
            .catch(err => console.error("API ERROR:", err));
    }, []);

    const categories = ["All", ...new Set(products.map(product => product.category))];
    const brands = ["All", ...new Set(products.map(product => product.brand))];

    const filteredProducts = products.filter(product => {
        const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;
        const matchesBrand = selectedBrand === "All" || product.brand === selectedBrand;
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesPrice =
            (!minPrice || product.price >= parseFloat(minPrice)) &&
            (!maxPrice || product.price <= parseFloat(maxPrice));

        const matchesDiscount =
            selectedDiscount === "All" || (product.discount >= parseInt(selectedDiscount));

        return matchesCategory && matchesBrand && matchesSearch && matchesPrice && matchesDiscount;
    });

    return (
        <div className="min-h-screen flex flex-col items-center bg-gradient-to-b from-black to-gray-800 text-white px-4 py-10">
            <h1 className="text-4xl font-extrabold mb-2 drop-shadow-lg tracking-wide">Our Products</h1>
            <p className="text-lg mb-6 text-gray-200">Find the best gadgets & accessories for your needs</p>

            {/* ✅ SHOW BUTTONS ONLY IF USER IS A SELLER */}
            {isSeller && (
                <div className="mb-6 flex flex-wrap gap-4 justify-center">
                    <Link
                        to="/add-product"
                        className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white rounded-full font-bold shadow-md transition-transform transform hover:scale-110"
                    >
                        + Add Product
                    </Link>
                    <Link
                        to="/add-discount"
                        className="px-6 py-3 bg-yellow-400 hover:bg-yellow-500 text-indigo-900 rounded-full font-bold shadow-md transition-transform transform hover:scale-110"
                    >
                        + Add Discount
                    </Link>
                </div>
            )}

            {/* Search Input */}
            <input
                type="text"
                placeholder="Search for products..."
                className="mb-6 px-4 py-3 rounded-full w-80 border-none shadow-lg text-white bg-gray-800 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Filters */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center items-center text-sm sm:text-base text-white">
                <span className="font-semibold">Filters:</span>

                <select
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white shadow-md"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                >
                    {categories.map((category, i) => (
                        <option key={i} value={category}>
                            {category}
                        </option>
                    ))}
                </select>

                <select
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white shadow-md"
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                >
                    {brands.map((brand, i) => (
                        <option key={i} value={brand}>
                            {brand}
                        </option>
                    ))}
                </select>

                <input
                    type="number"
                    placeholder="Min ₹"
                    className="px-3 py-2 rounded-lg shadow-md w-29 text-white bg-gray-800 border-none"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Math.max(0, e.target.value))}
                />
                <input
                    type="number"
                    placeholder="Max ₹"
                    className="px-3 py-2 rounded-lg shadow-md w-29 text-white bg-gray-800 border-none"
                    value={maxPrice}
                    onChange={(e) => setMaxPrice(Math.max(0, e.target.value))}
                />

                <select
                    className="px-4 py-2 rounded-lg bg-gray-800 text-white shadow-md"
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

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 max-w-7xl w-full px-6">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                        <div
                            key={product._id}
                            className="bg-gray-700 rounded-2xl shadow-xl p-5 transition-transform transform hover:scale-105 hover:shadow-2xl"
                        >
                            <div className="product-card relative group perspective">
                                <img
                                    src={
                                        product.images && product.images.length > 0
                                            ? `${baseURL}${product.images[0]}`
                                            : "/placeholder.png"
                                    }
                                    alt={product.name}
                                    className="w-full h-48 object-cover rounded-lg"
                                />

                                <div className="absolute top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 text-white p-5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <h2 className="text-lg font-semibold truncate">{product.name}</h2>
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
                                </div>
                            </div>

                            <Link
                                to={`/product/${product._id}`}
                                className="mt-3 inline-block font-bold text-yellow-500 hover:text-yellow-400 transition duration-300"
                            >
                                View Details
                            </Link>
                        </div>
                    ))
                ) : (
                    <p className="text-white text-xl mt-10 font-semibold col-span-full text-center">No products found</p>
                )}
            </div>
        </div>
    );
};

export default ProductPage;