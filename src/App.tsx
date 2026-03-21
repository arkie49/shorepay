/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Copy,
  Eye,
  EyeOff,
  RefreshCcw,
  Download,
  SlidersHorizontal,
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
import { type Booking, type Customer, type Merchant, type UserProfile, type Transaction, type Resort, type UserRole } from './types';

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

const RESORT_CONTACTS: Record<string, { phone?: string; email?: string; facebook?: string }> = {
  '1': {},
  '2': {},
  '3': {},
};

// --- Resort Detail Screen ---

function ResortDetailScreen({ resort, profile, onBack }: { resort: Resort; profile: UserProfile; onBack: () => void }) {
  const [isFavorite, setIsFavorite] = useState(false);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingReceipt, setBookingReceipt] = useState<Booking | null>(null);
  const [guests, setGuests] = useState(2);
  const [provider, setProvider] = useState<'GCash' | 'Maya' | 'Card' | null>(null);
  const [checkIn, setCheckIn] = useState('');
  const [checkOut, setCheckOut] = useState('');
  const [showAllGallery, setShowAllGallery] = useState(false);
  const [customerForm, setCustomerForm] = useState<Record<string, string>>({});

  const availableRooms = useMemo(() => {
    const rooms = resort.rooms ?? [];
    return rooms.map((room) => ({
      ...room,
      pricePerNight: room.pricePerNight,
    }));
  }, [resort.rooms]);

  const [selectedRoomId, setSelectedRoomId] = useState<string>(availableRooms[0]?.id ?? '');

  useEffect(() => {
    if (availableRooms.length > 0) {
      setSelectedRoomId(availableRooms[0].id);
    }
  }, [availableRooms]);

  const selectedRoom = useMemo(() => {
    return availableRooms.find((room) => room.id === selectedRoomId) ?? availableRooms[0] ?? { id: 'default', name: 'Standard Room', pricePerNight: 500, maxGuests: 2, description: 'Budget-friendly standard room.', imageUrl: resort.imageUrl };
  }, [availableRooms, selectedRoomId]);

  const gallery = RESORT_GALLERIES[resort.id] ?? [resort.imageUrl];
  const mapQuery = `${resort.name}, ${resort.location}, Roxas`;
  const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(mapQuery)}&output=embed`;
  const [contact, setContact] = useState(RESORT_CONTACTS[resort.id] ?? {});
  const resortQrValue = `shorepay://resort?resortId=${encodeURIComponent(resort.id)}`;

  useEffect(() => {
    setContact(RESORT_CONTACTS[resort.id] ?? {});
    void storage.getResortContactRemote(resort.id).then((remote) => {
      if (!remote) return;
      setContact(remote);
    });
  }, [resort.id]);

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
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-slate-900">Choose a room</h2>
            <span className="text-xs font-bold text-ocean-blue bg-ocean-blue/10 px-3 py-1 rounded-full uppercase tracking-wider">
              {availableRooms.length} options
            </span>
          </div>
          
          <div className="flex flex-col gap-4">
            {availableRooms.map((room) => (
              <button
                key={room.id}
                onClick={() => setSelectedRoomId(room.id)}
                className={cn(
                  'group relative overflow-hidden rounded-[2rem] border-2 transition-all duration-300',
                  selectedRoomId === room.id
                    ? 'border-ocean-blue bg-white shadow-xl shadow-ocean-blue/10'
                    : 'border-slate-100 bg-white hover:border-ocean-blue/30 hover:shadow-lg'
                )}
              >
                <div className="flex flex-col sm:flex-row h-full">
                  <div className="relative h-48 sm:h-auto sm:w-40 overflow-hidden">
                    <img
                      src={room.imageUrl ?? resort.imageUrl}
                      alt={room.name}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent sm:hidden" />
                    <div className="absolute bottom-3 left-4 text-white sm:hidden">
                      <p className="font-extrabold text-lg">{room.name}</p>
                    </div>
                  </div>

                  <div className="flex-1 p-5 flex flex-col justify-between text-left">
                    <div>
                      <div className="hidden sm:flex items-center justify-between mb-1">
                        <h3 className="font-extrabold text-lg text-slate-900">{room.name}</h3>
                        {selectedRoomId === room.id && (
                          <div className="bg-ocean-blue rounded-full p-1 text-white">
                            <CheckCircle2 size={16} />
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 mb-3">{room.description}</p>
                      
                      <div className="flex items-center gap-4 text-slate-600">
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl">
                          <Users size={14} className="text-ocean-blue" />
                          <span className="text-xs font-bold">{room.maxGuests} Guests</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-xl">
                          <Shield size={14} className="text-ocean-blue" />
                          <span className="text-xs font-bold">Included</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 flex items-end justify-between border-t border-slate-50 pt-4">
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Price per night</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-2xl font-black text-ocean-blue">₱{room.pricePerNight.toLocaleString()}</span>
                        </div>
                      </div>
                      {selectedRoomId === room.id ? (
                        <div className="flex items-center gap-2 text-ocean-blue font-bold text-sm bg-ocean-blue/5 px-4 py-2 rounded-2xl">
                          <CheckCircle2 size={18} />
                          Selected
                        </div>
                      ) : (
                        <div className="text-slate-400 font-bold text-sm group-hover:text-ocean-blue transition-colors">
                          Select Room
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-ocean-blue/5 rounded-[2.5rem] p-6 border border-ocean-blue/10">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-sm">
              <CalendarDays className="text-ocean-blue" size={24} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-ocean-blue/60">Booking Details</p>
              <p className="font-extrabold text-slate-900">Standard Check-in Policy</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Check-in</p>
              <p className="text-lg font-extrabold text-slate-900">2:00 PM</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-4">
              <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400 mb-1">Check-out</p>
              <p className="text-lg font-extrabold text-slate-900">12:00 NN</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-extrabold mb-2">About</h2>
          <p className="text-slate-600 leading-relaxed">
            {resort.description} Experience the ultimate relaxation with premium amenities, world-class service, and breathtaking coastal views.
          </p>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-extrabold">Resort QR</h2>
            <p className="text-sm text-slate-500">Use this QR to identify this resort inside ShorePay.</p>
          </div>
          <div className="p-6 flex items-center gap-6">
            <div className="p-4 bg-slate-50 rounded-[28px] border border-slate-100">
              <QRCodeSVG value={resortQrValue} size={140} />
            </div>
            <div className="flex-1">
              <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Resort ID</p>
              <p className="font-extrabold text-slate-900 break-all">{resort.id}</p>
              <p className="text-xs text-slate-500 mt-2">Scanable in the app for resort-exclusive booking lists.</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-lg font-extrabold mb-2">Contact</h2>
          {contact.phone || contact.email || contact.facebook ? (
            <div className="space-y-3">
              {contact.phone && (
                <a href={`tel:${contact.phone}`} className="block w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Phone</p>
                  <p className="font-extrabold text-slate-900">{contact.phone}</p>
                </a>
              )}
              {contact.email && (
                <a href={`mailto:${contact.email}`} className="block w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Email</p>
                  <p className="font-extrabold text-slate-900 break-all">{contact.email}</p>
                </a>
              )}
              {contact.facebook && (
                <a href={contact.facebook} target="_blank" rel="noreferrer" className="block w-full bg-slate-50 border border-slate-100 rounded-2xl p-4">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Facebook</p>
                  <p className="font-extrabold text-slate-900 break-all">{contact.facebook}</p>
                </a>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-500">Contact details are not set for this resort yet.</p>
          )}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <h2 className="text-lg font-extrabold">Location</h2>
            <p className="text-sm text-slate-500">{mapQuery}</p>
          </div>
          <div className="aspect-[16/10] bg-slate-50">
            <iframe
              title={`Google Map - ${resort.name}`}
              src={mapSrc}
              className="w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
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
                {/* Registration Form */}
                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <div className="flex items-center gap-2 text-slate-700 font-bold mb-3">
                    <UserIcon size={18} className="text-ocean-blue" />
                    Registration Details
                  </div>
                  <div className="space-y-3">
                    {(resort.registrationFields || []).map(field => (
                      <div key={field}>
                        <label className="block text-sm font-bold text-slate-700 mb-1 capitalize">
                          {field.replace(/([A-Z])/g, ' $1').trim()}
                        </label>
                        {field === 'checkIn' || field === 'checkOut' ? (
                          <input
                            type="date"
                            value={field === 'checkIn' ? checkIn : checkOut}
                            onChange={e => {
                              if (field === 'checkIn') setCheckIn(e.target.value);
                              else setCheckOut(e.target.value);
                            }}
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-ocean-blue font-bold"
                            required
                          />
                        ) : field === 'guests' ? (
                          <div className="flex items-center gap-3">
                            <button
                              onClick={() => setGuests(g => Math.max(1, g - 1))}
                              className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100"
                            >
                              <Minus size={16} />
                            </button>
                            <span className="flex-1 text-center font-extrabold">{guests}</span>
                            <button
                              onClick={() => setGuests(g => Math.min(10, g + 1))}
                              className="w-10 h-10 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-700 hover:bg-slate-100"
                            >
                              <Plus size={16} />
                            </button>
                          </div>
                        ) : (
                          <input
                            type={field === 'email' ? 'email' : field === 'phone' ? 'tel' : 'text'}
                            value={customerForm[field] || ''}
                            onChange={e => setCustomerForm(prev => ({ ...prev, [field]: e.target.value }))}
                            className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-ocean-blue font-bold"
                            placeholder={`Enter ${field}`}
                            required
                          />
                        )}
                      </div>
                    ))}
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
                onClick={async () => {
                  if (!provider) {
                    alert('Select a payment method.');
                    return;
                  }
                  if (!checkIn || !checkOut) {
                    alert('Select check-in and check-out dates.');
                    return;
                  }

                  // Validate required fields
                  const requiredFields = resort.registrationFields || [];
                  for (const field of requiredFields) {
                    if (field !== 'checkIn' && field !== 'checkOut' && field !== 'guests' && !customerForm[field]?.trim()) {
                      alert(`Please fill in ${field}.`);
                      return;
                    }
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

                  const amount = nights * selectedRoom.pricePerNight;

                  // Create customer record
                  const customer: Customer = {
                    id: Math.random().toString(36).substring(7),
                    resortId: resort.id,
                    roomId: selectedRoom.id,
                    roomName: selectedRoom.name,
                    pricePerNight: selectedRoom.pricePerNight,
                    fullName: customerForm.fullName || profile.fullName,
                    email: customerForm.email || profile.email,
                    phone: customerForm.phone || '',
                    address: customerForm.address || '',
                    checkIn,
                    checkOut,
                    guests,
                    paymentMethod: provider,
                    amount,
                    createdAt: new Date().toISOString(),
                    status: 'confirmed'
                  };

                  try {
                    await storage.addCustomerRemote(customer);
                    
                    // Also create a booking for the user's history
                    const booking = storage.addBooking({
                      userUid: profile.uid,
                      userName: profile.fullName,
                      resortId: resort.id,
                      resortName: resort.name,
                      roomId: selectedRoom.id,
                      roomName: selectedRoom.name,
                      pricePerNight: selectedRoom.pricePerNight,
                      checkIn,
                      checkOut,
                      guests,
                      provider,
                      amount,
                      createdAt: new Date().toISOString(),
                    });
                    void storage.addBookingRemote(booking).catch(() => {});

                    setShowBooking(false);
                    setBookingReceipt(booking);
                    setCustomerForm({}); // Reset form
                  } catch (error) {
                    alert('Failed to complete booking. Please try again.');
                  }
                }}
                className="w-full mt-6 bg-ocean-blue text-white py-4 rounded-2xl font-extrabold text-lg hover:bg-ocean-blue/90 transition-all active:scale-95"
              >
                Confirm Booking
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {bookingReceipt && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[130] bg-black/60 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold">Booking Confirmed</h3>
                <button
                  onClick={() => setBookingReceipt(null)}
                  className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100 mb-4">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Resort</p>
                <p className="text-lg font-extrabold text-slate-900">{bookingReceipt.resortName}</p>
                <p className="text-sm text-slate-500 mt-1">
                  {new Date(bookingReceipt.checkIn).toLocaleDateString()} - {new Date(bookingReceipt.checkOut).toLocaleDateString()} • {bookingReceipt.guests} guest{bookingReceipt.guests !== 1 ? 's' : ''}
                </p>
                <p className="text-sm text-slate-500 mt-1">Paid via {bookingReceipt.provider}</p>
                <p className="text-xl font-extrabold text-ocean-blue mt-3">₱{bookingReceipt.amount.toLocaleString()}</p>
              </div>

              <div className="bg-white rounded-3xl border border-slate-100 overflow-hidden mb-4">
                <div className="p-5 border-b border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest">Booking QR</p>
                  <p className="text-sm text-slate-500">Show this at the resort for verification.</p>
                </div>
                <div className="p-6 flex items-center justify-center">
                  <div className="p-4 bg-slate-50 rounded-[28px] border border-slate-100">
                    <QRCodeSVG value={`shorepay://booking?bookingId=${encodeURIComponent(bookingReceipt.id)}&resortId=${encodeURIComponent(bookingReceipt.resortId)}`} size={170} />
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-5 border border-slate-100">
                <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Resort Contact</p>
                {contact.phone || contact.email || contact.facebook ? (
                  <div className="space-y-2">
                    {contact.phone && <p className="text-sm font-bold text-slate-900">Phone: {contact.phone}</p>}
                    {contact.email && <p className="text-sm font-bold text-slate-900 break-all">Email: {contact.email}</p>}
                    {contact.facebook && <p className="text-sm font-bold text-slate-900 break-all">Facebook: {contact.facebook}</p>}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">No contact details provided.</p>
                )}
              </div>
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
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const updateCustomerStatus = useCallback(async (customerId: string, status: Customer['status']) => {
    try {
      const currentResortAdmin = storage.getCurrentResortAdmin();
      const resortId = currentResortAdmin?.resortId || '';
      await storage.updateCustomerStatusRemote(resortId, customerId, status);
      setSelectedCustomer((prev) => prev && prev.id === customerId ? { ...prev, status } : prev);
    } catch (error) {
      console.error(error);
      alert('Failed to update customer status');
    }
  }, []);

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
            <p className={cn(
              "font-bold",
              tx.type === 'cash-in' ? "text-emerald-600" : "text-slate-900"
            )}>
              {(tx.type === 'cash-in' ? '+' : tx.type === 'withdraw' ? '-' : tx.fromUid === profile.uid ? '-' : '+')}₱{tx.amount.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      <AnimatePresence>
        {selectedCustomer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Booking Details</h3>
                  <p className="text-sm text-slate-500 font-medium">Ref: {selectedCustomer.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer Name</p>
                    <p className="text-lg font-extrabold text-slate-900">{selectedCustomer.fullName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Status</p>
                    <span className={cn(
                      "inline-block px-3 py-1 text-xs font-bold uppercase tracking-widest rounded-full",
                      selectedCustomer.status === 'confirmed' ? "bg-green-100 text-green-700" :
                      selectedCustomer.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                      "bg-red-100 text-red-700"
                    )}>
                      {selectedCustomer.status}
                    </span>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Email Address</p>
                    <p className="font-bold text-slate-700">{selectedCustomer.email}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Phone Number</p>
                    <p className="font-bold text-slate-700">{selectedCustomer.phone}</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[32px] p-6 space-y-6 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Room Selection</p>
                      <p className="font-extrabold text-slate-900 text-lg">{selectedCustomer.roomName || 'Standard Room'}</p>
                    </div>
                    <div className="text-right space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Total Guests</p>
                      <p className="font-extrabold text-slate-900 text-lg">{selectedCustomer.guests} Persons</p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-200/50" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Check-In</p>
                      <p className="font-bold text-slate-700">{new Date(selectedCustomer.checkIn).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Check-Out</p>
                      <p className="font-bold text-slate-700">{new Date(selectedCustomer.checkOut).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-end p-2">
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Payment Method</p>
                    <p className="font-extrabold text-slate-700 uppercase tracking-tighter">{selectedCustomer.paymentMethod}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                    <p className="text-3xl font-black text-ocean-blue">₱{selectedCustomer.amount.toLocaleString()}</p>
                  </div>
                </div>

                {selectedCustomer.address && (
                  <div className="space-y-1 p-2">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Billing Address</p>
                    <p className="font-medium text-slate-600 leading-relaxed">{selectedCustomer.address}</p>
                  </div>
                )}
              </div>

              <div className="p-8 bg-slate-50 flex gap-4">
                <button
                  onClick={() => setSelectedCustomer(null)}
                  className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl font-bold text-slate-600 hover:bg-slate-100 transition-all active:scale-95"
                >
                  Close
                </button>
                {selectedCustomer.status === 'pending' && (
                  <button
                    onClick={() => {
                      updateCustomerStatus(selectedCustomer.id, 'confirmed');
                      setSelectedCustomer(null);
                    }}
                    className="flex-1 py-4 bg-green-500 text-white rounded-2xl font-bold hover:bg-green-600 transition-all shadow-lg shadow-green-200 active:scale-95"
                  >
                    Confirm Booking
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
  { 
    id: '1', 
    name: 'Jc Infinity', 
    imageUrl: '/assets/JC infinity.png', 
    description: 'Luxury beachfront', 
    location: 'Dangay', 
    rating: 4.8,
    rooms: [
      { id: '1-1', name: 'Standard Room', pricePerNight: 850, maxGuests: 2, description: 'Cozy and affordable stay.', imageUrl: '/assets/infinity gallery 1.jpg' },
      { id: '1-2', name: 'Deluxe Room', pricePerNight: 1650, maxGuests: 3, description: 'Premium view and amenities.', imageUrl: '/assets/infinity gallery 2.jpg' },
      { id: '1-3', name: 'Infinity Suite', pricePerNight: 2450, maxGuests: 4, description: 'The ultimate luxury experience.', imageUrl: '/assets/infinity gallery 3.jpg' },
    ]
  },
  { 
    id: '2', 
    name: 'Kamayan Penthouse', 
    imageUrl: '/assets/kamayan.png', 
    description: 'Traditional vibes', 
    location: 'Roxas', 
    rating: 4.5,
    rooms: [
      { id: '2-1', name: 'Bahay Kubo', pricePerNight: 750, maxGuests: 2, description: 'Traditional Filipino experience.', imageUrl: '/assets/kamayan gallery 1.jpg' },
      { id: '2-2', name: 'Native Villa', pricePerNight: 1450, maxGuests: 4, description: 'Spacious native-style villa.', imageUrl: '/assets/kamayan gallery 2.jpg' },
      { id: '2-3', name: 'Penthouse Suite', pricePerNight: 2250, maxGuests: 6, description: 'Top-floor luxury with panoramic views.', imageUrl: '/assets/kamayanan gallery 3.jpg' },
    ]
  },
  { 
    id: '3', 
    name: 'La Primera Grande', 
    imageUrl: '/assets/la primera grande.png', 
    description: 'Grand experience', 
    location: 'Dangay', 
    rating: 4.7,
    rooms: [
      { id: '3-1', name: 'Classic Room', pricePerNight: 950, maxGuests: 2, description: 'Elegant and comfortable.', imageUrl: '/assets/primera 1.jpg' },
      { id: '3-2', name: 'Grand Deluxe', pricePerNight: 1750, maxGuests: 3, description: 'More space, more comfort.', imageUrl: '/assets/primera 2.jpg' },
      { id: '3-3', name: 'Presidential Suite', pricePerNight: 2500, maxGuests: 5, description: 'Fit for royalty.', imageUrl: '/assets/primera 3.jpg' },
    ]
  },
];

export default function App() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [view, setView] = useState<'auth' | 'main'>('auth');
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'resort-admin'>('login');
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedResort, setSelectedResort] = useState<Resort | null>(null);

  // Auth Listener Simulation
  useEffect(() => {
    // Initialize resort admins
    void storage.initializeResortAdmins().catch(() => {});

    const currentUser = storage.getCurrentUser();
    const currentResortAdmin = storage.getCurrentResortAdmin();
    
    if (currentResortAdmin) {
      // Resort admin is logged in
      const resort = MOCK_RESORTS.find(r => r.id === currentResortAdmin.resortId);
      if (resort) {
        const resortAdminProfile: UserProfile = {
          uid: `resort-admin-${currentResortAdmin.resortId}`,
          email: `${currentResortAdmin.username}@${currentResortAdmin.resortId}.admin`,
          fullName: `Resort Admin - ${resort.name}`,
          username: currentResortAdmin.username,
          balance: 0,
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        setProfile(resortAdminProfile);
        setView('main');
        setActiveTab('admin');
      }
    } else if (currentUser) {
      const normalized: UserProfile =
        currentUser.uid === 'admin' ? { ...currentUser, uid: 'admin', role: 'admin', username: 'admin' } : currentUser;
      if (normalized !== currentUser) storage.setCurrentUser(normalized);
      setProfile(normalized);
      setView('main');
      if (normalized.uid === 'admin' || normalized.role === 'admin') setActiveTab('admin');
      else if (normalized.role === 'merchant') setActiveTab('merchant');
      else setActiveTab('home');
      if (normalized.uid !== 'admin') {
        void storage.getUserRemote(normalized.uid).then((remote) => {
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
    const normalized: UserProfile = user.uid === 'admin' ? { ...user, uid: 'admin', role: 'admin', username: 'admin' } : user;
    storage.setCurrentUser(normalized);
    setProfile(normalized);
    setView('main');
    if (normalized.uid === 'admin' || normalized.role === 'admin') setActiveTab('admin');
    else if (normalized.role === 'merchant') setActiveTab('merchant');
    else setActiveTab('home');
  };

  const handleLogout = () => {
    storage.setCurrentUser(null);
    storage.setCurrentResortAdmin(null);
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

function AuthScreen({ mode, setMode, onAuth }: { mode: 'login' | 'signup' | 'resort-admin'; setMode: (m: 'login' | 'signup' | 'resort-admin') => void; onAuth: (u: UserProfile) => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [error, setError] = useState('');
  const [resortId, setResortId] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const ADMIN_USERNAME = (import.meta as any).env?.VITE_ADMIN_USERNAME ?? 'admin';
  const ADMIN_PASSKEY = (import.meta as any).env?.VITE_ADMIN_PASSKEY ?? 'ShorePay2024!';

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emailInput = email.trim();
    const identifier = emailInput.toLowerCase().replace(/^['"]|['"]$/g, '');
    const passkey = password.trim().replace(/^['"]|['"]$/g, '');

    if (mode === 'signup') {
      try {
        const existingUid =
          (await storage.getUserUidByEmailRemote(emailInput)) ??
          (await storage.getUserUidByEmailRemote(identifier));
        if (existingUid) {
          setError('Email already exists');
          return;
        }

        const newUser = await storage.createUserRemote({
          email: emailInput || identifier,
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
    } else if (mode === 'resort-admin') {
      // Resort Admin Login
      if (!resortId || !adminUsername || !adminPassword) {
        setError('Please fill in all fields');
        return;
      }
      
      try {
        const isValid = await storage.verifyResortAdminPassword(resortId, adminUsername, adminPassword);
        if (isValid) {
          storage.setCurrentResortAdmin({ resortId, username: adminUsername });
          // Create a temporary admin profile for the resort admin
          const resortAdminProfile: UserProfile = {
            uid: `resort-admin-${resortId}`,
            email: `${adminUsername}@${resortId}.admin`,
            fullName: `Resort Admin - ${resortId}`,
            username: adminUsername,
            balance: 0,
            role: 'admin',
            createdAt: new Date().toISOString(),
          };
          onAuth(resortAdminProfile);
        } else {
          setError('Invalid resort admin credentials');
        }
      } catch {
        setError('Login failed. Please try again.');
      }
    } else {
      // Regular login
      const expectedAdminUsername = String(ADMIN_USERNAME).trim().toLowerCase().replace(/^['"]|['"]$/g, '');
      const expectedAdminPasskey = String(ADMIN_PASSKEY).trim().replace(/^['"]|['"]$/g, '');
      const adminPasskeys = new Set<string>(
        [expectedAdminPasskey, 'ShorePay2024!'].map((v) => String(v).trim().replace(/^['"]|['"]$/g, '')).filter(Boolean)
      );
      const adminIdentifiers = new Set<string>([
        expectedAdminUsername,
        'admin',
        'admin@shorepay.com',
        'admin@shorepay.app',
      ]);

      if (adminIdentifiers.has(identifier) && adminPasskeys.has(passkey)) {
        const adminUser: UserProfile = {
          uid: 'admin',
          email: String(ADMIN_USERNAME).trim().toLowerCase() || 'admin',
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
        const uid =
          (await storage.getUserUidByEmailRemote(emailInput)) ??
          (await storage.getUserUidByEmailRemote(identifier));
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
      const user = users.find((u) => u.email.trim().toLowerCase() === identifier);
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
        {mode === 'resort-admin' && (
          <>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/60 uppercase tracking-widest ml-1">Resort Partner</label>
              <select
                value={resortId}
                onChange={e => setResortId(e.target.value)}
                className="w-full bg-white/20 border border-white/20 rounded-xl py-4 px-4 outline-none text-white focus:border-white focus:bg-white/30 transition-all cursor-pointer"
                required
              >
                <option value="" disabled className="text-slate-900 bg-white">Select a Resort</option>
                {MOCK_RESORTS.map(resort => (
                  <option key={resort.id} value={resort.id} className="text-slate-900 bg-white font-bold">{resort.name}</option>
                ))}
              </select>
            </div>
            <input 
              placeholder="Admin Username"
              className="w-full bg-white/10 border-b border-white/30 py-3 px-1 outline-none placeholder:text-white/50 focus:border-white transition-all"
              value={adminUsername}
              onChange={e => setAdminUsername(e.target.value)}
              required
            />
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Admin Password"
                className="w-full bg-white/10 border-b border-white/30 py-3 px-1 pr-10 outline-none placeholder:text-white/50 focus:border-white transition-all"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </>
        )}

        {mode !== 'resort-admin' && (
          <>
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
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                className="w-full bg-white/10 border-b border-white/30 py-3 px-1 pr-10 outline-none placeholder:text-white/50 focus:border-white transition-all"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Hide password" : "Show password"}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setShowPassword(v => !v)}
                className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </>
        )}
        
        {error && <p className="text-xs text-red-200 bg-red-500/20 p-2 rounded">{error}</p>}

        <button 
          type="submit"
          className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold mt-4 hover:bg-slate-800 transition-all active:scale-95"
        >
          {mode === 'signup' ? 'Sign Up' : mode === 'resort-admin' ? 'Admin Login' : 'Log In'}
        </button>
      </form>

      <div className="mt-8 text-center">
        <p className="text-sm text-white/70">
          {mode === 'signup' ? 'Have an account?' : mode === 'resort-admin' ? 'Back to ' : "Don't have an account?"}{' '}
          <button onClick={() => setMode(mode === 'login' ? 'signup' : mode === 'signup' ? 'login' : 'login')} className="font-bold text-white hover:underline">
            {mode === 'login' ? 'Sign Up' : mode === 'signup' ? 'Log In' : 'User Login'}
          </button>
        </p>
        {mode !== 'resort-admin' && (
          <p className="text-sm text-white/70 mt-2">
            Resort Admin?{' '}
            <button onClick={() => setMode('resort-admin')} className="font-bold text-white hover:underline">
              Admin Login
            </button>
          </p>
        )}
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
        {(profile.uid === 'admin' || profile.role === 'admin') && activeTab === 'admin' && <AdminDashboard profile={profile} />}
        {profile.uid.startsWith('resort-admin-') && activeTab === 'admin' && <ResortAdminDashboard profile={profile} />}
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

          {(profile.uid === 'admin' || profile.role === 'admin' || profile.uid.startsWith('resort-admin-')) && (
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
              <p className="text-sm text-slate-500 mb-6">Let the sender scan this to send you money.</p>

              <div className="p-6 bg-slate-50 rounded-[32px] mb-5">
                <QRCodeSVG value={`shorepay://pay?uid=${encodeURIComponent(profile.uid)}`} size={220} />
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
  const [cashOutRecipientUid, setCashOutRecipientUid] = useState('');
  const [scanUidInput, setScanUidInput] = useState('');
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferToUid, setTransferToUid] = useState('');
  const [transferRecipient, setTransferRecipient] = useState<UserProfile | null>(null);
  const [transferAmountInput, setTransferAmountInput] = useState('');
  const [transferNote, setTransferNote] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);
  const [transferLoading, setTransferLoading] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const scanRafRef = useRef<number | null>(null);
  const detectorRef = useRef<any>(null);
  const barcodeDetectorSupported = useMemo(() => typeof (window as any).BarcodeDetector === 'function', []);

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
    if (scanRafRef.current) cancelAnimationFrame(scanRafRef.current);
    scanRafRef.current = null;
    detectorRef.current = null;
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setCameraActive(false);
  };

  const extractUid = useCallback((raw: string) => {
    const s = raw.trim();
    if (!s) return '';
    const match = s.match(/[?&]uid=([^&]+)/i);
    if (match?.[1]) return decodeURIComponent(match[1]).trim();
    return s.replace(/^['"]|['"]$/g, '').trim();
  }, []);

  const openTransferTo = useCallback((rawUid: string) => {
    const uid = extractUid(rawUid);
    if (!uid) return;
    stopCamera();
    setShowScanner(false);
    if (activeModal === 'cash-out') {
      setCashOutRecipientUid(uid);
      return;
    }
    setTransferToUid(uid);
    setShowTransfer(true);
  }, [extractUid]);

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
    setScanUidInput('');
    void startCamera();
    return () => stopCamera();
  }, [showScanner]);

  const startQrScanLoop = useCallback(() => {
    if (!barcodeDetectorSupported) return;
    const BarcodeDetectorCtor = (window as any).BarcodeDetector;
    if (!BarcodeDetectorCtor) return;
    if (!detectorRef.current) detectorRef.current = new BarcodeDetectorCtor({ formats: ['qr_code'] });

    const loop = async () => {
      if (!showScanner || !videoRef.current) return;
      try {
        const video = videoRef.current;
        if (video.readyState >= 2) {
          const barcodes = await detectorRef.current.detect(video);
          const raw = barcodes?.[0]?.rawValue;
          if (typeof raw === 'string' && raw.trim()) {
            openTransferTo(raw);
            return;
          }
        }
      } catch {}
      scanRafRef.current = requestAnimationFrame(loop);
    };

    if (scanRafRef.current) cancelAnimationFrame(scanRafRef.current);
    scanRafRef.current = requestAnimationFrame(loop);
  }, [barcodeDetectorSupported, openTransferTo, showScanner]);

  useEffect(() => {
    if (!showScanner) return;
    if (!barcodeDetectorSupported) return;
    startQrScanLoop();
    return () => {
      if (scanRafRef.current) cancelAnimationFrame(scanRafRef.current);
      scanRafRef.current = null;
    };
  }, [barcodeDetectorSupported, showScanner, startQrScanLoop]);

  useEffect(() => {
    if (!showTransfer) return;
    const uid = transferToUid.trim();
    setTransferRecipient(null);
    setTransferError(null);
    if (!uid) return;
    if (uid === profile.uid) {
      setTransferError('Cannot send to yourself.');
      return;
    }
    void storage.getUserRemote(uid).then((u) => {
      if (!u) {
        setTransferError('Recipient not found.');
        return;
      }
      setTransferRecipient(u);
    });
  }, [profile.uid, showTransfer, transferToUid]);

  useEffect(() => {
    if (!activeModal) return;
    setSelectedProvider(null);
    setAmountInput('');
    setCashOutRecipientUid('');
  }, [activeModal]);

  const handleTransfer = async () => {
    setTransferError(null);
    const amount = Number(transferAmountInput);
    const toUid = transferToUid.trim();
    if (!toUid) {
      setTransferError('Enter or scan a recipient.');
      return;
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      setTransferError('Enter a valid amount.');
      return;
    }
    if (amount > balance) {
      setTransferError('Insufficient balance.');
      return;
    }

    setTransferLoading(true);
    try {
      const result = await storage.transferRemote({
        fromUid: profile.uid,
        toUid,
        amount,
        note: transferNote,
      });
      const updatedProfile = { ...profile, balance: result.senderBalance };
      storage.saveUser(updatedProfile);
      storage.setCurrentUser(updatedProfile);
      setBalance(result.senderBalance);
      void storage.getTransactionsRemote(profile.uid).then(setTransactions);
      setShowTransfer(false);
      setTransferAmountInput('');
      setTransferNote('');
      setSuccessData({
        id: result.txId,
        amount,
        merchant: transferRecipient?.fullName ?? result.recipientName,
      });
    } catch (err: any) {
      setTransferError(typeof err?.message === 'string' ? err.message : 'Transfer failed.');
    } finally {
      setTransferLoading(false);
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

    if (activeModal === 'cash-in') {
      const newBalance = balance + amount;
      const updatedProfile = { ...profile, balance: newBalance };
      storage.saveUser(updatedProfile);
      storage.setCurrentUser(updatedProfile);
      setBalance(newBalance);
      void storage.updateUserRemote(profile.uid, { balance: newBalance }).catch(() => {});

      const newTx = storage.addTransaction({
        fromUid: profile.uid,
        toUid: profile.uid,
        amount,
        type: 'cash-in',
        status: 'confirmed',
        timestamp: new Date().toISOString(),
        description: `Top up via ${selectedProvider}`,
      });
      void storage.addTransactionRemote(newTx).catch(() => {});
      void storage.getTransactionsRemote(profile.uid).then(setTransactions);
      setActiveModal(null);
      alert('Top up successful!');
      return;
    }

    const recipientUid = cashOutRecipientUid.trim();
    if (!recipientUid) {
      alert('Enter the receiver UID or scan their QR.');
      return;
    }
    if (recipientUid === profile.uid) {
      alert('Cannot send to yourself.');
      return;
    }
    if (amount > balance) {
      alert('Insufficient balance.');
      return;
    }

    setTransferLoading(true);
    void storage.transferRemote({
      fromUid: profile.uid,
      toUid: recipientUid,
      amount,
      note: `Sent via ${selectedProvider}`,
    }).then((result) => {
      const updatedProfile = { ...profile, balance: result.senderBalance };
      storage.saveUser(updatedProfile);
      storage.setCurrentUser(updatedProfile);
      setBalance(result.senderBalance);
      void storage.getTransactionsRemote(profile.uid).then(setTransactions);
      setActiveModal(null);
      setCashOutRecipientUid('');
      setSuccessData({
        id: result.txId,
        amount,
        merchant: result.recipientName,
      });
    }).catch((err: any) => {
      alert(typeof err?.message === 'string' ? err.message : 'Transfer failed.');
    }).finally(() => {
      setTransferLoading(false);
    });
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
                <p className={cn(
                  "font-bold",
                  tx.type === 'cash-in' ? "text-emerald-600" : "text-slate-900"
                )}>
                  {(tx.type === 'cash-in' ? '+' : tx.type === 'withdraw' ? '-' : tx.fromUid === profile.uid ? '-' : '+')}₱{tx.amount.toLocaleString()}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Scanner Modal */}
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
              <p className="text-white/60 mt-8 text-center">Align the QR code within the frame to send money</p>
              {!barcodeDetectorSupported && (
                <p className="text-white/60 mt-2 text-center text-xs">QR scanning is not supported on this device. Paste the recipient UID below.</p>
              )}
            </div>

            <div className="bg-white/10 p-4 rounded-2xl flex items-center gap-4 text-white">
              <div className="flex-1">
                <p className="text-sm font-bold">Send to user</p>
                <p className="text-xs opacity-60">{barcodeDetectorSupported ? 'Scan their QR or paste their UID.' : 'Paste their UID to continue.'}</p>
                <input
                  value={scanUidInput}
                  onChange={(e) => setScanUidInput(e.target.value)}
                  placeholder="Recipient UID"
                  className="mt-3 w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-white font-bold text-sm outline-none placeholder:text-white/50"
                />
              </div>
              <button 
                onClick={() => openTransferTo(scanUidInput)}
                className="bg-ocean-blue px-4 py-2 rounded-lg font-bold"
              >
                Next
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showTransfer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-sm flex items-end"
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              className="bg-white w-full max-w-md mx-auto rounded-t-[40px] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-extrabold">Send Money</h3>
                <button
                  onClick={() => setShowTransfer(false)}
                  className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-1">Recipient</p>
                  <p className="font-extrabold text-slate-900">{transferRecipient?.fullName ?? transferToUid}</p>
                  {transferRecipient && <p className="text-xs text-slate-500">@{transferRecipient.username} • {transferRecipient.email}</p>}
                </div>

                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-3">Amount</p>
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    {[50, 100, 200, 500].map(v => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => setTransferAmountInput(String(v))}
                        className={cn(
                          "py-2 rounded-xl text-xs font-extrabold border transition-colors",
                          Number(transferAmountInput) === v
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
                      value={transferAmountInput}
                      onChange={(e) => setTransferAmountInput(e.target.value)}
                      inputMode="numeric"
                      className="w-full pl-9 pr-4 py-3 bg-white rounded-xl border border-slate-200 outline-none focus:border-ocean-blue font-extrabold text-lg"
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                  <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Note (optional)</p>
                  <input
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="e.g. payment"
                    className="w-full px-4 py-3 rounded-2xl bg-white border border-slate-200 outline-none focus:border-ocean-blue font-bold"
                  />
                </div>

                {transferError && <p className="text-xs text-red-500 bg-red-50 border border-red-100 p-3 rounded-2xl">{transferError}</p>}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowTransfer(false);
                      setShowScanner(true);
                    }}
                    className="flex-1 bg-slate-100 py-4 rounded-2xl font-extrabold text-slate-700 hover:bg-slate-200 transition-all active:scale-95"
                  >
                    Scan Again
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleTransfer()}
                    disabled={transferLoading || !!transferError}
                    className={cn(
                      "flex-1 bg-ocean-blue text-white py-4 rounded-2xl font-extrabold hover:bg-ocean-blue/90 transition-all active:scale-95",
                      (transferLoading || !!transferError) && "opacity-60"
                    )}
                  >
                    {transferLoading ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
            </motion.div>
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
                  ? "Choose your top-up method and enter the amount. Share your receiver QR/ID to the sender."
                  : "Choose a method, enter the amount, then scan the receiver QR (or paste UID)."
                }
              </p>

              <div className="text-left space-y-4 mb-6">
                {activeModal === 'cash-in' && (
                  <div className="bg-slate-50 rounded-3xl p-4 border border-slate-100">
                    <p className="text-xs text-slate-400 uppercase font-bold tracking-widest mb-2">Receive Money</p>
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white rounded-2xl border border-slate-200">
                        <QRCodeSVG value={`shorepay://pay?uid=${encodeURIComponent(profile.uid)}`} size={92} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-extrabold text-slate-900 truncate">{profile.fullName}</p>
                        <p className="text-xs text-slate-500 truncate">@{profile.username}</p>
                        <p className="text-xs text-slate-400 mt-2">Receiver ID</p>
                        <p className="text-xs font-bold text-slate-700 break-all">{profile.uid}</p>
                      </div>
                      <button
                        type="button"
                        onClick={async () => {
                          try {
                            await navigator.clipboard.writeText(`shorepay://pay?uid=${profile.uid}`);
                            alert('Receiver QR link copied.');
                          } catch {
                            alert(`Receiver link: shorepay://pay?uid=${profile.uid}`);
                          }
                        }}
                        className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors"
                        aria-label="Copy receiver link"
                        title="Copy receiver link"
                      >
                        <Copy size={18} />
                      </button>
                    </div>
                  </div>
                )}

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

                {activeModal === 'cash-out' && (
                  <div>
                    <label className="text-sm font-bold text-slate-700 mb-2 block">Receiver UID</label>
                    <div className="flex gap-2">
                      <input
                        value={cashOutRecipientUid}
                        onChange={(e) => setCashOutRecipientUid(e.target.value)}
                        placeholder="Scan QR or paste UID"
                        className="flex-1 px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
                      />
                      <button
                        type="button"
                        onClick={() => setShowScanner(true)}
                        className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center hover:bg-slate-800 transition-colors"
                        aria-label="Open camera to scan receiver QR"
                        title="Scan receiver QR"
                      >
                        <Camera size={18} />
                      </button>
                    </div>
                  </div>
                )}

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

// --- Resort Admin Dashboard ---

function ResortAdminDashboard({ profile }: { profile: UserProfile }) {
  const currentAdmin = storage.getCurrentResortAdmin();
  const resortId = currentAdmin?.resortId || '';
  const resort = MOCK_RESORTS.find(r => r.id === resortId);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [customerQuery, setCustomerQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | Customer['status']>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const loadData = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) setRefreshing(true);
    try {
      const remoteCustomers = await storage.getCustomersByResortRemote(resortId);
      setCustomers(remoteCustomers);
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      console.error('Error loading resort admin data:', error);
    } finally {
      if (!silent) setRefreshing(false);
      setLoading(false);
    }
  }, [resortId]);

  useEffect(() => {
    if (resortId) {
      void loadData({ silent: true });
    }
  }, [loadData, resortId]);

  const totalRevenue = customers
    .filter(c => c.status === 'confirmed')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalCustomers = customers.length;
  const confirmedBookings = customers.filter(c => c.status === 'confirmed').length;
  const pendingBookings = customers.filter(c => c.status === 'pending').length;

  const filteredCustomers = useMemo(() => {
    const q = customerQuery.trim().toLowerCase();
    return customers
      .filter((c) => (statusFilter === 'all' ? true : c.status === statusFilter))
      .filter((c) => {
        if (!q) return true;
        return (
          c.id.toLowerCase().includes(q) ||
          c.fullName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [customers, customerQuery, statusFilter]);

  const updateCustomerStatus = useCallback(async (customerId: string, status: Customer['status']) => {
    try {
      await storage.updateCustomerStatusRemote(resortId, customerId, status);
      setCustomers(prev => prev.map(c => c.id === customerId ? { ...c, status } : c));
    } catch (error) {
      console.error('Error updating customer status:', error);
      alert('Failed to update status. Please try again.');
    }
  }, [resortId]);

  const downloadCsv = useCallback((filename: string, rows: Array<Record<string, any>>) => {
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headersSet = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r)) headersSet.add(k);
    const headers = Array.from(headersSet);
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const exportCustomers = useCallback(() => {
    downloadCsv(
      `${resort?.name.replace(/\s+/g, '_')}_customers_${new Date().toISOString().slice(0, 10)}.csv`,
      filteredCustomers.map((c) => ({
        id: c.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        address: c.address,
        checkIn: c.checkIn,
        checkOut: c.checkOut,
        guests: c.guests,
        paymentMethod: c.paymentMethod,
        amount: c.amount,
        status: c.status,
        createdAt: c.createdAt,
      }))
    );
  }, [downloadCsv, filteredCustomers, resort]);

  if (!resort) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Resort Not Found</h2>
          <p className="text-slate-500">Please log in again.</p>
        </div>
      </div>
    );
  }

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
    <div className="h-full flex flex-col bg-slate-50">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {/* Customers List */}
        <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-extrabold">Customer Bookings</h3>
                <p className="text-sm text-slate-500">Manage customer registrations and bookings</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => loadData()}
                  disabled={refreshing}
                  className="p-2 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors disabled:opacity-50"
                >
                  <RefreshCcw size={16} className={refreshing ? 'animate-spin' : ''} />
                </button>
                <button
                  onClick={exportCustomers}
                  className="px-4 py-2 bg-ocean-blue text-white rounded-xl font-bold hover:bg-ocean-blue/90 transition-colors flex items-center gap-2"
                >
                  <Download size={16} />
                  Export
                </button>
              </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search customers..."
                  value={customerQuery}
                  onChange={e => setCustomerQuery(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-ocean-blue"
                />
              </div>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-ocean-blue"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No customers found
              </div>
            ) : (
              filteredCustomers.map((customer) => (
                <div 
                  key={customer.id} 
                  onClick={() => setSelectedCustomer(customer)}
                  className="p-6 hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-extrabold text-slate-900 group-hover:text-ocean-blue transition-colors">{customer.fullName}</h4>
                        <span className={cn(
                          "px-2 py-1 text-xs font-bold uppercase tracking-widest rounded-full",
                          customer.status === 'confirmed' ? "bg-green-100 text-green-700" :
                          customer.status === 'pending' ? "bg-yellow-100 text-yellow-700" :
                          "bg-red-100 text-red-700"
                        )}>
                          {customer.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-slate-600 mb-3">
                        <p><strong>Email:</strong> {customer.email}</p>
                        <p><strong>Phone:</strong> {customer.phone}</p>
                        <p><strong>Check-in:</strong> {new Date(customer.checkIn).toLocaleDateString()}</p>
                        <p><strong>Check-out:</strong> {new Date(customer.checkOut).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      {customer.status === 'pending' && (
                        <>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCustomerStatus(customer.id, 'confirmed');
                            }}
                            className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-lg hover:bg-green-600 transition-colors"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateCustomerStatus(customer.id, 'cancelled');
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                      {customer.status === 'confirmed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            updateCustomerStatus(customer.id, 'cancelled');
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs font-bold rounded-lg hover:bg-red-600 transition-colors"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Merchant Dashboard ---

function MerchantDashboard({ profile }: { profile: UserProfile }) {
  const [merchantData, setMerchantData] = useState<Merchant | null>(null);
  const [resortId, setResortId] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [showQr, setShowQr] = useState(false);
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactFacebook, setContactFacebook] = useState('');
  const [savingContact, setSavingContact] = useState(false);

  const selectedResort = useMemo(() => MOCK_RESORTS.find((r) => r.id === resortId) ?? null, [resortId]);

  useEffect(() => {
    const local = storage.getMerchant(profile.uid);
    setMerchantData(local);
    setResortId(local?.resortId ?? '');
    void storage.getMerchantRemote(profile.uid).then((remote) => {
      if (!remote) return;
      storage.saveMerchant(remote);
      setMerchantData(remote);
      setResortId(remote.resortId ?? '');
    }).finally(() => setLoading(false));
  }, [profile.uid]);

  useEffect(() => {
    if (!resortId) {
      setBookings([]);
      return;
    }
    void storage.getBookingsByResortRemote(resortId).then(setBookings);
  }, [resortId]);

  useEffect(() => {
    if (!resortId) return;
    setContactPhone('');
    setContactEmail('');
    setContactFacebook('');
    void storage.getResortContactRemote(resortId).then((c) => {
      if (!c) return;
      setContactPhone(c.phone ?? '');
      setContactEmail(c.email ?? '');
      setContactFacebook(c.facebook ?? '');
    });
  }, [resortId]);

  const saveResortLink = useCallback(() => {
    if (!merchantData) return;
    const next: Merchant = { ...merchantData, resortId };
    storage.saveMerchant(next);
    setMerchantData(next);
  }, [merchantData, resortId]);

  const resortQrValue = resortId ? `shorepay://resort?resortId=${encodeURIComponent(resortId)}` : '';
  const saveContact = useCallback(async () => {
    if (!resortId) return;
    setSavingContact(true);
    try {
      await storage.upsertResortContactRemote(resortId, {
        phone: contactPhone.trim() || undefined,
        email: contactEmail.trim() || undefined,
        facebook: contactFacebook.trim() || undefined,
      });
    } finally {
      setSavingContact(false);
    }
  }, [contactEmail, contactFacebook, contactPhone, resortId]);

  if (loading && !merchantData) {
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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Resort Console</h1>
          <p className="text-sm text-slate-500">{selectedResort?.name ?? merchantData?.businessName ?? 'Select a resort'}</p>
        </div>
        <button onClick={() => void storage.getBookingsByResortRemote(resortId).then(setBookings)} className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center">
          <RefreshCcw size={18} className="text-slate-600" />
        </button>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-extrabold">Resort Link</h3>
          <p className="text-sm text-slate-500">Bookings are exclusive per resort.</p>
        </div>
        <div className="p-6 space-y-4">
          <select
            value={resortId}
            onChange={(e) => setResortId(e.target.value)}
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
          >
            <option value="">Select your resort…</option>
            {MOCK_RESORTS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.location})
              </option>
            ))}
          </select>
          <div className="flex gap-3">
            <button
              onClick={saveResortLink}
              disabled={!resortId}
              className={cn(
                "flex-1 bg-ocean-blue text-white py-3 rounded-2xl font-extrabold hover:bg-ocean-blue/90 transition-all active:scale-95",
                !resortId && "opacity-60"
              )}
            >
              Save
            </button>
            <button
              onClick={() => setShowQr(true)}
              disabled={!resortId}
              className={cn(
                "flex-1 bg-slate-900 text-white py-3 rounded-2xl font-extrabold hover:bg-slate-800 transition-all active:scale-95 flex items-center justify-center gap-2",
                !resortId && "opacity-60"
              )}
            >
              <QrCode size={18} />
              Resort QR
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100">
          <h3 className="text-lg font-extrabold">Contact Details</h3>
          <p className="text-sm text-slate-500">Shown to guests after booking this resort.</p>
        </div>
        <div className="p-6 space-y-4">
          <input
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Phone (e.g. +63917...)"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
            disabled={!resortId}
          />
          <input
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
            disabled={!resortId}
          />
          <input
            value={contactFacebook}
            onChange={(e) => setContactFacebook(e.target.value)}
            placeholder="Facebook page URL"
            className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
            disabled={!resortId}
          />
          <button
            onClick={() => void saveContact()}
            disabled={!resortId || savingContact}
            className={cn(
              "w-full bg-ocean-blue text-white py-4 rounded-2xl font-extrabold hover:bg-ocean-blue/90 transition-all active:scale-95",
              (!resortId || savingContact) && "opacity-60"
            )}
          >
            {savingContact ? 'Saving…' : 'Save Contact'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-extrabold">Bookings</h3>
            <p className="text-sm text-slate-500">{resortId ? `Only for resort #${resortId}` : 'Select a resort to view bookings.'}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400 uppercase font-bold">Total</p>
            <p className="text-lg font-extrabold text-ocean-blue">{bookings.length}</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
          {!resortId ? (
            <div className="p-10 text-center text-slate-400">
              <p className="font-bold">No resort selected</p>
              <p className="text-xs">Link a resort to see its exclusive bookings.</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="p-10 text-center text-slate-400">
              <p className="font-bold">No bookings yet</p>
              <p className="text-xs">Bookings for this resort will appear here.</p>
            </div>
          ) : (
            bookings.map((b) => (
              <div key={b.id} className="p-5 flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                    <CalendarDays size={22} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="font-extrabold text-slate-900">{b.userName}</p>
                    <p className="text-xs text-slate-500">
                      {new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()} • {b.guests} guest{b.guests !== 1 ? 's' : ''}
                    </p>
                    <p className="text-xs text-slate-400">Paid via {b.provider} • #{b.id}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-extrabold text-ocean-blue">₱{b.amount.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <AnimatePresence>
        {showQr && resortId && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white w-full rounded-[40px] p-8 flex flex-col items-center text-center"
            >
              <div className="w-full flex justify-end mb-2">
                <button onClick={() => setShowQr(false)} className="text-slate-400"><X size={24} /></button>
              </div>
              <h3 className="text-xl font-bold mb-1">{selectedResort?.name ?? 'Resort'}</h3>
              <p className="text-sm text-slate-500 mb-8">Resort unique QR code</p>
              
              <div className="p-6 bg-slate-50 rounded-[32px] mb-8">
                <QRCodeSVG value={resortQrValue} size={200} />
              </div>

              <p className="text-xs text-slate-500 break-all">{resortQrValue}</p>
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
  const [refreshing, setRefreshing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [usersQuery, setUsersQuery] = useState('');
  const [usersRoleFilter, setUsersRoleFilter] = useState<'all' | UserRole>('all');
  const [txQuery, setTxQuery] = useState('');
  const [txTypeFilter, setTxTypeFilter] = useState<'all' | Transaction['type']>('all');
  const [txStatusFilter, setTxStatusFilter] = useState<'all' | Transaction['status']>('all');
  const [merchantQuery, setMerchantQuery] = useState('');
  const [merchantStatusFilter, setMerchantStatusFilter] = useState<'all' | 'verified' | 'pending'>('all');
  const [bookingQuery, setBookingQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  const loadData = useCallback(async (opts?: { silent?: boolean }) => {
    const silent = opts?.silent === true;
    if (!silent) setRefreshing(true);
    try {
      const [remoteUsers, remoteTransactions, remoteMerchants, remoteBookings] = await Promise.all([
        storage.getAllUsersRemote(),
        storage.getAllTransactionsRemote(),
        storage.getMerchantsRemote(),
        storage.getBookingsRemote(),
      ]);

      setUsers(remoteUsers.length ? remoteUsers : storage.getUsers());
      setTransactions(remoteTransactions.length ? remoteTransactions : storage.get('shorepay_transactions', []));
      setMerchants(remoteMerchants.length ? remoteMerchants : storage.get('shorepay_merchants', []));
      setBookings(remoteBookings);
      setLastSyncedAt(new Date().toISOString());
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      if (!silent) setRefreshing(false);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData({ silent: true });
  }, [loadData]);

  const totalRevenue = transactions
    .filter(t => t.type === 'payment')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalUsers = users.length;
  const totalMerchants = merchants.length;
  const totalBookings = bookings.length;

  const roleCounts = useMemo(() => {
    const counts: Record<UserRole, number> = { customer: 0, merchant: 0, admin: 0 };
    for (const u of users) counts[u.role] = (counts[u.role] ?? 0) + 1;
    return counts;
  }, [users]);

  const pendingMerchants = useMemo(() => merchants.filter((m) => !m.isVerified).length, [merchants]);

  const filteredUsers = useMemo(() => {
    const q = usersQuery.trim().toLowerCase();
    return users
      .filter((u) => (usersRoleFilter === 'all' ? true : u.role === usersRoleFilter))
      .filter((u) => {
        if (!q) return true;
        return (
          u.uid.toLowerCase().includes(q) ||
          u.fullName.toLowerCase().includes(q) ||
          u.username.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [users, usersQuery, usersRoleFilter]);

  const filteredTransactions = useMemo(() => {
    const q = txQuery.trim().toLowerCase();
    return transactions
      .filter((t) => (txTypeFilter === 'all' ? true : t.type === txTypeFilter))
      .filter((t) => (txStatusFilter === 'all' ? true : t.status === txStatusFilter))
      .filter((t) => {
        if (!q) return true;
        return (
          t.id.toLowerCase().includes(q) ||
          t.fromUid.toLowerCase().includes(q) ||
          t.toUid.toLowerCase().includes(q) ||
          (t.merchantName?.toLowerCase().includes(q) ?? false) ||
          (t.description?.toLowerCase().includes(q) ?? false)
        );
      })
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [transactions, txQuery, txTypeFilter, txStatusFilter]);

  const filteredMerchants = useMemo(() => {
    const q = merchantQuery.trim().toLowerCase();
    return merchants
      .filter((m) => {
        if (merchantStatusFilter === 'all') return true;
        if (merchantStatusFilter === 'verified') return m.isVerified;
        return !m.isVerified;
      })
      .filter((m) => {
        if (!q) return true;
        return m.uid.toLowerCase().includes(q) || m.businessName.toLowerCase().includes(q) || m.location.toLowerCase().includes(q);
      })
      .sort((a, b) => b.totalSalesToday - a.totalSalesToday);
  }, [merchants, merchantQuery, merchantStatusFilter]);

  const filteredBookings = useMemo(() => {
    const q = bookingQuery.trim().toLowerCase();
    return bookings
      .filter((b) => {
        if (!q) return true;
        return (
          b.id.toLowerCase().includes(q) ||
          b.userUid.toLowerCase().includes(q) ||
          b.userName.toLowerCase().includes(q) ||
          b.resortName.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [bookings, bookingQuery]);

  const downloadCsv = useCallback((filename: string, rows: Array<Record<string, any>>) => {
    const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const headersSet = new Set<string>();
    for (const r of rows) for (const k of Object.keys(r)) headersSet.add(k);
    const headers = Array.from(headersSet);
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => escape(r[h])).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  const exportTransactions = useCallback(() => {
    downloadCsv(
      `shorepay-transactions-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredTransactions.map((t) => ({
        id: t.id,
        fromUid: t.fromUid,
        toUid: t.toUid,
        amount: t.amount,
        type: t.type,
        status: t.status,
        timestamp: t.timestamp,
        merchantName: t.merchantName ?? '',
        description: t.description ?? '',
      }))
    );
  }, [downloadCsv, filteredTransactions]);

  const exportBookings = useCallback(() => {
    downloadCsv(
      `shorepay-bookings-${new Date().toISOString().slice(0, 10)}.csv`,
      filteredBookings.map((b) => ({
        id: b.id,
        userUid: b.userUid,
        userName: b.userName,
        resortId: b.resortId,
        resortName: b.resortName,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
        guests: b.guests,
        provider: b.provider,
        amount: b.amount,
        createdAt: b.createdAt,
      }))
    );
  }, [downloadCsv, filteredBookings]);

  const toggleMerchantVerification = useCallback(async (merchant: Merchant) => {
    const next: Merchant = { ...merchant, isVerified: !merchant.isVerified };
    setMerchants((prev) => prev.map((m) => (m.uid === merchant.uid ? next : m)));
    storage.saveMerchant(next);
  }, []);

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
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-xs text-slate-500">
            {lastSyncedAt ? `Last synced: ${new Date(lastSyncedAt).toLocaleString()}` : 'Syncing…'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => void loadData()}
            disabled={refreshing}
            className={cn(
              "px-4 h-10 bg-slate-900 text-white rounded-full flex items-center gap-2 font-bold hover:bg-slate-800 transition-colors",
              refreshing && "opacity-60"
            )}
          >
            <RefreshCcw size={16} className={refreshing ? "animate-spin" : undefined} />
            Refresh
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200 transition-colors"
            aria-label="Hard reload"
            title="Hard reload"
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
              <div className="flex gap-2 mt-4">
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-blue-100 text-blue-600">
                  Customers: {roleCounts.customer}
                </span>
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-purple-100 text-purple-600">
                  Merchants: {roleCounts.merchant}
                </span>
                <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full bg-red-100 text-red-600">
                  Admins: {roleCounts.admin}
                </span>
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
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Payments</p>
                <p className="text-xs font-bold text-slate-700">{transactions.filter((t) => t.type === 'payment').length}</p>
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
              <div className="flex items-center justify-between mt-4">
                <span className={cn(
                  "px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-full",
                  pendingMerchants > 0 ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-600"
                )}>
                  Pending: {pendingMerchants}
                </span>
                <button
                  onClick={() => setActiveSection('merchants')}
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  Review
                </button>
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
              <div className="flex items-center justify-between mt-4">
                <button
                  onClick={() => setActiveSection('bookings')}
                  className="text-xs font-bold text-orange-600 hover:underline"
                >
                  View bookings
                </button>
                <button
                  onClick={exportBookings}
                  className="text-xs font-bold text-slate-700 hover:underline flex items-center gap-1"
                >
                  <Download size={14} />
                  Export
                </button>
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
            <div className="p-4 border-b border-slate-100 flex items-center gap-3">
              <div className="flex-1">
                <input
                  value={usersQuery}
                  onChange={(e) => setUsersQuery(e.target.value)}
                  placeholder="Search by name, username, email, uid…"
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
                />
              </div>
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={16} className="text-slate-400" />
                <select
                  value={usersRoleFilter}
                  onChange={(e) => setUsersRoleFilter(e.target.value as any)}
                  className="px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700"
                >
                  <option value="all">All roles</option>
                  <option value="customer">Customer</option>
                  <option value="merchant">Merchant</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="p-10 text-center text-slate-400">
                  <p className="font-bold">No users yet</p>
                  <p className="text-xs">Users will appear here after they register.</p>
                </div>
              ) : (
                filteredUsers.map(user => {
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
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="flex-1">
              <input
                value={txQuery}
                onChange={(e) => setTxQuery(e.target.value)}
                placeholder="Search by tx id, uid, merchant, description…"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
              />
            </div>
            <select
              value={txTypeFilter}
              onChange={(e) => setTxTypeFilter(e.target.value as any)}
              className="px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700"
            >
              <option value="all">All types</option>
              <option value="payment">Payment</option>
              <option value="cash-in">Cash In</option>
              <option value="withdraw">Withdraw</option>
            </select>
            <select
              value={txStatusFilter}
              onChange={(e) => setTxStatusFilter(e.target.value as any)}
              className="px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700"
            >
              <option value="all">All status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="refunded">Refunded</option>
            </select>
            <button
              onClick={exportTransactions}
              className="px-4 h-[46px] bg-slate-900 text-white rounded-2xl flex items-center gap-2 font-bold hover:bg-slate-800 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredTransactions.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="font-bold">No transactions yet</p>
                <p className="text-xs">Transactions will appear here as users make payments.</p>
              </div>
            ) : (
              filteredTransactions.map(tx => (
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
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="flex-1">
              <input
                value={merchantQuery}
                onChange={(e) => setMerchantQuery(e.target.value)}
                placeholder="Search by business, location, uid…"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
              />
            </div>
            <select
              value={merchantStatusFilter}
              onChange={(e) => setMerchantStatusFilter(e.target.value as any)}
              className="px-3 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none font-bold text-slate-700"
            >
              <option value="all">All</option>
              <option value="verified">Verified</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredMerchants.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="font-bold">No merchants yet</p>
                <p className="text-xs">Merchants will appear here after they register.</p>
              </div>
            ) : (
              filteredMerchants.map(merchant => (
                <div key={merchant.uid} className="p-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center">
                      <Store size={24} className="text-slate-400" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{merchant.businessName}</p>
                      <p className="text-xs text-slate-500">{merchant.location} • {merchant.uid}</p>
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
                    <button
                      onClick={() => void toggleMerchantVerification(merchant)}
                      className={cn(
                        "mt-2 w-full px-3 py-2 rounded-xl text-xs font-extrabold transition-colors",
                        merchant.isVerified ? "bg-slate-100 text-slate-700 hover:bg-slate-200" : "bg-green-600 text-white hover:bg-green-700"
                      )}
                    >
                      {merchant.isVerified ? 'Mark Pending' : 'Verify'}
                    </button>
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
          <div className="p-4 border-b border-slate-100 flex items-center gap-3">
            <div className="flex-1">
              <input
                value={bookingQuery}
                onChange={(e) => setBookingQuery(e.target.value)}
                placeholder="Search by user, resort, booking id…"
                className="w-full px-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 outline-none focus:border-ocean-blue font-bold"
              />
            </div>
            <button
              onClick={exportBookings}
              className="px-4 h-[46px] bg-slate-900 text-white rounded-2xl flex items-center gap-2 font-bold hover:bg-slate-800 transition-colors"
            >
              <Download size={16} />
              Export
            </button>
          </div>

          <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
            {filteredBookings.length === 0 ? (
              <div className="p-10 text-center text-slate-400">
                <p className="font-bold">No bookings yet</p>
                <p className="text-xs">Bookings will appear here after users confirm a resort booking.</p>
              </div>
            ) : (
              filteredBookings.map(booking => (
                <div 
                  key={booking.id} 
                  onClick={() => setSelectedBooking(booking)}
                  className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center group-hover:bg-ocean-blue/10 transition-colors">
                      <CalendarDays size={24} className="text-slate-400 group-hover:text-ocean-blue transition-colors" />
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900 group-hover:text-ocean-blue transition-colors">{booking.userName}</p>
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

      <AnimatePresence>
        {selectedBooking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-white w-full max-w-lg rounded-[40px] overflow-hidden shadow-2xl"
            >
              <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                <div>
                  <h3 className="text-2xl font-black text-slate-900">Booking Overview</h3>
                  <p className="text-sm text-slate-500 font-medium">Ref: {selectedBooking.referenceNumber || selectedBooking.id.slice(0, 10).toUpperCase()}</p>
                </div>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-all"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto max-h-[70vh]">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Customer</p>
                    <p className="text-lg font-extrabold text-slate-900">{selectedBooking.userName}</p>
                    <p className="text-xs text-slate-500 font-medium">UID: {selectedBooking.userUid.slice(0, 8)}...</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Resort Partner</p>
                    <p className="text-lg font-extrabold text-ocean-blue">{selectedBooking.resortName}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Booked On</p>
                    <p className="font-bold text-slate-700">{new Date(selectedBooking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Guests</p>
                    <p className="font-bold text-slate-700">{selectedBooking.guests} Persons</p>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-[32px] p-6 space-y-6 border border-slate-100">
                  <div className="flex justify-between items-center">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Accommodation</p>
                      <p className="font-extrabold text-slate-900 text-lg">{selectedBooking.roomName || 'Selected Package'}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-1">Total Amount</p>
                      <p className="text-2xl font-black text-slate-900">₱{selectedBooking.amount.toLocaleString()}</p>
                    </div>
                  </div>
                  
                  <div className="h-px bg-slate-200/50" />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Check-In</p>
                      <p className="font-bold text-slate-700">{new Date(selectedBooking.checkIn).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Check-Out</p>
                      <p className="font-bold text-slate-700">{new Date(selectedBooking.checkOut).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-2xl border border-blue-100 flex items-center gap-3">
                  <Shield size={20} className="text-blue-500" />
                  <div>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Payment Provider</p>
                    <p className="text-sm font-extrabold text-blue-900">{selectedBooking.provider || 'Internal ShorePay Wallet'}</p>
                  </div>
                </div>
              </div>

              <div className="p-8 bg-slate-50">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="w-full py-5 bg-slate-900 text-white rounded-[24px] font-extrabold shadow-xl hover:bg-slate-800 transition-all active:scale-95"
                >
                  Close Overview
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
