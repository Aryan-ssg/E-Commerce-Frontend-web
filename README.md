# E-Commerce Frontend

A responsive admin and customer dashboard built with **React 18 + TypeScript**, **Vite**, and **Tailwind CSS 4** for the [E-Commerce Backend API](https://github.com/Aryan-ssg/E-Commerce-Backend-api).

## Tech Stack

- **React 18** — functional components with hooks
- **TypeScript** — full type safety across API calls and components
- **Vite 5** — fast HMR dev server with API proxy
- **Tailwind CSS 4** — utility-first styling with CSS custom properties
- **React Router 6** — client-side routing with role-based route guards
- **Axios** — HTTP client with automatic token refresh interceptor

## Features

### Customer
- **Catalog** — browse products with search, category filter, and pagination
- **Categories** — view products grouped by category
- **Cart** — add, update quantity, remove items with stock validation
- **Checkout** — Razorpay payment integration with signature verification
- **Orders** — view personal order history with status tracking

### Admin Dashboard
- **Users** — list, search, and filter users by role
- **Categories** — create, edit, delete categories
- **Products** — create, edit, delete products with Cloudinary image upload
- **Orders** — paginated table of all orders, click-to-expand detail panel with status management and valid transition enforcement

### Authentication
- Register, login, logout
- JWT access + refresh token rotation
- Automatic silent token refresh on 401 (single retry)
- Role-based route guards (`USER` / `ADMIN`)
- Password strength meter on registration

## Project Structure

```
src/
├── api/              # Axios client + API functions
│   ├── client.ts     # Shared axios instance, token interceptor, auto-refresh
│   ├── auth.ts       # register, login, refresh, logout, changePassword
│   ├── cart.ts       # getCart, addItem, updateItem, removeItem
│   ├── orders.ts     # placeOrder, getMyOrders
│   ├── payment.ts    # createPaymentOrder, verifyPayment
│   ├── products.ts   # getProducts, getCategories (public)
│   └── admin.ts      # admin CRUD for users, categories, products, orders
├── auth/
│   ├── AuthContext.tsx   # React context for auth state + role checks
│   └── token.ts         # localStorage wrapper for access/refresh tokens
├── components/
│   ├── Navbar.tsx              # Responsive nav with role-based links
│   ├── PasswordStrengthMeter.tsx  # Visual password strength indicator
│   ├── PrivateRoute.tsx        # Route guard (auth + role check)
│   ├── ProductCard.tsx         # Product card with image fallback
│   ├── SearchBar.tsx           # Search input component
│   └── Toast.tsx               # Toast notification system
├── pages/
│   ├── Login.tsx
│   ├── Register.tsx
│   ├── Catalog.tsx         # Product listing with search/filter
│   ├── Categories.tsx      # Category browsing
│   ├── Cart.tsx            # Shopping cart
│   ├── Checkout.tsx        # Razorpay payment flow
│   ├── Orders.tsx          # User order history
│   └── admin/
│       ├── AdminLayout.tsx  # Admin sidebar layout
│       ├── Users.tsx        # User management
│       ├── Categories.tsx   # Category management
│       ├── Products.tsx     # Product management + image upload
│       └── Orders.tsx       # Order management + status updates
├── types.ts            # TypeScript interfaces (API request/response types)
├── utils/              # Utility functions
└── App.tsx             # Router + route definitions
```

## Prerequisites

- **Node.js 18+**
- **Backend API** running at `http://localhost:8080` (see [Backend README](../Backend/README.md))

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Start the dev server

```bash
npm run dev
```

Runs at **`http://localhost:5173`**.

The Vite dev server proxies all `/api` requests to `http://localhost:8080`, so no CORS issues during development.

### 3. Build for production

```bash
npm run build
```

Output goes to `dist/`. Preview locally:

```bash
npm run preview
```

## Deployment (Vercel)

### 1. Create `vercel.json`

```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://e-commerce-backend-api-6sge.onrender.com/api/:path*"
    },
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

This proxies all `/api` requests to your Render backend.

### 2. Deploy

1. Push to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your frontend repo
4. Framework: **Vite** (auto-detected)
5. Build command: `npm run build`
6. Output directory: `dist`
7. Click **Deploy**

### 3. Update backend CORS

Set `APP_CORS_ALLOWED_ORIGINS` on your Render backend to your Vercel URL:

```
https://your-project.vercel.app
```

Then redeploy the backend.

## Key Design Decisions

- **Relative API paths** (`baseURL: '/api'`) — works with Vite proxy in dev and Vercel rewrites in production. No hardcoded backend URL in source code.
- **Axios interceptor for token refresh** — on 401, silently refreshes the access token and retries the failed request. Concurrent 401s are queued behind a single refresh call.
- **Role-based routing** — `PrivateRoute` component wraps protected pages, supporting both auth-required and role-required guards.
- **Order status transitions** — the admin order dropdown only shows valid next statuses based on the backend state machine, preventing invalid transitions.
- **Optimistic stock editing** — uses `@Version` locking to prevent lost updates when editing product stock.

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start Vite dev server with hot reload |
| `npm run build` | Type-check + production build |
| `npm run preview` | Preview production build locally |

## License

Not licensed — all rights reserved.
