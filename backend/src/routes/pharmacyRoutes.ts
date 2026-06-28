import express from 'express';
import * as medicineController from '../controllers/pharmacy/medicineController';
import * as inventoryController from '../controllers/pharmacy/inventoryController';
import * as billingController from '../controllers/pharmacy/billingController';
import * as supplierController from '../controllers/pharmacy/supplierController';
import * as poController from '../controllers/pharmacy/purchaseOrderController';
import * as grnController from '../controllers/pharmacy/grnController';
import * as prescriptionController from '../controllers/pharmacy/prescriptionController';
import { shiftController } from '../controllers/pharmacy/shiftController';
import { analyticsController } from '../controllers/pharmacy/analyticsController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// Apply authentication middleware to all pharmacy routes
router.use(authenticateToken);

// Placeholder route to verify module is loaded
router.get('/', (req, res) => {
    res.json({ message: 'Pharmacy Module Active' });
});

// Medicine Routes
router.post('/medicines', medicineController.createMedicine);
router.put('/medicines/:id', medicineController.updateMedicine);
router.get('/medicines/:id', medicineController.getMedicineById);
router.get('/medicines', medicineController.listMedicines);
router.delete('/medicines/:id', medicineController.deleteMedicine);

// Inventory Routes
router.post('/inventory', inventoryController.addStock);
router.get('/inventory', inventoryController.getStockList);
router.get('/inventory/expiring', inventoryController.getExpiringStock);
router.get('/inventory/low-stock', inventoryController.getLowStock);

// Billing & Sales Routes
router.post('/bills', billingController.createBill);
router.get('/bills', billingController.listBills);
router.get('/bills/:id', billingController.getBillById);
router.post('/sales/return', billingController.processReturn);
router.get('/sales/:id', billingController.getBillById); // For searching bill in return page

// Shift Routes
router.get('/shift/current', shiftController.getCurrentShift);
router.get('/shift/history', shiftController.getShiftHistory);
router.post('/shift/open', shiftController.openShift);
router.post('/shift/close', shiftController.closeShift);

// Analytics Routes
router.get('/analytics/daily-sales', analyticsController.getDailySales);
router.get('/analytics/top-medicines', analyticsController.getTopMedicines);
router.get('/analytics/valuation', analyticsController.getStockValuation);

// Supplier Routes
router.post('/suppliers', supplierController.createSupplier);
router.get('/suppliers', supplierController.listSuppliers);
router.put('/suppliers/:id', supplierController.updateSupplier);
router.get('/suppliers/:id', supplierController.getSupplierById);
router.delete('/suppliers/:id', supplierController.deleteSupplier);

// Purchase Order Routes
router.post('/orders', poController.createPurchaseOrder);
router.get('/orders', poController.listPurchaseOrders);
router.get('/orders/:id', poController.getPurchaseOrderById);
router.put('/orders/:id/status', poController.updatePOStatus);

// GRN Routes
router.post('/grn', grnController.createGRN);

// Prescription Routes
router.get('/prescriptions/pending', prescriptionController.listPendingPrescriptions);
router.get('/prescriptions/:id', prescriptionController.getPrescriptionById);

export default router;