# Quick Vercel Deployment Commands

## 🚀 First Time Setup

```bash
# 1. Navigate to backend
cd backend

# 2. Install Vercel CLI (if not installed)
npm install -g vercel

# 3. Login to Vercel
vercel login

# 4. Deploy
vercel

# 5. Deploy to production
vercel --prod
```

---

## 🔑 Environment Variables (via CLI)

```bash
# Add variables one by one
vercel env add MONGODB_URI production
vercel env add JWT_SECRET production
vercel env add CLIENT_URL production
vercel env add NODE_ENV production

# Pull environment variables to local
vercel env pull
```

---

## 📦 Deployment Commands

```bash
# Deploy to preview (development)
vercel

# Deploy to production
vercel --prod

# Deploy and skip build cache
vercel --force

# Deploy with specific name
vercel --name my-backend-api
```

---

## 📊 Project Management

```bash
# List all deployments
vercel ls

# Get deployment info
vercel inspect [deployment-url]

# Remove deployment
vercel rm [deployment-url]

# View logs
vercel logs [deployment-url]

# Open project in browser
vercel open
```

---

## 🌍 Domain Management

```bash
# Add domain
vercel domains add api.yourdomain.com

# List domains
vercel domains ls

# Remove domain
vercel domains rm api.yourdomain.com
```

---

## 🔍 Debugging

```bash
# View build logs
vercel logs --follow

# Local development (simulates Vercel)
vercel dev

# Pull environment variables
vercel env pull .env.local
```

---

## Environment Variable Examples

### MONGODB_URI
```
mongodb+srv://username:password@cluster.mongodb.net/waste-management?retryWrites=true&w=majority
```

### JWT_SECRET
```
your-super-secret-jwt-key-change-this-in-production
```

### CLIENT_URL
```
https://your-frontend.vercel.app
```

### NODE_ENV
```
production
```

---

## 📱 Frontend Update

After deploying backend, update frontend:

**`frontend/constants/config.ts`:**
```typescript
export const API_URL = 'https://your-backend.vercel.app/api';
// Or with custom domain:
// export const API_URL = 'https://api.yourdomain.com/api';
```

---

## ✅ Deployment Checklist

- [ ] `vercel.json` exists in backend folder
- [ ] `api/index.js` created
- [ ] `server.js` modified to export app
- [ ] Environment variables added in Vercel
- [ ] MongoDB whitelist updated (0.0.0.0/0)
- [ ] `.env` added to `.gitignore`
- [ ] Code pushed to GitHub
- [ ] Deployed successfully
- [ ] API endpoints tested
- [ ] Frontend URL updated
- [ ] CORS working

---

## 🎯 Quick Test

```bash
# Test root endpoint
curl https://your-backend.vercel.app/

# Test login
curl -X POST https://your-backend.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test123","role":"user"}'
```

---

## 🆘 Common Fixes

**MongoDB Connection Failed:**
```bash
# Whitelist all IPs in MongoDB Atlas
Network Access → Add IP → Allow Access from Anywhere (0.0.0.0/0)
```

**Environment Variables Not Working:**
```bash
# Redeploy after adding env vars
vercel --prod --force
```

**CORS Error:**
```bash
# Update CLIENT_URL and redeploy
vercel env add CLIENT_URL production
# Enter: https://your-frontend-domain.vercel.app
vercel --prod
```

---

**🎉 You're all set!** Your backend is now running on Vercel's global edge network!
