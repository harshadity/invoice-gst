@echo off
echo ========================================
echo Invoice GST App - Fix and Start Script
echo ========================================
echo.

echo Step 1: Cleaning up processes...
taskkill /F /IM node.exe 2>nul
timeout /t 2 >nul

echo Step 2: Removing database lock...
del prisma\dev.sqlite-journal 2>nul
timeout /t 2 >nul

echo Step 3: Running database migration...
call npx prisma migrate deploy
if %errorlevel% neq 0 (
    echo Migration failed, trying alternative approach...
    call npx prisma db push --accept-data-loss
)

echo Step 4: Generating Prisma Client...
call npx prisma generate

echo Step 5: Starting development server...
echo.
echo ========================================
echo App should start in a few seconds...
echo Press Ctrl+C to stop the server
echo ========================================
echo.

call npm run dev
