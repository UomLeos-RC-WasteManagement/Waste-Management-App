# Deploying Backend to Vercel

## 📋 Prerequisites

1. **Vercel Account** - Sign up at [vercel.com](https://vercel.com)
2. **Vercel CLI** (Optional) - Install globally:
   ```bash
   npm install -g vercel
   ```

---

## 🚀 Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push Code to GitHub**
   ```bash
   cd backend
   git add .
   git commit -m "Prepare backend for Vercel deployment"
   git push origin main
   ```

2. **Import Project to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your repository
   - Select the `backend` folder as the root directory

3. **Configure Project**
   - **Framework Preset**: Other
   - **Root Directory**: `backend`
   - **Build Command**: Leave empty (not needed)
   - **Output Directory**: Leave empty
   - **Install Command**: `npm install`

4. **Add Environment Variables**
   Click "Environment Variables" and add:
   
   ```
   NODE_ENV=production
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_jwt_secret_key
   CLIENT_URL=https://your-frontend-domain.vercel.app
   ```

   **Get MongoDB URI:**
   - Go to MongoDB Atlas
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database password

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Your backend will be live at `https://your-project.vercel.app`

---

### Option 2: Deploy via Vercel CLI

1. **Login to Vercel**
   ```bash
   cd backend
   vercel login
   ```

2. **Deploy**
   ```bash
   vercel
   ```

3. **Follow Prompts**
   - Set up and deploy? `Y`
   - Which scope? Choose your account
   - Link to existing project? `N`
   - Project name? `waste-management-backend`
   - In which directory is your code? `./`
   - Auto-detected settings? `Y`

4. **Add Environment Variables**
   ```bash
   vercel env add MONGODB_URI
   vercel env add JWT_SECRET
   vercel env add CLIENT_URL
   vercel env add NODE_ENV
   ```

5. **Deploy to Production**
   ```bash
   vercel --prod
   ```

---

## 📁 File Structure

Your backend now has these files for Vercel:

```
backend/
├── api/
│   └── index.js          # Vercel serverless entry point
├── config/
│   ├── db.js
│   └── jwt.js
├── controllers/
├── middleware/
├── models/
├── routes/
├── utils/
├── server.js             # Main Express app (modified)
├── package.json
├── .env                  # Local only (NOT deployed)
└── vercel.json          # Vercel configuration
```

---

## ⚙️ Configuration Files Explained

### `vercel.json`
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/api"
    }
  ]
}
```
- Routes all requests to `/api/index.js`
- Uses modern Vercel configuration (no deprecated properties)

### `api/index.js`
```javascript
const app = require('../server.js');
module.exports = app;
```
- Imports the Express app
- Exports it for Vercel's serverless functions

### `server.js` (Modified)
- Only starts local server when not in Vercel environment
- Exports the app for serverless deployment

---

## 🔒 Environment Variables

Add these in Vercel Dashboard (Settings → Environment Variables):

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `production` |
| `MONGODB_URI` | MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `JWT_SECRET` | Secret key for JWT tokens | `your-super-secret-key-here-change-this` |
| `CLIENT_URL` | Frontend URL for CORS | `https://your-app.vercel.app` |

**Important:** 
- Never commit `.env` file to Git
- Add `.env` to `.gitignore`
- Use Vercel's environment variable system

---

## 🧪 Testing Deployment

1. **Check Root Endpoint**
   ```bash
   curl https://your-backend.vercel.app/
   ```
   
   Expected response:
   ```json
   {
     "message": "Waste Management API",
     "version": "1.0.0",
     "status": "running",
     "endpoints": {
       "auth": "/api/auth",
       "users": "/api/users",
       "collectors": "/api/collectors",
       "vendors": "/api/vendors",
       "admin": "/api/admin"
     }
   }
   ```

2. **Test API Endpoint**
   ```bash
   curl https://your-backend.vercel.app/api/auth/login \
     -X POST \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"test123","role":"user"}'
   ```

3. **Update Frontend**
   
   In `frontend/constants/config.ts`:
   ```typescript
   export const API_URL = 'https://your-backend.vercel.app/api';
   ```

---

## 🔧 Troubleshooting

### Issue: "Module not found" error

**Solution:** Check that all dependencies are in `package.json`:
```bash
cd backend
npm install
```

### Issue: MongoDB connection timeout

**Solution:** 
1. Whitelist Vercel IPs in MongoDB Atlas:
   - Go to Network Access in MongoDB Atlas
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"

### Issue: CORS errors from frontend

**Solution:** Update `CLIENT_URL` environment variable:
```
CLIENT_URL=https://your-frontend.vercel.app
```

### Issue: Routes not working

**Solution:** Make sure `vercel.json` is in the backend root:
```bash
ls -la backend/vercel.json
```

### Issue: Environment variables not loading

**Solution:**
1. Check Vercel Dashboard → Settings → Environment Variables
2. Make sure they're set for "Production"
3. Redeploy after adding variables

---

## 📊 Vercel Function Limits

**Free (Hobby) Plan:**
- Function execution: 10 seconds max
- Memory: 1024 MB
- Deployments: 100/day
- Bandwidth: 100 GB/month

**Pro Plan:**
- Function execution: 60 seconds max
- Memory: 3008 MB
- Deployments: 6000/day
- Bandwidth: 1 TB/month

---

## 🔄 Continuous Deployment

Once set up, Vercel automatically:
- ✅ Deploys on every `git push` to main branch
- ✅ Creates preview deployments for pull requests
- ✅ Runs builds and checks
- ✅ Updates environment variables

To disable auto-deployment:
- Go to Project Settings → Git
- Uncheck "Production Branch"

---

## 📝 .gitignore

Make sure your `.gitignore` includes:

```
# Environment
.env
.env.local
.env.production

# Vercel
.vercel

# Dependencies
node_modules/

# Uploads (if using local storage)
uploads/
```

---

## 🎯 Post-Deployment Checklist

- [ ] Backend deployed successfully
- [ ] Environment variables configured
- [ ] MongoDB connection working
- [ ] All API endpoints responding
- [ ] CORS configured for frontend domain
- [ ] Frontend updated with backend URL
- [ ] Test registration flow
- [ ] Test login flow
- [ ] Test protected routes

---

## 🌐 Custom Domain (Optional)

1. Go to Project Settings → Domains
2. Add your domain: `api.yourdomain.com`
3. Configure DNS records as shown
4. Wait for SSL certificate provisioning
5. Update frontend `API_URL` to use custom domain

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel CLI Reference](https://vercel.com/docs/cli)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Serverless Functions](https://vercel.com/docs/concepts/functions/serverless-functions)

---

## 🎉 Success!

Your backend is now deployed on Vercel with:
- ✅ Serverless architecture
- ✅ Automatic scaling
- ✅ Global CDN
- ✅ HTTPS by default
- ✅ CI/CD pipeline

**Next:** Deploy your frontend to Vercel and connect them together!
