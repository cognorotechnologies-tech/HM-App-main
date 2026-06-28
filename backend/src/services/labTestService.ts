// @ts-nocheck
// Lab Test Ordering Service
import { Pool } from 'pg';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hm_app_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

class LabTestService {
    // Get all available tests
    async getAllTests(category?: string) {
        let query = 'SELECT * FROM lab_tests WHERE is_active = true';
        const params: any[] = [];

        if (category) {
            query += ' AND category = $1';
            params.push(category);
        }

        query += ' ORDER BY category, test_name';

        const result = await pool.query(query, params);
        return result.rows;
    }

    // Get popular tests
    async getPopularTests() {
        const query = 'SELECT * FROM popular_lab_tests';
        const result = await pool.query(query);
        return result.rows;
    }

    // Get test by ID or code
    async getTestById(id: number) {
        const query = 'SELECT * FROM lab_tests WHERE id = $1 AND is_active = true';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

    async getTestByCode(code: string) {
        const query = 'SELECT * FROM lab_tests WHERE test_code = $1 AND is_active = true';
        const result = await pool.query(query, [code]);
        return result.rows[0];
    }

    // Create lab order
    async createOrder(orderData: any) {
        const {
            patient_id,
            doctor_id,
            appointment_id,
            ordered_tests, // Array of test objects
            total_amount,
            priority = 'routine',
            clinical_notes,
            scheduled_date,
            scheduled_time,
            created_by
        } = orderData;

        const query = `
            INSERT INTO lab_orders (
                patient_id, doctor_id, appointment_id, ordered_tests, total_amount,
                priority, clinical_notes, scheduled_date, scheduled_time, created_by
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *
        `;

        const result = await pool.query(query, [
            patient_id, doctor_id, appointment_id, JSON.stringify(ordered_tests), total_amount,
            priority, clinical_notes, scheduled_date, scheduled_time, created_by
        ]);

        return result.rows[0];
    }

    // Get orders by patient
    async getPatientOrders(patientId: number) {
        const query = `
            SELECT 
                lo.*,
                d.name as doctor_name,
                p.name as patient_name
            FROM lab_orders lo
            JOIN doctors d ON lo.doctor_id = d.id
            JOIN patients p ON lo.patient_id = p.id
            WHERE lo.patient_id = $1
            ORDER BY lo.created_at DESC
        `;

        const result = await pool.query(query, [patientId]);
        return result.rows;
    }

    // Get orders by doctor
    async getDoctorOrders(doctorId: number, status?: string) {
        let query = `
            SELECT 
                lo.*,
                p.name as patient_name,
                p.phone as patient_phone
            FROM lab_orders lo
            JOIN patients p ON lo.patient_id = p.id
            WHERE lo.doctor_id = $1
        `;

        const params: any[] = [doctorId];

        if (status) {
            query += ' AND lo.status = $2';
            params.push(status);
        }

        query += ' ORDER BY lo.created_at DESC';

        const result = await pool.query(query, params);
        return result.rows;
    }

    // Update order status
    async updateOrderStatus(orderId: number, status: string, updates: any = {}) {
        const {
            results_available,
            results_file_url,
            results_data,
            abnormal_flags,
            verified_by
        } = updates;

        const query = `
            UPDATE lab_orders
            SET 
                status = $1,
                results_available = COALESCE($2, results_available),
                results_file_url = COALESCE($3, results_file_url),
                results_data = COALESCE($4, results_data),
                abnormal_flags = COALESCE($5, abnormal_flags),
                verified_by = COALESCE($6, verified_by),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $7
            RETURNING *
        `;

        const result = await pool.query(query, [
            status,
            results_available,
            results_file_url,
            results_data ? JSON.stringify(results_data) : null,
            abnormal_flags ? JSON.stringify(abnormal_flags) : null,
            verified_by,
            orderId
        ]);

        return result.rows[0];
    }

    // Add test results
    async addTestResult(resultData: any) {
        const {
            lab_order_id,
            test_id,
            test_name,
            parameter_name,
            result_value,
            unit,
            reference_range,
            is_abnormal,
            abnormal_flag
        } = resultData;

        const query = `
            INSERT INTO lab_test_results (
                lab_order_id, test_id, test_name, parameter_name,
                result_value, unit, reference_range, is_abnormal, abnormal_flag,
                performed_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP)
            RETURNING *
        `;

        const result = await pool.query(query, [
            lab_order_id, test_id, test_name, parameter_name,
            result_value, unit, reference_range, is_abnormal, abnormal_flag
        ]);

        return result.rows[0];
    }

    // Get test results for an order
    async getOrderResults(orderId: number) {
        const query = `
            SELECT * FROM lab_test_results
            WHERE lab_order_id = $1
            ORDER BY created_at
        `;

        const result = await pool.query(query, [orderId]);
        return result.rows;
    }

    // Get patient lab history
    async getPatientLabHistory(patientId: number) {
        const query = 'SELECT * FROM get_patient_lab_history($1)';
        const result = await pool.query(query, [patientId]);
        return result.rows;
    }

    // Get test categories
    async getTestCategories() {
        const query = `
            SELECT DISTINCT category
            FROM lab_tests
            WHERE is_active = true AND category IS NOT NULL
            ORDER BY category
        `;

        const result = await pool.query(query);
        return result.rows.map(row => row.category);
    }
}

export default new LabTestService();
