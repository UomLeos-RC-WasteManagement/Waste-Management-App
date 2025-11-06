# Backend Updates for Collector & Vendor Features

## Summary
Backend has been successfully updated to support all three user roles (Users, Collectors, Vendors) with complete marketplace functionality.

---

## ✅ What Was Updated

### 1. **Unified Registration System**

#### New Endpoint: `POST /api/auth/register`
- **Purpose**: Single endpoint for all role registrations
- **Accepts**: `role` field ('user', 'collector', or 'vendor')
- **Features**:
  - Validates email uniqueness across all collections
  - Creates appropriate account type based on role
  - Generates QR code for users
  - Returns role-specific data
  - Issues JWT token with role

**Request Body**:
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "role": "user|collector|vendor",
  "address": "123 Main St",
  // Role-specific fields:
  "acceptedWasteTypes": ["Plastic", "Paper"], // Collector only
  "businessType": "Recycling Plant", // Vendor only
  "description": "...",
  "location": { ... }
}
```

**Legacy Endpoint**: `POST /api/auth/register/user` (kept for backward compatibility)

---

### 2. **Collector Endpoints**

#### ✅ Existing (Already Working)
- `GET /api/collectors/dashboard` - Collector dashboard stats
- `POST /api/collectors/verify-dropoff` - Verify waste drop-off
- `GET /api/collectors/transactions` - Transaction history
- `GET /api/collectors/reports` - Collection reports
- `PUT /api/collectors/profile` - Update profile

#### ✨ New Additions

**`POST /api/collectors/record-collection`**
- Alias for `/verify-dropoff` (frontend compatibility)
- Same functionality: Scan QR, verify user, record waste collection

**`GET /api/collectors/inventory`**
- Returns inventory breakdown by waste type
- Shows total quantity, transactions, points per waste type
- Example response:
```json
{
  "success": true,
  "data": [
    {
      "wasteType": "Plastic",
      "totalQuantity": 150.5,
      "unit": "kg",
      "transactions": 45,
      "totalPoints": 1505
    }
  ]
}
```

**`GET /api/collectors/vendors?radius=50`**
- Find nearby verified vendors
- Optional radius parameter (km)
- Uses geospatial queries if location available
- Returns vendor details for marketplace

---

### 3. **Vendor Endpoints**

#### ✅ Existing (Rewards System - for Users)
- `GET /api/vendors/dashboard` - Vendor dashboard
- `POST /api/vendors/rewards` - Create user reward
- `GET /api/vendors/rewards` - Get vendor's rewards
- `PUT /api/vendors/rewards/:id` - Update reward
- `DELETE /api/vendors/rewards/:id` - Delete reward
- `GET /api/vendors/redemptions` - View redemptions
- `POST /api/vendors/redemptions/:code/verify` - Verify redemption code
- `GET /api/vendors/analytics` - Analytics/reports
- `PUT /api/vendors/profile` - Update profile

#### ✨ New Additions (Marketplace System)

**`GET /api/vendors/offers?wasteType=Plastic&radius=50`**
- Browse available waste from collectors
- Filters: wasteType, radius
- Returns collectors with their inventory
- Example response:
```json
{
  "success": true,
  "count": 5,
  "data": [
    {
      "collector": {
        "_id": "...",
        "name": "Green Collectors",
        "address": "...",
        "phone": "...",
        "location": { ... }
      },
      "inventory": [
        {
          "wasteType": "Plastic",
          "quantity": 150.5,
          "unit": "kg"
        }
      ]
    }
  ]
}
```

**`POST /api/vendors/purchase`**
- Purchase waste from collector
- Creates purchase order
- Request body:
```json
{
  "collectorId": "collector_id",
  "wasteType": "Plastic",
  "quantity": 100,
  "pricePerUnit": 0.5,
  "notes": "Pick up on Monday",
  "pickupDate": "2025-11-10"
}
```

**`GET /api/vendors/inventory?status=all|pending|completed|cancelled`**
- View purchased waste inventory
- Returns purchase history and summary
- Groups by waste type with totals

**`GET /api/vendors/pricing`**
- Get vendor's pricing for all waste types
- Auto-creates default pricing if not exists
- Returns pricing array with pricePerKg for each waste type

**`PUT /api/vendors/pricing`**
- Update pricing for waste types
- Request body:
```json
{
  "pricing": [
    { "wasteType": "E-waste", "pricePerKg": 5.0, "isActive": true },
    { "wasteType": "Plastic", "pricePerKg": 0.5, "isActive": true }
  ]
}
```

---

### 4. **New Database Models**

#### **WastePurchase Model**
```javascript
{
  vendor: ObjectId,
  collector: ObjectId,
  wasteType: String,
  quantity: { value: Number, unit: String },
  pricePerUnit: Number,
  totalAmount: Number,
  status: 'pending|completed|cancelled',
  pickupDate: Date,
  notes: String,
  location: GeoJSON Point
}
```

#### **VendorPricing Model**
```javascript
{
  vendor: ObjectId (unique),
  pricing: [
    {
      wasteType: String,
      pricePerKg: Number,
      minQuantity: Number,
      maxQuantity: Number,
      isActive: Boolean
    }
  ],
  currency: String,
  lastUpdated: Date
}
```

---

## 🔄 Frontend Integration

### Updated ENDPOINTS Config
All new endpoints added to `frontend/constants/config.ts`:

```typescript
export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register', // New unified endpoint
  
  // Collectors
  COLLECTOR_DASHBOARD: '/collectors/dashboard',
  COLLECTOR_RECORD_COLLECTION: '/collectors/record-collection',
  COLLECTOR_INVENTORY: '/collectors/inventory',
  COLLECTOR_VENDORS: '/collectors/vendors',
  COLLECTOR_PROFILE: '/collectors/profile',
  
  // Vendors
  VENDOR_DASHBOARD: '/vendors/dashboard',
  VENDOR_OFFERS: '/vendors/offers',
  VENDOR_PURCHASE: '/vendors/purchase',
  VENDOR_INVENTORY: '/vendors/inventory',
  VENDOR_PRICING: '/vendors/pricing',
  VENDOR_PROFILE: '/vendors/profile',
  // ... existing endpoints
};
```

### AuthContext Updated
- Registration now uses unified `/auth/register` endpoint
- Stores role from registration data (not hardcoded)
- Supports all three roles in registration flow

---

## 📊 System Architecture

### Two Parallel Systems

**System 1: User Rewards (Existing)**
- Users dispose waste → Earn points
- Vendors create rewards/discounts
- Users redeem rewards with points
- Models: User, Reward, RewardRedemption

**System 2: Collector-Vendor Marketplace (New)**
- Collectors collect waste from users
- Collectors build inventory
- Vendors browse collector inventory
- Vendors purchase waste from collectors
- Models: Collector, Vendor, WastePurchase, VendorPricing

Both systems coexist and serve different purposes!

---

## 🧪 Testing Checklist

- [ ] Register as User (role: 'user')
- [ ] Register as Collector (role: 'collector')
- [ ] Register as Vendor (role: 'vendor')
- [ ] Login as each role
- [ ] Collector: Record waste collection
- [ ] Collector: View inventory breakdown
- [ ] Collector: Find nearby vendors
- [ ] Vendor: Browse available waste offers
- [ ] Vendor: View/update pricing
- [ ] Vendor: Purchase waste from collector
- [ ] Vendor: View purchased inventory

---

## 🚀 Next Steps

1. **Start Backend Server**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start Frontend**:
   ```bash
   cd frontend
   npx expo start
   ```

3. **Test Registration Flow**:
   - Try registering users, collectors, and vendors
   - Verify role-based navigation works
   - Test marketplace features

4. **Implement Frontend UI**:
   - Collector screens need to call new endpoints
   - Vendor screens need marketplace UI
   - Add forms for pricing management
   - Add waste purchase flow

---

## 📝 API Quick Reference

| Role | Action | Method | Endpoint |
|------|--------|--------|----------|
| Any | Register | POST | `/auth/register` |
| Any | Login | POST | `/auth/login` |
| Collector | View Dashboard | GET | `/collectors/dashboard` |
| Collector | Scan QR & Record | POST | `/collectors/record-collection` |
| Collector | View Inventory | GET | `/collectors/inventory` |
| Collector | Find Vendors | GET | `/collectors/vendors` |
| Vendor | View Dashboard | GET | `/vendors/dashboard` |
| Vendor | Browse Offers | GET | `/vendors/offers` |
| Vendor | Purchase Waste | POST | `/vendors/purchase` |
| Vendor | View Inventory | GET | `/vendors/inventory` |
| Vendor | Get Pricing | GET | `/vendors/pricing` |
| Vendor | Update Pricing | PUT | `/vendors/pricing` |

---

## ✨ Summary

**Backend is now fully ready** to support:
✅ Multi-role registration (users, collectors, vendors)
✅ Collector waste collection & inventory tracking
✅ Collector-vendor marketplace
✅ Vendor pricing management
✅ Waste purchasing system
✅ All existing user reward features

The frontend can now integrate these endpoints to provide a complete multi-role waste management application!
