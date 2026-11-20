#!/usr/bin/env python3
"""
Generate the OpenEduCat Multi-Campus School ERP Master Excel UAT Workbook.
Output: docs/OpenEduCat_ERP_UAT_Master_Scripts.xlsx

Reads live exported TypeScript metadata (53 Apps, 408 Models, 18 Public Routes,
35 Portal Cards, MODEL_REPORTS) via Node/dist build so Sheet 11 stays 100%
synchronized with the application codebase.
"""

from __future__ import annotations

import json
import os
import subprocess
import sys
from pathlib import Path
from typing import Any

from openpyxl import Workbook
from openpyxl.formatting.rule import CellIsRule
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.datavalidation import DataValidation


ROOT_DIR = Path(__file__).resolve().parent.parent
META_DUMP_PATH = ROOT_DIR / "docs" / ".erp_meta_cache.json"
OUT_XLSX_PATH = ROOT_DIR / "docs" / "OpenEduCat_ERP_UAT_Master_Scripts.xlsx"

# Palette aligned with Oshwal Academy / OpenEduCat Brand Tokens
NAVY = "1E3F7C"
DARK_NAVY = "142B57"
CRIMSON = "EC1C24"
GOLD = "F4CB00"
LIGHT_BLUE = "E8EFFB"
PALE_BLUE = "F3F6FC"
CREAM = "FCF5EA"
WHITE = "FFFFFF"
SLATE_BORDER = "CBD5E1"
SLATE_TEXT = "1E293B"
MUTED_TEXT = "475569"
PASS_BG = "DCFCE7"
PASS_FG = "166534"
FAIL_BG = "FEE2E2"
FAIL_FG = "991B1B"
BLOCKED_BG = "FEF3C7"
BLOCKED_FG = "92400E"
NOTRUN_BG = "F1F5F9"
NOTRUN_FG = "475569"

THIN_SIDE = Side(border_style="thin", color=SLATE_BORDER)
CELL_BORDER = Border(left=THIN_SIDE, right=THIN_SIDE, top=THIN_SIDE, bottom=THIN_SIDE)
HEADER_BORDER = Border(
    left=Side(border_style="thin", color=DARK_NAVY),
    right=Side(border_style="thin", color=DARK_NAVY),
    top=Side(border_style="thin", color=DARK_NAVY),
    bottom=Side(border_style="medium", color=GOLD),
)

UAT_HEADERS = [
    "Test ID",
    "Module / App",
    "Role Required",
    "Feature / Action Title",
    "Preconditions & Exact URL / Seed Data",
    "Exact Step-by-Step User Instructions",
    "Expected UI & Backend Result",
    "Under-the-Hood Mechanics (Explain From Sleep)",
    "Status",
    "Tester Notes / Evidence",
]

UAT_COL_WIDTHS = [12, 22, 16, 28, 30, 56, 44, 52, 14, 28]


def export_live_metadata() -> dict[str, Any]:
    """Run Node against compiled dist/shared/meta/index.js to extract exact live metadata."""
    dist_meta = ROOT_DIR / "dist" / "shared" / "meta" / "index.js"
    if dist_meta.exists():
        js_code = (
            "import { APPS, ALL_MODELS, PUBLIC_ROUTES, PORTAL_CARDS, MODEL_REPORTS } from './dist/shared/meta/index.js';"
            "console.log(JSON.stringify({"
            "apps: APPS.map(a => ({ id: a.id, label: a.label, category: a.category, roles: a.roles, defaultAction: a.defaultAction, defaultModel: a.defaultModel, menus: a.menus })),"
            "modelsCount: ALL_MODELS.length,"
            "models: ALL_MODELS.map(m => ({ name: m.name, string: m.string, views: m.views, stageField: m.stageField, buttons: m.buttons.map(b => b.name + ' (' + b.string + ')'), smart: m.smart.map(s => s.string + ' -> ' + s.model), tabs: m.form.tabs.map(t => t.title), ribbon: m.ribbon ? (m.ribbon.field + '=' + m.ribbon.value + ':' + m.ribbon.label) : '' })),"
            "publicRoutes: PUBLIC_ROUTES,"
            "portalCards: PORTAL_CARDS,"
            "reports: MODEL_REPORTS"
            "}));"
        )
        res = subprocess.run(
            ["node", "--input-type=module", "-e", js_code],
            cwd=str(ROOT_DIR),
            capture_output=True,
            text=True,
            encoding="utf-8",
            check=True,
        )
        data = json.loads(res.stdout)
        META_DUMP_PATH.parent.mkdir(parents=True, exist_ok=True)
        META_DUMP_PATH.write_text(json.dumps(data, indent=2), encoding="utf-8")
        return data
    fallback_scratch = Path(
        r"C:\Users\Yankees\.gemini\antigravity\brain\521435b1-31df-4aba-ace7-b9b271c1d470\scratch\erp_meta_dump.json"
    )
    if META_DUMP_PATH.exists():
        return json.loads(META_DUMP_PATH.read_text(encoding="utf-8"))
    if fallback_scratch.exists():
        return json.loads(fallback_scratch.read_text(encoding="utf-8"))
    raise FileNotFoundError("Compiled dist/shared/meta/index.js not found. Run `npm run build` first.")


def style_banner(ws, title: str, subtitle: str, num_cols: int) -> None:
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=num_cols)
    c1 = ws.cell(row=1, column=1, value=title)
    c1.font = Font(name="Calibri", size=15, bold=True, color=WHITE)
    c1.fill = PatternFill("solid", fgColor=NAVY)
    c1.alignment = Alignment(horizontal="left", vertical="center", indent=1)
    ws.row_dimensions[1].height = 30

    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=num_cols)
    c2 = ws.cell(row=2, column=1, value=subtitle)
    c2.font = Font(name="Calibri", size=10, italic=True, color=SLATE_TEXT)
    c2.fill = PatternFill("solid", fgColor=LIGHT_BLUE)
    c2.alignment = Alignment(horizontal="left", vertical="center", indent=1, wrap_text=True)
    ws.row_dimensions[2].height = 22


def style_table_header(ws, row_idx: int, headers: list[str]) -> None:
    ws.row_dimensions[row_idx].height = 26
    for col_idx, h in enumerate(headers, 1):
        cell = ws.cell(row=row_idx, column=col_idx, value=h)
        cell.font = Font(name="Calibri", size=10.5, bold=True, color=WHITE)
        cell.fill = PatternFill("solid", fgColor=DARK_NAVY)
        cell.alignment = Alignment(horizontal="center", vertical="center", wrap_text=True)
        cell.border = HEADER_BORDER


def estimate_row_height(row_values: list[Any], col_widths: list[int]) -> float:
    max_lines = 1
    for val, w in zip(row_values, col_widths):
        text = str(val or "")
        effective_w = max(10, w - 3)
        lines = 0
        for para in text.split("\n"):
            lines += max(1, (len(para) + effective_w - 1) // effective_w)
        if lines > max_lines:
            max_lines = lines
    return min(260.0, max(24.0, max_lines * 14.5 + 8.0))


def add_status_validation_and_cf(ws, status_col_letter: str, start_row: int, end_row: int) -> None:
    dv = DataValidation(type="list", formula1='"Not Run,Pass,Fail,Blocked"', allow_blank=False)
    dv.promptTitle = "UAT Execution Status"
    dv.prompt = "Select Not Run, Pass, Fail, or Blocked"
    ws.add_data_validation(dv)
    cell_range = f"{status_col_letter}{start_row}:{status_col_letter}{end_row}"
    dv.add(cell_range)

    rules = [
        ('"Pass"', PASS_BG, PASS_FG),
        ('"Fail"', FAIL_BG, FAIL_FG),
        ('"Blocked"', BLOCKED_BG, BLOCKED_FG),
        ('"Not Run"', NOTRUN_BG, NOTRUN_FG),
    ]
    for formula_val, bg, fg in rules:
        ws.conditional_formatting.add(
            cell_range,
            CellIsRule(
                operator="equal",
                formula=[formula_val],
                fill=PatternFill("solid", fgColor=bg),
                font=Font(name="Calibri", size=10, bold=True, color=fg),
            ),
        )


def write_uat_sheet(
    wb: Workbook,
    sheet_name: str,
    title: str,
    subtitle: str,
    rows: list[tuple[str, str, str, str, str, str, str, str]],
) -> tuple[int, int]:
    """Write a standardized 10-column UAT script sheet and return (first_data_row, last_data_row)."""
    ws = wb.create_sheet(title=sheet_name)
    ws.views.sheetView[0].showGridLines = True
    style_banner(ws, title, subtitle, len(UAT_HEADERS))
    style_table_header(ws, 4, UAT_HEADERS)

    start_row = 5
    for idx, r in enumerate(rows):
        row_num = start_row + idx
        full_vals = list(r) + ["Not Run", ""]
        bg = WHITE if idx % 2 == 0 else PALE_BLUE
        for col_idx, val in enumerate(full_vals, 1):
            c = ws.cell(row=row_num, column=col_idx, value=val)
            c.font = Font(
                name="Calibri",
                size=10,
                bold=(col_idx in (1, 4)),
                color=NAVY if col_idx == 1 else SLATE_TEXT,
            )
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
            horiz = "center" if col_idx in (1, 3, 9) else "left"
            c.alignment = Alignment(horizontal=horiz, vertical="top", wrap_text=True)
        ws.row_dimensions[row_num].height = estimate_row_height(full_vals, UAT_COL_WIDTHS)

    end_row = start_row + len(rows) - 1
    for col_idx, width in enumerate(UAT_COL_WIDTHS, 1):
        ws.column_dimensions[get_column_letter(col_idx)].width = width

    ws.freeze_panes = "A5"
    ws.auto_filter.ref = f"A4:J{end_row}"
    add_status_validation_and_cf(ws, "I", start_row, end_row)
    return start_row, end_row


# ==============================================================================
# SHEET CONTENT BUILDERS
# ==============================================================================


def build_public_and_shell_cases() -> list[tuple[str, str, str, str, str, str, str, str]]:
    return [
        (
            "PUB-01", "Website / Home", "Public Visitor", "Inspect Public Homepage, Top Bar, 5 Campus Cards & Public Sub-Nav (+ Overflow)",
            "URL: http://localhost:5175/ and any sub-page (e.g. /courses-offered)\nUser: Logged out / Anonymous Visitor",
            "1. Open http://localhost:5175/.\n2. Inspect top header ('← Apps Menu', 'Contact Us', 'Apply Online (7-Step Intake)', 'Sign In / Demo Roles'), 4 stat cards ('30+ IGCSE & A-Level Subjects', '180+ Teaching Faculty', '45% Top World Universities', '6:1 Student-Teacher Ratio') and 'Our Campuses & Educational Divisions' cards.\n3. Navigate to a public sub-route (e.g. 'Apply Online (7-Step Intake)' -> /courses-offered) to inspect the secondary public navbar ('Home', 'Shop', 'Book Now', 'Library', 'Exams', 'Events', 'Forum', '+') plus Cart icon, Search icon, and 'Sign in'.\n4. Click '+' in navbar to verify all 11 overflow routes ('Blog', 'Admission Courses', 'Admission Programs', 'Alumni Jobs', 'Campus Jobs', 'Careers / Jobs', 'Contact us', 'Alumni', 'LMS Courses', 'Placements', 'Shopping Cart').",
            "Homepage renders cleanly with 5 campus cards (Nursery, Primary, Junior High, Senior High, Mombasa); secondary public navbar + '+' shows all 11 overflow links.",
            "PublicWebsite.tsx reads companies and PUBLIC_ROUTES (18 routes) from ErpContext without requiring authentication."
        ),
        (
            "PUB-02", "Website / Admission Courses", "Public Visitor", "Browse /courses-offered & Submit Public Online Admission Form",
            "URL: http://localhost:5175/courses-offered (via 'Apply Online (7-Step Intake)' or '+' -> 'Admission Courses')",
            "1. Click 'Apply Online (7-Step Intake)' on homepage.\n2. Type 'Year 10' into 'Search' box.\n3. Click 'Apply' on 'Year 10 — IGCSE (KS4)' to open 'Online Admission Form — Year 10 — IGCSE (KS4)'.\n4. Fill exact inputs: 'First Name *', 'Last Name *', 'Parent Email *', 'Phone (+254...) *', Birth Date (`YYYY-MM-DD`), Citizenship dropdown ('Kenyan Citizen' or 'Non-Kenyan (Pupil\\'s Pass Required)'), and 'Previous School / Result' (note: Course is bound by the card, no separate Campus/Course input inside form).\n5. Click 'Submit Application'.",
            "Displays confirmation card 'Application Received: AD0006' and creates op.admission in stage 'Online Admission' with Register, Year Group (Course) & Fees pre-linked.",
            "Form posts to POST /api/v1/public/apply, finds matching op.admission.register for the selected course_id, and inserts op.admission with state='online'."
        ),
        (
            "PUB-03", "Website / Programs & Library", "Public Visitor", "Browse Academic Programs (/program-offered) & Digital Library (/digital-library)",
            "URLs: /program-offered and /digital-library",
            "1. Click '+' -> 'Admission Programs' -> review 5 program cards (EYFS, CIE Primary, IGCSE, AS/A-Level IAL, BTEC Level 3).\n2. Click 'Library' in header -> inspect digital eBook & revision packs with authors & editions.",
            "Program and Digital Library cards load cleanly from op.program and op.digital.library.material.",
            "PublicWebsite executes callKw('op.program','search_read') and callKw('op.digital.library.material','search_read')."
        ),
        (
            "PUB-04", "Website / Shop & Cart", "Public Visitor", "Add Uniforms/Books on /shop & Checkout Order on /shop/cart",
            "URLs: http://localhost:5175/shop -> /shop/cart",
            "1. Click 'Shop' in header.\n2. Add items to cart, then click the Cart icon (or '+' -> 'Shopping Cart').\n3. Verify itemized quantities and 'Order Total'.\n4. Click 'Confirm Order & Generate Invoice'.",
            "Cart clears, toast 'Order SO/... confirmed!' appears, and a confirmed sale.order ('Sales Order') is persisted in Admin -> Sales -> Orders.",
            "Checkout posts callKw('sale.order', 'web_save', { vals: { partner_id: 1, amount_total, order_summary, state: 'sale' } })."
        ),
        (
            "PUB-05", "Website / Book Now", "Public Visitor", "Book Online Admissions / Consultation Appointment (/booking)",
            "URL: http://localhost:5175/booking",
            "1. Click 'Book Now' in header.\n2. Select an appointment type card on the left.\n3. In 'Select Date & Attendee Details', fill 'Parent / Visitor Full Name *', 'Email Address *', and Date/Time picker.\n4. Click 'Confirm Booking'.",
            "Toast 'Appointment confirmed on Campus Calendar!' displays and calendar.event record is saved.",
            "Booking writes to calendar.event via callKw('calendar.event', 'web_save') with location='Campus Meeting / Google Meet'."
        ),
        (
            "PUB-06", "Website / Events, Forum & Blog", "Public Visitor", "View /event & /blog, and Post a Question on /forum",
            "URLs: /event, /forum, /blog",
            "1. Click 'Events' -> review event cards.\n2. Click 'Forum' -> type question into 'Ask a question about IGCSE choices, transport, or clubs...' -> click 'Post Question'.\n3. Click '+' -> 'Blog' -> review campus news.",
            "Forum post appears immediately at top of /forum with toast 'Forum topic posted!'; Events and Blog render cleanly.",
            "Forum executes callKw('website.page', 'web_save', { vals: { page_type: 'forum', ... } })."
        ),
        (
            "PUB-07", "Website / Contact & Careers", "Public Visitor", "Submit Contact Inquiry (/contactus) & Faculty Application with CV (/jobs)",
            "URLs: /contactus and /jobs",
            "1. Click 'Contact Us' -> fill 'Parent / Guardian Name *', 'Email *', 'Phone (+254...) *', 'Subject', and 'Questions about Nursery...' -> click 'Send Inquiry'.\n2. Click '+' -> 'Careers / Jobs' -> select position ('Apply / Upload CV' or select dropdown) -> fill 'Full Name *', 'Email *', 'Phone (+254...) *', click 'Upload CV / Resume (PDF or DOCX) *', fill notes -> click 'Submit Application'.",
            "Contact Us shows 'Inquiry received!' and creates crm.lead; Careers shows 'HR Application & CV submitted!' and creates hr.applicant.",
            "PublicWebsite writes directly to crm.lead and hr.applicant via web_save."
        ),
        (
            "PUB-08", "Website / Alumni & Placements", "Public Visitor", "Inspect /alumni, /website/activity/announcement, /alumni/job/card & /campus/jobs",
            "URLs: /alumni, /website/activity/announcement, /alumni/job/card, /campus/jobs",
            "1. Visit '+' -> 'Alumni' and '+' -> 'Placements'.\n2. Log in and test '+' -> 'Alumni Jobs' & '+' -> 'Campus Jobs' -> click 'Apply Now' on a job post.",
            "Listings render cleanly and 'Apply Now' creates op.job.applicant with toast 'Application submitted!'.",
            "Applies via callKw('op.job.applicant', 'web_save')."
        ),
        (
            "UI-01", "UI Shell / TopNavbar", "Admin", "Verify Responsive TopNavbar (More ▾ Overflow) & App Switcher",
            "URL: /web/login -> click 'Admin' -> /openeducat/apps_menu",
            "1. Inspect Apps Menu (/openeducat/apps_menu): verify all 53 app tiles render with top-right systray badges ('19', '2', 'View Editor', 'Theme Customizer', 'OERB-HQ', avatar 'O'; no search box on apps grid) and click 'Accounting'.\n2. Verify single 46px TopNavbar displays 'Dashboard', 'Customers', 'Vendors', etc. plus 'More ▾' with clean horizontal spacing before Chat/Clock/Studio/Palette/Company icons.\n3. Open 'More ▾' to confirm hidden groups render without right-edge clipping.\n4. Click top-left App Switcher button (9-dot grid) to return to all 53 apps.",
            "TopNavbar stays 1 row tall with zero horizontal icon collisions at 1280px and narrower widths; App Switcher always returns to /openeducat/apps_menu.",
            "TopNavbar.tsx uses ResizeObserver to adjust maxInlineGroups (1–6) and right-aligns 'More ▾' on narrow viewports."
        ),
        (
            "UI-02", "UI Shell / Multi-Campus", "Admin", "Switch Active Campus via Company Selector (X-Company-Ids Isolation)",
            "URL: /openeducat/students/op.student",
            "1. Open Students and note total records.\n2. Click 'OERB-HQ' company button in top-right -> toggle ONLY 'Oshwal Academy Nairobi — Junior High'.\n3. Verify Students list filters immediately to Junior High records.\n4. Click 'Select All' in company menu to restore all 6 entities.",
            "Record counts and KPIs re-query immediately per checked campus.",
            "ErpContext sets X-Company-Ids header on api.ts requests; server/store.ts searchRead applies company_id filtering."
        ),
        (
            "UI-03", "UI Shell / Systray & Theme", "Admin", "Test Systray Messages, Activities Popover, Theme Customizer & View Editor",
            "URL: Any backend app",
            "1. Click Messages bubble icon in top-right -> switch All/Chats/Channels tabs.\n2. Click Clock (Activities) icon -> inspect grouped Late/Today/Future counters.\n3. Click Palette (Theme Customizer) icon -> toggle Dark Mode and Chatter Position (Sided vs Bottom) -> Save.\n4. Click Wrench (View Editor / Studio) icon -> inspect Studio sub-bar (UNDO, REDO, Reports, Automations, Access Control, Close).",
            "Popovers show live messages/activities; Theme Customizer updates CSS tokens & chatter layout live; View Editor toggles sub-bar cleanly.",
            "TopNavbar loads mail.message/discuss.channel/mail.activity; ErpContext applyThemeCss updates :root variables from res.company."
        ),
        (
            "UI-04", "UI Shell / ControlPanel", "Admin", "Use Search Input, Filters (Archived & Custom Filter...), Group By & Favorites",
            "URL: /openeducat/admissions/op.admission",
            "1. Type 'Aarav' in Search box -> press Enter -> clear facet.\n2. Click Search dropdown chevron ('Toggle Filters, Group By & Favorites').\n3. Under Column 1 'Filters': click 'Archived', verify 'Archived' facet appears -> clear it -> open dropdown again -> expand 'Custom Filter...', select Field & Value -> Apply.\n4. Under Column 2 'Group By': pick Stage or Course.\n5. Under Column 3 'Favorites': click 'Save current search ▼'.",
            "Records filter/group live without reload and Favorite search persists as a quick toggle.",
            "ControlPanel.tsx combines search, quickFilter domain, customFilter, groupBy (read_group), and saved favorites."
        ),
        (
            "UI-05", "UI Shell / Views & Columns", "Admin", "Switch Views (Kanban, List, Calendar, Pivot, Graph) & List Column Visibility",
            "URL: /openeducat/timetable/op.session",
            "1. Click Calendar, Kanban, List, Pivot, and Graph view icons in top-right of ControlPanel.\n2. On ListView, click the double-arrow button ('Toggle columns') at the far right of the table header row -> uncheck/re-check a column (e.g. 'Timing').",
            "All 5 view modes render valid data cleanly; ListView hides/restores unchecked columns instantly.",
            "UniversalModuleWorkspace switches ViewType via ?view=; ListView tracks hiddenCols Set."
        ),
        (
            "UI-06", "UI Shell / Export & Print", "Admin", "Export Data (CSV BOM & Binary XLSX) and Form Print Reports",
            "URL: /openeducat/sis/op.student?view=list",
            "1. Check 1+ student row checkboxes -> confirm '1 selected ×' and 'Actions' button appear in center toolbar -> click 'Actions' -> click 'Export' (on selected rows, menu shows Export, Duplicate, Archive, Unarchive, Delete; on Form view Actions cog it is labeled 'Export Data').\n2. Select 'CSV' format & fields -> Export (downloads .csv); repeat selecting 'XLSX' (downloads .xlsx).\n3. Open a Student form -> click Actions gear cog (title='Actions') -> click 'Student ID Card' or 'Course Enrollment' under 'Print Reports'.",
            "Downloads genuine UTF-8 BOM CSV (/api/v1/export/csv), binary OOXML XLSX (/api/v1/export/xlsx), and QWeb PDF/HTML reports with barcode.",
            "ExportRecordsDialog calls /api/v1/export/csv & /xlsx; ControlPanel Print Reports open MODEL_REPORTS QWeb endpoints."
        ),
        (
            "UI-07", "UI Shell / Form & Chatter", "Admin", "Pre-Save Inline One2Many (+ Add a line), Pager (< >), Duplicate, Archive & Chatter",
            "URL: /openeducat/accounting/account.move",
            "1. Click 'New' -> on 'Invoice Lines' tab click '+ Add a line' -> enter Product/Description, Qty=2, Price=5000 -> click 'Add'.\n2. Click 'Save' -> verify Invoice saves with Total=10,000.\n3. Use '<' / '>' pager arrows to switch records; test Actions cog -> 'Duplicate' / 'Archive'.\n4. In right Chatter: click 'Send message', type message + click Smile emoji (👍) + Paperclip attach + Send; click 'Log note'; click 'Activities' to schedule To-Do -> 'Mark Done'; use Chatter Search & Maximize icons.",
            "Inline child lines stage pre-save and persist atomically on Save; Pager & Duplicate work; Chatter posts mail.message & completes mail.activity.",
            "store.create/write handles inline one2many arrays; FormView manages inlineDrafts and chatter mail.message/mail.activity RPCs."
        ),
    ]


def build_admin_cases() -> list[tuple[str, str, str, str, str, str, str, str]]:
    return [
        # --- ACADEMIC CORE & STUDENTS ---
        ("ADM-01", "01. Admissions", "Admin", "Admission Register Lifecycle & Configure Course Fees Lines",
         "App: Admissions -> Admission Registers",
         "1. Open Admissions -> Admission Registers -> click New (or open an existing Register).\n2. Fill Name='2027 IGCSE Intake', Academic Year*='2026-2027 Academic Year', Start date*='2027-01-05', End date='2027-03-31', Year Group='Year 10 — IGCSE (KS4)', Course Fees='345000', Minimum Age=14 (note: only 'Academic Year*' & 'Start date*' have '*').\n3. Click notebook tab 'Configure Course Fees' -> inspect course fee lines table (columns: Course, Course Fees, Fees Product, Registration Fees, Register Product) -> click '+ Add a line' -> pick Course & enter Course Fees -> click Add -> click Save.\n4. Click 'Confirm' -> 'Start Admission' -> 'Done' (or 'Reset to Draft' / 'Cancel').",
         "Register moves across statusbar stages (Draft -> Confirm -> Admission Process -> Done); 'Configure Course Fees' tab persists itemized course fee lines; 'Applications' smart button counts linked op.admission rows.",
         "op.admission.register stages control public intake availability; op.admission.fees.line drives course-specific tuition rates on application onchange."),
        ("ADM-02", "01. Admissions", "Admin", "Application OnChange, Stage Progression, Smart Buttons & Enrollment",
         "App: Admissions -> Admissions -> Applications (Form breadcrumb: 'Registration')",
         "1. Click New -> fill Person Header placeholders 'Full Name *'='Kofi Mensah', 'Email'='kofi@example.com', 'Phone'='+254712345678'.\n2. Inspect all 4 tabs: 'Admission Detail', 'Educational Detail', 'Personal Detail', 'Extra Information' (only Full Name * shows '*'). On 'Admission Detail', select Register='Year 10 IGCSE...' and confirm Year Group, Fees & Company auto-populate via onchange; enter Application number='APP/2027/099'.\n3. On 'Personal Detail' tab: enter Birth date='2012-05-14', Citizenship='Kenyan Citizen'.\n4. Click Save -> Draft shows 'Submit'/'Cancel' -> click 'Submit' -> 'Confirm' -> Confirmed shows 'Send for Signature', 'Enroll', 'Reject', 'Cancel' -> click 'Enroll'.\n5. Click 'Similar Admissions' smart button at top-right.",
         "Onchange pre-fills Year Group, Fees & Company; Enroll sets stage Done and auto-creates op.student + posted fee account.move invoice; 'Similar Admissions' drills to matching applicant list.",
         "FormView calls callKw('op.admission','onchange'); server/methods.ts admission enroll provisions student + invoice atomically and store.hydrate computes _smart_counts domains."),
        ("ADM-03", "01. Admissions", "Admin", "Admissions Analysis PDF Report Wizard & Course Change Requests",
         "App: Admissions -> Reporting -> Admission Report & Orders -> Course Change Requests",
         "1. Open Admissions -> Reporting -> Admission Report -> verify Course (optional) & Status filter -> click 'Download PDF Report'.\n2. Open Admissions -> Orders -> Course Change Requests -> click New -> fill header Name*='Year 10 Pathway Switch', Student*='Aarav R. Shah', Current Course*, Requested Course*, Reason*='Switch to Triple Science' -> Save -> click 'Fees Payment' / 'Approve'.",
         "Admission Report wizard downloads PDF summary table; Course Change Request persists and advances stage cleanly.",
         "wizard_admission_report calls GET /report/pdf/admission_analysis; op.student.course.change.req updates student pathway metadata cleanly."),
        ("ADM-04", "02. Students", "Admin", "Student Profile (All 7 Tabs), Photo Upload, Smart Buttons & Leave Requests",
         "App: Students -> Students -> All Students & Attendance -> Student Leave Request",
         "1. Open Students -> All Students -> open Aarav R. Shah -> verify Person Header ('Full Name *', 'Email', 'Phone'), required field 'Gender*' & photo upload (no form header action buttons).\n2. Click through all 7 tabs: 'Other Information', 'Achievement', 'Skills', 'Alumni Details', 'Face Recognition', 'Compliance & Pass', 'Parents & Contacts'.\n3. Click Smart Buttons at top ('Admission', 'Invoiced', 'Fees Plan Details', 'Assignment', 'Attendance', 'Activity', 'More' -> 'GradeBook', 'Placements', 'Job Post', 'Discipline', 'Media', 'Health', 'Parents', 'Leads').\n4. Open Students -> Attendance -> Student Leave Request -> click New -> fill header Student*='Aarav R. Shah', Leave type*, Start date*, End date* -> Save -> click 'Confirm' -> 'Validate' -> 'Approve'.",
         "All 7 student tabs render their fields/inline tables; all 14 smart buttons drill down accurately; student.leave.request transitions Draft -> Confirm -> Validate -> Approve.",
         "FormView deduplicates tabs and supports FileReader avatar upload; smart buttons use matched domain objects from store.hydrate."),
        ("ADM-05", "02. Students", "Admin", "Student Migration Wizard, Progression & 90-Day Withdrawal Caution Refund",
         "App: Students -> More ▾ -> General -> Migration Wizard / Withdrawal Requests & SIS -> Student Progression",
         "1. Open Students -> More ▾ -> General -> Migration Wizard (`student_migration_wizard`) -> choose From Course / To Course -> click 'Migrate & Promote Student'.\n2. Open SIS -> More ▾ -> Student Progress -> Student Progression -> New -> promote student.\n3. Open Students -> More ▾ -> General -> Withdrawal Requests -> New -> fill header Name*='WD/2026/099', Student*, Requested date*, Notice date* (<90 days before effective date) -> verify Draft header buttons 'Submit', 'Submit Notice', 'Cancel' -> click 'Submit' -> advance to 'Approved' -> click 'Process Caution Refund'.",
         "Migration wizard updates cohort cleanly; Withdrawal computes notice_days_given and sets full_term_notice_met=false if <90 days; 'Process Caution Refund' creates Credit Note (`out_refund`) invoice.",
         "StudentMigrationWizardView executes batch transition; server/methods.ts enforces Oshwal 90-day notice rule and creates caution refund credit note."),
        ("ADM-06", "03. SIS", "Admin", "SIS Core Registry (Departments, Programs, Courses, Batches, Subjects, Faculty, Classrooms)",
         "App: SIS (38 menus under General, Student Progress, Health, Discipline, Grievance, Convocation, Configurations)",
         "1. Open SIS -> Configurations / General -> explore Programs, Courses, Batches, Subjects (28 IGCSE + 17 A-Level + 4 BTEC), Faculties, Classrooms & Parents.\n2. Open Year 10 — IGCSE (KS4) (`op.course`) -> click Smart Buttons ('Subjects', 'LMS Course', 'Faculties', 'Students', 'Assignment', 'Course Credit', 'Timetable', 'GradeBook', 'Enrollments').",
         "All 38 SIS menus load cleanly with multi-view switching and live smart button counts.",
         "academicsModels in shared/meta/models/academics.ts wires relational integrity across OERB's 6-campus academic hierarchy."),
        ("ADM-07", "03. SIS", "Admin", "SIS Health, IED Logs, Discipline, Grievances, Convocation & Fees Plans",
         "App: SIS -> Health / Discipline / Grievance / Convocation & More ▾ -> General -> Fees Plans",
         "1. Open SIS -> Health -> Student Health -> review Aarav's medical profile; inspect Vaccination & Hospitalization.\n2. Open SIS -> Discipline -> Discipline Actions -> New -> Subject*, Student* -> Submit/Resolve; open SIS -> Grievance -> Grievances -> New -> header Name*, Subject*, Grievance category*, Created date* -> 'Submit' -> 'In Review' -> 'Resolve' -> 'Close'.\n3. Open SIS -> Convocation -> Ceremonies (`Confirm` -> `Complete`) and Convocation Registrations (`Registered` -> `Attended`).\n4. Open SIS -> More ▾ -> General -> Fees Plans -> open fp1 -> inspect 'Installment Lines' (`+ Add a line` / `Remove`) -> click header 'Generate Due Invoices'.",
         "All statutory & pastoral SIS workflows persist cleanly; 'Generate Due Invoices' on Fees Plan creates linked fee invoice(s) in account.move.",
         "op.fees.plan action_generate_due_invoices creates linked account.move and links invoice_id back to plan lines."),
        # --- LMS, TIMETABLE, ATTENDANCE, ASSESSMENTS ---
        ("ADM-08", "04. LMS", "Admin", "LMS Course Authoring, 8 Course Tabs, AI Course Generator & Launch Learner Player",
         "App: LMS -> Dashboard (`op.course`) & More ▾ -> AI Generator -> LMS Course Generator",
         "1. Open LMS -> Dashboard -> open 'Year 10 — IGCSE (KS4)' -> inspect all 8 tabs ('Content', 'Subjects', 'Categories', 'Grading', 'Enrollments', 'Options', 'Description', 'Lessons') and Smart Buttons ('Subjects', 'LMS Course', 'Faculties', 'Students', 'Assignment', 'Course Credit', 'More' -> 'Time Table', 'GradeBook', 'Enrollments').\n2. Click TopNavbar 'More ▾' -> 'AI Generator' -> 'LMS Course Generator' (heading 'AI LMS Course & Syllabus Generator') -> enter Course Title 'Cambridge IGCSE Organic Chemistry', Modules=3 -> click 'Generate Course' -> click 'Open <Course> ->'.\n3. On the course form, click green 'Launch LMS Player' header button.",
         "AI Generator persists 1 published op.course + 3 op.course.module lessons; 'Launch LMS Player' opens `/courses` learner player cleanly.",
         "POST /api/v1/ai/generate-course builds course + module records; FormView exposes 'Launch LMS Player' button on op.course."),
        ("ADM-09", "05. Time Table", "Admin", "Timetable Sessions, Lesson Plans, Generate Timetable Sessions & Schedule PDF",
         "App: Time Table -> Timetable -> Sessions / Generate Timetable & direct TopNavbar 'Reporting'",
         "1. Open Time Table -> Timetable -> Sessions -> switch Calendar/List/Kanban -> open Session #1 -> verify Timing*, Faculty*, Course*, Batch*, Subject* -> verify Done / Reset to Draft / Cancel buttons -> click 'Done'.\n2. Open Time Table -> Lesson Planning -> New -> Lecture Name*, Course*, Subject*, Lesson topic* -> click 'Planned' -> 'Conducted'.\n3. Open Time Table -> Timetable -> Generate Timetable (heading 'Generate Timetable Sessions') -> pick Course, Batch, Faculty, Subject, Timing, Days=3 -> click 'Proceed & Generate'.\n4. Click direct 'Reporting' button in TopNavbar ('Timetable Schedule Report') -> click 'Download Timetable PDF'.",
         "Generator creates 3 confirmed op.session rows; Timetable Report downloads schedule matrix PDF.",
         "TimetableGeneratorView calls POST /api/v1/timetable/generate; TimetableReportWizardView downloads GET /report/pdf/timetable."),
        ("ADM-10", "06. Class Attendances", "Admin", "Attendance Register, Daily Sheet Smart Stats, Check-in Wizard & Kiosk Mode",
         "App: Class Attendances -> Attendance -> Attendance Registers / Attendance Sheets & TopNavbar 'Kiosk Mode'",
         "1. Open Class Attendances -> Attendance -> Attendance Registers -> click 'Attendance Sheets' smart button.\n2. Open Attendance Sheet #1 -> inspect 4 Smart Buttons ('Present', 'Absent', 'Absent Excused', 'Late') and 'Students' tab -> test 'Attendance Start' -> 'Attendance Taken' ('Draft' on completed sheet).\n3. Create new Sheet -> choose Register* -> confirm Course/Batch/Subject auto-fill via onchange.\n4. Click direct 'Kiosk Mode' button in TopNavbar ('Student Attendance Kiosk') -> enter PIN '1001' or 'OAN/2026/0001' in input -> click 'Check In Now'.",
         "Kiosk resolves Aarav R. Shah (PIN 1001) and appends Present op.attendance.line immediately; sheet stats update live.",
         "POST /api/v1/attendance/kiosk-checkin matches pin/barcode/gr_no and creates op.attendance.line."),
        ("ADM-11", "07. Assignments", "Admin", "Assignment Publishing, Rubrics & Grading Submissions",
         "App: Assignments -> Assignments -> Assignments / Assignment Submissions",
         "1. Open Assignments -> Assignments -> Assignments -> click New -> fill header Name*='IGCSE Circuits Lab', Course*, Batch*, Subject*, Assignment type*, Issued date*, Submission date*, Grading Assignment='True' -> Save -> click 'Publish' (Published shows 'Finish', 'Update Grades', 'Cancel', 'Reset to Draft' & 'Submissions' smart button).\n2. Open Assignments -> Assignments -> Assignment Submissions -> open Aarav's submission (Assignment*, Student*) -> click 'Submit' -> enter Obtained Marks -> 'Accept'.\n3. Inspect Configuration -> Assignment Types & Rubrics.",
         "Assignment advances Draft -> Published -> Finished; submission moves Draft -> Submitted -> Accepted.",
         "op.assignment & op.assignment.sub.line transitions execute inside server/methods.ts."),
        ("ADM-12", "08. Exams", "Admin", "Exam Sessions, Exam Scheduling, Attendees, Hall Tickets & Marksheets",
         "App: Exams -> Exams -> Exam Sessions / Exams / Exam Attendees / Marksheet Registers",
         "1. Open Exams -> Exams -> Exam Sessions -> open session #1 -> check 'Exams' smart button -> click 'Schedule' -> 'Held' -> 'Done'.\n2. Open an individual Exam (`op.exam`, e.g. IGCSE Physics Paper 4) -> check 'Attendees · 1' smart button -> statusbar 'Draft | Results Updated | Done' -> click 'Schedule Exam' -> 'Held Exam' -> 'Result Updated' -> 'Finalize'.\n3. Open Exam Attendees or Marksheet Lines -> click Actions cog -> Print Reports -> 'Candidate Exam Hall Ticket' or 'Marksheet'.",
         "Exam sessions and exam sheets progress through every stage; Marksheets calculate totals & pass status via op.grade.scale.line; PDF Hall Ticket & Marksheet render cleanly.",
         "MODEL_REPORTS['op.exam.session'] & ['op.marksheet.line'] bind QWeb templates with barcodes."),
        ("ADM-13", "09. Grade Book", "Admin", "GradeBook Lines, GPA Recomputation, Honor Roll & Official Transcript PDF",
         "App: Grade Book -> Grade Book -> Grade Books & More ▾ -> Configuration",
         "1. Open Grade Book -> Grade Book -> Grade Books -> open GB/OAN/Y10/0001 -> inspect 'Assessment Lines' tab & 'GradeBook · 1' smart button.\n2. Inspect statusbar ('Draft | In Progress | Published | Cancelled') -> click 'Recompute' / 'Recompute Grades' / 'Generate Final Grade' (or 'In Progress' / 'Cancel').\n3. Click Actions cog -> Print Reports -> 'Official Academic Transcript (CAIE / Edexcel)'.\n4. Explore More ▾ -> Configuration -> Grade Scales (9-1, A*-E, D*-P) and Reporting -> Honor Roll.",
         "Recompute updates assessment totals & average; Print generates stamped British curriculum transcript.",
         "server/methods.ts aggregates exam/assignment marks against scale lines to compute GPA."),
        ("ADM-14", "10. Job Queue", "Admin", "Monitor Background Queue Jobs, Requeue & Set to Done/Cancel",
         "App: Job Queue -> Queue -> Jobs, Channels, Job Functions",
         "1. Open Job Queue -> Queue -> Jobs -> view pending/failed/done background jobs.\n2. Open a job (`Name*`) -> test 'Requeue' / 'Set Done' / 'Cancel' buttons.\n3. Inspect Channels & Job Functions.",
         "Job transitions cleanly across wait_dependencies / pending / started / done / cancelled.",
         "queue.job mirrors Odoo queue_job async worker telemetry."),
        ("ADM-15", "11. Quiz", "Admin", "Quiz 5 Tabs, Interactive 'View Exam' Runner Modal & AI Quiz Generator",
         "App: Quiz -> Quiz -> Quizzes & More ▾ -> AI Quiz Generator",
         "1. Open Quiz -> Quiz -> Quizzes -> open op.quiz/1 -> confirm 5 tabs ('Questions', 'Configuration', 'Result Message', 'Description', 'Results'), 'Result' smart button, and 0 console errors.\n2. Click 'View Exam' header button -> Interactive Quiz Runner ('IGCSE Physics — Forces & Motion Check — Interactive Quiz Assessment') opens -> answer questions -> click 'Submit Quiz & Auto-Grade'.\n3. Click TopNavbar 'More ▾' -> 'AI Quiz Generator' ('AI Quiz & Assessment Generator') -> enter Topic 'Wave Motion', Questions=4 -> click 'Generate Quiz'.\n4. Inspect Quiz -> Quiz Results & Question Banks.",
         "Quiz Runner grades attempt creating op.quiz.result + lines; AI Quiz Generator persists op.quiz + 4 op.quiz.line records.",
         "FormView Quiz Runner calls op.quiz.result web_save + get_action_submit + get_action_done; AI endpoint at /api/v1/ai/generate-quiz."),
        ("ADM-16", "12. Thesis", "Admin", "Thesis Registration, Progress Milestones, Extensions & Submission",
         "App: Thesis -> Thesis -> Thesis Registrations / Progress Reports / Thesis Extensions",
         "1. Open Thesis -> Thesis -> Thesis Registrations -> click New -> fill header Title*, Code*, Student*, Research area* -> Save -> click 'Submit' -> 'Approve' -> 'Start Research' -> 'Submit Thesis'.\n2. Open Progress Reports & Thesis Extensions -> review & approve milestone/extension.",
         "Thesis registration moves Draft -> Submitted -> Approved -> In Progress -> Thesis Submitted.",
         "op.thesis.registration, op.thesis.progress, op.thesis.extension handled in server/methods.ts."),
        ("ADM-17", "13. OMR", "Admin", "OMR Sheet PDF Generator Wizard, Answer Key Configuration & Answer Sheets",
         "App: OMR -> More ▾ -> Generate Sheet -> Generate Sheet & Exam",
         "1. Open OMR -> More ▾ -> 'Generate Sheet' -> 'Generate Sheet' (title 'Generate OMR Bubble Sheet') -> fill 'Exam / Paper Title'='IGCSE Bio Paper 1', 'Number of Questions'=30, 'Options per Question'=4 -> click 'Download OMR PDF Sheet'.\n2. Open OMR -> Exam -> open Exam #1 ('IGCSE Physics Paper 1 Mock OMR') -> inspect 'Student Answers Detail' tab, 'Answer Sheets' smart button, and statusbar ('Draft | Confirmed | Done | Cancelled').",
         "PDF generator downloads printable 30-question bubble sheet; OMR Exam & Answer Sheets track optical answers & auto-scored totals.",
         "OmrSheetGeneratorView calls GET /report/pdf/omr -> renderOmrSheetReport()."),
        # --- CAMPUS, TRANSPORT, FLEET, LIBRARY, EVENTS, PLACEMENTS, ALUMNI ---
        ("ADM-18", "14. Campus", "Admin", "Campus Facilities Hierarchy & Facility Allocation Billing",
         "App: Campus -> Facilities -> Facility / Facility Allocations",
         "1. Open Campus -> Facilities -> Facility -> open a facility -> inspect Sub Facilities & Allocations tabs.\n2. Open Campus -> Facilities -> Facility Allocations -> click New -> fill Facility *, From date *, To date * (plus Person) -> Save -> click 'Create Invoice'.",
         "Selecting Facility triggers onchange populating company_id; 'Create Invoice' generates a linked account.move invoice.",
         "op.facility.allocation onchange & create_invoice wired in routes.ts / methods.ts."),
        ("ADM-19", "15. Transportation", "Admin", "Route Register, Daily Trips, Stops & Transport Agreement Billing",
         "App: Transportation -> Route Register & More ▾ (Trips, Agreements, Stops, Vehicles)",
         "1. Open Transportation -> Route Register (`Name*`) -> inspect vehicles, stops & fees.\n2. Click TopNavbar 'More ▾' -> 'TRIPS' -> 'Trips' -> open Trip #1 (statusbar 'Draft | In Transit | Completed') -> click 'End Trip' (or 'Start Trip' on Draft).\n3. Click 'More ▾' -> 'AGREEMENTS' -> 'Agreements' -> open Agreement #1 -> click 'Bill Month' (inspect 'Stops' & 'Routes' under More ▾ -> CONFIGURATION).",
         "Routes, stops, trips (`Draft -> In Transit -> Completed`) and student transport fee agreements create cleanly and bill monthly via 'Bill Month'.",
         "op.route.register, op.route.line, op.transportation.agreement models in campus.ts."),
        ("ADM-20", "16. Library", "Admin", "Media Inventory, Library Cards, Overdue Fines & Barcode Kiosk Issue/Return",
         "App: Library -> direct TopNavbar 'Barcode' & Media / Configuration (20 menus)",
         "1. Open Library -> click direct TopNavbar 'Barcode' (`library_barcode_view`) -> ensure 'issue Media' mode -> select card LCB0000001 -> enter barcode 'LIB-OAN-1002' -> click 'Execute Issue'.\n2. Switch toggle button to 'return Media' -> scan 'LIB-OAN-1002' -> click 'Execute Return' (or click 'View Movements →').\n3. Open Library -> Media -> Media Cards -> Actions cog -> Print Reports -> 'Library Card Barcode'.\n4. Open Media Movements (`Media*`, `Media unit*`, `Library card*`) -> test 'Issue Media', 'Renew Media', 'Return Media' & overdue fine (days × library_fine_per_day).",
         "Barcode view issues/returns media unit instantaneously updating availability status; overdue return calculates KES 25/day fine.",
         "LibraryBarcodeView + server/methods.ts library fine math read library_fine_per_day from res.config.settings."),
        ("ADM-21", "17. Digital Library", "Admin", "Digital Materials & Learner Access Enrollment",
         "App: Digital Library -> Digital Library -> Digital Materials / Enrollments",
         "1. Open Digital Library -> Digital Library -> Digital Materials -> inspect digital resources synced with `/digital-library`.\n2. Open Enrollments -> enroll student -> activate/revoke digital access.",
         "Digital materials publish to website; enrollment controls learner access.",
         "op.digital.library.material & op.digital.library.enrollment models."),
        ("ADM-22", "18. Events", "Admin", "Manage Campus Events, Attendee Registration, Check-In & Badge Email",
         "App: Events -> Events -> Events / Registrations",
         "1. Open Events -> Events -> Events -> open seeded event (`Event Name*`, `Start date*`, `End date*`) -> test 'Announce' / 'End Event' / 'Invite'.\n2. Click 'Attendees' smart button (or open Registrations) -> add/open attendee (header Attendee Name*, Event*, Email*) -> click 'Registered' -> 'Attended' / 'Check In' -> 'Send by Email'.",
         "Event attendee moves Draft -> Registered -> Attended cleanly and sends badge confirmation.",
         "event.event & event.registration models with check-in state transitions."),
        ("ADM-23", "19. Placements", "Admin", "Placement Offers, Career Announcements, Applications & Interviews",
         "App: Placements -> Placements -> Placements",
         "1. Open Placements -> Placements -> Placements -> create/open `op.placement.offer` (Student*, Company*, Join date*) -> confirm & publish.\n2. Inspect Placement Announcements, Applications (`shortlist` -> `hire`) & Career Posts.",
         "University/Career placement drive pipeline tracks applications through offer acceptance.",
         "op.placement.offer & career announcement workflows in methods.ts."),
        ("ADM-24", "20. Alumni", "Admin", "Alumni Directory, Alumni Groups & Alumni Job Postings",
         "App: Alumni -> Alumni -> Alumni / Alumni Groups / Job Posts",
         "1. Open Alumni -> Alumni -> Alumni Groups & Job Posts.\n2. Create/verify Alumni Group or Job Post -> verify visibility on `/alumni` website route.",
         "Alumni groups and job posts persist cleanly and synchronize with public Alumni pages.",
         "op.alumni.group & op.job.post models."),
        ("ADM-25", "21. Fleet", "Admin", "School Buses, Future Driver Assignment, Contracts, Services & Odometer Logs",
         "App: Fleet -> Fleet -> Vehicles / Contracts / Services / Odometers",
         "1. Open Fleet -> Fleet -> Vehicles -> open school bus (header Name*, License plate*, Model*) -> inspect Smart Buttons ('Contracts', 'Services', 'Odometer').\n2. Set 'Future Driver' -> click 'Apply New Driver'.\n3. Add Vehicle Odometer & Service Log entries.",
         "'Apply New Driver' updates driver_id from future_driver_id; smart button counters increment live.",
         "fleet.vehicle.action_accept_driver_change executed in server/methods.ts."),
        # --- HR, RECRUITMENT, TIME OFF, EXPENSES, APPROVALS ---
        ("ADM-26", "22. Recruitment", "Admin", "Job Positions, Applicant Pipeline (from /jobs CV uploads) & Hire & Create Employee",
         "App: Recruitment -> Applications -> Job Positions / All Applications",
         "1. Open Recruitment -> Applications -> Job Positions -> inspect openings (`Job title*`) & 'Applications' smart button.\n2. Open applicant submitted earlier from `/jobs` (header Applicant Name*, Email from*, Job*) -> advance stages (`First Interview` -> `Second Interview` -> `Contract Proposal`) -> click 'Hire & Create Employee'.",
         "Applicant stage advances and hiring at Contract Proposal automatically generates a linked hr.employee profile.",
         "hr.applicant hire handler creates hr.employee and links emp_id."),
        ("ADM-27", "23. Job & 24. OnBoarding", "Admin", "Campus Job Board & New-Hire / Student OnBoarding Checklists",
         "App: Job -> Job -> Job Post / Job Applicants & OnBoarding -> OnBoarding",
         "1. Open Job -> Job -> Job Post & Job Applicants -> test shortlist -> hire.\n2. Open OnBoarding -> advance onboarding checklist steps to completed.",
         "Job applicants shortlist cleanly; Onboarding checklists track completion state.",
         "op.job.post, op.job.applicant, onboarding models."),
        ("ADM-28", "25. Human Resources", "Admin", "Employee Profiles, DCI Police Clearance Certs & Actions Cog Export",
         "App: Human Resources -> Employees -> Employees (Dr. Kamau Njoroge)",
         "1. Open Human Resources -> Employees -> Employees -> open Dr. Kamau Njoroge (`Full Name *`, Email, Phone).\n2. Inspect Work Information, Resume, Certifications (Police Clearance No & Expiry, DBS Verified), Private Information & Payroll tabs plus 'Time Off · 0' smart button.\n3. Open Actions cog ('Export Data', 'Duplicate', 'Archive / Unarchive', 'Delete').",
         "Employee profile displays compliance certs cleanly; expiring DCI certificates surface in KPI Compliance Radar.",
         "hr.employee links to op.faculty and res.users."),
        ("ADM-29", "26. Time Off", "Admin", "Staff Leave Requests, Employee Department OnChange & Approval Allocation",
         "App: Time Off -> My Time -> My Time Off & More ▾ -> Management -> Time Off",
         "1. Open Time Off -> My Time -> My Time Off -> click New -> select Employee -> confirm Department & Company auto-populate via onchange; fill Leave type*, Start date*, End date*.\n2. Save -> click 'Approve' / 'Validate' / 'Refuse' / 'Cancel' (statusbar 'To Approve | Second Approval | Approved | Refused | Cancelled').\n3. Inspect My Allocations & Public Holidays under More ▾ -> Configuration.",
         "Employee onchange fills department_id & company_id; leave moves through To Approve -> Approved cleanly.",
         "hr.leave onchange implemented in server/routes.ts; workflow transitions in methods.ts."),
        ("ADM-30", "27. Expenses & 28. Approvals", "Admin", "Staff Expense Submission, Journal Posting & Multi-Level Approval Requests",
         "App: Expenses -> My Expenses -> My Expenses & Approvals -> Approval Types / More ▾ -> Approvals",
         "1. Open Expenses -> My Expenses -> My Expenses -> click New (`Description*`, `Employee*`, `Total*`) -> click 'Submit' -> Approve -> Post Journal Entries.\n2. Open Approvals -> Approval Types -> open FW: Fee Waiver -> inspect 'Configure' & 'Create New Request' buttons (or More ▾ -> Approvals -> My Request / All Approval -> New -> Request Type* auto-fills Title via onchange).",
         "Expense posts into accounting ledger; Multi-Approval routes cleanly through approver states.",
         "multi.request onchange generates default name from multi.approval.type."),
        # --- ACCOUNTING, SALES, PURCHASE, INVENTORY, CRM ---
        ("ADM-31", "29. Sales", "Admin", "Sales Quotations, Order Templates OnChange & Order-to-Invoice",
         "App: Sales -> Orders -> Quotations / Orders",
         "1. Open Sales -> Orders -> Quotations -> click New -> fill Order reference*, Customer*, select Quotation Template (verify Note auto-fills via onchange) -> add lines -> Confirm -> Create Invoice.",
         "Sales Order confirms into Sales Order state and generates a linked Customer Invoice (account.move).",
         "sale.order onchange & create_invoice integrated with account.move."),
        ("ADM-32", "30. Accounting", "Admin", "Invoicing (Inline Lines, M-Pesa STK Push, Bank Payment PAY/..., Print Preview Modal & Credit Note)",
         "App: Accounting -> Customers -> Invoices",
         "1. Open Accounting -> Customers -> Invoices -> click New -> select 'Learner / Student' (onchange fills partner & company), 'Customer*', 'Invoice date*', 'Invoice date due*', 'Amount total*'.\n2. Add 2 lines via '+ Add a line' in 'Invoice Lines' tab (note also 'Journal Items' & 'Other Info' tabs) -> Save -> confirm zero duplicate buttons.\n3. On Confirmed Invoice #1: click 'Pay via M-Pesa' -> pay KES 10,000 -> click 'Send M-Pesa Prompt' -> verify 'PARTIAL' ribbon.\n4. Click 'Pay' -> Bank -> click 'Create Payment' -> confirm toast 'PAY/... registered', Balance=0, 'PAID' ribbon.\n5. Click 'Print' -> verify modal 'Printable QWeb Invoice Report — INV/2026/0001' (`Print / Save PDF`, `Close`) -> Close -> inspect 'Credit Note', 'Reset to Draft', 'Mark Paid' & 'Payments · 0' smart button.",
         "Inline lines persist in single web_save; M-Pesa partial updates residual & ribbon; Bank payment sets PAID ribbon & PAY/YYYY/NNNN chatter log; Print modal opens.",
         "Full fee lifecycle spans store.create O2M, triggers M-Pesa Daraja simulator, reconciles residuals, and parses multi-rule ribbons cleanly."),
        ("ADM-33", "31. Purchase & 32. Inventory", "Admin", "Purchase Order -> Incoming Receipt Validation, Warehouse Quants & Scrap",
         "App: Purchase -> Orders -> Requests for Quotation & Inventory -> Operations -> Receipts / Scrap",
         "1. Open Purchase -> Orders -> Requests for Quotation -> click New (`Order reference*`, `Vendor*`, `Order deadline*`) for textbooks -> Confirm Order -> Receive Products.\n2. Open Inventory -> Operations -> Receipts -> Validate incoming shipment -> check Reporting -> Stock Quants.\n3. Open Inventory -> Operations -> Scrap -> create & Validate damaged item scrap.",
         "PO generates stock.picking; Validating receipt updates warehouse stock levels; Scrap moves to done.",
         "purchase.order, stock.picking, stock.quant, stock.scrap lifecycle in server/methods.ts."),
        ("ADM-34", "33. CRM", "Admin", "CRM Pipeline Kanban, Lead-to-Opportunity Conversion, Won Stage & Inquiry Review",
         "App: CRM -> Sales -> My Pipeline & Leads -> Leads",
         "1. Open CRM -> Sales -> My Pipeline (Kanban) -> inspect leads/opportunities and inquiry submitted earlier from `/contactus`.\n2. Open Lead (`Opportunity*`, Email, Phone) -> Convert to Opportunity -> move stage Qualified -> Proposition -> Won.",
         "CRM pipeline updates expected revenue & stage counts dynamically across Kanban columns.",
         "crm.lead Kanban groups by stage field; drag/button state updates trigger stage transitions."),
        # --- COMMS, WEBSITE, MARKETING, PLATFORM, SETTINGS, AIO, HELPDESK ---
        ("ADM-35", "34. Website", "Admin", "Website Backend Pages, Blog Posts, Forum Moderation, Visitors & Preview",
         "App: Website (42 menus under Site, eCommerce, Reporting, Configuration)",
         "1. Open Website -> explore Pages, Blog Posts, Forum Posts, Products (`eCommerce`), Appointments & Visitors.\n2. Click 'Go to Website' (`website_preview`) to jump directly to public frontend `/`.",
         "Admins can curate public pages, moderate forum Q&As, edit shop catalog pricing, and preview live pages.",
         "website_preview action navigates seamlessly to PublicWebsite component."),
        ("ADM-36", "35. Email Marketing", "Admin", "Create Mailing Lists, Contacts & Launch Bulk Parent Email Campaign",
         "App: Email Marketing -> Mailings -> Mailings & Mailing Lists",
         "1. Open Email Marketing -> Mailings -> Mailings -> click New -> Subject*='Term 2 Fee Schedule'.\n2. Select Mailing List -> Save -> click 'Launch' / 'Send' -> inspect Comm Outbox.",
         "Mailing moves draft -> done and queues outbound records.",
         "mailing.mailing action_launch handled in server/methods.ts."),
        ("ADM-37", "36. Whatsapp & 37. Live Chat", "Admin", "WhatsApp Business Concierge Inbox, Campaigns & LiveChat Channels",
         "App: Whatsapp -> Chat (`whatsapp_inbox`) & More ▾ -> Campaign / Contacts, Live Chat -> Channels",
         "1. Open Whatsapp -> click TopNavbar 'Chat' (`whatsapp_inbox`, heading 'Send WhatsApp Message') -> enter Phone '+254722810400' + message -> click 'Dispatch via WhatsApp Adapter' -> verify message appears in thread & comm.outbox.\n2. Open Whatsapp -> More ▾ -> 'Campaign' -> 'Campaign' -> click 'Start' -> 'Generate Participants' -> 'Execute Activities'.\n3. Open Live Chat -> Channels & Canned Responses (`:admissions`).",
         "WhatsApp Inbox dispatches via POST /api/v1/integrations/whatsapp/send; Campaign generates target participants.",
         "WhatsAppInboxView calls sendWhatsAppMessage() in server/integrations.ts."),
        ("ADM-38", "38. Surveys, 39. Contacts, 40. Discuss, 41. Notice Board", "Admin", "Surveys Scoring, Contacts Directory, Discuss Channels & Notice Publishing",
         "App: Surveys, Contacts, Discuss & Notice Board -> Notices",
         "1. Open Surveys -> inspect Parent Satisfaction Survey responses & percentages.\n2. Open Contacts -> filter Customers/Parents/Students/Banks.\n3. Open Discuss -> post message into a channel.\n4. Open Notice Board -> Notices -> click New -> fill header Title*, Notice number*, Subject*, Start date*, tab 'Description' (Description*) -> verify Draft buttons 'In Progress', 'Publish', 'Publish & Broadcast' -> click 'Publish' (published notice shows 'Unpublish').",
         "All 4 collaboration & directory modules save cleanly; publishing Notice immediately updates Student/Parent `/my` notification badge.",
         "store.logMessage & op.notice state transitions drive live portal alert counters."),
        ("ADM-39", "42. Dashboards & 43. KPI Dashboard", "Admin", "BI Analytics Dashboards & Executive Compliance KPI Radar",
         "App: Dashboards (`bi_dashboard`) & KPI Dashboard (`kpi_dashboard`)",
         "1. Open Dashboards -> inspect live admissions funnel, revenue, enrollment, and campus charts.\n2. Open KPI Dashboard -> inspect Campus Breakdown table and Compliance Radar (Pupil's Pass & Police Clearance warnings).",
         "Charts and KPI tiles reflect newly enrolled students, paid invoices, and staff/student compliance alerts in real time.",
         "KpiDashboardView & BiDashboardView aggregate live metrics from GET /api/v1/kpi/executive."),
        ("ADM-40", "44. Calendar & 45. Documents (DMS)", "Admin", "Campus Calendar Meeting Link Generator & Encrypted DMS Repository",
         "App: Calendar -> Calendar & Documents -> Documents -> Files / Directories",
         "1. Open Calendar -> switch Calendar/List -> open event (header Meeting Subject*, Start date*, Stop date*) -> click 'Create Online Meeting'.\n2. Open Documents -> inspect Directories, Tags & Consent PDF Files.",
         "Calendar attaches generated https://meet.google.com/... meeting URL cleanly; DMS organizes role-scoped files.",
         "calendar.event.generate_meeting_link creates deterministic meeting URL; dms.file manages permissions via dms.access.group."),
        ("ADM-41", "46. E-sign & 47. Automated Marketing", "Admin", "E-Sign Template ('E-sign') 'Send for Signature' & Document ('Documents') 'Sign Document'",
         "App: E-sign -> TopNavbar 'E-sign' (Templates) / 'Documents' (Signature Requests) & Automated Marketing",
         "1. Open E-sign -> open template -> click 'Send for Signature'.\n2. Click TopNavbar 'Documents' (`e.sign.request`) -> create/open Draft request (Name*, Template*, Signer name*, Signer email*) -> click 'Sign Document' (already 'Fully Signed' #1 shows 'Preview' & 'Cancel').\n3. Open Automated Marketing -> inspect campaigns, participants & traces.",
         "E-Sign transitions template request into Fully Signed state cleanly; Automated Marketing traces track participant execution.",
         "e.sign.template.create_request & e.sign.request.sign_now implemented in server/methods.ts."),
        ("ADM-42", "48. Multi Campus, 49. Spreadsheets & 50. Apps", "Admin", "Multi-Campus Directory, Pivot Spreadsheets & Installed Modules Manager",
         "App: Multi Campus, Spreadsheets & Apps",
         "1. Open Multi Campus -> inspect all 6 OERB entities & theme configs.\n2. Open Spreadsheets -> inspect spreadsheet workspace.\n3. Open Apps -> verify 65+ installed modules -> filter by category & test Install/Uninstall toggle.",
         "All 6 campuses editable; Spreadsheets renders tabular analysis; ir.module.module toggles active/uninstalled state cleanly.",
         "ir.module.module button_install/button_uninstall updates module catalog state."),
        ("ADM-43", "51. Settings & Integrations", "Admin", "Configure Gateways (M-Pesa, WhatsApp, SMS, SMTP, Meetings, SSO/OAuth, Webhooks), Document Layout, Crons & Test All Adapters",
         "App: Settings (`/openeducat/settings` and `/openeducat/settings/res.config.settings?view=form`)",
         "1. Open Settings -> under 'General Settings', inspect Users/Languages/Companies and click '→ Configure Document Layout' -> switch Boxed/Bold/Light layout, Font, Primary color, upload/clear Logo -> Save.\n2. Under 'System Integrations & Connectivity Testers', click all 8 Test buttons ('Test M-Pesa Connection', 'Test WhatsApp Connection', 'Test SMS Connection', 'Test SMTP Connection', 'Test Meeting Connection', 'Test SSO Connection', 'Test Webhook Connection', 'Test AI Connection').\n3. Click 'OpenEduCat' sidebar category -> click 'Export CAIE / Edexcel EDI', 'Test AI Adapter', 'Test Meeting Connector', 'Verify SSO Metadata', 'Ping Webhook Endpoint'.\n4. Open `/openeducat/settings/res.config.settings?view=form` -> click through all 7 tabs ('Terminology', 'Academic Rules', 'Payments (M-Pesa)', 'Messaging', 'AI & Meetings', 'SSO & Webhooks', 'Website'), edit SMTP host/port or Webhook URL -> Save -> run Scheduled Intervals (`ir.cron`) -> 'Run Now' & test Seed Profile switcher.",
         "Every gateway config persists in res.config.settings; all Connection Tests return HTTP 200 `{ ok: true, message }`; EDI JSON downloads; Crons execute; seed switch resets cleanly.",
         "SettingsPanelView & FormView wire POST /api/v1/integrations/test, /api/v1/integrations/exam-boards/edi-export, /api/v1/admin/switch-seed, and /api/v1/cron/:id/run."),
        ("ADM-44", "52. AIO & 53. Helpdesk", "Admin", "AI Agents Playground ('Ask Agent'), Tool Approvals & Helpdesk Ticket Resolution",
         "App: AIO -> Playground / More ▾ -> Configuration -> Tool Approvals & Helpdesk -> Tickets (from Team Kanban)",
         "1. Open AIO -> Playground (`ai_playground`) -> review pre-filled prompt (input has no placeholder) or ask 'Summarize IGCSE 9-subject & AS-Level rules' -> click 'Ask Agent'.\n2. Open AIO -> More ▾ -> Configuration -> Tool Approvals (`aio.agent.approval`) -> inspect approval queue (Create/Approve pending request if present); inspect Guardrails & Agents.\n3. Open Helpdesk -> click 'Tickets (1)' on Team card (or TopNavbar 'Tickets') -> open ticket (header Ticket seq*, Subject*, tab 'Description' -> Help description*) -> click 'Assign To Me' -> 'Create Opportunity' -> 'Mark Resolved'.",
         "AI Playground responds using live campus/student counts; Tool Approval & Helpdesk tickets transition cleanly.",
         "AiPlaygroundView posts to /api/v1/integrations/ai/generate; helpdesk.ticket executes action_assign_to_me, action_create_opportunity & mark_resolved."),
    ]


def build_faculty_cases() -> list[tuple[str, str, str, str, str, str, str, str]]:
    return [
        ("FAC-01", "Auth & Launcher", "Faculty", "Sign In as Faculty & Confirm Exact 35-App Scope",
         "URL: /web/login -> click 'Faculty (Dr. Kamau Njoroge)'",
         "1. Log out if signed in.\n2. Click 'Faculty' demo role.\n3. Verify /openeducat/apps_menu renders exactly 35 apps and excludes Admin-only apps (Accounting, Purchase, Inventory, Sales, Settings, OMR, Recruitment, Events, etc.).",
         "Lands on /openeducat/apps_menu showing 35 apps under 'Dr. Kamau Njoroge'.",
         "GET /api/v1/meta/menus filters APPS where roles.includes('faculty')."),
        ("FAC-02", "05. Time Table", "Faculty", "Deliver Class Session & Conduct Lesson Plan",
         "Nav: Time Table -> Sessions / Lesson Planning",
         "1. Open 'Sessions' -> switch Calendar / Kanban / List -> open 'Dr. Kamau Njoroge: Physics (IGCSE) 08:00–08:45' -> verify single Done / Reset to Draft / Cancel buttons -> click 'Done'.\n2. Open 'Lesson Planning' -> New ('Lecture Name*', 'Course*', 'Subject*', 'Lesson topic*') -> Save -> click 'Planned' -> 'Conducted'.",
         "Session marks Done; Lesson Plan moves Draft -> Planned -> Conducted cleanly.",
         "Faculty has ACADEMIC_WRITE_MODELS access on op.session & op.lesson."),
        ("FAC-03", "06. Class Attendances", "Faculty", "Create Attendance Sheet (Register OnChange) & Test Kiosk Check-In",
         "Nav: Class Attendances -> Attendance Sheets / Kiosk Mode",
         "1. Open 'Attendance Sheets' -> click 'New' -> enter 'Name*' & pick 'Register*' (verify Course/Batch/Subject auto-fill via onchange) -> Save.\n2. Click 'Attendance Start' -> add/update lines on 'Students' tab -> click 'Attendance Taken' -> inspect 4 stat badges.\n3. Open 'Kiosk Mode' -> enter PIN '1001' -> click 'Check In Now'.",
         "Attendance sheet tracks Present/Absent/Excused/Late stats accurately and Kiosk checks in Aarav R. Shah.",
         "Faculty allowed full write on attendance register/sheets; Kiosk posts to /api/v1/attendance/kiosk-checkin."),
        ("FAC-04", "07. Assignments & 04. LMS", "Faculty", "Publish Homework Assignment, Grade Submission & Author LMS Module",
         "Nav: Assignments -> Assignments / Submissions | LMS -> Course Modules",
         "1. Open Assignments -> click 'New' -> enter 'Name*', 'Course*', 'Batch*', 'Subject*', 'Faculty*', 'Assignment type*', 'Marks'=50 -> Save -> click 'Publish' (Published shows 'Finish', 'Update Grades', 'Cancel', 'Reset to Draft' & 'Submissions' smart button).\n2. Open 'Submissions' -> open line -> click 'To Assess' -> enter 'Obtained mark' -> click 'Accept'.\n3. Open LMS -> 'Course Modules' -> click 'New' ('Name*', 'Course*') -> fill 'Document' tab -> Save -> click 'Publish'.",
         "Faculty creates/grades assignments and publishes new LMS lessons cleanly.",
         "op.assignment, op.assignment.sub.line & op.course.module permit faculty CRUD."),
        ("FAC-05", "08. Exams & 09. Grade Book", "Faculty", "Update Exam Results, Recompute GradeBook & Print Transcript",
         "Nav: Exams -> Exams | Grade Book -> Grade Books",
         "1. Open Exams -> 'Exams' -> open Exam #1 ('Attendees · 1' smart button, statusbar 'Draft | Results Updated | Done') -> advance / click 'Finalize'.\n2. Open Grade Book -> 'Grade Books' -> open GB/OAN/Y10/0001 ('GradeBook · 1' smart button, tab 'Assessment Lines') -> click 'Recompute' / 'Recompute Grades' / 'Generate Final Grade' -> Actions cog -> Print Reports -> 'Official Academic Transcript (CAIE / Edexcel)'.",
         "GradeBook recalculates totals against Oshwal scale lines and prints stamped QWeb transcript.",
         "Recompute updates assessment percentages/GPA in server/methods.ts."),
        ("FAC-06", "11. Quiz & 12. Thesis", "Faculty", "Run AI Quiz Generator, Test 'View Exam' Runner & Approve Thesis Progress",
         "Nav: Quiz -> Quiz / More ▾ -> AI Quiz Generator | Thesis -> Progress Reports",
         "1. Open Quiz -> open op.quiz/1 -> confirm 5 tabs ('Questions', 'Configuration', 'Result Message', 'Description', 'Results') & 'Result · 2' smart button -> click 'View Exam' ('Done' / 'Closed') to test Quiz Runner -> open More ▾ -> 'AI Quiz Generator' -> click 'Generate Quiz'.\n2. Open Thesis -> 'Progress Reports' -> review & approve student milestone.",
         "Quiz Runner, AI Quiz Generator & Thesis progress updates work with 0 console errors.",
         "Faculty has full CRUD on op.quiz & op.thesis.*."),
        ("FAC-07", "16. Library & 17. Digital Library", "Faculty", "Issue Library Books via Barcode & Inspect Digital Materials",
         "Nav: Library -> direct TopNavbar 'Barcode' | Digital Library -> Digital Materials",
         "1. Open Library -> click direct 'Barcode' -> select card, pick unit barcode -> click 'Execute Issue', then toggle 'return Media' -> 'Execute Return'.\n2. Open Digital Library -> inspect digital course study packs.",
         "Faculty circulates library units & accesses digital teaching resources.",
         "Library & Digital Library allow faculty access."),
        ("FAC-08", "26. Time Off, 27. Expenses & 53. Helpdesk", "Faculty", "Submit Staff Leave Request, Claim Expense & Resolve Support Ticket",
         "Nav: Time Off -> My Time -> My Time Off | Expenses -> My Expenses | Helpdesk -> Tickets",
         "1. Open 'My Time Off' -> click 'New' -> pick 'Employee*' (verify Department auto-fills via onchange), 'Leave type*', 'Start date*', 'End date*' -> Save.\n2. Open 'My Expenses' -> click 'New' ('Description*', 'Employee*', 'Total*') -> Save -> 'Submit'.\n3. Open Helpdesk -> click 'Tickets (1)' -> click 'Assign To Me' -> 'Mark Resolved'.",
         "Faculty submits personal HR requests & closes tickets without errors.",
         "hr.leave, hr.expense, helpdesk.ticket allow faculty operations."),
        ("FAC-09", "RBAC Guard (UI Read-Only)", "Faculty", "Verify Read-Only Enforcement on Restricted Financial Models (account.move)",
         "Direct URL: http://localhost:5175/openeducat/accounting/account.move/1?view=form",
         "1. Navigate to /openeducat/accounting/account.move?view=list -> confirm NO 'New' button appears.\n2. Open INV/2026/0001 form -> confirm Pay, Send, Pay via M-Pesa, Credit Note, Reset to Draft, and Mark Paid buttons are ALL hidden, form inputs are disabled, and ONLY 'Print' renders (note: no warning banner renders).",
         "Zero mutating financial controls shown to Faculty; form fields locked read-only.",
         "ControlPanel & FormView honor checkModelAccess('account.move','faculty','write') === false."),
    ]


def build_backoffice_cases() -> list[tuple[str, str, str, str, str, str, str, str]]:
    return [
        ("BO-01", "Auth & Launcher", "Backoffice", "Sign In as Backoffice & Confirm Exact 25-App Scope",
         "URL: /web/login -> click 'Backoffice (Mrs. Sujata Yanamandra)'",
         "1. Click 'Backoffice' demo button.\n2. Confirm /openeducat/apps_menu renders exactly 25 apps (Fees Plans lives under SIS -> More ▾ -> General -> Fees Plans; Accounting/Campus/Fleet also work via direct URL or smart buttons).",
         "Dashboard displays the 25 Registrar/Bursar/HR/Admin apps cleanly.",
         "GET /api/v1/meta/menus filters APPS where roles.includes('backoffice')."),
        ("BO-02", "01. Admissions", "Backoffice", "Process Draft/Submitted Admissions & Enroll into Student + Invoice",
         "Nav: Admissions -> Applications",
         "1. Open 'Applications' -> open an applicant.\n2. Advance 'Submit' -> Confirmed shows 'Send for Signature', 'Enroll', 'Reject', 'Cancel' -> click 'Enroll'.\n3. Switch to SIS -> Students -> 'Invoiced' smart button -> confirm NO brief stale student rows flash when account.move opens.",
         "Enrollment advances to Done creating student & posted tuition invoice; switching models clears previous rows cleanly.",
         "UniversalModuleWorkspace clears records on modelName change; Backoffice executes intake enrollment."),
        ("BO-03", "02. Students & Fees", "Backoffice", "Collect Fees via M-Pesa / Bank Payment, Fees Plans & 90-Day Withdrawal Caution Refund",
         "Nav: SIS -> Students -> 'Invoiced' Smart Button | SIS -> More ▾ -> General -> Fees Plans & Withdrawal Requests",
         "1. Open Aarav R. Shah -> click 'Invoiced' smart button -> open unpaid invoice (or /openeducat/accounting/account.move/1?view=form).\n2. Click 'Pay via M-Pesa' or 'Pay' -> fill Register Payment modal -> 'Create Payment'.\n3. Open SIS -> More ▾ -> General -> Fees Plans (`op.fees.plan/1`) -> click header 'Generate Due Invoices'.\n4. Open Students -> More ▾ -> General -> Withdrawal Requests -> New Draft shows 'Submit', 'Submit Notice', 'Cancel' -> submit & approve -> click 'Process Caution Refund'.",
         "Invoice updates to 'PAID' ribbon with 'PAY/...' log; Fees Plan & Withdrawal Caution Refund create linked invoices/credit notes cleanly.",
         "Backoffice has write permissions on fee invoices & student withdrawals (cannot unlink account.move)."),
        ("BO-04", "46. E-sign & HR Compliance", "Backoffice", "Send E-Sign Requests, Sign Document & Audit HR Good Conduct Expiries",
         "Nav: E-sign -> TopNavbar 'E-sign' / 'Documents' | Human Resources -> Employees",
         "1. Open E-sign -> click 'Send for Signature' on template -> open Draft request under TopNavbar 'Documents' -> click 'Sign Document'.\n2. Open Human Resources -> 'Employees' -> open employee -> inspect 'Certifications' tab ('Certificate of Good Conduct No', 'Good Conduct Expiry', 'Child Protection Cleared') & 'Time Off · 0' smart button (Export/Actions via cog).",
         "E-Sign transitions Draft request to Fully Signed; Staff compliance dates inspect cleanly.",
         "e.sign.* flows & hr.employee certification fields drive KPI compliance radar."),
        ("BO-05", "24–28 Staff Ops", "Backoffice", "Approve Time Off, Post Expenses, Approve Multi-Requests & OnBoarding",
         "Nav: Time Off / Expenses / Approvals / OnBoarding",
         "1. Open Time Off -> 'Approve' & 'Validate' staff leave.\n2. Open Expenses -> 'Submit' -> Approve & Post.\n3. Open Approvals -> 'Approval Types' (`Configure` / `Create New Request`) or More ▾ -> Approvals -> My Request.\n4. Open OnBoarding -> mark onboarding steps complete.",
         "All operational staff approvals complete cleanly.",
         "Backoffice manages backoffice/HR approvals cleanly."),
        ("BO-06", "43. KPI Dashboard & 53. Helpdesk", "Backoffice", "Monitor Compliance Radar & Resolve Parent/Student Tickets",
         "Nav: KPI Dashboard | Notice Board | Helpdesk -> Tickets",
         "1. Open KPI Dashboard -> review Compliance Radar (Pupil's Pass Due & Good Conduct Certs Due) & Campus Breakdown.\n2. Open Notice Board -> create Notice ('In Progress', 'Publish', 'Publish & Broadcast').\n3. Open Helpdesk -> click 'Tickets (1)' -> click 'Assign To Me' -> 'Mark Resolved'.",
         "Live KPIs, Notices & Helpdesk SLAs update immediately.",
         "KPI Dashboard fetches /api/v1/kpi/executive; Notice Board & Helpdesk update portal metrics."),
    ]


def build_student_cases() -> list[tuple[str, str, str, str, str, str, str, str]]:
    return [
        ("STU-01", "Portal / Home", "Student", "Verify Student Portal (/my), KPIs, Charts & All 35 Categorized Cards",
         "URL: /web/login -> click 'Student (Aarav R. Shah)'",
         "1. Click 'Student' demo login -> verify landing on /my with 'Welcome Aarav'.\n2. Check Sidebar ('Term 1', 'Year 10 — Stream East', 'Year 10 — IGCSE (KS4)', '2nd Parklands Avenue, Nairobi', 'student@oshwalacademy.sc.ke'), 8 Quick Actions, 'Pay Fees ( KES 305,000 ) via M-Pesa' banner, Attendance charts, and exact 4 Card Sections (35 cards): 'Academics & Assessments' (17), 'Library, Materials & Campus' (5), 'Finance, Fees & Payments' (5), 'Communication, Leave & Account' (8).\n3. Try navigating to /openeducat/apps_menu -> verify /my Portal renders safely without Admin app launcher.",
         "/my loads with 0 errors and student cannot access the Admin 53-app launcher grid.",
         "GET /api/v1/portal/my hydrates student KPIs & cardCounts; App.tsx routes student area='apps' to /my."),
        ("STU-02", "Portal / Edit Profile", "Student", "Update Phone & Address via Inline 'Edit information' Form on /my",
         "URL: /my (Left Profile Sidebar)",
         "1. Click 'Edit information' button below Aarav's contact details (opens inline editor directly on /my without changing URL).\n2. Update 'Phone' ('+254711998877'), 'Email', 'Street / Estate' ('3rd Parklands Avenue'), 'City / Town' ('Nairobi').\n3. Click 'Save Changes' (or 'Cancel').",
         "Displays 'Contact profile updated!' toast (HTTP 200), sidebar updates immediately, and Student Profile card shows new details.",
         "Calls dedicated POST /api/v1/portal/profile endpoint scoped strictly to req.user.student_id."),
        ("STU-03", "Portal / LMS Player", "Student", "Enroll in LMS Course, Complete Lessons (0% -> 100%) & Complete Course",
         "URL: /my -> Quick Actions -> 'LMS Player' (/courses) (note: 'Courses' portal card opens /openeducat/sis/op.course)",
         "1. Click 'LMS Player' Quick Action -> lands on /courses ('LMS eLearning Catalog & Course Player').\n2. Click 'Enroll Now' on 'Year 10 — IGCSE (KS4)' (`OAN-Y10-IGCSE`) -> toast 'Enrolled in LMS course!' -> opens Course Player.\n3. Verify exact player controls: '← Back to LMS Catalog', 'Complete & Next Lesson', 'Mark Lesson Done', 'Take Course Quiz / Assessment', 'Complete Course'.\n4. Click 'Mark Lesson Done' (or 'Complete & Next Lesson') -> verify 'Completed' status, toast 'Lesson marked complete!', and Progress=50% -> repeat for Lesson 2 (100%) -> click 'Complete Course'.",
         "Every completion toggle writes to op.course.enrollment.line, auto-recomputes progress %, and unlocks Completed & Certified badge cleanly.",
         "PublicWebsite scopes enrollments by user.id; store.write on line triggers recomputeEnrollmentProgress()."),
        ("STU-04", "Portal / Online Quizzes", "Student", "Take & Submit Auto-Graded Online Quiz (/online-exams)",
         "URL: /my -> Quick Actions -> 'Online Quizzes' (/online-exams)",
         "1. Click 'Online Quizzes' in Quick Actions.\n2. Confirm 'IGCSE Physics — Forces & Motion Check' renders on 'Student Online Exams & Quizzes' with 'Time Limit: 20 mins · Total Marks: 20' and all 3 real questions.\n3. Answer all 3 questions and click 'Submit Quiz Attempt'.\n4. Return via '← Portal (/my)' and confirm 'Quiz Result' card count increased.",
         "Submits op.quiz.result + result lines, executes get_action_submit (200) & get_action_done (200), displays graded score box & 'Quiz submitted & graded!' toast.",
         "PublicWebsite calculates marks against answers and routes.ts permits get_action_submit & get_action_done for portal users."),
        ("STU-05", "Portal / Time Off", "Student", "Create Student Leave Request via 'Time Off' Card (student.leave.request)",
         "URL: /my -> Card 'Time Off' (/openeducat/sis/student.leave.request?view=kanban)",
         "1. Click 'Time Off' card under 'Communication, Leave & Account' -> navigates to student.leave.request kanban ('To Submit | To Validate | Validated | Approved | Refused | Cancelled') -> click 'New'.\n2. Scroll down and back up to verify 'New', 'Save', and 'Discard changes' sit cleanly below the 46px sticky header.\n3. Verify 'Student*' pre-populates/selects Aarav, open 'Leave type*' -> select 'Medical / Infirmary Leave' -> set 'Start date*', 'End date*', 'Description' -> click 'Save' -> 'Confirm'.",
         "Record saves (HTTP 201), Leave Type dropdown populates across campuses, and sticky ControlPanel buttons never clip.",
         "student.leave.type has nocompany:true; ControlPanel uses sticky top-[46px] z-30."),
        ("STU-06", "Portal / Grievances & Academics", "Student", "Create Grievance, Course Change Request, Subject Registration & Submit Assignment",
         "URL: /my -> Cards 'Grievances', 'Course Change Request', 'Subject Registration', 'Assignments'",
         "1. Click 'Grievances' card (/openeducat/sis/grievance) -> 'New' -> enter 'Name*', 'Subject*', 'Grievance category*', 'Created date*', 'Description' -> Save.\n2. Click 'Course Change Request' card -> 'New' ('Name*', 'Student*', 'Current Course*', 'Requested Course*', 'Reason*') -> Save.\n3. Click 'Assignments' card -> open draft submission -> fill 'Description' -> click 'Submit'.",
         "All self-service creates & submissions persist cleanly with student_id auto-injected.",
         "PORTAL_SELF_SERVICE_MODELS + routes.ts automatic student_id scoping."),
        ("STU-07", "Portal / M-Pesa Fees", "Student", "Open 'Fees Statements' -> Invoice #1 -> 'Pay via M-Pesa' Modal",
         "URL: /my -> Card 'Fees Statements' -> INV/2026/0001 (/openeducat/sis/account.move/1?view=form)",
         "1. Click 'Fees Statements' card -> open INV/2026/0001 (verify only 'Print' & 'Pay via M-Pesa' header buttons appear).\n2. Click 'Pay via M-Pesa' -> dialog 'M-Pesa Express (STK Push)' opens with exact fields 'Safaricom M-Pesa Phone' (`+254722810400`) and 'Amount (KES)' (`305000`).\n3. Click 'Send M-Pesa Prompt' -> inspect 'Payment methods' card & settled balance.",
         "Creates 'done' payment.transaction with receipt code and sets invoice residual to KES 0.",
         "Posts to /api/v1/integrations/mpesa/stk-push -> triggerMpesaStkPush()."),
        ("STU-08", "Portal / All 35 Cards Filter", "Student", "Filter Portal Cards by Search & Spot-Check Timetable, Attendance, GradeBook, Library, Certificate & Notice Board",
         "URL: /my",
         "1. Type 'Library' in portal search box -> confirm live card filtering.\n2. Clear search and verify exact portal cards open scoped SIS views: 'Student Profile', 'Timetable', 'Attendance', 'GradeBook', 'Certificate' (op.achievement), 'Digital Library', 'Library', 'DMS', 'Notice Board', 'Fees Statements'.",
         "Every portal card opens Aarav-scoped view cleanly with 0 console or HTTP 500 errors.",
         "PORTAL_CARDS (35 items) routes via openModel() + portalFilter(model, user)."),
    ]


def build_parent_cases() -> list[tuple[str, str, str, str, str, str, str, str]]:
    return [
        ("PAR-01", "Portal / Home", "Parent", "Sign In as Parent & Verify Child Portal (/my)",
         "URL: /web/login -> click 'Parent (Mr. Rajesh Shah)'",
         "1. Click 'Parent' demo login -> redirects to /my.\n2. Verify greeting 'Welcome Mr.', subtitle 'You're viewing your child's portal — quick access to all records and services.', and all 35 portal cards across 4 sections.\n3. Click 'Student Profile' card -> confirm linked child 'Aarav R. Shah' (`#OAN/2026/0001`) is displayed.",
         "Parent portal scopes all metrics & cards to linked child Aarav R. Shah cleanly.",
         "Parent user stores student_id=1; /api/v1/portal/my hydrates child data."),
        ("PAR-02", "Portal / Fees & M-Pesa", "Parent", "Inspect Read-Only Fees Statements, Print QWeb Invoice & Pay via M-Pesa",
         "URL: /my -> Card 'Fees Statements' (account.move)",
         "1. Click 'Fees Statements' -> verify 'New' is hidden and only Aarav's invoices display.\n2. Open INV/2026/0001 -> verify financial fields are read-only and 'Pay'/'Credit Note'/'Reset to Draft' are hidden (only 'Print' & 'Pay via M-Pesa' appear).\n3. Click 'Print' -> verify QWeb Print Preview Modal opens -> Close.\n4. Click 'Pay via M-Pesa' -> inspect dialog 'M-Pesa Express (STK Push)' with 'Safaricom M-Pesa Phone' (`+254722810400`) & 'Amount (KES)' (`305000`) -> click 'Send M-Pesa Prompt'.",
         "Parent prints official invoice voucher and completes M-Pesa settlement cleanly while direct accounting writes remain blocked.",
         "FormView enables Print & Pay via M-Pesa for portal users on read-only account.move."),
        ("PAR-03", "Portal / E-Sign & Meetings", "Parent", "Inspect Media Consent E-Sign ('Connection & Security') & Book Parent-Teacher Slot",
         "URL: /my -> Card 'Connection & Security' (e.sign.request) & 'Online Meetings' / /booking",
         "1. Click 'Connection & Security' card -> opens e.sign.request (`ESIGN/0001`). Note: Draft requests display 'Sign Document'; already 'Fully Signed' requests display statusbar 'Draft | Fully Signed'.\n2. Click 'Online Meetings' or visit /booking -> pick appointment -> enter Mr. Rajesh Shah details -> 'Confirm Booking'.",
         "Draft E-Sign signs to Fully Signed; consultation appointment creates calendar.event.",
         "Parent authorized for sign_now on e.sign.request and public calendar booking."),
        ("PAR-04", "Portal / Academic Oversight", "Parent", "Review Child Attendance, GradeBook, Notice Board, Time Off & Grievances",
         "URL: /my",
         "1. Open 'Notice Board' card to inspect published circulars.\n2. Open 'GradeBook', 'Attendance', and 'Timetable'.\n3. Open 'Time Off' & 'Grievances' to verify parent ability to file or track requests.",
         "All child records & pastoral modules load cleanly with 0 403/500 errors.",
         "portalFilter applies student_id scoping consistently across read and self-service models."),
    ]


def build_statutory_rbac_cases() -> list[tuple[str, str, str, str, str, str, str, str]]:
    return [
        ("NEG-01", "Kenyan Statutory", "Admin / Backoffice", "Block Non-Kenyan Enrollment Without Pupil's Pass",
         "Nav: Admissions -> Applications",
         "1. Create op.admission -> 'Personal Detail' tab -> Citizenship='Non-Kenyan', leave 'Pupil's Pass No' blank -> Save -> Submit -> Confirm -> click 'Enroll'.",
         "Blocked with validation toast requiring Pupil's Pass No & expiry before enrolling non-Kenyan learner.",
         "Enforced inside action_enroll / enroll_student in server/methods.ts."),
        ("NEG-02", "Academic Entry Gate", "Admin / Backoffice", "Enforce AS-Level / IAL 5-IGCSE Credit Entry Gate",
         "Course: Year 12 — GCE AS-Level & IAL",
         "1. Create Senior High AS-Level application with <5 IGCSE credits -> advance to Confirm -> click 'Enroll'.",
         "Blocked until 5 IGCSE credits (incl. English & Math) are satisfied.",
         "Prerequisite check inside server/methods.ts admission enroll."),
        ("NEG-03", "IGCSE Private Rule", "Admin / Backoffice", "Block Private IGCSE Practical Science & Trigger 5-Party E-Sign for Valid Private Entry",
         "Nav: Students -> General -> Subject Registration",
         "1. Enable 'Extra Private Subject Requested' + check 'Subject Has Practical/Coursework' -> click 'Submit & Validate Rules'.\n2. Uncheck 'Subject Has Practical/Coursework' on a non-practical private subject -> click 'Submit & Validate Rules'.",
         "Practical lab private subject is blocked; valid private registration creates 5-Party E-Sign request.",
         "op.subject.registration rule engine in server/methods.ts."),
        ("NEG-04", "Library Fine Rule", "Admin / Faculty", "Verify KES 25/Day Overdue Library Fine Calculation",
         "Nav: Library -> All Media -> Media Movements",
         "1. Open an overdue Media Movement past Return date -> click 'Return Media'.",
         "Penalty calculates strictly as overdue days × library_fine_per_day (KES 25/day).",
         "op.media.movement return handler reads res.config.settings.library_fine_per_day."),
        ("NEG-05", "Withdrawal Rule", "Admin / Backoffice", "Verify 90-Day Notice Flag & Caution Money Refund Rule",
         "Nav: Students -> More ▾ -> General -> Withdrawal Requests",
         "1. Submit withdrawal with <90 days notice -> Approve -> click 'Process Caution Refund'.",
         "Sets 'Full Term Notice Met'=false and issues Caution Refund credit note (`out_refund`).",
         "Compares notice window against res.config.settings.withdrawal_notice_days (90)."),
        ("NEG-06", "RBAC Financial Block", "Faculty", "Verify HTTP 403 When Faculty Posts Write to account.move or res.config.settings",
         "Role: Faculty (uid=2)",
         "1. Signed in as Faculty, open DevTools Console and call POST /api/v1/dataset/call_kw/account.move/web_save & res.config.settings.",
         "Both calls reject with HTTP 403 Access Denied citing FINANCIAL_MODELS restriction.",
         "checkModelAccess() in shared/meta/security.ts enforced in routes.ts."),
        ("NEG-07", "RBAC Audit Block", "Backoffice", "Verify HTTP 403 When Backoffice Attempts Unlink on account.move or res.users",
         "Role: Backoffice (uid=3)",
         "1. Signed in as Backoffice, attempt POST /api/v1/dataset/call_kw/account.move/unlink or Actions -> Delete on Invoice.",
         "Rejected with HTTP 403 protecting financial/user audit history.",
         "checkModelAccess('account.move','backoffice','unlink') === false."),
        ("NEG-08", "RBAC Portal Block", "Student / Parent", "Verify HTTP 403 on Direct op.student Write, Settings Save, Admin Methods, or Cross-Student Tampering",
         "Role: Student (uid=4) or Parent (uid=5)",
         "1. Attempt direct POST /api/v1/dataset/call_kw/op.student/web_save.\n2. Attempt POST /api/v1/dataset/call_kw/res.config.settings/web_save (note: client URL /openeducat/settings renders client view, so API must reject writes).\n3. Attempt POST /api/v1/dataset/call_kw/op.student.withdrawal/refund_caution or modifying another student's record ID.",
         "All restricted API write/method calls return HTTP 403 Access Denied cleanly.",
         "checkModelAccess + allowedPortalMethods + cross-student ownership check in routes.ts."),
    ]


def build_workbook() -> None:
    meta = export_live_metadata()
    wb = Workbook()
    # Remove default sheet later after populating Dashboard on it
    ws_dash = wb.active
    ws_dash.title = "01_Dashboard"

    # Build Script Sheets 04..10 first in memory or track row ranges cleanly
    # Actually openpyxl allows creating sheets in exact desired tab order: 01, 02, 03, then 04..11!
    ws_arch = wb.create_sheet("02_Architecture_CheatSheet")
    ws_roles = wb.create_sheet("03_Roles_And_Seed_Data")

    pub_range = write_uat_sheet(
        wb,
        "04_UAT_Public_UI_Shell",
        "PUBLIC WEBSITE (18 ROUTES) & UNIVERSAL ERP UI SHELL — MANUAL UAT SCRIPTS",
        "Start here to verify the public facing academy website, admissions intake, eCommerce checkout, and every universal Odoo-style shell control.",
        build_public_and_shell_cases(),
    )
    adm_range = write_uat_sheet(
        wb,
        "05_UAT_Admin_53_Apps",
        "ADMINISTRATOR (OERB HQ + ALL 5 CAMPUSES) — ALL 53 APPS END-TO-END UAT SCRIPTS",
        "Complete walkthrough across Modules 1–53 including Wizards, LMS, AI Generators, Accounting/M-Pesa, Reports, Crons & System Integrations.",
        build_admin_cases(),
    )
    fac_range = write_uat_sheet(
        wb,
        "06_UAT_Faculty_35_Apps",
        "FACULTY (DR. KAMAU NJOROGE) — 35 APPS CLASSROOM, EXAMS & GRADEBOOK UAT SCRIPTS",
        "Verify daily academic delivery, attendance roll call, assignments, GradeBook, LMS authoring, thesis supervision & read-only financial guards.",
        build_faculty_cases(),
    )
    bo_range = write_uat_sheet(
        wb,
        "07_UAT_Backoffice_25_Apps",
        "BACKOFFICE (MRS. SUJATA YANAMANDRA) — 25 APPS REGISTRAR & BURSAR UAT SCRIPTS",
        "Verify intake enrollment, fee plans, invoice reconciliation, caution money refunds, E-Sign, HR compliance & helpdesk operations.",
        build_backoffice_cases(),
    )
    stu_range = write_uat_sheet(
        wb,
        "08_UAT_Student_Portal",
        "STUDENT PORTAL (/my, LMS PLAYER, ONLINE QUIZZES & 35 CARDS) — MANUAL UAT SCRIPTS",
        "Verify Aarav R. Shah's student portal experience: contact edits, 0%–100% LMS completion, graded online quizzes, M-Pesa, leave & support.",
        build_student_cases(),
    )
    par_range = write_uat_sheet(
        wb,
        "09_UAT_Parent_Portal",
        "PARENT PORTAL (/my & CHILD MONITORING) — MANUAL UAT SCRIPTS",
        "Verify Mr. Rajesh Shah's parent experience: child KPIs, read-only fee invoices, M-Pesa payment, meetings, E-Sign consent & notices.",
        build_parent_cases(),
    )
    neg_range = write_uat_sheet(
        wb,
        "10_UAT_Statutory_RBAC",
        "KENYAN STATUTORY POLICIES & NEGATIVE RBAC SECURITY SCRIPTS",
        "Adversarial checks proving Pupil's Pass gate, AS-Level 5-credit gate, Private IGCSE blocker, Overdue fines, and HTTP 403 RBAC isolation.",
        build_statutory_rbac_cases(),
    )

    # ------------------------------------------------------------------
    # Populate 01_Dashboard with live COUNTIF rollups
    # ------------------------------------------------------------------
    ws_dash.views.sheetView[0].showGridLines = True
    style_banner(
        ws_dash,
        "OPENEDUCAT SCHOOL ERP — MASTER UAT EXECUTION DASHBOARD & SYSTEM MASTERY TRACKER",
        "Live App: http://localhost:5175  |  API Docs: http://localhost:4100/api/docs  |  Seed Profile: Oshwal Academy (Nairobi & Mombasa / OERB)",
        8,
    )

    info_rows = [
        ("System Environment", "Vite React Frontend (:5175) -> Express 5 TypeScript Backend (:4100)"),
        ("Automated Test Baseline", "npm test (43 Vitest suites in tests/erp.test.ts + tests/reports_rbac.test.ts) | npm run build"),
        ("Recommended Test Order", "1) Reset clean seed (npm run seed:oshwal) -> 2) Public & UI Shell -> 3) Admin -> 4) Backoffice -> 5) Faculty -> 6) Student -> 7) Parent -> 8) Negative RBAC"),
    ]
    for idx, (k, v) in enumerate(info_rows, 4):
        ck = ws_dash.cell(row=idx, column=1, value=k)
        ck.font = Font(name="Calibri", size=10, bold=True, color=NAVY)
        ck.fill = PatternFill("solid", fgColor=CREAM)
        ck.border = CELL_BORDER
        ws_dash.merge_cells(start_row=idx, start_column=2, end_row=idx, end_column=8)
        cv = ws_dash.cell(row=idx, column=2, value=v)
        cv.font = Font(name="Calibri", size=10, color=SLATE_TEXT)
        cv.fill = PatternFill("solid", fgColor=CREAM)
        for col_i in range(2, 9):
            ws_dash.cell(row=idx, column=col_i).border = CELL_BORDER
        ws_dash.row_dimensions[idx].height = 20

    dash_headers = ["Suite Sheet", "Suite Title / Scope", "Primary Role", "Total Cases", "Passed", "Failed", "Blocked", "Not Run"]
    style_table_header(ws_dash, 8, dash_headers)

    suite_defs = [
        ("04_UAT_Public_UI_Shell", "Public Website (18 Routes) & Universal ERP Shell Controls", "Public / Admin", pub_range),
        ("05_UAT_Admin_53_Apps", "All 53 Apps, Wizards, Integrations & Configuration", "Admin", adm_range),
        ("06_UAT_Faculty_35_Apps", "Classroom, Timetable, Attendance, Exams, GradeBook & LMS (35 Apps)", "Faculty", fac_range),
        ("07_UAT_Backoffice_25_Apps", "Admissions Intake, Fee Billing, Caution Refund & HR Compliance (25 Apps)", "Backoffice", bo_range),
        ("08_UAT_Student_Portal", "Student /my Portal, Profile Edit, LMS Player, Online Quizzes & 35 Cards", "Student", stu_range),
        ("09_UAT_Parent_Portal", "Parent /my Portal, Child Monitoring, M-Pesa Payment & E-Sign", "Parent", par_range),
        ("10_UAT_Statutory_RBAC", "Kenyan Statutory Rules, Academic Entry Gates & HTTP 403 RBAC Tests", "All Roles", neg_range),
    ]

    for idx, (sname, desc, role, (r1, r2)) in enumerate(suite_defs):
        rn = 9 + idx
        rng = f"'{sname}'!$I${r1}:$I${r2}"
        vals = [
            sname,
            desc,
            role,
            f"=COUNTA('{sname}'!$A${r1}:$A${r2})",
            f'=COUNTIF({rng},"Pass")',
            f'=COUNTIF({rng},"Fail")',
            f'=COUNTIF({rng},"Blocked")',
            f'=COUNTIF({rng},"Not Run")',
        ]
        bg = WHITE if idx % 2 == 0 else PALE_BLUE
        for col_i, val in enumerate(vals, 1):
            c = ws_dash.cell(row=rn, column=col_i, value=val)
            c.font = Font(name="Calibri", size=10, bold=(col_i in (1, 4)), color=NAVY if col_i == 1 else SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
            c.alignment = Alignment(horizontal="center" if col_i >= 3 else "left", vertical="center")
        ws_dash.row_dimensions[rn].height = 22

    # Totals row
    tot_row = 16
    tot_vals = [
        "TOTAL",
        "Full ERP End-to-End UAT Coverage",
        "All 6 Personas",
        "=SUM(D9:D15)",
        "=SUM(E9:E15)",
        "=SUM(F9:F15)",
        "=SUM(G9:G15)",
        "=SUM(H9:H15)",
    ]
    for col_i, val in enumerate(tot_vals, 1):
        c = ws_dash.cell(row=tot_row, column=col_i, value=val)
        c.font = Font(name="Calibri", size=11, bold=True, color=WHITE)
        c.fill = PatternFill("solid", fgColor=DARK_NAVY)
        c.border = CELL_BORDER
        c.alignment = Alignment(horizontal="center" if col_i >= 3 else "left", vertical="center")
    ws_dash.row_dimensions[tot_row].height = 24

    # Pass rate KPI row
    ws_dash.cell(row=18, column=1, value="Overall Pass Rate %").font = Font(name="Calibri", size=11, bold=True, color=NAVY)
    pr_cell = ws_dash.cell(row=18, column=2, value='=IF(D16=0,0,E16/D16)')
    pr_cell.number_format = "0.0%"
    pr_cell.font = Font(name="Calibri", size=14, bold=True, color=PASS_FG)
    pr_cell.fill = PatternFill("solid", fgColor=PASS_BG)
    pr_cell.border = CELL_BORDER
    pr_cell.alignment = Alignment(horizontal="center", vertical="center")
    ws_dash.row_dimensions[18].height = 26

    dash_widths = [26, 54, 16, 13, 12, 12, 12, 12]
    for col_i, w in enumerate(dash_widths, 1):
        ws_dash.column_dimensions[get_column_letter(col_i)].width = w

    # ------------------------------------------------------------------
    # Populate 02_Architecture_CheatSheet
    # ------------------------------------------------------------------
    ws_arch.views.sheetView[0].showGridLines = True
    arch_headers = ["Layer / Topic", "Key Files & Symbols", "How It Works (Plain-English Architectural Mastery)", "What to Say If Asked 'How Does X Work?'"]
    style_banner(
        ws_arch,
        "SYSTEM ARCHITECTURE & 'EXPLAIN ANYTHING FROM SLEEP' CHEAT SHEET",
        "Master reference explaining every architectural pattern, API route, database behavior, security boundary, and statutory rule in the ERP.",
        len(arch_headers),
    )
    style_table_header(ws_arch, 4, arch_headers)

    arch_rows = [
        (
            "1. Metadata-Driven DSL",
            "shared/meta/dsl.ts\nshared/meta/models/*.ts\nshared/meta/menus.ts",
            f"All {meta['modelsCount']} ERP models, {len(meta['apps'])} Apps, {len(meta['publicRoutes'])} Public Routes, and {len(meta['portalCards'])} Portal Cards are declared once in concise TypeScript DSL (`defineModel`). It generates fields, view modes, notebook tabs, smart button queries, stage chevrons, action buttons, and OpenAPI docs dynamically.",
            "'Our ERP mirrors Odoo 19's view architecture: instead of hardcoding 400 forms, one UniversalModuleWorkspace renders List, Kanban, Form, Calendar, Pivot, and Graph dynamically from shared/meta.'"
        ),
        (
            "2. Frontend SPA Routing & Context",
            "client/context/ErpContext.tsx\nclient/App.tsx",
            "ErpContext manages logged-in user (persisted in localStorage `oe_uid` + `X-User-Id`), active campus selection (`X-Company-Ids`), CSS theme tokens (`applyThemeCss`), URL routing (`/`, `/web/login`, `/my`, `/openeducat/:app/:model/:id?view=`), and toast notifications.",
            "'When a user switches campus or logs into a demo role, ErpContext attaches X-User-Id and X-Company-Ids headers to every API call so data, menus, and theme colors update live.'"
        ),
        (
            "3. Generic RPC & Store Engine",
            "server/routes.ts (call_kw)\nserver/store.ts\nserver/methods.ts",
            "Every form and list talks through `POST /api/v1/dataset/call_kw/:model/:method` (`search_read`, `read_group`, `web_read`, `web_save`, `onchange`, `unlink`, `copy`, `name_search`, or workflow actions dispatched to `executeMethod()`). `store.hydrate()` resolves m2o labels, m2m chips, o2m child lines, and live `_smart_counts` domains.",
            "'Frontend forms behave just like Odoo's JSON-RPC dataset controller: `onchange` auto-fills dependent fields, `web_save` handles nested one2many lines atomically, and `web_read` loads chatter & smart button counts.'"
        ),
        (
            "4. RBAC & Multi-Campus Isolation",
            "shared/meta/security.ts\nFINANCIAL_MODELS\nPORTAL_SELF_SERVICE_MODELS",
            "Roles map deterministically: Admin (53 apps, root write), Faculty (35 apps, academic write, 403 on FINANCIAL_MODELS), Backoffice (25 apps, cannot unlink audit invoices/users), Student & Parent (/my portal, read backend + full CRUD on PORTAL_SELF_SERVICE_MODELS + `/api/v1/portal/profile`).",
            "'RBAC is enforced symmetrically on UI and API: ControlPanel/FormView hide restricted buttons and make forms read-only, while Express rejects unauthorized writes or cross-student tampering with HTTP 403.'"
        ),
        (
            "5. Admissions & Kenyan Statutory Gates",
            "server/methods.ts\nop.admission\nop.student.withdrawal",
            "Admissions runs a full pipeline with `onchange` auto-fill from Register, checks non-Kenyan `pupils_pass_no` before enrollment, checks 5-IGCSE-credit minimum on AS-Level entry, blocks Private IGCSE on practical lab subjects, triggers 5-Party E-Sign for valid private candidates, and computes 90-day notice caution refunds.",
            "'Every statutory Oshwal/Kenyan rule is enforced inside server business logic, not just UI hints—so even direct API calls cannot bypass Pupil's Pass or A-Level entry rules.'"
        ),
        (
            "6. LMS Player & Online Quizzes",
            "PublicWebsite.tsx (/courses, /online-exams)\nFormView.tsx (Quiz Runner)",
            "Admins/Faculty publish `op.course` + `op.course.module` (or use AI Course/Quiz Generators). Learners click Enroll (`op.course.enroll_learner`), which creates `op.course.enrollment` + one line per module. Toggling lessons recalculates `progress` (0–100%) on the backend automatically; quizzes auto-grade `op.quiz.result` via `get_action_submit` + `get_action_done`.",
            "'Course progress isn't faked in browser state: every lesson checkbox writes an `op.course.enrollment.line` row on the server, triggering automatic completion % calculation.'"
        ),
        (
            "7. Payments, M-Pesa & Reports Engine",
            "server/integrations.ts\nserver/reports/\nshared/meta/reports.ts",
            "Invoices support inline lines, partial/full M-Pesa Daraja 3.0 STK Push (`/api/v1/integrations/mpesa/stk-push`), manual Bank/Cash Register Payment modal creating `account.payment`, QWeb HTML/PDF reports (`/report/pdf/...` with Chromium PDF or interactive Print Modal fallback), BOM CSV, and genuine binary OOXML XLSX exports.",
            "'M-Pesa STK Push and Bank Register Payment both reconcile residual balances, update invoice ribbons (PARTIAL / PAID), log chatter receipts (`PAY/...`), and work with KRA eTIMS / QWeb invoice printing.'"
        ),
        (
            "8. Integrations & Automation",
            "SpecialWorkspaces.tsx\nSettingsPanelView\nres.config.settings",
            "Settings configures M-Pesa, WhatsApp Cloud/Sim, Africa's Talking SMS, SMTP Email, Google Meet/Teams/Zoom, SSO/OAuth 2.0, HMAC Webhooks, CAIE/Edexcel EDI JSON export, Document Layouts, Active Seed Switcher (`oshwal`/`default`), and Scheduled Actions (`ir.cron`). All 8 connectors include live `POST /api/v1/integrations/test` probes.",
            "'Every external adapter (Daraja, WhatsApp, SMS, SMTP, Meetings, SSO, Webhooks, AI) persists config on `res.config.settings`, runs cleanly in local simulation out-of-the-box, and has an interactive Test Connection flow.'"
        ),
    ]

    arch_widths = [24, 30, 62, 54]
    for idx, row in enumerate(arch_rows):
        rn = 5 + idx
        bg = WHITE if idx % 2 == 0 else PALE_BLUE
        for col_i, val in enumerate(row, 1):
            c = ws_arch.cell(row=rn, column=col_i, value=val)
            c.font = Font(name="Calibri", size=10, bold=(col_i == 1), color=NAVY if col_i == 1 else SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
            c.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
        ws_arch.row_dimensions[rn].height = estimate_row_height(list(row), arch_widths)
    for col_i, w in enumerate(arch_widths, 1):
        ws_arch.column_dimensions[get_column_letter(col_i)].width = w
    ws_arch.freeze_panes = "A5"

    # ------------------------------------------------------------------
    # Populate 03_Roles_And_Seed_Data
    # ------------------------------------------------------------------
    ws_roles.views.sheetView[0].showGridLines = True
    role_headers = ["Persona / Role", "Login Email / Button", "Landing URL", "Apps / Portal Scope", "Allowed Campuses", "Key Linked Seed Records & IDs", "Write / Security Boundaries"]
    style_banner(
        ws_roles,
        "USER ROLES, DEMO LOGINS, CAMPUSES & SEEDED TEST DATA DIRECTORY",
        "Exact Oshwal Academy (OERB) seeded users, campuses, and record identifiers available after `npm run seed:oshwal`.",
        len(role_headers),
    )
    style_table_header(ws_roles, 4, role_headers)

    role_rows = [
        ("Admin", "login: admin\nButton: Admin (OERB System Administrator)", "/openeducat/apps_menu", "All 53 Apps (100%)", "All 6 (OERB-HQ, Nursery, Primary, Junior High, Senior High, Mombasa)", "All records; Settings; Multi-Campus; Apps Store; AI Playground; Crons", "Unconditional root CRUD across all 408 models and all settings."),
        ("Faculty", "login: faculty@oshwalacademy.sc.ke\nButton: Faculty (Dr. Kamau Njoroge)", "/openeducat/apps_menu", "35 Academic & Teaching Apps", "Junior High (OAN-JNR), Senior High (OAN-SNR)", "op.faculty: Dr. Kamau Njoroge; op.session #1/#2; op.attendance.register OAN-Y10E-REG; gradebook GB/OAN/Y10/0001; op.quiz #1", "Full academic & personal HR CRUD; HTTP 403 & UI read-only on FINANCIAL_MODELS (Invoices, Payments, Purchases, Settings, Users)."),
        ("Backoffice", "login: backoffice@oshwalacademy.sc.ke\nButton: Backoffice (Mrs. Sujata Yanamandra)", "/openeducat/apps_menu", "25 Operational & Registrar Apps", "All 6 Campuses", "Head of Junior High hr.employee #1; Admissions AD0001–AD0005; E-Sign templates; Invoices via SIS->Students->Fees", "Full operational/student/fee billing & HR write access; blocked (HTTP 403) from deleting audit records (account.move, res.users)."),
        ("Student", "login: student@oshwalacademy.sc.ke\nButton: Student (Aarav R. Shah)", "/my", "Student Portal (/my, 35 Portal Cards, /courses, /online-exams)", "Junior High (OAN-JNR)", "op.student #1 (GR OAN/2026/0001, PIN 1001, Barcode OAN-0001, Library Card LCB0000001); Invoices INV/2026/0001 & 0002; LMS Year 10 IGCSE", "Self-service CRUD on 13 PORTAL_SELF_SERVICE_MODELS + `/api/v1/portal/profile`; HTTP 403 on op.student / account.move direct writes."),
        ("Parent", "login: parent@oshwalacademy.sc.ke\nButton: Parent (Mr. Rajesh Shah)", "/my", "Parent Portal (/my, 35 Portal Cards, /booking)", "Junior High (OAN-JNR)", "op.parent #1 linked to student Aarav R. Shah (#1); Fee Statements INV/2026/0001 (KES 305,000 Unpaid) & INV/2026/0002 (KES 25,000 Paid)", "Child-scoped view + M-Pesa STK Push + leave/grievance/E-sign/booking; HTTP 403 on backend admin models."),
        ("Public Visitor", "No login required\nURL: http://localhost:5175/", "/", "18 Public Website Routes", "Public multi-campus showcase", "5 Campuses, 5 Programs, 6 Courses, Shop Products, Digital Library, Events, Jobs, Forum, Booking", "Anonymous read + public intake submissions (Admissions apply, Contact CRM lead, Shop Cart order, Forum post, Job CV upload)."),
    ]
    role_widths = [16, 30, 22, 26, 26, 44, 44]
    for idx, row in enumerate(role_rows):
        rn = 5 + idx
        bg = WHITE if idx % 2 == 0 else PALE_BLUE
        for col_i, val in enumerate(row, 1):
            c = ws_roles.cell(row=rn, column=col_i, value=val)
            c.font = Font(name="Calibri", size=10, bold=(col_i == 1), color=NAVY if col_i == 1 else SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
            c.alignment = Alignment(horizontal="left", vertical="top", wrap_text=True)
        ws_roles.row_dimensions[rn].height = estimate_row_height(list(row), role_widths)

    # Campus quick reference below role table
    ws_roles.cell(row=13, column=1, value="SEEDED CAMPUSES & KEY CODES").font = Font(name="Calibri", size=11, bold=True, color=NAVY)
    style_table_header(ws_roles, 14, ["ID", "Code", "Campus / Entity Name", "City", "Head of School", "Board / Curricula", "M-Pesa / Compliance Key"])
    campuses = [
        (1, "OERB-HQ", "Oshwal Education & Relief Board (OERB)", "Nairobi", "Chairman: Mr. Suhash Ratilal Shah", "CAIE, Pearson Edexcel, BTEC, ASDAN", "Paybill 522522 | Compliance Warn: 60 days"),
        (2, "OAN-NUR", "Oshwal Academy Nairobi — Nursery", "Nairobi", "Ms. Rooma Mali", "EYFS (UK), Inclusive Education (IED)", "Early 15:00 dismissal interval"),
        (3, "OAN-PRI", "Oshwal Academy Nairobi — Primary", "Nairobi", "Ms. Kalpana Vora & SLT", "Cambridge Primary (Years 1–6) + Paid Clubs", "ASDAN IED Ages 7–20"),
        (4, "OAN-JNR", "Oshwal Academy Nairobi — Junior High", "Nairobi", "Mrs. Sujata Yanamandra", "KS3 & IGCSE (Years 7–11, 28 Subjects)", "Aarav R. Shah & Dr. Kamau home campus"),
        (5, "OAN-SNR", "Oshwal Academy Nairobi — Senior High", "Nairobi", "Senior High SLT / Mrs. Jyotsna Chotai", "AS/A-Level, Edexcel IAL, BTEC Level 3", "AS-Level 5-Credit Entry Gate | Zara Patel Non-Kenyan"),
        (6, "OAM-MBA", "Oshwal Academy Mombasa", "Mombasa", "Ms. Mildred Aseyo", "Nyali 14-Acre All-Through (Ages 2–18)", "Rohan Bhatt pending application"),
    ]
    for idx, crow in enumerate(campuses):
        rn = 15 + idx
        bg = WHITE if idx % 2 == 0 else CREAM
        for col_i, val in enumerate(crow, 1):
            c = ws_roles.cell(row=rn, column=col_i, value=val)
            c.font = Font(name="Calibri", size=10, color=SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
            c.alignment = Alignment(horizontal="center" if col_i in (1, 2, 4) else "left", vertical="center", wrap_text=True)
        ws_roles.row_dimensions[rn].height = 22
    for col_i, w in enumerate(role_widths, 1):
        ws_roles.column_dimensions[get_column_letter(col_i)].width = w
    ws_roles.freeze_panes = "A5"

    # ------------------------------------------------------------------
    # Populate 11_Full_53App_Reference_Catalog (Live Extracted)
    # ------------------------------------------------------------------
    ws_cat = wb.create_sheet("11_Full_53App_Catalog")
    ws_cat.views.sheetView[0].showGridLines = True
    cat_headers = ["App #", "App ID", "App Label", "Category", "Allowed Roles", "Default Landing", "Menu Count", "Complete Menu Tree (Group -> Menu Label -> Model / Action)"]
    style_banner(
        ws_cat,
        f"COMPLETE LIVE SYSTEM CATALOG — ALL {len(meta['apps'])} APPS, {len(meta['publicRoutes'])} PUBLIC ROUTES, {len(meta['portalCards'])} PORTAL CARDS & {meta['modelsCount']} MODELS",
        "Auto-extracted from dist/shared/meta/index.js so zero screens, menus, buttons, or reports are missed.",
        len(cat_headers),
    )
    style_table_header(ws_cat, 4, cat_headers)

    cat_widths = [8, 20, 22, 14, 24, 26, 11, 88]
    cur_row = 5
    for idx, app in enumerate(meta["apps"], 1):
        menu_lines = []
        for m in app["menus"]:
            target = m.get("action") and f"action:{m['action']}" or f"model:{m.get('model', '')}"
            view_hint = f" [{m['defaultView']}]" if m.get("defaultView") else ""
            menu_lines.append(f"[{m.get('group', app['label'])}] {m['label']} -> {target}{view_hint}")
        row_vals = [
            idx,
            app["id"],
            app["label"],
            app["category"],
            ", ".join(app["roles"]),
            app.get("defaultAction") or app.get("defaultModel") or "",
            len(app["menus"]),
            "\n".join(menu_lines),
        ]
        bg = WHITE if idx % 2 == 1 else PALE_BLUE
        for col_i, val in enumerate(row_vals, 1):
            c = ws_cat.cell(row=cur_row, column=col_i, value=val)
            c.font = Font(name="Calibri", size=9.5, bold=(col_i in (1, 3)), color=NAVY if col_i == 3 else SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
            c.alignment = Alignment(horizontal="center" if col_i in (1, 7) else "left", vertical="top", wrap_text=True)
        ws_cat.row_dimensions[cur_row].height = estimate_row_height(row_vals, cat_widths)
        cur_row += 1

    # Section 2: All 18 Public Website Routes
    cur_row += 2
    ws_cat.cell(row=cur_row, column=1, value=f"ALL {len(meta['publicRoutes'])} PUBLIC WEBSITE ROUTES (PUBLIC_ROUTES)").font = Font(name="Calibri", size=12, bold=True, color=NAVY)
    cur_row += 1
    style_table_header(ws_cat, cur_row, ["Route #", "URL Path", "Header Label", "Auth Required", "Primary Purpose / Action", "", "", ""])
    cur_row += 1
    for p_idx, pr in enumerate(meta["publicRoutes"], 1):
        pr_vals = [
            p_idx,
            pr["path"],
            pr["label"],
            "Yes (Student/Portal)" if pr.get("authRequired") else "Public / Open",
            "Live Frontend Website Route rendered by PublicWebsite.tsx",
            "", "", "",
        ]
        bg = WHITE if p_idx % 2 == 1 else PALE_BLUE
        for col_i, val in enumerate(pr_vals, 1):
            c = ws_cat.cell(row=cur_row, column=col_i, value=val)
            c.font = Font(name="Calibri", size=9.5, bold=(col_i == 2), color=SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
        ws_cat.row_dimensions[cur_row].height = 20
        cur_row += 1

    # Section 3: All 35 Student / Parent Portal Cards (/my)
    cur_row += 2
    ws_cat.cell(row=cur_row, column=1, value=f"ALL {len(meta['portalCards'])} STUDENT / PARENT PORTAL CARDS (/my — PORTAL_CARDS)").font = Font(name="Calibri", size=12, bold=True, color=NAVY)
    cur_row += 1
    style_table_header(ws_cat, cur_row, ["Card #", "Card ID", "Label", "Target Model", "Icon", "Description", "", ""])
    cur_row += 1
    for c_idx, pc in enumerate(meta["portalCards"], 1):
        pc_vals = [
            c_idx,
            pc["id"],
            pc["label"],
            pc.get("model") or "—",
            pc.get("icon") or "",
            pc.get("description") or "",
            "", "",
        ]
        bg = WHITE if c_idx % 2 == 1 else LIGHT_BLUE
        for col_i, val in enumerate(pc_vals, 1):
            c = ws_cat.cell(row=cur_row, column=col_i, value=val)
            c.font = Font(name="Calibri", size=9.5, bold=(col_i == 3), color=SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
        ws_cat.row_dimensions[cur_row].height = 20
        cur_row += 1

    # Section 4 on Catalog Sheet: All 408 Models & Their Workflows/Reports
    cur_row += 2
    ws_cat.cell(row=cur_row, column=1, value=f"ALL {meta['modelsCount']} METADATA MODELS (VIEWS, BUTTONS, SMART DRILL-DOWNS, TABS & BOUND REPORTS)").font = Font(name="Calibri", size=12, bold=True, color=NAVY)
    cur_row += 1
    mod_headers = ["#", "Technical Model", "Display Name", "Views", "Stage Field", "Form Action Buttons", "Smart Buttons", "Tabs / Reports"]
    style_table_header(ws_cat, cur_row, mod_headers)
    cur_row += 1

    reports_map = meta.get("reports", {})
    for m_idx, m in enumerate(meta["models"], 1):
        rep_names = [rp["name"] for rp in reports_map.get(m["name"], [])]
        tab_rep = f"Tabs: {', '.join(m['tabs'])}" if m["tabs"] else "Tabs: Standard Groups"
        if rep_names:
            tab_rep += f"\nReports: {', '.join(rep_names)}"
        m_vals = [
            m_idx,
            m["name"],
            m["string"],
            ", ".join(m["views"]),
            m.get("stageField") or "—",
            "; ".join(m["buttons"]) or "—",
            "; ".join(m["smart"]) or "—",
            tab_rep,
        ]
        bg = WHITE if m_idx % 2 == 1 else CREAM
        for col_i, val in enumerate(m_vals, 1):
            c = ws_cat.cell(row=cur_row, column=col_i, value=val)
            c.font = Font(name="Calibri", size=9, bold=(col_i == 2), color=SLATE_TEXT)
            c.fill = PatternFill("solid", fgColor=bg)
            c.border = CELL_BORDER
            c.alignment = Alignment(horizontal="center" if col_i == 1 else "left", vertical="top", wrap_text=True)
        ws_cat.row_dimensions[cur_row].height = estimate_row_height(m_vals, cat_widths)
        cur_row += 1

    for col_i, w in enumerate(cat_widths, 1):
        ws_cat.column_dimensions[get_column_letter(col_i)].width = w
    ws_cat.freeze_panes = "A5"

    OUT_XLSX_PATH.parent.mkdir(parents=True, exist_ok=True)
    wb.save(OUT_XLSX_PATH)
    print(f"Generated {OUT_XLSX_PATH} with {len(wb.sheetnames)} worksheets and {len(meta['apps'])} apps / {meta['modelsCount']} models.")


if __name__ == "__main__":
    build_workbook()
