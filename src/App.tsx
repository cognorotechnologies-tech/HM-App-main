import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { ToastProvider } from './contexts/ToastContext';
import ToastContainer from './components/ToastContainer';
import PublicLayout from './layouts/PublicLayout';
import StaffAuthLayout from './layouts/StaffAuthLayout';
import StaffDashboardLayout from './layouts/StaffDashboardLayout';
import Home from './pages/Home';
import About from './pages/About';
import Services from './pages/Services';
import PatientResources from './pages/PatientResources';
import Contact from './pages/Contact';

import PatientLogin from './pages/PatientLogin';
import DoctorLogin from './pages/DoctorLogin';
import AdminLogin from './pages/AdminLogin';
import ReceptionistLogin from './pages/ReceptionistLogin';
import PharmacistLogin from './pages/PharmacistLogin';
import StaffPortal from './pages/StaffPortal';
import Register from './pages/Register';
import Doctors from './pages/Doctors';
import DoctorProfile from './pages/DoctorProfile';
import Departments from './pages/Departments';

import ProtectedRoute from './components/ProtectedRoute';
import RoleBasedDashboardRedirect from './components/RoleBasedDashboardRedirect';
import ScrollToTop from './components/ScrollToTop';
import PatientDashboard from './features/patient/PatientDashboard';
import DoctorDashboard from './features/doctor/DoctorDashboard';
import AdminDashboard from './features/admin/AdminDashboard';
import ReceptionistDashboard from './features/receptionist/ReceptionistDashboard';
import PatientRegistration from './features/receptionist/PatientRegistration';
import QueueManagement from './features/receptionist/QueueManagement';
import PatientSearch from './features/receptionist/PatientSearch';
import PatientDetails from './features/receptionist/PatientDetails';
import PrescriptionList from './features/receptionist/PrescriptionList';
import PrescriptionPrint from './features/receptionist/PrescriptionPrint';
import DepartmentsManager from './features/admin/DepartmentsManager';
import DoctorsManager from './features/admin/DoctorsManager';
import ScheduleManager from './features/doctor/ScheduleManager';
import BookAppointment from './features/appointments/BookAppointment';
import AppointmentManager from './features/admin/AppointmentManager';
import DoctorAppointments from './features/doctor/DoctorAppointments';
import PrescriptionForm from './features/prescriptions/PrescriptionForm';
import PrescriptionView from './features/prescriptions/PrescriptionView';
import PatientsManager from './features/admin/PatientsManager';
import SystemSettings from './features/admin/SystemSettings';
import UserManagement from './features/admin/UserManagement';
import PermissionManagement from './features/admin/PermissionManagement';
import TestingDashboard from './pages/TestingDashboard';

import HealthTracking from './features/emr/HealthTracking';
import FamilyManagement from './features/emr/FamilyManagement';
import Messaging from './features/patient/Messaging';
import PatientBillingHistory from './features/billing/PatientBillingHistory';
import PatientInvoiceView from './features/billing/PatientInvoiceView';
import PaymentForm from './features/billing/PaymentForm';
import InvoiceGenerator from './features/admin/billing/InvoiceGenerator';
import AdminInvoiceList from './features/admin/billing/AdminInvoiceList';
import PatientMedicalRecords from './features/emr/PatientMedicalRecords';
import { PatientConsultation } from './features/doctor/PatientConsultation';
import { DoctorPrescriptionSettings } from './features/doctor/DoctorPrescriptionSettings';
import DataMigrationUI from './components/DataMigrationUI';
import CampaignList from './features/campaigns/CampaignList';
import CreateCampaign from './features/campaigns/CreateCampaign';
import CampaignDetails from './features/campaigns/CampaignDetails';
import TemplateManagement from './features/campaigns/TemplateManagement';
import NurseMonitoringDashboard from './features/nurse/NurseMonitoringDashboard';
import PublicSurveyPortal from './features/survey/PublicSurveyPortal';
import WorkflowList from './features/workflow/WorkflowList';
import WorkflowBuilder from './features/workflow/WorkflowBuilder';
import StaffTaskList from './features/staff/StaffTaskList';
import { SurveyManager } from './pages/SurveyManager';
import { TrackingHandler } from './pages/TrackingHandler';
import ProductShowcase from './pages/ProductShowcase';
import DetailedReport from './pages/DetailedReport';
import ExecutiveSummary from './pages/ExecutiveSummary';
import WhatsAppTemplateManager from './features/whatsapp/TemplateManager';
import Pharmacy from './features/pharmacy';





// Main App Component
function App() {
  const { initialize } = useAuthStore();



  useEffect(() => {
    initialize();
  }, [initialize]);


  return (
    <ToastProvider>
      <ToastContainer />
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/services" element={<Services />} />
            <Route path="/resources" element={<PatientResources />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<PatientLogin />} />
            <Route path="/staff" element={<StaffPortal />} />
            <Route path="/register" element={<Register />} />
            <Route path="/doctors" element={<Doctors />} />
            <Route path="/doctors/:id" element={<DoctorProfile />} />
            <Route path="/departments" element={<Departments />} />
            <Route path="/testing" element={<TestingDashboard />} />
            <Route path="/showcase" element={<ProductShowcase />} />
            <Route path="/detailed-report" element={<DetailedReport />} />
            <Route path="/executive-summary" element={<ExecutiveSummary />} />

            {/* Public Survey Portal - Anonymous Access */}
            <Route path="/survey/:token" element={<PublicSurveyPortal />} />

            {/* Patient Protected Routes - Keep Public Header */}
            <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
              <Route path="/dashboard/patient" element={<PatientDashboard />} />
              <Route path="/dashboard/patient/book" element={<BookAppointment />} />
              <Route path="/dashboard/patient/documents" element={<PatientMedicalRecords />} />
              <Route path="/dashboard/patient/health" element={<HealthTracking />} />
              <Route path="/dashboard/patient/family" element={<FamilyManagement />} />
              <Route path="/dashboard/patient/messages" element={<Messaging />} />
              <Route path="/dashboard/patient/billing" element={<PatientBillingHistory />} />

              <Route path="/dashboard/patient/invoice/:invoiceId" element={<PatientInvoiceView />} />
              <Route path="/dashboard/patient/payment/:invoiceId" element={<PaymentForm />} />
              <Route path="/dashboard/patient/prescriptions/:id" element={<PrescriptionView />} />
            </Route>
          </Route>

          {/* Staff Authentication Routes */}
          <Route element={<StaffAuthLayout />}>
            <Route path="/staff/doctor" element={<DoctorLogin />} />
            <Route path="/staff/admin" element={<AdminLogin />} />
            <Route path="/staff/receptionist" element={<ReceptionistLogin />} />
            <Route path="/staff/pharmacist" element={<PharmacistLogin />} />
          </Route>


          <Route path="/pharmacy/*" element={
            <ProtectedRoute allowedRoles={['pharmacist', 'admin'] as any}>
              <Pharmacy />
            </ProtectedRoute>
          } />

          <Route path="/dashboard" element={<ProtectedRoute />}>
            {/* Smart redirect based on user role */}
            <Route index element={<RoleBasedDashboardRedirect />} />

            {/* Pharmacy Module */}


            {/* Staff Dashboard Routes - Use Staff Header */}
            <Route element={<StaffDashboardLayout />}>
              <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
                <Route path="doctor" element={<DoctorDashboard />} />
                <Route path="doctor/schedule" element={<ScheduleManager />} />
                <Route path="doctor/appointments" element={<DoctorAppointments />} />
                <Route path="doctor/consultation/:appointmentId" element={<PatientConsultation />} />
                <Route path="doctor/prescribe/:appointmentId" element={<PrescriptionForm />} />
                <Route path="doctor/prescription/:id" element={<PrescriptionView />} />
                <Route path="doctor/prescription-settings" element={<DoctorPrescriptionSettings />} />
                <Route path="doctor/patients/:id" element={<PatientDetails />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin" element={<AdminDashboard />} />
                <Route path="admin/departments" element={<DepartmentsManager />} />
                <Route path="admin/doctors" element={<DoctorsManager />} />
                <Route path="admin/appointments" element={<AppointmentManager />} />
                <Route path="admin/patients" element={<PatientsManager />} />
                <Route path="admin/settings" element={<SystemSettings />} />
                <Route path="admin/users" element={<UserManagement />} />
                <Route path="admin/billing/invoices" element={<AdminInvoiceList />} />
                <Route path="admin/billing/generate" element={<InvoiceGenerator />} />
                <Route path="admin/campaigns" element={<CampaignList />} />
                <Route path="admin/campaigns/new" element={<CreateCampaign />} />
                <Route path="admin/campaigns/templates" element={<TemplateManagement />} />
                <Route path="admin/campaigns/:id" element={<CampaignDetails />} />
                <Route path="admin/workflows" element={<WorkflowList />} />
                <Route path="admin/workflows/new" element={<WorkflowBuilder />} />
                <Route path="admin/workflows/:id" element={<WorkflowBuilder />} />
                <Route path="admin/tasks" element={<StaffTaskList />} />
                <Route path="admin/surveys" element={<SurveyManager />} />
                <Route path="admin/whatsapp/templates" element={<WhatsAppTemplateManager />} />
                <Route path="admin/permissions" element={<PermissionManagement />} />
                <Route path="admin/migration" element={<DataMigrationUI />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
                <Route path="receptionist" element={<ReceptionistDashboard />} />
                <Route path="receptionist/queue" element={<QueueManagement />} />
                <Route path="receptionist/register" element={<PatientRegistration />} />
                <Route path="receptionist/patients" element={<PatientSearch />} />
                <Route path="receptionist/patients/:id" element={<PatientDetails />} />
                <Route path="receptionist/prescriptions" element={<PrescriptionList />} />
                <Route path="receptionist/prescriptions/:id/print" element={<PrescriptionPrint />} />
              </Route>

              {/* Nurse Routes - Workflow Monitoring */}
              <Route element={<ProtectedRoute allowedRoles={['nurse', 'admin']} />}>
                <Route path="nurse" element={<NurseMonitoringDashboard />} />
                <Route path="nurse/alerts" element={<NurseMonitoringDashboard />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="admin/surveys" element={<SurveyManager />} />
              </Route>
            </Route>
          </Route>

          {/* Tracking Routes (Public) */}
          <Route path="/track/open" element={<TrackingHandler />} />
          <Route path="/track/click" element={<TrackingHandler />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
