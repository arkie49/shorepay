import { initializeApp } from 'firebase/app';
import { get, getDatabase, ref, remove, set, update } from 'firebase/database';

const cfg = {
  apiKey: 'AIzaSyAehqVgsJYcoXVcKSIhZAqDylcD9IyOBDE',
  authDomain: 'shorepay-5c7ce.firebaseapp.com',
  databaseURL: 'https://shorepay-5c7ce-default-rtdb.firebaseio.com',
  projectId: 'shorepay-5c7ce',
  storageBucket: 'shorepay-5c7ce.firebasestorage.app',
  messagingSenderId: '293166599551',
  appId: '1:293166599551:web:293b4a55602cb4ae4a5e4a',
};

async function sha256Hex(input) {
  const enc = new TextEncoder().encode(input);
  const hashBuf = await crypto.subtle.digest('SHA-256', enc);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function emailKey(email) {
  const base64 = btoa(email);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

const app = initializeApp(cfg);
const db = getDatabase(app);

const uid = `smoke_${Math.random().toString(36).slice(2)}`;
const email = `smoke_${Date.now()}@test.local`;
const password = 'P@ssw0rd123';

const passwordHash = await sha256Hex(`${uid}:${password}`);
const profile = {
  uid,
  email,
  fullName: 'Smoke Test',
  username: 'smoke',
  balance: 1000,
  role: 'customer',
  createdAt: new Date().toISOString(),
  passwordHash,
};

try {
  await set(ref(db, `users/${uid}`), profile);
  await set(ref(db, `usersByEmail/${emailKey(email)}`), uid);

  const uidSnap = await get(ref(db, `usersByEmail/${emailKey(email)}`));
  const uid2 = uidSnap.val();
  const uSnap = await get(ref(db, `users/${uid2}`));
  const u = uSnap.val();
  console.log('signup/login lookup ok', Boolean(uid2 === uid && u && u.passwordHash === passwordHash));

  const txId = `tx_${Math.random().toString(36).slice(2)}`;
  const tx = {
    id: txId,
    fromUid: uid,
    toUid: uid,
    amount: 100,
    type: 'cash-in',
    status: 'confirmed',
    timestamp: new Date().toISOString(),
    description: 'Top up via GCash',
  };

  await set(ref(db, `transactionsByUser/${uid}/${txId}`), tx);
  await update(ref(db, `users/${uid}`), { balance: 1100 });

  const balSnap = await get(ref(db, `users/${uid}/balance`));
  const txSnap = await get(ref(db, `transactionsByUser/${uid}/${txId}`));
  console.log('balance ok', balSnap.val() === 1100);
  console.log('tx ok', txSnap.val() && txSnap.val().amount === 100);
} finally {
  await remove(ref(db, `transactionsByUser/${uid}`));
  await remove(ref(db, `usersByEmail/${emailKey(email)}`));
  await remove(ref(db, `users/${uid}`));
  console.log('cleaned');
}
