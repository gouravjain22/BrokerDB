# PlotManager Backend

Node.js + Express + MongoDB/Mongoose API for the PlotManager React application.

## 1. Setup

You already have `node_modules`, `package.json` and `package-lock.json` in your project. Copy the `src` folder and the `.env.example` / `.gitignore` files into that project. Merge the scripts and dependencies from the supplied `package.json` into your existing package file if needed; do not delete your existing lock file without reason.

If you use this package.json as the project package file, run:

```bash
npm install
```

Create a `.env` file in the project root (same level as `package.json`) by copying `.env.example`. Add your MongoDB Atlas connection string and a long random JWT secret. Never commit `.env` to Git.

## 2. Run

```bash
npm run dev
```

Health check: `GET http://localhost:5000/api/health`

## 3. API routes

### Authentication
- `POST /api/auth/register` — body: `{ "name": "Example User", "email": "user@example.com", "password": "at-least-8-chars" }`
- `POST /api/auth/login` — body: `{ "email": "user@example.com", "password": "at-least-8-chars" }`
- `GET /api/auth/me` — requires `Authorization: Bearer <token>`

### Bookings (all require a Bearer token)
- `POST /api/bookings`
- `GET /api/bookings?page=1&limit=20`
- `GET /api/bookings?search=Rahul&status=Pending`
- `GET /api/bookings/:id`
- `PUT /api/bookings/:id`
- `DELETE /api/bookings/:id`

Booking request fields follow the current frontend form: `customerName`, `bookingDate`, `bookingNumber`, `projectName`, `plotNumber`, `plotSize`, `brokerName`, `totalAmount`, `remainingAmount`, `miscellaneous`, `status`, `dueDate`.

## 4. Data isolation

The API sets `userId` from the verified JWT for every create/list/read/update/delete operation. It never trusts a client-supplied `userId`. Users can only access their own bookings. Booking numbers are unique within each user's account.

## 5. Notes

- Passwords are hashed with bcrypt.
- JWT secret must be at least 32 characters.
- Registration is currently public for initial development. Before production, decide whether registration should remain open or be restricted/invite-only.
- Amounts currently use rupees as JavaScript numbers to match the existing frontend. For production accounting, consider storing integer paise and converting at the API boundary.
- Notifications are not persisted yet; the current frontend's notification content is demo/static. A notifications collection can be added when persistent read/unread notification history is required.
