# ParkPing Deployment Guide (Render + Vercel)

## Prerequisites
- GitHub account (free)
- Render account (free)
- Vercel account (free)
- Git installed locally

---

## STEP 1: Prepare Git Repository

### 1.1 Initialize Git (if not already done)
```bash
cd D:\parking
git init
git add .
git commit -m "Initial commit - ParkPing app"
```

### 1.2 Create .gitignore (if not exists)
```bash
node_modules/
.env
.DS_Store
dist/
build/
*.log
```

### 1.3 Push to GitHub
1. **Go to github.com → New Repository**
   - Name: `parkping`
   - Description: "Smart parking assistance system"
   - Public or Private (your choice)
   - Create

2. **Back in terminal:**
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/parkping.git
   git branch -M main
   git push -u origin main
   ```

---

## STEP 2: Deploy Backend to Render

### 2.1 Create Render Account
- Go to https://render.com
- Sign up with GitHub (easier!)
- Click "Connect Account"

### 2.2 Create New Web Service
1. **Dashboard → New +**
2. **Select "Web Service"**
3. **Connect Repository**
   - Select `parkping` repo
   - Click "Connect"

### 2.3 Configure Service
```
Name: parkping-backend
Root Directory: server
Environment: Node
Build Command: npm install
Start Command: npm start
```

### 2.4 Set Environment Variables
**In Render Dashboard → Environment:**

```
MONGODB_URI=mongodb+srv://anandsawarn11:anand2001@cluster0.dzidpad.mongodb.net/parkping
JWT_SECRET=your_super_secret_key_change_this
CLIENT_URL=https://parkping.vercel.app (update after Vercel deploy)
PORT=10000
ADMIN_EMAIL=admin@parkping.com
ADMIN_PASSWORD=admin123
```

### 2.5 Deploy
- Click **"Create Web Service"**
- Wait 5-10 mins for build
- Copy backend URL (e.g., `https://parkping-backend.onrender.com`)

---

## STEP 3: Deploy Frontend to Vercel

### 3.1 Create Vercel Account
- Go to https://vercel.com
- Sign up with GitHub

### 3.2 Import Project
1. **Vercel Dashboard → Add New → Project**
2. **Import Git Repository**
   - Select `parkping`
   - Click "Import"

### 3.3 Configure Project
```
Framework Preset: Vite
Root Directory: client
Build Command: npm run build
Output Directory: dist
```

### 3.4 Environment Variables
**Settings → Environment Variables:**

```
VITE_API_URL=https://parkping-backend.onrender.com
```

(Use the backend URL from Render)

### 3.5 Deploy
- Click **"Deploy"**
- Wait 2-5 mins
- Copy frontend URL (e.g., `https://parkping.vercel.app`)

---

## STEP 4: Update Backend with Frontend URL

### 4.1 Update Render Environment
1. **Render Dashboard → parkping-backend**
2. **Environment → Edit**
3. **Update CLIENT_URL:**
   ```
   CLIENT_URL=https://parkping.vercel.app
   ```
4. **Click "Save Changes"**
5. **Auto-redeploy happens** ✓

---

## STEP 5: Update Production .env Files

### 5.1 Local Development
**server/.env:**
```env
MONGODB_URI=mongodb+srv://anandsawarn11:anand2001@cluster0.dzidpad.mongodb.net/parkping
JWT_SECRET=your_super_secret_key
CLIENT_URL=https://parkping.vercel.app
PORT=5000
ADMIN_EMAIL=admin@parkping.com
ADMIN_PASSWORD=admin123
```

**client/.env.production:**
```env
VITE_API_URL=https://parkping-backend.onrender.com
```

---

## STEP 6: Test Deployment

### 6.1 Test Frontend
- Go to: `https://parkping.vercel.app`
- Should load landing page
- Try signup/login

### 6.2 Test Backend
- Go to: `https://parkping-backend.onrender.com/api/health`
- Should show: `{"status":"ok"}`

### 6.3 Test Admin Panel
- Go to: `https://parkping.vercel.app/admin`
- Login with:
  ```
  Email: admin@parkping.com
  Password: admin123
  ```

### 6.4 Test QR Code
1. **User side:**
   - Sign up
   - Add a car
   - Get QR code
   - Download QR

2. **Public side:**
   - Open: `https://parkping.vercel.app/scan/{carId}`
   - Should show car details
   - Test Call/SMS/WhatsApp buttons

---

## IMPORTANT NOTES

⚠️ **Security:**
- Change `JWT_SECRET` to something random
- Change `ADMIN_PASSWORD` in production
- Never commit .env files

⚠️ **Render Free Tier:**
- Spins down after 15 mins inactivity
- First request takes 30-40 secs
- Upgrade to paid for always-on

⚠️ **Custom Domain:**
- Render: Settings → Custom Domain
- Vercel: Settings → Domains

⚠️ **CORS Issues:**
- Already configured in backend ✓
- If issues: update `CLIENT_URL` in backend

---

## ROLLBACK (if needed)

```bash
# Pull latest code
git pull origin main

# Make local changes
# Commit
git add .
git commit -m "Fix message"
git push origin main

# Render & Vercel auto-redeploy on push!
```

---

## Support Links

- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas

---

**Status: 🚀 READY FOR PRODUCTION**
