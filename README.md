# 🌿 Aeindri Farms — Backend API

> **Node.js + Express + MongoDB REST API**
> For Healthy Living | Version 1.0.0

---

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
cp .env.example .env
# Fill in your MongoDB URI, JWT secret, etc.

# 3. Seed the database with sample data
npm run seed

# 4. Start the server
npm run dev       # development (with nodemon)
npm start         # production
```

Server runs at: **http://localhost:5000**

---

## 📁 Project Structure

```
aeindri-api/
├── server.js              # Entry point
├── .env.example           # Environment template
├── package.json
├── models/
│   ├── User.js            # User + Address + OTP
│   ├── Product.js         # Products + Stock
│   ├── Order.js           # Orders + Timeline
│   └── index.js           # Category, Cart, Review
├── controllers/
│   ├── authController.js      # Auth logic
│   ├── productController.js   # Products CRUD
│   └── cartOrderController.js # Cart + Orders
├── routes/
│   ├── auth.js            ├── products.js
│   ├── categories.js      ├── cart.js
│   ├── orders.js          ├── users.js
│   ├── reviews.js         └── admin.js
├── middleware/
│   └── auth.js            # JWT protect + restrictTo
└── utils/
    └── seeder.js          # DB seed script
```

---

## 🔑 Authentication

All protected routes require a **Bearer token** in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

**Roles:** `customer` | `admin`

---

## 📋 API Endpoints

### 🔐 Auth  —  `/api/auth`

| Method | Endpoint              | Auth     | Description               |
|--------|-----------------------|----------|---------------------------|
| POST   | `/register`           | Public   | Register new user         |
| POST   | `/verify-otp`         | Public   | Verify phone OTP          |
| POST   | `/resend-otp`         | Public   | Resend OTP                |
| POST   | `/login`              | Public   | Login with email+password |
| POST   | `/forgot-password`    | Public   | Send reset OTP to email   |
| POST   | `/reset-password`     | Public   | Reset password with OTP   |
| PUT    | `/change-password`    | Customer | Change current password   |
| GET    | `/me`                 | Customer | Get logged-in user info   |
| POST   | `/logout`             | Customer | Logout (clear client token)|

#### Register — Request Body
```json
{
  "firstName": "Priya",
  "lastName": "Rajan",
  "email": "priya@example.com",
  "phone": "9876543210",
  "password": "MyPass@123",
  "receiveOffers": true
}
```

#### Login — Request Body
```json
{
  "email": "priya@example.com",
  "password": "MyPass@123"
}
```

#### Auth Response (Login / Verify OTP)
```json
{
  "success": true,
  "message": "Login successful! Welcome back 👋",
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "65a1b2c3...",
    "firstName": "Priya",
    "lastName": "Rajan",
    "email": "priya@example.com",
    "phone": "9876543210",
    "role": "customer",
    "isVerified": true
  }
}
```

---

### 🥬 Products  —  `/api/products`

| Method | Endpoint           | Auth    | Description             |
|--------|--------------------|---------|-------------------------|
| GET    | `/`                | Public  | Get all products        |
| GET    | `/featured`        | Public  | Featured products       |
| GET    | `/low-stock`       | Admin   | Products below stock min|
| GET    | `/:id`             | Public  | Get single product      |
| POST   | `/`                | Admin   | Create product          |
| PUT    | `/:id`             | Admin   | Update product          |
| PATCH  | `/:id/stock`       | Admin   | Update stock only       |
| DELETE | `/:id`             | Admin   | Deactivate product      |

#### Query Parameters (GET `/`)
```
?category=vegetables   Filter by category slug
?search=tomato         Full-text search
?minPrice=20           Minimum price filter
?maxPrice=200          Maximum price filter
?featured=true         Featured products only
?sort=price_asc        Sort: newest, price_asc, price_desc, rating, popular
?page=1                Pagination page
?limit=12              Items per page
```

#### Products Response
```json
{
  "success": true,
  "count": 12,
  "total": 22,
  "totalPages": 2,
  "currentPage": 1,
  "products": [
    {
      "_id": "65a1...",
      "name": "Fresh Tomatoes",
      "emoji": "🍅",
      "price": 35,
      "mrp": 45,
      "unit": "1 kg",
      "stock": 85,
      "discount": 22,
      "inStock": true,
      "rating": 4.8,
      "category": { "name": "Vegetables", "slug": "vegetables", "emoji": "🥬" }
    }
  ]
}
```

---

### 📂 Categories  —  `/api/categories`

| Method | Endpoint | Auth   | Description          |
|--------|----------|--------|----------------------|
| GET    | `/`      | Public | Get all categories   |
| POST   | `/`      | Admin  | Create category      |
| PUT    | `/:id`   | Admin  | Update category      |

---

### 🛒 Cart  —  `/api/cart`  *(All require login)*

| Method | Endpoint        | Description                  |
|--------|-----------------|------------------------------|
| GET    | `/`             | Get user's cart              |
| POST   | `/`             | Add item to cart             |
| PUT    | `/:productId`   | Update item quantity         |
| DELETE | `/:productId`   | Remove item from cart        |
| DELETE | `/`             | Clear entire cart            |

#### Add to Cart — Request Body
```json
{
  "productId": "65a1b2c3...",
  "quantity": 2
}
```

---

### 📦 Orders  —  `/api/orders`  *(All require login)*

| Method | Endpoint               | Auth     | Description              |
|--------|------------------------|----------|--------------------------|
| POST   | `/`                    | Customer | Place new order          |
| GET    | `/my-orders`           | Customer | Get my order history     |
| GET    | `/all`                 | Admin    | Get all orders           |
| GET    | `/:orderId`            | Customer | Get single order         |
| POST   | `/:orderId/cancel`     | Customer | Cancel order             |
| PATCH  | `/:orderId/status`     | Admin    | Update order status      |

#### Place Order — Request Body
```json
{
  "deliveryAddress": {
    "name": "Priya Rajan",
    "phone": "9876543210",
    "line1": "12 Green Avenue",
    "city": "Chennai",
    "state": "Tamil Nadu",
    "pincode": "600001"
  },
  "paymentMethod": "razorpay",
  "deliverySlot": "6 AM - 10 AM",
  "couponCode": "AEINDRI20",
  "notes": "Please leave at door"
}
```

#### Order Status Flow
```
pending → confirmed → processing → packed → shipped → delivered
                                                  ↘ cancelled
```

#### Order Response
```json
{
  "success": true,
  "message": "Order placed successfully! 🌿",
  "order": {
    "orderId": "AF-1043",
    "status": "pending",
    "subtotal": 445,
    "deliveryCharge": 0,
    "discount": 89,
    "total": 356,
    "couponCode": "AEINDRI20",
    "timeline": [
      { "status": "pending", "message": "Order placed successfully", "timestamp": "..." }
    ]
  }
}
```

---

### 👥 Users  —  `/api/users`  *(All require login)*

| Method | Endpoint                  | Auth     | Description              |
|--------|---------------------------|----------|--------------------------|
| PUT    | `/profile`                | Customer | Update name/preferences  |
| GET    | `/addresses`              | Customer | Get saved addresses      |
| POST   | `/addresses`              | Customer | Add new address          |
| DELETE | `/addresses/:addrId`      | Customer | Remove an address        |
| GET    | `/wishlist`               | Customer | Get wishlist products    |
| POST   | `/wishlist/:productId`    | Customer | Toggle wishlist item     |
| GET    | `/`                       | Admin    | Get all customers        |

---

### ⭐ Reviews  —  `/api/reviews`

| Method | Endpoint                 | Auth     | Description             |
|--------|--------------------------|----------|-------------------------|
| GET    | `/product/:productId`    | Public   | Get product reviews     |
| POST   | `/`                      | Customer | Submit a review         |
| PATCH  | `/:id/approve`           | Admin    | Approve a review        |

---

### 📊 Admin  —  `/api/admin`  *(Admin only)*

| Method | Endpoint           | Description               |
|--------|--------------------|---------------------------|
| GET    | `/stats`           | Dashboard overview stats  |
| GET    | `/revenue-chart`   | Last 7 days revenue data  |

#### Stats Response
```json
{
  "success": true,
  "stats": {
    "totalOrders": 847,
    "todayOrders": 24,
    "totalUsers": 5241,
    "totalProducts": 22,
    "totalRevenue": 284200,
    "cancelledOrders": 23,
    "lowStock": 3
  }
}
```

---

### 🏥 Health Check

```
GET /api/health
```
```json
{
  "success": true,
  "message": "🌿 Aeindri Farms API is running",
  "version": "1.0.0",
  "timestamp": "2026-02-22T10:00:00.000Z"
}
```

---

## 🔒 Error Response Format

All errors follow this format:
```json
{
  "success": false,
  "message": "Error description here"
}
```

| Status | Meaning                        |
|--------|--------------------------------|
| 400    | Bad Request / Validation Error |
| 401    | Unauthorized (no/bad token)    |
| 403    | Forbidden (wrong role)         |
| 404    | Not Found                      |
| 429    | Too Many Requests              |
| 500    | Internal Server Error          |

---

## 🛠️ Tech Stack

| Layer         | Technology              |
|---------------|-------------------------|
| Runtime       | Node.js 18+             |
| Framework     | Express.js 4            |
| Database      | MongoDB + Mongoose      |
| Auth          | JWT + bcryptjs          |
| Validation    | express-validator       |
| Security      | Helmet + CORS + Rate Limiting |
| SMS OTP       | Twilio (pluggable)      |
| Email         | Nodemailer              |
| Payments      | Razorpay (ready)        |
| Images        | Cloudinary (ready)      |
| Dev Server    | Nodemon                 |

---

## 🌐 Free Hosting Options

| Service     | Free Tier         | How To Deploy          |
|-------------|-------------------|------------------------|
| **Render**  | 750 hrs/month     | Connect GitHub → Deploy|
| **Railway** | $5 credit/month   | railway up             |
| **Cyclic**  | Always free       | cyclic.sh              |
| **MongoDB Atlas** | 512 MB free | Use connection string  |

---

## 🧪 Test Credentials (after seed)

| Role     | Email                        | Password    |
|----------|------------------------------|-------------|
| Admin    | admin@aeindrifarms.com       | Admin@1234  |
| Customer | priya@test.com               | Test@1234   |

---

*Aeindri Farms API — For Healthy Living 🌿*
