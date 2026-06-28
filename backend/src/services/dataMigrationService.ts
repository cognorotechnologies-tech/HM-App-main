// @ts-nocheck
// Data Migration Service
import { Pool } from 'pg';
import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'hm_app_db',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
});

class DataMigrationService {
    /**
     * Parse CSV file
     */
    parseCSV(filePath: string): any[] {
        const fileContent = fs.readFileSync(filePath, 'utf-8');
        const records = parse(fileContent, {
            columns: true,
            skip_empty_lines: true,
            trim: true
        });
        return records;
    }

    /**
     * Create import job
     */
    async createImportJob(
        importType: string,
        fileName: string,
        fileSize: number,
        totalRows: number,
        importedBy: number,
        mode: 'dry-run' | 'live' = 'live'
    ) {
        const query = `SELECT create_import_job($1, $2, $3, $4, $5, $6)`;
        const result = await pool.query(query, [importType, fileName, fileSize, totalRows, importedBy, mode]);
        return result.rows[0].create_import_job;
    }

    /**
     * Update import job status
     */
    async updateJobStatus(jobId: string, status: string, successful = 0, failed = 0, skipped = 0) {
        const query = `SELECT update_import_job_status($1, $2, $3, $4, $5)`;
        await pool.query(query, [jobId, status, successful, failed, skipped]);
    }

    /**
     * Log import detail
     */
    async logImportDetail(
        jobId: number,
        rowNumber: number,
        status: string,
        originalData: any,
        processedData: any | null,
        createdRecordId: number | null,
        errorMessage: string | null
    ) {
        const query = `
            INSERT INTO import_log_details (
                import_job_id, row_number, status, original_data, processed_data, created_record_id, error_message
            ) VALUES ((SELECT id FROM import_jobs WHERE job_id = $1), $2, $3, $4, $5, $6, $7)
        `;

        await pool.query(query, [
            jobId,
            rowNumber,
            status,
            JSON.stringify(originalData),
            processedData ? JSON.stringify(processedData) : null,
            createdRecordId,
            errorMessage
        ]);
    }

    /**
     * Validate and transform patient data
     */
    validatePatientData(rowData: any, mapping: any[]): { valid: boolean; data: any; errors: string[] } {
        const errors: string[] = [];
        const transformedData: any = {};

        for (const map of mapping) {
            const value = rowData[map.csv_column];

            // Check required fields
            if (map.required && !value) {
                errors.push(`${map.csv_column} is required`);
                continue;
            }

            if (value) {
                // Basic validation
                switch (map.data_type) {
                    case 'email':
                        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                            errors.push(`${map.csv_column} is not a valid email`);
                        }
                        break;
                    case 'phone':
                        // Remove non-digits
                        transformedData[map.db_field] = value.replace(/\D/g, '');
                        break;
                    case 'date':
                        // Simple date parsing (can be enhanced)
                        transformedData[map.db_field] = value;
                        break;
                    case 'number':
                        transformedData[map.db_field] = parseFloat(value);
                        break;
                    default:
                        transformedData[map.db_field] = value;
                }
            }
        }

        return {
            valid: errors.length === 0,
            data: transformedData,
            errors
        };
    }

    /**
     * Import patients from CSV
     */
    async importPatients(filePath: string, userId: number, mode: 'dry-run' | 'live' = 'dry-run') {
        const records = this.parseCSV(filePath);
        const fileName = filePath.split('/').pop() || 'import.csv';
        const fileSize = fs.statSync(filePath).size;

        // Create import job
        const jobId = await this.createImportJob('patients', fileName, fileSize, records.length, userId, mode);

        let successful = 0;
        let failed = 0;

        // Get field mapping template
        const mappingResult = await pool.query(
            `SELECT field_mappings FROM import_field_mapping_templates WHERE import_type = 'patients' AND is_active = true LIMIT 1`
        );
        const fieldMapping = mappingResult.rows[0]?.field_mappings || [];

        for (let i = 0; i < records.length; i++) {
            const row = records[i];
            const rowNumber = i + 1;

            try {
                // Validate data
                const validation = this.validatePatientData(row, fieldMapping);

                if (!validation.valid) {
                    await this.logImportDetail(jobId, rowNumber, 'error', row, null, null, validation.errors.join(', '));
                    failed++;
                    continue;
                }

                if (mode === 'live') {
                    // Insert patient
                    const insertQuery = `
                        INSERT INTO patients (name, email, phone, date_of_birth, gender, address, blood_group)
                        VALUES ($1, $2, $3, $4, $5, $6, $7)
                        RETURNING id
                    `;

                    const result = await pool.query(insertQuery, [
                        validation.data.name,
                        validation.data.email || null,
                        validation.data.phone,
                        validation.data.date_of_birth || null,
                        validation.data.gender || null,
                        validation.data.address || null,
                        validation.data.blood_group || null
                    ]);

                    const patientId = result.rows[0].id;
                    await this.logImportDetail(jobId, rowNumber, 'success', row, validation.data, patientId, null);
                    successful++;
                } else {
                    // Dry run - just log as success
                    await this.logImportDetail(jobId, rowNumber, 'success', row, validation.data, null, null);
                    successful++;
                }

            } catch (error: any) {
                await this.logImportDetail(jobId, rowNumber, 'error', row, null, null, error.message);
                failed++;
            }
        }

        // Update job status
        await this.updateJobStatus(jobId, 'completed', successful, failed, 0);

        return {
            job_id: jobId,
            total: records.length,
            successful,
            failed,
            mode
        };
    }

    /**
     * Get import job details
     */
    async getImportJob(jobId: string) {
        const query = `SELECT * FROM import_jobs_summary WHERE job_id = $1`;
        const result = await pool.query(query, [jobId]);
        return result.rows[0];
    }

    /**
     * Get import job logs
     */
    async getImportLogs(jobId: string, status?: string) {
        let query = `
            SELECT ild.* FROM import_log_details ild
            JOIN import_jobs ij ON ild.import_job_id = ij.id
            WHERE ij.job_id = $1
        `;

        const params: any[] = [jobId];

        if (status) {
            query += ` AND ild.status = $2`;
            params.push(status);
        }

        query += ` ORDER BY ild.row_number`;

        const result = await pool.query(query, params);
        return result.rows;
    }

    /**
     * Get all import jobs
     */
    async getAllImportJobs(limit = 50) {
        const query = `SELECT * FROM import_jobs_summary LIMIT $1`;
        const result = await pool.query(query, [limit]);
        return result.rows;
    }
    /**
     * Delete import job and related logs
     */
    async deleteJob(jobId: number) {
        // Logs will be deleted by cascade if FK is set, otherwise we might need manual deletion
        // Assuming FK with ON DELETE CASCADE for import_log_details
        const query = `DELETE FROM import_jobs WHERE id = $1`;
        await pool.query(query, [jobId]);
    }
}

export default new DataMigrationService();
