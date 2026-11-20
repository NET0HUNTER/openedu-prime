import React from 'react';

/**
 * Custom crisp vector app tiles for all 53 modules matching the exact visual language
 * of OpenEduCat (Odoo 19) captured in step_20_shot_1.png & step_20_shot_2.png.
 */
export const AppTileIcon: React.FC<{ id: string; color: string; size?: number }> = ({
  id,
  color,
  size = 44,
}) => {
  switch (id) {
    case 'admissions':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M12 8h20a2 2 0 0 1 2 2v26a4 4 0 0 1-4 4H12V8Z" fill="#F45D78" />
          <path d="M12 36h22a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4Z" fill="#B91C3B" />
          <circle cx="22" cy="18" r="3.5" fill="#FFE4E8" />
          <path d="M16.5 27c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" stroke="#FFE4E8" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'students':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="16" r="7" fill="#38BDF8" />
          <path d="M11 38c0-6.5 5.8-11 13-11s13 4.5 13 11H11Z" fill="#0284C7" />
        </svg>
      );
    case 'sis':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M8 34c0-4 5-7 11-7s11 3 11 7H8Z" fill="#2563EB" />
          <circle cx="19" cy="19" r="5" fill="#60A5FA" />
          <path d="M13 14l6-3 6 3-6 3-6-3Z" fill="#1E3A8A" />
          <circle cx="34" cy="22" r="4" fill="#1E293B" />
          <path d="M27 34c0-3 3.2-5 7-5s7 2 7 5H27Z" fill="#0F172A" />
        </svg>
      );
    case 'lms':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="8" y="10" width="32" height="28" rx="4" fill="#134E5E" />
          <rect x="8" y="10" width="32" height="6" rx="2" fill="#38BDF8" />
          <rect x="15" y="21" width="18" height="11" rx="2" fill="#FFFFFF" />
          <path d="M24 21v11M18 25h3M27 25h3" stroke="#134E5E" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      );
    case 'timetable':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="9" y="11" width="30" height="27" rx="4" fill="#FBBF24" />
          <rect x="9" y="11" width="30" height="7" rx="2" fill="#EA580C" />
          <circle cx="29" cy="29" r="7" fill="#FFFFFF" />
          <path d="M29 25v4l2.5 2" stroke="#EA580C" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'attendance':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="21" cy="17" r="6" fill="#FBBF24" />
          <path d="M10 36c0-5.5 4.8-9 11-9s11 3.5 11 9H10Z" fill="#F59E0B" />
          <circle cx="34" cy="31" r="7" fill="#38BDF8" />
          <path d="M30.5 31l2.2 2.2 4.3-4.3" stroke="#FFFFFF" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'assignments':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="11" y="11" width="18" height="24" rx="3" fill="#1E3A8A" />
          <rect x="19" y="13" width="18" height="24" rx="3" fill="#FB7185" fillOpacity="0.88" />
          <rect x="19" y="13" width="10" height="22" rx="2" fill="#38BDF8" fillOpacity="0.6" />
        </svg>
      );
    case 'exams':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M12 9h20v26a4 4 0 0 1-4 4H12V9Z" fill="#10B981" />
          <path d="M12 35h22a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4Z" fill="#047857" />
          <circle cx="22" cy="21" r="7" fill="#FFFFFF" />
          <path d="M22 17v4l3 2" stroke="#047857" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'gradebook':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="13" y="8" width="24" height="32" rx="4" fill="#38BDF8" />
          <rect x="10" y="13" width="6" height="3" rx="1.5" fill="#0F172A" />
          <rect x="10" y="22" width="6" height="3" rx="1.5" fill="#0F172A" />
          <rect x="10" y="31" width="6" height="3" rx="1.5" fill="#0F172A" />
          <text x="19" y="29" fill="#FFFFFF" fontSize="13" fontWeight="800" fontFamily="sans-serif">A+</text>
        </svg>
      );
    case 'queue_job':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="14" y="10" width="20" height="8" rx="3" fill="#FB7185" />
          <rect x="11" y="18" width="26" height="9" rx="3" fill="#E11D48" />
          <rect x="8" y="27" width="32" height="11" rx="3" fill="#881337" />
        </svg>
      );
    case 'quiz':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M12 10h24L24 24 12 10Z" fill="#FBBF24" />
          <path d="M12 38h24L24 24 12 38Z" fill="#EA580C" />
        </svg>
      );
    case 'thesis':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="12" y="9" width="24" height="30" rx="3" fill="#059669" />
          <rect x="12" y="9" width="5" height="30" rx="1.5" fill="#065F46" />
          <path d="M19 18l7-3 7 3-7 3-7-3Z" fill="#FFFFFF" />
          <path d="M20 28h12M20 32h9" stroke="#D1FAE5" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'omr':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="11" y="9" width="24" height="29" rx="3" fill="#3B82F6" />
          <rect x="11" y="33" width="26" height="5" rx="2.5" fill="#1E3A8A" />
          <circle cx="17" cy="21" r="2.2" fill="#FFFFFF" />
          <circle cx="23" cy="21" r="2.2" fill="#FFFFFF" />
          <circle cx="29" cy="21" r="2.2" fill="#1E3A8A" />
        </svg>
      );
    case 'campus':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="12" y="10" width="14" height="28" rx="2" fill="#10B981" />
          <rect x="26" y="19" width="10" height="19" rx="2" fill="#FBBF24" />
          <rect x="17" y="29" width="4" height="9" fill="#064E3B" />
        </svg>
      );
    case 'transportation':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="11" y="10" width="26" height="26" rx="5" fill="#FBBF24" />
          <rect x="14" y="14" width="20" height="10" rx="2" fill="#2563EB" />
          <circle cx="17" cy="30" r="2.5" fill="#FFFFFF" />
          <circle cx="31" cy="30" r="2.5" fill="#FFFFFF" />
          <rect x="15" y="36" width="4" height="3" rx="1" fill="#334155" />
          <rect x="29" y="36" width="4" height="3" rx="1" fill="#334155" />
        </svg>
      );
    case 'library':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="13" width="7" height="25" rx="1.5" fill="#EF4444" />
          <rect x="19" y="10" width="7" height="28" rx="1.5" fill="#FBBF24" />
          <rect x="28" y="11" width="7" height="27" rx="1.5" fill="#0EA5E9" />
        </svg>
      );
    case 'digital_library':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="9" y="12" width="30" height="24" rx="4" fill="#059669" />
          <path d="M24 12v24" stroke="#A7F3D0" strokeWidth="1.5" />
          <path d="M14 19h6M14 24h6M28 19h6M28 24h6" stroke="#FFFFFF" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
      );
    case 'events':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M11 36L24 12l13 24" stroke="#F43F5E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M16 36l8-15 8 15" stroke="#FBBF24" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'placements':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="11" y="9" width="22" height="30" rx="2" fill="#0EA5E9" />
          <circle cx="24" cy="19" r="5" fill="#0369A1" stroke="#E0F2FE" strokeWidth="2" />
          <path d="M15 29h14M15 33h10" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
        </svg>
      );
    case 'alumni':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M8 20l16-8 16 8-16 8-16-8Z" fill="#22C55E" />
          <path d="M14 24v7c0 3 4.5 5 10 5s10-2 10-5v-7l-10 5-10-5Z" fill="#EAB308" />
          <path d="M36 22v10" stroke="#0284C7" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      );
    case 'fleet':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="14" stroke="#9333EA" strokeWidth="5" />
          <circle cx="24" cy="24" r="4" fill="#9333EA" />
          <path d="M12 21h24M24 24v13" stroke="#9333EA" strokeWidth="3.5" />
        </svg>
      );
    case 'recruitment':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="22" r="11" stroke="#14B8A6" strokeWidth="5" />
          <circle cx="24" cy="20" r="4" fill="#9333EA" />
          <path d="M17 34l10-4" stroke="#9333EA" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'job':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="27" cy="20" r="10" fill="#14B8A6" />
          <circle cx="27" cy="18" r="3.5" fill="#FFFFFF" />
          <path d="M22 26c1-2.5 3-3.5 5-3.5s4 1 5 3.5" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <path d="M19 28l-8 8" stroke="#0284C7" strokeWidth="4" strokeLinecap="round" />
        </svg>
      );
    case 'onboarding':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="19" cy="18" r="7" fill="#2563EB" />
          <circle cx="19" cy="18" r="2.5" fill="#FFFFFF" />
          <path d="M12 35c0-4 5-6 12-6h9c3 0 5 2 5 6H12Z" fill="#0EA5E9" />
          <circle cx="32" cy="22" r="3.5" fill="#10B981" />
        </svg>
      );
    case 'hr':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="17" r="5" fill="#DC2626" />
          <path d="M16 32c0-4 3.5-6 8-6s8 2 8 6H16Z" fill="#B91C1C" />
          <circle cx="13" cy="22" r="3.5" fill="#FBBF24" />
          <path d="M8 32c0-2.5 2.2-4 5-4s5 1.5 5 4H8Z" fill="#EA580C" />
          <circle cx="35" cy="22" r="3.5" fill="#14B8A6" />
          <path d="M30 32c0-2.5 2.2-4 5-4s5 1.5 5 4H30Z" fill="#0D9488" />
        </svg>
      );
    case 'time_off':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M10 26C14 14 28 11 38 19L10 26Z" fill="#FBBF24" />
          <path d="M24 16C31 14 37 18 39 27L24 16Z" fill="#0EA5E9" />
          <path d="M24 22L18 38" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'expenses':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="18" cy="19" r="7" fill="#0EA5E9" />
          <text x="15" y="23" fill="#FFFFFF" fontSize="11" fontWeight="700" fontFamily="sans-serif">$</text>
          <path d="M12 34h24l-3 5H15l-3-5Z" fill="#1E3A8A" />
          <circle cx="32" cy="27" r="4" fill="#0284C7" />
        </svg>
      );
    case 'approvals':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M21 12v14h-7v5h18v-5h-7V12h-4Z" fill="#F59E0B" />
          <circle cx="33" cy="20" r="6" fill="#0EA5E9" />
          <path d="M30 20l2 2 4-4" stroke="#FFFFFF" strokeWidth="2" strokeLinecap="round" />
          <rect x="11" y="34" width="24" height="4" rx="2" fill="#1E3A8A" />
        </svg>
      );
    case 'sales':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="11" y="24" width="8" height="14" rx="2" fill="#9D174D" />
          <rect x="20" y="18" width="8" height="20" rx="2" fill="#F97316" />
          <rect x="29" y="12" width="8" height="26" rx="2" fill="#FBBF24" />
        </svg>
      );
    case 'accounting':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M12 9h20v26a4 4 0 0 1-4 4H12V9Z" fill="#0EA5E9" />
          <path d="M12 35h22a4 4 0 0 1-4 4H16a4 4 0 0 1-4-4Z" fill="#1E3A8A" />
          <text x="18" y="26" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="sans-serif">$</text>
        </svg>
      );
    case 'purchase':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="12" width="28" height="24" rx="3" fill="#7E22CE" />
          <rect x="10" y="17" width="28" height="6" fill="#2DD4BF" />
        </svg>
      );
    case 'inventory':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M24 9l13 7v16l-13 7-13-7V16l13-7Z" fill="#F59E0B" />
          <path d="M24 9l13 7-13 7-13-7 13-7Z" fill="#FBBF24" />
          <path d="M24 23v16l13-7V16l-13 7Z" fill="#9D174D" />
        </svg>
      );
    case 'crm':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M10 21l7-7 7 7-7 7-7-7Z" fill="#0EA5E9" />
          <path d="M24 21l7-7 7 7-7 7-7-7Z" fill="#9333EA" />
          <path d="M17 28l7-7 7 7-7 7-7-7Z" fill="#14B8A6" />
        </svg>
      );
    case 'website':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="14" fill="#0284C7" />
          <path d="M11 22c4-3 9-3 13 0s9 3 13 0" stroke="#FFFFFF" strokeWidth="4" strokeLinecap="round" />
          <path d="M11 27c4-2 9-2 13 0s9 2 13 0" stroke="#2DD4BF" strokeWidth="3" strokeLinecap="round" />
        </svg>
      );
    case 'email_marketing':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M10 25l28-14-9 26-8-7-11-5Z" fill="#3B82F6" />
          <path d="M21 30l17-19-9 26-8-7Z" fill="#9D174D" />
        </svg>
      );
    case 'whatsapp':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="9" y="10" width="30" height="28" rx="4" fill="#16A34A" />
          <path d="M16 18h16v10H22l-6 4V18Z" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round" />
        </svg>
      );
    case 'livechat':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="18" cy="18" r="5" fill="#F43F5E" />
          <path d="M11 33c0-4 3-7 7-7s7 3 7 7H11Z" fill="#E11D48" />
          <circle cx="30" cy="18" r="5" fill="#9D174D" />
          <path d="M23 33c0-4 3-7 7-7s7 3 7 7H23Z" fill="#881337" />
        </svg>
      );
    case 'surveys':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="14" cy="16" r="4" fill="#0EA5E9" />
          <rect x="21" y="13" width="16" height="6" rx="2" fill="#0EA5E9" />
          <circle cx="14" cy="30" r="4" fill="#EF4444" />
          <rect x="21" y="27" width="16" height="6" rx="2" fill="#EF4444" />
        </svg>
      );
    case 'contacts':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="11" y="10" width="24" height="28" rx="3" fill="#0D9488" />
          <rect x="15" y="13" width="22" height="25" rx="3" fill="#14B8A6" fillOpacity="0.85" />
          <circle cx="24" cy="21" r="4" fill="#FFFFFF" />
          <path d="M18 31c0-3 2.7-5 6-5s6 2 6 5H18Z" fill="#FFFFFF" />
        </svg>
      );
    case 'discuss':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M12 24c0-7 5.5-12 12-12s12 5 12 12-5.5 12-12 12H12V24Z" fill="#F97316" />
          <path d="M12 24c0-7 5.5-12 12-12 3 0 5.5 1 7.5 2.5C20 17 15 24 12 32V24Z" fill="#FBBF24" />
        </svg>
      );
    case 'notice_board':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M16 16l8-6 8 6" stroke="#1F2937" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="24" cy="10" r="2.5" fill="#F59E0B" />
          <rect x="10" y="16" width="28" height="21" rx="3" fill="#059669" />
          <path d="M16 23h16M16 29h11" stroke="#A7F3D0" strokeWidth="2.2" strokeLinecap="round" />
        </svg>
      );
    case 'dashboards':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="10" width="12" height="10" rx="2" fill="#7C3AED" />
          <rect x="26" y="10" width="12" height="10" rx="2" fill="#EF4444" />
          <rect x="10" y="24" width="12" height="14" rx="2" fill="#0EA5E9" />
          <rect x="26" y="24" width="12" height="14" rx="2" fill="#10B981" />
        </svg>
      );
    case 'kpi_dashboard':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="28" width="6" height="10" rx="1.5" fill="#38BDF8" />
          <rect x="19" y="21" width="6" height="17" rx="1.5" fill="#10B981" />
          <rect x="28" y="15" width="6" height="23" rx="1.5" fill="#F59E0B" />
          <rect x="37" y="10" width="5" height="28" rx="1.5" fill="#EC4899" />
        </svg>
      );
    case 'calendar':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="9" y="10" width="30" height="28" rx="4" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="2" />
          <text x="14" y="31" fill="#DC2626" fontSize="17" fontWeight="800" fontFamily="sans-serif">31</text>
        </svg>
      );
    case 'documents':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="11" y="10" width="18" height="24" rx="2" fill="#0EA5E9" />
          <rect x="19" y="14" width="18" height="24" rx="2" fill="#FBBF24" />
          <rect x="15" y="12" width="18" height="24" rx="2" fill="#FB7185" fillOpacity="0.85" />
        </svg>
      );
    case 'esign':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="13" width="28" height="22" rx="3" fill="#0EA5E9" />
          <path d="M14 28c3-6 5 2 8-4s4 3 7-2" stroke="#1E3A8A" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M31 11v18" stroke="#1E3A8A" strokeWidth="3.5" strokeLinecap="round" />
        </svg>
      );
    case 'automated_marketing':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M10 17h12l6 7h10" stroke="#0EA5E9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 31h12l6-7" stroke="#9D174D" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'multi_campus':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="20" width="8" height="16" rx="1.5" fill="#F43F5E" />
          <rect x="20" y="12" width="8" height="24" rx="1.5" fill="#0EA5E9" />
          <rect x="30" y="17" width="8" height="19" rx="1.5" fill="#FBBF24" />
        </svg>
      );
    case 'spreadsheets':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="12" y="10" width="24" height="28" rx="3" fill="#0284C7" />
          <rect x="16" y="15" width="16" height="14" rx="1.5" fill="#E0F2FE" />
          <path d="M16 21h16M23 15v14" stroke="#0284C7" strokeWidth="1.8" />
        </svg>
      );
    case 'apps':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M24 10a14 14 0 0 0-14 14h14V10Z" fill="#10B981" />
          <path d="M24 10a14 14 0 0 1 14 14H24V10Z" fill="#E11D48" />
          <path d="M10 24a14 14 0 0 0 14 14V24H10Z" fill="#1E3A8A" />
          <path d="M24 24v14a14 14 0 0 0 14-14H24Z" fill="#0EA5E9" />
        </svg>
      );
    case 'settings':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <path d="M24 10l12 7v14l-12 7-12-7V17l12-7Z" fill="#F59E0B" />
          <path d="M24 10l12 7-12 7-12-7 12-7Z" fill="#9D174D" />
          <circle cx="24" cy="24" r="5" fill="#FFFFFF" />
        </svg>
      );
    case 'aio':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="14" fill="#F59E0B" />
          <text x="16" y="29" fill="#FFFFFF" fontSize="14" fontWeight="800" fontFamily="sans-serif">AI</text>
        </svg>
      );
    case 'helpdesk':
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <circle cx="24" cy="24" r="13" stroke="#EF4444" strokeWidth="7" />
          <circle cx="24" cy="24" r="6" fill="#FFFFFF" />
        </svg>
      );
    default:
      return (
        <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
          <rect x="10" y="10" width="28" height="28" rx="6" fill={color} />
        </svg>
      );
  }
};
