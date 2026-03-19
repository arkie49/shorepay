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
  roomId?: string;
  roomName?: string;
  pricePerNight?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  provider: string;
  amount: number;
  referenceNumber?: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  resortId: string;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  roomId?: string;
  roomName?: string;
  pricePerNight?: number;
  checkIn: string;
  checkOut: string;
  guests: number;
  paymentMethod: string;
  amount: number;
  referenceNumber?: string;
  createdAt: string;
  status: 'pending' | 'confirmed' | 'cancelled';
}

export interface ResortAdmin {
  resortId: string;
  username: string;
  passwordHash: string;
  createdAt: string;
}

export interface Merchant {
  uid: string;
  businessName: string;
  totalSalesToday: number;
  location: string;
  isVerified: boolean;
  resortId?: string;
}

export interface Resort {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  location: string;
  rating: number;
  registrationFields?: string[]; // Custom fields for each resort's registration form
  rooms?: ResortRoom[];
}

export interface ResortRoom {
  id: string;
  name: string;
  pricePerNight: number;
  maxGuests: number;
  description?: string;
  imageUrl?: string;
}
