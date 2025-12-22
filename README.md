## 🛒 Bazario: Secure E-Commerce Platform

A robust, full-stack E-Commerce application built with the **MERN Stack**. This project focuses on secure transaction handling, user data privacy, and role-based access control, featuring advanced cybersecurity implementations like encryption and OTP verification.

## 🚀 Key Features

### 🔒 Cybersecurity & Auth

* **End-to-End Encryption:** Sensitive user data is encrypted using cryptographic algorithms (via Node.js `crypto` module) before storage.
* **Secure Authentication:** User login and registration handled via **JWT (JSON Web Tokens)** and **Bcrypt** for password hashing.
* **OTP Verification:** Email-based One-Time Password verification for account validation and critical actions (using `mailSender.js`).
* **Password Recovery:** Secure "Forgot Password" flow with temporary tokens.
* **Role-Based Access Control (RBAC):** Strict separation between **Admin** and **User** privileges.

### 🛍️ E-Commerce Functionality

* **Product Management:** Admins can add products, apply discounts, and manage inventory (`AddProduct.jsx`, `AddDiscount.jsx`).
* **Cart & Checkout:** Fully functional shopping cart with payment portal integration.
* **Order Tracking:** Users can view order summaries and delivery status (`DeliveryMaps.jsx`).
* **Media Handling:** Efficient image storage using **MongoDB GridFS** and **Multer** for file uploads.

---

## 🛠️ Tech Stack

| Component | Technology |
| --- | --- |
| **Frontend** | React.js, Vite (inferred), CSS/Tailwind |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB (with GridFS for file storage) |
| **Security** | Crypto (Node built-in), Bcrypt, JWT |
| **Tools** | Multer (File Uploads), Nodemailer (Emails), Dotenv |

---

## 📂 Project Structure

```bash
DBMS-PROJECT/
├── dbms-backend/           # Backend Server Code
│   ├── server.js           # Main Entry point (Express App)
│   ├── Schema.js           # Mongoose Models
│   ├── mailSender.js       # Email/OTP Logic
│   ├── OTP.js              # OTP Schema/Logic
│   └── uploads/            # Temp storage for uploads
│
└── dbms-project
    |──src/                     # React Frontend
        ├── components/         # Reusable UI (Navbar, ProductCard, etc.)
        ├── pages/              # Full Pages (Home, Login, AdminReq, etc.)
        ├── services/           # API calls and helper functions
        └── context/            # Global State Management

```

---

## ⚙️ Installation & Setup

Follow these steps to run the project locally.

### 1. Prerequisites

* Node.js installed
* MongoDB installed locally or a MongoDB Atlas URI

### 2. Backend Setup

Navigate to the backend folder and install dependencies:

```bash
cd dbms-backend
npm install

```

**Configure Environment Variables:**
Create a `.env` file in the `dbms-backend` folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
ENCRYPTION_KEY=your_32byte_hex_key
IV=your_16byte_hex_iv

```

Start the server:

```bash
npm start
# or
node server.js

```

### 3. Frontend Setup

Open a new terminal, navigate to the root, and install frontend dependencies:

```bash
npm install

```

Start the React application:

```bash
npm run dev

```

---

## 🛡️ Security Implementation Details

### Encryption Workflow

We utilize the Node.js `crypto` module to encrypt sensitive fields (like personal identifiers) before saving them to the database. Decryption occurs only when the authorized user requests the data.

### Image Handling

Product images are uploaded via `Multer` and streamed directly to MongoDB using `GridFSBucket`, ensuring scalable file storage without cluttering the file system.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License.
