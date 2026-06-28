# 📱 Android Build Guide - HM App

## Overview

This guide will help you build the Hospital Management System as a native Android application using Capacitor.

---

## Prerequisites

Before you begin, ensure you have the following installed:

### 1. **Node.js & npm**
- Version: 18+ recommended
- Check version: `node --version` and `npm --version`

### 2. **Java Development Kit (JDK)**
- Version: JDK 17 (recommended for Capacitor 8.x)
- Download: https://www.oracle.com/java/technologies/downloads/#java17

**Verify installation:**
```bash
java --version
javac --version
```

### 3. **Android Studio**
- Download: https://developer.android.com/studio
- Version: Latest stable release
- Make sure to install:
  - Android SDK
  - Android SDK Platform-Tools
  - Android SDK Build-Tools
  - Android Emulator (for testing)

### 4. **Environment Variables (Windows)**

Add to your System Environment Variables:

```
JAVA_HOME = C:\Program Files\Java\jdk-17
ANDROID_HOME = C:\Users\[YourUsername]\AppData\Local\Android\Sdk

Path additions:
%JAVA_HOME%\bin
%ANDROID_HOME%\platform-tools
%ANDROID_HOME%\tools
```

**Restart your terminal after setting environment variables.**

---

## Step 1: Install Dependencies

Navigate to your project root:

```bash
cd "d:\HospitalManagementSystem\HM App"
npm install
```

This will install Capacitor CLI and Android platform dependencies already listed in `package.json`.

---

## Step 2: Build Web Assets

Before initializing Android, build your React app:

```bash
npm run build
```

This creates the `dist/` folder with optimized web assets.

---

## Step 3: Initialize Android Platform

Add Android platform to your project:

```bash
npm run android:init
```

This command:
- Creates an `android/` folder in your project
- Sets up the Android project structure
- Links to your web build (dist folder)

**Expected output:** `✔ Adding native android project in android in XX.XXs`

---

## Step 4: Sync Web Assets to Android

Sync your built web files to the Android project:

```bash
npm run android:sync
```

This copies `dist/` contents to `android/app/src/main/assets/public/`

---

## Step 5: Open in Android Studio

Launch Android Studio with your project:

```bash
npm run android:open
```

Android Studio will open with the `android/` folder loaded.

**First-time setup in Android Studio:**
1. Wait for Gradle sync to complete (bottom status bar)
2. If prompted, update Gradle or Android Gradle Plugin
3. Accept any license agreements

---

## Step 6: Build Debug APK

### Option A: Using Android Studio GUI

1. In Android Studio: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Wait for build to complete (~2-5 minutes first time)
3. APK location: `android/app/build/outputs/apk/debug/app-debug.apk`
4. Click "locate" link in success notification to find APK

### Option B: Using Command Line

```bash
cd android
./gradlew assembleDebug
```

APK will be at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Step 7: Test on Device/Emulator

### Option 1: Install on Physical Device

1. Enable **Developer Options** on your Android device:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable **USB Debugging**:
   - Settings → Developer Options → USB Debugging
3. Connect device via USB
4. Run:
   ```bash
   npm run android:run
   ```
   Or drag-and-drop `app-debug.apk` to device

### Option 2: Run on Android Emulator

1. In Android Studio: **Tools** → **Device Manager**
2. Create virtual device (e.g., Pixel 6, API 33)
3. Start emulator
4. Run:
   ```bash
   npm run android:run
   ```

---

## Step 8: Build Signed Release APK (Production)

For production/distribution, you need a signed APK.

### Create Keystore

```bash
cd android/app
keytool -genkey -v -keystore hm-app-release.keystore -alias hm-app -keyalg RSA -keysize 2048 -validity 10000
```

**Enter details when prompted:**
- Password: (save this securely!)
- Name, Organization, etc.

### Configure Gradle Signing

1. Create `android/key.properties`:
```properties
storePassword=YOUR_KEYSTORE_PASSWORD
keyPassword=YOUR_KEY_PASSWORD
keyAlias=hm-app
storeFile=app/hm-app-release.keystore
```

2.  Add to `.gitignore`:
```
android/key.properties
android/app/*.keystore
```

3. Edit `android/app/build.gradle`:

Find the `android {}` block and add before `buildTypes`:

```gradle
signingConfigs {
    release {
        if (project.hasProperty('key.properties')) {
            def keystorePropertiesFile = rootProject.file("key.properties")
            def keystoreProperties = new Properties()
            keystoreProperties.load(new FileInputStream(keystorePropertiesFile))

            keyAlias keystoreProperties['keyAlias']
            keyPassword keystoreProperties['keyPassword']
            storeFile file(keystoreProperties['storeFile'])
            storePassword keystoreProperties['storePassword']
        }
    }
}
```

Then modify `buildTypes`:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled false
        proguardFiles getDefaultProguardFile('proguard-android.txt'), 'proguard-rules.pro'
    }
}
```

### Build Release APK

```bash
cd android
./gradlew assembleRelease
```

Release APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## Development Workflow

### Making Changes to Web Code

Every time you update React code:

```bash
# 1. Rebuild web assets
npm run build

# 2. Sync to Android
npm run android:sync

# 3. Run on device/emulator
npm run android:run
```

**Or use the combined command:**
```bash
npm run android:build
```

### Live Reload (Development)

For faster development, use Capacitor Live Reload:

1. Start Vite dev server:
   ```bash
   npm run dev
   ```
2. Note the local IP (e.g., `http://192.168.1.100:5173`)
3. Edit `capacitor.config.ts`:
   ```typescript
   server: {
     url: 'http://192.168.1.100:5173',
     cleartext: true
   }
   ```
4. Sync and run:
   ```bash
   npm run android:sync
   npm run android:run
   ```

Now changes auto-reload on device!

**Remember to remove `server.url` before building release APK.**

---

## Troubleshooting

### Issue: Gradle build fails

**Solution:**
- Update Android Gradle Plugin in Android Studio
- File → Settings → Appearance & Behavior → System Settings → Android SDK
- Install latest SDK Platform and Build Tools

### Issue: "JAVA_HOME not set"

**Solution:**
```bash
# Windows PowerShell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"

# Verify
echo $env:JAVA_HOME
```

### Issue: "SDK location not found"

**Solution:**
Create `android/local.properties`:
```properties
sdk.dir=C\:\\Users\\YourUsername\\AppData\\Local\\Android\\Sdk
```

### Issue: App crashes on launch

**Solution:**
- Check LogCat in Android Studio (View → Tool Windows → Logcat)
- Common issues:
  - Missing `dist/` folder → Run `npm run build`
  - Network permissions → Added automatically by Capacitor
  - Incorrect `webDir` in `capacitor.config.ts`

### Issue: White screen on app launch

**Solution:**
1. Verify dist folder exists and has files
2. Check `capacitor.config.ts` has correct `webDir: 'dist'`
3. Run `npm run android:sync` again
4. Check browser console in WebView (connect device, open Chrome DevTools)

---

## APK Size Optimization

Default debug APK: ~15-25 MB  
Release APK (minified): ~8-15 MB

**To reduce size further:**

1. Enable ProGuard/R8 (in `android/app/build.gradle`):
```gradle
buildTypes {
    release {
        minifyEnabled true
        shrinkResources true
    }
}
```

2. Use App Bundle (AAB) instead of APK for Play Store:
```bash
cd android
./gradlew bundleRelease
```

AAB location: `android/app/build/outputs/bundle/release/app-release.aab`

---

## Publishing to Google Play Store

1. Build signed App Bundle (AAB)
2. Go to [Google Play Console](https://play.google.com/console)
3. Create new application
4. Upload AAB
5. Fill in store listing details
6. Set up pricing & distribution
7. Submit for review

**App requirements:**
- Target API level 33+ (Android 13)
- Privacy policy URL
- App icon (512x512 PNG)
- Feature graphic (1024x500 PNG)
- Screenshots (phone and tablet)

---

## Useful Commands

```bash
# List Capacitor info
npx cap doctor

# Update Capacitor
npm install @capacitor/cli@latest @capacitor/core@latest @capacitor/android@latest

# Clean Android build
cd android
./gradlew clean

# View Android logs
adb logcat

# List connected devices
adb devices
```

---

## Next Steps

- ✅ Test all app features on Android
- ✅ Optimize for different screen sizes
- ✅ Test offline functionality
- ✅ Add app icon and splash screen
- ✅ Configure push notifications (if needed)
- ✅ Submit to Play Store

---

**App ID:** `com.hospital.hmapp`  
**App Name:** HM App  
**Min SDK:** API 22 (Android 5.1)  
**Target SDK:** API 34 (Android 14)
