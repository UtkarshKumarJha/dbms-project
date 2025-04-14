const express = require('express');
const cors = require('cors');
const db = require('./db');


const app = express();
app.use(cors());
app.use(express.json()); // For JSON parsing

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

app.post("/signup", async (req, res) => {
    const { name, email, password, phone_no } = req.body;

    if (!name || !email || !password || !phone_no) {
        return res.status(400).json({ message: "All fields are required!" });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [rows] = await db.query("INSERT INTO user (name, email, pass, phone_no) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, phone_no]);
        if (rows.length > 0) {
            res.json({ message: "User created successfully!" });
        } else {
            res.json({ error: "User creation failed!" });
        }
    } catch (err) {
        console.error("Error creating user:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.get("/is-admin/:user_id", async (req, res) => {
    const userId = req.params.user_id;

    try {
        const [rows] = await db.query("SELECT * FROM admin WHERE user_id = ?", [userId]);
        if (rows.length > 0) {
            res.json({ isAdmin: true });
        } else {
            res.json({ isAdmin: false });
        }
    } catch (err) {
        console.error("Error checking admin:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Register as Seller (Insert into Requests Table)
app.post("/register-seller", async (req, res) => {
    const { user_id, email, b_name, b_description } = req.body;

    try {
        // Check if already a seller
        const [sellerCheck] = await db.query("SELECT * FROM seller WHERE user_id = ? AND is_verified=true", [user_id]);
        if (sellerCheck.length > 0) {
            return res.status(400).json({ message: "Already a seller or request already approved." });
        }

        // Check if already sent request
        const [requestCheck] = await db.query("SELECT * FROM requests WHERE user_id = ?", [user_id]);
        if (requestCheck.length > 0) {
            return res.status(400).json({ message: "Request already sent." });
        }
        const [rows] = await db.query("select user_id from user where email = ?", [email]);
        console.log(rows);
        const userId = rows[0].user_id;
        await db.query(
            "INSERT INTO requests (user_id, b_name, b_description) VALUES (?, ?, ?)",
            [userId, b_name, b_description]
        );

        res.status(200).json({ message: "Seller request submitted successfully." });
    } catch (err) {
        console.error("Register Seller Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Approve Seller Request
app.post("/approve-seller/:request_id", async (req, res) => {
    const request_id = req.params.request_id;

    try {
        // Get request details
        const [requests] = await db.query("SELECT * FROM requests WHERE request_id = ?", [request_id]);
        if (requests.length === 0) return res.status(404).json({ message: "Request not found" });

        const { user_id, b_name, b_description } = requests[0];

        // Insert into seller
        await db.query(
            "INSERT INTO seller (user_id, b_name, b_description, is_verified) VALUES (?, ?, ?, TRUE)",
            [user_id, b_name, b_description]
        );

        // Delete from requests table
        await db.query("DELETE FROM requests WHERE request_id = ?", [request_id]);

        res.status(200).json({ message: "Seller approved successfully." });
    } catch (err) {
        console.error("Approve Seller Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/is-verified/:user_id", async (req, res) => {
    const userId = req.params.user_id;

    try {
        const [rows] = await db.query(
            "SELECT is_verified FROM seller WHERE user_id = ?",
            [userId]
        );

        if (rows.length > 0 && rows[0].is_verified) {
            res.json({ isSeller: true });
        } else {
            res.json({ isSeller: false });
        }
    } catch (err) {
        console.error("Error checking seller:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

app.post("/reject-request/:request_id", async (req, res) => {
    const request_id = req.params.request_id;

    try {
        await db.query("DELETE FROM requests WHERE request_id = ?", [request_id]);
    } catch (err) {
        console.error("Approve Seller Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Get All Pending Seller Requests
app.get("/pending-requests", async (req, res) => {
    try {
        const [requests] = await db.query("SELECT * FROM requests");
        res.status(200).json(requests);
    } catch (err) {
        console.error("Fetch Requests Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

// Add Product (Only Verified Sellers)
app.post("/add-product", async (req, res) => {
    const {
        user_id,
        name,
        details,
        price,
        category,
        brand,
        quantity,
        image
    } = req.body;

    try {
        // 1. Check if user is a verified seller
        const [sellerRows] = await db.query(
            "SELECT seller_id FROM seller WHERE user_id = ? AND is_verified = TRUE",
            [user_id]
        );

        if (sellerRows.length === 0) {
            return res.status(403).json({ message: "You are not a verified seller." });
        }

        const seller_id = sellerRows[0].seller_id;

        // 2. Check or create category
        const [catRows] = await db.query("SELECT category_id FROM category WHERE name = ?", [category]);

        let category_id;
        if (catRows.length > 0) {
            console.log(catRows);
            category_id = catRows[0].category_id;
        } else {
            const [insertResult] = await db.query("INSERT INTO category (name) VALUES (?)", [category]);
            category_id = insertResult.insertId;
        }

        // 3. Insert product
        await db.query(
            `INSERT INTO product 
            (name, details, price, category_id, brand, quantity, image)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [name, details, price, category_id, brand, quantity, image]
        );

        res.status(201).json({ message: "Product added successfully." });

    } catch (err) {
        console.error("Add Product Error:", err);
        res.status(500).json({ message: "Internal Server Error" });
    }
});

app.get("/checkbrand/:id", async (req, res) => {
    const userId = req.params.id;
    try {
        const [brandRows] = await db.query("SELECT b_name FROM seller WHERE user_id = ?", [userId]);
        if (brandRows.length === 0) {
            return res.status(404).json({ message: "Brand not found" });
        }
        res.json({ brand: brandRows[0].b_name });
    }
    catch (err) {
        console.error("Error checking brand:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Login Route
app.post("/login", async (req, res) => {
    const { email, password } = req.body;

    try {
        const [results] = await db.query("SELECT * FROM user WHERE email = ?", [email]);

        if (results.length === 0) {
            return res.status(401).json({ error: "User not found" });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.pass);

        if (!isPasswordValid) {
            return res.status(401).json({ error: "Invalid password" });
        }

        const token = jwt.sign(
            { id: user.user_id, email: user.email }, // Note: use user.user_id, not user.id
            "secretkey",
            { expiresIn: "1h" }
        );

        res.json({ token, userId: user.user_id, message: "Login successful" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get all users
app.get('/users', async (req, res) => {
    try {
        const [results] = await db.query('SELECT * FROM user');
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }

});

app.get("/profile/:userId", async (req, res) => {
    const { userId } = req.params;
    const sql = "SELECT name, email, phone_no FROM user WHERE user_id = ?";

    try {
        const [results] = await db.execute(sql, [userId]); // use execute if you're using promise-based MySQL2
        if (results.length === 0) {
            return res.status(404).json({ message: "User not found" });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const { sendOTP, verifyOTP } = require('./otp');

app.post("/forgotpassword/resetpassword", async (req, res) => {
    const { email, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: "Passwords do not match" });
    }

    try {
        const [users] = await db.query("SELECT * FROM user WHERE email = ?", [email]);

        if (users.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await db.query("UPDATE user SET pass = ? WHERE email = ?", [hashedPassword, email]);

        console.log("Password updated successfully!");
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
        // Check if product already exists in cart for the user
        const [existingItems] = await db.query(
            "SELECT * FROM cart WHERE user_id = ? AND product_id = ?",
            [userId, product_id]
        );

        if (existingItems.length > 0) {
            const quantity2 = existingItems[0].quantity;
            // Check if quantity is greater than available stock
            const [product] = await db.query("SELECT quantity FROM product WHERE product_id = ?", [product_id]);
            if (product.length === 0) {
                return res.status(404).json({ error: "Product not found" });
            }
            const availableStock = product[0].quantity;
            if (quantity + quantity2 > availableStock) {
                return res.status(400).json({ error: "Quantity exceeds available stock" });
            }
            console.log("Product exists in cart, updating quantity...");
            console.log("Existing quantity:", quantity2);
            console.log("New quantity:", quantity + quantity2);
            console.log("Available stock:", availableStock);

            // Product exists, update quantity
            await db.query(
                "UPDATE cart SET quantity = quantity + ? WHERE user_id = ? AND product_id = ?",
                [quantity, userId, product_id]
            );
            return res.status(200).json({ message: "Cart updated successfully" });
        } else {
            // Product not in cart, insert new record
            await db.query(
                "INSERT INTO cart (user_id, product_id, quantity, price, added_at) VALUES (?, ?, ?, ?, NOW())",
                [userId, product_id, quantity, price]
            );
            return res.status(201).json({ message: "Product added to cart" });
        }
    } catch (err) {
        console.error("Error adding to cart:", err);
        return res.status(500).json({ error: "Internal server error" });
    }
});
app.get('/products', async (req, res) => {
    try {
        const [results] = await db.query(
            'SELECT p.product_id, p.name, p.details, p.price, p.brand, p.image, c.name AS category, d.discount ' +
            'FROM product p ' +
            'JOIN category c ON p.category_id = c.category_id ' +
            'LEFT JOIN discount d ON p.product_id = d.product_id'
        );
        res.json(results);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
});

app.get('/cart/:id', async (req, res) => {
    const id = req.params.id;
    const query = `
        SELECT
    cart_id,
    user_id,
    product_id,
    quantity,
    price,
    added_at,
    (SELECT name FROM product WHERE product_id = cart.product_id) AS product_name,
    (SELECT image FROM product WHERE product_id = cart.product_id) AS product_image
FROM cart
WHERE user_id = ?;

    `;

    try {
        const [results] = await db.query(query, [id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.put("/cart/update", async (req, res) => {
    const { cart_id, quantity } = req.body;

    if (!cart_id || quantity < 1) {
        return res.status(400).json({ error: "Invalid cart ID or quantity" });
    }

    const sql = "UPDATE cart SET quantity = ? WHERE cart_id = ?";
    try {
        const [results] = await db.query(sql, [quantity, cart_id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete("/cart/remove/:id", async (req, res) => {
    const { id } = req.params; // Extract cart_id from URL parameter

    if (!id) {
        return res.status(400).json({ error: "Cart ID is required" });
    }

    const query = "DELETE FROM cart WHERE cart_id = ?";

    try {
        const [results] = await db.query(query, [id]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post("/create-order", async (req, res) => {
    const { userId, items, location } = req.body;

    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ error: "Invalid order data" });
    }

    const insertOrderSql = `
        INSERT INTO orders (user_id, status, date, total_price, product_id, quantity, location) 
        VALUES ?`;

    const orderValues = items.map(item => [
        userId,
        "Pending",
        new Date(),
        item.price * item.quantity,
        item.product_id,
        item.quantity,
        location
    ]);

    try {
        const [results] = await db.query(insertOrderSql, [orderValues]);
        for (const item of items) {
            await db.query("CALL update_all_product_quantities(?, ?)", [
                item.product_id,
                item.quantity,
            ]);
        }

        res.status(201).json({ message: "Order created successfully", orderId: results.insertId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});



app.get('/orders', async (req, res) => {
    const userId = req.query.userId; // Extract userId from query

    if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
    }

    const sql = `
       SELECT
    orders.order_id,
    orders.product_id,
    orders.location,
    orders.quantity, 
    orders.status,
    orders.date,
    product.image,
    product.price,
    product.name
FROM orders
JOIN product ON orders.product_id = product.product_id
WHERE orders.user_id = ?;

    `;
    console.log(userId);
    try {
        console.log(userId);
        const [results] = await db.execute(sql, [userId]);
        console.log(results);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});
app.get("/products/stock-check", async (req, res) => {
    const { ids } = req.query; // Comma-separated list of product IDs

    if (!ids) return res.status(400).json({ error: "No product IDs provided" });

    try {
        const [rows] = await db.query(
            "SELECT product_id, quantity FROM product WHERE product_id IN (?)",
            [ids.split(",")]
        );
        res.json(rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


// PUT /orders/:orderId/cancel
app.put('/orders/:orderId/cancel', async (req, res) => {
    const { orderId } = req.params;
    const { reason } = req.body;

    try {
        await db.query(
            "UPDATE orders SET status = 'Cancelled', cancel_reason = ? WHERE order_id = ?",
            [reason, orderId]
        );
        res.status(200).json({ message: "Order cancelled and handled via trigger" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to cancel order" });
    }
});



app.get('/products/:id', async (req, res) => {
    const { id } = req.params;

    const query = `
        SELECT 
            p.product_id, p.name, p.details, p.quantity,p.price, p.brand, p.image, 
            JSON_ARRAYAGG(c.name) AS categories
        FROM product p
        JOIN category c ON p.category_id = c.category_id
        WHERE p.product_id = ?
        GROUP BY p.product_id
    `;

    try {
        const [results] = await db.query(query, [id]);
        if (results.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }
        res.json(results[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});


app.get('/products/:id/reviews', async (req, res) => {
    const productId = req.params.id;
    const query = `SELECT distinct * FROM review join user on review.user_id = user.user_id WHERE product_id = ?`;
    try {
        const [results] = await db.query(query, [productId]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/products/:id/addreviews', async (req, res) => {
    const productId = req.params.id;
    const { user_id, review_text, rating } = req.body;
    console.log(user_id, review_text);
    if (!user_id || !review_text) {
        return res.status(400).json({ error: "User ID and comment are required." });
    }
    const sql = `INSERT INTO review (user_id, product_id, rating, review_text, review_date)
VALUES (?, ?, ?, ?, NOW())  
ON DUPLICATE KEY UPDATE
    rating = VALUES(rating),
    review_text = VALUES(review_text),
    review_date = NOW();
`;
    try {
        const [results] = await db.query(sql, [user_id, productId, rating, review_text]);
        res.json(results);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get("/checkorder", async (req, res) => {
    const { user_id, product_id } = req.query;

    if (!user_id || !product_id) {
        return res.status(400).json({ exists: false, message: "Missing parameters" });
    }

    const sql = `
        SELECT 1 FROM orders
        WHERE user_id = ? AND product_id = ?
        LIMIT 1;
    `;

    try {
        const [rows] = await db.query(sql, [user_id, product_id]);
        res.json({ exists: rows.length > 0 });
    } catch (err) {
        console.error("Database error:", err);
        res.status(500).json({ exists: false, message: "Server error" });
    }
});


const PORT = 5000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
