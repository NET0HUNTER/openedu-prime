# SabiEdu — Next-Gen Multi-Campus School & Campus ERP

> **Intelligent, High-Performance School ERP** modeled on the OpenEduCat / Odoo 19 architecture with declarative metadata DSL, full Role-Based Access Control (RBAC), multi-campus scoping, integrated LMS, timetable auto-generation, QWeb PDF report engine, M-Pesa billing, and Kenya statutory compliance (Pupil's Pass, DCI Police Clearances, Oshwal Academy configurations).

---

## 🌟 Key Highlights

- **53 Unified Applications**: Complete academic, administrative, pastoral, and financial coverage from Admissions and Student Information System (SIS) to LMS, Exams, GradeBooks, Fleet, DMS, Helpdesk, and BI Dashboards.
- **408 Metadata-Driven Models**: Built with declarative TypeScript schemas with automated `web_search_read`, `call_kw`, `onchange`, and `web_save` ORM hooks.
- **Multi-Campus Architecture**: Instant hierarchical campus switching (`X-Company-Ids`) supporting multi-branch school networks (e.g. Nursery, Primary, Junior High, Senior High, and Regional Branches).
- **Public Website & Self-Service Portals**:
  - **18 Public Routes**: Online Admissions 7-step intake form, Course Catalogs, Digital Library, Shop & Cart, Booking & Consultations, Events, Careers/Job board, and Forum.
  - **Student Portal (`/my`)**: 35 self-service cards, interactive Course LMS Player (0%–100% progress tracking), online quizzes, timetables, and fee statements.
  - **Parent Portal (`/my`)**: Multi-child context switching, M-Pesa STK push billing, E-Sign digital liability waivers, and teacher meeting scheduler.
- **Academic & Statutory Guardrails**:
  - Automated non-Kenyan Pupil's Pass enforcement before enrollment.
  - British curriculum entry gates (Cambridge IGCSE 5-credit prerequisite for AS-Level/IAL).
  - 90-day withdrawal notice rule with Caution Money Refund credit notes (`out_refund`).
  - Strict financial write protection (HTTP 403) blocking faculty and portal users from mutating accounting ledgers.
- **OpenAPI 3.1 & QWeb Reports**: Interactive OpenAPI specification at `/api/docs`, printable QWeb invoices, exam hall tickets, marksheet transcripts, and employee/student ID badges with barcodes.

---

## 🚀 Quick Start

### 1. Prerequisites
- **Node.js** v20+ or v22+
- **npm** v10+

### 2. Installation
```bash
git clone https://github.com/NET0HUNTER/openedu-prime.git sabiedu
cd sabiedu
npm install
```

### 3. Seed Database
```bash
# Seed with comprehensive Oshwal Academy (Nairobi & Mombasa) dataset:
npm run seed:oshwal

# Or seed with minimal default starter profile:
npm run seed:default
```

### 4. Run Development Servers
```bash
# Run both Backend API and Vite Frontend with network exposure:
npm run dev

# Or run separately:
npm run dev:api    # Starts Express backend on http://0.0.0.0:4100
npm run dev:web    # Starts Vite frontend on http://0.0.0.0:5175 (Network accessible)
```

### 5. Access the Platform
- **Local Browser:** [http://localhost:5175](http://localhost:5175)
- **Local Network (LAN):** `http://<YOUR_LAN_IP>:5175` (e.g., `http://192.168.1.55:5175`)
- **OpenAPI 3.1 Docs:** [http://localhost:4100/api/docs](http://localhost:4100/api/docs)
- **OpenAPI JSON Spec:** [http://localhost:4100/openapi.json](http://localhost:4100/openapi.json)

---

## 👥 Demo Accounts & Pre-Configured Personas

| Persona / Role | Email | Password | Pre-Configured Scope |
|---|---|---|---|
| **System Administrator** | `admin@oshwalacademy.sc.ke` | `admin123` | All 53 Apps, Technical Settings, Crons, Integration Testers |
| **Faculty (Teacher)** | `prof.kamau@oshwal.ac.ke` | `faculty123` | 35 Teaching Apps, Classroom, Attendance, GradeBook, LMS |
| **Backoffice (Registrar/Bursar)** | `sujata.bursar@oshwal.ac.ke` | `bursar123` | 25 Operational Apps, Admissions, Fees Plans, HR Compliance |
| **Student (Aarav R. Shah)** | `student@oshwalacademy.sc.ke` | `student123` | `/my` Portal, 35 Cards, LMS Player, Online Quizzes, Leaves |
| **Parent (Mr. Rajesh Shah)** | `parent.shah@oshwal.ac.ke` | `parent123` | Child Overview, M-Pesa STK Push Billing, E-Sign Waivers |

---

## 📂 Project Structure

```
├── client/                     # React 18 + Tailwind CSS Frontend
│   ├── components/
│   │   ├── views/              # ControlPanel, KanbanView, ListView, FormView, Calendar
│   │   ├── public/             # PublicWebsite (18 routes & public admissions)
│   │   ├── special/            # Attendance Kiosk, Barcode Scanner, AI Playground, Timetable Generator
│   │   └── TopNavbar.tsx       # Systray, responsive More dropdown, Theme Customizer
│   └── lib/api.ts              # Generic call_kw JSON-RPC client
├── server/                     # Node.js Express 4 Backend Engine
│   ├── store.ts                # In-memory ORM with relational integrity & hydration
│   ├── routes.ts               # Generic call_kw dataset RPC & OpenAPI generators
│   ├── methods.ts              # Academic state machines, enrollments & caution refund rules
│   ├── integrations.ts         # M-Pesa Daraja, WhatsApp Cloud, SMTP, SMS, SSO & Meet connectors
│   └── seeds/                  # Declarative seed packs (Oshwal Academy & Default)
├── shared/                     # Isomorphic TypeScript Metadata
│   └── meta/                   # 53 Apps, 408 Models, 18 Public Routes, 35 Portal Cards, Reports
├── docs/                       # Comprehensive UAT Master Scripts Workbook (.xlsx)
└── scripts/                    # Automated UAT generator & test runner scripts
```

---

## 🧪 Testing & Quality Assurance

```bash
# Run backend vitest suite:
npm run test

# Run TypeScript typechecks:
npm run typecheck

# Regenerate master UAT Excel workbook:
python scripts/generate_uat_excel.py
```

---

## 📄 License
MIT License. Developed for enterprise multi-campus academy management.
