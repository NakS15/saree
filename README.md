# 🪡 SareeBazaar — Full-Stack E-Commerce Platform

---

## ✅ Service Setup Checklist (Phases 2–4)

### Phase 2 — Cloudinary (Image Uploads)
1. Go to **[cloudinary.com](https://cloudinary.com)** → Sign up free
2. After login → **Dashboard** → you'll see `Cloud Name`, `API Key`, `API Secret`
3. Copy all 3 into `backend/.env`:
```
CLOUDINARY_CLOUD_NAME=dxyz12abc
CLOUDINARY_API_KEY=123456789012345
CLOUDINARY_API_SECRET=abcDEFghiJKLmnoPQR
```

### Phase 3 — Gmail (Order Emails, Password Reset)
1. Go to **[myaccount.google.com/security](https://myaccount.google.com/security)**
2. Make sure **2-Step Verification** is ON
3. Go to **[myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)**
4. Select app: **Mail** → Generate → copy the 16-character password
5. Add to `backend/.env` (remove spaces from the password):
```
SMTP_EMAIL=youremail@gmail.com
SMTP_PASSWORD=abcdabcdabcdabcd
FROM_EMAIL=youremail@gmail.com
FROM_NAME=SareeBazaar
```

### Phase 4 — Razorpay (Online Payments)
1. Go to **[razorpay.com](https://razorpay.com)** → Sign up
2. Dashboard → **Settings** → **API Keys** → **Generate Test Key**
3. Add to `backend/.env`:
```
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=xxxxxxxxxxxxxxxxxxxx
RAZORPAY_WEBHOOK_SECRET=any_random_string_you_choose
```
4. Create `frontend/.env.local` and add:
```
REACT_APP_API_URL=http://localhost:5000/api/v1
REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
```
> 💡 Use Razorpay test card: `4111 1111 1111 1111`, CVV: any 3 digits, Expiry: any future date

---

## 🚀 Push to GitHub

```bash
cd /Users/bti-000793/Downloads/saree

# Initialise git (only needed once)
git init
git add .
git commit -m "Initial commit — SareeBazaar full-stack app"

# Create a repo on github.com then:
git remote add origin https://github.com/YOUR_USERNAME/sareebazaar.git
git branch -M main
git push -u origin main
```
> ⚠️ The `.gitignore` is already set up — `.env` files will **never** be committed.

---

## 🌐 Deploy to the Internet (Free)

### Step 1 — MongoDB Atlas (Free Database)
1. Go to **[cloud.mongodb.com](https://cloud.mongodb.com)** → Sign up
2. Create a **free M0 cluster** (choose any region)
3. **Database Access** → Add user → username + password (save these)
4. **Network Access** → Add IP → `0.0.0.0/0` (allow all — needed for Render)
5. **Connect** → **Drivers** → copy the connection string, replace `<password>`:
```
mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net/sareebazaar
```

---

### Step 2 — Deploy Backend to Render (Free)
1. Go to **[render.com](https://render.com)** → Sign up with GitHub
2. **New** → **Web Service** → select your `sareebazaar` repo
3. Set these settings:
   | Field | Value |
   |---|---|
   | Root Directory | `backend` |
   | Runtime | `Node` |
   | Build Command | `npm install` |
   | Start Command | `npm start` |
4. Click **Environment** → **Add from .env** → paste ALL your backend `.env` values BUT change:
   ```
   NODE_ENV=production
   MONGO_URI=mongodb+srv://...   ← your Atlas URI
   CLIENT_URL=https://your-app.vercel.app  ← fill after step 3
   ```
5. Click **Create Web Service** — wait ~3 mins
6. Copy your URL: `https://sareebazaar-api.onrender.com`

> 💡 **Seed the database on Render:** After deploy, go to Render → your service → **Shell** tab → run `npm run seed`

---

### Step 3 — Deploy Frontend to Vercel (Free)
1. Go to **[vercel.com](https://vercel.com)** → Sign up with GitHub
2. **Add New Project** → import your `sareebazaar` repo
3. Set:
   | Field | Value |
   |---|---|
   | Root Directory | `frontend` |
   | Build Command | `npm run build` |
   | Output Directory | `build` |
4. **Environment Variables** → add:
   ```
   REACT_APP_API_URL=https://sareebazaar-api.onrender.com/api/v1
   REACT_APP_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
   ```
5. Click **Deploy** — wait ~2 mins
6. Your site is live at `https://sareebazaar.vercel.app` 🎉

---

### Step 4 — Connect Everything
1. Go back to **Render** → your backend service → **Environment**
2. Update `CLIENT_URL` to your Vercel URL:
   ```
   CLIENT_URL=https://sareebazaar.vercel.app
   ```
3. Click **Save Changes** — Render will redeploy automatically

---

### Step 5 — Razorpay Webhook (for reliable payment confirmation)
1. Go to **Razorpay Dashboard** → **Settings** → **Webhooks** → **Add Webhook**
2. URL: `https://sareebazaar-api.onrender.com/api/v1/payments/webhook/razorpay`
3. Secret: same as your `RAZORPAY_WEBHOOK_SECRET` in `.env`
4. Events: check `payment.captured` and `payment.failed`

---

## 🔑 Default Accounts (after running `npm run seed`)
| Role | Email | Password |
|---|---|---|
| Admin | admin@sareebazaar.com | Admin@1234 |
| Vendor | vendor@sareebazaar.com | Vendor@1234 |
| Customer | user@sareebazaar.com | User@1234 |

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
