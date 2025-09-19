import express from 'express';
import cors from 'cors';
import fs from "fs";
import path from "path";
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import multer from "multer";
import crypto from "crypto";
import { GridFSBucket } from "mongodb";

const upload = multer({ storage: multer.memoryStorage() });
import dotenv from 'dotenv';
dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB connected"))
  .catch(err => console.error("MongoDB connection error:", err));


// Schema Definitions
const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pass: { type: String, required: true },
    phone_no: { type: String, required: true, unique: true }
});
const User = mongoose.model('User', UserSchema);

const AdminSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});
const Admin = mongoose.model('Admin', AdminSchema);

const RequestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    b_name: { type: String, required: true },
    b_description: { type: String, required: true }
});
const Request = mongoose.model('Request', RequestSchema);

const SellerSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    b_name: { type: String, required: true },
    b_description: { type: String, required: true },
    is_verified: { type: Boolean, default: false }
});
const Seller = mongoose.model('Seller', SellerSchema);

const CategorySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }
});
const Category = mongoose.model('Category', CategorySchema);

const ProductSchema = new mongoose.Schema({
    name: { type: String, required: true },
    details: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    brand: { type: String, required: true },
    quantity: { type: Number, required: true },
    images: [{
      path: { type: String, required: true },
      iv: { type: String, required: true }
    }], // multiple image URLs
    video: { type: String }     // optional video URL
});
const Product = mongoose.model('Product', ProductSchema);

const DiscountSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true, unique: true },
    discount: { type: Number, required: true }
});
const Discount = mongoose.model('Discount', DiscountSchema);

const CartItemSchema = new mongoose.Schema({
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true }
});

const CartSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    items: [CartItemSchema],
    added_at: { type: Date, default: Date.now }
});
const Cart = mongoose.model('Cart', CartSchema);


const OrderSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [{
        product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true }
    }],
    total_price: { type: Number, required: true },
    status: { type: String, default: 'Pending' },
    date: { type: Date, default: Date.now },
    location: { type: String, required: true },
    cancel_reason: { type: String }
});
const Order = mongoose.model('Order', OrderSchema);

const ReviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    rating: { type: Number, required: true },
    review_text: { type: String, required: true },
    review_date: { type: Date, default: Date.now }
});
ReviewSchema.index({ user: 1, product: 1 }, { unique: true });
const Review = mongoose.model('Review', ReviewSchema);


// Routes
app.post("/signup", async (req, res) => {
    const { name, email, password, phone_no } = req.body;
    if (!name || !email || !password || !phone_no) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    try {
        const existingUser = await User.findOne({ $or: [{ email }, { phone_no }] });
        if (existingUser) {
            return res.status(409).json({ message: "Email or phone number already registered!" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ name, email, pass: hashedPassword, phone_no });
        await user.save();
        res.status(201).json({ user_id:user._id,message: "User created successfully!" });
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/is-admin/:user_id", async (req, res) => {
    try {
        const admin = await Admin.findOne({ user: req.params.user_id });
        res.json({ isAdmin: !!admin });
    } catch (err) {
        console.error("Error checking admin:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/register-seller", async (req, res) => {
    const { user_id, b_name, b_description } = req.body;
    try {
        const seller = await Seller.findOne({ user: user_id, is_verified: true });
        if (seller) {
            return res.status(400).json({ message: "Already a seller or request already approved." });
        }
        const requestExists = await Request.findOne({ user: user_id });
        if (requestExists) {
            return res.status(400).json({ message: "Request already sent." });
        }
        const newRequest = new Request({ user: user_id, b_name, b_description });
        await newRequest.save();
        res.status(200).json({ message: "Seller request submitted successfully." });
    } catch (err) {
        console.error("Register Seller Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/approve-seller/:request_id", async (req, res) => {
    try {
        const request = await Request.findById(req.params.request_id);
        console.log(request);
        if (!request) return res.status(404).json({ message: "Request not found" });
        const { user, b_name, b_description } = request;
        const newSeller = new Seller({ user, b_name, b_description, is_verified: true });
        await newSeller.save();
        await Request.findByIdAndDelete(req.params.request_id);
        res.status(200).json({ message: "Seller approved successfully." });
    } catch (err) {
        console.error("Approve Seller Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/is-verified/:user_id", async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.params.user_id });
        res.json({ isSeller: seller && seller.is_verified });
    } catch (err) {
        console.error("Error checking seller:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/reject-request/:request_id", async (req, res) => {
    try {
        await Request.findByIdAndDelete(req.params.request_id);
        res.status(200).json({ message: "Request rejected successfully." });
    } catch (err) {
        console.error("Reject Request Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/pending-requests", async (req, res) => {
    try {
        const requests = await Request.find().populate('user', 'name email phone_no');
        res.status(200).json(requests);
    } catch (err) {
        console.error("Fetch Requests Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

const ALGORITHM = "aes-256-cbc";
const SECRET_KEY = Buffer.from(process.env.SECRET_KEY, "hex"); 

app.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { buffer, originalname } = req.file;

    // Encrypt buffer
    const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, IV);
    const encrypted = Buffer.concat([cipher.update(buffer), cipher.final()]);

    // Save to GridFS
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "videos",
    });

    const uploadStream = bucket.openUploadStream(originalname, {
      metadata: { iv: IV.toString("hex") }
    });
    uploadStream.end(encrypted);

    res.json({ msg: "Video uploaded & encrypted successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Upload failed" });
  }
});

app.get("/download/:filename", async (req, res) => {
  try {
    const bucket = new GridFSBucket(mongoose.connection.db, {
      bucketName: "videos",
    });

    const files = await bucket.find({ filename: req.params.filename }).toArray();
    if (!files || files.length === 0) return res.status(404).json({ error: "File not found" });

    const file = files[0];
    const iv = Buffer.from(file.metadata.iv, "hex");

    // Stream encrypted video
    const downloadStream = bucket.openDownloadStreamByName(req.params.filename);

    let chunks = [];
    downloadStream.on("data", (chunk) => chunks.push(chunk));
    downloadStream.on("end", () => {
      const encryptedBuffer = Buffer.concat(chunks);

      // Decrypt
      const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
      const decrypted = Buffer.concat([decipher.update(encryptedBuffer), decipher.final()]);

      res.setHeader("Content-Type", "video/mp4"); // Adjust if AVI/MKV/etc.
      res.send(decrypted);
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Download failed" });
  }
});



app.post("/add-product", upload.array("images"), async (req, res) => {
    const { user_id, name, details, price, category, brand, quantity } = req.body;
    try {
        const seller = await Seller.findOne({ user: user_id, is_verified: true });
        if (!seller) return res.status(403).json({ message: "You are not a verified seller." });

        let cat = await Category.findOne({ name: category });
        if (!cat) {
            cat = new Category({ name: category });
            await cat.save();
        }

        // --- FIX START ---
        // 1. Define the directory name
        const uploadDir = 'uploads';
        // 2. Check if the directory exists, and if not, create it.
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        // --- FIX END ---

        const encryptedImages = req.files.map(file => {
            const iv = crypto.randomBytes(16);
            const cipher = crypto.createCipheriv(ALGORITHM, SECRET_KEY, iv);

            const encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);

            // 3. (Optional but good practice) Use path.join to create the file path
            const filePath = path.join(uploadDir, `${Date.now()}-${file.originalname}.enc`);
            fs.writeFileSync(filePath, encrypted);

            return { path: filePath, iv: iv.toString("hex") };
        });


        const newProduct = new Product({
            name, details, price, category: cat._id, brand, quantity, images: encryptedImages
        });

        await newProduct.save();
        res.status(201).json({ message: "Product added successfully." });

    } catch (err) {
        console.error("Add Product Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.post("/add-discount", async (req, res) => {
    const { product_id, discount } = req.body;
    try {
        await Discount.findOneAndUpdate(
            { product: product_id },
            { discount },
            { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        res.status(200).json({ message: "Discount added/updated successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to add discount" });
    }
});

app.get("/checkbrand/:id", async (req, res) => {
    try {
        const seller = await Seller.findOne({ user: req.params.id });
        if (!seller) {
            return res.status(404).json({ message: "Brand not found" });
        }
        res.json({ brand: seller.b_name });
    } catch (err) {
        console.error("Error checking brand:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ error: "User not found" });
        }
        const isPasswordValid = await bcrypt.compare(password, user.pass);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }
        const token = jwt.sign({ id: user._id, email: user.email }, "secretkey", { expiresIn: "1h" });
        res.json({ token, userId: user._id, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('-pass');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/profile/:userId", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).select('name email phone_no');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

import { sendOTP, verifyOTP } from "./otp.js";

app.post("/forgotpassword/resetpassword", async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;
    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.pass = hashedPassword;
        await user.save();
        return res.status(200).json({ message: "Password Reset Successful" });
    } catch (error) {
        console.error("Password reset error:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/forgotpassword/sendotp", sendOTP);
app.post("/forgotpassword/verifyotp", verifyOTP);

app.post("/addtocart", async (req, res) => {
    const { userId, product_id, quantity, price } = req.body;
    if (!userId || !product_id || quantity <= 0) {
        return res.status(400).json({ error: "Invalid user ID, product ID, or quantity" });
    }
    try {
        const product = await Product.findById(product_id);
        if (!product) return res.status(404).json({ error: "Product not found" });

        let cart = await Cart.findOne({ user: userId });
        if (cart) {
            const itemIndex = cart.items.findIndex(p => p.product.equals(product_id));
            const newQuantity = (itemIndex > -1 ? cart.items[itemIndex].quantity : 0) + quantity;

            if(newQuantity > product.quantity) {
                 return res.status(400).json({ error: "Quantity exceeds available stock" });
            }

            if (itemIndex > -1) {
                cart.items[itemIndex].quantity = newQuantity;
            } else {
                cart.items.push({ product: product_id, quantity, price });
            }
            await cart.save();
            return res.status(200).json({ message: "Cart updated successfully" });
        } else {
             if(quantity > product.quantity) {
                 return res.status(400).json({ error: "Quantity exceeds available stock" });
            }
            const newCart = await Cart.create({
                user: userId,
                items: [{ product: product_id, quantity, price }]
            });
            return res.status(201).json({ message: "Product added to cart" });
        }
    } catch (err) {
        console.error("Error adding to cart:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});

app.get('/products', async (req, res) => {
    try {
        const products = await Product.aggregate([
            {
                $lookup: {
                    from: 'categories',
                    localField: 'category',
                    foreignField: '_id',
                    as: 'category'
                }
            },
            { $unwind: '$category' },
            {
                $lookup: {
                    from: 'discounts',
                    localField: '_id',
                    foreignField: 'product',
                    as: 'discountInfo'
                }
            },
            {
                $addFields: {
                    category: '$category.name',
                    discount: { $ifNull: [{ $arrayElemAt: ['$discountInfo.discount', 0] }, null] }
                }
            },
            { $project: { discountInfo: 0 } }
        ]);

        // 🔑 decrypt image buffers and embed as base64
        const decryptedProducts = products.map(prod => {
            const decryptedImages = prod.images.map(img => {
                const encrypted = fs.readFileSync(img.path);
                const iv = Buffer.from(img.iv, "hex");
                const decipher = crypto.createDecipheriv(ALGORITHM, SECRET_KEY, iv);
                const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
                return `data:image/png;base64,${decrypted.toString("base64")}`;
            });
            return { ...prod, images: decryptedImages };
        });

        res.json(decryptedProducts);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});


app.get('/cart/:id', async (req, res) => {
    try {
        const cart = await Cart.findOne({ user: req.params.id })
            .populate('items.product', 'name image')
            .lean();
        if (!cart) {
            return res.json([]);
        }

        const productIds = cart.items.map(item => item.product._id);
        const discounts = await Discount.find({ product: { $in: productIds } }).lean();
        const discountMap = discounts.reduce((map, disc) => {
            map[disc.product.toString()] = disc.discount;
            return map;
        }, {});

        const cartItems = cart.items.map(item => ({
            cart_id: item._id,
            user_id: cart.user,
            product_id: item.product._id,
            quantity: item.quantity,
            price: item.price,
            discount: discountMap[item.product._id.toString()] || null,
            added_at: cart.added_at,
            product_name: item.product.name,
            product_image: item.product.image
        }));

        res.json(cartItems);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put("/cart/update", async (req, res) => {
    const { cart_id, quantity, userId } = req.body;
    if (!cart_id || quantity < 1 || !userId) {
        return res.status(400).json({ error: "Invalid cart item ID, quantity, or user ID" });
    }
    try {
        const result = await Cart.updateOne(
            { user: userId, "items._id": cart_id },
            { $set: { "items.$.quantity": quantity } }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/cart/remove/:userId/:itemId", async (req, res) => {
    const { userId, itemId } = req.params;
    if (!itemId) {
        return res.status(400).json({ error: "Cart item ID is required" });
    }
    try {
        const result = await Cart.updateOne(
            { user: userId },
            { $pull: { items: { _id: itemId } } }
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/create-order", async (req, res) => {
    const { userId, items, location } = req.body;
    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid order data" });
    }
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const totalPrice = items.reduce((total, item) => total + item.price * item.quantity, 0);
        const orderItems = items.map(item => ({
            product: item.product_id,
            quantity: item.quantity,
            price: item.price
        }));

        const newOrder = new Order({ user: userId, items: orderItems, total_price: totalPrice, location });
        await newOrder.save({ session });

        const bulkOps = items.map(item => ({
            updateOne: {
                filter: { _id: item.product_id },
                update: { $inc: { quantity: -item.quantity } }
            }
        }));
        await Product.bulkWrite(bulkOps, { session });

        await Cart.deleteOne({ user: userId }, { session });

        await session.commitTransaction();
        res.status(201).json({ message: "Order created successfully", orderId: newOrder._id });
    } catch (err) {
        await session.abortTransaction();
        res.status(500).json({ error: err.message });
    } finally {
        session.endSession();
    }
});

app.get('/orders', async (req, res) => {
    const { userId } = req.query;
    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }
    try {
        const orders = await Order.find({ user: userId }).populate('items.product');
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/products/stock-check", async (req, res) => {
    const { ids } = req.query;
    if (!ids) return res.status(400).json({ error: "No product IDs provided" });
    try {
        const productIds = ids.split(",");
        const stock = await Product.find({ _id: { $in: productIds } }).select('_id quantity');
        res.json(stock);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.put('/orders/:orderId/cancel', async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const order = await Order.findById(orderId).session(session);
        if (!order) {
            throw new Error("Order not found");
        }
        order.status = 'Cancelled';
        order.cancel_reason = reason;
        await order.save({ session });
        const bulkOps = order.items.map(item => ({
            updateOne: {
                filter: { _id: item.product },
                update: { $inc: { quantity: item.quantity } }
            }
        }));
        await Product.bulkWrite(bulkOps, { session });
        await session.commitTransaction();
        res.status(200).json({ message: "Order cancelled and stock updated" });
    } catch (err) {
        await session.abortTransaction();
        console.error(err);
        res.status(500).json({ error: "Failed to cancel order" });
    } finally {
        session.endSession();
    }
});


app.get('/products/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id)
            .populate('category', 'name')
            .lean();
        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }
        const discount = await Discount.findOne({ product: req.params.id }).lean();
        product.discount = discount ? discount.discount : null;
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/products/:id/reviews', async (req, res) => {
    try {
        const reviews = await Review.find({ product: req.params.id }).populate('user', 'name');
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/products/:id/addreviews', async (req, res) => {
    const productId = req.params.id;
    const { user_id, review_text, rating } = req.body;
    if (!user_id || !review_text) {
        return res.status(400).json({ error: "User ID and comment are required." });
    }
    try {
        const review = await Review.findOneAndUpdate(
            { user: user_id, product: productId },
            { rating, review_text, review_date: new Date() },
            { upsert: true, new: true }
        );
        res.json(review);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/checkorder", async (req, res) => {
    const { user_id, product_id } = req.query;
    if (!user_id || !product_id) {
        return res.status(400).json({ exists: false, message: "Missing parameters" });
    }
    try {
        const order = await Order.findOne({ user: user_id, "items.product": product_id });
        res.json({ exists: !!order });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ exists: false, message: "Server error" });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});