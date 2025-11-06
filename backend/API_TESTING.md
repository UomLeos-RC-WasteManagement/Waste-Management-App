# API Testing Guide

## Quick Start

Base URL: `http://localhost:3000`

## 1. Register a New User

```bash
POST http://localhost:3000/api/auth/register/user
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zipCode": "10001"
  }
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "_id": "...",
    "name": "John Doe",
    "email": "john@example.com",
    "points": 0,
    "qrCode": "data:image/png;base64,...",
    "role": "user"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

Save the `token` for subsequent requests!

---

## 2. Login

```bash
POST http://localhost:3000/api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Roles:** `user`, `collector`, `vendor`, `admin`

---

## 3. Get User Dashboard (Protected)

```bash
GET http://localhost:3000/api/users/dashboard
Authorization: Bearer YOUR_TOKEN_HERE
```

---

## 4. Get Nearby Collection Points

```bash
GET http://localhost:3000/api/users/collection-points?longitude=-74.0060&latitude=40.7128&maxDistance=10000
Authorization: Bearer YOUR_TOKEN_HERE
```

**Query Parameters:**
- `longitude`: Longitude coordinate
- `latitude`: Latitude coordinate
- `maxDistance`: Distance in meters (default: 10000)
- `wasteType`: Optional - filter by waste type

---

## 5. Collector Verify Waste Drop-off

```bash
POST http://localhost:3000/api/collectors/verify-dropoff
Authorization: Bearer COLLECTOR_TOKEN_HERE
Content-Type: application/json

{
  "userId": "USER_ID_FROM_QR_CODE",
  "wasteType": "Plastic",
  "quantity": 5,
  "unit": "kg",
  "qrCodeScanned": true,
  "notes": "Clean recyclable plastic"
}
```

**Waste Types:**
- `E-waste`
- `Plastic`
- `Polythene`
- `Glass`
- `Paper`
- `Metal`
- `Organic`

---

## 6. Create Reward (Vendor)

```bash
POST http://localhost:3000/api/vendors/rewards
Authorization: Bearer VENDOR_TOKEN_HERE
Content-Type: application/json

{
  "title": "10% Off Eco-Friendly Products",
  "description": "Get 10% discount on all eco-friendly products",
  "type": "Discount",
  "pointsRequired": 100,
  "discountPercentage": 10,
  "validUntil": "2026-12-31T23:59:59.999Z",
  "category": "Eco-Products",
  "termsAndConditions": "Valid for one-time use only"
}
```

**Reward Types:**
- `Discount`
- `Free Item`
- `Coupon`
- `Voucher`
- `Eco-Product`

---

## 7. Redeem Reward (User)

```bash
POST http://localhost:3000/api/users/rewards/REWARD_ID/redeem
Authorization: Bearer USER_TOKEN_HERE
```

---

## 8. Get Leaderboard

```bash
GET http://localhost:3000/api/users/leaderboard?period=month&limit=50
Authorization: Bearer USER_TOKEN_HERE
```

**Period Options:**
- `all` - All-time leaderboard
- `month` - This month
- `week` - Last 7 days

---

## 9. Admin Create Collector

```bash
POST http://localhost:3000/api/admin/collectors
Authorization: Bearer ADMIN_TOKEN_HERE
Content-Type: application/json

{
  "name": "Green Recycling Center",
  "email": "collector@greenrecycling.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": {
    "street": "456 Eco Street",
    "city": "San Francisco",
    "state": "CA",
    "zipCode": "94102"
  },
  "location": {
    "type": "Point",
    "coordinates": [-122.4194, 37.7749]
  },
  "acceptedWasteTypes": ["Plastic", "E-waste", "Glass"],
  "operatingHours": {
    "monday": { "open": "09:00", "close": "18:00" },
    "tuesday": { "open": "09:00", "close": "18:00" },
    "wednesday": { "open": "09:00", "close": "18:00" },
    "thursday": { "open": "09:00", "close": "18:00" },
    "friday": { "open": "09:00", "close": "18:00" },
    "saturday": { "open": "10:00", "close": "16:00" }
  },
  "description": "Professional e-waste and plastic recycling center"
}
```

**Note:** `coordinates` format is `[longitude, latitude]`

---

## 10. Get System Analytics (Admin)

```bash
GET http://localhost:3000/api/admin/analytics?startDate=2025-01-01&endDate=2025-12-31
Authorization: Bearer ADMIN_TOKEN_HERE
```

---

## Testing Workflow

### Step-by-Step Testing:

1. **Create Admin** (use seed script below)
2. **Admin creates Collectors and Vendors**
3. **Register Users**
4. **Users find nearby collectors**
5. **Collectors verify waste drop-offs**
6. **Users earn points**
7. **Vendors create rewards**
8. **Users redeem rewards**
9. **Check leaderboard and analytics**

---

## Postman Collection

Import this JSON into Postman for quick testing:

```json
{
  "info": {
    "name": "Waste Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "Auth",
      "item": [
        {
          "name": "Register User",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "{{baseUrl}}/api/auth/register/user",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Test User\",\n  \"email\": \"user@test.com\",\n  \"password\": \"password123\",\n  \"phone\": \"+1234567890\"\n}"
            }
          }
        },
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [{"key": "Content-Type", "value": "application/json"}],
            "url": "{{baseUrl}}/api/auth/login",
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@test.com\",\n  \"password\": \"password123\",\n  \"role\": \"user\"\n}"
            }
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "baseUrl",
      "value": "http://localhost:3000"
    },
    {
      "key": "token",
      "value": ""
    }
  ]
}
```

---

## Common Issues

### 401 Unauthorized
- Make sure you include the `Authorization: Bearer TOKEN` header
- Check if token is expired (default: 7 days)

### 403 Forbidden
- User role doesn't have permission for this endpoint
- Check if account is active

### 404 Not Found
- Check the endpoint URL
- Verify resource exists (user, collector, reward, etc.)

### 400 Bad Request
- Check request body format
- Verify all required fields are provided
- Check data types (strings, numbers, etc.)

---

## Tips

1. **Save tokens as environment variables** in Postman
2. **Use the correct role** when logging in
3. **Coordinates format**: `[longitude, latitude]` (not lat, lng)
4. **Dates**: Use ISO 8601 format: `2025-12-31T23:59:59.999Z`
5. **File uploads**: Use `multipart/form-data` for image uploads

---

## Health Check

```bash
GET http://localhost:3000/
```

Should return:
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
