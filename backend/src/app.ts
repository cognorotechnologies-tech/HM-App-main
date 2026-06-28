import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

import authRoutes from './routes/authRoutes';
import adminRoutes from './routes/adminRoutes';
import doctorRoutes from './routes/doctorRoutes';
import departmentRoutes from './routes/departmentRoutes';
import familyRoutes from './routes/familyRoutes';
import prescriptionRoutes from './routes/prescriptionRoutes';
import appointmentModificationRoutes from './routes/appointmentModificationRoutes';
import billingRoutes from './routes/billingRoutes';
import paymentRoutes from './routes/paymentRoutes';
import messagingRoutes from './routes/messagingRoutes';
import healthMetricsRoutes from './routes/healthMetricsRoutes';
import appointmentRoutes from './routes/appointmentRoutes';
import scheduleRoutes from './routes/scheduleRoutes';
import documentRoutes from './routes/documentRoutes';
import receptionistRoutes from './routes/receptionistRoutes';
import taskRoutes from './routes/taskRoutes';
import campaignRoutes from './routes/campaignRoutes';
import workflowRoutes from './routes/workflowRoutes';
import surveyRoutes from './routes/surveyRoutes';
import trackingRoutes from './routes/trackingRoutes';
import patientRoutes from './routes/patientRoutes';
import pharmacyRoutes from './routes/pharmacyRoutes';
import appointmentActivityRoutes from './routes/appointmentActivity';
import prescriptionCustomizationRoutes from './routes/prescriptionCustomization';
import labTestRoutes from './routes/labTests';
import dataMigrationRoutes from './routes/dataMigration';
import aiRoutes from './routes/aiRoutes';

import prescriptionTemplateRoutes from './routes/prescriptionTemplateRoutes';
import labResultRoutes from './routes/labResultRoutes';
import followUpRoutes from './routes/followUpRoutes';
import transcriptRoutes from './routes/transcriptRoutes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());

app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/doctors', doctorRoutes);
app.use('/departments', departmentRoutes);
app.use('/family-members', familyRoutes);
app.use('/prescriptions', prescriptionRoutes);
app.use('/prescription-templates', prescriptionTemplateRoutes);
app.use('/lab-results', labResultRoutes);
app.use('/follow-ups', followUpRoutes);
app.use('/appointment-modifications', appointmentModificationRoutes);
app.use('/billing', billingRoutes);
app.use('/payments', paymentRoutes);
app.use('/messaging', messagingRoutes);
app.use('/health-metrics', healthMetricsRoutes);
app.use('/appointments', appointmentRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/documents', documentRoutes);
app.use('/receptionist', receptionistRoutes);
app.use('/tasks', taskRoutes);
app.use('/campaigns', campaignRoutes);
app.use('/workflows', workflowRoutes);
app.use('/surveys', surveyRoutes);
app.use('/tracking', trackingRoutes);
app.use('/patients', patientRoutes);
app.use('/pharmacy', pharmacyRoutes);
app.use('/appointment-activity', appointmentActivityRoutes);
app.use('/prescription-customization', prescriptionCustomizationRoutes);
app.use('/lab-tests', labTestRoutes);
app.use('/data-migration', dataMigrationRoutes);
app.use('/ai', aiRoutes);
app.use('/transcripts', transcriptRoutes);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));


// Basic health check
app.get('/', (req, res) => {
    res.json({ message: 'HM-App Backend is running', timestamp: new Date() });
});

export default app;
