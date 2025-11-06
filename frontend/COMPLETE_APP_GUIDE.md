# Waste Management App - Complete Guide
## Multi-Role Mobile Application

---

## 🎯 **App Overview**

This is a **unified mobile app** that serves **3 different user types**:
1. **👤 Users (Citizens)** - Dispose waste and earn rewards
2. **🚛 Collectors** - Collect waste from users
3. **🏭 Vendors** - Buy waste from collectors for recycling

The app uses **role-based navigation** - each user type sees different screens after login.

---

## 📱 **App Structure**

```
frontend/app/
├── (auth)/                    # Authentication (for all roles)
│   ├── _layout.tsx
│   ├── login.tsx             # Login screen
│   └── register.tsx          # Registration with role selection
│
├── (tabs)/                    # User (Citizen) Screens
│   ├── _layout.tsx           # Bottom tabs: Home, Map, Rewards, Profile
│   ├── index.tsx             # Dashboard
│   ├── map.tsx               # Collection points map
│   ├── rewards.tsx           # Rewards & redemptions
│   └── profile.tsx           # User profile & leaderboard
│
├── (collector-tabs)/          # Collector Screens
│   ├── _layout.tsx           # Bottom tabs: Dashboard, Scan, Inventory, Vendors, Profile
│   ├── index.tsx             # Collector dashboard
│   ├── scan.tsx              # QR code scanner
│   ├── inventory.tsx         # Waste inventory
│   ├── vendors.tsx           # Find vendors to sell
│   └── profile.tsx           # Collector profile
│
├── (vendor-tabs)/             # Vendor Screens
│   ├── _layout.tsx           # Bottom tabs: Dashboard, Offers, Inventory, Pricing, Profile
│   ├── index.tsx             # Vendor dashboard
│   ├── offers.tsx            # Browse waste offers
│   ├── inventory.tsx         # Purchased waste
│   ├── pricing.tsx           # Set purchase prices
│   └── profile.tsx           # Vendor profile
│
├── _layout.tsx                # Root layout with AuthProvider
└── index.tsx                  # Entry point - routes based on role
```

---

## 🔐 **Authentication & Role-Based Routing**

### **Registration Flow**

1. User opens app → Sees registration screen
2. **Selects role** (User, Collector, or Vendor)
3. Fills in details (name, email, phone, password)
4. System creates account with selected role
5. Auto-logs in and redirects based on role:
   - `role = 'user'` → `/(tabs)` (User screens)
   - `role = 'collector'` → `/(collector-tabs)` (Collector screens)
   - `role = 'vendor'` → `/(vendor-tabs)` (Vendor screens)

### **Login Flow**

1. User enters email + password
2. Backend returns user data with role
3. App redirects based on user role (same as registration)

### **Key Files**

- **`app/index.tsx`**: Entry point that checks user role and redirects
  ```typescript
  if (user.role === 'collector') {
    return <Redirect href="/(collector-tabs)" />;
  } else if (user.role === 'vendor') {
    return <Redirect href="/(vendor-tabs)" />;
  } else {
    return <Redirect href="/(tabs)" />;
  }
  ```

- **`app/(auth)/register.tsx`**: Added role selector with 3 cards
  - User (👤) - Dispose waste & earn rewards
  - Collector (🚛) - Collect waste from users
  - Vendor (🏭) - Buy waste for recycling

---

## 👤 **User (Citizen) Features**

### **Tab Navigation**
- 🏠 **Home** - Dashboard with stats
- 🗺️ **Map** - Find collection points
- 🎁 **Rewards** - Redeem points
- 👤 **Profile** - Leaderboard & settings

### **Screen Descriptions**

#### **Home (Dashboard)**
- Displays user's total points
- Shows waste recycled (kg)
- Monthly statistics
- Waste breakdown by type
- Quick action buttons

#### **Map**
- List of nearby collectors
- Filter by waste type
- Collection point details:
  - Location, phone, operating hours
  - Accepted waste types
  - Distance from user
- Call or get directions

#### **Rewards**
- **Available Rewards Tab**: Browse rewards catalog
- **My Redemptions Tab**: View redemption history
- Redeem rewards with points
- Get redemption codes (QR codes)
- Check if enough points

#### **Profile**
- User stats (points, waste, badges)
- Leaderboard (top 10 users)
- Earned badges display
- Account settings
- Logout

### **How Users Earn Points**

1. User finds a collector (Map screen)
2. Goes to collection point with waste
3. Shows QR code to collector
4. Collector scans QR, weighs waste, selects type
5. **System automatically awards points**:
   - E-waste: 50 pts/kg
   - Metal: 20 pts/kg
   - Plastic: 10 pts/kg
   - Polythene: 10 pts/kg
   - Paper: 5 pts/kg
   - Glass: 5 pts/kg
   - Organic: 3 pts/kg

---

## 🚛 **Collector Features**

### **Tab Navigation**
- 🏠 **Dashboard** - Collection stats
- 📱 **Scan QR** - Record collections
- 📦 **Inventory** - Collected waste
- 🏭 **Vendors** - Find buyers
- 👤 **Profile** - Settings

### **Screen Descriptions**

#### **Dashboard**
- Today's collections count
- Today's total weight
- Weekly/monthly statistics
- Total earnings
- Current inventory
- Quick action buttons

#### **Scan QR (Record Collection)**
**3-Step Process:**

**Step 1: Scan User**
- Enter or scan user QR code
- System verifies user
- Displays user info (name, email, current points)

**Step 2: Select Waste Type**
- Grid of waste types with icons
- Shows points/kg for each type
- Select one waste type

**Step 3: Enter Weight**
- Input weight in kg
- System previews points user will earn
- Confirm or reset

**Result:**
- Transaction recorded
- User gets points automatically
- Waste added to collector inventory

#### **Inventory**
- List of collected waste by type
- Total inventory weight
- Number of collections per type
- Ready to sell to vendors

#### **Vendors**
- List of nearby vendors
- Vendor details:
  - Name, location, contact
  - Accepted waste types
  - Prices per kg
- Contact vendor button
- Make sale offers

#### **Profile**
- Same as user profile
- Leaderboard, stats, logout

### **Collector Workflow Example**

1. User brings 5kg of E-waste
2. Collector opens **Scan QR** screen
3. Scans user's QR code → User verified
4. Selects "E-waste" from grid
5. Enters weight: 5kg
6. System shows: "User will earn 250 points" (5 × 50)
7. Confirms → Transaction recorded
8. User instantly gets 250 points
9. 5kg E-waste added to collector inventory
10. When inventory reaches 100kg, collector sells to vendor

---

## 🏭 **Vendor Features**

### **Tab Navigation**
- 🏠 **Dashboard** - Purchase stats
- 🛒 **Offers** - Buy waste
- 📦 **Inventory** - Purchased waste
- 💵 **Pricing** - Set prices
- 👤 **Profile** - Settings

### **Screen Descriptions**

#### **Dashboard**
- Today's purchases
- Today's weight purchased
- Weekly/monthly stats
- Total spent
- Current inventory

#### **Offers (Browse Waste)**
- List of waste available from collectors
- Each offer shows:
  - Collector name
  - Waste type
  - Weight (kg)
  - Total price
- Purchase button
- Confirmation dialog

#### **Inventory**
- Purchased waste by type
- Total inventory weight
- Processing status

#### **Pricing**
- Set purchase price per kg for each waste type
- Input fields for all 7 waste types
- Save pricing button
- Collectors see these prices

#### **Profile**
- Vendor stats
- Settings
- Logout

### **Vendor Workflow Example**

1. Vendor sets prices (Pricing screen):
   - E-waste: Rs. 150/kg
   - Plastic: Rs. 40/kg
   - Metal: Rs. 80/kg
2. Collector collects 100kg E-waste
3. Collector creates offer: 100kg E-waste
4. Vendor sees offer in **Offers** screen
5. Offer shows: 100kg × Rs. 150 = Rs. 15,000
6. Vendor clicks "Purchase"
7. Confirms purchase
8. Waste added to vendor inventory
9. Payment processed

---

## 🔄 **Complete Transaction Flow**

### **Full Cycle: User → Collector → Vendor**

#### **Phase 1: User Disposes Waste**
1. User has 10kg of plastic bottles
2. Opens app → Map → Finds "Green Point Collector"
3. Goes to collection point
4. Shows QR code
5. Collector scans → Weighs → Selects "Plastic"
6. **User earns: 10kg × 10 pts = 100 points**
7. User can now redeem rewards

#### **Phase 2: Collector Accumulates**
8. Collector collects from 20 users
9. Total plastic inventory: 200kg
10. Checks **Vendors** screen
11. Finds "Plastic Solutions Ltd." paying Rs. 40/kg
12. Creates offer: 200kg plastic

#### **Phase 3: Vendor Purchases**
13. Vendor opens **Offers** screen
14. Sees: 200kg plastic from Green Point Collector
15. Price: 200 × 40 = Rs. 8,000
16. Clicks **Purchase** → Confirms
17. Waste moves to vendor inventory
18. Collector gets paid Rs. 8,000
19. Vendor processes plastic for recycling

---

## 🎨 **Design Features**

### **Common Elements**
- **Color Scheme**: Green primary (#4CAF50)
- **Icons**: Emojis for waste types (♻️, 🧴, 📄, etc.)
- **Cards**: Rounded corners, shadows
- **Buttons**: Bold, clear actions
- **Stats**: Large numbers, icons

### **Role-Specific Colors**
- User screens: Green theme
- Collector screens: Green theme
- Vendor screens: Green theme
(All use the same COLORS.primary for consistency)

---

## 📊 **Waste Types & Points**

| Icon | Type | Points/kg | Vendor Price Range |
|------|------|-----------|-------------------|
| ♻️ | E-waste | 50 | Rs. 100-200/kg |
| 🧴 | Plastic | 10 | Rs. 30-50/kg |
| 🛍️ | Polythene | 10 | Rs. 25-40/kg |
| 🔩 | Metal | 20 | Rs. 60-100/kg |
| 🪟 | Glass | 5 | Rs. 15-30/kg |
| 📄 | Paper | 5 | Rs. 20-35/kg |
| 🌿 | Organic | 3 | Rs. 10-20/kg |

---

## 🔧 **Technical Implementation**

### **Role-Based Routing**

**Root Layout** (`app/_layout.tsx`):
```typescript
<Stack>
  <Stack.Screen name="(auth)" />
  <Stack.Screen name="(tabs)" />          // User screens
  <Stack.Screen name="(collector-tabs)" /> // Collector screens
  <Stack.Screen name="(vendor-tabs)" />   // Vendor screens
</Stack>
```

**Entry Point** (`app/index.tsx`):
```typescript
if (user.role === 'collector') return <Redirect href="/(collector-tabs)" />;
else if (user.role === 'vendor') return <Redirect href="/(vendor-tabs)" />;
else return <Redirect href="/(tabs)" />;
```

### **Authentication Context**

Shared across all roles:
- `user`: Current user object (includes `role` field)
- `token`: JWT token
- `login()`, `register()`, `logout()`
- Persisted in AsyncStorage

### **API Endpoints** (from `constants/config.ts`)

```typescript
// Users
/users/dashboard
/users/collection-points
/users/rewards
/users/redemptions

// Collectors
/collectors/dashboard
/collectors/record-collection
/collectors/inventory
/collectors/vendors

// Vendors
/vendors/dashboard
/vendors/offers
/vendors/purchase
/vendors/inventory
/vendors/pricing
```

---

## 🚀 **Getting Started**

### **For Users:**
1. Download app
2. Register → Select "User" role
3. Complete profile
4. Find collection points on Map
5. Dispose waste, earn points
6. Redeem rewards

### **For Collectors:**
1. Download app
2. Register → Select "Collector" role
3. Set up collection point details
4. Scan user QR codes
5. Record collections
6. Sell to vendors

### **For Vendors:**
1. Download app
2. Register → Select "Vendor" role
3. Set purchase prices
4. Browse waste offers
5. Purchase from collectors
6. Manage inventory

---

## 📱 **Demo Credentials**

### **Users:**
- Email: `john.doe@example.com`
- Password: `password123`
- Role: user

### **Collectors:**
- Email: `collector1@example.com`
- Password: `password123`
- Role: collector

### **Vendors:**
- Email: `vendor1@example.com`
- Password: `password123`
- Role: vendor

---

## ✅ **Implemented Features**

### **✅ All Roles**
- Registration with role selection
- Login with role-based routing
- Profile management
- Logout functionality

### **✅ Users**
- Dashboard with stats
- Collection points listing
- Rewards catalog
- Redemption history
- Leaderboard
- Waste breakdown

### **✅ Collectors**
- Collection dashboard
- QR code entry (manual)
- 3-step waste recording
- Inventory tracking
- Vendor marketplace
- Points calculation

### **✅ Vendors**
- Purchase dashboard
- Waste offers browsing
- Inventory management
- Pricing configuration
- Purchase workflow

---

## 🚧 **Future Enhancements**

### **Camera Integration**
- QR code scanning with camera (expo-camera)
- Barcode scanner (expo-barcode-scanner)
- Photo proof of waste

### **Maps Integration**
- Real-time map with markers (react-native-maps)
- GPS location (expo-location)
- Directions to collection points

### **Notifications**
- Push notifications (expo-notifications)
- Transaction alerts
- Reward redemption confirmations

### **Gamification**
- Challenges & competitions
- Badge achievements
- Social sharing

### **Analytics**
- User impact reports
- Collector performance
- Vendor purchase history
- Environmental impact (CO2 saved)

---

## 💡 **Key Benefits**

### **Single App, Multiple Roles**
✅ Users don't need separate apps  
✅ Easier to maintain  
✅ Consistent design across roles  
✅ Shared authentication  

### **Complete Ecosystem**
✅ Users earn rewards → Gamification  
✅ Collectors get organized system → Efficiency  
✅ Vendors get quality waste → Business  
✅ Environment benefits → Sustainability  

---

## 📝 **Notes**

- All screens are fully functional with UI
- Currently using **mock data** (replace with actual API calls)
- QR scanner uses **manual entry** (add camera later)
- Maps use **list view** (add react-native-maps later)
- All role workflows are complete

---

This app creates a **circular economy** where everyone benefits! 🌍♻️💚
