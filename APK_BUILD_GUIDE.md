# 📱 KharchaPal APK Build Guide

## ✅ What We've Done

Your React web app has been successfully prepared for APK building using **Capacitor**:

1. ✅ Installed Capacitor and Android dependencies
2. ✅ Built production web assets (in `/build` folder)
3. ✅ Initialized Capacitor project with app ID: `com.kharchapal.app`
4. ✅ Added Android platform
5. ✅ Synced web assets to Android project

## 📋 Prerequisites for APK Build

To build the APK, you need to install:

### **1. Java Development Kit (JDK)**
- Download: https://www.oracle.com/java/technologies/downloads/
- Required: JDK 11 or higher
- Windows: Add to PATH environment variable

### **2. Android SDK**
**Option A: Android Studio (Recommended)**
- Download: https://developer.android.com/studio
- Install Android SDK during setup
- Install Android SDK Platform (API 34)
- Install Android Build Tools (v34.0.0 or higher)

**Option B: Android SDK Command Line Tools**
- Download: https://developer.android.com/studio#command-tools
- Extract to a folder
- Set `ANDROID_SDK_ROOT` environment variable

### **3. Gradle**
- Usually comes with Android Studio
- Or download: https://gradle.org/releases/

## 🛠️ Setting Up Environment Variables

After installing, add to Windows environment variables:

```
JAVA_HOME = C:\Program Files\Java\jdk-11 (or your JDK path)
ANDROID_SDK_ROOT = C:\Users\YourUsername\AppData\Local\Android\Sdk
ANDROID_HOME = (same as ANDROID_SDK_ROOT)
```

Add to PATH:
```
%JAVA_HOME%\bin
%ANDROID_SDK_ROOT%\platform-tools
%ANDROID_SDK_ROOT%\tools
```

## 🚀 Build APK Steps (After Prerequisites)

### **Step 1: Navigate to Android Folder**
```powershell
cd e:\new-working-1\new-expnses-final\android
```

### **Step 2: Build Release APK**
```powershell
./gradlew build
# or for release APK
./gradlew assembleRelease
```

### **Step 3: Find Your APK**
After successful build, APK will be at:
```
android/app/build/outputs/apk/release/app-release.apk
# or for debug
android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔄 Rebuilding After Code Changes

If you modify the web app code:

```powershell
# 1. Rebuild web assets
npm run build

# 2. Sync to Android
npx cap sync android

# 3. Build APK
cd android
./gradlew assembleRelease
```

## 📊 Project Structure

```
new-expnses-final/
├── build/                 # Web app production build (used in APK)
├── src/                   # React source code
├── android/               # Android native project
│   ├── app/               # Main app module
│   ├── gradlew           # Gradle wrapper script
│   └── build.gradle      # Build configuration
├── capacitor.config.json # Capacitor configuration
└── package.json          # NPM dependencies
```

## 🎯 Capacitor Configuration

Current configuration in `capacitor.config.json`:
```json
{
  "appId": "com.kharchapal.app",
  "appName": "KharchaPal",
  "webDir": "build"
}
```

## 🔑 Signing Release APK (Production)

To create a signed APK for Play Store:

### **1. Generate Keystore (First Time Only)**
```powershell
keytool -genkey -v -keystore kharchapal-key.keystore `
  -keyalg RSA -keysize 2048 -validity 10000 `
  -alias kharchapal-key
```

### **2. Update Build Configuration**
Edit `android/app/build.gradle` and add:
```gradle
signingConfigs {
    release {
        storeFile file('path/to/kharchapal-key.keystore')
        storePassword 'your-password'
        keyAlias 'kharchapal-key'
        keyPassword 'your-password'
    }
}

buildTypes {
    release {
        signingConfig signingConfigs.release
    }
}
```

### **3. Build Signed APK**
```powershell
cd android
./gradlew assembleRelease
```

## ⚠️ Common Issues

### **Issue: "gradlew: command not found"**
**Solution:** Use `./gradlew` on PowerShell or `gradlew.bat` for cmd

### **Issue: "Java not found"**
**Solution:** Install JDK and set JAVA_HOME environment variable

### **Issue: "Android SDK not found"**
**Solution:** Install Android Studio and set ANDROID_SDK_ROOT

### **Issue: Build fails with "Could not find SDK"**
**Solution:** Open Android Studio → Tools → SDK Manager → Install required SDKs

## 📦 APK Specifications

- **App ID:** com.kharchapal.app
- **App Name:** KharchaPal
- **Min API Level:** Usually 21 (Android 5.0)
- **Target API Level:** Usually 34 (Android 14)

## 🎓 Quick Commands Reference

```powershell
# Rebuild web
npm run build

# Sync to Android
npx cap sync android

# Open Android Studio
npx cap open android

# Build debug APK
cd android && ./gradlew assembleDebug

# Build release APK
cd android && ./gradlew assembleRelease

# Clean build
cd android && ./gradlew clean build
```

## 📞 Next Steps

1. **Install Prerequisites:**
   - Java JDK 11+
   - Android Studio or Android SDK

2. **Set Environment Variables:**
   - JAVA_HOME
   - ANDROID_SDK_ROOT
   - Update PATH

3. **Build APK:**
   - Run `./gradlew assembleRelease` in android folder

4. **Test APK:**
   - Install on device: `adb install app-release.apk`
   - Or upload to Google Play Store

## 🚀 Alternative: Cloud Build Services

If you don't want to install Android SDK locally, you can use:
- **EAS Build** (Expo): https://eas.expo.dev
- **App Center**: https://appcenter.ms
- **Firebase App Distribution**: https://firebase.google.com/docs/app-distribution

These services build your APK in the cloud!

---

**Status:** ✅ Project prepared for APK building
**Created:** November 15, 2025
**App Version:** 0.1.0
