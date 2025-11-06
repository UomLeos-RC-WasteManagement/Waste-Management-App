// API Configuration
export const API_URL = 'http://localhost:3000/api';

// API Endpoints
export const ENDPOINTS = {
  // Auth
  REGISTER: '/auth/register', // Unified registration for all roles
  REGISTER_USER: '/auth/register/user', // Legacy endpoint
  LOGIN: '/auth/login',
  ME: '/auth/me',
  UPDATE_PROFILE: '/auth/update-profile',
  CHANGE_PASSWORD: '/auth/change-password',

  // Users
  DASHBOARD: '/users/dashboard',
  COLLECTION_POINTS: '/users/collection-points',
  TRANSACTIONS: '/users/transactions',
  REWARDS: '/users/rewards',
  REDEEM_REWARD: (id: string) => `/users/rewards/${id}/redeem`,
  REDEMPTIONS: '/users/redemptions',
  CHALLENGES: '/users/challenges',
  JOIN_CHALLENGE: (id: string) => `/users/challenges/${id}/join`,
  LEADERBOARD: '/users/leaderboard',
  BADGES: '/users/badges',

  // Collectors
  COLLECTOR_DASHBOARD: '/collectors/dashboard',
  COLLECTOR_VERIFY_DROPOFF: '/collectors/verify-dropoff',
  COLLECTOR_RECORD_COLLECTION: '/collectors/record-collection', // Alias
  COLLECTOR_TRANSACTIONS: '/collectors/transactions',
  COLLECTOR_REPORTS: '/collectors/reports',
  COLLECTOR_INVENTORY: '/collectors/inventory',
  COLLECTOR_VENDORS: '/collectors/vendors',
  COLLECTOR_PROFILE: '/collectors/profile',

  // Vendors
  VENDOR_DASHBOARD: '/vendors/dashboard',
  VENDOR_REWARDS: '/vendors/rewards', // Vendor rewards for users
  VENDOR_REDEMPTIONS: '/vendors/redemptions',
  VENDOR_ANALYTICS: '/vendors/analytics',
  VENDOR_OFFERS: '/vendors/offers', // Browse waste from collectors
  VENDOR_PURCHASE: '/vendors/purchase', // Purchase waste
  VENDOR_INVENTORY: '/vendors/inventory', // Purchased waste inventory
  VENDOR_PRICING: '/vendors/pricing', // Pricing management
  VENDOR_PROFILE: '/vendors/profile',
};

// Storage Keys
export const STORAGE_KEYS = {
  TOKEN: '@waste_app_token',
  USER: '@waste_app_user',
  USER_ROLE: '@waste_app_role',
};

// Waste Types
export const WASTE_TYPES = [
  { label: 'E-waste', value: 'E-waste', icon: '📱', color: '#FF6B6B' },
  { label: 'Plastic', value: 'Plastic', icon: '♻️', color: '#4ECDC4' },
  { label: 'Polythene', value: 'Polythene', icon: '🛍️', color: '#45B7D1' },
  { label: 'Glass', value: 'Glass', icon: '🍾', color: '#96CEB4' },
  { label: 'Paper', value: 'Paper', icon: '📄', color: '#FFEAA7' },
  { label: 'Metal', value: 'Metal', icon: '🔩', color: '#DFE6E9' },
  { label: 'Organic', value: 'Organic', icon: '🌱', color: '#00B894' },
];

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

// Badge Levels
export const BADGE_LEVELS = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];

// Colors
export const COLORS = {
  primary: '#2ECC71',
  secondary: '#3498DB',
  success: '#27AE60',
  warning: '#F39C12',
  danger: '#E74C3C',
  dark: '#2C3E50',
  light: '#ECF0F1',
  white: '#FFFFFF',
  black: '#000000',
  gray: '#95A5A6',
};
