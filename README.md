# ShorePay

ShorePay is a coastal payment and resort booking application.

## Firebase Setup

This application uses Firebase Realtime Database for its backend. To set it up correctly:

### 1. Environment Variables
Ensure the following environment variables are set in your deployment (e.g., Vercel) or your `.env` file:

- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_DATABASE_URL`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

You can find these in your Firebase Project Settings under "General" -> "Your apps".

### 2. Realtime Database Rules
Since the app uses a custom authentication logic on top of the Realtime Database, you must configure your database rules to allow read/write access. For a demo/development environment, you can use:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

*Note: In a production environment, you should implement more granular rules to secure user data.*

### 3. Troubleshooting
If you see "Firebase permission denied" errors during login or signup, it means your Realtime Database rules are too restrictive. Refer to the rules section above.
