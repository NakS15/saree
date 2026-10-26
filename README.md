# 🪡 SareeBazaar — Full-Stack Multi-Vendor E-Commerce Platform

<div align="center">

[![React](https://img.shields.io/badge/React-18-black?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-Express-339933?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v3-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Razorpay](https://img.shields.io/badge/Payments-Razorpay-0C2451?style=for-the-badge&logo=razorpay&logoColor=white)](https://razorpay.com/)

<p align="center">
  <strong>A full-stack, multi-vendor marketplace for sarees: buyers browse, compare, and purchase; sellers manage their own storefronts — with real payments, auth, and order management.</strong>
</p>

<p align="center">
  Built by <strong><a href="https://github.com/NakS15">Nakul Bukkawar</a></strong>.
</p>

</div>

---

## ✦ Overview

**SareeBazaar** is a side project modeled on a real multi-vendor marketplace:
sellers (vendors) list products in their own storefront, buyers browse,
search, and filter across categories, and checkout flows through a real
payment gateway with email/SMS order confirmations. It's a monorepo with a
separate Express/MongoDB API and a React single-page frontend.

---

## ✦ Key Features

### 1. 🔐 Authentication & Accounts
- JWT access + refresh token auth, with Google OAuth (Passport) as an
  alternative sign-in.
- Role-based access: **customer**, **vendor**, and **admin**, each with their
  own dashboards and permissions.

### 2. 🏬 Multi-Vendor Marketplace
- Vendors get their own storefront page, manage their own product catalog,
  and fulfil their own orders.
- Admins oversee vendors, products, and platform-wide order activity.

### 3. 🛍️ Shopping Experience
- Product catalog with categories, search, cart, and wishlist.
- Product image zoom (`react-image-magnify`) and carousels (`Swiper`) on
  product detail pages.
- Coupons and discount codes applied at checkout.

### 4. 💳 Real Payments & Orders
- Checkout integrated with **Razorpay**, including webhook-based payment
  confirmation (`payment.captured` / `payment.failed`).
- Order history, order detail tracking, and shipping handling.

### 5. ⭐ Reviews & Notifications
- Product reviews and ratings.
- Transactional email (Nodemailer) and SMS (Twilio) for order and account
  events.

### 6. 🌍 Internationalization
- Multi-language UI via `i18next` / `react-i18next` with automatic browser
  language detection.

### 7. 🛡️ Production-Minded Backend Hardening
- `helmet`, `express-rate-limit`, `express-mongo-sanitize`, `xss-clean`, and
  `hpp` guard the API against common web vulnerabilities.
- Structured logging via `winston`, async error handling via
  `express-async-errors`.

---

## ✦ Tech Stack

| Domain | Technology | Description |
|---|---|---|
| **Frontend** | React 18, Redux Toolkit, React Router | SPA with centralized state and client-side routing |
| **Styling** | Tailwind CSS 3 | Utility-first styling with forms/typography/aspect-ratio plugins |
| **Forms & Validation** | React Hook Form + Zod | Type-safe form validation |
| **Motion** | Framer Motion | UI transitions and micro-interactions |
| **Backend** | Node.js, Express | REST API (`/api/v1`) |
| **Database** | MongoDB + Mongoose | Document models for users, vendors, products, orders, etc. |
| **Auth** | JWT + Passport (Google OAuth) | Access/refresh tokens, social login |
| **Payments** | Razorpay | Checkout + webhook-based payment confirmation |
| **Media** | Cloudinary + Multer | Product image uploads and storage |
| **Notifications** | Nodemailer + Twilio | Transactional email and SMS |
| **i18n** | i18next / react-i18next | Multi-language frontend |

---

## ✦ Project Structure

```bash
saree/
├── backend/
│   ├── src/
│   │   ├── routes/          # auth, product, cart, order, payment, vendor, admin, ...
│   │   ├── controllers/     # Request handlers per domain
│   │   ├── models/          # Mongoose schemas (User, Product, Order, Vendor, ...)
│   │   ├── middleware/      # Auth guard, validation, error handling
│   │   └── config/          # DB, Cloudinary, Passport, logger, seeder
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/           # Route-level pages (admin/, vendor/, auth/, ...)
│   │   ├── features/        # Redux slices (auth, cart, products, wishlist, ui)
│   │   ├── i18n/            # Language configuration
│   │   └── components/
│   └── package.json
└── package.json
```

---

## ✦ Getting Started Locally

### Prerequisites
- Node.js 18+
- A MongoDB instance (local or [MongoDB Atlas](https://cloud.mongodb.com) free tier)

```bash
# Clone the repository
git clone https://github.com/NakS15/saree.git
cd saree

# Backend
cd backend
npm install
cp .env.example .env   # fill in Mongo URI, JWT secrets, etc. (see below)
npm run dev

# Frontend (in a separate terminal)
cd frontend
npm install
cp .env.example .env.local
npm start
```

The frontend runs at `http://localhost:3000` and proxies API calls to the
backend at `http://localhost:5000`.

### Seed demo data

```bash
cd backend
npm run seed
```

This creates demo accounts you can log in with immediately:

| Role | Email | Password |
|---|---|---|
| Admin | admin@sareebazaar.com | Admin@1234 |
| Vendor | vendor@sareebazaar.com | Vendor@1234 |
| Customer | user@sareebazaar.com | User@1234 |

---

## ✦ Environment Variables

The backend needs a `backend/.env` (see `backend/.env.example` for the full,
annotated list):

```bash
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
CLIENT_URL=http://localhost:3000

# Optional but required for the related features to work:
SMTP_EMAIL=            # order/account emails
CLOUDINARY_CLOUD_NAME= # product image uploads
RAZORPAY_KEY_ID=       # checkout payments
```

The frontend needs a `frontend/.env.local`:

```bash
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_RAZORPAY_KEY_ID=
```

---

## ✦ Deployment

- **Database**: [MongoDB Atlas](https://cloud.mongodb.com) free M0 cluster.
- **Backend**: any Node host (e.g. [Render](https://render.com)) — root
  directory `backend`, build `npm install`, start `npm start`.
- **Frontend**: any static host (e.g. [Vercel](https://vercel.com)) — root
  directory `frontend`, build `npm run build`, output `build`.
- Set `CLIENT_URL` on the backend to the deployed frontend URL for CORS, and
  configure the Razorpay webhook to point at
  `<backend-url>/api/v1/payments/webhook/razorpay`.

---

## ✦ Connect & Socials

- **GitHub**: [@NakS15](https://github.com/NakS15)
- **LinkedIn**: [in/nakul-bukkawar](https://www.linkedin.com/in/nakul-bukkawar-115a89204/)
- **Email**: [nakulbukkawar07@gmail.com](mailto:nakulbukkawar07@gmail.com)


---

## 📁 Project Structure
```
saree/
├── backend/
│   └── src/
│       ├── app.js          # Express app (all middleware + routes)
│       ├── server.js       # Entry point
│       ├── config/         # cloudinary, passport, logger, seeder
│       ├── controllers/    # auth, product, order, payment, admin
│       ├── middleware/     # auth, errorHandler, validator
│       ├── models/         # User, Vendor, Product, Order, Cart, Wishlist, Review, Category, Coupon
│       ├── routes/         # 11 route files
│       └── utils/          # sendEmail, sendSMS, shiprocket, apiFeatures
└── frontend/
    └── src/
        ├── components/     # Navbar, Footer, CartDrawer, ProductCard, ...
        ├── features/       # Redux slices (auth, cart, wishlist, ui, products)
        ├── pages/          # All page components
        ├── services/       # API service functions
        ├── store/          # Redux store
        ├── utils/          # helpers (formatPrice, formatDate, loadRazorpay)
        └── i18n/           # English + Hindi translations
```


---

## 📋 What's Done vs What's Left

### ✅ Already Written (Code Complete)
- Full Express REST API (auth, products, orders, payments, cart, wishlist, reviews, admin, vendor)
- All Mongoose models (User, Vendor, Product, Order, Cart, Wishlist, Review, Category, Coupon)
- Full React frontend (all pages, Redux, routing, Tailwind UI)
- JWT auth + refresh tokens + Google OAuth + Phone OTP flows
- Razorpay + COD payment controllers
- Shiprocket shipping integration
- Cloudinary image upload (with local disk fallback)
- Admin + Vendor dashboards
- i18n (English + Hindi)

### ⏳ What YOU Need to Provide (External Services)
| Service | Required? | Cost | Where to Sign Up |
|---|---|---|---|
| MongoDB Atlas | ✅ Yes (for prod) | Free tier available | atlas.mongodb.com |
| Cloudinary | For images | Free tier (25GB) | cloudinary.com |
| Razorpay | For online payments | Free (pay per txn) | razorpay.com |
| Gmail App Password | For emails | Free | myaccount.google.com |
| Twilio | For OTP SMS | Pay per SMS | twilio.com |
| Shiprocket | For shipping | Free to start | shiprocket.in |
| Render / Railway | For hosting backend | Free tier available | render.com |
| Vercel / Netlify | For hosting frontend | Free | vercel.com |

---

## 🚀 Phase-by-Phase Plan

---

### PHASE 1 — Run Locally (Right Now, FREE, ~30 mins)
*No external accounts needed. Just MongoDB locally.*

**1. Install MongoDB locally**
```bash
# macOS
brew tap mongodb/brew && brew install mongodb-community && brew services start mongodb-community
# Windows: download installer from mongodb.com/try/download/community
```

**2. Copy env and fill ONLY these 3 fields**
```bash
cd /Users/bti-000793/Downloads/saree/backend
cp .env.example .env
```
Open `backend/.env` — the JWT secrets already have placeholder values that work locally. You only need to verify:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/sareebazaar   ← works as-is with local MongoDB
```
Everything else (Cloudinary, Razorpay, etc.) is optional for Phase 1.

**3. Install and run**
```bash
# Terminal 1 — Backend
cd backend
npm install
npm run seed     # creates admin/vendor/customer accounts + sample products
npm run dev      # → http://localhost:5000

# Terminal 2 — Frontend
cd frontend
npm install
npm start        # → http://localhost:3000
```

**4. Test it works**
- Open http://localhost:3000
- Login: `admin@sareebazaar.com` / `Admin@1234`
- Browse products, add to cart — COD checkout works without Razorpay

---

### PHASE 2 — Add Images (FREE, ~15 mins)
*So product images can be uploaded and stored*

1. Sign up at **cloudinary.com** (free, no credit card)
2. Go to Dashboard → copy `Cloud Name`, `API Key`, `API Secret`
3. Add to `backend/.env`:
```
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```
4. Restart backend — image uploads now go to cloud instead of local disk

---

### PHASE 3 — Add Email (FREE with Gmail, ~10 mins)
*So order confirmations, password resets work*

1. Go to **myaccount.google.com** → Security → 2-Step Verification → App Passwords
2. Generate an App Password (select "Mail")
3. Add to `backend/.env`:
```
SMTP_EMAIL=your_gmail@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx    ← the 16-char app password (no spaces)
FROM_EMAIL=your_gmail@gmail.com
FROM_NAME=SareeBazaar
```

---

### PHASE 4 — Add Razorpay (FREE account, ~20 mins)
*For real UPI/card payments. Test mode is free.*

1. Sign up at **razorpay.com** (free, use test mode first)
2. Go to Settings → API Keys → Generate Test Key
3. Add to `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=any_random_string_you_choose
```
4. Add to `frontend/.env.local` (create this file):
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```
> ⚠️ Test mode uses test cards. Switch to Live keys only when ready to accept real money.

---

### PHASE 5 — Deploy to the Internet (~1 hour)

#### 5a. Deploy Backend to Render (free tier)
1. Push code to GitHub
2. Go to **render.com** → New → Web Service → connect your repo
3. Set:
   - Root directory: `backend`
   - Build command: `npm install`
   - Start command: `npm start`
4. Add all your `.env` variables in Render's Environment tab
5. Your API will be at: `https://your-app.onrender.com`

#### 5b. Deploy Frontend to Vercel (free)
1. Go to **vercel.com** → New Project → import your repo
2. Set:
   - Root directory: `frontend`
   - Build command: `npm run build`
3. Add environment variable:
   - `REACT_APP_API_URL` = `https://your-app.onrender.com/api/v1`
4. Your site will be at: `https://your-app.vercel.app`

#### 5c. Switch MongoDB to Atlas (free 512MB)
1. Sign up at **atlas.mongodb.com**
2. Create free M0 cluster → Connect → copy connection string
3. Update `MONGO_URI` in Render environment variables

---

### PHASE 6 — Optional Add-Ons (When You Need Them)

| Feature | Service | When to add |
|---|---|---|
| SMS / OTP login | Twilio | When you want phone login |
| Shipping labels | Shiprocket | When you start fulfilling orders |
| Google login | Google Cloud Console | Nice-to-have social login |
| Custom domain | Any registrar | When going live publicly |
| Razorpay Live Mode | Razorpay KYC | When accepting real money |

---

## 🔑 Default Seeded Accounts
| Role | Email | Password |
|---|---|---|
| Admin | admin@sareebazaar.com | Admin@1234 |
| Vendor | vendor@sareebazaar.com | Vendor@1234 |
| Customer | user@sareebazaar.com | User@1234 |


A production-ready Indian saree marketplace with multi-vendor support, Razorpay payments, and admin panel.

---

## 🚀 Quick Start

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)
- npm or yarn

### 1. Backend Setup
```bash
cd backend
npm install
cp .env.example .env       # then fill in your values
npm run seed               # seed sample data
npm run dev                # starts on http://localhost:5000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
cp .env.example .env.local # then fill in your values
npm start                  # starts on http://localhost:3000
```

---

## 🔑 Default Seeded Accounts

| Role     | Email                       | Password     |
|----------|-----------------------------|--------------|
| Admin    | admin@sareebazaar.com       | Admin@1234   |
| Vendor   | vendor@sareebazaar.com      | Vendor@1234  |
| Customer | user@sareebazaar.com        | User@1234    |

---

## 🔧 Environment Variables to Fill In

### Backend (`backend/.env`)
| Variable | Where to get it |
|---|---|
| `MONGO_URI` | [MongoDB Atlas](https://cloud.mongodb.com) or local |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Any random 32+ char string |
| `CLOUDINARY_*` | [cloudinary.com](https://cloudinary.com) → Dashboard |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | [razorpay.com](https://razorpay.com) → Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay Dashboard → Webhooks |
| `SMTP_*` | Gmail → Settings → App Passwords |
| `TWILIO_*` | [twilio.com](https://twilio.com) → Console (optional) |
| `SHIPROCKET_*` | [shiprocket.in](https://shiprocket.in) → API (optional) |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | [console.cloud.google.com](https://console.cloud.google.com) (optional) |

### Frontend (`frontend/.env.local`)
| Variable | Value |
|---|---|
| `REACT_APP_API_URL` | `http://localhost:5000/api/v1` |
| `REACT_APP_RAZORPAY_KEY_ID` | Same as backend `RAZORPAY_KEY_ID` |

---

## 📁 Project Structure

```
saree/
├── backend/
│   └── src/
│       ├── app.js              # Express app
│       ├── server.js           # Entry point
│       ├── config/             # DB, Cloudinary, Passport, Logger, Seeder
│       ├── controllers/        # Auth, Product, Order, Payment, Admin, ...
│       ├── middleware/         # Auth, Error handler, Validator
│       ├── models/             # User, Vendor, Product, Order, Cart, ...
│       ├── routes/             # All route files
│       └── utils/              # sendEmail, sendSMS, apiFeatures, shiprocket
└── frontend/
    └── src/
        ├── components/         # Layout, Product, UI components
        ├── features/           # Redux slices (auth, cart, wishlist, ui)
        ├── pages/              # All page components
        ├── services/           # API service functions
        ├── store/              # Redux store
        ├── utils/              # Helpers
        └── i18n/               # English + Hindi translations
```

---

## ✨ Features

- 🛍️ Multi-vendor marketplace
- 💳 Razorpay (UPI, Cards, Net Banking) + Cash on Delivery
- 📦 Shiprocket shipping integration
- 🔐 JWT auth with refresh tokens + Google OAuth + Phone OTP
- 🌐 i18n (English + Hindi)
- 📊 Vendor & Admin dashboards with analytics
- ⭐ Reviews with verified purchase badge
- 🏷️ Coupons with usage limits
- 📷 Cloudinary image upload
- 🔍 Full-text search with autocomplete
