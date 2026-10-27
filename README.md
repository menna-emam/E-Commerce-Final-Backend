# MStore - Online Clothing Store (MEAN Stack)

An online clothing store for women and men, built as a course project at NTI.

- **Backend:** Node.js, Express 5, MongoDB, Mongoose
- **Frontend:** Angular 22 + Bootstrap (in the `mystore` folder)

## Features

**Customers**
- Browse products with filters (category, type, season), sorting and pagination
- Product details with related products
- Cart (saved locally for guests, merged into the account after login)
- Checkout with address and governorate shipping price, cash on delivery
- Profile with multiple addresses, My Orders, cancel pending orders
- Testimonials

**Admin dashboard**
- Orders list with status change
- Products: add (with image), edit, hide/show, delete
- Testimonials approval
- Notifications (new orders, low stock, new testimonials)
- Sales report

## How to run

### 1) Requirements
- Node.js
- MongoDB running locally

### 2) Backend

From the project root:

```bash
npm install
```

Create a `.env` file (copy `.env.example` and change the values), then:

```bash
npm run dev
```

The API runs on `http://localhost:3000/api/v1`.

### 3) Frontend

```bash
cd mystore
npm install
ng serve
```

Open `http://localhost:4200`.

## Test accounts

Create them from the sign up page, or add an admin using the API.

## Notes
- Product images are stored in the `uploads` folder.
- The `.env` file is not uploaded to GitHub (it contains secrets).