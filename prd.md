# 📘 PRODUCT REQUIREMENTS DOCUMENT (PRD)

## Multi-Speciality Hospital Management System (Phase-1 OPD)

---

## 1. Product Identification

**Product Name:** HM_App
**Product Type:** Web + Android Hospital Management System
**Phase:** Phase-1 (OPD Only)
**Deployment:** Web (cPanel) + Android (Capacitor)
**Backend:** Supabase (MCP Connected)

---

## 2. Purpose & Vision

### 2.1 Purpose

To design and build a **secure, scalable, role-based Hospital Management System** that digitizes **OPD workflows**, focusing on:

* Patient management
* Doctor management
* Appointment scheduling
* Prescription management

The system must support:

* A **public hospital website**
* A **powerful admin panel**
* **Doctor & patient dashboards**
* A **native Android app using the same codebase**

---

## 3. Target Users & Roles

### 3.1 User Roles

| Role                    | Description                          |
| ----------------------- | ------------------------------------ |
| Admin                   | Full system control                  |
| Doctor                  | Manages appointments & prescriptions |
| Patient                 | Books appointments & views records   |
| Receptionist (Optional) | Handles walk-ins                     |

### 3.2 Access Control

* Role-based access using **Supabase RLS**
* Data visibility strictly controlled per role

---

## 4. High-Level System Architecture

![Image](https://knowledgewala.com/wp-content/uploads/2023/04/2023-04-27-12_59_16-HMS-System-Architecture-Diagram.drawio.pdf-and-1-more-page-Personal-Microsof-1024x659.png)

![Image](https://supabase.com/docs/img/supabase-architecture--light.svg)

### 4.1 Architecture Components

* React + Vite SPA
* Supabase (Auth, DB, Storage, Realtime)
* Capacitor (Android wrapper)
* cPanel static deployment

---

## 5. Technology Stack (Strict)

### 5.1 Frontend

* React (Functional Components)
* Vite
* TypeScript
* Tailwind CSS
* React Router
* React Hook Form
* Zustand / Context API

### 5.2 Backend (BaaS)

* Supabase

  * Authentication (Email + Phone OTP)
  * PostgreSQL
  * Row Level Security (RLS)
  * Storage (PDFs, signatures)
  * Realtime subscriptions

### 5.3 Mobile

* Capacitor
* Android Studio
* Single shared React codebase

### 5.4 Deployment

* React build → static assets
* Hosted on **cPanel**
* Supabase cloud backend
* Android APK / AAB output

---

## 6. Functional Requirements

---

## 6.1 Public Hospital Website

### Pages

* Home
* About Hospital
* Departments
* Doctors Listing
* Book Appointment
* Contact
* Login / Register

### Appointment Booking Flow

![Image](https://www.researchgate.net/publication/336871115/figure/fig2/AS%3A819261417213953%401572338551538/Flow-chart-of-the-doctor-appointment-system.ppm)

![Image](https://s3-alpha.figma.com/hub/file/4939023169/34214e57-91a6-4dc4-9493-bffb4b756013-cover.png)

**Steps**

1. Select department
2. Select doctor
3. View available slots
4. Enter patient details
5. Confirm appointment
6. Receive confirmation (email / UI toast)

---

## 6.2 Patient Module

### Features

* Register / Login
* View upcoming appointments
* View past appointments
* View & download prescriptions (PDF)
* Profile management

### Constraints

* Patients can only access **their own records**
* RLS enforced at DB level

---

## 6.3 Doctor Module

### Doctor Profile

* Name
* Specialization
* Qualifications
* Experience
* OPD timings
* Slot duration
* Consultation fee
* Status (Active / Inactive)

### Doctor Dashboard

* Today’s appointments
* Patient history
* Create & edit prescriptions
* Mark appointment completed

---

## 6.4 Appointment Management

### Rules

* Slot-based scheduling
* No double booking
* Auto slot generation from availability

### Appointment Statuses

* Booked
* Confirmed
* Completed
* Cancelled
* No-show

### Admin Controls

* Manual booking
* Rescheduling
* Cancellation
* Doctor reassignment

---

## 6.5 Prescription Management

### Doctor Capabilities

* Add diagnosis
* Add medicines:

  * Name
  * Dosage
  * Frequency
  * Duration
* Add tests
* Follow-up date
* Remarks

### Output

* Digital prescription
* Printable PDF
* Hospital branding
* Doctor signature image

---

## 6.6 Admin Panel (Critical Module)

![Image](https://s.tmimgcdn.com/scr/1200x750/360900/healthease-medical-and-hospital-admin-dashboard-template_360945-original.jpg)

![Image](https://cdn.dribbble.com/userupload/15871428/file/original-012810dccae62c5aabc44c69b518d7d6.jpg?format=webp\&resize=400x300\&vertical=center)

### Admin Dashboard

* Total patients
* Today’s appointments
* Active doctors
* Appointment analytics

### Admin Capabilities

* CRUD Doctors
* CRUD Departments
* Manage Patients
* Manage Appointments
* View Prescriptions
* CMS for website content
* Role & permission control

---

## 7. Database Design (Supabase)

### Core Tables

* users
* roles
* patients
* doctors
* departments
* doctor_schedules
* appointments
* prescriptions
* prescription_items
* audit_logs

### Security

* Supabase RLS enabled
* Role-based policies:

  * Patients → own data only
  * Doctors → assigned patients
  * Admin → full access

---

## 8. Android Application (Capacitor)

### Requirements

* Same UI as web
* Native navigation
* Android APK / AAB build
* Graceful offline handling
* Push-notification ready (future)

---

## 9. Non-Functional Requirements

* Secure authentication
* Mobile-responsive UI
* < 3s page load
* Proper error handling
* Scalable architecture
* Clean folder structure
* Environment-based configuration

---

## 10. Deliverables

* Complete React + Vite codebase
* Supabase SQL schema & RLS policies
* Admin panel UI
* Public website UI
* Doctor & patient dashboards
* Capacitor Android build steps
* cPanel deployment guide
* README documentation

---

## 11. Out of Scope (Phase-1)

* Billing
* Pharmacy
* Lab
* IPD
* Insurance
* Payments

---

## 12. Quality Expectations

* Production-ready code
* No dummy logic
* Reusable components
* Clean UX
* Healthcare-grade data security

---

## 13. Development Order (Mandatory)

1. Authentication & Roles
2. Doctor + Department setup
3. Appointment booking flow
4. Prescription module
5. Admin panel
6. Android packaging

---

## 14. Bonus (Optional)

* ER Diagram
* API abstraction layer
* Dark mode
* Audit logs
* Appointment analytics charts

---

## ✅ PRD STATUS: **IMPLEMENTATION-READY**
