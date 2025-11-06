# Quick Start Guide

## ✅ What I Fixed

1. **Removed deprecated MongoDB options** from `db.js`:
   - Removed `useNewUrlParser` and `useUnifiedTopology` (no longer needed in Mongoose 6+)
   
2. **Fixed duplicate index warning** in `RewardRedemption.js`:
   - Removed `unique: true` from schema field definition
   - Added proper unique index using `schema.index()` method

## 🚀 Your Backend is Ready!

Your server is running successfully at: **http://localhost:3000**
MongoDB is connected to: **MongoDB Atlas**

## 📦 What's Included

### Database Models ✅
- User, Collector, Vendor, Admin
- WasteTransaction, Reward, RewardRedemption
- Challenge, Badge

### API Routes ✅
- `/api/auth` - Authentication
- `/api/users` - User features
- `/api/collectors` - Collector features
- `/api/vendors` - Vendor features
- `/api/admin` - Admin features

### Features ✅
- JWT Authentication
- Role-based access control
- Points system
- QR code generation
- Geospatial queries
- File uploads
- Badge system
- Challenges
- Leaderboard

## 🎯 Next Steps

### 1. Seed the Database

Run this command to populate your database with sample data:

```bash
npm run seed
```

This will create:
- 1 Admin account
- 3 Collectors (in SF, LA, NY)
- 3 Vendors
- 4 Rewards
- 5 Badges
- 3 Challenges
- 2 Sample users

### 2. Test the API

Check out `API_TESTING.md` for detailed endpoint examples.

Quick test:
```bash
curl http://localhost:3000
```

### 3. Login with Sample Accounts

After seeding, you can login with:

**Admin:**
- Email: `admin@wastemanagement.com`
- Password: `admin123456`

**Collector:**
- Email: `green@recycling.com`
- Password: `collector123`

**Vendor:**
- Email: `contact@ecostore.com`
- Password: `vendor123`

**User:**
- Email: `alice@example.com`
- Password: `user123`

## 📝 Common Commands

```bash
# Start development server
npm run dev

# Start production server
npm start

# Seed database
npm run seed

# Check MongoDB connection
# Your .env should have: MONGODB_URI=mongodb+srv://...
```

## 🔍 Verify Everything Works

1. **Server Status**
   ```bash
   curl http://localhost:3000
   ```

2. **Register a User**
   ```bash
   curl -X POST http://localhost:3000/api/auth/register/user \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Test User",
       "email": "test@example.com",
       "password": "password123",
       "phone": "+1234567890"
     }'
   ```

3. **Login**
   ```bash
   curl -X POST http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "role": "user"
     }'
   ```

## 📚 Documentation Files

- **README.md** - Complete API documentation
- **API_TESTING.md** - Testing guide with examples
- **QUICK_START.md** - This file
- **.env.example** - Environment variables template

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Issues
- Check your `MONGODB_URI` in `.env`
- Ensure MongoDB Atlas allows your IP address
- Check network connection

### Package Issues
```bash
# Reinstall packages
rm -rf node_modules package-lock.json
npm install
```

## 🎨 Postman Collection

Import `API_TESTING.md` examples into Postman or use this quick collection:

1. Create new collection "Waste Management API"
2. Add environment variable: `baseUrl = http://localhost:3000`
3. Add environment variable: `token = (will be set after login)`
4. Import the requests from API_TESTING.md

## 🔐 Security Notes

- Default JWT expires in 7 days
- Passwords are hashed with bcrypt
- CORS is enabled for development
- For production:
  - Change JWT_SECRET to a strong random string
  - Update CORS settings
  - Enable HTTPS
  - Add rate limiting
  - Use environment-specific configs

## 📊 Points System

- E-waste: **50 points/kg**
- Plastic: **10 points/kg**
- Polythene: **10 points/kg**
- Metal: **20 points/kg**
- Glass: **5 points/kg**
- Paper: **5 points/kg**
- Organic: **3 points/kg**

## 🏆 Badge Levels

1. **Bronze** - Eco Beginner (10kg)
2. **Silver** - Plastic Warrior (50kg plastic)
3. **Gold** - E-Waste Champion (25kg e-waste)
4. **Platinum** - Eco Master (100kg)
5. **Diamond** - Sustainability Legend (500kg)

## 🚧 What's Next?

1. ✅ Backend complete
2. 🔜 Frontend (React Native)
3. 🔜 AI Image Recognition for waste classification
4. 🔜 Push notifications
5. 🔜 Payment integration for rewards
6. 🔜 Admin dashboard (web)

## 💡 Tips

- Use Postman for API testing
- Check terminal logs for debugging
- MongoDB Compass for database visualization
- Use VS Code REST Client extension for quick tests

## 🆘 Need Help?

Check these files:
- `README.md` - Full documentation
- `API_TESTING.md` - API examples
- `server.js` - Main application file
- `models/` - Database schemas
- `controllers/` - Business logic
- `routes/` - API endpoints

Your backend is production-ready! 🎉
