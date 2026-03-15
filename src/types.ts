export type UserRole = 'customer' | 'merchant' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  fullName: string;
  username: string;
  balance: number;
  role: UserRole;
  createdAt: string;
}

export interface Transaction {
  id: string;
  fromUid: string;
  toUid: string;
  amount: number;
  type: 'payment' | 'cash-in' | 'withdraw';
  status: 'pending' | 'confirmed' | 'refunded';
  timestamp: string;
  merchantName?: string;
  description?: string;
}

export interface Booking {
  id: string;
  userUid: string;
  userName: string;
  resortId: string;
  resortName: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  provider: string;
  amount: number;
  createdAt: string;
}

export interface Merchant {
  uid: string;
  businessName: string;
  totalSalesToday: number;
  location: string;
  isVerified: boolean;
}

export interface Resort {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  rating: number;
}
