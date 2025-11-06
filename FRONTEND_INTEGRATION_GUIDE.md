# Frontend Integration Guide - API Endpoints

## 🎯 Quick Start

All API endpoints are available at: `http://localhost:3000/api`

All endpoints are already added to `frontend/constants/config.ts` - just import and use!

---

## 📱 Example Usage in Frontend

### 1. Register New User/Collector/Vendor

```typescript
import api from '@/services/api';
import { ENDPOINTS } from '@/constants/config';

// Register as User
const registerUser = async () => {
  const response = await api.post(ENDPOINTS.REGISTER, {
    name: 'John Doe',
    email: 'john@example.com',
    password: 'password123',
    phone: '+1234567890',
    role: 'user'
  });
  // Returns: { success: true, data: {...}, token: '...' }
};

// Register as Collector
const registerCollector = async () => {
  const response = await api.post(ENDPOINTS.REGISTER, {
    name: 'Green Collectors',
    email: 'collector@example.com',
    password: 'password123',
    phone: '+1234567890',
    role: 'collector',
    acceptedWasteTypes: ['Plastic', 'Paper', 'Glass'],
    description: 'We collect recyclable waste',
    location: {
      type: 'Point',
      coordinates: [-73.935242, 40.730610] // [longitude, latitude]
    }
  });
};

// Register as Vendor
const registerVendor = async () => {
  const response = await api.post(ENDPOINTS.REGISTER, {
    name: 'RecycleCo',
    email: 'vendor@example.com',
    password: 'password123',
    phone: '+1234567890',
    role: 'vendor',
    businessType: 'Recycling Plant',
    description: 'We buy recyclable materials'
  });
};
```

---

### 2. Collector Features

```typescript
// Get Dashboard Stats
const dashboard = await api.get(ENDPOINTS.COLLECTOR_DASHBOARD);
// Returns: today's stats, monthly stats, waste breakdown

// Record Waste Collection (Scan QR)
const recordCollection = await api.post(ENDPOINTS.COLLECTOR_RECORD_COLLECTION, {
  userId: 'user_id_here',
  wasteType: 'Plastic',
  quantity: 5.5,
  unit: 'kg',
  qrCodeScanned: true,
  notes: 'Clean plastic bottles'
});
// Returns: transaction details, points awarded, any new badges

// View Inventory by Waste Type
const inventory = await api.get(ENDPOINTS.COLLECTOR_INVENTORY);
// Returns:
// [
//   { wasteType: 'Plastic', totalQuantity: 150.5, transactions: 45, totalPoints: 1505 },
//   { wasteType: 'Paper', totalQuantity: 80.2, transactions: 23, totalPoints: 802 }
// ]

// Find Nearby Vendors
const vendors = await api.get(`${ENDPOINTS.COLLECTOR_VENDORS}?radius=50`);
// Returns: Array of vendors within 50km
```

---

### 3. Vendor Features

```typescript
// Get Dashboard Stats
const dashboard = await api.get(ENDPOINTS.VENDOR_DASHBOARD);

// Browse Available Waste from Collectors (Marketplace)
const offers = await api.get(`${ENDPOINTS.VENDOR_OFFERS}?wasteType=Plastic&radius=100`);
// Returns:
// [
//   {
//     collector: { _id, name, address, phone, location },
//     inventory: [
//       { wasteType: 'Plastic', quantity: 150.5, unit: 'kg' },
//       { wasteType: 'Paper', quantity: 80.2, unit: 'kg' }
//     ]
//   }
// ]

// Purchase Waste from Collector
const purchase = await api.post(ENDPOINTS.VENDOR_PURCHASE, {
  collectorId: 'collector_id',
  wasteType: 'Plastic',
  quantity: 100,
  pricePerUnit: 0.5,
  notes: 'Pick up on Monday',
  pickupDate: '2025-11-10'
});
// Returns: Purchase order details, totalAmount: 50

// View Purchased Inventory
const inventory = await api.get(`${ENDPOINTS.VENDOR_INVENTORY}?status=completed`);
// Returns: { purchases: [...], summary: [...] }

// Get Pricing
const pricing = await api.get(ENDPOINTS.VENDOR_PRICING);
// Returns:
// {
//   pricing: [
//     { wasteType: 'E-waste', pricePerKg: 5.0, isActive: true },
//     { wasteType: 'Plastic', pricePerKg: 0.5, isActive: true },
//     ...
//   ]
// }

// Update Pricing
const updatePricing = await api.put(ENDPOINTS.VENDOR_PRICING, {
  pricing: [
    { wasteType: 'Plastic', pricePerKg: 0.6, isActive: true },
    { wasteType: 'E-waste', pricePerKg: 6.0, isActive: true }
  ]
});
```

---

## 🎨 Example Screen Implementations

### Collector Scan Screen

```typescript
import { useState } from 'react';
import { ENDPOINTS } from '@/constants/config';
import api from '@/services/api';

export default function CollectorScanScreen() {
  const [scanning, setScanning] = useState(false);
  
  const handleQRScan = async (scannedUserId: string) => {
    setScanning(true);
    try {
      const response = await api.post(ENDPOINTS.COLLECTOR_RECORD_COLLECTION, {
        userId: scannedUserId,
        wasteType: 'Plastic', // From user selection
        quantity: 5.5, // From user input
        unit: 'kg',
        qrCodeScanned: true
      });
      
      Alert.alert('Success!', 
        `Collection recorded! User earned ${response.data.transaction.pointsEarned} points`
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setScanning(false);
    }
  };
  
  return (
    // QR Scanner UI
  );
}
```

---

### Collector Inventory Screen

```typescript
import { useEffect, useState } from 'react';
import { ENDPOINTS } from '@/constants/config';
import api from '@/services/api';

export default function CollectorInventoryScreen() {
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadInventory();
  }, []);
  
  const loadInventory = async () => {
    try {
      const response = await api.get(ENDPOINTS.COLLECTOR_INVENTORY);
      setInventory(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <View>
      {inventory.map(item => (
        <Card key={item.wasteType}>
          <Text>{item.wasteType}</Text>
          <Text>{item.totalQuantity} {item.unit}</Text>
          <Text>{item.transactions} collections</Text>
        </Card>
      ))}
    </View>
  );
}
```

---

### Vendor Offers Screen (Browse Waste Marketplace)

```typescript
import { useEffect, useState } from 'react';
import { ENDPOINTS } from '@/constants/config';
import api from '@/services/api';

export default function VendorOffersScreen() {
  const [offers, setOffers] = useState([]);
  const [selectedWaste, setSelectedWaste] = useState('');
  
  const loadOffers = async () => {
    try {
      let url = ENDPOINTS.VENDOR_OFFERS;
      if (selectedWaste) {
        url += `?wasteType=${selectedWaste}`;
      }
      const response = await api.get(url);
      setOffers(response.data);
    } catch (error) {
      console.error(error);
    }
  };
  
  const purchaseWaste = async (collectorId: string, wasteType: string, quantity: number) => {
    try {
      const response = await api.post(ENDPOINTS.VENDOR_PURCHASE, {
        collectorId,
        wasteType,
        quantity,
        pricePerUnit: 0.5, // Get from pricing
      });
      Alert.alert('Success', 'Purchase order created!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    // UI showing collectors and their inventory
  );
}
```

---

### Vendor Pricing Screen

```typescript
import { useEffect, useState } from 'react';
import { ENDPOINTS } from '@/constants/config';
import api from '@/services/api';

export default function VendorPricingScreen() {
  const [pricing, setPricing] = useState([]);
  
  useEffect(() => {
    loadPricing();
  }, []);
  
  const loadPricing = async () => {
    try {
      const response = await api.get(ENDPOINTS.VENDOR_PRICING);
      setPricing(response.data.pricing);
    } catch (error) {
      console.error(error);
    }
  };
  
  const updatePrice = async (wasteType: string, newPrice: number) => {
    const updatedPricing = pricing.map(p => 
      p.wasteType === wasteType ? { ...p, pricePerKg: newPrice } : p
    );
    
    try {
      await api.put(ENDPOINTS.VENDOR_PRICING, {
        pricing: updatedPricing
      });
      setPricing(updatedPricing);
      Alert.alert('Success', 'Pricing updated!');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };
  
  return (
    // UI with editable pricing for each waste type
  );
}
```

---

## 🔐 Authentication Headers

The API service (`services/api.ts`) automatically adds the JWT token to all requests:

```typescript
// Already configured in services/api.ts
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem(STORAGE_KEYS.TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

No need to manually add auth headers!

---

## 📊 Response Format

All API responses follow this format:

```typescript
// Success
{
  success: true,
  data: { ... }, // or array
  count?: number, // for list endpoints
  message?: string
}

// Error
{
  success: false,
  message: 'Error description'
}
```

---

## 🚨 Error Handling

```typescript
try {
  const response = await api.post(ENDPOINTS.COLLECTOR_RECORD_COLLECTION, data);
  // Handle success
} catch (error: any) {
  // error.message contains the error description
  Alert.alert('Error', error.message || 'Something went wrong');
}
```

---

## ✅ Available Endpoints Summary

### Authentication
- ✅ `POST /auth/register` - Register (any role)
- ✅ `POST /auth/login` - Login (any role)
- ✅ `GET /auth/me` - Get current user
- ✅ `PUT /auth/update-profile` - Update profile
- ✅ `PUT /auth/change-password` - Change password

### Collectors (8 endpoints)
- ✅ `GET /collectors/dashboard`
- ✅ `POST /collectors/record-collection`
- ✅ `GET /collectors/transactions`
- ✅ `GET /collectors/reports`
- ✅ `GET /collectors/inventory` ⭐ NEW
- ✅ `GET /collectors/vendors` ⭐ NEW
- ✅ `PUT /collectors/profile`

### Vendors (14 endpoints)
- ✅ `GET /vendors/dashboard`
- ✅ `POST /vendors/rewards` - Create user rewards
- ✅ `GET /vendors/rewards` - Get rewards
- ✅ `PUT /vendors/rewards/:id`
- ✅ `DELETE /vendors/rewards/:id`
- ✅ `GET /vendors/redemptions`
- ✅ `POST /vendors/redemptions/:code/verify`
- ✅ `GET /vendors/analytics`
- ✅ `GET /vendors/offers` ⭐ NEW - Browse waste marketplace
- ✅ `POST /vendors/purchase` ⭐ NEW - Purchase waste
- ✅ `GET /vendors/inventory` ⭐ NEW - View purchased inventory
- ✅ `GET /vendors/pricing` ⭐ NEW - Get pricing
- ✅ `PUT /vendors/pricing` ⭐ NEW - Update pricing
- ✅ `PUT /vendors/profile`

### Users (9 endpoints)
- ✅ All existing user endpoints remain unchanged

---

## 🎉 You're Ready!

The backend is fully functional and ready for frontend integration. All endpoints are tested and working with the running server on `http://localhost:3000`.

Import `ENDPOINTS` from `@/constants/config` and start building your screens!
