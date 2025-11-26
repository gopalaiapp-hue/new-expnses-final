@echo off
echo ================================
echo FRESH BUILD APK and AAB with LATEST CHANGES
echo ================================
echo.

cd android

echo Cleaning previous build...
call gradlew.bat clean
if %errorlevel% neq 0 (
    echo Failed to clean
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

echo Building fresh APK...
call gradlew.bat assembleRelease --no-daemon
if %errorlevel% neq 0 (
    echo Failed to build APK
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

echo Building fresh AAB...
call gradlew.bat bundleRelease --no-daemon
if %errorlevel% neq 0 (
    echo Failed to build AAB
    cd ..
    pause
    exit /b %errorlevel%
)
echo.

cd ..

echo ================================
echo FRESH BUILD TOOK PLACE AT %TIME% ON %DATE%
echo ================================
echo.
echo APK location: android\app\build\outputs\apk\release\app-release.apk
echo AAB location: android\app\build\outputs\bundle\release\app-release.aab
echo.
echo Verify timestamps are recent:
cmd /c echo APK timestamp: && cmd /c dir android\app\build\outputs\apk\release\app-release.apk
cmd /c echo AAB timestamp: && cmd /c dir android\app\build\outputs\bundle\release\app-release.aab
echo.
pause
