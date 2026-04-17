# Testing the Devin Shop

Full-stack ecommerce demo: FastAPI + SQLite backend on `:8000`, Vite + React + TS frontend on `:5173`. Use this when testing auth, catalog, cart, or orders end-to-end.

## Start both servers

Backend (seeds 12 products + admin user on first boot, SQLite at `backend/data/app.db`):

```
(cd backend && poetry install --no-root)
(cd backend && poetry run fastapi dev app/main.py --host 0.0.0.0 --port 8000)
```

Frontend:

```
(cd frontend && npm install)
(cd frontend && npm run dev -- --host 0.0.0.0)
```

Frontend reads `VITE_API_URL` (defaults to `http://localhost:8000`, see `frontend/.env`).

## Smoke-check the backend before driving the UI

```
curl -sf http://localhost:8000/healthz          # -> {"status":"ok"}
curl -sf http://localhost:8000/api/products | jq 'length'   # -> 12
```

If products is 0, delete `backend/data/` and restart the backend so the seeder runs.

## Seeded accounts

- Admin: `admin@shop.dev` (local-dev password is seeded by `backend/app/seed.py` — read it there if you need to log in as admin).
- Regular users: register through the UI at `/register`.

JWTs are stored in `localStorage` under `shop.token`.

## Golden-path E2E flow (UI)

1. `GET /` — hero + 5 category chips (All / Accessories / Electronics / Fashion / Home) + product grid.
2. `POST /api/auth/register` via `/register` form — navbar flips to `<name>` + `Sign out`, Orders link appears, toast `Account created`.
3. Product detail `/products/:id` → `+` buttons change qty → `Add to cart` — navbar cart badge updates to the qty added.
4. `/cart` — line totals = `price × qty`; subtotal/tax/total update live on qty change; shipping is `Free` when subtotal ≥ $75, else `$7.99`.
5. `/checkout` — fill shipping form, `Place order` → navigates to `/orders/:id`. Banner reads `Thanks for your order!`, items and total match the cart, status = `Paid`.
6. `/cart` after checkout shows empty state; navbar badge is gone.
7. `/orders` lists the order with matching total and `Paid` status.

## Gotchas

- Bcrypt passwords are truncated to 72 bytes in `backend/app/auth.py` — that's intentional, don't "fix" it.
- Don't push directly to `main`/`master` — use a feature branch.
- Test user cart state is per-user; if the cart badge shows unexpected items, check whether a previous test run left rows for the current user (or register a fresh user).
- When driving the UI via the computer tool, keystrokes can land on the wrong field if focus shifts between clicks — click the exact input and take a screenshot to confirm focus before typing long values.
