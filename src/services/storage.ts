import { type UserProfile, type Transaction, type Merchant, type Resort, type Booking } from '../types';

const KEYS = {
  USERS: 'shorepay_users',
  CURRENT_USER: 'shorepay_current_user',
  TRANSACTIONS: 'shorepay_transactions',
  MERCHANTS: 'shorepay_merchants',
  RESORTS: 'shorepay_resorts',
  BOOKINGS: 'shorepay_bookings',
};

// Initial Mock Data
const INITIAL_RESORTS: Resort[] = [
  { id: '1', name: 'Jc Infinity', imageUrl: 'https://picsum.photos/seed/resort1/400/300', description: 'Luxury beachfront', location: 'Dangay', rating: 4.8 },
  { id: '2', name: 'Kamayan Penthouse', imageUrl: 'https://picsum.photos/seed/resort2/400/300', description: 'Traditional vibes', location: 'Roxas', rating: 4.5 },
  { id: '3', name: 'La Primera Grande', imageUrl: 'https://picsum.photos/seed/resort3/400/300', description: 'Grand experience', location: 'Dangay', rating: 4.7 },
];

export const storage = {
  get: <T>(key: string, defaultValue: T): T => {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  },
  set: (key: string, value: any) => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  // Auth
  getCurrentUser: (): UserProfile | null => storage.get(KEYS.CURRENT_USER, null),
  setCurrentUser: (user: UserProfile | null) => storage.set(KEYS.CURRENT_USER, user),
  
  getUsers: (): UserProfile[] => storage.get(KEYS.USERS, []),
  saveUser: (user: UserProfile) => {
    const users = storage.getUsers();
    const index = users.findIndex(u => u.uid === user.uid);
    if (index > -1) users[index] = user;
    else users.push(user);
    storage.set(KEYS.USERS, users);
  },

  // Transactions
  getTransactions: (uid: string): Transaction[] => {
    const all = storage.get(KEYS.TRANSACTIONS, []);
    return all.filter((t: Transaction) => t.fromUid === uid || t.toUid === uid)
      .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  },
  addTransaction: (tx: Omit<Transaction, 'id'>) => {
    const all = storage.get(KEYS.TRANSACTIONS, []);
    const newTx = { ...tx, id: Math.random().toString(36).substring(7) };
    all.push(newTx);
    storage.set(KEYS.TRANSACTIONS, all);
    return newTx;
  },

  // Merchants
  getMerchant: (uid: string): Merchant | null => {
    const all = storage.get(KEYS.MERCHANTS, []);
    return all.find((m: Merchant) => m.uid === uid) || null;
  },
  saveMerchant: (merchant: Merchant) => {
    const all = storage.get(KEYS.MERCHANTS, []);
    const index = all.findIndex(m => m.uid === merchant.uid);
    if (index > -1) all[index] = merchant;
    else all.push(merchant);
    storage.set(KEYS.MERCHANTS, all);
  },

  // Resorts
  getResorts: (): Resort[] => storage.get(KEYS.RESORTS, INITIAL_RESORTS),

  // Bookings
  getBookings: (): Booking[] =>
    storage
      .get(KEYS.BOOKINGS, [])
      .sort((a: Booking, b: Booking) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

  addBooking: (booking: Omit<Booking, 'id'>) => {
    const all = storage.get(KEYS.BOOKINGS, []);
    const newBooking = { ...booking, id: Math.random().toString(36).substring(7) };
    all.push(newBooking);
    storage.set(KEYS.BOOKINGS, all);
    return newBooking;
  },
};
