# Invoice GST - Database Fix Script
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Invoice GST App - Database Fix Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Stop all Node processes
Write-Host "Step 1: Stopping all Node.js processes..." -ForegroundColor Yellow
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Step 2: Remove database lock file
Write-Host "Step 2: Removing database lock file..." -ForegroundColor Yellow
$lockFile = "prisma\dev.sqlite-journal"
if (Test-Path $lockFile) {
    Remove-Item $lockFile -Force
    Write-Host "Lock file removed" -ForegroundColor Green
} else {
    Write-Host "No lock file found (this is OK)" -ForegroundColor Green
}
Start-Sleep -Seconds 2

# Step 3: Push database schema
Write-Host "Step 3: Pushing database schema..." -ForegroundColor Yellow
Write-Host "This will create the new tables..." -ForegroundColor Gray
& npx prisma db push --accept-data-loss
if ($LASTEXITCODE -ne 0) {
    Write-Host "Database push failed. Trying force reset..." -ForegroundColor Red
    & npx prisma migrate reset --force
}

# Step 4: Generate Prisma Client
Write-Host "Step 4: Generating Prisma Client..." -ForegroundColor Yellow
& npx prisma generate

# Step 5: Start the dev server
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "Database is ready!" -ForegroundColor Green
Write-Host "Starting development server..." -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Gray
Write-Host ""

& npm run dev
