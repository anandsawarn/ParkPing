# ParkPing

ParkPing is a MERN-based smart parking assistance system that lets people contact a car owner without exposing personal phone numbers.

## Features

- **Landing page** with product features and how-it-works
- **Authentication**: Signup, login, forgot password, reset password
- **Owner dashboard** to manage cars with contact details
- **QR code generation** per car with custom quotes
- **Download QR with quote** rendered on image
- **Public scan page** with masked contact info and direct Call/SMS/WhatsApp actions
- **Change password** for logged-in users
- **Edit & Delete cars** with confirmation dialogs
- **Admin Dashboard** at `/admin` route:
  - View total users, cars, and messages
  - View all registered users and cars
  - Send and receive messages to/from users
- **User Messaging** - Users can chat with admin support
- **Futuristic UI** with glassmorphism and grid patterns

## Environment Setup

Create environment files from the examples and fill in values.

Server: `server\.env.example`
Client: `client\.env.example`

### Server (.env)

```
MONGODB_URI=<your_mongodb_atlas_connection_string>
JWT_SECRET=<your_secret_key>
CLIENT_URL=http://localhost:5173
PORT=5000
ADMIN_EMAIL=admin@parkping.com
ADMIN_PASSWORD=admin123
```

### Client (.env)

```
VITE_API_URL=http://localhost:5000
```

## Running Locally

1. Install dependencies at the repository root:

   ```
   npm install
   ```

2. Start the app in development mode:

   ```
   npm run dev
   ```

3. Access the app:
   - Frontend: http://localhost:5173
   - Backend: http://localhost:5000
   - Admin Panel: http://localhost:5173/admin

## Admin Access

To access the admin dashboard:

1. Go to http://localhost:5173/admin
2. Login with credentials from `.env`:
   - Email: `admin@parkping.com`
   - Password: `admin123`
3. View users, cars, and manage messages

## Deployment Notes

- For production QR codes to work on mobile devices, deploy both backend and frontend with public URLs
- Update `CLIENT_URL` in server env to your frontend domain
- Update `VITE_API_URL` in client env to your backend domain
- Regenerate QR codes after deployment for public URLs

## Notes

- The Call/SMS/WhatsApp buttons trigger direct device actions (tel:, sms:, wa.me)
- Contact numbers are masked in the UI but exposed for actions
- Forgot password feature logs reset links to console in dev mode (use email service in production)
