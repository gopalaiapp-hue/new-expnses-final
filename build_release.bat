@echo off
echo ================================
echo Building Release APK and AAB
echo ================================
echo.

echo Step 1: Building web assets...
call npm run build
if %errorlevel% neq 0 (
    echo Failed to build web assets
    pause
    exit /b %errorlevel%
)
echo Web build completed successfully!
echo.

echo Step 2: Syncing with Android...
call npx cap sync android
if %errorlevel% neq 0 (
    echo Failed to sync with Android
    pause
    exit /b %errorlevel%
)
echo Sync completed successfully!
echo.

cd android

echo Step 3: Building Release APK...
call gradlew.bat assembleRelease
if %errorlevel% neq 0 (
    echo Failed to build APK
    cd ..
    pause
    exit /b %errorlevel%
)
echo APK built successfully!
echo.

echo Step 4: Building Release AAB (Bundle)...
call gradlew.bat bundleRelease
if %errorlevel% neq 0 (
    echo Failed to build AAB
    cd ..
    pause
    exit /b %errorlevel%
)
echo AAB built successfully!
echo.

cd ..

echo ================================
echo Build completed successfully!
echo ================================
echo.
echo APK location: android\app\build\outputs\apk\release\app-release.apk
echo AAB location: android\app\build\outputs\bundle\release\app-release.aab
echo.
pause
