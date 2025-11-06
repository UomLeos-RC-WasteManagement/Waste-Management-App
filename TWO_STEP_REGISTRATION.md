# Two-Step Registration Flow

## Overview
The registration process has been redesigned into a clean two-step flow for better user experience.

---

## Registration Flow

### **Step 1: Role Selection** (`select-role.tsx`)
Users first choose their role before entering any information.

**Features:**
- 3 beautifully designed role cards
- Clear descriptions and feature lists for each role:
  - **User** 👤 (Green) - Dispose waste & earn rewards
  - **Collector** 🚛 (Blue) - Collect waste from users
  - **Vendor** 🏭 (Purple) - Buy waste for recycling
- Visual feedback with role-specific colors
- Selected badge indicator
- "Continue as [Role]" button

**Navigation:**
- From: Login screen "Sign Up" button
- To: Register screen with role parameter

---

### **Step 2: Registration Form** (`register.tsx`)
Users fill in their information based on the selected role.

**Features:**
- **Dynamic header** - Shows selected role with icon and color
- **Back button** - Return to role selection
- **Role-specific fields**:

#### All Roles:
- Name *
- Email *
- Phone
- Password *
- Confirm Password *

#### Collector-Specific:
- **Accepted Waste Types*** - Multi-select chips (E-waste, Plastic, Polythene, Glass, Paper, Metal, Organic)
- Operating Hours - e.g., "Mon-Fri 9AM-5PM"
- Description - About the collection point

#### Vendor-Specific:
- **Business Type*** - e.g., "Recycling Plant"
- Website - Business website URL
- Description - About the business

**Validation:**
- All required fields must be filled
- Passwords must match
- Password must be at least 6 characters
- Collectors must select at least one waste type
- Vendors must provide business type

**Post-Registration Navigation:**
- Users → `/(tabs)` - User home screen
- Collectors → `/(collector-tabs)` - Collector dashboard
- Vendors → `/(vendor-tabs)` - Vendor dashboard

---

## Login Flow

### **Enhanced Login Screen** (`login.tsx`)
Users can now select their role before logging in.

**Features:**
- **Role selector** - 3 buttons (User, Collector, Vendor)
- **Color-coded** - Login button changes color based on selected role
- Email and password fields
- "Sign Up" now navigates to role selection screen
- Role-based navigation after login

**Navigation After Login:**
- User → `/(tabs)`
- Collector → `/(collector-tabs)`
- Vendor → `/(vendor-tabs)`

---

## User Experience Benefits

### ✅ Improved Clarity
- Users understand their options before committing
- Clear feature comparison helps decision-making
- Visual distinction between roles

### ✅ Better Flow
- No overwhelming single form
- Progressive disclosure of information
- Focused data entry per step

### ✅ Visual Appeal
- Role-specific colors (Green, Blue, Purple)
- Engaging card designs
- Smooth transitions

### ✅ Reduced Errors
- Role selection is intentional, not accidental
- Relevant fields only shown based on role
- Clear validation messages

---

## Technical Details

### Route Parameters
```typescript
// Step 1: Select role
router.push('/(auth)/select-role');

// Step 2: Register with role
router.push(`/(auth)/register?role=${selectedRole}`);

// Registration screen reads role param
const params = useLocalSearchParams();
const role = params.role as Role; // 'user' | 'collector' | 'vendor'
```

### Registration Data Structure
```typescript
// Base fields (all roles)
{
  name: string;
  email: string;
  password: string;
  phone?: string;
  role: 'user' | 'collector' | 'vendor';
}

// Collector additions
{
  acceptedWasteTypes: string[]; // Required
  operatingHours?: string;
  description?: string;
}

// Vendor additions
{
  businessType: string; // Required
  website?: string;
  description?: string;
}
```

### Color Scheme
```typescript
const roleConfigs = {
  user: { icon: '👤', title: 'User', color: '#2ECC71' },      // Green
  collector: { icon: '🚛', title: 'Collector', color: '#3498DB' }, // Blue
  vendor: { icon: '🏭', title: 'Vendor', color: '#9B59B6' },  // Purple
};
```

---

## Files Modified

1. **Created: `app/(auth)/select-role.tsx`**
   - New role selection screen
   - 3 interactive role cards
   - Feature lists for each role
   - Color-coded design

2. **Updated: `app/(auth)/register.tsx`**
   - Now accepts role parameter
   - Dynamic header with role-specific color
   - Conditional form fields based on role
   - Role-specific validation
   - Role-based navigation after registration

3. **Updated: `app/(auth)/login.tsx`**
   - Added role selector
   - Color-coded based on selected role
   - Changed "Sign Up" to navigate to select-role
   - Role-based navigation after login

---

## Testing Steps

### Test Registration Flow:
1. ✅ Start at login screen
2. ✅ Click "Sign Up"
3. ✅ See role selection screen
4. ✅ Select User → See green theme
5. ✅ Select Collector → See blue theme, waste type chips
6. ✅ Select Vendor → See purple theme, business fields
7. ✅ Fill form and register
8. ✅ Navigate to correct tab layout

### Test Login Flow:
1. ✅ Select role (User/Collector/Vendor)
2. ✅ See button color change
3. ✅ Login with credentials
4. ✅ Navigate to correct dashboard

---

## User Journey Examples

### New User Registration:
```
Login Screen
  ↓ Click "Sign Up"
Select Role Screen
  ↓ Choose "User" (Green)
Register Screen (User)
  ↓ Fill: name, email, password
  ↓ Click "Create Account"
User Home Screen (tabs)
```

### New Collector Registration:
```
Login Screen
  ↓ Click "Sign Up"
Select Role Screen
  ↓ Choose "Collector" (Blue)
Register Screen (Collector)
  ↓ Fill: name, email, password
  ↓ Select: Plastic, Paper, Glass
  ↓ Add: Operating hours, description
  ↓ Click "Create Account"
Collector Dashboard (collector-tabs)
```

### New Vendor Registration:
```
Login Screen
  ↓ Click "Sign Up"
Select Role Screen
  ↓ Choose "Vendor" (Purple)
Register Screen (Vendor)
  ↓ Fill: name, email, password
  ↓ Enter: Business Type, Website
  ↓ Add: Description
  ↓ Click "Create Account"
Vendor Dashboard (vendor-tabs)
```

---

## Summary

The new two-step registration flow provides:
- 🎯 Clear role selection upfront
- 🎨 Beautiful, role-specific UI
- 📋 Organized, focused forms
- ✅ Better validation
- 🚀 Smooth user experience

Users now have a delightful onboarding experience with clear options and relevant information at each step!
