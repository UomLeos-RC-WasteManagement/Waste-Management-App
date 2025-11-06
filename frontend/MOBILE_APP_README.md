# Waste Management Mobile App - Frontend

React Native mobile application built with Expo for the Waste Management System.

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo Go app on your mobile device (for testing)
- iOS Simulator (Mac only) or Android Emulator

### Installation

1. **Install dependencies**
```bash
cd frontend
npm install
```

2. **Configure API endpoint**
Edit `constants/config.ts` to set your backend API URL:
```typescript
export const API_URL = 'http://your-server-ip:3000/api';
```

For local development:
- **iOS Simulator**: `http://localhost:3000/api`
- **Android Emulator**: `http://10.0.2.2:3000/api`
- **Physical Device**: `http://YOUR_COMPUTER_IP:3000/api`

3. **Start the app**
```bash
npm start
```

4. **Run on device/simulator**
- Press `i` for iOS simulator
- Press `a` for Android emulator
- Scan QR code with Expo Go app on your phone

## 📱 App Structure

### Authentication Flow
```
/(auth)/
  ├── login.tsx       # Login screen
  └── register.tsx    # Registration screen

/(tabs)/              # Main app (after login)
  ├── index.tsx       # Home/Dashboard
  ├── map.tsx         # Collection Points Map
  ├── rewards.tsx     # Rewards & Redemptions
  └── profile.tsx     # User Profile & Leaderboard
```

### Key Features

#### 🏠 Home Screen
- User greeting and points display
- Total waste recycled statistics
- Monthly waste summary
- Waste breakdown by type
- Quick actions to find collection points

#### 🗺️ Map Screen
- List of nearby waste collectors
- Filter by waste type
- Collection point details (location, hours, contact)
- Distance to each collector
- Call collector or get directions

#### 🎁 Rewards Screen
- Available rewards catalog
- Redeem rewards with points
- Redemption history
- Redemption codes for claimed rewards
- Real-time points validation

#### 👤 Profile Screen
- User information and avatar
- Points, waste, and badges statistics
- Leaderboard rankings (top 10)
- Account settings menu
- Logout functionality

## 🔧 Configuration

### Environment Setup

The app uses centralized configuration in `constants/config.ts`:

```typescript
// API Configuration
export const API_URL = 'http://localhost:3000/api';

// Waste Types
export const WASTE_TYPES = [
  { label: 'E-waste', value: 'E-waste', icon: '♻️' },
  { label: 'Plastic', value: 'Plastic', icon: '🧴' },
  // ... more types
];

// Points System
export const POINTS_PER_KG = {
  'E-waste': 50,
  'Plastic': 10,
  // ... more types
};

// Color Scheme
export const COLORS = {
  primary: '#4CAF50',
  secondary: '#2196F3',
  // ... more colors
};
```

### API Service

The app uses Axios with interceptors for API calls (`services/api.ts`):
- Automatically adds authentication token to requests
- Handles 401 errors (auto-logout)
- Centralized error handling

### State Management

Global authentication state managed with React Context (`context/AuthContext.tsx`):
- `user`: Current user object
- `token`: JWT authentication token
- `login()`: User login function
- `register()`: User registration function
- `logout()`: User logout function
- `updateUser()`: Update user data

## 🧪 Testing

### Demo Credentials

Use these credentials to test the app:

**Regular User:**
- Email: `john.doe@example.com`
- Password: `password123`

**Collector:**
- Email: `collector1@example.com`
- Password: `password123`

**Vendor:**
- Email: `vendor1@example.com`
- Password: `password123`

## 📊 Features Overview

### Implemented ✅
- User authentication (login/register)
- Home dashboard with statistics
- Collection points listing
- Rewards catalog and redemption
- User profile and leaderboard
- Points tracking
- Waste breakdown visualization

### Planned 🚧
- QR code scanning for waste verification
- Real-time map with geolocation
- Push notifications
- Camera integration for waste photos
- Challenges and achievements
- Social sharing
- Offline mode

## 🛠️ Development

### File Structure
```
frontend/
├── app/
│   ├── (auth)/           # Authentication screens
│   ├── (tabs)/           # Main app tabs
│   ├── _layout.tsx       # Root layout
│   └── modal.tsx         # Modal screen
├── components/           # Reusable components
├── constants/
│   ├── config.ts         # App configuration
│   └── theme.ts          # Theme constants
├── context/
│   └── AuthContext.tsx   # Auth state management
├── services/
│   └── api.ts            # API service
└── hooks/                # Custom hooks
```

### Adding New Screens

1. Create screen file in `app/(tabs)/` or `app/(auth)/`
2. Import required components and hooks
3. Add route in `_layout.tsx` if needed

### API Integration

All API endpoints are defined in `constants/config.ts`:
```typescript
export const ENDPOINTS = {
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  DASHBOARD: '/users/dashboard',
  // ... more endpoints
};
```

Use the API service:
```typescript
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/config';

const response = await api.get(ENDPOINTS.DASHBOARD);
```

## 🐛 Troubleshooting

### Common Issues

**1. Cannot connect to backend**
- Check if backend server is running
- Verify API_URL in `config.ts`
- Use correct IP address for physical devices
- Check firewall settings

**2. "Network Error" on login**
- Backend must be accessible from your device
- Use `ipconfig` (Windows) or `ifconfig` (Mac/Linux) to find your IP
- Update API_URL to `http://YOUR_IP:3000/api`

**3. Expo app won't start**
- Clear cache: `npm start -- --clear`
- Delete node_modules and reinstall
- Check Expo CLI version

**4. TypeScript errors**
- Run `npm run build` to check for errors
- Ensure all dependencies are installed

## 📝 Notes

- The app requires the backend server to be running
- Mock data is used for collectors in the Map screen (replace with real API)
- Some features like camera and maps require additional setup
- AsyncStorage is used for token persistence

## 🚀 Building for Production

### iOS
```bash
npm run ios
# or
eas build --platform ios
```

### Android
```bash
npm run android
# or
eas build --platform android
```

## 📄 License

Part of the Waste Management System project.
