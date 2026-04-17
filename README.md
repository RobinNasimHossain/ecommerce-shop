# Devin Shop

A full-stack ecommerce starter built with FastAPI (Python) and React (Vite + TypeScript + Tailwind).

## Features

- Product browsing with categories and search
- Product detail pages with quantity selection
- JWT-based user authentication (register / login / logout)
- Per-user shopping cart backed by SQLite
- Multi-step checkout with shipping form
- Order history and order detail pages
- Seeded catalog (12 products) and a default admin account

## Project structure

```
ecommerce/
├── backend/        FastAPI + SQLModel + SQLite
│   ├── app/
│   │   ├── main.py            # FastAPI entrypoint
│   │   ├── database.py        # SQLite engine
│   │   ├── models.py          # SQLModel tables
│   │   ├── auth.py            # JWT + bcrypt
│   │   ├── schemas.py         # Pydantic schemas
│   │   ├── seed.py            # Seed products + admin
│   │   └── routers/           # auth / products / cart / orders
│   └── pyproject.toml
└── frontend/       Vite + React + TypeScript + Tailwind
    ├── src/
    │   ├── pages/             # Home, ProductDetail, Cart, Checkout, …
    │   ├── components/        # Navbar, Footer, ProductCard, …
    │   ├── context/           # Auth + Cart providers
    │   └── lib/               # API client + formatting helpers
    └── package.json
```

## Quick start

### Backend

```bash
cd backend
poetry install
poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000
```

The API starts on `http://localhost:8000`. On first boot it seeds 12 demo
products and an admin user:

- email: `admin@shop.dev`
- password: `admin123`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

The dev server runs on `http://localhost:5173` and talks to the API URL in
`frontend/.env` (`VITE_API_URL`, defaults to `http://localhost:8000`).

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`
- `GET /api/products`, `GET /api/products/{id}`, `GET /api/products/categories`
- `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`, `DELETE /api/cart`
- `POST /api/orders/checkout`, `GET /api/orders`, `GET /api/orders/{id}`

Admin-only (requires an admin user):
- `POST /api/products`, `PUT /api/products/{id}`, `DELETE /api/products/{id}`
