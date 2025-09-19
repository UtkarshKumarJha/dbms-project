const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: String,
    email: { type: String, unique: true },
    pass: String, // hashed password
    phone_no: { type: String, unique: true }
});

const adminSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
});

const sellerSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    b_name: String,
    b_description: String,
    is_verified: { type: Boolean, default: false }
});

const requestSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    b_name: String,
    b_description: String
});

const categorySchema = new mongoose.Schema({
    name: { type: String, unique: true }
});

const productSchema = new mongoose.Schema({
    name: String,
    details: String,
    price: Number,
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand: String,
    quantity: Number,
    image: String
});

const discountSchema = new mongoose.Schema({
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    discount: Number
});

const cartSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    price: Number,
    added_at: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    quantity: Number,
    status: { type: String, default: "Pending" },
    total_price: Number,
    location: String,
    date: { type: Date, default: Date.now },
    cancel_reason: String
});

const reviewSchema = new mongoose.Schema({
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    rating: Number,
    review_text: String,
    review_date: { type: Date, default: Date.now }
});

module.exports = {
    User: mongoose.model("User", userSchema),
    Admin: mongoose.model("Admin", adminSchema),
    Seller: mongoose.model("Seller", sellerSchema),
    Request: mongoose.model("Request", requestSchema),
    Category: mongoose.model("Category", categorySchema),
    Product: mongoose.model("Product", productSchema),
    Discount: mongoose.model("Discount", discountSchema),
    Cart: mongoose.model("Cart", cartSchema),
    Order: mongoose.model("Order", orderSchema),
    Review: mongoose.model("Review", reviewSchema),
};
