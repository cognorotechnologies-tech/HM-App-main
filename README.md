# HM App - Hospital Management System

> A modern, full-featured Hospital Management System with role-based access, workflow automation, and comprehensive patient care modules.

[![React](https://img.shields.io/badge/React-19.2.0-blue.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue.svg)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7.2.5-646CFF.svg)](https://vite.dev)
[![License](https://img.shields.io/badge/License-Proprietary-red.svg)](#)


---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Quick Start](#-quick-start)
- [Demo Credentials](#-demo-credentials)
- [Documentation](#-documentation)
- [Deployment](#-deployment)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)

---

## ✨ Features

### 👥 Role-Based Access System
**6 User Roles** with granular permissions:
- 🔧 **Admin**: Complete system management
- 👨‍⚕️ **Doctor**: Patient consultations, prescriptions
- 🏨 **Receptionist**: Patient registration, queue management
- 🧑‍⚕️ **Patient**: Self-service portal, appointments, health tracking
- 💊 **Pharmacist**: Inventory management, prescription dispensing
- 👩‍⚕️ **Nurse**: Workflow monitoring, task management

### 🏥 Core Modules
- ✅ **Appointment Management**: Online booking, scheduling, queue system
- ✅ **Patient Records**: EMR with medical history, documents, vitals
- ✅ **Doctor Consultations**: Examination, diagnosis, prescription creation
- ✅ **Billing & Payments**: Invoice generation, Stripe integration
- ✅ **Pharmacy**: Real-time inventory, stock alerts, dispensing
- ✅ **Health Tracking**: Vitals monitoring, family management

### 🤖 Advanced Features
- ✅ **Workflow Automation**: Multi-step patient engagement workflows
- ✅ **Campaign Management**: Email/SMS/WhatsApp campaigns
- ✅ **Prescription Templates**: Save time with reusable prescriptions
- ✅ **Analytics Dashboards**: Real-time metrics and insights
- ✅ **Document Management**: Upload, store, retrieve medical records
- ✅ **AI Integration**: Google Gemini AI for advanced features

### 🔒 Security & Compliance
- ✅ **Row Level Security (RLS)**: Database-level data isolation
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Password Encryption**: bcrypt hashing
- ✅ **Audit Logs**: Track all critical actions
- ✅ **HIPAA-Ready**: Architecture supports compliance

---

## 🛠 Tech Stack

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React | 19.2.0 | UI Framework |
| TypeScript | 5.9.3 | Type Safety |
| Vite | 7.2.5 | Build Tool |
| TailwindCSS | 4.1.18 | Styling |
| React Router | 7.12.0 | Routing |
| Zustand | 5.0.10 | State Management |
| Recharts | 3.6.0 | Charts |
| XYFlow | 12.10.0 | Workflow Builder |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Express.js | 5.2.1 | API Framework |
| PostgreSQL | 15+ | Database |
| Supabase | Latest | BaaS Platform |
| JWT | 9.0.3 | Authentication |
| Multer | 2.0.2 | File Uploads |

### Integrations
- **Stripe**: Payment processing
- **Google Gemini AI**: AI-powered features
- **Capacitor**: Android/iOS mobile apps

📘 **[View Complete Tech Stack Documentation →](docs/TECH_STACK.md)**

---

## 🏗️ Quick Start

### Prerequisites

- ✅ **Node.js** v18 or higher ([Download](https://nodejs.org))
- ✅ **PostgreSQL** (via Supabase or local)
- ✅ **Supabase Account** ([Sign up free](https://supabase.com))

### 1️⃣ Clone & Install

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/hm-app.git
cd hm-app

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..
```

### 2️⃣ Environment Setup

**Frontend** - Create `.env` in root directory:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Backend API (for production)
VITE_API_URL=http://localhost:3001

# Optional: Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
```

**Backend** - Create `backend/.env`:

```env
# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/hm_app

# JWT Secret (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-super-secret-jwt-key

# Server
PORT=3001
NODE_ENV=development

# Optional: AI & Integrations
GEMINI_API_KEY=your-gemini-api-key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
```

**Get Supabase credentials:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Navigate to: Settings → API
3. Copy **Project URL** and **Anon/Public Key**

### 3️⃣ Database Setup

**Option A: Using Supabase (Recommended)**

1. **Go to** Supabase Dashboard → SQL Editor
2. **Run migrations** in order:
   ```sql
   -- Copy and run: backend/schema.sql
   -- Copy and run: backend/pharmacy_schema.sql
   -- Run files from: scripts/migrations/ (in chronological order)
   ```
3. **Verify**: Database → Tables (should see 40+ tables)

**Option B: Local PostgreSQL**

```bash
# Create database
createdb hm_app

# Run migrations
psql hm_app < backend/schema.sql
psql hm_app < backend/pharmacy_schema.sql
```

### 4️⃣ Seed Demo Data

```bash
cd backend
npm run seed-users
```

This creates demo accounts (see [Demo Credentials](#-demo-credentials) below).

### 5️⃣ Run Development Servers

**Terminal 1** - Backend:
```bash
cd backend
npm run dev
```
Backend runs at: `http://localhost:3001`

**Terminal 2** - Frontend:
```bash
npm run dev
```
Frontend runs at: `http://localhost:5173`

### 6️⃣ Access the Application

Open your browser and navigate to:
- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:3001](http://localhost:3001)

---

## 🔑 Demo Credentials

After running the seed script, use these credentials to login:

| Role | Login URL | Email | Password |
|------|-----------|-------|----------|
| **Admin** | [/staff/admin](http://localhost:5173/staff/admin) | `admin@hm-app.com` | `password123` |
| **Doctor** | [/staff/doctor](http://localhost:5173/staff/doctor) | `doctor@hm-app.com` | `password123` |
| **Receptionist** | [/staff/receptionist](http://localhost:5173/staff/receptionist) | `receptionist@hm-app.com` | `password123` |
| **Patient** | [/login](http://localhost:5173/login) | `patient@hm-app.com` | `password123` |

**🔒 Important**: Change these passwords in production!

> **Tip**: See complete user guide with all features for each role in [docs/USER_GUIDE.md](docs/USER_GUIDE.md)

---

## 📱 Mobile App (Android/iOS)

Build native mobile apps using Capacitor:

```bash
# Build web assets
npm run build

# Initialize Android platform
npm run android:init

# Sync web to Android
npm run android:sync

# Open in Android Studio
npm run android:open
```

📘 **Full guide:** [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)

---

## 📚 Documentation

### 📖 Comprehensive Guides

| Document | Description |
|----------|-------------|
| **[Complete User Guide](docs/USER_GUIDE.md)** | All user roles, features, step-by-step instructions |
| **[Tech Stack & Deployment](docs/TECH_STACK.md)** | 50+ technologies, free deployment guide |
| **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** | Deploy to cPanel, production setup |
| **[ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)** | Build APK, publish to Play Store |
| **[FUTURE_ENHANCEMENTS.md](FUTURE_ENHANCEMENTS.md)** | Planned features, roadmap |
| **[SLOT_MANAGEMENT_GUIDE.md](SLOT_MANAGEMENT_GUIDE.md)** | Doctor scheduling system |

### 🎯 Quick Links

- **User Roles & Features**: See all 6 roles with detailed features in [User Guide](docs/USER_GUIDE.md#role-based-features)
- **Free Deployment**: Deploy for $0 using Vercel + Render + Supabase in [Tech Stack Guide](docs/TECH_STACK.md#free-deployment-guide)
- **API Documentation**: Backend routes and services in [Tech Stack Guide](docs/TECH_STACK.md#backend-technologies)

---

## 🌐 Deployment

### 🆓 Free Deployment (Recommended for Testing)

Deploy **100% FREE** using cloud services:

**Frontend** → [Vercel](https://vercel.com) (Free tier)  
**Backend** → [Render](https://render.com) (Free tier)  
**Database** → [Supabase](https://supabase.com) (Free tier)

**Total Cost**: $0/month for testing

📘 **Step-by-step guide**: [docs/TECH_STACK.md#free-deployment-guide](docs/TECH_STACK.md#free-deployment-guide)

### 🚀 Production Deployment

**Web Deployment (cPanel/VPS)**:
1. Build production bundle: `npm run build`
2. Upload `dist/` folder to hosting
3. Configure `.htaccess` for SPA routing

📘 **Full guide**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Android Deployment (Play Store)**:
1. Build signed APK/AAB
2. Submit to Google Play Console

📘 **Full guide**: [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md)

---


---

## 🗂️ Project Structure

```
HM App/
├── backend/              # Express.js Backend
│   ├── src/
│   │   ├── controllers/  # Request handlers
│   │   ├── services/     # Business logic
│   │   ├── routes/       # API routes
│   │   └── db.ts         # Database connection
│   ├── schema.sql        # Database schema
│   └── seed-users.ts     # Demo data seeding
├── src/                  # React Frontend
│   ├── components/       # Reusable UI components
│   ├── features/         # Feature modules by role
│   │   ├── admin/        # Admin features
│   │   ├── doctor/       # Doctor features
│   │   ├── patient/      # Patient features
│   │   ├── receptionist/ # Receptionist features
│   │   ├── pharmacy/     # Pharmacy features
│   │   └── workflow/     # Workflow automation
│   ├── services/         # API service calls
│   ├── store/            # Zustand state management
│   ├── lib/              # Utilities and helpers
│   └── App.tsx           # Main app component
├── scripts/
│   └── migrations/       # Database migration files
├── public/               # Static assets
├── .env                  # Frontend environment variables
└── backend/.env          # Backend environment variables
```

---

## 🚀 Available Scripts

### Frontend (Web)

```bash
npm run dev          # Start Vite dev server (port 5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Backend (API)

```bash
cd backend
npm run dev          # Start Express server with nodemon (port 3001)
npm run build        # Compile TypeScript
npm start            # Run compiled JavaScript
npm run seed-users   # Seed demo user accounts
```

### Mobile (Android)

```bash
npm run android:init    # Initialize Android platform
npm run android:sync    # Sync web assets to Android
npm run android:open    # Open in Android Studio
npm run android:build   # Build + sync
npm run android:run     # Run on device/emulator
```

---

## 🆘 Troubleshooting

### Frontend Issues

**Issue: Port 5173 already in use**
```bash
# Windows
netstat -ano | findstr :5173
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5173 | xargs kill -9
```

**Issue: npm install errors**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Backend Issues

**Issue: Database connection failed**
- ✅ Verify `DATABASE_URL` in `backend/.env`
- ✅ Check Supabase project is active
- ✅ Test connection: `psql $DATABASE_URL`

**Issue: "Cannot find module" errors**
```bash
cd backend
rm -rf node_modules package-lock.json
npm install
```

### Database Issues

**Issue: Tables not found**
- ✅ Run migrations in correct order: `backend/schema.sql` → `backend/pharmacy_schema.sql` → `scripts/migrations/*`
- ✅ Verify tables exist: Supabase Dashboard → Database → Tables

**Issue: RLS policy errors**
- ✅ Check RLS policies are enabled
- ✅ Ensure JWT token is valid
- ✅ Verify user has correct role in `profiles` table

**More help**: See detailed troubleshooting in [docs/TECH_STACK.md#troubleshooting](docs/TECH_STACK.md#troubleshooting)

---

## 📊 Features Implemented

### ✅ Completed Modules
- ✅ **Phase-1 OPD**: Complete outpatient department workflow
- ✅ **Billing System**: Invoice generation, payment tracking
- ✅ **Pharmacy Module**: Inventory management, dispensing
- ✅ **Workflow Automation**: Multi-step patient engagement
- ✅ **Campaign Management**: Email/SMS/WhatsApp campaigns
- ✅ **Doctor Enhancements**: Templates, allergy alerts, timer
- ✅ **Analytics Dashboards**: Real-time metrics for all roles
- ✅ **Mobile App Setup**: Android app via Capacitor

### 🚧 Planned Features
- 🔜 **IPD Module**: Inpatient department management
- 🔜 **Lab Integration**: Lab test orders and results
- 🔜 **Insurance Claims**: Insurance billing integration
- 🔜 **Telemedicine**: Video consultations
- 🔜 **AI Diagnostics**: AI-assisted diagnosis

📘 **Full roadmap**: [FUTURE_ENHANCEMENTS.md](FUTURE_ENHANCEMENTS.md)

---

## 🤝 Contributing

We welcome contributions! Here's how:

1. **Fork** the repository
2. **Create** feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Open** Pull Request

### Contribution Guidelines
- Follow existing code style
- Add TypeScript types
- Update documentation
- Test all user roles
- Run linter before commit

---

## 📄 License

This project is proprietary software for hospital management.

**Copyright © 2026** - All rights reserved.

---

## 📞 Support & Resources

### 📚 Documentation
- **User Guide**: [docs/USER_GUIDE.md](docs/USER_GUIDE.md) - Complete feature walkthrough
- **Tech Stack**: [docs/TECH_STACK.md](docs/TECH_STACK.md) - Technologies and deployment
- **Deployment**: [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md) - Production setup
- **Supabase Docs**: [https://supabase.com/docs](https://supabase.com/docs)

### 🐛 Issues & Questions
- **Check documentation** first (links above)
- **Search existing issues** on GitHub
- **Open new issue** with detailed description

### 🌟 Community
- **Star this repo** if you find it useful
- **Share** with others who might benefit
- **Contribute** to make it better

---

## 🏆 Credits

**Built with** 💜 **using modern web technologies**

- **React Team**: For the amazing framework
- **Supabase Team**: For excellent BaaS platform
- **Vite Team**: For blazing-fast build tool
- **All Contributors**: Thank you!

---

**Version**: 2.0.0  
**Last Updated**: January 23, 2026  
**Status**: ✅ Production Ready  
**Branch**: `develop-postgress-stable`

---

<p align="center">
  <strong>Made for healthcare professionals</strong><br>
  Improving patient care through technology
</p>
