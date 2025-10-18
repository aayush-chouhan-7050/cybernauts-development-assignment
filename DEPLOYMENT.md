# Deployment Guide

This guide will walk you through deploying your full-stack application to production.

## Table of Contents
- [Backend Deployment (Railway)](#backend-deployment-railway)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Alternative: Backend on Render](#alternative-backend-on-render)
- [Alternative: Frontend on Netlify](#alternative-frontend-on-netlify)
- [Environment Variables](#environment-variables)
- [Testing Deployment](#testing-deployment)
- [Troubleshooting](#troubleshooting)

---

## Backend Deployment (Railway)

### Prerequisites
- GitHub account
- Railway account (sign up at [railway.app](https://railway.app))
- MongoDB Atlas database

### Steps

#### 1. Push Code to GitHub
```bash
cd cybernauts-backend
git init
git add .
git commit -m "Initial backend commit"
git branch -M main
git remote add origin https://github.com/yourusername/cybernauts-backend.git
git push -u origin main
```

#### 2. Create MongoDB Atlas Database
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free cluster (if you haven't already)
3. Go to Database Access → Add New Database User
4. Create a user with password
5. Go to Network Access → Add IP Address → Allow Access from Anywhere (0.0.0.0/0)
6. Go to Database → Connect → Connect your application
7. Copy the connection string

#### 3. Deploy on Railway

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **New Project** → **Deploy from GitHub repo**
3. Select your `cybernauts-backend` repository
4. Railway will automatically detect it's a Node.js app

#### 4. Configure Environment Variables

In Railway project settings:

1. Click on your service
2. Go to **Variables** tab
3. Add these variables:

```
PORT=3001
DB_URL=mongodb+srv://username:password@cluster.mongodb.net/cybernauts?retryWrites=true&w=majority
```

#### 5. Configure Build Settings (if needed)

Railway usually auto-detects, but if needed:

**Build Command:**
```bash
npm install && npm run build
```

**Start Command:**
```bash
npm start
```

#### 6. Get Your Backend URL

After deployment completes:
1. Go to **Settings** tab
2. Under **Domains**, click **Generate Domain**
3. Copy your URL (e.g., `https://your-app.railway.app`)
4. Save this URL for frontend configuration

---

## Frontend Deployment (Vercel)

### Prerequisites
- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))

### Steps

#### 1. Update Frontend API URL

Before deploying, update your API client to use environment variable:

```typescript
// src/services/api.ts
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
});
```

#### 2. Push Code to GitHub

```bash
cd cybernauts-frontend
git init
git add .
git commit -m "Initial frontend commit"
git branch -M main
git remote add origin https://github.com/yourusername/cybernauts-frontend.git
git push -u origin main
```

#### 3. Deploy on Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **Add New** → **Project**
3. Import your `cybernauts-frontend` repository
4. Configure project:
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

#### 4. Add Environment Variable

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend.railway.app/api` (your Railway URL)
   - **Environment:** Production, Preview, Development (select all)

#### 5. Deploy

1. Click **Deploy**
2. Wait for build to complete
3. Visit your deployed site URL

---

## Alternative: Backend on Render

### Steps

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **New** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name:** cybernauts-backend
   - **Environment:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start` or `node dist/index.js`
   - **Instance Type:** Free

5. Add Environment Variables:
   - `PORT=3001`
   - `DB_URL=your_mongodb_connection_string`

6. Click **Create Web Service**

**Note:** Render free tier may take 1-2 minutes for cold starts.

---

## Alternative: Frontend on Netlify

### Steps

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Connect to GitHub and select your frontend repository
4. Configure:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`

5. Add Environment Variable:
   - Go to **Site settings** → **Environment variables**
   - Add `VITE_API_URL` with your backend URL

6. Click **Deploy site**

---

## Environment Variables

### Backend (Railway/Render)

| Variable | Value | Description |
|----------|-------|-------------|
| PORT | 3001 | Server port |
| DB_URL | mongodb+srv://... | MongoDB connection string |

### Frontend (Vercel/Netlify)

| Variable | Value | Description |
|----------|-------|-------------|
| VITE_API_URL | https://your-backend.railway.app/api | Backend API URL |

---

## Testing Deployment

### 1. Test Backend API

```bash
# Test health check
curl https://your-backend.railway.app/

# Test getting users
curl https://your-backend.railway.app/api/users

# Test creating user
curl -X POST https://your-backend.railway.app/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser","age":25,"hobbies":["testing"]}'
```

### 2. Test Frontend

1. Visit your Vercel URL
2. Open browser DevTools → Network tab
3. Check if API calls are going to correct backend URL
4. Try creating a user
5. Try linking users
6. Test all features

---

## Troubleshooting

### Backend Issues

#### Issue: "Cannot connect to database"
**Solution:**
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify DB_URL is correctly set in environment variables
- Check MongoDB user credentials

#### Issue: "Port already in use"
**Solution:**
- Don't set PORT on Railway/Render (they auto-assign)
- Or use: `const PORT = process.env.PORT || 3001;`

#### Issue: "Module not found"
**Solution:**
- Ensure all dependencies are in `package.json` (not devDependencies)
- Add build script if using TypeScript:
  ```json
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
  ```

### Frontend Issues

#### Issue: "Network Error / CORS Error"
**Solution:**
- Check backend URL in environment variable
- Ensure backend has CORS enabled:
  ```typescript
  import cors from 'cors';
  app.use(cors());
  ```

#### Issue: "Environment variable not loading"
**Solution:**
- Ensure variable starts with `VITE_`
- Redeploy after adding environment variables
- Check variable is set for correct environment (Production)

#### Issue: "Build fails"
**Solution:**
- Check build logs for specific error
- Ensure all imports are correct
- Verify `package.json` has correct dependencies

### Database Issues

#### Issue: "Slow initial requests"
**Solution:**
- MongoDB Atlas may pause idle clusters
- First request wakes up the cluster (takes ~10s)
- Upgrade to paid tier for always-on clusters

---

## Post-Deployment Checklist

- [ ] Backend is accessible at public URL
- [ ] Frontend is accessible at public URL
- [ ] Can create users via frontend
- [ ] Can link/unlink users
- [ ] Can drag hobbies onto nodes
- [ ] Toast notifications work
- [ ] Graph visualizes correctly
- [ ] Delete protection works (409 error)
- [ ] All API endpoints respond correctly
- [ ] CORS is properly configured
- [ ] Environment variables are set
- [ ] Database connection is stable

---

## Monitoring & Maintenance

### Railway
- View logs: Railway Dashboard → Service → Logs
- Monitor usage: Dashboard → Usage tab
- View metrics: Dashboard → Metrics

### Vercel
- View deployments: Dashboard → Project → Deployments
- View analytics: Dashboard → Analytics
- View logs: Deployment → Function Logs

### MongoDB Atlas
- Monitor database: Atlas Dashboard → Clusters → Metrics
- View logs: Database Access logs
- Set up alerts: Alerts → Create Alert

---

## Scaling Considerations

### For Production Use:

1. **Database:**
   - Upgrade MongoDB Atlas to paid tier
   - Enable backups
   - Set up monitoring alerts

2. **Backend:**
   - Use PM2 or cluster mode for Node.js
   - Implement rate limiting
   - Add caching (Redis)
   - Set up logging (Winston, Morgan)

3. **Frontend:**
   - Enable CDN (Vercel/Netlify have built-in)
   - Optimize images and assets
   - Implement lazy loading for large graphs

4. **Security:**
   - Add authentication (JWT)
   - Implement API rate limiting
   - Use HTTPS everywhere
   - Sanitize user inputs
   - Add CORS whitelist for specific origins

---

## Cost Estimation

### Free Tier Limits:

**Railway:**
- $5 credit per month
- 500 hours execution time
- 512 MB RAM per service

**Vercel:**
- 100 GB bandwidth per month
- Unlimited deployments

**MongoDB Atlas:**
- 512 MB storage
- Shared cluster

**Total Cost:** FREE for small-scale usage

---

## Support

If you encounter issues during deployment:

1. Check deployment logs
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Check browser console for frontend errors
5. Review MongoDB Atlas connection
6. Consult platform-specific documentation:
   - [Railway Docs](https://docs.railway.app/)
   - [Vercel Docs](https://vercel.com/docs)
   - [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)