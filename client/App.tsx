import React from 'react';
import { ErpProvider, useErp } from './context/ErpContext';
import { TopNavbar } from './components/shell/TopNavbar';
import { AppTileIcon } from './components/AppSvgIcons';
import { AppsMenuGrid } from './components/shell/AppsMenuGrid';
import { ThemeCustomizerDrawer } from './components/shell/ThemeCustomizerDrawer';
import { FloatingActionDock } from './components/shell/FloatingActionDock';
import { UniversalModuleWorkspace } from './components/views/UniversalModuleWorkspace';
import {
  AdmissionReportWizardView, AiPlaygroundView, AttendanceCheckinWizardView, AttendanceKioskView,
  BiDashboardView, KpiDashboardView, LibraryBarcodeView, OmrSheetGeneratorView, SettingsPanelView,
  StudentMigrationWizardView, TimetableGeneratorView, TimetableReportWizardView, WhatsAppInboxView,
} from './components/special/SpecialWorkspaces';
import { LoginScreen, PublicWebsite } from './components/public/PublicWebsite';
import { StudentParentPortal } from './components/portal/StudentParentPortal';

const AppShell: React.FC = () => {
  const { loading, route, toast, activeCompany, apps, openApp, user } = useErp();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-slate-500">
        Initializing SabiEdu Multi-Campus School ERP...
      </div>
    );
  }

  let content: React.ReactNode = null;
  if (route.area === 'login') {
    content = <LoginScreen />;
  } else if (route.area === 'public') {
    content = <PublicWebsite />;
  } else if (route.area === 'portal' || (route.area === 'apps' && (user?.role === 'student' || user?.role === 'parent'))) {
    content = <StudentParentPortal />;
  } else {
    // Backend ERP Shell (/openeducat/*)
    const showSidebar = activeCompany?.menu_style === 'sidebar';
    let body: React.ReactNode = <AppsMenuGrid />;
    if (route.area === 'module') {
      if (route.action === 'bi_dashboard') body = <BiDashboardView />;
      else if (route.action === 'kpi_dashboard') body = <KpiDashboardView />;
      else if (route.action === 'wizard_timetable') body = <TimetableGeneratorView />;
      else if (route.action === 'wizard_omr_sheet') body = <OmrSheetGeneratorView />;
      else if (route.action === 'wizard_admission_report') body = <AdmissionReportWizardView />;
      else if (route.action === 'wizard_timetable_report') body = <TimetableReportWizardView />;
      else if (route.action === 'wizard_student_migration') body = <StudentMigrationWizardView />;
      else if (route.action === 'wizard_checkin') body = <AttendanceCheckinWizardView />;
      else if (route.action === 'kiosk_attendance') body = <AttendanceKioskView />;
      else if (route.action === 'library_barcode_view') body = <LibraryBarcodeView />;
      else if (route.action === 'whatsapp_inbox') body = <WhatsAppInboxView />;
      else if (route.action === 'ai_playground') body = <AiPlaygroundView mode="playground" />;
      else if (route.action === 'lms_course_generator') body = <AiPlaygroundView mode="lms" />;
      else if (route.action === 'quiz_ai_view') body = <AiPlaygroundView mode="quiz" />;
      else if (route.action === 'lms_summary') body = <BiDashboardView />;
      else if (route.action === 'website_preview') body = <PublicWebsite />;
      else if (route.action === 'settings_panel') body = <SettingsPanelView />;
      else body = <UniversalModuleWorkspace />;
    }

    content = (
      <div className="min-h-screen flex flex-col">
        <TopNavbar />
        <div className="flex-1 flex items-stretch">
          {showSidebar && (
            <aside className="hidden md:block w-52 bg-white border-r border-slate-200 p-2 space-y-0.5 max-h-[calc(100vh-3rem)] overflow-y-auto text-xs">
              {apps.map((a) => (
                <button
                  key={a.id}
                  onClick={() => openApp(a.id)}
                  className={`w-full text-left px-2.5 py-1.5 rounded flex items-center gap-2 ${route.appId === a.id ? 'bg-[var(--oe-surface-pale-blue)] text-[var(--oe-brand-primary)] font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
                >
                  <AppTileIcon id={a.id} color={a.color} size={18} />
                  <span className="truncate">{a.label}</span>
                </button>
              ))}
            </aside>
          )}
          <div className="flex-1 min-w-0">{body}</div>
        </div>
        <ThemeCustomizerDrawer />
        <FloatingActionDock />
      </div>
    );
  }

  return (
    <>
      {content}
      {toast && (
        <div
          className={`fixed bottom-4 right-4 z-50 px-4 py-2.5 rounded-xl shadow-xl text-xs font-semibold text-white max-w-md ${
            toast.type === 'error' ? 'bg-rose-600' : 'bg-slate-900'
          }`}
        >
          {toast.text}
        </div>
      )}
    </>
  );
};

export const App: React.FC = () => (
  <ErpProvider>
    <AppShell />
  </ErpProvider>
);

export default App;
