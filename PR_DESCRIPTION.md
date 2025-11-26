# Pull Request: Android Build Fixes and UI Enhancements

## Summary
This PR consolidates recent updates to the Android build configuration and various UI enhancements across the application. It addresses build stability issues and improves the user experience for transaction management.

## Changes

### 📱 Android Build & Configuration
- **Updated Build Gradle**: Adjusted `android/app/build.gradle` and `android/build.gradle` to resolve dependency conflicts and update version codes.
- **Package Updates**: Updated `package.json` to reflect current dependencies.

### 🎨 UI & Features
- **Recurring Transactions**: Enhanced `RecurringTransactionsList.tsx` to support better editing and viewing of recurring items.
- **Category Selection**: Updated `CategorySelect.tsx` to include custom icons and improved selection logic.
- **Payment & Reports**: Refined `PaymentLineRow.tsx` and `ReportsScreen.tsx` for better visual consistency and data presentation.
- **Utilities**: Updates to `src/lib/utils.ts` and `src/lib/db.ts` to support new feature logic.
- **Types**: Extended type definitions in `src/types/index.ts`.

## Type of Change
- [x] 🐛 Bug fix (non-breaking change which fixes an issue)
- [x] ✨ New feature (non-breaking change which adds functionality)
- [x] 🔧 Chore (maintenance, build, or refactoring)

## Verification
- **Build**: Successfully built Android APK/AAB with updated configurations.
- **UI Testing**: Verified Category Selection and Recurring Transactions flows in the app.
