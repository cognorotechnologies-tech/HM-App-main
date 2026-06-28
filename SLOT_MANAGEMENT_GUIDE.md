# How to Manage Doctor Availability Slots

## 📍 Where to Set Slots

Doctors manage their availability slots in the **Schedule Manager** feature located at:
- **File**: `src/features/doctor/ScheduleManager.tsx`
- **Dashboard**: Doctor Dashboard → "Manage Schedule" button

---

## 🔧 How It Works

### 1. **Doctor Sets Their Schedule**

Doctors can add schedule entries with:
- **Day of Week**: Monday through Sunday
- **Start Time**: When they begin seeing patients (e.g., 09:00)
- **End Time**: When they stop seeing patients (e.g., 17:00)
- **Slot Duration**: Time per appointment (e.g., 30 minutes)

**Example Schedule Entry:**
```
Day: Monday
Start: 09:00
End: 17:00
Duration: 30 minutes
```

This creates slots:
- 09:00-09:30
- 09:30-10:00
- 10:00-10:30
- ... (continues until 17:00)

### 2. **System Generates Available Slots**

When a patient tries to book:
1. System fetches doctor's schedule for selected day
2. Generates time slots based on start/end/duration
3. Checks existing appointments
4. Shows only available (unbooked) slots

### 3. **Slot Availability Logic**

**File**: `src/services/appointmentService.ts`
- `getAvailableSlots(doctorId, date)` - Fetches slots
- Excludes already booked times
- Excludes past times for today

---

## ⚙️ Step-by-Step: How to Enable Slots

### **Step 1: Doctor Logs In**
1. Sign in as a doctor
2. Go to Doctor Dashboard
3. Click **"Manage Schedule"** button

### **Step 2: Add Schedule**
1. Click **"+ Add Schedule"**
2. Select **Day** (e.g., Monday)
3. Set **Start Time** (e.g., 09:00)
4. Set **End Time** (e.g., 17:00)
5. Set **Slot Duration** (e.g., 30 minutes)
6. Click **"Save Schedule"**

### **Step 3: Repeat for Other Days**
Add schedule entries for each day the doctor is available

### **Step 4: Test Booking**
1. Log in as a patient
2. Go to **"Book Appointment"**
3. Select the doctor
4. Select a date that matches their schedule
5. See available time slots appear!

---

## 🛠️ Database Structure

### **schedules** Table
- `doctor_id` - Which doctor
- `day_of_week` - Monday, Tuesday, etc.
- `start_time` - Start of availability
- `end_time` - End of availability
- `slot_duration` - Minutes per appointment

### **appointments** Table
- `doctor_id` - Booked doctor
- `appointment_date` - Date of appointment
- `start_time` - Slot time
- ` status` - pending, confirmed, cancelled

---

## ❌ Common Issues & Solutions

### **Issue 1: "No Slots Available"**
**Cause**: Doctor hasn't set schedule for that day

**Solution**:
1. Doctor needs to add schedule entry for that day
2. Or patient should select a different day

### **Issue 2: All Slots Booked**
**Cause**: All time slots already have appointments

**Solution**:
1. Patient should choose different date
2. Or doctor can add more availability times

### **Issue 3: Slots Not Showing**
**Cause**: Database schedule not saved

**Solution**:
1. Check browser console for errors
2. Verify schedule was saved to database
3. Refresh the booking page

---

## 💡 Tips for Doctors

1. **Set Regular Hours**: Add schedules for consistent weekly availability
2. **Buffer Time**: Leave gaps for emergencies (don't book 100%)
3. **Update Promptly**: If unavailable, update schedule ASAP
4. **Different Days**: Can have different hours for different days

**Example Weekly Schedule:**
```
Monday:    09:00-17:00 (30 min slots)
Tuesday:   09:00-17:00 (30 min slots)
Wednesday: 09:00-13:00 (30 min slots) - Half day
Thursday:  09:00-17:00 (30 min slots)
Friday:    09:00-15:00 (30 min slots)
Saturday:  OFF
Sunday:    OFF
```

---

## 🎯 Quick Troubleshooting

| Problem | Check This | Fix |
|---------|-----------|-----|
| No slots showing | Schedule exists? | Add schedule entry |
| Wrong times | Schedule time correct? | Edit schedule times |
| Can't save schedule | Database error? | Check console logs |
| Slots not updating | Cache issue? | Refresh page |

---

## 📊 How Patients See Slots

When patient books:
1. **Select Doctor** → Shows doctor info
2. **Select Date** → System checks schedule
3. **See Slots** → Only available times shown
4. **Book** → Slot marked as taken

If **no schedule exists** for that day:
- Shows improved error message
- Suggests trying different date
- Provides helpful tips

---

**Status**: ✅ Slot system is working
**Location**: Doctor Dashboard > Manage Schedule
**Patient View**: Book Appointment page
