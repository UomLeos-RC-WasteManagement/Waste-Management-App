# Waste Management App - Backend API

A comprehensive waste management system backend built with Node.js, Express, and MongoDB.

## Features

### User Features
- Register and login with JWT authentication
- Find nearby collection points on map
- Track waste disposal history
- Earn points for waste disposal
- Redeem rewards from vendors
- Participate in challenges
- Earn badges for achievements
- View leaderboard

### Collector Features
- Verify waste drop-offs via QR scan
- Log waste transactions
- View dashboard with daily/monthly stats
- Generate waste collection reports
- Manage profile and operating hours

### Vendor Features
- Create and manage reward offers
- Track redemptions
- View analytics and reports
- Verify redemption codes
- Manage vendor profile

### Admin Features
- Manage users, collectors, and vendors
- Create challenges and badges
- View system-wide analytics
- Monitor all transactions
- Generate comprehensive reports

## Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **File Upload:** Multer
- **QR Code Generation:** qrcode
- **Environment Variables:** dotenv
- **CORS:** cors

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and update the values:
   ```bash
   cp .env.example .env
   ```

   Update the following variables in `.env`:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/waste-management
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRE=7d
   MAX_FILE_SIZE=5242880
   UPLOAD_PATH=./uploads
   CLIENT_URL=http://localhost:8081
   ```

4. **Start MongoDB**
   
   Make sure MongoDB is running on your system:
   ```bash
   # On macOS with Homebrew
   brew services start mongodb-community
   
   # On Linux
   sudo systemctl start mongod
   
   # Or run manually
   mongod
   ```

5. **Run the application**

   For development (with nodemon):
   ```bash
   npm run dev
   ```

   For production:
   ```bash
   npm start
   ```

## API Endpoints

### Authentication (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/register/user` | Register new user | Public |
| POST | `/login` | Login (all roles) | Public |
| GET | `/me` | Get current user | Private |
| PUT | `/update-profile` | Update profile | Private |
| PUT | `/change-password` | Change password | Private |

### Users (`/api/users`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Get user dashboard | User |
| GET | `/collection-points` | Get nearby collectors | User |
| GET | `/transactions` | Get waste transactions | User |
| GET | `/rewards` | Get available rewards | User |
| POST | `/rewards/:id/redeem` | Redeem a reward | User |
| GET | `/redemptions` | Get redemptions history | User |
| GET | `/challenges` | Get active challenges | User |
| POST | `/challenges/:id/join` | Join a challenge | User |
| GET | `/leaderboard` | Get leaderboard | User |
| GET | `/badges` | Get user's badges | User |

### Collectors (`/api/collectors`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Get collector dashboard | Collector |
| POST | `/verify-dropoff` | Verify waste drop-off | Collector |
| GET | `/transactions` | Get transactions | Collector |
| GET | `/reports` | Get collection reports | Collector |
| PUT | `/profile` | Update profile | Collector |

### Vendors (`/api/vendors`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Get vendor dashboard | Vendor |
| POST | `/rewards` | Create new reward | Vendor |
| GET | `/rewards` | Get all rewards | Vendor |
| PUT | `/rewards/:id` | Update reward | Vendor |
| DELETE | `/rewards/:id` | Delete reward | Vendor |
| GET | `/redemptions` | Get redemptions | Vendor |
| POST | `/redemptions/:code/verify` | Verify redemption code | Vendor |
| GET | `/analytics` | Get analytics | Vendor |
| PUT | `/profile` | Update profile | Vendor |

### Admin (`/api/admin`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/dashboard` | Get admin dashboard | Admin |
| GET | `/users` | Get all users | Admin |
| PUT | `/users/:id/status` | Update user status | Admin |
| POST | `/collectors` | Create collector | Admin |
| GET | `/collectors` | Get all collectors | Admin |
| PUT | `/collectors/:id` | Update collector | Admin |
| DELETE | `/collectors/:id` | Delete collector | Admin |
| POST | `/vendors` | Create vendor | Admin |
| GET | `/vendors` | Get all vendors | Admin |
| PUT | `/vendors/:id` | Update vendor | Admin |
| DELETE | `/vendors/:id` | Delete vendor | Admin |
| POST | `/challenges` | Create challenge | Admin |
| GET | `/challenges` | Get all challenges | Admin |
| PUT | `/challenges/:id` | Update challenge | Admin |
| POST | `/badges` | Create badge | Admin |
| GET | `/badges` | Get all badges | Admin |
| GET | `/analytics` | Get system analytics | Admin |

## Authentication

All protected routes require a JWT token in the Authorization header:

```
Authorization: Bearer <token>
```

### Login Request Example

```json
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123",
  "role": "user"
}
```

Roles: `user`, `collector`, `vendor`, `admin`

## Data Models

### User
- Personal information
- Points and badges
- QR code for drop-offs
- Waste disposal history

### Collector
- Collection point details
- Location with geospatial indexing
- Operating hours
- Accepted waste types
- Collection statistics

### Vendor
- Business information
- Rewards offered
- Redemption tracking
- Analytics data

### WasteTransaction
- User and collector references
- Waste type and quantity
- Points earned
- Verification status
- Location data

### Reward
- Vendor reference
- Points required
- Discount details
- Validity period
- Stock management

### Challenge
- Goal and reward
- Participants tracking
- Progress monitoring
- Time-based challenges

### Badge
- Achievement criteria
- Rarity and level
- Points bonus
- Icon/image

## Points System

Points are calculated based on waste type and quantity:

- E-waste: 50 points/kg
- Plastic: 10 points/kg
- Polythene: 10 points/kg
- Metal: 20 points/kg
- Glass: 5 points/kg
- Paper: 5 points/kg
- Organic: 3 points/kg

## File Upload

Images can be uploaded for:
- User profile pictures
- Collector photos
- Vendor logos
- Reward images
- Badge icons

Max file size: 5MB
Allowed formats: JPEG, JPG, PNG, GIF, WEBP

## Error Handling

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... },
  "count": 10  // For list endpoints
}
```

**Error:**
```json
{
  "success": false,
  "message": "Error description"
}
```

## Development

### Scripts

```bash
# Start development server with nodemon
npm run dev

# Start production server
npm start
```

### Database Seeding (Optional)

You can create a seed script to populate initial data:
- Admin user
- Sample collectors
- Sample vendors
- Badges
- Challenges

## Production Deployment

1. Set `NODE_ENV=production` in `.env`
2. Use a strong `JWT_SECRET`
3. Configure production MongoDB URI
4. Set up reverse proxy (nginx)
5. Use PM2 or similar for process management
6. Enable HTTPS
7. Set up monitoring and logging

## Security

- Passwords are hashed using bcryptjs
- JWT tokens for authentication
- Role-based access control
- Input validation
- CORS configuration
- File upload restrictions
- Rate limiting (recommended for production)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Support

For issues and questions, please open an issue on GitHub.

## Authors

Waste Management Team

## Version

1.0.0
