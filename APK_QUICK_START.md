# 🚀 APK Build - Quick Start

## ✅ What's Done
```
✓ Web app built
✓ Capacitor installed
✓ Android platform set up
✓ All files synced
✓ Ready to build APK
```

## 📋 Prerequisites
1. **Java JDK 11+** - https://www.oracle.com/java/
2. **Android Studio** - https://developer.android.com/studio
3. Set `JAVA_HOME` and `ANDROID_SDK_ROOT` environment variables

## 🏗️ Build APK (3 Steps)

### Step 1: Open Terminal
```powershell
cd e:\new-working-1\new-expnses-final\android
```

### Step 2: Build Release APK
```powershell
./gradlew assembleRelease
```

### Step 3: Find Your APK
```
android/app/build/outputs/apk/release/app-release.apk
```

## 💾 Installation Size
- **App Size:** ~1.1 MB compressed
- **Installed Size:** ~3-4 MB on device

## 📱 App Details
- **Name:** KharchaPal
- **Package:** com.kharchapal.app
- **Version:** 0.1.0

## 🔄 After Code Changes

```powershell
npm run build
npx cap sync android
cd android
./gradlew assembleRelease
```

## ⚡ Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Build web app |
| `npx cap sync android` | Update Android files |
| `./gradlew assembleDebug` | Build debug APK (faster) |
| `./gradlew assembleRelease` | Build release APK (production) |
| `./gradlew clean build` | Clean build from scratch |

## 📝 Important Files

- `capacitor.config.json` - App configuration
- `android/app/build.gradle` - Android build settings
- `build/` - Web app files
- `android/` - Android native code

## 🎯 For Play Store

1. Create signed APK (needs keystore)
2. Update version number
3. Test on devices
4. Upload to Google Play Console

## ⚠️ Troubleshooting

**Java not found?**
- Install JDK
- Add `JAVA_HOME` to environment variables

**Android SDK not found?**
- Install Android Studio
- Run SDK Manager to install APIs

**Build fails?**
- Run `./gradlew clean build`
- Check Java/Android installation

## 📚 Full Guide

See `APK_BUILD_GUIDE.md` for detailed instructions

---

**Status: ✅ READY TO BUILD**

Your app is fully prepared. Install prerequisites and run the build commands above!
