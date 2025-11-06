@echo off
echo ========================================
echo Fixing TypeScript Cache Issues
echo ========================================
echo.

echo Step 1: Removing .next cache...
if exist ".next" (
    rmdir /s /q ".next"
    echo ✓ .next cache cleared
) else (
    echo ! .next directory not found
)
echo.

echo Step 2: Removing TypeScript build info...
if exist "tsconfig.tsbuildinfo" (
    del /f /q "tsconfig.tsbuildinfo"
    echo ✓ TypeScript build info cleared
) else (
    echo ! tsconfig.tsbuildinfo not found
)
echo.

echo Step 3: Clearing node_modules cache...
if exist "node_modules\.cache" (
    rmdir /s /q "node_modules\.cache"
    echo ✓ node_modules cache cleared
) else (
    echo ! node_modules cache not found
)
echo.

echo ========================================
echo Cache cleared successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Close all terminals running 'npm run dev'
echo 2. In VS Code, press Ctrl+Shift+P
echo 3. Type "TypeScript: Restart TS Server"
echo 4. Press Enter
echo 5. Run 'npm run dev' again
echo.
pause
