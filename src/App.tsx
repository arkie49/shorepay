/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Wallet, 
  QrCode, 
  History, 
  Home, 
  User as UserIcon, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ArrowLeft,
  CalendarDays,
  Heart,
  Minus,
  Plus, 
  Search, 
  Share2,
  Star,
  Bell, 
  Menu, 
  MapPin, 
  Shield, 
  BarChart3, 
  Store,
  Users,
  CheckCircle2,
  X,
  Camera,
  LogOut,
  Settings
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { QRCodeSVG } from 'qrcode.react';
import { storage } from './services/storage';
import { type Booking, type UserProfile, type Transaction, type Resort, type UserRole } from './types';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const RESORT_GALLERIES: Record<string, string[]> = {
  '1': [
    '/assets/infinity gallery.jpg',
    '/assets/infinity gallery 1.jpg',
    '/assets/infinity gallery 2.jpg',
    '/assets/infinity gallery 3.jpg',
    '/assets/infinity gallery 4.jpg',
    '/assets/infinity gallery 5.jpg',
    '/assets/infinity gallery 6.jpg',
    '/assets/infinity gallery 7.jpg',
  ],
  '2': [
    '/assets/kamayan gallery.jpg',
    '/assets/kamayan gallery 1.jpg',
    '/assets/kamayan gallery 2.jpg',
    '/assets/kamayanan gallery 3.jpg',
    '/assets/kamayan gallery 4.jpg',
    '/assets/kamayan gallery 5.jpg',
  ],
  '3': [
    '/assets/primera.jpg',
    '/assets/primera 1.jpg',
    '/assets/primera 2.jpg',
    '/assets/primera 3.jpg',
    '/assets/primera 4.jpg',
  ],
};

// --- Components ---

const SplashScreen = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[200] coastal-gradient flex flex-col items-center justify-center text-white"
  >
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-col items-center gap-4"
    >
      <div className="w-20 h-20 bg-white rounded-[28px] flex items-center justify-center shadow-2xl shadow-ocean-blue/40">
        <Wallet className="text-ocean-blue" size={40} />
      </div>
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tighter mb-1">SHOREPAY</h1>
        <p className="text-white/60 text-sm font-medium tracking-[0.2em] uppercase">Coastal Payments</p>
      </div>
    </motion.div>
    
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="absolute bottom-12 flex flex-col items-center gap-2"
    >
      <div className="w-1 h-1 bg-white rounded-full animate-bounce" />
      <p className="text-[10px] font-bold tracking-widest opacity-40 uppercase">Secure & Fast</p>
    </motion.div>
  </motion.div>
);

const Button = ({ 
  children, 
  className, 
  variant = 'primary', 
  ...props 
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'outline' | 'ghost' }) => {
  const variants = {
    primary: 'bg-ocean-blue text-white hover:bg-ocean-blue/90',
    secondary: 'bg-sand-gold text-slate-900 hover:bg-sand-gold/90',
    outline: 'border-2 border-ocean-blue text-ocean-blue hover:bg-ocean-blue/10',
    ghost: 'hover:bg-slate-100 text-slate-600',
  };

  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-xl font-medium transition-all active:scale-95 disabled:opacity-50',
        variants[variant],
        className
      )}
      {...props}
    >
      children
    </button>
  );
};

// --- Resort Detail Screen ---

function ResortDetailScreen({ resort, profile, onBack }: { resort: Resort; profile: UserProfile; onBack: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [guests, setGuests] = useState(2);
  const [provider, setProvider] = useState<'GCash' | 'Maya' | 'Card' | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showAllGallery, setShowAllGallery] = useState(false);
  const gallery = RESORT_GALLERIES[resort.id] ?? [resort.imageUrl];

  return (
    <div className="h-full flex flex-col bg-slate-50 relative">
      <div className="relative h-[320px]">
        <img
          src={resort.imageUrl}
          alt={resort.name}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/10 to-slate-50" />

        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <button
              onClick={() => alert('Share coming soon!')}
              className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <Share2 size={18} />
            </button>
            <button
              onClick={() => setIsFavorite(v => !v)}
              className={cn(
                "w-10 h-10 backdrop-blur-md rounded-full flex items-center justify-center hover:bg-white/30 transition-colors",
                isFavorite ? "bg-white text-rose-500" : "bg-white/20 text-white"
              )}
            >
              <Heart size={18} className={isFavorite ? "fill-rose-500" : undefined} />
            </button>
          </div>
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <div className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 shadow-sm">
            <Star size={14} className="text-orange-500 fill-orange-500" />
            <span>{resort.rating}</span>
            <span className="text-slate-400">•</span>
            <span className="text-slate-500">128 reviews</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white mt-3 drop-shadow-sm">{resort.name}</h1>
          <div className="flex items-center gap-2 text-white/90 mt-2">
            <MapPin size={16} />
            <span className="text-sm font-medium">{resort.location}, Roxas</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 pb-[calc(8.5rem+env(safe-area-inset-bottom))] space-y-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Price</p>
            <p className="text-lg font-extrabold text-ocean-blue">₱3,500</p>
            <p className="text-xs text-slate-500">per night</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Check-in</p>
            <p className="text-lg font-extrabold text-slate-900">2:00 PM</p>
            <p className="text-xs text-slate-500">standard</p>
          </div>
          <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
            <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Check-out</p>
            <p className="text-lg font-extrabold text-slate-900">12:00 NN</p>
            <p className="text-xs text-slate-500">standard</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-extrabold mb-2">About</h2>
          <p className="text-slate-600 leading-relaxed">
            {resort.description} Experience the ultimate relaxation with premium amenities, world-class service, and breathtaking coastal views.
          </p>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold">Amenities</h2>
            <button onClick={() => alert('Full amenities list coming soon!')} className="text-ocean-blue text-sm font-bold">
              See all
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Free Wifi', icon: <CheckCircle2 size={18} /> },
              { label: 'Swimming Pool', icon: <CheckCircle2 size={18} /> },
              { label: 'Beach Bar', icon: <CheckCircle2 size={18} /> },
              { label: 'Fitness Gym', icon: <CheckCircle2 size={18} /> },
            ].map((item, i) => (
              <button
                key={i}
                onClick={() => alert(item.label)}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors"
              >
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-ocean-blue shadow-sm">
                  {item.icon}
                </div>
                <div className="text-left">
                  <p className="font-bold text-slate-900 text-sm">{item.label}</p>
                  <p className="text-xs text-slate-500">Included</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-extrabold">Gallery</h2>
            <button onClick={() => setShowAllGallery(v => !v)} className="text-ocean-blue text-sm font-bold">
              {showAllGallery ? 'Show less' : 'View all'}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {(showAllGallery ? gallery : gallery.slice(0, 6)).map((src, i) => (
              <button
                key={i}
                onClick={() => alert('Image preview coming soon!')}
                className="aspect-square overflow-hidden rounded-2xl bg-slate-100"
              >
                <img src={src} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 w-[min(100%,28rem)] bg-white border-t border-slate-100 px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] z-[60]">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Total</p>
            <p className="text-xl font-extrabold text-slate-900">
              ₱3,500 <span className="text-slate-400 text-sm font-semibold">/night</span>
            </p>
          </div>
          <button
            onClick={() => setShowBooking(true)}
            className="flex-1 bg-ocean-blue text-white py-4 rounded-2xl font-extrabold text-lg hover:bg-ocean-blue/90 transition-all active:scale-95"
          >
            Book Now
          </button>
        </div>
      </div>

      <AnimatePresence>
        {showBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold">Complete Booking</h3>
                <button
                  onClick={() => setShowBooking(false)}
                  className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700 font-bold mb-3">
                    <CalendarDays size={18} className="text-ocean-blue" />
                    Dates
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="date"
                      value={checkIn}
                      onChange={e => setCheckIn(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-ocean-blue font-bold"
                    />
                    <input
                      type="date"
                      value={checkOut}
                      onChange={e => setCheckOut(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-ocean-blue font-bold"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-700 font-bold">
                      <Users size={18} className="text-ocean-blue" />
                      Guests
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setGuests(g => Math.max(1, g - 1))}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center font-extrabold">{guests}</span>
                      <button
                        onClick={() => setGuests(g => Math.min(10, g + 1))}
                        className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <p className="text-slate-700 font-bold mb-3">Pay With</p>
                  <div className="grid grid-cols-3 gap-2">
                    {(['GCash', 'Maya', 'Card'] as const).map(p => (
                      <button
                        key={p}
                        onClick={() => setProvider(p)}
                        className={cn(
                          "py-3 rounded-2xl font-extrabold text-sm border transition-colors",
                          provider === p ? "bg-ocean-blue text-white border-ocean-blue" : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  if (!provider) {
                    alert('Select a payment method.');
                    return;
                  }
                  if (!checkIn || !checkOut) {
                    alert('Select check-in and check-out dates.');
                    return;
                  }
                  const checkInDate = new Date(checkIn);
                  const checkOutDate = new Date(checkOut);
                  if (Number.isNaN(checkInDate.getTime()) || Number.isNaN(checkOutDate.getTime())) {
                    alert('Invalid dates.');
                    return;
                  }
                  const nights = Math.ceil((checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24));
                  if (!Number.isFinite(nights) || nights <= 0) {
                    alert('Check-out must be after check-in.');
                    return;
                  }

                  const amount = nights * 3500;
                  const newBooking = storage.addBooking({
                    userUid: profile.uid,
                    userName: profile.fullName,
                    resortId: resort.id,
                    resortName: resort.name,
                    checkIn,
                    checkOut,
                    guests,
                    provider,
                    amount,
                    createdAt: new Date().toISOString(),
                  });
                  void storage.addBookingRemote(newBooking).catch(() => {});

                  alert(`Booking confirmed! ₱${amount.toLocaleString()} via ${provider}.`);
                  setShowBooking(false);
                }}
                className="w-full mt-6 bg-ocean-blue text-white py-4 rounded-2xl font-extrabold text-lg hover:bg-ocean-blue/90 transition-all active:scale-95"
              >
                Confirm Booking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Transaction History Screen ---

function TransactionHistoryScreen({ profile, onBack }: { profile: UserProfile; onBack: () => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  useEffect(() => {
    void storage.getTransactionsRemote(profile.uid).then(setTransactions);
  }, [profile.uid]);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-bold">Transaction History</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {transactions.map(tx => (
          <div key={tx.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                tx.type === 'payment' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
              )}>
                {tx.type === 'payment' ? <Store size={20} /> : <Plus size={20} />}
              </div>
              <div>
                <p className="font-bold text-slate-900">{tx.merchantName || 'ShorePay User'}</p>
                <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleDateString()} • {new Date(tx.timestamp).toLocaleTimeString()}</p>
              </div>
            </div>
            <p className={cn("font-bold", tx.type === 'payment' ? "text-slate-900" : "text-emerald-600")}>
              {tx.type === 'payment' ? '-' : '+'}₱{tx.amount}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

const Input = ({ label, error, ...props }: React.InputHTMLAttributes<HTMLInputElement> & { label?: string; error?: string }) => (
  <div className="space-y-1 w-full">
    {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
    <input 
      className={cn(
        "w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-ocean-blue/20 focus:border-ocean-blue transition-all",
        error && "border-red-500 focus:ring-red-500/20 focus:border-red-500"
      )}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
);

// --- Main App ---

const MOCK_RESORTS: Resort[] = [
  { id: '1', name: 'Jc Infinity', imageUrl: '/assets/JC infinity.png', description: 'Luxury beachfront', location: 'Dangay', rating: 4.8 },
  { id: '2', name: 'Kamayan Penthouse', imageUrl: '/assets/kamayan.png', description: 'Traditional vibes', location: 'Roxas', rating: 4.5 },
  { id: '3', name: 'La Primera Grande', imageUrl: '/assets/la primera grande.png', description: 'Grand experience', location: 'Dangay', rating: 4.7 },
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'auth' | 'main'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedResort, setSelectedResort] = useState<Resort | null>(null);

  // Auth Listener Simulation
  useEffect(() => {
    const currentUser = storage.getCurrentUser();
    if (currentUser) {
      setProfile(currentUser);
      setView('main');
      if (currentUser.role === 'admin') setActiveTab('admin');
      else if (currentUser.role === 'merchant') setActiveTab('merchant');
      else setActiveTab('home');
      if (currentUser.uid !== 'admin') {
        void storage.getUserRemote(currentUser.uid).then((remote) => {
          if (!remote) return;
          storage.saveUser(remote);
          storage.setCurrentUser(remote);
          setProfile(remote);
        });
      }
    } else {
      setProfile(null);
      setView('auth');
    }
    
    // Hide loading after auth check
    setLoading(false);

    // Hide splash after a delay
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    
    return () => clearTimeout(timer);
  }, []);

  const handleLogin = (user: UserProfile) => {
    storage.setCurrentUser(user);
    setProfile(user);
    setView('main');
    if (user.role === 'admin') setActiveTab('admin');
    else if (user.role === 'merchant') setActiveTab('merchant');
    else setActiveTab('home');
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    setProfile(null);
    setView('auth');
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-clean-white">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-ocean-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-clean-white max-w-md mx-auto relative shadow-2xl overflow-hidden">
      <AnimatePresence mode="wait">
        {showSplash && <SplashScreen key="splash" />}
        
        {!showSplash && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
          >
            {view === 'auth' ? (
              <AuthScreen mode={authMode} setMode={setAuthMode} onAuth={handleLogin} />
            ) : (
              <MainScreen 
                profile={profile!} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={handleLogout}
                selectedResort={selectedResort}
                setSelectedResort={setSelectedResort}
                onProfileUpdated={setProfile}
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Auth Screen ---

function AuthScreen({ mode, setMode, onAuth }: { mode: 'login' | 'signup'; setMode: (m: 'login' | 'signup') => void; onAuth: (u: UserProfile) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const ADMIN_USERNAME = 'admin';
  const ADMIN_PASSWORD = 'ShorePay2024!';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (mode === 'signup') {
      try {
        const existingUid = await storage.getUserUidByEmailRemote(email);
        if (existingUid) {
          setError('Email already exists');
          return;
        }

        const newUser = await storage.createUserRemote({
          email,
          password,
          fullName,
          username,
          balance: 1000,
          role,
          createdAt: new Date().toISOString(),
        });

        storage.saveUser(newUser);
        if (role === 'merchant') {
          storage.saveMerchant({
            uid: newUser.uid,
            businessName: fullName,
            totalSalesToday: 0,
            location: 'Dangay, Roxas',
            isVerified: false,
          });
        }
        onAuth(newUser);
      } catch {
        setError('Sign up failed. Check your internet or Firebase rules.');
      }
    } else {
      if (email.trim().toLowerCase() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        const adminUser: UserProfile = {
          uid: 'admin',
          email: ADMIN_USERNAME,
          fullName: 'Admin',
          username: 'admin',
          balance: 0,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        onAuth(adminUser);
        return;
      }
      try {
        const uid = await storage.getUserUidByEmailRemote(email);
        if (uid) {
          const remoteUser = await storage.getUserRemoteWithPasswordHash(uid);
          if (!remoteUser) {
            setError('Invalid credentials');
            return;
          }
          const ok = await storage.verifyUserPassword(remoteUser.uid, password, remoteUser.passwordHash);
          if (!ok) {
            setError('Invalid credentials');
            return;
          }
          if (remoteUser.passwordHash) storage.setPasswordHash(remoteUser.uid, remoteUser.passwordHash);
          const { passwordHash: _passwordHash, ...profile } = remoteUser as any;
          storage.saveUser(profile as UserProfile);
          onAuth(profile as UserProfile);
          return;
        }
      } catch {}

      const users = storage.getUsers();
      const user = users.find(u => u.email === email);
      if (!user) {
        setError('Invalid credentials');
        return;
      }
      const ok = await storage.verifyUserPassword(user.uid, password, storage.getPasswordHash(user.uid) ?? undefined);
      if (!ok) {
        setError('Invalid credentials');
        return;
      }
      onAuth(user);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="h-screen coastal-gradient p-8 flex flex-col justify-center text-white"
    >
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center">
            <Wallet className="text-ocean-blue" />
          </div>
          <span className="text-2xl font-bold tracking-tighter">SHOREPAY</span>
        </div>
        <h1 className="text-5xl font-bold mb-2">Hi! Welcome</h1>
        <p className="text-white/80">{mode === 'signup' ? "Let's create an account" : "I'm waiting for you, please enter your detail"}</p>
      </div>

      <form onSubmit={handleAuth} className="space-y-4">
        {mode === 'signup' && (
          <>
            <input 
              placeholder="Full Name"
              className="w-full bg-white/10 border-b border-white/30 py-3 px-1 outline-none placeholder:text-white/50 focus:border-white transition-all"
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              required
            />
            <input 
              placeholder="Username"
              className="w-full bg-white/10 border-b border-white/30 py-3 px-1 outline-none placeholder:text-white/50 focus:border-white transition-all"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
            />
            <div className="flex gap-4 py-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" checked={role === 'customer'} onChange={() => setRole('customer')} />
                <span className="text-sm">Customer</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="role" checked={role === 'merchant'} onChange={() => setRole('merchant')} />
                <span className="text-sm">Merchant</span>
              </label>
            </div>
          </>
        )}
        <input 
          placeholder="Email or Phone Number"
          className="w-full bg-white/10 border-b border-white/30 py-3 px-1 outline-none placeholder:text-white/50 focus:border-white transition-all"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <input 
          type="password"
          placeholder="Password"
          className="w-full bg-white/10 border-b border-white/30 py-3 px-1 outline-none placeholder:text-white/50 focus:border-white transition-all"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        
        {error && <p className="text-xs text-red-200 bg-red-500/20 p-2 rounded">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4 hover:bg-slate-800 transition-all active:scale-95"
        >
          {mode === 'signup' ? 'Sign Up' : 'Log In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-white/70">
          {mode === 'signup' ? 'Have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="font-bold text-white hover:underline">
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </motion.div>
  );
}

// --- Main Screens ---

function MainScreen({ 
  profile, 
  activeTab, 
  setActiveTab,
  onLogout,
  selectedResort,
  setSelectedResort,
  onProfileUpdated
}: { 
  profile: UserProfile; 
  activeTab: string; 
  setActiveTab: (t: string) => void;
  onLogout: () => void;
  selectedResort: Resort | null;
  setSelectedResort: (r: Resort | null) => void;
  onProfileUpdated: (u: UserProfile) => void;
}) {
  const [showMyQr, setShowMyQr] = useState(false);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 overflow-y-auto pb-20">
        {activeTab === 'home' && <CustomerHome profile={profile} onNavigate={setActiveTab} />}
        {activeTab === 'resorts' && (
          <ResortListScreen 
            onNavigate={setActiveTab} 
            onSelect={(resort) => {
              setSelectedResort(resort);
              setActiveTab('resort-detail');
            }} 
          />
        )}
        {activeTab === 'resort-detail' && selectedResort && (
          <ResortDetailScreen 
            resort={selectedResort} 
            profile={profile}
            onBack={() => setActiveTab('resorts')} 
          />
        )}
        {activeTab === 'wallet' && <WalletScreen profile={profile} onNavigate={setActiveTab} />}
        {activeTab === 'transactions' && <TransactionHistoryScreen profile={profile} onBack={() => setActiveTab('wallet')} />}
        {activeTab === 'profile' && <ProfileScreen profile={profile} onLogout={onLogout} onNavigate={setActiveTab} />}
        {activeTab === 'account-settings' && (
          <AccountSettingsScreen 
            profile={profile} 
            onBack={() => setActiveTab('profile')} 
            onProfileUpdated={(u) => {
              onProfileUpdated(u);
              setActiveTab('profile');
            }}
          />
        )}
        {activeTab === 'security-privacy' && <SecurityPrivacyScreen uid={profile.uid} onBack={() => setActiveTab('profile')} />}
        {activeTab === 'notifications-settings' && <NotificationsSettingsScreen uid={profile.uid} onBack={() => setActiveTab('profile')} />}
        {activeTab === 'merchant' && <MerchantDashboard profile={profile} />}
        {activeTab === 'admin' && <AdminDashboard profile={profile} />}
      </div>

      {/* Bottom Nav */}
      {!['resort-detail', 'transactions', 'account-settings', 'security-privacy', 'notifications-settings'].includes(activeTab) && (
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-slate-100 px-8 py-4 flex justify-between items-center z-50">
          <NavButton active={activeTab === 'home'} icon={<Home />} label="Home" onClick={() => setActiveTab('home')} />
          
          {profile.role === 'customer' && (
            <button 
              onClick={() => setShowMyQr(true)}
              className="w-14 h-14 bg-ocean-blue rounded-2xl flex items-center justify-center text-white shadow-lg shadow-ocean-blue/30 -mt-10 border-4 border-white active:scale-90 transition-all"
            >
              <QrCode size={28} />
            </button>
          )}

          {profile.role === 'merchant' && (
            <NavButton active={activeTab === 'merchant'} icon={<Store />} label="Sales" onClick={() => setActiveTab('merchant')} />
          )}

          {profile.role === 'admin' && (
            <NavButton active={activeTab === 'admin'} icon={<BarChart3 />} label="Admin" onClick={() => setActiveTab('admin')} />
          )}

          <NavButton active={activeTab === 'profile'} icon={<UserIcon />} label="Profile" onClick={() => setActiveTab('profile')} />
        </div>
      )}

      <AnimatePresence>
        {showMyQr && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white w-full max-w-sm rounded-[40px] p-8 flex flex-col items-center text-center relative"
            >
              <button
                onClick={() => setShowMyQr(false)}
                className="absolute top-4 right-4 w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
              >
                <X size={20} />
              </button>

              <h3 className="text-xl font-extrabold mb-1">My QR Code</h3>
              <p className="text-sm text-slate-500 mb-6">Let merchants scan to pay or verify.</p>

              <div className="p-6 bg-slate-50 rounded-[32px] mb-5">
                <QRCodeSVG value={profile.uid} size={220} />
              </div>

              <div className="w-full bg-slate-50 rounded-3xl p-4 mb-6 text-left">
                <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Account</p>
                <p className="font-extrabold text-slate-900">{profile.fullName}</p>
                <p className="text-sm text-slate-500">@{profile.username}</p>
              </div>

              <div className="flex gap-2 w-full">
                <button
                  onClick={() => {
                    setShowMyQr(false);
                    setActiveTab('wallet');
                  }}
                  className="flex-1 bg-ocean-blue py-4 rounded-2xl font-extrabold text-white"
                >
                  Open Wallet
                </button>
                <button
                  onClick={() => setShowMyQr(false)}
                  className="flex-1 bg-slate-100 py-4 rounded-2xl font-extrabold text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function NavButton({ active, icon, label, onClick }: { active: boolean; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 transition-all",
        active ? "text-ocean-blue" : "text-slate-400"
      )}
    >
      {React.cloneElement(icon as React.ReactElement, { size: 24, strokeWidth: active ? 2.5 : 2 })}
      <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

// --- Customer Home ---

function CustomerHome({ profile, onNavigate }: { profile: UserProfile; onNavigate: (tab: string) => void }) {
  const [resorts, setResorts] = useState<Resort[]>([]);
  const [activeModal, setActiveModal] = useState<'cash-in' | 'cash-out' | null>(null);
  
  useEffect(() => {
    // Mock resorts for demo
    setResorts(MOCK_RESORTS);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="coastal-gradient p-6 pt-12 rounded-b-[40px] text-white">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <Wallet size={18} />
            </div>
            <span className="font-bold tracking-tighter">SHOREPAY</span>
          </div>
          <button 
            onClick={() => alert('No new notifications')}
            className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
          >
            <Bell size={20} />
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-3xl font-bold">Welcome to</h2>
          <h2 className="text-3xl font-bold opacity-80">Shore Pay!</h2>
        </div>

        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/50" size={20} />
          <input 
            placeholder="Search Resort her.."
            className="w-full bg-white/20 border border-white/30 rounded-2xl py-3 pl-12 pr-4 outline-none placeholder:text-white/50"
          />
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-6 grid grid-cols-4 gap-4">
        <QuickAction 
          icon={<Store />} 
          label="Resort" 
          color="bg-blue-100 text-blue-600" 
          onClick={() => onNavigate('resorts')}
        />
        <QuickAction 
          icon={<Wallet />} 
          label="E-Wallet" 
          color="bg-purple-100 text-purple-600" 
          onClick={() => onNavigate('wallet')}
        />
        <QuickAction 
          icon={<Plus />} 
          label="Cash in" 
          color="bg-emerald-100 text-emerald-600" 
          onClick={() => setActiveModal('cash-in')}
        />
        <QuickAction 
          icon={<ArrowUpRight />} 
          label="Cash out" 
          color="bg-orange-100 text-orange-600" 
          onClick={() => setActiveModal('cash-out')}
        />
      </div>

      {/* Popular Destinations */}
      <div id="popular-destinations" className="px-6">
        <div className="flex justify-between items-end mb-4">
          <h3 className="text-lg font-bold">Popular Destination</h3>
          <button 
            onClick={() => alert('Filter options coming soon!')}
            className="text-ocean-blue hover:text-ocean-blue/70 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
          {resorts.map(resort => (
            <div key={resort.id} className="min-w-[140px] space-y-2">
              <img src={resort.imageUrl} className="w-full aspect-square object-cover rounded-2xl shadow-md" referrerPolicy="no-referrer" />
              <p className="text-sm font-bold truncate">{resort.name}...</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended */}
      <div className="px-6">
        <h3 className="text-lg font-bold mb-4">Recommended</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="relative">
              <img src="/assets/infinity gallery 6.jpg" alt="Beach activity" className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold tracking-widest uppercase opacity-80">Activity</p>
                <p className="text-sm font-extrabold">Kayaking</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <img src="/assets/primera 3.jpg" alt="Beach activity" className="w-full aspect-[4/3] object-cover rounded-2xl shadow-md" referrerPolicy="no-referrer" />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/60 via-black/0 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <p className="text-xs font-bold tracking-widest uppercase opacity-80">Activity</p>
                <p className="text-sm font-extrabold">Sunset Beach Walk</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-6 text-center relative"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={20} />
              </button>
              
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                activeModal === 'cash-in' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
              )}>
                {activeModal === 'cash-in' ? <Plus size={32} /> : <ArrowUpRight size={32} />}
              </div>
              
              <h3 className="text-xl font-bold mb-2">
                {activeModal === 'cash-in' ? "Cash In" : "Cash Out"}
              </h3>
              <p className="text-slate-500 mb-6">
                {activeModal === 'cash-in' 
                  ? "Top up your wallet securely via bank transfer or over-the-counter partners."
                  : "Transfer funds to other banks or e-wallets instantly."
                }
              </p>

              <div className="text-left space-y-4 mb-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Select Provider</label>
                  <div className="grid grid-cols-2 gap-2">
                    {['GCash', 'Maya', 'BDO', 'BPI'].map(provider => (
                      <button key={provider} className="p-3 border border-slate-200 rounded-xl text-sm font-bold hover:bg-slate-50 focus:ring-2 focus:ring-ocean-blue/20 focus:border-ocean-blue">
                        {provider}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">₱</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-ocean-blue font-bold text-lg"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full bg-ocean-blue text-white font-bold py-4 rounded-xl mb-3"
                onClick={() => {
                  alert(`Successfully processed ${activeModal === 'cash-in' ? 'Top Up' : 'Transfer'}!`);
                  setActiveModal(null);
                }}
              >
                Continue
              </button>
              <button 
                className="w-full text-slate-500 font-bold py-2"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickAction({ icon, label, color, onClick }: { icon: React.ReactNode; label: string; color: string; onClick?: () => void }) {
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-2 transition-transform active:scale-95">
      <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm", color)}>
        {React.cloneElement(icon as React.ReactElement, { size: 24 })}
      </div>
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
    </button>
  );
}

// --- Wallet Screen ---

function WalletScreen({ profile, onNavigate }: { profile: UserProfile; onNavigate: (tab: string) => void }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [successData, setSuccessData] = useState<{ id: string; amount: number; merchant: string } | null>(null);
  const [balance, setBalance] = useState(profile.balance);
  const [activeModal, setActiveModal] = useState<'cash-in' | 'cash-out' | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<'GCash' | 'Maya' | 'Bank' | null>(null);
  const [amountInput, setAmountInput] = useState('');
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  useEffect(() => {
    void storage.getTransactionsRemote(profile.uid).then(setTransactions);
    const current = storage.getCurrentUser();
    if (current?.uid === profile.uid) setBalance(current.balance);
    void storage.getUserRemote(profile.uid).then((remote) => {
      if (!remote) return;
      setBalance(remote.balance);
      storage.saveUser(remote);
      storage.setCurrentUser(remote);
    });
  }, [profile.uid]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const startCamera = async () => {
    setCameraError(null);

    const isSecure = window.isSecureContext || window.location.hostname === 'localhost';
    if (!isSecure) {
      setCameraError('Camera requires HTTPS (or localhost). Open the app via https or on-device localhost.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Camera is not supported in this browser.');
      return;
    }

    try {
      stopCamera();
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: 'environment' },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
    } catch (err: any) {
      const msg =
        typeof err?.message === 'string'
          ? err.message
          : 'Camera permission denied or not available.';
      setCameraError(msg);
      stopCamera();
    }
  };

  useEffect(() => {
    if (!showScanner) {
      stopCamera();
      return;
    }
    void startCamera();
    return () => stopCamera();
  }, [showScanner]);

  useEffect(() => {
    if (!activeModal) return;
    setSelectedProvider(null);
    setAmountInput('');
  }, [activeModal]);

  const handlePayment = () => {
    const amount = 250;
    if (balance >= amount) {
      const newTx = storage.addTransaction({
        fromUid: profile.uid,
        toUid: 'merchant_id_demo',
        amount,
        type: 'payment',
        status: 'confirmed',
        merchantName: 'Beachfront Grill',
        timestamp: new Date().toISOString()
      });
      void storage.addTransactionRemote(newTx).catch(() => {});
      
      const newBalance = balance - amount;
      const updatedProfile = { ...profile, balance: newBalance };
      storage.saveUser(updatedProfile);
      storage.setCurrentUser(updatedProfile);
      setBalance(newBalance);
      void storage.updateUserRemote(profile.uid, { balance: newBalance }).catch(() => {});
      void storage.getTransactionsRemote(profile.uid).then(setTransactions);
      
      setShowScanner(false);
      setSuccessData({
        id: newTx.id,
        amount,
        merchant: 'Beachfront Grill'
      });
    }
  };

  const handleCashMovement = () => {
    const amount = Number(amountInput);
    if (!selectedProvider) {
      alert('Select a top-up method.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      alert('Enter a valid amount.');
      return;
    }

    if (activeModal === 'cash-out' && amount > balance) {
      alert('Insufficient balance.');
      return;
    }

    const newBalance = activeModal === 'cash-in' ? balance + amount : balance - amount;
    const updatedProfile = { ...profile, balance: newBalance };
    storage.saveUser(updatedProfile);
    storage.setCurrentUser(updatedProfile);
    setBalance(newBalance);
    void storage.updateUserRemote(profile.uid, { balance: newBalance }).catch(() => {});

    const newTx = storage.addTransaction({
      fromUid: profile.uid,
      toUid: activeModal === 'cash-in' ? profile.uid : 'external',
      amount,
      type: activeModal === 'cash-in' ? 'cash-in' : 'withdraw',
      status: 'confirmed',
      timestamp: new Date().toISOString(),
      description: activeModal === 'cash-in' ? `Top up via ${selectedProvider}` : `Cash out to ${selectedProvider}`,
    });
    void storage.addTransactionRemote(newTx).catch(() => {});

    void storage.getTransactionsRemote(profile.uid).then(setTransactions);
    setActiveModal(null);
    alert(activeModal === 'cash-in' ? 'Top up successful!' : 'Cash out successful!');
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Wallet</h1>
        <button onClick={() => setShowScanner(true)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
          <QrCode size={20} />
        </button>
      </div>

      {/* Balance Card */}
      <div className="coastal-gradient p-8 rounded-[32px] text-white shadow-xl shadow-ocean-blue/20 relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
        <p className="text-white/70 text-sm mb-1">Current Balance</p>
        <h2 className="text-4xl font-bold mb-8">₱{balance.toLocaleString()}</h2>
        <div className="flex gap-4">
          <button 
            onClick={() => setActiveModal('cash-in')}
            className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <Plus size={18} />
            <span className="font-bold">Top Up</span>
          </button>
          <button 
            onClick={() => setActiveModal('cash-out')}
            className="flex-1 bg-white/20 hover:bg-white/30 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
          >
            <ArrowUpRight size={18} />
            <span className="font-bold">Send</span>
          </button>
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold">Recent Transactions</h3>
          <button onClick={() => onNavigate('transactions')} className="text-ocean-blue text-sm font-bold">See All</button>
        </div>
        <div className="space-y-4">
          {transactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <History size={48} className="mx-auto mb-2 opacity-20" />
              <p>No transactions yet</p>
            </div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-xl flex items-center justify-center",
                    tx.type === 'payment' ? "bg-blue-100 text-blue-600" : "bg-emerald-100 text-emerald-600"
                  )}>
                    {tx.type === 'payment' ? <Store size={20} /> : <Plus size={20} />}
                  </div>
                  <div>
                    <p className="font-bold">{tx.merchantName || 'ShorePay User'}</p>
                    <p className="text-xs text-slate-500">{new Date(tx.timestamp).toLocaleDateString()}</p>
                  </div>
                </div>
                <p className={cn("font-bold", tx.type === 'payment' ? "text-slate-900" : "text-emerald-600")}>
                  {tx.type === 'payment' ? '-' : '+'}₱{tx.amount}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scanner Mock Modal */}
      <AnimatePresence>
        {showScanner && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 flex flex-col p-6"
          >
            <div className="flex justify-between items-center text-white mb-12">
              <button onClick={() => setShowScanner(false)}><X size={32} /></button>
              <h2 className="text-xl font-bold">Scan QR Code</h2>
              <button onClick={startCamera}><Camera size={24} /></button>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center">
              <div className="w-64 h-64 border-4 border-white/30 rounded-3xl relative overflow-hidden bg-black">
                <video
                  ref={videoRef}
                  playsInline
                  muted
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-ocean-blue rounded-tl-xl" />
                <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-ocean-blue rounded-tr-xl" />
                <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-ocean-blue rounded-bl-xl" />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-ocean-blue rounded-br-xl" />
                <motion.div 
                  animate={{ top: ['10%', '90%', '10%'] }}
                  transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                  className="absolute left-0 right-0 h-0.5 bg-ocean-blue shadow-[0_0_15px_rgba(0,119,182,0.8)]"
                />
                {cameraError && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center p-4 text-center">
                    <p className="text-white text-sm font-bold mb-2">Camera unavailable</p>
                    <p className="text-white/70 text-xs mb-4">{cameraError}</p>
                    <button
                      onClick={startCamera}
                      className="bg-ocean-blue text-white px-4 py-2 rounded-xl font-bold text-sm"
                    >
                      Enable Camera
                    </button>
                  </div>
                )}
                {!cameraError && !cameraActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <p className="text-white/80 text-xs font-bold">Starting camera…</p>
                  </div>
                )}
              </div>
              <p className="text-white/60 mt-8 text-center">Align the QR code within the frame to pay instantly</p>
            </div>

            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                <Store size={24} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold">Mock Merchant Scan</p>
                <p className="text-xs opacity-60">Testing payment flow</p>
              </div>
              <button 
                onClick={handlePayment}
                className="bg-ocean-blue px-4 py-2 rounded-lg font-bold"
              >
                Pay ₱250
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Modal */}
      <AnimatePresence>
        {successData && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-white flex flex-col items-center justify-center p-8 text-center"
          >
            <motion.div 
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-8"
            >
              <CheckCircle2 size={48} />
            </motion.div>
            <h2 className="text-3xl font-bold mb-2">Payment Success!</h2>
            <p className="text-slate-500 mb-8">Your transaction was processed successfully.</p>
            
            <div className="w-full bg-slate-50 rounded-3xl p-6 mb-8 space-y-4">
              <div className="flex justify-between">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-bold"># {successData.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Merchant</span>
                <span className="font-bold">{successData.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Amount</span>
                <span className="font-bold text-ocean-blue">₱{successData.amount}</span>
              </div>
            </div>

            <button 
              onClick={() => setSuccessData(null)}
              className="w-full bg-slate-900 text-white py-4 rounded-2xl font-bold mb-4"
            >
              Digital Receipt
            </button>
            <button 
              onClick={() => setSuccessData(null)}
              className="text-slate-400 font-bold"
            >
              Back to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cash In/Out Modal */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full max-w-sm rounded-[32px] p-6 text-center relative"
            >
              <button 
                onClick={() => setActiveModal(null)}
                className="absolute top-4 right-4 p-2 bg-slate-100 rounded-full text-slate-500"
              >
                <X size={20} />
              </button>
              
              <div className={cn(
                "w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4",
                activeModal === 'cash-in' ? "bg-emerald-100 text-emerald-600" : "bg-orange-100 text-orange-600"
              )}>
                {activeModal === 'cash-in' ? <Plus size={32} /> : <ArrowUpRight size={32} />}
              </div>
              
              <h3 className="text-xl font-bold mb-2">
                {activeModal === 'cash-in' ? "Cash In" : "Cash Out"}
              </h3>
              <p className="text-slate-500 mb-5">
                {activeModal === 'cash-in' 
                  ? "Choose your top-up method and enter the amount."
                  : "Choose a destination and enter the amount to withdraw."
                }
              </p>

              <div className="text-left space-y-4 mb-6">
                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">
                    {activeModal === 'cash-in' ? 'Top Up Options' : 'Cash Out Options'}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['GCash', 'Maya', 'Bank'] as const).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setSelectedProvider(p)}
                        className={cn(
                          "py-3 rounded-xl text-sm font-extrabold border transition-colors",
                          selectedProvider === p
                            ? "bg-ocean-blue text-white border-ocean-blue"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700 mb-2 block">Amount</label>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[100, 200, 500, 1000].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setAmountInput(String(v))}
                        className={cn(
                          "py-2 rounded-xl text-xs font-extrabold border transition-colors",
                          Number(amountInput) === v
                            ? "bg-slate-900 text-white border-slate-900"
                            : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                        )}
                      >
                        ₱{v}
                      </button>
                    ))}
                  </div>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-extrabold text-slate-400">₱</span>
                    <input
                      value={amountInput}
                      onChange={e => setAmountInput(e.target.value)}
                      inputMode="numeric"
                      className="w-full pl-9 pr-4 py-3 bg-slate-50 rounded-xl border border-slate-200 outline-none focus:border-ocean-blue font-extrabold text-lg"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full bg-ocean-blue text-white font-bold py-4 rounded-xl mb-3"
                onClick={handleCashMovement}
              >
                Continue
              </button>
              <button 
                className="w-full text-slate-500 font-bold py-2"
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Merchant Dashboard ---

function MerchantDashboard({ profile }: { profile: UserProfile }) {
  const [merchantData, setMerchantData] = useState<any>(null);
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    setMerchantData(storage.getMerchant(profile.uid));
  }, [profile.uid]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Merchant Panel</h1>
          <p className="text-sm text-slate-500">{merchantData?.businessName}</p>
        </div>
        <button className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
          <Settings size={20} />
        </button>
      </div>

      {/* Sales Card */}
      <div className="bg-slate-900 p-8 rounded-[32px] text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10">
          <BarChart3 size={120} />
        </div>
        <p className="text-white/60 text-sm mb-1">Total Sales Today</p>
        <h2 className="text-4xl font-bold mb-8">₱{merchantData?.totalSalesToday?.toLocaleString() || '0'}</h2>
        <div className="flex gap-4">
          <button onClick={() => setShowQr(true)} className="flex-1 bg-ocean-blue py-3 rounded-xl flex items-center justify-center gap-2 font-bold">
            <QrCode size={18} />
            Show QR
          </button>
          <button className="flex-1 bg-white/10 py-3 rounded-xl flex items-center justify-center gap-2 font-bold">
            <ArrowUpRight size={18} />
            Withdraw
          </button>
        </div>
      </div>

      {/* Incoming Payments */}
      <div>
        <h3 className="text-lg font-bold mb-4">Incoming Payments</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border-l-4 border-emerald-500">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                <CheckCircle2 size={20} />
              </div>
              <div>
                <p className="font-bold">Payment from Mark</p>
                <p className="text-xs text-slate-500">2 mins ago</p>
              </div>
            </div>
            <p className="font-bold text-emerald-600">+₱450</p>
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <AnimatePresence>
        {showQr && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full rounded-[40px] p-8 flex flex-col items-center text-center"
            >
              <div className="w-full flex justify-end mb-2">
                <button onClick={() => setShowQr(false)} className="text-slate-400"><X size={24} /></button>
              </div>
              <h3 className="text-xl font-bold mb-1">{merchantData?.businessName}</h3>
              <p className="text-sm text-slate-500 mb-8">Scan to pay instantly</p>
              
              <div className="p-6 bg-slate-50 rounded-[32px] mb-8">
                <QRCodeSVG value={profile.uid} size={200} />
              </div>

              <div className="flex gap-2 w-full">
                <button className="flex-1 bg-slate-100 py-4 rounded-2xl font-bold text-slate-600">Static QR</button>
                <button className="flex-1 bg-ocean-blue py-4 rounded-2xl font-bold text-white">Dynamic QR</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// --- Admin Dashboard ---

function AdminDashboard({ profile }: { profile: UserProfile }) {
  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'transactions' | 'merchants' | 'bookings'>('overview');
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [merchants, setMerchants] = useState<Merchant[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Load all users from local storage (admin can see all)
        const allUsers = storage.getUsers();
        setUsers(allUsers);

        // Load all transactions (admin sees everything)
        const allTransactions = storage.get(KEYS.TRANSACTIONS, []);
        setTransactions(allTransactions);

        // Load merchants
        const allMerchants = storage.get(KEYS.MERCHANTS, []);
        setMerchants(allMerchants);

        // Load bookings
        const allBookings = await storage.getBookingsRemote();
        setBookings(allBookings);
      } catch (error) {
        console.error('Error loading admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const totalRevenue = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUsers = users.length;
  const totalMerchants = merchants.length;
  const totalBookings = bookings.length;

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-ocean-blue border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <Shield size={20} />
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-2 overflow-x-auto">
        {[
          { id: 'overview', label: 'Overview', icon: <BarChart3 size={16} /> },
          { id: 'users', label: 'Users', icon: <Users size={16} /> },
          { id: 'transactions', label: 'Transactions', icon: <ArrowUpRight size={16} /> },
          { id: 'merchants', label: 'Merchants', icon: <Store size={16} /> },
          { id: 'bookings', label: 'Bookings', icon: <CalendarDays size={16} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSection(tab.id as any)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 whitespace-nowrap transition-all",
              activeSection === tab.id
                ? "bg-ocean-blue text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            )}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Section */}
      {activeSection === 'overview' && (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-[24px] p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-ocean-blue/10 rounded-full flex items-center justify-center">
                  <Users className="text-ocean-blue" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Total Users</p>
                  <p className="text-2xl font-extrabold">{totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Wallet className="text-green-500" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Total Revenue</p>
                  <p className="text-2xl font-extrabold text-green-500">₱{totalRevenue.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center">
                  <Store className="text-purple-500" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Merchants</p>
                  <p className="text-2xl font-extrabold">{totalMerchants}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-[24px] p-6 border border-slate-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-500/10 rounded-full flex items-center justify-center">
                  <CalendarDays className="text-orange-500" size={20} />
                </div>
                <div>
                  <p className="text-xs text-slate-500 uppercase font-bold">Bookings</p>
                  <p className="text-2xl font-extrabold">{totalBookings}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-extrabold">Recent Activity</h3>
              <p className="text-sm text-slate-500">Latest transactions and bookings</p>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {[...transactions.slice(0, 5), ...bookings.slice(0, 3)].sort((a, b) =>
                new Date(b.timestamp || b.createdAt).getTime() - new Date(a.timestamp || a.createdAt).getTime()
              ).map((item: any) => (
                <div key={item.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      {item.amount ? <ArrowUpRight size={16} className="text-green-500" /> : <CalendarDays size={16} className="text-orange-500" />}
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">
                        {item.amount ? `₱${item.amount.toLocaleString()}` : `Booking: ${item.resortName}`}
                      </p>
                      <p className="text-xs text-slate-500">
                        {item.fromUid ? `${item.fromUid} → ${item.toUid}` : item.userName} • {new Date(item.timestamp || item.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Users Section */}
      {activeSection === 'users' && (
        <div className="space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-extrabold">User Management</h3>
                <p className="text-sm text-slate-500">All registered users and their transaction activity</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-400 uppercase font-bold">Total Users</p>
                <p className="text-lg font-extrabold text-ocean-blue">{totalUsers}</p>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {users.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <p className="font-bold">No users yet</p>
                  <p className="text-xs">Users will appear here after they register.</p>
                </div>
              ) : (
                users.map(user => {
                  const userTransactions = transactions.filter(t => t.fromUid === user.uid || t.toUid === user.uid);
                  const totalSpent = userTransactions
                    .filter(t => t.fromUid === user.uid && t.type === 'payment')
                    .reduce((sum, t) => sum + t.amount, 0);
                  const totalReceived = userTransactions
                    .filter(t => t.toUid === user.uid && t.type === 'payment')
                    .reduce((sum, t) => sum + t.amount, 0);

                  return (
                    <div key={user.uid} className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                            <UserIcon size={24} className="text-slate-400" />
                          </div>
                          <div>
                            <p className="font-extrabold text-slate-900">{user.fullName}</p>
                            <p className="text-xs text-slate-500">@{user.username} • {user.email}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className={cn(
                                "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                                user.role === 'admin' ? "bg-red-100 text-red-600" :
                                user.role === 'merchant' ? "bg-purple-100 text-purple-600" :
                                "bg-blue-100 text-blue-600"
                              )}>
                                {user.role}
                              </span>
                              <span className="text-xs text-slate-500">Balance: ₱{user.balance.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-400">Joined</p>
                          <p className="text-xs font-bold">{new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {/* User Statistics */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        <div className="bg-slate-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-slate-500 uppercase font-bold">Transactions</p>
                          <p className="text-lg font-extrabold text-slate-900">{userTransactions.length}</p>
                        </div>
                        <div className="bg-green-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-green-600 uppercase font-bold">Spent</p>
                          <p className="text-lg font-extrabold text-green-600">₱{totalSpent.toLocaleString()}</p>
                        </div>
                        <div className="bg-blue-50 rounded-xl p-3 text-center">
                          <p className="text-xs text-blue-600 uppercase font-bold">Received</p>
                          <p className="text-lg font-extrabold text-blue-600">₱{totalReceived.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* Recent Transactions */}
                      {userTransactions.length > 0 && (
                        <div>
                          <p className="text-sm font-bold text-slate-700 mb-2">Recent Transactions</p>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {userTransactions.slice(0, 3).map(tx => (
                              <div key={tx.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                                <div className="flex items-center gap-2">
                                  <ArrowUpRight size={14} className={cn(
                                    tx.type === 'payment' ? "text-green-500" :
                                    tx.type === 'cash-in' ? "text-blue-500" :
                                    "text-red-500"
                                  )} />
                                  <div>
                                    <p className="text-xs font-bold text-slate-900">
                                      {tx.type === 'payment' ? (tx.fromUid === user.uid ? 'Paid' : 'Received') :
                                       tx.type === 'cash-in' ? 'Cash In' : 'Withdrawal'}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {tx.fromUid === user.uid ? `to ${tx.toUid}` : `from ${tx.fromUid}`}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-xs font-bold text-slate-900">₱{tx.amount.toLocaleString()}</p>
                                  <p className="text-xs text-slate-400">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Transactions Section */}
      {activeSection === 'transactions' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold">Transaction Monitoring</h3>
              <p className="text-sm text-slate-500">All transactions across the platform</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Total Volume</p>
              <p className="text-lg font-extrabold text-green-500">₱{totalRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {transactions.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="font-bold">No transactions yet</p>
                <p className="text-xs">Transactions will appear here as users make payments.</p>
              </div>
            ) : (
              transactions.map(tx => (
                <div key={tx.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
                      <ArrowUpRight size={16} className={cn(
                        tx.type === 'payment' ? "text-green-500" :
                        tx.type === 'cash-in' ? "text-blue-500" :
                        "text-red-500"
                      )} />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">₱{tx.amount.toLocaleString()}</p>
                      <p className="text-xs text-slate-500">
                        {tx.fromUid} → {tx.toUid} • {tx.type}
                      </p>
                      {tx.description && (
                        <p className="text-xs text-slate-400">{tx.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">{tx.status}</p>
                    <p className="text-xs font-bold">{new Date(tx.timestamp).toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Merchants Section */}
      {activeSection === 'merchants' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold">Merchant Management</h3>
              <p className="text-sm text-slate-500">Registered merchants and their performance</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Total Merchants</p>
              <p className="text-lg font-extrabold text-purple-500">{totalMerchants}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {merchants.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="font-bold">No merchants yet</p>
                <p className="text-xs">Merchants will appear here after they register.</p>
              </div>
            ) : (
              merchants.map(merchant => (
                <div key={merchant.uid} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <Store size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{merchant.businessName}</p>
                      <p className="text-xs text-slate-500">{merchant.location}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={cn(
                          "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                          merchant.isVerified ? "bg-green-100 text-green-600" : "bg-yellow-100 text-yellow-600"
                        )}>
                          {merchant.isVerified ? "Verified" : "Pending"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Today's Sales</p>
                    <p className="text-sm font-bold">₱{merchant.totalSalesToday.toLocaleString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Bookings Section */}
      {activeSection === 'bookings' && (
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold">Booking Oversight</h3>
              <p className="text-sm text-slate-500">All resort bookings and reservations</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 uppercase font-bold">Total Bookings</p>
              <p className="text-lg font-extrabold text-orange-500">{totalBookings}</p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {bookings.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="font-bold">No bookings yet</p>
                <p className="text-xs">Bookings will appear here after users confirm a resort booking.</p>
              </div>
            ) : (
              bookings.map(booking => (
                <div key={booking.id} className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <CalendarDays size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{booking.userName}</p>
                      <p className="text-xs text-slate-500">
                        {booking.resortName} • {booking.guests} guest{booking.guests !== 1 ? 's' : ''}
                      </p>
                      <p className="text-xs text-slate-400">
                        {new Date(booking.checkIn).toLocaleDateString()} - {new Date(booking.checkOut).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-ocean-blue">₱{booking.amount.toLocaleString()}</p>
                    <p className="text-xs text-slate-400">{new Date(booking.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Profile Screen ---

function ProfileScreen({ profile, onLogout, onNavigate }: { profile: UserProfile; onLogout: () => void; onNavigate: (tab: string) => void }) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">My Profile</h1>
        <button onClick={onLogout} className="text-red-500"><LogOut size={20} /></button>
      </div>

      <div className="flex flex-col items-center text-center py-8">
        <div className="w-24 h-24 bg-slate-100 rounded-[32px] flex items-center justify-center mb-4 relative">
          <UserIcon size={48} className="text-slate-300" />
          <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-ocean-blue text-white rounded-full border-4 border-white flex items-center justify-center">
            <Camera size={14} />
          </button>
        </div>
        <h2 className="text-xl font-bold">{profile.fullName}</h2>
        <p className="text-slate-500 text-sm">@{profile.username}</p>
        <div className="mt-2 px-3 py-1 bg-ocean-blue/10 text-ocean-blue text-[10px] font-bold uppercase tracking-widest rounded-full">
          {profile.role}
        </div>
      </div>

      <div className="space-y-2">
        <ProfileItem icon={<Settings />} label="Account Settings" onClick={() => onNavigate('account-settings')} />
        <ProfileItem icon={<Shield />} label="Security & Privacy" onClick={() => onNavigate('security-privacy')} />
        <ProfileItem icon={<Bell />} label="Notifications" onClick={() => onNavigate('notifications-settings')} />
        <ProfileItem icon={<History />} label="Transaction History" onClick={() => onNavigate('transactions')} />
      </div>
    </div>
  );
}

function ProfileItem({ icon, label, onClick }: { icon: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className="w-full p-4 bg-slate-50 rounded-2xl flex items-center justify-between hover:bg-slate-100 transition-all"
    >
      <div className="flex items-center gap-4">
        <div className="text-slate-400">{icon}</div>
        <span className="font-bold text-slate-700">{label}</span>
      </div>
      <ArrowUpRight size={18} className="text-slate-300" />
    </button>
  );
}

function AccountSettingsScreen({ profile, onBack, onProfileUpdated }: { profile: UserProfile; onBack: () => void; onProfileUpdated: (u: UserProfile) => void }) {
  const [fullName, setFullName] = useState(profile.fullName);
  const [username, setUsername] = useState(profile.username);

  const save = () => {
    const next: UserProfile = { ...profile, fullName: fullName.trim(), username: username.trim() };
    storage.saveUser(next);
    storage.setCurrentUser(next);
    if (next.uid !== 'admin') void storage.updateUserRemote(next.uid, { fullName: next.fullName, username: next.username }).catch(() => {});
    onProfileUpdated(next);
    alert('Account updated.');
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-extrabold">Account Settings</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Full Name</label>
            <input
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700 mb-2 block">Username</label>
            <input
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
            />
          </div>
        </div>

        <button
          onClick={save}
          className="w-full bg-ocean-blue text-white py-4 rounded-2xl font-extrabold text-lg hover:bg-ocean-blue/90 transition-all active:scale-95"
        >
          Save Changes
        </button>
      </div>
    </div>
  );
}

function SecurityPrivacyScreen({ uid, onBack }: { uid: string; onBack: () => void }) {
  const key = `shorepay_security_${uid}`;
  const [settings, setSettings] = useState(() =>
    storage.get(key, { biometrics: false, twoFactor: false, hideBalance: false })
  );

  useEffect(() => {
    storage.set(key, settings);
  }, [key, settings]);

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-extrabold">Security & Privacy</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {[
          { k: 'biometrics', title: 'Biometrics', desc: 'Use fingerprint/Face ID when available.' },
          { k: 'twoFactor', title: 'Two-Factor Authentication', desc: 'Extra protection on sign-in.' },
          { k: 'hideBalance', title: 'Hide Balance', desc: 'Mask your wallet balance on screen.' },
        ].map((row: any) => (
          <button
            key={row.k}
            onClick={() => setSettings((s: any) => ({ ...s, [row.k]: !s[row.k] }))}
            className="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div className="text-left">
              <p className="font-extrabold text-slate-900">{row.title}</p>
              <p className="text-sm text-slate-500">{row.desc}</p>
            </div>
            <div className={cn(
              "w-12 h-7 rounded-full p-1 transition-colors",
              settings[row.k] ? "bg-ocean-blue" : "bg-slate-200"
            )}>
              <div className={cn(
                "w-5 h-5 bg-white rounded-full transition-transform",
                settings[row.k] ? "translate-x-5" : "translate-x-0"
              )} />
            </div>
          </button>
        ))}

        <button
          onClick={() => alert('Password change coming soon!')}
          className="w-full bg-slate-900 text-white py-4 rounded-2xl font-extrabold hover:bg-slate-800 transition-all active:scale-95"
        >
          Change Password
        </button>
      </div>
    </div>
  );
}

function NotificationsSettingsScreen({ uid, onBack }: { uid: string; onBack: () => void }) {
  const key = `shorepay_notifications_${uid}`;
  const [settings, setSettings] = useState(() =>
    storage.get(key, { marketing: false, payments: true, promos: true, security: true })
  );

  useEffect(() => {
    storage.set(key, settings);
  }, [key, settings]);

  const rows = [
    { k: 'payments', title: 'Payments', desc: 'Payment confirmations and receipts.' },
    { k: 'security', title: 'Security Alerts', desc: 'Login and device activity alerts.' },
    { k: 'promos', title: 'Promos', desc: 'Resort and merchant promotions.' },
    { k: 'marketing', title: 'Marketing', desc: 'Product updates and news.' },
  ];

  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-6 border-b border-slate-100 sticky top-0 z-10 flex items-center gap-4">
        <button 
          onClick={onBack}
          className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
        >
          <ArrowLeft size={20} className="text-slate-600" />
        </button>
        <h1 className="text-xl font-extrabold">Notifications</h1>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {rows.map(row => (
          <button
            key={row.k}
            onClick={() => setSettings((s: any) => ({ ...s, [row.k]: !s[row.k] }))}
            className="w-full bg-white p-5 rounded-3xl border border-slate-100 shadow-sm flex items-center justify-between"
          >
            <div className="text-left">
              <p className="font-extrabold text-slate-900">{row.title}</p>
              <p className="text-sm text-slate-500">{row.desc}</p>
            </div>
            <div className={cn(
              "w-12 h-7 rounded-full p-1 transition-colors",
              settings[row.k] ? "bg-ocean-blue" : "bg-slate-200"
            )}>
              <div className={cn(
                "w-5 h-5 bg-white rounded-full transition-transform",
                settings[row.k] ? "translate-x-5" : "translate-x-0"
              )} />
            </div>
          </button>
        ))}

        <button
          onClick={() => {
            setSettings({ marketing: false, payments: false, promos: false, security: false });
            alert('All notifications disabled.');
          }}
          className="w-full bg-slate-100 text-slate-700 py-4 rounded-2xl font-extrabold hover:bg-slate-200 transition-colors active:scale-95"
        >
          Disable All
        </button>
      </div>
    </div>
  );
}

// --- Resort List Screen ---

function ResortListScreen({ onNavigate, onSelect }: { onNavigate: (tab: string) => void; onSelect: (resort: Resort) => void }) {
  return (
    <div className="h-full flex flex-col bg-slate-50">
      <div className="bg-white p-6 pb-4 border-b border-slate-100 sticky top-0 z-10">
        <div className="flex items-center gap-4 mb-4">
          <button 
            onClick={() => onNavigate('home')}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={20} className="text-slate-600" />
          </button>
          <h1 className="text-2xl font-bold">Resorts</h1>
        </div>
        
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            placeholder="Search resorts..."
            className="w-full bg-slate-100 border-none rounded-2xl py-3 pl-12 pr-4 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-ocean-blue/20"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {MOCK_RESORTS.map(resort => (
          <div key={resort.id} className="bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="relative h-48">
              <img 
                src={resort.imageUrl} 
                alt={resort.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
              <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full flex items-center gap-1 text-xs font-bold shadow-sm">
                <span className="text-orange-500">★</span>
                <span>{resort.rating}</span>
              </div>
            </div>
            <div className="p-5">
              <h3 className="text-lg font-bold mb-1">{resort.name}</h3>
              <div className="flex items-center gap-1 text-slate-500 text-sm mb-3">
                <MapPin size={14} />
                <span>{resort.location}</span>
              </div>
              <p className="text-slate-600 text-sm line-clamp-2 mb-4">{resort.description}</p>
              <button 
                onClick={() => onSelect(resort)}
                className="w-full bg-ocean-blue/10 text-ocean-blue font-bold py-3 rounded-xl hover:bg-ocean-blue hover:text-white transition-colors"
              >
                View Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
