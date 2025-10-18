# Deployment Guide

This guide documents the successful deployment of the full-stack application.

## 🎉 Live Deployment

### Production URLs
- **Frontend Application**: https://cybernauts-development-assignment.vercel.app/
- **Backend API**: https://cybernauts-backend-qujq.onrender.com/
- **API Health Check**: https://cybernauts-backend-qujq.onrender.com/

### Deployment Summary
- ✅ Backend deployed on Render
- ✅ Frontend deployed on Vercel
- ✅ MongoDB Atlas database connected
- ✅ All environment variables configured
- ✅ CORS properly configured
- ✅ All endpoints working in production

---

## Table of Contents
- [Backend Deployment (Render)](#backend-deployment-render)
- [Frontend Deployment (Vercel)](#frontend-deployment-vercel)
- [Alternative Platforms](#alternative-platforms)
- [Testing Deployment](#testing-deployment)
- [Troubleshooting](#troubleshooting)

---

## Backend Deployment (Render)

### Completed Deployment

**Live URL**: https://cybernauts-backend-qujq.onrender.com

The backend has been successfully deployed with the following configuration:

#### Configuration Used:
- **Platform**: Render
- **Repository**: Connected to GitHub
- **Build Command**: `npm install`
- **Start Command**: `npm start` or `node dist/index.js`
- **Environment**: Node.js
- **Instance Type**: Free tier

#### Environment Variables Set:
```
PORT=3001
DB_URL=mongodb+srv://[username]:[password]@[cluster].mongodb.net/cybernauts?retryWrites=true&w=majority
FRONTEND_ORIGIN_URL=https://cybernauts-development-assignment.vercel.app
```

#### Deployment Steps Followed:

1. **Pushed code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Created Render Web Service**
   - Logged into [Render Dashboard](https://dashboard.render.com/)
   - Clicked **New** → **Web Service**
   - Connected GitHub repository
   - Selected `cybernauts-backend` folder

3. **Configured Build Settings**
   - Name: `cybernauts-backend`
   - Environment: Node
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Instance Type: Free

4. **Added Environment Variables**
   - `PORT=3001`
   - `DB_URL=[MongoDB connection string]`
   - `FRONTEND_ORIGIN_URL=[Frontend URL]`

5. **Deployed**
   - Clicked **Create Web Service**
   - Waited for build to complete (~5 minutes)
   - Verified deployment at: https://cybernauts-backend-qujq.onrender.com

#### Verification:
✅ API Health Check: https://cybernauts-backend-qujq.onrender.com/  
✅ Get Users: https://cybernauts-backend-qujq.onrender.com/api/users  
✅ Get Graph: https://cybernauts-backend-qujq.onrender.com/api/graph

### For Your Own Deployment (Replication Steps)

---

## Frontend Deployment (Vercel)

### Completed Deployment

**Live URL**: https://cybernauts-development-assignment.vercel.app/

The frontend has been successfully deployed with the following configuration:

#### Configuration Used:
- **Platform**: Vercel
- **Repository**: Connected to GitHub
- **Framework**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variable Set:
```
VITE_API_URL=https://cybernauts-backend-qujq.onrender.com/api
```

#### Deployment Steps Followed:

1. **Updated API Client**
   ```typescript
   // src/services/api.ts
   const apiClient = axios.create({
     baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
   });
   ```

2. **Pushed code to GitHub**
   ```bash
   git add .
   git commit -m "Configure for production deployment"
   git push origin main
   ```

3. **Created Vercel Project**
   - Logged into [Vercel Dashboard](https://vercel.com/dashboard)
   - Clicked **Add New** → **Project**
   - Imported `cybernauts-frontend` repository from GitHub

4. **Configured Project Settings**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `cybernauts-frontend` (or leave as is)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

5. **Added Environment Variable**
   - Went to **Settings** → **Environment Variables**
   - Added:
     - **Name**: `VITE_API_URL`
     - **Value**: `https://cybernauts-backend-qujq.onrender.com/api`
     - **Environment**: Production, Preview, Development (all selected)

6. **Deployed**
   - Clicked **Deploy**
   - Waited for build (~2 minutes)
   - Verified at: https://cybernauts-development-assignment.vercel.app/

#### Verification:
✅ Frontend loads successfully  
✅ Can create users  
✅ Can link/unlink users  
✅ Graph visualizes correctly  
✅ No CORS errors  
✅ All API calls work

### For Your Own Deployment (Replication Steps)

---

## Alternative Platforms

### Alternative: Railway (Backend)

If you prefer Railway over Render:

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

## Testing Deployment

### 1. Test Backend API

```bash
# Test health check
curl https://cybernauts-backend-qujq.onrender.com/

# Test getting users
curl https://cybernauts-backend-qujq.onrender.com/api/users

# Test creating user
curl -X POST https://cybernauts-backend-qujq.onrender.com/api/users \
  -H "Content-Type: application/json" \
  -d '{"username":"TestUser","age":25,"hobbies":["testing"]}'

# Test graph endpoint
curl https://cybernauts-backend-qujq.onrender.com/api/graph
```

### 2. Test Frontend

1. Visit: https://cybernauts-development-assignment.vercel.app/
2. Open browser DevTools → Network tab
3. Verify API calls go to: `https://cybernauts-backend-qujq.onrender.com/api`
4. Try creating a user
5. Try linking users
6. Test all features

### 3. End-to-End Testing

Complete user flow on production:

1. ✅ Create user "Alice" (age 25, hobbies: coding, music)
2. ✅ Create user "Bob" (age 30, hobbies: coding, sports)
3. ✅ Link Alice and Bob by dragging nodes
4. ✅ Drag "art" hobby onto Bob's node
5. ✅ Verify popularity scores update
6. ✅ Try to delete Alice (should fail with 409)
7. ✅ Delete edge between Alice and Bob
8. ✅ Delete Alice (should succeed)

### 4. Performance Check

**Backend Response Times:**
- Health check: ~200ms (first request may be slower due to Render cold start)
- API endpoints: ~300-500ms
- Note: Render free tier has ~1-2 minute cold start after inactivity

**Frontend Load Time:**
- Initial load: ~1-2 seconds
- Vercel CDN: Fast worldwide delivery

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

- [x] Backend is accessible at https://cybernauts-backend-qujq.onrender.com
- [x] Frontend is accessible at https://cybernauts-development-assignment.vercel.app/
- [x] Can create users via frontend
- [x] Can link/unlink users
- [x] Can drag hobbies onto nodes
- [x] Toast notifications work
- [x] Graph visualizes correctly
- [x] Delete protection works (409 error)
- [x] All API endpoints respond correctly
- [x] CORS is properly configured
- [x] Environment variables are set
- [x] Database connection is stable

**Status**: ✅ **Fully Deployed and Operational**

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

## Support

If you encounter issues during deployment:

1. Check deployment logs
2. Verify environment variables
3. Test API endpoints with curl/Postman
4. Check browser console for frontend errors
5. Review MongoDB Atlas connection
6. Consult platform-specific documentation:
   - [Vercel Docs](https://vercel.com/docs)
   - [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)