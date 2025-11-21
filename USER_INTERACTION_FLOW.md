# Waste Management App - User Interaction Flow Documentation

## Overview
The app has **three main user types** that interact in a circular ecosystem for waste management:

1. **👤 Regular Users** - Dispose waste and earn rewards
2. **♻️ Collectors** - Collect waste from users
3. **🏪 Vendors** - Purchase waste from collectors and provide rewards

---

## 1. Regular User Journey 👤

### **Registration & Setup**
- User registers with: name, email, password, phone, location
- Receives a unique QR code for waste drop-off identification
- Gets initial points balance (0 points)

### **Core Activities**

#### **A. Finding Collection Points**
1. Opens "Map" tab
2. Views nearby collectors based on GPS location
3. Filters by waste type (E-waste, Plastic, Paper, etc.)
4. Sees:
   - Collector name and location
   - Distance from user
   - Accepted waste types
   - Operating hours
   - Contact phone
5. Can call collector or get directions

**API Flow:**
```
GET /api/users/collection-points?longitude=79.8612&latitude=6.9271
→ Returns sorted list of verified collectors within radius
```

**Frontend Implementation:**
- File: `frontend/app/(tabs)/map.tsx`
- Uses device location (or default: Colombo)
- Displays collectors in scrollable cards
- Click-to-call functionality

#### **B. Dropping Off Waste**
1. User takes waste to collection point
2. Collector scans user's QR code
3. Collector weighs waste and selects type
4. System automatically:
   - Calculates points (based on waste type × weight)
   - Credits points to user account
   - Updates user's total waste disposed
   - Checks for badge eligibility
   - Creates transaction record

**Points System:**
```javascript
{
  'E-waste': 50 points/kg,
  'Metal': 20 points/kg,
  'Plastic': 10 points/kg,
  'Polythene': 10 points/kg,
  'Glass': 5 points/kg,
  'Paper': 5 points/kg,
  'Organic': 3 points/kg
}
```

**API Flow:**
```
POST /api/collectors/record-collection
Body: {
  userId: "690d05f91e8aef8bf3d1be7e",
  wasteType: "E-waste",
  quantity: 5.5,
  qrCodeScanned: true
}
→ Response: {
  transaction: {...},
  pointsEarned: 275,
  newBadges: [...]
}
```

**Frontend Implementation:**
- Collector scans user QR using `frontend/app/(collector-tabs)/scan.tsx`
- QR contains encoded user ID
- Real-time points calculation displayed

#### **C. Dashboard Monitoring**
User sees:
- Current points balance
- Total waste disposed (lifetime)
- Monthly waste statistics
- Waste breakdown by type
- Earned badges
- Recent transactions

**API Flow:**
```
GET /api/users/dashboard
→ Returns: {
  user: { name, email, points, totalWasteDisposed, badges },
  stats: { totalTransactions, monthlyWaste, wasteBreakdown }
}
```

**Frontend Implementation:**
- File: `frontend/app/(tabs)/index.tsx`
- Displays stats in cards with icons
- Animated progress indicators
- Pull-to-refresh enabled

#### **D. Redeeming Rewards**
1. Opens "Rewards" tab
2. Browses available rewards from vendors:
   - Discounts (e.g., 10% off)
   - Free items (e.g., reusable bags)
   - Vouchers
3. Filters by:
   - Affordable (enough points)
   - Coming soon (insufficient points)
4. Redeems reward if sufficient points
5. Receives:
   - Unique redemption code
   - QR code to show at vendor
   - Expiration date
6. Points deducted from balance
7. Goes to vendor location
8. Shows QR code/redemption code
9. Vendor verifies and provides reward

**API Flow:**
```
GET /api/users/rewards
→ Returns available rewards categorized by affordability

POST /api/users/rewards/:rewardId/redeem
→ Response: {
  redemption: {
    code: "WASTE-ABC123",
    qrCode: "data:image/png;base64...",
    expiresAt: "2025-12-31"
  },
  remainingPoints: 250
}

GET /api/users/redemptions
→ Returns redemption history
```

**Frontend Implementation:**
- File: `frontend/app/(tabs)/rewards.tsx`
- Shows reward cards with point requirements
- Color-coded badges (affordable vs expensive)
- QR code generation for redemption

#### **E. Challenges & Leaderboard**
- Participates in time-limited challenges
- Competes with other users
- Climbs leaderboard rankings
- Earns special badges

**API Flow:**
```
GET /api/users/challenges
→ Returns active challenges with user progress

POST /api/users/challenges/:challengeId/join
→ Join a challenge

GET /api/users/leaderboard?period=month
→ Returns ranked users by points/waste
```

---

## 2. Collector Journey ♻️

### **Registration & Setup**
- Collector registers with:
  - Business name
  - Location (with GPS coordinates)
  - Accepted waste types
  - Operating hours
  - Contact information
- Gets verified by admin (default: auto-verified in dev)

**API Flow:**
```
POST /api/auth/register
Body: {
  role: "collector",
  name: "Green Point Collector",
  email: "collector@example.com",
  password: "********",
  phone: "+94771234567",
  location: {
    type: "Point",
    coordinates: [79.8612, 6.9271]
  },
  address: {
    street: "123 Main St",
    city: "Colombo",
    zipCode: "00100"
  },
  acceptedWasteTypes: ["E-waste", "Plastic", "Paper"],
  operatingHours: "8:00 AM - 6:00 PM"
}
```

### **Core Activities**

#### **A. Dashboard Overview**
Collector sees:
- Today's statistics:
  - Transactions count
  - Total waste collected (kg)
- Monthly statistics:
  - Total transactions
  - Total waste collected
  - Waste breakdown by type
- Total lifetime stats

**API Flow:**
```
GET /api/collectors/dashboard
→ Returns: {
  collector: {
    name, totalWasteCollected, totalTransactions, acceptedWasteTypes
  },
  today: { transactions, wasteCollected },
  thisMonth: { transactions, wasteCollected, wasteBreakdown }
}
```

**Frontend Implementation:**
- File: `frontend/app/(collector-tabs)/index.tsx`
- Stat cards with today vs month comparison
- Waste type breakdown chart
- Real-time updates

#### **B. Scanning User QR Codes**
1. Opens "Scan" tab
2. Taps camera icon to scan user's QR code
3. QR code contains user ID
4. Selects waste type from dropdown
5. Enters weight (kg)
6. Taps "Record Collection"
7. System:
   - Calculates points for user
   - Creates transaction record
   - Updates both user and collector stats
   - Shows success message with points awarded

**QR Code Format:**
```javascript
{
  "userId": "690d05f91e8aef8bf3d1be7e",
  "timestamp": 1762941023,
  "type": "user-waste-dropoff"
}
```

**API Flow:**
```
POST /api/collectors/record-collection
Body: {
  userId: "690d05f91e8aef8bf3d1be7e",
  wasteType: "E-waste",
  quantity: 5.5,
  unit: "kg",
  qrCodeScanned: true,
  notes: "Good condition electronics"
}
→ Response: {
  success: true,
  data: {
    transaction: {
      _id: "...",
      user: { name: "John Doe" },
      wasteType: "E-waste",
      quantity: { value: 5.5, unit: "kg" },
      pointsEarned: 275,
      status: "verified"
    },
    newBadges: null
  },
  message: "Successfully verified drop-off. User earned 275 points!"
}
```

**Frontend Implementation:**
- File: `frontend/app/(collector-tabs)/scan.tsx`
- Camera integration for QR scanning
- Manual input fallback
- Dropdown for waste type selection
- Real-time points preview
- Success animation

#### **C. Inventory Management**
Collector views accumulated waste:
- Breakdown by waste type
- Total quantity per type
- Number of collections per type
- Total points awarded per type

**API Flow:**
```
GET /api/collectors/inventory
→ Returns: [
  {
    wasteType: "E-waste",
    totalQuantity: 45.5,
    unit: "kg",
    transactions: 12,
    totalPoints: 2275
  },
  {
    wasteType: "Plastic",
    totalQuantity: 123.2,
    unit: "kg",
    transactions: 34,
    totalPoints: 1232
  }
]
```

**Frontend Implementation:**
- File: `frontend/app/(collector-tabs)/inventory.tsx`
- Card layout with waste type icons
- Total inventory summary at top
- Pull-to-refresh enabled

#### **D. Finding Vendors**
1. Opens "Vendors" tab
2. Views nearby vendors who might buy waste
3. Sees:
   - Vendor name and business type
   - Location and distance
   - Contact phone
   - Total rewards offered
4. Can call vendor to negotiate sale

**API Flow:**
```
GET /api/collectors/vendors?radius=50
→ Returns: [
  {
    _id: "...",
    name: "EcoMart Recyclers",
    businessType: "Physical Store",
    description: "We buy all types of recyclable waste",
    address: { street: "...", city: "Colombo" },
    phone: "+94771234567",
    location: { coordinates: [79.8612, 6.9271] },
    totalRewards: 50,
    distance: 2.5
  }
]
```

**Frontend Implementation:**
- File: `frontend/app/(collector-tabs)/vendors.tsx`
- List of vendor cards
- Distance calculation
- Click-to-call functionality
- Pull-to-refresh enabled

#### **E. Transaction History**
- Views all past collections
- Filters by:
  - Status (verified/pending)
  - Date range
  - Waste type
- Sees user details for each transaction

**API Flow:**
```
GET /api/collectors/transactions?status=verified&wasteType=E-waste
→ Returns transaction list with user details
```

---

## 3. Vendor Journey 🏪

### **Registration & Setup**
- Vendor registers with:
  - Business name and type (Physical Store/Online/Both)
  - Location
  - Contact information
  - Description
- Gets verified by admin

**API Flow:**
```
POST /api/auth/register
Body: {
  role: "vendor",
  name: "EcoMart",
  email: "vendor@example.com",
  password: "********",
  phone: "+94771234567",
  businessType: "Physical Store",
  location: {
    type: "Point",
    coordinates: [79.8612, 6.9271]
  },
  address: {
    street: "456 Market St",
    city: "Colombo"
  },
  description: "Eco-friendly products and recycling services"
}
```

### **Core Activities**

#### **A. Dashboard Overview**
Vendor sees:
- Total rewards offered
- Total redemptions processed
- Active rewards count
- Monthly analytics
- Revenue from waste purchases

**API Flow:**
```
GET /api/vendors/dashboard
→ Returns: {
  totalRewards: 50,
  activeRewards: 12,
  totalRedemptions: 234,
  monthlyRedemptions: 45,
  totalWastePurchased: 500.5,
  revenueGenerated: 15000
}
```

**Frontend Implementation:**
- File: `frontend/app/(vendor-tabs)/index.tsx`
- Stat cards with business metrics
- Charts for trends
- Quick action buttons

#### **B. Creating Rewards**
1. Opens rewards management (future implementation)
2. Creates new reward:
   - Title and description
   - Points required
   - Discount percentage or item
   - Valid date range
   - Stock availability
   - Terms & conditions
3. Sets as active/inactive
4. Users can now see and redeem

**API Flow:**
```
POST /api/vendors/rewards
Body: {
  title: "10% Off All Products",
  description: "Valid on all eco-friendly products",
  pointsRequired: 500,
  discountType: "percentage",
  discountValue: 10,
  validFrom: "2025-01-01",
  validUntil: "2025-12-31",
  stockAvailable: 100,
  terms: "Cannot be combined with other offers"
}
→ Creates reward in system
```

#### **C. Verifying Redemptions**
1. User comes to store with QR code/redemption code
2. Vendor scans or enters redemption code
3. System verifies:
   - Code is valid
   - Not expired
   - Not already used
   - Belongs to this vendor
4. Vendor provides reward/discount
5. Marks redemption as completed

**API Flow:**
```
GET /api/vendors/redemptions
→ Returns: [
  {
    _id: "...",
    user: { name: "John Doe", email: "..." },
    reward: { title: "10% Off", description: "..." },
    redemptionCode: "WASTE-ABC123",
    status: "pending",
    createdAt: "2025-11-12",
    expiresAt: "2025-12-31"
  }
]

POST /api/vendors/redemptions/:id/verify
Body: { redemptionCode: "WASTE-ABC123" }
→ Verifies and marks as completed
```

#### **D. Purchasing Waste from Collectors**
1. Opens "Offers" tab
2. Views available waste from collectors:
   - Waste type
   - Quantity (kg)
   - Collector name
   - Asking price
3. Taps "Purchase" on desired offer
4. System:
   - Transfers ownership
   - Updates vendor inventory
   - Records transaction
   - Updates collector's sales record

**API Flow:**
```
GET /api/vendors/offers
→ Returns: [
  {
    id: "1",
    collector: "Green Point Collector",
    collectorId: "...",
    type: "E-waste",
    weight: 45,
    price: 6750,
    pricePerKg: 150,
    location: "Colombo",
    postedAt: "2025-11-12"
  }
]

POST /api/vendors/purchase
Body: {
  offerId: "1",
  collectorId: "...",
  wasteType: "E-waste",
  weight: 45,
  price: 6750
}
→ Response: {
  success: true,
  transaction: {...},
  message: "Purchase completed successfully"
}
```

**Frontend Implementation:**
- File: `frontend/app/(vendor-tabs)/offers.tsx`
- Card layout with offer details
- Purchase confirmation dialog
- Pull-to-refresh enabled
- Loading states

#### **E. Inventory Management**
Vendor views purchased waste:
- Breakdown by type
- Total quantity
- Purchase history
- Value of inventory

**API Flow:**
```
GET /api/vendors/inventory
→ Returns: [
  {
    wasteType: "E-waste",
    totalQuantity: 145.5,
    unit: "kg",
    purchases: 8,
    totalSpent: 21825,
    avgPricePerKg: 150
  },
  {
    wasteType: "Plastic",
    totalQuantity: 450.2,
    unit: "kg",
    purchases: 15,
    totalSpent: 18008,
    avgPricePerKg: 40
  }
]
```

**Frontend Implementation:**
- File: `frontend/app/(vendor-tabs)/inventory.tsx`
- Inventory cards with icons
- Total inventory value
- Purchase history
- Export options

#### **F. Pricing Management**
1. Opens "Pricing" tab
2. Sets purchase price per kg for each waste type:
   - E-waste: ₨150/kg
   - Plastic: ₨40/kg
   - Metal: ₨80/kg
   - Glass: ₨20/kg
   - Paper: ₨25/kg
   - Organic: ₨15/kg
3. Saves pricing
4. Collectors see these prices when offering waste

**API Flow:**
```
GET /api/vendors/pricing
→ Returns current pricing structure

POST /api/vendors/pricing
Body: {
  pricing: [
    { wasteType: "E-waste", pricePerKg: 150 },
    { wasteType: "Plastic", pricePerKg: 40 },
    { wasteType: "Metal", pricePerKg: 80 },
    { wasteType: "Glass", pricePerKg: 20 },
    { wasteType: "Paper", pricePerKg: 25 },
    { wasteType: "Organic", pricePerKg: 15 }
  ]
}
→ Updates pricing in database
```

**Frontend Implementation:**
- File: `frontend/app/(vendor-tabs)/pricing.tsx`
- Input fields for each waste type
- Real-time validation
- Save button with loading state
- Success feedback

---

## Complete Interaction Cycle 🔄

### **Example: Complete Waste Lifecycle**

```
┌─────────────────────────────────────────────────────────────┐
│  DAY 1: WASTE DISPOSAL                                      │
└─────────────────────────────────────────────────────────────┘

1. 👤 USER: John Doe generates 5kg of plastic waste at home

2. 👤 USER: Opens app → Map tab
   - Searches for nearby collectors
   - Finds "Green Point Collector" (2km away)
   - Accepts Plastic, operating 8 AM - 6 PM
   - Calls collector: +94771234567

3. 👤 USER: Drives to collection point with plastic

4. ♻️ COLLECTOR: Opens app → Scan tab
   - Taps "Scan QR Code"
   - Scans John's QR code

5. ♻️ COLLECTOR: Records collection
   - Waste Type: Plastic
   - Weight: 5 kg
   - Taps "Record Collection"

6. 🖥️ SYSTEM: Calculates
   - Points: 5kg × 10 points/kg = 50 points
   - Creates transaction record
   - Updates user points: 0 → 50
   - Updates collector inventory: Plastic +5kg

7. 👤 USER: Receives notification
   - "You earned 50 points! 🎉"
   - Total points: 50
   - Total waste: 5 kg

┌─────────────────────────────────────────────────────────────┐
│  DAY 1-30: ACCUMULATION                                     │
└─────────────────────────────────────────────────────────────┘

8. ♻️ COLLECTOR: Continues collecting
   - Day 30: Total plastic collected = 150 kg
   - Inventory shows: Plastic: 150kg, 30 collections

9. ♻️ COLLECTOR: Opens Vendors tab
   - Searches for nearby vendors
   - Finds "EcoMart Recyclers" (3km away)
   - Pricing: ₨40/kg for plastic
   - Calls vendor: +94771234567

┌─────────────────────────────────────────────────────────────┐
│  DAY 30: WASTE SALE                                         │
└─────────────────────────────────────────────────────────────┘

10. 🏪 VENDOR: Opens Pricing tab (previously set)
    - Plastic: ₨40/kg
    - E-waste: ₨150/kg
    - Metal: ₨80/kg

11. ♻️ COLLECTOR: Creates offer
    - Waste Type: Plastic
    - Quantity: 150 kg
    - Price: 150 × ₨40 = ₨6,000

12. 🏪 VENDOR: Opens Offers tab
    - Sees offer from "Green Point Collector"
    - Plastic: 150kg @ ₨6,000
    - Taps "Purchase"

13. 🖥️ SYSTEM: Processes sale
    - Transfer ownership to vendor
    - Update vendor inventory: Plastic +150kg
    - Record transaction
    - Update collector stats

14. 🏪 VENDOR: Inventory updated
    - Plastic: 150 kg
    - Value: ₨6,000
    - Can process/resell to recycling facility

┌─────────────────────────────────────────────────────────────┐
│  DAY 35: REWARD REDEMPTION                                  │
└─────────────────────────────────────────────────────────────┘

15. 👤 USER: Accumulates points over time
    - Multiple drop-offs
    - Total points: 500

16. 👤 USER: Opens Rewards tab
    - Browses available rewards
    - Sees "10% Off at EcoMart" (500 points)
    - Taps "Redeem"

17. 🖥️ SYSTEM: Processes redemption
    - Deducts 500 points from user
    - Generates redemption code: "WASTE-ABC123"
    - Creates QR code
    - Sets expiry: 30 days

18. 👤 USER: Receives redemption
    - Code: WASTE-ABC123
    - QR Code: [image]
    - Valid until: 2025-12-12

19. 👤 USER: Visits EcoMart store
    - Shows QR code at checkout

20. 🏪 VENDOR: Scans QR code
    - Verifies redemption code
    - Code is valid ✅
    - Not expired ✅
    - Not used before ✅

21. 🏪 VENDOR: Provides discount
    - 10% off purchase
    - Marks redemption as completed

22. 👤 USER: Gets discount
    - Saves money on eco-friendly products
    - Motivated to recycle more!

┌─────────────────────────────────────────────────────────────┐
│  CYCLE COMPLETES ♻️                                         │
└─────────────────────────────────────────────────────────────┘

✅ User disposes waste responsibly
✅ Collector facilitates recycling
✅ Vendor processes waste and rewards users
✅ Environment benefits from proper waste management
✅ Circular economy created! 🌍
```

---

## Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CIRCULAR FLOW                           │
└─────────────────────────────────────────────────────────────────┘

     ┌──────────────┐
     │   👤 USER    │
     │              │
     │ • Generates  │
     │   waste      │
     │ • Earns      │
     │   points     │
     │ • Redeems    │
     │   rewards    │
     └───────┬──────┘
             │
             │ 1. Brings waste + QR code
             │
             ↓
     ┌──────────────┐
     │ ♻️ COLLECTOR │
     │              │
     │ • Scans QR   │
     │ • Weighs     │
     │   waste      │
     │ • Records    │
     │   collection │
     │ • Manages    │
     │   inventory  │
     └───────┬──────┘
             │
             │ 2. Offers waste for sale
             │
             ↓
     ┌──────────────┐
     │  🏪 VENDOR   │
     │              │
     │ • Buys waste │
     │ • Processes  │
     │ • Offers     │
     │   rewards    │
     │ • Verifies   │
     │   redemptions│
     └───────┬──────┘
             │
             │ 3. Provides rewards/discounts
             │
             └─────────────────→ (back to USER)
```

---

## Key Database Collections

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  profileImage: String,
  points: Number,
  totalWasteDisposed: Number,
  badges: [ObjectId] (ref: Badge),
  qrCode: String (base64 image),
  role: "user",
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **Collectors Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  acceptedWasteTypes: [String],
  operatingHours: String,
  profileImage: String,
  description: String,
  totalWasteCollected: Number,
  totalTransactions: Number,
  role: "collector",
  isActive: Boolean,
  isVerified: Boolean,
  verifiedBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

### **Vendors Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  phone: String,
  businessType: String (Physical Store/Online/Both),
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String
  },
  website: String,
  logo: String,
  description: String,
  totalRewards: Number,
  totalRedemptions: Number,
  role: "vendor",
  isActive: Boolean,
  isVerified: Boolean,
  verifiedBy: ObjectId (ref: Admin),
  createdAt: Date,
  updatedAt: Date
}
```

### **WasteTransactions Collection**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  collector: ObjectId (ref: Collector),
  wasteType: String,
  quantity: {
    value: Number,
    unit: String
  },
  pointsEarned: Number,
  status: String (pending/verified/rejected),
  qrCodeScanned: Boolean,
  notes: String,
  verifiedAt: Date,
  location: {
    type: "Point",
    coordinates: [longitude, latitude]
  },
  createdAt: Date,
  updatedAt: Date
}
```

### **Rewards Collection**
```javascript
{
  _id: ObjectId,
  vendor: ObjectId (ref: Vendor),
  title: String,
  description: String,
  image: String,
  pointsRequired: Number,
  discountType: String (percentage/fixed/item),
  discountValue: Number,
  validFrom: Date,
  validUntil: Date,
  stockAvailable: Number,
  stockRedeemed: Number,
  terms: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### **RewardRedemptions Collection**
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: User),
  reward: ObjectId (ref: Reward),
  vendor: ObjectId (ref: Vendor),
  pointsUsed: Number,
  redemptionCode: String (unique),
  qrCode: String (base64 image),
  status: String (pending/completed/expired),
  usedAt: Date,
  expiresAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### **Badges Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,
  level: String (Bronze/Silver/Gold/Platinum/Diamond),
  points: Number (bonus points),
  requirement: {
    type: String (totalWaste/transactions/streak),
    value: Number
  },
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## API Endpoints Summary

### **Authentication**
```
POST   /api/auth/register      - Register new user/collector/vendor
POST   /api/auth/login         - Login and get JWT token
GET    /api/auth/me            - Get current user profile
PUT    /api/auth/update-profile - Update profile
PUT    /api/auth/change-password - Change password
```

### **User Endpoints**
```
GET    /api/users/dashboard              - Get user dashboard stats
GET    /api/users/collection-points      - Get nearby collectors
GET    /api/users/transactions           - Get user's transactions
GET    /api/users/rewards                - Get available rewards
POST   /api/users/rewards/:id/redeem     - Redeem a reward
GET    /api/users/redemptions            - Get redemption history
GET    /api/users/challenges             - Get active challenges
POST   /api/users/challenges/:id/join    - Join a challenge
GET    /api/users/leaderboard            - Get leaderboard
GET    /api/users/badges                 - Get user's badges
```

### **Collector Endpoints**
```
GET    /api/collectors/dashboard         - Get collector dashboard
POST   /api/collectors/record-collection - Record waste collection
GET    /api/collectors/transactions      - Get collector transactions
GET    /api/collectors/reports           - Get collection reports
GET    /api/collectors/inventory         - Get waste inventory
GET    /api/collectors/vendors           - Get nearby vendors
PUT    /api/collectors/profile           - Update collector profile
```

### **Vendor Endpoints**
```
GET    /api/vendors/dashboard            - Get vendor dashboard
GET    /api/vendors/offers               - Get available waste offers
POST   /api/vendors/purchase             - Purchase waste from collector
GET    /api/vendors/inventory            - Get vendor's inventory
GET    /api/vendors/pricing              - Get pricing structure
POST   /api/vendors/pricing              - Update pricing
GET    /api/vendors/rewards              - Get vendor's rewards
POST   /api/vendors/rewards              - Create new reward
GET    /api/vendors/redemptions          - Get redemptions
POST   /api/vendors/redemptions/:id/verify - Verify redemption
PUT    /api/vendors/profile              - Update vendor profile
```

---

## Security & Verification

### **Authentication Flow**
1. User registers → Password hashed with bcrypt (10 rounds)
2. User logs in → JWT token generated (expires in 7 days)
3. Token stored in AsyncStorage on mobile
4. Every API request includes: `Authorization: Bearer <token>`
5. Backend middleware (`protect`) verifies token
6. User object attached to `req.user`

### **Authorization Middleware**
```javascript
// Protect routes - verify JWT
exports.protect = async (req, res, next) => {
  // Extract token from header
  // Verify with JWT_SECRET
  // Find user in database
  // Check if user is active
  // Attach user to request
}

// Authorize specific roles
exports.authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return 403 Forbidden
    }
    next();
  }
}
```

### **QR Code Security**
- User QR codes contain encrypted user ID
- Generated at registration using `qrcode` library
- Stored as base64 image in database
- Scanned by collectors for verification
- Cannot be forged or reused

### **Redemption Code Security**
- Unique alphanumeric codes (e.g., WASTE-ABC123)
- One-time use only
- Time-limited (expires after validity period)
- Verified against database before acceptance
- QR code generated for easy scanning

### **Verification System**
- Collectors must be verified by admin before appearing in app
- Vendors must be verified before offering rewards
- Prevents spam and fraudulent accounts
- Admin dashboard (future) for verification management

### **Data Validation**
- All inputs validated on backend
- MongoDB schema validation
- JWT signature verification
- Geospatial query validation
- Points calculation integrity checks

---

## Mobile App Screens Summary

### **User App (4 main tabs)**

#### **1. Home Tab** (`frontend/app/(tabs)/index.tsx`)
- Points balance (large display)
- Total waste disposed
- Monthly statistics
- Quick stats cards
- Recent transactions preview
- Earned badges

#### **2. Map Tab** (`frontend/app/(tabs)/map.tsx`)
- Nearby collectors on interactive list
- Waste type filters (horizontal scroll)
- Collection point cards showing:
  - Name, location, distance
  - Accepted waste types
  - Operating hours, phone
  - "Get Directions" and "Call" buttons

#### **3. Rewards Tab** (`frontend/app/(tabs)/rewards.tsx`)
- Available rewards from vendors
- Categorized:
  - Affordable (green badge)
  - Coming soon (yellow badge - need more points)
- Reward cards with:
  - Image, title, description
  - Points required
  - Vendor name
  - Redeem button

#### **4. Profile Tab** (`frontend/app/(tabs)/profile.tsx`)
- User information
- QR code display
- Badges showcase
- Transaction history
- Settings
- Logout

---

### **Collector App (5 tabs)**

#### **1. Dashboard** (`frontend/app/(collector-tabs)/index.tsx`)
- Today's stats (transactions, weight)
- Monthly stats
- Total lifetime stats
- Waste breakdown chart
- Quick action buttons

#### **2. Scan Tab** (`frontend/app/(collector-tabs)/scan.tsx`)
- Large "Scan QR Code" button
- Camera view
- Manual input option
- Waste type dropdown
- Weight input field
- "Record Collection" button
- Success animation

#### **3. Inventory Tab** (`frontend/app/(collector-tabs)/inventory.tsx`)
- Total inventory weight
- Waste type breakdown:
  - E-waste: 45.5 kg (12 collections)
  - Plastic: 123.2 kg (34 collections)
  - etc.
- Pull to refresh

#### **4. Vendors Tab** (`frontend/app/(collector-tabs)/vendors.tsx`)
- Nearby vendor cards
- Distance displayed
- Business type
- Phone number
- "Call" button
- Pull to refresh

#### **5. Profile Tab** (`frontend/app/(collector-tabs)/profile.tsx`)
- Collector information
- Location details
- Accepted waste types
- Operating hours
- Settings
- Logout

---

### **Vendor App (5 tabs)**

#### **1. Dashboard** (`frontend/app/(vendor-tabs)/index.tsx`)
- Total rewards offered
- Active rewards count
- Total redemptions
- Monthly redemptions
- Waste purchased statistics
- Revenue overview

#### **2. Offers Tab** (`frontend/app/(vendor-tabs)/offers.tsx`)
- Available waste from collectors
- Offer cards showing:
  - Collector name
  - Waste type
  - Weight (kg)
  - Price
- "Purchase" button
- Confirmation dialog
- Pull to refresh

#### **3. Inventory Tab** (`frontend/app/(vendor-tabs)/inventory.tsx`)
- Total inventory value
- Waste type breakdown:
  - E-waste: 145.5 kg (₨21,825)
  - Plastic: 450.2 kg (₨18,008)
  - etc.
- Purchase history
- Pull to refresh

#### **4. Pricing Tab** (`frontend/app/(vendor-tabs)/pricing.tsx`)
- Input fields for each waste type
- E-waste: ₨ ___ / kg
- Plastic: ₨ ___ / kg
- Metal: ₨ ___ / kg
- etc.
- "Save Pricing" button
- Loading state on save
- Success feedback

#### **5. Profile Tab** (`frontend/app/(vendor-tabs)/profile.tsx`)
- Business information
- Location details
- Contact information
- Settings
- Logout

---

## Environment Configuration

### **Backend (.env)**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/waste-management

# JWT
JWT_SECRET=waste-management-super-secret-key-2025
JWT_EXPIRE=7d

# File Upload
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Frontend URL
CLIENT_URL=http://localhost:8081
```

### **Frontend (config.ts)**
```typescript
// API URL
export const API_URL = 'http://localhost:3000/api';
// For production: 'https://your-domain.com/api'

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@waste_app_token',
  USER: '@waste_app_user',
  USER_ROLE: '@waste_app_role',
};

// Points per kg
export const POINTS_PER_KG = {
  'E-waste': 50,
  'Plastic': 10,
  'Polythene': 10,
  'Glass': 5,
  'Paper': 5,
  'Metal': 20,
  'Organic': 3,
};
```

---

## Testing Scenarios

### **Scenario 1: New User Registration & First Collection**
1. Register as user
2. Verify QR code generated
3. Find collector on map
4. Collector scans QR and records waste
5. Verify points credited
6. Check transaction in user dashboard

### **Scenario 2: Collector to Vendor Sale**
1. Collector accumulates inventory
2. Views nearby vendors
3. Vendor sets pricing
4. Vendor browses offers
5. Vendor purchases waste
6. Verify inventory transfer
7. Check transaction records

### **Scenario 3: Reward Redemption**
1. User accumulates sufficient points
2. Browse available rewards
3. Redeem reward
4. Verify points deducted
5. QR code generated
6. Vendor scans and verifies
7. Mark redemption as completed

### **Scenario 4: Geolocation Testing**
1. Test with different coordinates
2. Verify distance calculations
3. Test radius filtering
4. Test with no nearby results
5. Test error handling

---

## Future Enhancements

### **Phase 2 Features**
- [ ] Real-time chat between users and collectors
- [ ] Push notifications for:
  - Points earned
  - Rewards available
  - Collection reminders
- [ ] Analytics dashboard for admins
- [ ] Automated waste collection scheduling
- [ ] Integration with waste processing facilities

### **Phase 3 Features**
- [ ] Machine learning for waste classification
- [ ] Image recognition for waste type detection
- [ ] Blockchain for transparent transaction tracking
- [ ] Carbon footprint calculator
- [ ] Community challenges and events
- [ ] Social media integration

### **Technical Improvements**
- [ ] Add Redis caching for frequent queries
- [ ] Implement WebSocket for real-time updates
- [ ] Add rate limiting to prevent abuse
- [ ] Implement advanced search and filters
- [ ] Add export functionality (CSV, PDF reports)
- [ ] Multi-language support (i18n)
- [ ] Dark mode theme
- [ ] Offline mode with sync

---

## Deployment Checklist

### **Backend Deployment**
- [x] Backend deployed to Vercel
- [x] MongoDB Atlas configured
- [x] Environment variables set
- [ ] API rate limiting enabled
- [ ] Error logging configured (e.g., Sentry)
- [ ] Backup strategy implemented
- [ ] SSL certificates verified
- [ ] CORS configured for production domains

### **Frontend Deployment**
- [ ] Build Android APK (EAS Build)
- [ ] Build iOS IPA (EAS Build)
- [ ] App icons and splash screens configured
- [ ] App store listings created
- [ ] Privacy policy and terms added
- [ ] Analytics tracking (e.g., Google Analytics, Mixpanel)
- [ ] Crash reporting (e.g., Crashlytics)
- [ ] Performance monitoring

### **Testing**
- [ ] Unit tests for critical functions
- [ ] Integration tests for API endpoints
- [ ] E2E tests for user flows
- [ ] Load testing for scalability
- [ ] Security audit performed
- [ ] Accessibility testing (WCAG compliance)

---

## Support & Maintenance

### **Monitoring**
- Server uptime monitoring
- API response time tracking
- Error rate monitoring
- Database performance metrics
- User activity analytics

### **Regular Maintenance**
- Weekly database backups
- Monthly security patches
- Quarterly feature updates
- Annual security audits
- User feedback reviews

### **User Support**
- In-app help documentation
- FAQ section
- Email support: support@wasteapp.com
- Feedback form in app
- Bug reporting system

---

## Conclusion

This waste management app creates a **sustainable circular economy** where:

- ✅ **Users** are incentivized to dispose waste responsibly
- ✅ **Collectors** efficiently manage waste collection
- ✅ **Vendors** reward users and process waste for recycling
- ✅ **Environment** benefits from proper waste management
- ✅ **Community** engages in eco-friendly practices

The three user types work together seamlessly through the app, creating value at every step of the waste management process! ♻️🌍

---

**Version:** 1.0.0  
**Last Updated:** November 12, 2025  
**Authors:** Development Team  
**License:** Proprietary
