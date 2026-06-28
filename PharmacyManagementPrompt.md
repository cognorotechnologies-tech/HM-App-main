Complete Pharmacy Management System - Development Specification
Project Overview
Build a production-ready pharmacy management system integrated with an existing hospital management platform. The system must handle inventory, sales, purchases, compliance, and provide comprehensive analytics.

Technology Stack Requirements

Backend:  (choose based on existing hospital system)
Database: PostgreSQL with proper indexing
Frontend: (choose based on existing hospital system)
Additional: Redis for caching, PDF generation library, Excel export capability



Core Database Schema
1. Medicine Master Table
sql- medicine_id (PK, auto-increment)
- medicine_name (indexed)
- generic_name
- brand_name
- manufacturer_id (FK)
- drug_category_id (FK)
- unit_of_measurement (tablet, ml, mg, etc.)
- hsn_code (for GST)
- schedule_type (H, H1, X, OTC)
- minimum_stock_level
- maximum_stock_level
- reorder_quantity
- rack_location
- is_active (boolean)
- created_at, updated_at
2. Inventory/Stock Table
sql- stock_id (PK)
- medicine_id (FK)
- batch_number (indexed)
- expiry_date (indexed)
- purchase_price
- mrp (maximum retail price)
- selling_price
- quantity_available
- quantity_reserved
- supplier_id (FK)
- purchase_invoice_id (FK)
- received_date
- rack_location
- status (active, expired, damaged)
3. Suppliers Table
sql- supplier_id (PK)
- supplier_name
- contact_person
- phone_number
- email
- address
- gstin
- drug_license_number
- payment_terms
- credit_days
- is_active
4. Purchase Orders Table
sql- po_id (PK)
- po_number (unique, indexed)
- supplier_id (FK)
- po_date
- expected_delivery_date
- total_amount
- tax_amount
- net_amount
- status (pending, partial, completed, cancelled)
- created_by (user_id)
- approved_by (user_id)
- notes
5. Purchase Order Items Table
sql- po_item_id (PK)
- po_id (FK)
- medicine_id (FK)
- quantity_ordered
- unit_price
- tax_percentage
- discount_percentage
- total_amount
6. Goods Receipt Note (GRN) Table
sql- grn_id (PK)
- grn_number (unique)
- po_id (FK)
- supplier_id (FK)
- invoice_number
- invoice_date
- received_date
- total_amount
- received_by (user_id)
- status (pending, completed)
7. GRN Items Table
sql- grn_item_id (PK)
- grn_id (FK)
- medicine_id (FK)
- batch_number
- expiry_date
- quantity_received
- free_quantity
- purchase_price
- mrp
- selling_price
- tax_percentage
- stock_id (FK - links to created stock entry)
8. Sales/Bills Table
sql- bill_id (PK)
- bill_number (unique, indexed)
- bill_date
- bill_time
- patient_id (FK to hospital system)
- prescription_id (FK - optional)
- customer_name (for walk-in)
- customer_phone
- bill_type (prescription, OTC, inpatient)
- subtotal
- discount_amount
- discount_percentage
- tax_amount
- round_off
- net_amount
- payment_mode (cash, card, UPI, insurance, credit)
- payment_status (paid, partial, pending)
- cashier_id (user_id)
- shift_id (FK)
- is_return (boolean)
- return_reference_bill_id (if return)
9. Sales Items Table
sql- sale_item_id (PK)
- bill_id (FK)
- medicine_id (FK)
- stock_id (FK)
- batch_number
- expiry_date
- quantity
- unit_price
- discount_percentage
- tax_percentage
- total_amount
- cost_price (for profit calculation)
10. Prescription Table (Integration with Hospital EMR)
sql- prescription_id (PK)
- patient_id (FK)
- doctor_id (FK)
- prescription_date
- diagnosis
- status (pending, partial, completed)
- created_at
11. Prescription Items Table
sql- prescription_item_id (PK)
- prescription_id (FK)
- medicine_id (FK)
- dosage
- frequency
- duration_days
- quantity_prescribed
- instructions
- dispensed_quantity
- is_dispensed (boolean)
12. Returns Table
sql- return_id (PK)
- return_number (unique)
- original_bill_id (FK)
- return_date
- return_amount
- refund_mode
- reason
- processed_by (user_id)
13. Stock Adjustments Table
sql- adjustment_id (PK)
- adjustment_date
- stock_id (FK)
- adjustment_type (damage, expiry, theft, found, correction)
- quantity_adjusted
- reason
- adjusted_by (user_id)
- approved_by (user_id)
14. Drug Categories Table
sql- category_id (PK)
- category_name (Antibiotics, Analgesics, Antacids, etc.)
- description
- parent_category_id (for subcategories)
15. Manufacturers Table
sql- manufacturer_id (PK)
- manufacturer_name
- country
- contact_details
16. Users & Shifts Table
sqlUsers:
- user_id (PK)
- username
- role (admin, pharmacist, billing_staff, manager)
- phone, email
- is_active

Shifts:
- shift_id (PK)
- shift_date
- user_id (FK)
- start_time
- end_time
- opening_cash
- closing_cash
- total_sales
- status (open, closed)
Feature Implementation Guide
Module 1: Medicine Master Management
Features to Implement:

Add/Edit/Delete medicines with complete details
Search by name, generic name, manufacturer
Barcode generation for each medicine
Category-wise listing
Bulk import via Excel/CSV
Medicine composition tracking
Alternative medicine suggestions

Key Functions:
javascript- createMedicine(medicineData)
- updateMedicine(medicineId, updates)
- searchMedicine(searchTerm) // Search by name, generic, manufacturer
- getMedicineByBarcode(barcode)
- listMedicinesByCategory(categoryId)
- bulkImportMedicines(csvFile)
- checkMedicineInteractions(medicineIds[])
Validation Rules:

Medicine name must be unique per manufacturer
Reorder level must be less than maximum stock level
HSN code required for GST compliance
Schedule type mandatory for controlled substances

Module 2: Inventory Management
Features to Implement:

Real-time stock tracking across all batches
Batch-wise inventory with FEFO (First Expiry First Out)
Expiry tracking with multi-level alerts (90/60/30 days)
Low stock alerts based on reorder levels
Stock adjustment workflow with approval
Physical stock verification and reconciliation
Multi-location support (if needed)

Key Functions:
javascript- getCurrentStock(medicineId)
- getStockByBatch(medicineId)
- reserveStock(medicineId, quantity) // For billing
- releaseStock(medicineId, quantity) // If bill cancelled
- adjustStock(stockId, quantity, reason, type)
- getExpiringStock(days) // Get stock expiring in X days
- getLowStockItems()
- stockReconciliation(physicalCount[])
- getStockValuation() // Total inventory value
Business Logic:

FEFO method: Always dispense batches nearest to expiry first
Automatic stock reservation during billing
Release reserved stock if bill cancelled within timeout
Alert generation for expiry (90, 60, 30, 15 days)
Prevent negative stock

Module 3: Purchase Management
Features to Implement:

Supplier master management
Purchase order creation and tracking
PO approval workflow
Goods receipt against PO
Invoice matching and verification
Automatic stock creation from GRN
Purchase return management

Key Functions:
javascript- createPurchaseOrder(poData)
- approvePurchaseOrder(poId, approverId)
- createGRN(grnData, poId)
- processGRN(grnId) // Create stock entries
- reconcilePOvsGRN(poId, grnId)
- purchaseAnalytics(startDate, endDate)
- getSupplierPerformance(supplierId)
Workflow:

Create PO → Approval → Send to Supplier
Receive goods → Create GRN → Verify against PO
Process GRN → Auto-create stock entries with batch/expiry
Generate invoice entry → Update accounts payable

Validation:

GRN quantity cannot exceed PO quantity
Expiry date must be at least 6 months from receipt
Batch number must be unique per medicine
MRP must be greater than or equal to purchase price

Module 4: Sales & Billing
Features to Implement:

Quick billing interface with medicine search
Barcode scanning support
Prescription-based billing
OTC sales
Patient linking with hospital system
Multiple payment modes
Discount application (item-level and bill-level)
Bill printing with breakdown
Credit sales tracking
Sales return processing

Key Functions:
javascript- createBill(billData)
- addItemToBill(billId, itemData)
- applyDiscount(billId, discountPercentage, reason)
- processBillPayment(billId, paymentData)
- printBill(billId)
- processSalesReturn(originalBillId, returnItems[], reason)
- getBillDetails(billId)
- getPendingBills(patientId)
- processPrescription(prescriptionId)
Billing Logic:

Search medicine → Select batch (FEFO) → Add quantity
Auto-calculate: Price × Qty - Discount + Tax
Reserve stock immediately
Apply patient/corporate discounts
Generate bill number (sequential)
Update stock on payment confirmation
For returns: Verify original bill → Check return window → Process refund

GST Calculation:
Taxable Amount = (Unit Price × Quantity) - Discount
GST Amount = Taxable Amount × GST Rate
Total = Taxable Amount + GST Amount
Module 5: Prescription Processing
Features to Implement:

Integration with hospital EMR for prescriptions
Prescription digitization (if paper-based)
Drug interaction checking
Allergy verification
Partial dispensing tracking
Automatic dosage calculation
Prescription history

Key Functions:
javascript- fetchPrescription(patientId, prescriptionId)
- validatePrescription(prescriptionId)
- checkDrugInteractions(medicineIds[])
- checkPatientAllergies(patientId, medicineId)
- dispense Prescription(prescriptionId, items[])
- markPartiallyDispensed(prescriptionId, dispensedItems[])
- getPrescriptionHistory(patientId)
Integration Points:

Pull patient demographics from hospital system
Pull prescription from doctor module
Push dispensing records back to EMR
Update patient medication history

Module 6: Financial Management
Features to Implement:

Daily sales register
Payment reconciliation
Credit management (patient/corporate)
Supplier payment tracking
GST reports (GSTR-1, GSTR-3B format)
Profit/loss calculation
Outstanding receivables
Cash flow tracking

Key Functions:
javascript- getDailySalesReport(date)
- getPaymentBreakdown(startDate, endDate)
- getCreditOutstanding()
- recordSupplierPayment(supplierId, amount, paymentMode)
- generateGSTReport(month, year, reportType)
- calculateProfit(startDate, endDate)
- getReceivablesAging()
- cashFlowStatement(startDate, endDate)
GST Reporting:

Track CGST, SGST, IGST separately
B2B and B2C sales segregation
HSN-wise summary
Exempt and non-GST items handling

Module 7: Analytics & Dashboards
Dashboard KPIs (Real-time):

Today's sales vs. yesterday/last week/last month
Current stock value
Pending orders count
Expiring stock (next 30 days) - value & count
Low stock items count
Outstanding receivables
Top 10 selling medicines today
Profit margin today

Sales Analytics:
javascript- salesTrend(period, groupBy) // daily, weekly, monthly
- salesByCategory(startDate, endDate)
- salesByManufacturer(startDate, endDate)
- salesByPaymentMode(startDate, endDate)
- peakHoursAnalysis(startDate, endDate)
- discountAnalysis(startDate, endDate)
- returnRateAnalysis(startDate, endDate)
- averageTransactionValue(period)
Inventory Analytics:
javascript- inventoryTurnoverRatio(period)
- stockAgingAnalysis() // 0-30, 31-60, 61-90, 90+ days
- deadStockIdentification(minDays)
- abcAnalysis() // Classify items by revenue contribution
- expiryWastageReport(startDate, endDate)
- fastMovingItems(limit, period)
- slowMovingItems(limit, period)
- stockValuationReport()
Financial Analytics:
javascript- profitMarginAnalysis(startDate, endDate, groupBy)
- cogsCalculation(period) // Cost of Goods Sold
- revenueVsPurchase(period)
- categoryWiseProfitability()
- supplierWisePurchaseAnalysis(period)
- outstandingAgingReport() // 0-30, 31-60, 60+ days
Operational Metrics:
javascript- prescriptionsProcessedCount(period)
- averageBillingTime()
- staffProductivity(userId, period)
- patientFootfallTrend(period)
- stockoutIncidents(period)
Module 8: Compliance & Regulatory
Features to Implement:

Narcotic and controlled substance tracking (Schedule H, H1, X)
Audit trail for all transactions
Drug license compliance reports
Form 10 register (narcotic register)
Indented drug register
E-invoice generation (if required)
Patient consent tracking

Key Functions:
javascript- trackControlledSubstance(medicineId, billId, quantity)
- generateAuditTrail(userId, action, entityType, entityId)
- narcoticsRegister(startDate, endDate)
- generateForm10()
- complianceReport(reportType, period)
- eInvoiceGeneration(billId)
Audit Requirements:

Log all create, update, delete operations
Track user who performed action
Timestamp all transactions
Maintain deletion records (soft delete)
Track prescription dispensing

Module 9: User Management & Security
Features to Implement:

Role-based access control (RBAC)
User activity logging
Shift management
Password policies
Session management
Data encryption for sensitive info

Roles & Permissions:
javascriptAdmin: Full access
Manager: All except system config
Pharmacist: Billing, dispensing, inventory view
Billing Staff: Billing only, limited returns

Permissions Matrix:
- medicine.create, medicine.edit, medicine.delete, medicine.view
- inventory.adjust, inventory.view
- purchase.create, purchase.approve, purchase.view
- sales.create, sales.return, sales.view
- reports.financial, reports.inventory, reports.sales
- users.manage
- settings.manage
Shift Management:
javascript- openShift(userId, openingCash)
- recordShiftSale(shiftId, billId)
- closeShift(shiftId, closingCash, notes)
- shiftReconciliation(shiftId, actualCash)
- getShiftReport(shiftId)
UI/UX Requirements
Dashboard Layout

Top bar: Quick stats (sales, stock alerts, pending orders)
Left sidebar: Navigation menu
Main area: Widgets (sales graph, top sellers, alerts)
Right sidebar: Quick actions, notifications

Billing Screen

Top: Search bar with autocomplete
Left: Bill items list with running total
Right: Payment panel
Bottom: Action buttons (Save, Print, Cancel)
Keyboard shortcuts for quick operations

Inventory Screen

Filter panel (category, expiry, stock level)
Grid view with sorting
Bulk actions toolbar
Export to Excel option

Reports Interface

Date range selector
Report type dropdown
Filter options
View/Export/Print buttons
Graphical representation where applicable

API Endpoints Structure
Medicine APIs
POST   /api/medicines - Create medicine
GET    /api/medicines - List with pagination & filters
GET    /api/medicines/:id - Get details
PUT    /api/medicines/:id - Update
DELETE /api/medicines/:id - Soft delete
GET    /api/medicines/search?q=term - Search
POST   /api/medicines/bulk-import - Bulk import
Inventory APIs
GET    /api/inventory/stock/:medicineId - Current stock
GET    /api/inventory/expiring?days=30 - Expiring stock
GET    /api/inventory/low-stock - Low stock items
POST   /api/inventory/adjust - Stock adjustment
GET    /api/inventory/valuation - Stock value
POST   /api/inventory/reconcile - Physical verification
Purchase APIs
POST   /api/purchases/po - Create PO
GET    /api/purchases/po - List POs
PUT    /api/purchases/po/:id/approve - Approve PO
POST   /api/purchases/grn - Create GRN
POST   /api/purchases/grn/:id/process - Process GRN
Sales APIs
POST   /api/sales/bill - Create bill
GET    /api/sales/bill/:id - Get bill
POST   /api/sales/return - Process return
GET    /api/sales/pending - Pending bills
POST   /api/sales/payment - Record payment
Analytics APIs
GET    /api/analytics/dashboard - Dashboard KPIs
GET    /api/analytics/sales-trend - Sales trends
GET    /api/analytics/inventory-turnover - Turnover ratio
GET    /api/analytics/abc-analysis - ABC analysis
GET    /api/analytics/profit-margin - Profit margins
Performance Optimization
Database Optimization

Create indexes on frequently queried columns:

medicine_name, generic_name, batch_number
bill_number, bill_date
expiry_date, patient_id


Implement query caching for reports
Archive old data (>2 years) to separate tables
Use database views for complex reports

Application Optimization

Implement Redis caching for:

Medicine master data
Current stock levels
User sessions


Lazy loading for large lists
Pagination for all list views
Debouncing for search inputs
Background jobs for heavy processes (reports, analytics)

Frontend Optimization

Code splitting for faster load times
Image optimization
Minimize bundle size
Service workers for offline capability
Progressive Web App (PWA) features

Testing Requirements
Unit Tests

Test all business logic functions
Test calculations (GST, discounts, profit)
Test stock reservation/release logic
Test FEFO batch selection

Integration Tests

Test complete billing workflow
Test purchase-to-stock workflow
Test prescription processing
Test return processing

User Acceptance Testing (UAT)

Billing speed test (target: <30 seconds per bill)
Stock accuracy verification
Report accuracy validation
Multi-user concurrent access testing

Deployment Checklist
Pre-Production

 Database backup mechanism in place
 Error logging configured
 Performance monitoring setup
 SSL certificate installed
 Firewall rules configured
 User training completed
 Data migration from old system (if applicable)

Production

 Automated backup (daily)
 Monitoring alerts configured
 Support ticketing system ready
 Documentation completed
 Disaster recovery plan documented

Security Measures

Data Protection:

Encrypt sensitive data (patient info, financial data)
Use HTTPS for all communications
Implement SQL injection prevention
XSS protection


Access Control:

Strong password policy (min 8 chars, special chars)
Session timeout (15 minutes idle)
IP whitelisting for admin access
Two-factor authentication for admin users


Audit:

Log all transactions with timestamp and user
Regular audit log review
Compliance with data protection regulations (HIPAA, local laws)



Reporting Requirements
Daily Reports

Sales summary by payment mode
Collection summary
Expiring stock alert
Low stock alert

Weekly Reports

Sales trend comparison
Top 10 selling medicines
Slow-moving inventory
Stock adjustment summary

Monthly Reports

P&L statement
GST returns data
Supplier-wise purchase
Category-wise sales analysis
Inventory turnover
Outstanding receivables aging

Annual Reports

Year-end financial summary
Inventory valuation
Supplier performance analysis
Complete audit trail export

Integration Points
Hospital System Integration

Patient master data
Prescription data from doctors
Admission/discharge notifications
Billing integration for inpatient pharmacy
Insurance claim processing

External Integrations

Payment gateway (for card/UPI payments)
SMS gateway (for notifications)
Email service (for reports)
Barcode printer
Thermal printer for bills

Success Metrics
Operational

Average billing time < 30 seconds
Stock accuracy > 98%
Zero stockout of critical medicines
100% expiry tracking

Financial

Inventory turnover > 6 times/year
Dead stock < 5% of total inventory
Gross profit margin tracking
Outstanding collection < 10% of monthly sales

User Satisfaction

User adoption rate > 90%
System uptime > 99.5%
Support ticket resolution < 24 hours

Development Timeline Estimate
Week 1-2: Database design, backend setup, medicine master
Week 3-4: Inventory management, purchase module
Week 5-6: Sales/billing module, prescription integration
Week 7-8: Financial management, returns, adjustments
Week 9-10: Analytics, dashboards, reports
Week 11-12: Compliance features, testing, bug fixes
Week 13-14: UAT, training, deployment
Post-Launch Support
Phase 1 (Month 1-3): Stabilization

Daily monitoring
Quick bug fixes
User feedback collection
Performance optimization

Phase 2 (Month 4-6): Enhancement

Feature refinements
Additional reports based on user requests
Integration improvements
Advanced analytics

Phase 3 (Month 7+): Maintenance

Regular updates
Security patches
Feature additions
Scalability improvements


Key Development Tips

Start with data integrity: Ensure accurate stock tracking from day 1
Keep billing simple: Fast and intuitive interface is crucial
Automate alerts: Proactive alerts prevent stockouts and expiry
Design for scale: Even if starting small, design database for growth
Compliance first: Build regulatory features from the start, hard to retrofit
Test with real data: Use actual medicine data and scenarios for testing
Train thoroughly: System is only as good as user adoption
Iterate based on feedback: Pharmacy staff will have valuable insights

This system, when fully implemented, will provide complete pharmacy operations management with robust analytics and compliance capabilities.




I've created interactive UI mockups for your pharmacy management system with three main screens:
Key Features of the Design:
1. Dashboard Screen

4 KPI cards showing critical metrics (Sales, Stock Value, Low Stock, Expiring Items)
Sales trend chart for the last 7 days
Top selling medicines widget
Recent transactions table with status indicators

2. Billing Screen (Most Critical)

Left panel: Medicine search with autocomplete dropdown
Middle panel: Bill items list with quantity controls
Right panel: Payment summary with patient info and payment options
Real-time calculation of subtotal, tax, and total
Add/remove items with intuitive controls
Quick payment mode selection (Cash/Card)

3. Inventory Screen

Searchable table with all medicine details
Stock status indicators (color-coded: red for low, orange for medium, green for good)
Quick actions (Edit, View, Delete) for each item
Export and filter capabilities

Design Highlights:
Color Coding:

Blue: Primary actions and branding
Green: Positive metrics, good stock
Orange: Warnings, medium stock
Red: Alerts, low stock, critical items

User Experience:

Clean, modern interface with consistent spacing
Hover effects on interactive elements
Status badges for quick visual feedback
Responsive grid layouts
Icon-based navigation for easy recognition

Navigation:

Left sidebar with all modules
Active state highlighting
User info and logout at bottom
Notification bell in top bar

You can click through the different screens using the navigation menu. The billing screen is fully functional - you can search medicines, add them to the bill, adjust quantities, and see real-time totals.

import React, { useState } from 'react';
import { Search, Plus, ShoppingCart, Package, FileText, BarChart3, Users, Settings, Bell, Home, LogOut, Calendar, DollarSign, AlertTriangle, TrendingUp, Pill, X, Minus, Check, Printer, CreditCard, Trash2, Edit, Eye, Filter, Download, RefreshCw } from 'lucide-react';

const PharmacyUI = () => {
  const [currentScreen, setCurrentScreen] = useState('dashboard');
  const [billItems, setBillItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMedicine, setSelectedMedicine] = useState(null);

  // Sample data
  const medicines = [
    { id: 1, name: 'Paracetamol 500mg', generic: 'Paracetamol', batch: 'B12345', expiry: '2025-12-31', stock: 500, price: 5.00, mrp: 7.50 },
    { id: 2, name: 'Amoxicillin 250mg', generic: 'Amoxicillin', batch: 'B12346', expiry: '2025-10-15', stock: 200, price: 15.00, mrp: 22.00 },
    { id: 3, name: 'Omeprazole 20mg', generic: 'Omeprazole', batch: 'B12347', expiry: '2026-03-20', stock: 350, price: 8.50, mrp: 12.00 },
    { id: 4, name: 'Metformin 500mg', generic: 'Metformin', batch: 'B12348', expiry: '2025-08-10', stock: 50, price: 6.00, mrp: 9.00 },
    { id: 5, name: 'Aspirin 75mg', generic: 'Aspirin', batch: 'B12349', expiry: '2026-01-25', stock: 800, price: 3.50, mrp: 5.50 },
  ];

  const dashboardStats = [
    { title: 'Today\'s Sales', value: '₹45,280', change: '+12%', icon: DollarSign, color: 'bg-green-500' },
    { title: 'Total Stock Value', value: '₹8,45,000', change: '-2%', icon: Package, color: 'bg-blue-500' },
    { title: 'Low Stock Items', value: '23', change: '+5', icon: AlertTriangle, color: 'bg-orange-500' },
    { title: 'Expiring Soon', value: '15', change: '30 days', icon: Calendar, color: 'bg-red-500' },
  ];

  const recentBills = [
    { id: 'INV-001', patient: 'John Doe', amount: 450, time: '10:30 AM', status: 'Paid' },
    { id: 'INV-002', patient: 'Jane Smith', amount: 1200, time: '11:15 AM', status: 'Paid' },
    { id: 'INV-003', patient: 'Bob Wilson', amount: 350, time: '12:00 PM', status: 'Pending' },
  ];

  const topSelling = [
    { name: 'Paracetamol 500mg', sold: 145, revenue: 1087.50 },
    { name: 'Amoxicillin 250mg', sold: 89, revenue: 1958.00 },
    { name: 'Omeprazole 20mg', sold: 76, revenue: 912.00 },
  ];

  const addToBill = (medicine) => {
    const existing = billItems.find(item => item.id === medicine.id);
    if (existing) {
      setBillItems(billItems.map(item => 
        item.id === medicine.id ? {...item, quantity: item.quantity + 1} : item
      ));
    } else {
      setBillItems([...billItems, {...medicine, quantity: 1}]);
    }
  };

  const updateQuantity = (id, delta) => {
    setBillItems(billItems.map(item => {
      if (item.id === id) {
        const newQty = Math.max(1, item.quantity + delta);
        return {...item, quantity: newQty};
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const removeFromBill = (id) => {
    setBillItems(billItems.filter(item => item.id !== id));
  };

  const calculateBillTotal = () => {
    const subtotal = billItems.reduce((sum, item) => sum + (item.mrp * item.quantity), 0);
    const tax = subtotal * 0.12;
    return { subtotal, tax, total: subtotal + tax };
  };

  const Navigation = () => (
    <div className="w-64 bg-gradient-to-b from-blue-900 to-blue-800 text-white h-screen fixed left-0 top-0 shadow-2xl">
      <div className="p-6 border-b border-blue-700">
        <div className="flex items-center space-x-3">
          <div className="bg-white p-2 rounded-lg">
            <Pill className="text-blue-900" size={28} />
          </div>
          <div>
            <h1 className="text-xl font-bold">PharmaCare</h1>
            <p className="text-xs text-blue-300">Management System</p>
          </div>
        </div>
      </div>
      
      <nav className="mt-6">
        <NavItem icon={Home} label="Dashboard" active={currentScreen === 'dashboard'} onClick={() => setCurrentScreen('dashboard')} />
        <NavItem icon={ShoppingCart} label="Billing" active={currentScreen === 'billing'} onClick={() => setCurrentScreen('billing')} />
        <NavItem icon={Package} label="Inventory" active={currentScreen === 'inventory'} onClick={() => setCurrentScreen('inventory')} />
        <NavItem icon={FileText} label="Purchase" active={currentScreen === 'purchase'} onClick={() => setCurrentScreen('purchase')} />
        <NavItem icon={BarChart3} label="Analytics" active={currentScreen === 'analytics'} onClick={() => setCurrentScreen('analytics')} />
        <NavItem icon={Users} label="Patients" active={currentScreen === 'patients'} onClick={() => setCurrentScreen('patients')} />
        <NavItem icon={Pill} label="Medicines" active={currentScreen === 'medicines'} onClick={() => setCurrentScreen('medicines')} />
        <NavItem icon={Settings} label="Settings" active={currentScreen === 'settings'} onClick={() => setCurrentScreen('settings')} />
      </nav>

      <div className="absolute bottom-0 w-64 p-4 border-t border-blue-700">
        <div className="flex items-center space-x-3 mb-4">
          <div className="bg-blue-700 p-2 rounded-full">
            <Users size={20} />
          </div>
          <div>
            <p className="text-sm font-medium">Dr. Pharmacist</p>
            <p className="text-xs text-blue-300">Shift: Morning</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 text-blue-300 hover:text-white transition w-full">
          <LogOut size={18} />
          <span className="text-sm">Logout</span>
        </button>
      </div>
    </div>
  );

  const NavItem = ({ icon: Icon, label, active, onClick }) => (
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-6 py-3 transition ${
        active ? 'bg-blue-700 border-r-4 border-white' : 'hover:bg-blue-800'
      }`}
    >
      <Icon size={20} />
      <span className="font-medium">{label}</span>
    </button>
  );

  const TopBar = () => (
    <div className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
      <div className="flex items-center space-x-4">
        <h2 className="text-2xl font-bold text-gray-800 capitalize">{currentScreen}</h2>
        <span className="text-sm text-gray-500">January 21, 2026</span>
      </div>
      <div className="flex items-center space-x-6">
        <div className="relative">
          <Bell className="text-gray-600 cursor-pointer hover:text-blue-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">8</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="bg-green-500 w-3 h-3 rounded-full"></div>
          <span className="text-sm text-gray-600">System Active</span>
        </div>
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-6">
        {dashboardStats.map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition">
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-lg`}>
                <stat.icon className="text-white" size={24} />
              </div>
              <span className={`text-sm font-medium ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-gray-600 text-sm font-medium">{stat.title}</h3>
            <p className="text-3xl font-bold text-gray-800 mt-2">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Sales Trend (Last 7 Days)</h3>
          <div className="h-64 flex items-end justify-between space-x-2">
            {[40, 65, 55, 80, 70, 90, 75].map((height, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center">
                <div className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition cursor-pointer" style={{height: `${height}%`}}></div>
                <span className="text-xs text-gray-500 mt-2">Day {idx + 1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Top Selling Medicines</h3>
          <div className="space-y-4">
            {topSelling.map((item, idx) => (
              <div key={idx} className="border-l-4 border-blue-500 pl-3 py-2 hover:bg-gray-50 transition">
                <p className="font-semibold text-sm text-gray-800">{item.name}</p>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">{item.sold} units</span>
                  <span className="text-xs font-bold text-green-600">₹{item.revenue}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-800 mb-4">Recent Transactions</h3>
        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Invoice ID</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Patient Name</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Amount</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Time</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Status</th>
            </tr>
          </thead>
          <tbody>
            {recentBills.map((bill, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-3 text-sm font-medium text-blue-600">{bill.id}</td>
                <td className="py-3 text-sm text-gray-700">{bill.patient}</td>
                <td className="py-3 text-sm font-semibold text-gray-800">₹{bill.amount}</td>
                <td className="py-3 text-sm text-gray-600">{bill.time}</td>
                <td className="py-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    bill.status === 'Paid' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {bill.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const BillingScreen = () => {
    const { subtotal, tax, total } = calculateBillTotal();
    
    return (
      <div className="grid grid-cols-3 gap-6 h-full">
        <div className="col-span-2 space-y-4">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex space-x-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search medicine by name, generic name, or scan barcode..."
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 flex items-center space-x-2">
                <Plus size={20} />
                <span>Prescription</span>
              </button>
            </div>

            {searchTerm && (
              <div className="mt-4 border rounded-lg max-h-64 overflow-y-auto">
                {medicines.filter(m => 
                  m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  m.generic.toLowerCase().includes(searchTerm.toLowerCase())
                ).map((medicine) => (
                  <div
                    key={medicine.id}
                    className="p-4 border-b hover:bg-blue-50 cursor-pointer transition"
                    onClick={() => {
                      addToBill(medicine);
                      setSearchTerm('');
                    }}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold text-gray-800">{medicine.name}</p>
                        <p className="text-sm text-gray-600">Generic: {medicine.generic}</p>
                        <p className="text-xs text-gray-500">Batch: {medicine.batch} | Exp: {medicine.expiry}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-blue-600">₹{medicine.mrp}</p>
                        <p className={`text-xs ${medicine.stock < 100 ? 'text-red-600' : 'text-green-600'}`}>
                          Stock: {medicine.stock}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Bill Items</h3>
            {billItems.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ShoppingCart size={48} className="mx-auto mb-3 opacity-50" />
                <p>No items added. Search and add medicines to start billing.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {billItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-600">Batch: {item.batch}</p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 bg-white rounded-lg border-2 border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-2 hover:bg-gray-100 rounded-l-lg"
                        >
                          <Minus size={16} />
                        </button>
                        <span className="px-3 font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-2 hover:bg-gray-100 rounded-r-lg"
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                      <span className="font-bold text-gray-800 w-24 text-right">₹{(item.mrp * item.quantity).toFixed(2)}</span>
                      <button
                        onClick={() => removeFromBill(item.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Payment Summary</h3>
          
          <div className="space-y-4 mb-6">
            <input
              type="text"
              placeholder="Patient Name"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Patient Phone"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
            <input
              type="text"
              placeholder="Doctor Name (Optional)"
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="border-t-2 border-gray-200 pt-4 space-y-3">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-semibold">₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>GST (12%)</span>
              <span className="font-semibold">₹{tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Discount</span>
              <input
                type="number"
                placeholder="0"
                className="w-24 px-3 py-1 border-2 border-gray-200 rounded-lg text-right focus:border-blue-500 focus:outline-none"
              />
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-800 pt-3 border-t-2 border-gray-200">
              <span>Total</span>
              <span className="text-blue-600">₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition">
                <CreditCard size={18} />
                <span>Card</span>
              </button>
              <button className="flex items-center justify-center space-x-2 px-4 py-2 border-2 border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition">
                <DollarSign size={18} />
                <span>Cash</span>
              </button>
            </div>
            
            <button className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center space-x-2 font-semibold">
              <Check size={20} />
              <span>Complete Payment</span>
            </button>
            
            <button className="w-full bg-gray-600 text-white py-3 rounded-lg hover:bg-gray-700 flex items-center justify-center space-x-2">
              <Printer size={20} />
              <span>Print Bill</span>
            </button>
          </div>
        </div>
      </div>
    );
  };

  const InventoryScreen = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <div className="flex space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search medicines..."
                className="pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:border-blue-500 focus:outline-none"
              />
            </div>
            <button className="flex items-center space-x-2 px-4 py-2 border-2 border-gray-300 rounded-lg hover:bg-gray-50">
              <Filter size={18} />
              <span>Filter</span>
            </button>
          </div>
          <div className="flex space-x-3">
            <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Download size={18} />
              <span>Export</span>
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus size={18} />
              <span>Add Medicine</span>
            </button>
          </div>
        </div>

        <table className="w-full">
          <thead>
            <tr className="border-b-2 border-gray-200">
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Medicine Name</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Generic</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Batch</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Expiry</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Stock</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">MRP</th>
              <th className="text-left py-3 text-sm font-semibold text-gray-600">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr key={medicine.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                <td className="py-4 text-sm font-medium text-gray-800">{medicine.name}</td>
                <td className="py-4 text-sm text-gray-600">{medicine.generic}</td>
                <td className="py-4 text-sm text-gray-600">{medicine.batch}</td>
                <td className="py-4 text-sm text-gray-600">{medicine.expiry}</td>
                <td className="py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    medicine.stock < 100 ? 'bg-red-100 text-red-700' : 
                    medicine.stock < 300 ? 'bg-orange-100 text-orange-700' : 
                    'bg-green-100 text-green-700'
                  }`}>
                    {medicine.stock}
                  </span>
                </td>
                <td className="py-4 text-sm font-semibold text-gray-800">₹{medicine.mrp}</td>
                <td className="py-4">
                  <div className="flex space-x-2">
                    <button className="p-2 text-blue-600 hover:bg-blue-50 rounded">
                      <Edit size={16} />
                    </button>
                    <button className="p-2 text-green-600 hover:bg-green-50 rounded">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gray-100">
      <Navigation />
      <div className="ml-64 flex-1 flex flex-col overflow-hidden">
        <TopBar />
        <div className="flex-1 overflow-y-auto p-8">
          {currentScreen === 'dashboard' && <Dashboard />}
          {currentScreen === 'billing' && <BillingScreen />}
          {currentScreen === 'inventory' && <InventoryScreen />}
          {currentScreen !== 'dashboard' && currentScreen !== 'billing' && currentScreen !== 'inventory' && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <Package size={64} className="mx-auto text-gray-300 mb-4" />
              <h3 className="text-2xl font-bold text-gray-700 mb-2">{currentScreen.charAt(0).toUpperCase() + currentScreen.slice(1)} Module</h3>
              <p className="text-gray-500">This module is under development</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PharmacyUI;