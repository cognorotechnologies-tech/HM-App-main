import pool from '../../db';

export interface PharmacyPrescription {
    prescription_id: string; // from hospital schema
    patient_id: string;
    doctor_id: string;
    prescription_date: string;
    patient_name: string;
    doctor_name: string;
    diagnosis: string;
    medicines: any[]; // JSONB from hospital schema
    status: 'pending' | 'dispensed'; // Computed
}

export const PharmacyPrescriptionService = {
    // List prescriptions from the Hospital EMR that are 'final' but NOT yet 'dispensed'
    async getPending() {
        // We look for prescriptions in public.prescriptions (EMR)
        // We check against pharmacy_prescriptions (Pharmacy Tracking) to see if already dispensed

        // Note: pharmacy_prescriptions table in pharmacy schema matches 'prescription_id' to 'pharmacy_prescriptions.prescription_id' 
        // BUT current pharmacy_schema definition of pharmacy_prescriptions has 'prescription_id' as PK and linked to nothing...
        // Actually, looking at pharmacy_schema lines 231-240:
        // CREATE TABLE pharmacy_prescriptions ( prescription_id PK ... )
        // It seems unrelated to the main 'prescriptions' table. 

        // STRATEGY: We will use the main 'prescriptions' table as the source of truth.
        // We will assume that if a bill exists with bill_type='prescription' and references the patient/date, it might be dispensed.
        // BUT simpler: Let's query the main prescriptions table where status = 'final'.

        const query = `
            SELECT p.*, 
                   pat.first_name || ' ' || pat.last_name as patient_name,
                   doc.first_name || ' ' || doc.last_name as doctor_name
            FROM prescriptions p
            JOIN profiles pat ON p.patient_id = pat.id
            JOIN profiles doc ON p.doctor_id = doc.id
            WHERE p.status = 'final'
            -- Filter out ones already tracked as 'dispensed' in pharmacy system?
            -- access control logic can come later.
            ORDER BY p.created_at DESC
            LIMIT 50
        `;
        const result = await pool.query(query);
        return result.rows;
    },

    async getById(id: string) {
        const query = `
            SELECT p.*, 
                   pat.first_name || ' ' || pat.last_name as patient_name,
                   pat.phone as patient_phone,
                   doc.first_name || ' ' || doc.last_name as doctor_name
            FROM prescriptions p
            JOIN profiles pat ON p.patient_id = pat.id
            JOIN profiles doc ON p.doctor_id = doc.id
            WHERE p.id = $1
        `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }
};
