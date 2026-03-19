import { type UserProfile, type Transaction, type Merchant, type Resort, type Booking, type Customer, type ResortAdmin } from '../types';
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
  { 
    id: '1', 
    name: 'Jc Infinity', 
    imageUrl: 'https://picsum.photos/seed/resort1/400/300', 
    description: 'Luxury beachfront', 
    location: 'Dangay', 
    rating: 4.8,
    registrationFields: ['fullName', 'email', 'phone', 'address', 'checkIn', 'checkOut', 'guests'],
    rooms: [
      { id: 'std', name: 'Standard Room', pricePerNight: 3500, maxGuests: 2, description: 'Cozy room with basic amenities.' },
      { id: 'fam', name: 'Family Room', pricePerNight: 5200, maxGuests: 4, description: 'Bigger room for families.' },
      { id: 'villa', name: 'Beach Villa', pricePerNight: 8200, maxGuests: 6, description: 'Private villa near the beach.' },
    ],
  },
  { 
    id: '2', 
    name: 'Kamayan Penthouse', 
    imageUrl: 'https://picsum.photos/seed/resort2/400/300', 
    description: 'Traditional vibes', 
    location: 'Roxas', 
    rating: 4.5,
    registrationFields: ['fullName', 'email', 'phone', 'address', 'checkIn', 'checkOut', 'guests', 'specialRequests'],
    rooms: [
      { id: 'garden', name: 'Garden Room', pricePerNight: 3200, maxGuests: 2, description: 'Peaceful view of the garden.' },
      { id: 'suite', name: 'Penthouse Suite', pricePerNight: 7500, maxGuests: 4, description: 'Top-floor suite with balcony.' },
    ],
  },
  { 
    id: '3', 
    name: 'La Primera Grande', 
    imageUrl: 'https://picsum.photos/seed/resort3/400/300', 
    description: 'Grand experience', 
    location: 'Dangay', 
    rating: 4.7,
    registrationFields: ['fullName', 'email', 'phone', 'address', 'checkIn', 'checkOut', 'guests', 'mealPlan'],
    rooms: [
      { id: 'deluxe', name: 'Deluxe Room', pricePerNight: 4200, maxGuests: 2, description: 'Upgraded room with premium finish.' },
      { id: 'grand', name: 'Grand Suite', pricePerNight: 6900, maxGuests: 4, description: 'Spacious suite with lounge area.' },
      { id: 'pres', name: 'Presidential Suite', pricePerNight: 12000, maxGuests: 6, description: 'Best-in-class suite with sea view.' },
    ],
  },
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

  transferRemote: async (input: { fromUid: string; toUid: string; amount: number; note?: string }) => {
    const fromUid = input.fromUid.trim();
    const toUid = input.toUid.trim();
    const amount = input.amount;
    if (!fromUid || !toUid) throw new Error('Missing recipient.');
    if (fromUid === toUid) throw new Error('Cannot send to yourself.');
    if (!Number.isFinite(amount) || amount <= 0) throw new Error('Enter a valid amount.');

    const [fromUser, toUser] = await Promise.all([
      storage.getUserRemote(fromUid),
      toUid === 'external' ? Promise.resolve(null) : storage.getUserRemote(toUid)
    ]);
    if (!fromUser) throw new Error('Sender not found.');
    if (toUid !== 'external' && !toUser) throw new Error('Recipient not found.');
    if (fromUser.balance < amount) throw new Error('Insufficient balance.');

    const txId = push(ref(firebaseDb, 'transactions')).key || Math.random().toString(36).slice(2);
    const timestamp = new Date().toISOString();
    const note = input.note?.trim() || undefined;

    const senderTx: Transaction = {
      id: txId,
      fromUid,
      toUid,
      amount,
      type: 'payment',
      status: 'confirmed',
      timestamp,
      merchantName: toUser?.fullName || 'External Transfer',
      description: note ?? `Transfer to ${toUser?.fullName || 'External Account'}`,
    };

    const updates: Record<string, any> = {};
    updates[`users/${fromUid}/balance`] = fromUser.balance - amount;
    updates[`transactionsByUser/${fromUid}/${txId}`] = senderTx;

    if (toUser) {
      const recipientTx: Transaction = {
        ...senderTx,
        merchantName: fromUser.fullName,
        description: note ?? `Transfer from ${fromUser.fullName}`,
      };
      updates[`users/${toUid}/balance`] = toUser.balance + amount;
      updates[`transactionsByUser/${toUid}/${txId}`] = recipientTx;
    }

    await update(ref(firebaseDb), updates);
    return { txId, senderBalance: fromUser.balance - amount, recipientName: toUser?.fullName || 'External Transfer' };
  },

  // Merchants
  getMerchantRemote: async (uid: string): Promise<Merchant | null> => {
    try {
      const snap = await get(ref(firebaseDb, `merchants/${uid}`));
      const val = snap.val();
      return val ? ({ uid, ...(val as any) } as Merchant) : null;
    } catch {
      return null;
    }
  },

  getMerchantsRemote: async (): Promise<Merchant[]> => {
    try {
      const snap = await get(ref(firebaseDb, 'merchants'));
      const val = snap.val();
      if (!val) return [];
      return Object.entries(val).map(([uid, m]) => ({ uid, ...(m as any) })) as Merchant[];
    } catch {
      return [];
    }
  },

  upsertMerchantRemote: async (merchant: Merchant) => {
    await set(ref(firebaseDb, `merchants/${merchant.uid}`), merchant);
  },

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
    void storage.upsertMerchantRemote(merchant).catch(() => {});
  },

  getResortContactRemote: async (resortId: string): Promise<{ phone?: string; email?: string; facebook?: string } | null> => {
    try {
      const snap = await get(ref(firebaseDb, `resorts/${resortId}/contact`));
      const val = snap.val();
      return val ? (val as any) : null;
    } catch {
      return null;
    }
  },

  // New Backend Logic for MuntiSea
  saveReservation: async (uid: string, reservation: any) => {
    const resRef = ref(firebaseDb, `reservations/${uid}`);
    const newResRef = push(resRef);
    await set(newResRef, { ...reservation, timestamp: new Date().toISOString() });
    return newResRef.key;
  },

  saveBooking: async (uid: string, booking: any) => {
    const bookingRef = ref(firebaseDb, `bookings/${uid}`);
    const newBookingRef = push(bookingRef);
    await set(newBookingRef, { ...booking, timestamp: new Date().toISOString() });
    return newBookingRef.key;
  },

  savePayment: async (uid: string, payment: any) => {
    const paymentRef = ref(firebaseDb, `payments/${uid}`);
    const newPaymentRef = push(paymentRef);
    await set(newPaymentRef, { ...payment, timestamp: new Date().toISOString() });
    return newPaymentRef.key;
  },

  processFullCheckout: async (uid: string, data: {
    reservation?: any;
    booking?: any;
    payment: {
      cardDetails: {
        number: string;
        expiry: string;
        cvv: string;
      };
      billingAddress: {
        fullName: string;
        country: string;
        address: string;
      };
    };
    totalBill: number;
  }) => {
    const timestamp = new Date().toISOString();
    const updates: Record<string, any> = {};
    
    const transactionId = push(ref(firebaseDb, 'transactions')).key;
    
    if (data.reservation) {
      const resId = push(ref(firebaseDb, `reservations/${uid}`)).key;
      updates[`reservations/${uid}/${resId}`] = { ...data.reservation, timestamp };
    }
    
    if (data.booking) {
      const bookingId = push(ref(firebaseDb, `bookings/${uid}`)).key;
      updates[`bookings/${uid}/${bookingId}`] = { ...data.booking, timestamp };
    }
    
    const paymentId = push(ref(firebaseDb, `payments/${uid}`)).key;
    updates[`payments/${uid}/${paymentId}`] = { 
      ...data.payment, 
      totalBill: data.totalBill,
      timestamp 
    };
    
    await update(ref(firebaseDb), updates);
    return transactionId;
  },

  upsertResortContactRemote: async (resortId: string, contact: { phone?: string; email?: string; facebook?: string }) => {
    await set(ref(firebaseDb, `resorts/${resortId}/contact`), contact as any);
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
    const updates: Record<string, any> = {};
    updates[`bookings/${booking.id}`] = booking;
    updates[`bookingsByResort/${booking.resortId}/${booking.id}`] = booking;
    await update(ref(firebaseDb), updates);
  },

  getBookingsByResortRemote: async (resortId: string): Promise<Booking[]> => {
    try {
      const snap = await get(ref(firebaseDb, `bookingsByResort/${resortId}`));
      const val = snap.val();
      const list = val ? (Object.values(val) as Booking[]) : [];
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      const all = await storage.getBookingsRemote();
      return all.filter((b) => b.resortId === resortId);
    }
  },

  getAllUsersRemote: async (): Promise<UserProfile[]> => {
    try {
      const snap = await get(ref(firebaseDb, 'users'));
      const val = snap.val();
      if (!val) return [];
      return Object.entries(val)
        .map(([uid, u]) => {
          if (!u) return null;
          const { passwordHash: _passwordHash, ...profile } = u as any;
          return { uid, ...(profile as any) } as UserProfile;
        })
        .filter(Boolean) as UserProfile[];
    } catch {
      return [];
    }
  },

  getAllTransactionsRemote: async (): Promise<Transaction[]> => {
    try {
      const snap = await get(ref(firebaseDb, 'transactionsByUser'));
      const val = snap.val();
      if (!val) return [];
      const map = new Map<string, Transaction>();
      for (const uid of Object.keys(val)) {
        const perUser = val[uid];
        if (!perUser) continue;
        for (const tx of Object.values(perUser) as Transaction[]) {
          if (!tx || !tx.id) continue;
          if (!map.has(tx.id)) map.set(tx.id, tx);
        }
      }
      return Array.from(map.values()).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    } catch {
      return [];
    }
  },

  // Customers per Resort
  addCustomerRemote: async (customer: Customer): Promise<void> => {
    await set(ref(firebaseDb, `resorts/${customer.resortId}/customers/${customer.id}`), customer);
  },

  getCustomersByResortRemote: async (resortId: string): Promise<Customer[]> => {
    try {
      const snap = await get(ref(firebaseDb, `resorts/${resortId}/customers`));
      const val = snap.val();
      const list = val ? (Object.values(val) as Customer[]) : [];
      return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } catch {
      return [];
    }
  },

  updateCustomerStatusRemote: async (resortId: string, customerId: string, status: Customer['status']): Promise<void> => {
    await update(ref(firebaseDb, `resorts/${resortId}/customers/${customerId}`), { status });
  },

  updateResortRoomPriceRemote: async (resortId: string, roomId: string, price: number): Promise<void> => {
    await set(ref(firebaseDb, `resorts/${resortId}/roomPrices/${roomId}`), price);
  },

  getResortRoomPricesRemote: async (resortId: string): Promise<Record<string, number>> => {
    try {
      const snap = await get(ref(firebaseDb, `resorts/${resortId}/roomPrices`));
      return snap.val() || {};
    } catch {
      return {};
    }
  },

  // Resort Admins
  createResortAdminRemote: async (admin: ResortAdmin): Promise<void> => {
    await set(ref(firebaseDb, `resortAdmins/${admin.resortId}`), admin);
  },

  getResortAdminRemote: async (resortId: string): Promise<ResortAdmin | null> => {
    try {
      const snap = await get(ref(firebaseDb, `resortAdmins/${resortId}`));
      const val = snap.val();
      return val ? (val as ResortAdmin) : null;
    } catch {
      return null;
    }
  },

  verifyResortAdminPassword: async (resortId: string, username: string, password: string): Promise<boolean> => {
    // Hardcoded fallback for demo purposes
    const defaults: Record<string, any> = {
      '1': { u: 'admin', p: 'admin123' },
      '2': { u: 'admin', p: 'admin123' },
      '3': { u: 'admin', p: 'admin123' },
    };
    
    const d = defaults[resortId];
    if (d && username === d.u && password === d.p) return true;

    const admin = await storage.getResortAdminRemote(resortId);
    if (!admin || admin.username !== username) return false;
    const computed = await passwordHashForUser(resortId, password);
    return computed === admin.passwordHash;
  },

  // Get current resort admin session
  getCurrentResortAdmin: (): { resortId: string; username: string } | null => {
    return storage.get('current_resort_admin', null);
  },

  setCurrentResortAdmin: (admin: { resortId: string; username: string } | null) => {
    storage.set('current_resort_admin', admin);
  },

  // Initialize default resort admins (run once)
  initializeResortAdmins: async () => {
    const resorts = [
      { id: '1', username: 'admin', password: 'admin123' },
      { id: '2', username: 'admin', password: 'admin123' },
      { id: '3', username: 'admin', password: 'admin123' },
    ];

    for (const resort of resorts) {
      try {
        const existing = await storage.getResortAdminRemote(resort.id);
        if (!existing) {
          const passwordHash = await passwordHashForUser(resort.id, resort.password);
          await storage.createResortAdminRemote({
            resortId: resort.id,
            username: resort.username,
            passwordHash,
            createdAt: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error(`Failed to initialize admin for resort ${resort.id}:`, error);
      }
    }
  },
};
