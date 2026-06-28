export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            billing_invoices: {
                Row: {
                    id: string
                    invoice_number: string
                    patient_id: string
                    appointment_id: string | null
                    issue_date: string
                    due_date: string | null
                    subtotal: number
                    tax_amount: number
                    discount_amount: number
                    total_amount: number
                    paid_amount: number
                    payment_status: string
                    notes: string | null
                    terms: string | null
                    created_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    invoice_number: string
                    patient_id: string
                    appointment_id?: string | null
                    issue_date?: string
                    due_date?: string | null
                    subtotal?: number
                    tax_amount?: number
                    discount_amount?: number
                    total_amount: number
                    paid_amount?: number
                    payment_status?: string
                    notes?: string | null
                    terms?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    invoice_number?: string
                    patient_id?: string
                    appointment_id?: string | null
                    issue_date?: string
                    due_date?: string | null
                    subtotal?: number
                    tax_amount?: number
                    discount_amount?: number
                    total_amount?: number
                    paid_amount?: number
                    payment_status?: string
                    notes?: string | null
                    terms?: string | null
                    created_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            medical_documents: {
                Row: {
                    id: string
                    patient_id: string
                    document_type: string
                    title: string
                    description: string | null
                    file_path: string
                    file_name: string
                    file_size: number | null
                    mime_type: string | null
                    category: string | null
                    tags: string[] | null
                    uploaded_by: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    document_type: string
                    title: string
                    description?: string | null
                    file_path: string
                    file_name: string
                    file_size?: number | null
                    mime_type?: string | null
                    category?: string | null
                    tags?: string[] | null
                    uploaded_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    document_type?: string
                    title?: string
                    description?: string | null
                    file_path?: string
                    file_name?: string
                    file_size?: number | null
                    mime_type?: string | null
                    category?: string | null
                    tags?: string[] | null
                    uploaded_by?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "medical_documents_patient_id_fkey"
                        columns: ["patient_id"]
                        isOneToOne: false
                        referencedRelation: "patients"
                        referencedColumns: ["id"]
                    }
                ]
            }
            health_metrics: {
                Row: {
                    id: string
                    patient_id: string
                    type: string
                    value: Json
                    unit: string
                    measured_at: string
                    notes: string | null
                    created_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    type: string
                    value: Json
                    unit: string
                    measured_at?: string
                    notes?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    type?: string
                    value?: Json
                    unit?: string
                    measured_at?: string
                    notes?: string | null
                    created_by?: string | null
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "health_metrics_patient_id_fkey"
                        columns: ["patient_id"]
                        isOneToOne: false
                        referencedRelation: "patients"
                        referencedColumns: ["id"]
                    }
                ]
            }
            billing_items: {
                Row: {
                    id: string
                    invoice_id: string
                    service_type: string
                    description: string
                    item_code: string | null
                    quantity: number
                    unit_price: number
                    total_price: number
                    tax_rate: number | null
                    tax_amount: number | null
                    discount_percent: number | null
                    discount_amount: number | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    service_type: string
                    description: string
                    item_code?: string | null
                    quantity?: number
                    unit_price: number
                    total_price: number
                    tax_rate?: number | null
                    tax_amount?: number | null
                    discount_percent?: number | null
                    discount_amount?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    service_type?: string
                    description?: string
                    item_code?: string | null
                    quantity?: number
                    unit_price?: number
                    total_price?: number
                    tax_rate?: number | null
                    tax_amount?: number | null
                    discount_percent?: number | null
                    discount_amount?: number | null
                    created_at?: string
                }
                Relationships: []
            }
            payment_transactions: {
                Row: {
                    id: string
                    invoice_id: string
                    transaction_id: string
                    amount: number
                    payment_method: string
                    payment_gateway: string | null
                    gateway_transaction_id: string | null
                    gateway_response: Json | null
                    status: string
                    processed_at: string | null
                    refunded_at: string | null
                    notes: string | null
                    processed_by: string | null
                    created_at: string
                }
                Insert: {
                    id?: string
                    invoice_id: string
                    transaction_id: string
                    amount: number
                    payment_method: string
                    payment_gateway?: string | null
                    gateway_transaction_id?: string | null
                    gateway_response?: Json | null
                    status?: string
                    processed_at?: string | null
                    refunded_at?: string | null
                    notes?: string | null
                    processed_by?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    invoice_id?: string
                    transaction_id?: string
                    amount?: number
                    payment_method?: string
                    payment_gateway?: string | null
                    gateway_transaction_id?: string | null
                    gateway_response?: Json | null
                    status?: string
                    processed_at?: string | null
                    refunded_at?: string | null
                    notes?: string | null
                    processed_by?: string | null
                    created_at?: string
                }
                Relationships: []
            }
            appointment_modifications: {
                Row: {
                    id: string
                    appointment_id: string
                    modification_type: string
                    old_date: string | null
                    old_start_time: string | null
                    old_end_time: string | null
                    new_date: string | null
                    new_start_time: string | null
                    new_end_time: string | null
                    reason: string | null
                    modified_by: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    appointment_id: string
                    modification_type: string
                    old_date?: string | null
                    old_start_time?: string | null
                    old_end_time?: string | null
                    new_date?: string | null
                    new_start_time?: string | null
                    new_end_time?: string | null
                    reason?: string | null
                    modified_by?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    appointment_id?: string
                    modification_type?: string
                    old_date?: string | null
                    old_start_time?: string | null
                    old_end_time?: string | null
                    new_date?: string | null
                    new_start_time?: string | null
                    new_end_time?: string | null
                    reason?: string | null
                    modified_by?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            appointments: {
                Row: {
                    id: string
                    patient_id: string | null
                    family_member_id: string | null
                    doctor_id: string | null
                    department_id: string | null
                    appointment_date: string
                    start_time: string
                    end_time: string
                    status: string
                    reason: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    family_member_id?: string | null
                    doctor_id?: string | null
                    department_id?: string | null
                    appointment_date: string
                    start_time: string
                    end_time: string
                    status?: string
                    reason?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    family_member_id?: string | null
                    doctor_id?: string | null
                    department_id?: string | null
                    appointment_date?: string
                    start_time?: string
                    end_time?: string
                    status?: string
                    reason?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            consultations: {
                Row: {
                    id: string
                    patient_id: string | null
                    doctor_id: string | null
                    appointment_id: string | null
                    diagnosis: string | null
                    notes: string | null
                    duration: number | null
                    completed_at: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    doctor_id?: string | null
                    appointment_id?: string | null
                    diagnosis?: string | null
                    notes?: string | null
                    duration?: number | null
                    completed_at?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    doctor_id?: string | null
                    appointment_id?: string | null
                    diagnosis?: string | null
                    notes?: string | null
                    duration?: number | null
                    completed_at?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            departments: {
                Row: {
                    id: string
                    name: string
                    description: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    description?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    description?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            doctors: {
                Row: {
                    id: string
                    department_id: string | null
                    specialization: string | null
                    qualifications: string | null
                    license_number: string | null
                    years_of_experience: number | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    department_id?: string | null
                    specialization?: string | null
                    qualifications?: string | null
                    license_number?: string | null
                    years_of_experience?: number | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    department_id?: string | null
                    specialization?: string | null
                    qualifications?: string | null
                    license_number?: string | null
                    years_of_experience?: number | null
                    created_at?: string | null
                }
                Relationships: []
            }
            family_members: {
                Row: {
                    id: string
                    patient_id: string
                    first_name: string
                    last_name: string
                    date_of_birth: string | null
                    gender: string | null
                    relationship: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    patient_id: string
                    first_name: string
                    last_name: string
                    date_of_birth?: string | null
                    gender?: string | null
                    relationship: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    patient_id?: string
                    first_name?: string
                    last_name?: string
                    date_of_birth?: string | null
                    gender?: string | null
                    relationship?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "family_members_patient_id_fkey"
                        columns: ["patient_id"]
                        referencedRelation: "patients"
                        referencedColumns: ["id"]
                    }
                ]
            }

            letterhead_template: {
                Row: {
                    id: string
                    name: string
                    template_type: string
                    design_config: Json | null
                    is_active: boolean | null
                    created_by: string | null
                    created_at: string | null
                    updated_at: string | null
                }
                Insert: {
                    id?: string
                    name: string
                    template_type?: string
                    design_config?: Json | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Update: {
                    id?: string
                    name?: string
                    template_type?: string
                    design_config?: Json | null
                    is_active?: boolean | null
                    created_by?: string | null
                    created_at?: string | null
                    updated_at?: string | null
                }
                Relationships: []
            }

            patient_doctor_messages: {
                Row: {
                    id: string
                    patient_id: string
                    doctor_id: string
                    sender_type: string
                    content: string
                    attachments: Json | null
                    is_read: boolean | null
                    read_at: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id: string
                    doctor_id: string
                    sender_type: string
                    content: string
                    attachments?: Json | null
                    is_read?: boolean | null
                    read_at?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string
                    doctor_id?: string
                    sender_type?: string
                    content?: string
                    attachments?: Json | null
                    is_read?: boolean | null
                    read_at?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            patients: {
                Row: {
                    id: string
                    date_of_birth: string | null
                    blood_group: string | null
                    address: string | null
                    emergencycontact: string | null
                    medical_history: Json | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    date_of_birth?: string | null
                    blood_group?: string | null
                    address?: string | null
                    emergencycontact?: string | null
                    medical_history?: Json | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    date_of_birth?: string | null
                    blood_group?: string | null
                    address?: string | null
                    emergencycontact?: string | null
                    medical_history?: Json | null
                    created_at?: string | null
                }
                Relationships: []
            }
            prescriptions: {
                Row: {
                    id: string
                    patient_id: string | null
                    doctor_id: string | null
                    consultation_id: string | null
                    prescription_number: string
                    diagnosis: string | null
                    medicines: Json | null
                    instructions: string | null
                    investigations: Json | null
                    follow_up_date: string | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    patient_id?: string | null
                    doctor_id?: string | null
                    consultation_id?: string | null
                    prescription_number: string
                    diagnosis?: string | null
                    medicines?: Json | null
                    instructions?: string | null
                    investigations?: Json | null
                    follow_up_date?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    patient_id?: string | null
                    doctor_id?: string | null
                    consultation_id?: string | null
                    prescription_number?: string
                    diagnosis?: string | null
                    medicines?: Json | null
                    instructions?: string | null
                    investigations?: Json | null
                    follow_up_date?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            profiles: {
                Row: {
                    id: string
                    email: string | null
                    first_name: string | null
                    last_name: string | null
                    phone: string | null
                    role: string | null
                    created_at: string | null
                }
                Insert: {
                    id: string
                    email?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    phone?: string | null
                    role?: string | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    email?: string | null
                    first_name?: string | null
                    last_name?: string | null
                    phone?: string | null
                    role?: string | null
                    created_at?: string | null
                }
                Relationships: []
            }
            schedules: {
                Row: {
                    id: string
                    doctor_id: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    from_date: string | null
                    to_date: string | null
                    slot_duration: number | null
                    is_available: boolean | null
                    created_at: string | null
                }
                Insert: {
                    id?: string
                    doctor_id?: string | null
                    day_of_week: number
                    start_time: string
                    end_time: string
                    from_date?: string | null
                    to_date?: string | null
                    slot_duration?: number | null
                    is_available?: boolean | null
                    created_at?: string | null
                }
                Update: {
                    id?: string
                    doctor_id?: string | null
                    day_of_week?: number
                    start_time?: string
                    end_time?: string
                    from_date?: string | null
                    to_date?: string | null
                    slot_duration?: number | null
                    is_available?: boolean | null
                    created_at?: string | null
                }
                Relationships: []
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            appointment_status: "pending" | "confirmed" | "completed" | "cancelled" | "no-show"
            user_role: "admin" | "doctor" | "patient" | "receptionist"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}
