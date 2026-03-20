# Troubleshooting Guide

## Issue 1: Shopify Tunnel Error (530 - Argo Tunnel)

**Error Message:**
```
530 - The origin has been unregistered from Argo Tunnel
```

**Cause:**
- The Shopify development tunnel has disconnected
- The dev server was stopped or crashed
- Network connection was interrupted

**Solutions:**

### Solution 1: Restart Dev Server (Recommended)
```bash
# Stop any running processes (Ctrl+C in terminal)

# Navigate to project directory
cd c:\Users\asus\OneDrive\Desktop\invoice-gst

# Restart the development server
npm run dev
```

### Solution 2: If Migration is Needed First
```bash
# 1. Stop dev server (Ctrl+C)

# 2. Run database migration
npx prisma migrate dev

# When prompted, enter migration name:
add_gst_settings_templates

# 3. Generate Prisma Client
npx prisma generate

# 4. Restart dev server
npm run dev
```

### Solution 3: Reset Shopify Configuration (If tunnel keeps failing)
```bash
# Reconnect to Shopify
npm run config:link

# Then restart dev server
npm run dev
```

## Issue 2: Database Locked Error

**Error Message:**
```
Error: SQLite database error - database is locked
```

**Solution:**
1. Stop ALL running dev servers
2. Close any database viewer tools
3. Wait 10 seconds
4. Run migration again

```bash
npx prisma migrate dev
```

## Issue 3: Module Not Found After Updates

**Error Message:**
```
Cannot find module '@prisma/client'
```

**Solution:**
```bash
npm install
npx prisma generate
npm run dev
```

## Backward Compatibility Checks

### ✅ No Breaking Changes Made

All changes are **additive** and maintain backward compatibility:

1. **New Database Tables** - Only adds new tables, doesn't modify existing ones
2. **Settings Migration** - Uses metafields as fallback if database settings not found
3. **PDF Generator** - Falls back to shop data if settings are null
4. **Product GST** - Defaults to 18% if no GST data exists
5. **Templates** - Falls back to first template if no selection exists

### Files That Were NOT Changed (Safe)

- `app/routes/app._index.jsx` - Dashboard unchanged
- `app/routes/app.customers.jsx` - Customers page unchanged
- `app/components/CustomerTable.jsx` - Customer table unchanged
- All webhook routes unchanged
- Authentication routes unchanged

### Verification Checklist

Run these tests to ensure nothing is broken:

#### 1. Basic App Loading
- [ ] App loads without errors
- [ ] Dashboard page works
- [ ] Navigation works

#### 2. Customers Page (Unchanged)
- [ ] Customers page loads
- [ ] Customer list displays
- [ ] Search/filter works

#### 3. Orders Page (Enhanced)
- [ ] Orders page loads
- [ ] Order list displays
- [ ] Existing filters work
- [ ] **New:** Action buttons appear
- [ ] **New:** Download invoice works

#### 4. Products Page (Enhanced)
- [ ] Products page loads
- [ ] Product list displays
- [ ] Existing columns show correctly
- [ ] **New:** GST column appears
- [ ] **New:** Edit GST modal works

#### 5. Settings Page (Enhanced)
- [ ] Settings page loads
- [ ] All fields display
- [ ] Can save settings
- [ ] **New:** GSTIN field appears
- [ ] **New:** Data saves to database

#### 6. Templates Page (Enhanced)
- [ ] Templates page loads
- [ ] All tabs work
- [ ] Template selection works
- [ ] **New:** Saves to database instead of metafields

#### 7. Reports Page (Enhanced)
- [ ] Reports page loads
- [ ] Generate report works
- [ ] **New:** PDF has better formatting
- [ ] **New:** Summary totals appear

## Common Errors and Fixes

### Error: "Cannot read properties of undefined (reading 'companyLegalName')"

**Cause:** Settings not yet configured in database

**Fix:**
1. Navigate to Settings page
2. Fill in company information
3. Click Save
4. Settings will auto-create in database

### Error: "Unique constraint failed on the fields: (`shop`,`productId`)"

**Cause:** Trying to create duplicate GST record

**Fix:** This is handled by `upsert` - should not occur. If it does:
```bash
# Reset GST data (development only)
npx prisma studio
# Manually delete duplicate records from ProductGST table
```

### Error: Template selection not saving

**Cause:** Database table not created yet

**Fix:**
```bash
npx prisma migrate dev
npx prisma generate
npm run dev
```

### Error: Invoice PDF shows "Shop Name" instead of company name

**Cause:** Settings not loaded or not saved

**Fix:**
1. Go to Settings page
2. Enter company information
3. Click Save
4. Refresh Orders page
5. Try downloading invoice again

## Migration Recovery

If migration fails or corrupts database:

### Option 1: Reset Migration (Development Only - WILL DELETE DATA)
```bash
npx prisma migrate reset
npx prisma migrate dev
npx prisma generate
```

### Option 2: Manual SQL Fix
```bash
# Open Prisma Studio
npx prisma studio

# Manually verify tables exist:
# - AppSettings
# - ProductGST
# - TemplateCustomization
```

### Option 3: Fresh Migration
```bash
# Delete migrations folder
rm -rf prisma/migrations

# Delete database
rm prisma/dev.sqlite

# Run fresh migration
npx prisma migrate dev --name initial_with_gst
```

## Performance Checks

After implementing changes, verify:

- [ ] Orders page loads in < 3 seconds
- [ ] Products page loads in < 3 seconds
- [ ] Settings page loads in < 2 seconds
- [ ] PDF generation takes < 2 seconds
- [ ] Report generation takes < 5 seconds

## Security Checks

Verify no sensitive data exposed:

- [ ] Database credentials not in code
- [ ] API keys not in frontend
- [ ] Settings data scoped to shop
- [ ] GST data scoped to shop
- [ ] Templates scoped to shop

## Network Issues

If Shopify tunnel keeps disconnecting:

1. **Check Internet Connection**
2. **Check Firewall Settings** - Allow Node.js
3. **Try Different Network** - Switch to mobile hotspot temporarily
4. **Update Shopify CLI**
   ```bash
   npm install -g @shopify/cli
   ```

## Still Having Issues?

1. **Check Browser Console** (F12) for frontend errors
2. **Check Terminal** for backend errors
3. **Check Prisma Studio** to verify database
   ```bash
   npx prisma studio
   ```
4. **Verify Environment**
   - Node version >= 20.19
   - npm version >= 9.0
   - Shopify CLI installed

## Quick Health Check Script

Run this to verify everything:

```bash
# Check Node version
node --version

# Check npm version
npm --version

# Check Prisma version
npx prisma --version

# Verify database connection
npx prisma db pull

# Check for errors in schema
npx prisma validate

# Generate client
npx prisma generate

# Start dev server
npm run dev
```

## Emergency Rollback

If everything breaks and you need to rollback:

```bash
# 1. Stop server
Ctrl+C

# 2. Restore original files (if you have backup)
git checkout app/routes/app.settings.jsx
git checkout app/routes/app.products.jsx
git checkout app/routes/app.orders.jsx
git checkout app/routes/app.templates.jsx
git checkout app/routes/app.reports.jsx
git checkout app/components/OrdersTable.jsx
git checkout app/components/ProductTable.jsx
git checkout app/utils/pdfGenerator.js
git checkout prisma/schema.prisma

# 3. Reset database
npx prisma migrate reset

# 4. Restart
npm run dev
```

---

**Need More Help?**

Contact support or check:
- Shopify CLI docs: https://shopify.dev/docs/api/shopify-cli
- Prisma docs: https://www.prisma.io/docs
- React Router docs: https://reactrouter.com/

**Last Updated:** December 2025
