-- Fix: Drop old incompatible health_metrics table and recreate with correct schema
DROP TABLE IF EXISTS public.health_metrics CASCADE;

-- Re-create health_metrics table with correct columns (Phase 3 Standard)
CREATE TABLE public.health_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
    
    -- Metric Data
    type VARCHAR(50) NOT NULL CHECK (type IN ('blood_pressure', 'blood_sugar', 'heart_rate', 'weight', 'height', 'temperature', 'bmi', 'spo2')),
    value JSONB NOT NULL, -- e.g., { systolic: 120, diastolic: 80 } or { value: 98.6 }
    unit VARCHAR(20) NOT NULL, -- 'bpm', 'kg', 'cm', etc.
    
    -- Context
    measured_at TIMESTAMPTZ DEFAULT NOW(),
    notes TEXT,
    
    -- Meta
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_health_metrics_patient ON public.health_metrics(patient_id);
CREATE INDEX idx_health_metrics_type ON public.health_metrics(type);
CREATE INDEX idx_health_metrics_measured ON public.health_metrics(measured_at DESC);

-- Enable RLS
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- 1. Patients manage own metrics
CREATE POLICY "Patients manage own metrics" ON public.health_metrics
    FOR ALL USING (
        patient_id IN (SELECT id FROM public.patients WHERE id = auth.uid())
    );

-- 2. Doctors view patient metrics
CREATE POLICY "Doctors view patient metrics" ON public.health_metrics
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.appointments a
            JOIN public.doctors d ON a.doctor_id = d.id
            WHERE a.patient_id = public.health_metrics.patient_id
            AND d.id = auth.uid()
        )
    );

-- Reload Schema Cache
NOTIFY pgrst, 'reload';
