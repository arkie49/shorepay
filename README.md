<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/ef862aac-e859-49bc-a067-58ffdac5d65b

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Build Android APK (Capacitor)

**Prerequisites:** Node.js, Android Studio, Android SDK, Java (JDK 17 recommended)

1. Install dependencies:
   `npm install`
2. Build the web app:
   `npm run apk:build:web`
3. Initialize Capacitor (first time only):
   - If you see: "Cannot run init for a project using a non-JSON configuration file", skip init (this project is already initialized) and continue to syncing.
   - Otherwise:
     `npx cap init shorepay com.shorepay.app --web-dir dist`
4. Add Android platform (first time only):
   - If `android/` already exists, skip this step.
   - Otherwise:
     `npx cap add android`
5. Sync changes to Android:
   `npx cap sync android`
6. Open Android Studio:
   `npx cap open android`
7. Build a Debug APK (recommended first):
   - In Android Studio: Build → Build Bundle(s) / APK(s) → Build APK(s)
   - Output usually appears under `android/app/build/outputs/apk/debug/`
8. Build a Release APK (signed):
   - Create a keystore (run from `android/app/`):
     `keytool -genkeypair -v -keystore shorepay-release.keystore -alias shorepay -keyalg RSA -keysize 2048 -validity 10000`
   - Create `android/keystore.properties` based on [keystore.properties.example](android/keystore.properties.example)
   - In Android Studio: Build → Generate Signed Bundle / APK… → APK → choose release → Finish
   - Output usually appears under `android/app/build/outputs/apk/release/`

If you need camera access on Android, ensure the app has Camera permission in Android settings. For network testing on a phone browser, camera requires HTTPS.
