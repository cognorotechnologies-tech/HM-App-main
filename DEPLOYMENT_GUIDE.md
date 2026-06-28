# 🚀 Deployment Guide - Hospital Management System

## Overview

This guide covers deploying the Hospital Management System to production environments.

---

## Table of Contents

1. [cPanel Web Hosting Deployment](#cpanel-deployment)
2. [Supabase Backend Setup](#supabase-setup)
3. [Environment Configuration](#environment-configuration)
4. [Production Checklist](#production-checklist)

---

## cPanel Deployment

### Prerequisites

- cPanel hosting account with:
  - Node.js support (v18+)
  - File Manager access
  - Domain/subdomain configured

### Step 1: Build Production Bundle

On your local machine:

```bash
cd "d:\HospitalManagementSystem\HM App"

# Install dependencies
npm install

# Create production build
npm run build
```

This creates a `dist/` folder with optimized files.

### Step 2: Prepare for Upload

Create `.htaccess` file in your local `dist/` folder for SPA routing:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Step 3: Upload to cPanel

**Option A: File Manager Upload**

1. Login to cPanel
2. Open **File Manager**
3. Navigate to `public_html/` (or subdomain folder)
4. Upload all files from `dist/` folder
5. Extract if uploaded as ZIP

**Option B: FTP Upload**

1. Use FileZilla or similar FTP client
2. Connect to your hosting
3. Navigate to `public_html/`
4. Upload all files from `dist/`

### Step 4: Configure Environment Variables

Since `.env` files don't work in static builds, you have two options:

**Option A: Build-time variables**

Before building, set in `.env`:
```
VITE_API_URL=https://yourdomain.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Then rebuild: `npm run build`

**Option B: Runtime config (Recommended)**

Create `config.js` in `public/` folder:
```javascript
window.APP_CONFIG = {
  API_URL: 'https://yourdomain.com/api',
  SUPABASE_URL: 'https://your-project.supabase.co',
  SUPABASE_ANON_KEY: 'your-anon-key'
};
```

Then reference in app via `window.APP_CONFIG.API_URL`

### Step 5: Test Deployment

1. Visit your domain (e.g., https://yourdomain.com)
2. Verify homepage loads
3. Test navigation (should use client-side routing)
4. Check browser console for errors

---

## Supabase Setup

### Step 1: Create Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click **New Project**
3. Choose organization
4. Enter project details:
   - Name: "Hospital Management System"
   - Database Password: (Save securely!)
   - Region: Choose closest to users
5. Wait for project initialization (~2 minutes)

### Step 2: Run Database Migrations

**Option A: Via SQL Editor (Recommended)**

1. In Supabase Dashboard → **SQL Editor**
2. Copy contents from each migration file in `scripts/migrations/` folder
3. Run migrations in order:
   ```
   20260116_create_rbac_system.sql
   20260117_create_prescriptions.sql
   20260117_create_workflow_system.sql
   ... (all migrations)
   20260121_doctor_enhancements.sql
   ```

**Option B: Via Supabase CLI**

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to project
supabase link --project-ref YOUR_PROJECT_REF

# Push migrations
supabase db push
```

### Step 3: Enable Row Level Security

RLS should auto-enable via migrations, but verify:

1. Go to **Database** → **Tables**
2. For each table, verify **RLS Enabled** toggle is ON
3. Check policies exist for each table

### Step 4: Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (e.g., `https://abc123.supabase.co`)
   - **anon public** key (starts with `eyJ...`)
   - **service_role** key (keep secret, server-side only)

### Step 5: Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Optional: Enable OAuth providers (Google, Facebook, etc.)
4. Go to **URL Configuration**:
   - Site URL: `https://yourdomain.com`
   - Redirect URLs: `https://yourdomain.com/**`

### Step 6: Set up Storage (if using file uploads)

1. Go to **Storage**
2. Create buckets:
   - `medical-documents` (for patient files)
   - `prescriptions` (for prescription PDFs)
   - `avatars` (for profile pictures)
3. Set bucket policies for access control

---

## Environment Configuration

### Development (.env.local)

```env
VITE_API_URL=http://localhost:3001
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Production (.env.production)

```env
VITE_API_URL=https://api.yourdomain.com
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_STRIPE_PUBLIC_KEY=pk_live_...
```

**Security Notes:**
- Never commit `.env` files to Git
- Use different Supabase projects for dev/staging/prod
- Rotate keys regularly
- Use service_role key only server-side

---

## Production Checklist

### Pre-Deployment

- [ ] All migrations applied to production database
- [ ] RLS policies enabled and tested
- [ ] Environment variables configured correctly
- [ ] Test build locally with `npm run preview`
- [ ] Update API URLs to production
- [ ] Remove console.logs and debug code
- [ ] Test authentication flows
- [ ] Verify payment gateway (Stripe) in live mode

### Post-Deployment

- [ ] Test all critical user flows:
  - [ ] Patient registration and login
  - [ ] Doctor login and dashboard
  - [ ] Book appointment end-to-end
  - [ ] Create prescription
  - [ ] Admin panel access
  - [ ] Billing and payments
- [ ] Check browser console for errors
- [ ] Test on mobile devices
- [ ] Verify email notifications work
- [ ] Test WhatsApp integration (if enabled)
- [ ] Monitor Supabase dashboard for errors

### Security Checklist

- [ ] HTTPS enabled (SSL certificate)
- [ ] Supabase RLS policies active
- [ ] API keys not exposed in client code
- [ ] CSP headers configured
- [ ] Rate limiting enabled
- [ ] Regular backups scheduled
- [ ] Audit logs enabled

### Performance Optimization

- [ ] Enable Gzip compression (cPanel: `.htaccess`)
- [ ] Set browser caching headers
- [ ] Use CDN for static assets (optional)
- [ ] Lazy load images
- [ ] Code splitting enabled (Vite does this automatically)
- [ ] Monitor bundle size

---

## Monitoring & Maintenance

### Supabase Database Monitoring

1. **Database** → **Database** → **Usage**
   - Monitor database size
   - Check query performance
   - Review slow queries

2. **Authentication** → **Users**
   - Track daily active users
   - Monitor auth errors

3. **Logs** → View real-time logs for debugging

### Error Tracking

**Option 1: Browser Console**
- Check Network tab for failed API calls
- Monitor Console for JavaScript errors

**Option 2: Sentry Integration (Optional)**
```bash
npm install @sentry/react
```

Configure in `main.tsx`:
```typescript
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "your-sentry-dsn",
  environment: "production"
});
```

### Backup Strategy

1. **Supabase Auto-Backups:**
   - Settings → Database → Point-in-time recovery
   - Enabled on Pro plan

2. **Manual Backups:**
   ```bash
   # Export database
   supabase db dump -f backup-$(date +%Y%m%d).sql
   ```

3. **Backup Schedule:**
   - Daily: Automated via Supabase
   - Weekly: Manual download
   - Before major updates: Full backup

---

## Rollback Procedure

If deployment fails:

1. **Revert Web Files:**
   - Restore previous `dist/` files from backup
   - Or re-deploy last working commit

2. **Revert Database:**
   ```sql
   -- In Supabase SQL Editor
   -- Rollback specific migration
   -- (migrations don't have auto-rollback, be careful!)
   ```

3. **Check Logs:**
   - Supabase logs
   - Browser console
   - Server logs (cPanel)

---

## Troubleshooting

### Issue: 404 on page refresh

**Cause:** SPA routing not configured  
**Solution:** Ensure `.htaccess` file exists in root with rewrite rules

### Issue: API calls failing

**Cause:** CORS or wrong API URL  
**Solution:** 
- Check `VITE_API_URL` in env
- Verify Supabase URL is correct
- Check Network tab for actual error

### Issue: Authentication not working

**Cause:** Supabase redirect URLs not configured  
**Solution:** 
- Supabase Dashboard → Auth → URL Configuration
- Add production domain to redirect URLs

### Issue: Blank page after deployment

**Cause:** Missing build files or path issues  
**Solution:**
- Verify all files from `dist/` uploaded
- Check `index.html` exists
- Inspect browser console for errors

---

## Scaling Considerations

### Database (Supabase)

- **Free tier:** 500 MB database, 50 MB file storage
- **Pro tier ($25/mo):** 8 GB database, 100 GB file storage, daily backups
- **Team/Enterprise:** Custom limits

When to upgrade:
- Database > 400 MB
- More than 50,000 monthly active users
- Need point-in-time recovery

### Hosting (cPanel)

- Monitor bandwidth usage
- Upgrade hosting plan if traffic increases
- Consider CDN for static assets

---

## Support & Resources

- **Supabase Docs:** https://supabase.com/docs
- **Capacitor Docs:** https://capacitorjs.com/docs
- **Vite Docs:** https://vitejs.dev/guide/

---

**Deployment Status:** Ready for Production  
**Last Updated:** 2026-01-21  
**Version:** 1.0.0
