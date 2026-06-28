import pool from '../src/db';
import { v4 as uuidv4 } from 'uuid';

async function seed() {
    const client = await pool.connect();
    try {
        console.log('🌱 Seeding LARGE Pharmacy Dataset...');
        await client.query('BEGIN');

        // 1. Categories
        const categoriesData = [
            { name: 'Analgesics', description: 'Pain relief' },
            { name: 'Antibiotics', description: 'Bacterial infections' },
            { name: 'Anti-diabetic', description: 'Diabetes management' },
            { name: 'Cardiovascular', description: 'Heart & Blood pressure' },
            { name: 'Gastrointestinal', description: 'Stomach & Digestion' },
            { name: 'Antipyretics', description: 'Fever reduction' },
            { name: 'Antihistamines', description: 'Allergy relief' },
            { name: 'Vitamins', description: 'Nutritional supplements' },
            { name: 'Respiratory', description: 'Asthma & Cough' },
            { name: 'Dermatological', description: 'Skin treatments' }
        ];

        const categoryMap = new Map();
        for (const cat of categoriesData) {
            let res = await client.query('SELECT category_id FROM pharmacy_drug_categories WHERE category_name = $1', [cat.name]);
            let id;
            if (res.rows.length === 0) {
                id = uuidv4();
                await client.query(
                    'INSERT INTO pharmacy_drug_categories (category_id, category_name, description) VALUES ($1, $2, $3)',
                    [id, cat.name, cat.description]
                );
            } else {
                id = res.rows[0].category_id;
            }
            categoryMap.set(cat.name, id);
        }

        // 2. Manufacturers
        const manufacturersData = [
            { name: 'Pfizer' },
            { name: 'GlaxoSmithKline' },
            { name: 'Cipla' },
            { name: 'Sun Pharma' },
            { name: 'Dr. Reddys' },
            { name: 'Abbott' },
            { name: 'Lupin' }
        ];

        const manufacturerMap = new Map();
        for (const mfg of manufacturersData) {
            let res = await client.query('SELECT manufacturer_id FROM pharmacy_manufacturers WHERE manufacturer_name = $1', [mfg.name]);
            let id;
            if (res.rows.length === 0) {
                id = uuidv4();
                await client.query(
                    'INSERT INTO pharmacy_manufacturers (manufacturer_id, manufacturer_name) VALUES ($1, $2)',
                    [id, mfg.name]
                );
            } else {
                id = res.rows[0].manufacturer_id;
            }
            manufacturerMap.set(mfg.name, id);
        }

        // 3. Default Supplier
        const supplierName = 'Global Pharma Solutions';
        let supRes = await client.query('SELECT supplier_id FROM pharmacy_suppliers WHERE supplier_name = $1', [supplierName]);
        let supplierId;
        if (supRes.rows.length === 0) {
            supplierId = uuidv4();
            await client.query(`
                INSERT INTO pharmacy_suppliers (supplier_id, supplier_name, contact_person, phone_number, email, address, is_active)
                VALUES ($1, $2, 'John Smith', '555-9000', 'orders@globalpharma.com', '123 Pharma Way, Medical District', true)
            `, [supplierId, supplierName]);
        } else {
            supplierId = supRes.rows[0].supplier_id;
        }

        // 4. Large Medicine List (32 items)
        const medicines = [
            { name: 'Paracetamol 500mg', generic: 'Acetaminophen', cat: 'Analgesics', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Amoxicillin 250mg', generic: 'Amoxicillin', cat: 'Antibiotics', mfg: 'GlaxoSmithKline', uom: 'Capsule' },
            { name: 'Metformin 500mg', generic: 'Metformin', cat: 'Anti-diabetic', mfg: 'Sun Pharma', uom: 'Tablet' },
            { name: 'Atorvastatin 10mg', generic: 'Atorvastatin', cat: 'Cardiovascular', mfg: 'Pfizer', uom: 'Tablet' },
            { name: 'Omeprazole 20mg', generic: 'Omeprazole', cat: 'Gastrointestinal', mfg: 'Sun Pharma', uom: 'Capsule' },
            { name: 'Ibuprofen 400mg', generic: 'Ibuprofen', cat: 'Analgesics', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Azithromycin 500mg', generic: 'Azithromycin', cat: 'Antibiotics', mfg: 'Pfizer', uom: 'Tablet' },
            { name: 'Amlodipine 5mg', generic: 'Amlodipine', cat: 'Cardiovascular', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Cetirizine 10mg', generic: 'Cetirizine', cat: 'Antihistamines', mfg: 'Sun Pharma', uom: 'Tablet' },
            { name: 'Pantoprazole 40mg', generic: 'Pantoprazole', cat: 'Gastrointestinal', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Vitamin C 500mg', generic: 'Ascorbic Acid', cat: 'Vitamins', mfg: 'Abbott', uom: 'Tablet' },
            { name: 'Vitamin D3 60k', generic: 'Cholecalciferol', cat: 'Vitamins', mfg: 'Lupin', uom: 'Capsule' },
            { name: 'Salbutamol Inhaler', generic: 'Albuterol', cat: 'Respiratory', mfg: 'GlaxoSmithKline', uom: 'Inhaler' },
            { name: 'Montelukast 10mg', generic: 'Montelukast', cat: 'Respiratory', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Diclofenac Gel', generic: 'Diclofenac', cat: 'Analgesics', mfg: 'Dr. Reddys', uom: 'Tube' },
            { name: 'Clotrimazole Cream', generic: 'Clotrimazole', cat: 'Dermatological', mfg: 'Sun Pharma', uom: 'Tube' },
            { name: 'Losartan 50mg', generic: 'Losartan', cat: 'Cardiovascular', mfg: 'Abbott', uom: 'Tablet' },
            { name: 'Gliclazide 80mg', generic: 'Gliclazide', cat: 'Anti-diabetic', mfg: 'Sun Pharma', uom: 'Tablet' },
            { name: 'Augmentin 625mg', generic: 'Amoxicillin + Clavulanate', cat: 'Antibiotics', mfg: 'GlaxoSmithKline', uom: 'Tablet' },
            { name: 'Ciprofloxacin 500mg', generic: 'Ciprofloxacin', cat: 'Antibiotics', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Telmisartan 40mg', generic: 'Telmisartan', cat: 'Cardiovascular', mfg: 'Lupin', uom: 'Tablet' },
            { name: 'Rosuvastatin 10mg', generic: 'Rosuvastatin', cat: 'Cardiovascular', mfg: 'Sun Pharma', uom: 'Tablet' },
            { name: 'Levocetirizine 5mg', generic: 'Levocetirizine', cat: 'Antihistamines', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Loperamide 2mg', generic: 'Loperamide', cat: 'Gastrointestinal', mfg: 'Sun Pharma', uom: 'Capsule' },
            { name: 'Domperidone 10mg', generic: 'Domperidone', cat: 'Gastrointestinal', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'B-Complex+B12', generic: 'Multivitamin', cat: 'Vitamins', mfg: 'Abbott', uom: 'Tablet' },
            { name: 'Multivitamin Syrup', generic: 'Multivitamin', cat: 'Vitamins', mfg: 'Cipla', uom: 'Bottle' },
            { name: 'Paracetamol Syrup', generic: 'Paracetamol', cat: 'Antipyretics', mfg: 'Cipla', uom: 'Bottle' },
            { name: 'Cold & Flu Relief', generic: 'Multi-ingredient', cat: 'Antipyretics', mfg: 'Lupin', uom: 'Sachet' },
            { name: 'Hydrocortisone 1%', generic: 'Hydrocortisone', cat: 'Dermatological', mfg: 'Pfizer', uom: 'Tube' },
            { name: 'Folic Acid 5mg', generic: 'Folic Acid', cat: 'Vitamins', mfg: 'Cipla', uom: 'Tablet' },
            { name: 'Metronidazole 400mg', generic: 'Metronidazole', cat: 'Antibiotics', mfg: 'Abbott', uom: 'Tablet' }
        ];

        const insertedMeds = [];
        for (const med of medicines) {
            const catId = categoryMap.get(med.cat);
            const mfgId = manufacturerMap.get(med.mfg);

            let mRes = await client.query('SELECT medicine_id FROM pharmacy_medicines WHERE medicine_name = $1', [med.name]);
            let medId;
            if (mRes.rows.length === 0) {
                medId = uuidv4();
                await client.query(
                    `INSERT INTO pharmacy_medicines (medicine_id, medicine_name, generic_name, category_id, manufacturer_id, unit_of_measurement) 
                     VALUES ($1, $2, $3, $4, $5, $6)`,
                    [medId, med.name, med.generic, catId, mfgId, med.uom]
                );
            } else {
                medId = mRes.rows[0].medicine_id;
            }
            insertedMeds.push({ id: medId, name: med.name });
        }

        // 5. Procurement History (PO -> GRN -> Stock)
        console.log('   -> Creating Procurement History...');

        const poNumber = 'PO-2026-001';
        let poRes = await client.query('SELECT po_id FROM pharmacy_purchase_orders WHERE po_number = $1', [poNumber]);
        let poId;
        if (poRes.rows.length === 0) {
            poId = uuidv4();
            await client.query(`
                INSERT INTO pharmacy_purchase_orders (po_id, po_number, supplier_id, status, total_amount, created_at)
                VALUES ($1, $2, $3, 'completed', 2500.00, NOW() - INTERVAL '5 days')
            `, [poId, poNumber, supplierId]);
        } else {
            poId = poRes.rows[0].po_id;
        }

        const grnNumber = 'GRN-2026-001';
        let grnRes = await client.query('SELECT grn_id FROM pharmacy_grn WHERE grn_number = $1', [grnNumber]);
        let grnId;
        if (grnRes.rows.length === 0) {
            grnId = uuidv4();
            await client.query(`
                INSERT INTO pharmacy_grn (grn_id, grn_number, po_id, supplier_id, total_amount, status, received_date)
                VALUES ($1, $2, $3, $4, 2500.00, 'completed', CURRENT_DATE - 4)
            `, [grnId, grnNumber, poId, supplierId]);
        } else {
            grnId = grnRes.rows[0].grn_id;
        }

        // Populate Inventory from GRN for several medicines
        for (let i = 0; i < Math.min(insertedMeds.length, 20); i++) {
            const med = insertedMeds[i];
            const batchNum = `B-${2026}${String(i).padStart(3, '0')}`;

            // Check if this batch already exists in inventory
            let invRes = await client.query('SELECT stock_id FROM pharmacy_inventory WHERE medicine_id = $1 AND batch_number = $2', [med.id, batchNum]);
            if (invRes.rows.length === 0) {
                const stockId = uuidv4();
                const purchase = 10 + Math.random() * 20;
                const mrp = purchase * 1.5;
                const selling = mrp * 0.9;

                await client.query(`
                    INSERT INTO pharmacy_inventory (stock_id, medicine_id, supplier_id, grn_id, quantity_available, batch_number, expiry_date, purchase_price, mrp, selling_price)
                    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                `, [
                    stockId, med.id, supplierId, grnId,
                    Math.floor(Math.random() * 200) + 50,
                    batchNum,
                    '2026-12-31',
                    purchase.toFixed(2), mrp.toFixed(2), selling.toFixed(2)
                ]);

                // Add second batch for some items to demonstrate multiple batches
                if (i < 8) {
                    const batchNum2 = batchNum + '-X';
                    let invRes2 = await client.query('SELECT stock_id FROM pharmacy_inventory WHERE medicine_id = $1 AND batch_number = $2', [med.id, batchNum2]);
                    if (invRes2.rows.length === 0) {
                        const stockId2 = uuidv4();
                        await client.query(`
                            INSERT INTO pharmacy_inventory (stock_id, medicine_id, supplier_id, grn_id, quantity_available, batch_number, expiry_date, purchase_price, mrp, selling_price)
                            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                        `, [
                            stockId2, med.id, supplierId, grnId,
                            30,
                            batchNum2,
                            '2027-04-15',
                            (purchase * 1.1).toFixed(2), (mrp * 1.1).toFixed(2), (selling * 1.1).toFixed(2)
                        ]);
                    }
                }
            }
        }

        await client.query('COMMIT');
        console.log('✅ LARGE Seed Complete!');
    } catch (e) {
        await client.query('ROLLBACK');
        console.error('❌ LARGE Seed Failed:', e);
    } finally {
        client.release();
        process.exit(0);
    }
}

seed();
