import { type UserProfile, type Transaction, type Merchant, type Resort, type Booking } from '../types';
import { firebaseDb } from './firebase';
import { get, push, ref, set, update } from 'firebase/database';

async function sha256Hex(input: string): Promise<string> {
  const data = new TextEncoder().encode(input);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function emailKey(email: string) {
  const base64 = btoa(email);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function passwordHashForUser(uid: string, password: string) {
  return sha256Hex(`${uid}:${password}`);
}

const KEYS = {
  USERS: 'shorepay_users',
  CURRENT_USER: 'shorepay_current_user',
  PASSWORD_HASHES: 'shorepay_password_hashes',
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

  getPasswordHash: (uid: string): string | null => {
    const map = storage.get<Record<string, string>>(KEYS.PASSWORD_HASHES, {});
    return map[uid] ?? null;
  },

  setPasswordHash: (uid: string, hash: string) => {
    const map = storage.get<Record<string, string>>(KEYS.PASSWORD_HASHES, {});
    map[uid] = hash;
    storage.set(KEYS.PASSWORD_HASHES, map);
  },

  upsertUserRemoteWithUid: async (profile: UserProfile, password: string) => {
    const passwordHash = await passwordHashForUser(profile.uid, password);
    await set(ref(firebaseDb, `users/${profile.uid}`), { ...profile, passwordHash });
    await set(ref(firebaseDb, `usersByEmail/${emailKey(profile.email)}`), profile.uid);
    storage.setPasswordHash(profile.uid, passwordHash);
  },

  ensureEmailMappingRemote: async (email: string, uid: string) => {
    await set(ref(firebaseDb, `usersByEmail/${emailKey(email)}`), uid);
  },

  getUserUidByEmailRemote: async (email: string): Promise<string | null> => {
    try {
      const snap = await get(ref(firebaseDb, `usersByEmail/${emailKey(email)}`));
      const val = snap.val();
      return typeof val === 'string' ? val : null;
    } catch {
      return null;
    }
  },

  getUserRemote: async (uid: string): Promise<UserProfile | null> => {
    try {
      const snap = await get(ref(firebaseDb, `users/${uid}`));
      const val = snap.val();
      if (!val) return null;
      const { passwordHash: _passwordHash, ...profile } = val;
      return profile as UserProfile;
    } catch {
      return null;
    }
  },

  getUserRemoteWithPasswordHash: async (uid: string): Promise<(UserProfile & { passwordHash?: string }) | null> => {
    try {
      const snap = await get(ref(firebaseDb, `users/${uid}`));
      const val = snap.val();
      if (!val) return null;
      return { uid, ...(val as any) };
    } catch {
      return null;
    }
  },

  createUserRemote: async (input: {
    email: string;
    password: string;
    fullName: string;
    username: string;
    balance: number;
    role: UserProfile['role'];
    createdAt: string;
  }): Promise<UserProfile> => {
    const uid = push(ref(firebaseDb, 'users')).key || Math.random().toString(36).substring(7);
    const passwordHash = await passwordHashForUser(uid, input.password);
    storage.setPasswordHash(uid, passwordHash);
    const profile: UserProfile = {
      uid,
      email: input.email,
      fullName: input.fullName,
      username: input.username,
      balance: input.balance,
      role: input.role,
      createdAt: input.createdAt,
    };
    await set(ref(firebaseDb, `users/${uid}`), { ...profile, passwordHash });
    await set(ref(firebaseDb, `usersByEmail/${emailKey(input.email)}`), uid);
    return profile;
  },

  updateUserRemote: async (uid: string, patch: Partial<UserProfile>) => {
    await update(ref(firebaseDb, `users/${uid}`), patch as any);
  },

  verifyUserPassword: async (uid: string, password: string, passwordHash?: string) => {
    if (!passwordHash) return false;
    const computed = await passwordHashForUser(uid, password);
    return computed === passwordHash;
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

  getTransactionsRemote: async (uid: string): Promise<Transaction[]> => {
    try {
      const snap = await get(ref(firebaseDb, `transactionsByUser/${uid}`));
      const val = snap.val();
      const list = val ? (Object.values(val) as Transaction[]) : [];
      return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return storage.getTransactions(uid);
    }
  },

  addTransactionRemote: async (tx: Transaction) => {
    await set(ref(firebaseDb, `transactionsByUser/${tx.fromUid}/${tx.id}`), tx);
    if (tx.toUid && tx.toUid !== tx.fromUid && tx.toUid !== 'external') {
      await set(ref(firebaseDb, `transactionsByUser/${tx.toUid}/${tx.id}`), tx);
    }
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

  getBookingsRemote: async (): Promise<Booking[]> => {
    try {
      const snap = await get(ref(firebaseDb, 'bookings'));
      const val = snap.val();
      const list = val ? (Object.values(val) as Booking[]) : [];
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return storage.getBookings();
    }
  },

  addBookingRemote: async (booking: Booking): Promise<void> => {
    await set(ref(firebaseDb, `bookings/${booking.id}`), booking);
  },
};
