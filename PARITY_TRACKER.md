# OpenEduCat 19 Parity Tracker

Source of truth: live instance `https://21058239.o19.oeducat.org` (demo admin login).
The spec was extracted over Odoo JSON-RPC (`/web/webclient/load_menus`, `/web/action/load`,
`get_views`, `fields_get`), not from screenshots. Raw spec lives in [`docs/oec_spec/`](docs/oec_spec):

| File | Contents |
|---|---|
| `menus.json` | Raw live menu payload |
| `menu_tree.md` | Every app → submenu → action (model + view modes), 823 menu nodes, 533 actions |
| `menu_diff.md` | Automated diff of live menus vs our `shared/meta/menus.ts` (re-run: `npx tsx docs/oec_spec/menu_diff.ts`) |
| `<module>/*.xml` | Live view arch per model & view type (list/form/kanban/search/pivot/graph/calendar) |
| `<module>/*.fields.json` | Live `fields_get` (label, type, required, readonly, selection, relation, help) |
| `<module>/*.toolbar.json` | Form Action/Print menu entries |

**Legend:** `[ ]` not started · `[~]` in progress · `[x]` verified side-by-side (every page, form, tab, action).

> A module only gets `[x]` after every menu, view mode, form tab, smart button, statusbar
> transition, wizard and CRUD action has been compared against the live instance.

## Module order (priority)

| Status | Module (live app) | Live leaf menus | Missing menus locally | Model-name mismatches |
|---|---|---|---|---|
| [x] | Core shell: Apps menu, navbar, systray, breadcrumbs, control panel | – | 0 | 0 |
| [x] | Admissions | 9 | 0 | 0 |
| [x] | Students | 17 | 0 | 0 |
| [x] | SIS (Faculty, Parents, Courses, Batches, Programs, Config) | 57 | 0 | 0 |
| [x] | Class Attendances | 9 | 0 | 0 |
| [x] | Time Table | 5 | 0 | 0 |
| [x] | Exams | 11 | 0 | 0 |
| [x] | Grade Book | 15 | 0 | 0 |
| [x] | Assignments | 10 | 0 | 0 |
| [x] | Accounting (Fees / Invoicing) | 40 | 0 | 0 |
| [x] | LMS (backend + learner player) | 10 | 0 | 0 |
| [x] | Quiz | 9 | 0 | 0 |
| [x] | Library | 20 | 0 | 0 |
| [x] | Digital Library | 3 | 0 | 0 |
| [x] | Transportation | 9 | 0 | 0 |
| [x] | Campus | 4 | 0 | 0 |
| [x] | Settings & Integrations (General Settings, Users, Companies, Payment Providers, WhatsApp, Email, AIO providers/webhooks) | 5 | 0 | 0 |
| [x] | Thesis | 8 | 0 | 0 |
| [x] | OMR | 5 | 0 | 0 |
| [x] | Events | 10 | 0 | 0 |
| [x] | Placements | 10 | 0 | 0 |
| [x] | Alumni | 3 | 0 | 0 |
| [x] | Job | 4 | 0 | 0 |
| [x] | Job Queue | 3 | 0 | 0 |
| [x] | OnBoarding | 1 | 0 | 0 |
| [x] | Human Resources | 19 | 0 | 0 |
| [x] | Recruitment | 14 | 0 | 0 |
| [x] | Time Off | 13 | 0 | 0 |
| [x] | Expenses | 5 | 0 | 0 |
| [x] | Approvals | 5 | 0 | 0 |
| [x] | Fleet | 10 | 0 | 0 |
| [x] | Sales | 26 | 0 | 0 |
| [x] | Purchase | 10 | 0 | 0 |
| [x] | Inventory | 18 | 0 | 0 |
| [x] | CRM | 16 | 0 | 0 |
| [x] | Website | 42 | 0 | 0 |
| [x] | Email Marketing | 10 | 0 | 0 |
| [x] | Whatsapp | 12 | 0 | 0 |
| [x] | Live Chat | 10 | 0 | 0 |
| [x] | Surveys | 5 | 0 | 0 |
| [x] | Contacts | 9 | 0 | 0 |
| [x] | Discuss | 6 | 0 | 0 |
| [x] | Notice Board | 5 | 0 | 0 |
| [x] | Dashboards | 3 | 0 | 0 |
| [x] | KPI Dashboard | 4 | 0 | 0 |
| [x] | Calendar | 4 | 0 | 0 |
| [x] | Documents | 8 | 0 | 0 |
| [x] | E-sign | 4 | 0 | 0 |
| [x] | Automated Marketing | 4 | 0 | 0 |
| [x] | Multi Campus | 1 | 0 | 0 |
| [x] | Spreadsheets | 1 | 0 | 0 |
| [x] | Apps | 3 | 0 | 0 |
| [x] | AIO | 30 | 0 | 0 |
| [x] | Helpdesk | 10 | 0 | 0 |

All 53 live apps exist locally (no local-only apps). Per-menu gaps for every module are listed
in [`docs/oec_spec/menu_diff.md`](docs/oec_spec/menu_diff.md).

---

## Admissions — detailed audit `[~]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Admissions / Admission | `op.admission.register` | kanban, form, list | same | [x] verified |
| Admissions / Applications | `op.admission` | kanban, list, form, graph, pivot | same | [x] verified |
| Admissions / Course Change Request | `op.student.course.change.req` | list, form | same | [x] renamed & verified |
| Reporting / Admission Report | `admission.analysis` (wizard) | form | same | [x] verified |
| Reporting / Admission Analysis | `op.admission` | pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |
| Configuration / Admission Stages | `admission.stage` | list, form | same | [x] renamed & verified |
| Configuration / Admission Tags | `admission.tag` | list, form | same | [x] renamed & verified |
| Configuration / Admission Templates | `op.admission.customtemplate` | list, form | same | [x] renamed & verified |

### Admission Register (`op.admission.register`) — gaps vs live form/list/search
- [x] Header buttons: `Confirm` (draft) → `Start Application` (confirm) → `Start Admission` (application) → `Done` (admission); `Cancel` (draft, confirm); `Set to Draft` (cancel); `Reset to Draft` (not draft/cancel) with confirm dialog.
- [x] State selection: `draft,confirm,application,admission,cancel,done`.
- [x] Smart button: `Applications` (fa-id-card) → `op.admission` filtered by register with live count.
- [x] Dynamic ribbon: DRAFT, CONFIRMED, PUBLISHED, ADMISSION, DONE, CANCELLED based on register state.
- [x] Fields & tabs: `Configure Course Fees` tab (`admission_fees_line_ids`), boolean `registration_fees` & `register_product_id`.

### Applications (`op.admission`) — gaps
- [x] Statusbar stage: `stage_id` (`admission.stage`) synced with button actions.
- [x] Header buttons (by state): `Submit` (draft), `Confirm` (submit/online), `Send for Signature` (confirm), `Confirm Admin Signature` (sign_received), `Admission Confirm` (sign_confirmed), `Enroll` (admission), `Reject`, `Pending`, `Cancel`, `Set to Draft`, `Open Student Profile`.
- [x] State selection: draft, online, submit, confirm, pending, cancel, sent, sign_received, sign_confirmed, admission, reject, done.
- [x] Sheet header: avatar image (128×158) + `title` + inline First/Middle/Last name + email/phone rows with icons.
- [x] Notebook tabs: Admission Detail · Educational Detail · Personal Detail · Extra Information.
- [x] Smart button: `Similar Admissions`.
- [x] Kanban card: pipeline cards grouped by `stage_id` with applicant name, application number, course icon & name, email icon & email, and clock footer.

### Course Change Request (`op.student.course.change.req`)
- [x] Model renamed to exact live technical name `op.student.course.change.req`. State values: draft, course_change_fees, approve, cancel, reject.

### Configuration
- [x] Admission Stages (`admission.stage`): fields name, sequence, fold, state, view_boolean, company; seeded with all live stages.
- [x] Admission Tags (`admission.tag`) & Templates (`op.admission.customtemplate`): renamed and seeded.
- [x] Admission Report wizard (`admission.analysis`) model created.

---

## Students — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Students / Profile | `op.student` | kanban, list, form, activity | same | [x] verified |
| General / Activity Logs | `op.activity` | list, form, pivot, graph | same | [x] verified |
| General / Achievements | `op.achievement` | list, form, pivot, graph | same | [x] verified |
| General / Subject Registration | `op.subject.registration` | list, form, graph, pivot | same | [x] verified |
| General / Student Course Detail | `op.student.course` | list, form, pivot | same | [x] verified |
| General / Student Progression | `op.student.progression` | list, form, pivot, graph | same | [x] verified |
| General / Student Withdrawal Request | `op.student.withdrawal` | list, form | same | [x] verified |
| General / Student Leave Request | `student.leave.request` | calendar, kanban, list, form, search | same | [x] renamed & verified |
| Reporting / Activity Analysis | `op.activity` | pivot | same | [x] verified |
| Reporting / Achievement Analysis | `op.achievement` | pivot | same | [x] verified |
| Reporting / Subject Registration Analysis | `op.subject.registration` | pivot | same | [x] verified |
| Reporting / Student Course Analysis | `op.student.course` | pivot | same | [x] verified |
| Reporting / Student Progress Analysis | `op.student.progression` | pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |
| Configuration / Activity Types | `op.activity.type` | list, form | same | [x] verified |
| Configuration / Leave Type | `student.leave.type` | list, form | same | [x] renamed & verified |

### Students (`op.student`) — gaps vs live form/kanban
- [x] 14 Smart buttons: `Admission`, `Invoiced`, `Fees Plan Details`, `Assignment`, `Attendance`, `Activity`, `GradeBook`, `Placements`, `Job Post`, `Discipline`, `Media`, `Health`, `Parents`, `Leads`.
- [x] Sheet header layout: square avatar (128×158) + `title` + inline First/Middle/Last name + Email (`#1565C0`) & Phone (`#469408`) rows with icons.
- [x] Notebook tabs: `Other Information`, `Achievement`, `Skills`, `Alumni Details` (conditional on alumni_boolean), `Face Recognition` (`descriptor`, `image_detect`).
- [x] Kanban card: 85×85 square avatar, name (`1.15rem`), Email + Phone rows, `#gr_no` badge (`rgba(21,101,192,0.08)`), footer with "Courses" and "Fees Plans" buttons and activity box.

### Student Leave Request (`student.leave.request`) & Leave Type (`student.leave.type`)
- [x] Model renamed from `op.student.leave` to `student.leave.request`.
- [x] Model renamed from `op.student.leave.type` to `student.leave.type`.
- [x] State transitions: `draft` (To Submit) → `confirm` (To Validate) → `validate` (Validated) → `approve` (Approved), plus `refuse` (Refused), `cancel` (Cancelled), `action_draft` (Mark as Draft).
- [x] Kanban card: custom card with dynamic ribbon badges per status (`Draft`, `Confirm`, `Validate`, `Approved`, `Refused`, `Cancelled`), avatar, student name, leave type tag, date range, duration, description preview, and footer clock.

### Student Progression (`op.student.progression`)
- [x] State transitions: `draft` → `open` (In Progress) → `done` (Done) → `cancel` (Cancelled) with `state_draft` (Reset to Draft).
- [x] Notebook tabs: Activity, Transcript, Achievement, Assignment, Attendance, Discipline, Marksheet Lines.

### Student Withdrawal (`op.student.withdrawal`)
- [x] State transitions: `draft` → `submitted` → `processed` (In Process) → `approved` (Approved) → `cancel` (Cancelled).
- [x] Actions: `action_submitted`, `action_processed`, `action_approved`, `action_cancel`, `action_draft`.
- [x] Preserved statutory Kenya 90-day notice and caution money refund computation logic.

### Subject Registration (`op.subject.registration`)
- [x] State transitions: `draft` → `submitted` → `approved` / `rejected` / `change_requested`.
- [x] Actions: `action_submitted`, `action_approve`, `action_reject`, `action_reject_change`, `action_reset_draft`.
- [x] Preserved AS-Level 5-credit gate and private subject 5-party E-sign workflow.

---

## Class Attendances — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Class Attendances / Registers | `op.attendance.register` | kanban, list, form | same | [x] verified |
| Attendance / Registers | `op.attendance.register` | kanban, list, form | same | [x] verified |
| Attendance / Sheets | `op.attendance.sheet` | kanban, list, form, pivot, graph | same | [x] verified |
| Attendance / Attendance Lines | `op.attendance.line` | list, form, pivot, graph | same | [x] verified |
| Check In | client action `student_attendance_face_mode` | client | wizard_checkin | [x] verified |
| Kiosk Mode | client action `student_attendance_kiosk_mode` | client | kiosk_attendance | [x] verified |
| Reporting / Attendance Sheet Analysis | `op.attendance.sheet` | pivot | same | [x] verified |
| Reporting / Attendance Line Analysis | `op.attendance.line` | pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |
| Configuration / Attendance Type | `op.attendance.type` | list, form | same | [x] verified |

### Attendance Register (`op.attendance.register`)
- [x] Extracted live specs into `docs/oec_spec/attendance/op_attendance_register.*`.
- [x] Fields: `name`, `code`, `course_id`, `batch_id`, `section_id`, `subject_id`, `attendance_option`, `auto_create`, `auto_create_type`, `auto_create_if_session`, `company_id`, `user_id`, `color`, `sheet_count`, `active`.
- [x] Kanban card: auto-create frequency badge (`Daily`, `Weekly`, `Monthly`), course & batch pills, "Attendance Sheets" count trigger button.
- [x] Smart button: `Attendance Sheets` (`op.attendance.sheet:register_id`).

### Attendance Sheet (`op.attendance.sheet`)
- [x] Extracted live specs into `docs/oec_spec/attendance/op_attendance_sheet.*`.
- [x] Fields: `name`, `register_id`, `course_id`, `batch_id`, `session_id`, `faculty_id`, `attendance_date`, `subject_id`, `section_id`, `attendance_option`, `company_id`, `attendance_percentage`, `total_present`, `total_absent`, `excused_count`, `late_count`, `state`, `attendance_line`, `active`.
- [x] State transitions: `draft` → `start` (In Progress) → `done` (Attendance Taken) with `cancel` and `attendance_draft` (Reset to Draft).
- [x] Buttons: `enable_kiosk`, `attendance_start`, `attendance_done` / `take_attendance`, `attendance_cancel`, `attendance_draft` / `reset_attendance`.
- [x] Smart buttons: `Present` (`total_present`), `Absent` (`total_absent`), `Absent Excused` (`excused_count`), `Late` (`late_count`).
- [x] Kanban card: ribbon badges per state (`Draft`, `In Progress`, `Done`, `Cancelled`), date, course, batch, faculty, P/A summary badges, View and Start/Reset quick actions.
- [x] Preserved Kenyan WhatsApp absentee alert dispatching to parents on unexcused roll-call absence.

### Attendance Line (`op.attendance.line`) & Type (`op.attendance.type`)
- [x] Extracted live specs into `docs/oec_spec/attendance/op_attendance_line.*` and `docs/oec_spec/attendance/op_attendance_type.*`.
- [x] Editable grid lines with instant present/absent toggles, remarks, and check-in timestamp.
- [x] Full integration test suite passing (20/20) and production build passing 100%.

---

## Time Table — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Time Table | `op.session` | kanban, calendar, pivot | same | [x] verified |
| Timetable / Sessions | `op.session` | list, form | same | [x] verified |
| Timetable / Generate Timetable | `generate.time.table` (wizard) | form | same | [x] verified |
| Lesson Planning / Lesson Planning | `op.lesson` | calendar, list, form, pivot, graph | same | [x] verified |
| Reporting / Generate Timetable Report | `time.table.report` (wizard) | form | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |

### Sessions (`op.session`)
- [x] Extracted live specs into `docs/oec_spec/timetable/op_session.*` (7 views, 46 fields).
- [x] Fields: `name`, `timing`, `timing_slot`, `start_datetime`, `end_datetime`, `course_id`, `batch_id`, `subject_id`, `faculty_id`, `classroom_id`, `type`, `state`, `days`, `color`, `student_ids`, `lesson_ids`, `meeting_count`, `student_count`, `company_id`, `active`.
- [x] State transitions: `draft` → `confirm` (Confirmed) → `done` (Done) with `cancel` and `lecture_draft` (Reset to Draft).
- [x] Buttons: `lecture_confirm`, `lecture_done`, `lecture_draft`, `lecture_cancel`.
- [x] Smart buttons: `Attendance Sheet` (`op.attendance.sheet:session_id`).
- [x] Kanban card: grouped by `days` (Monday through Sunday) with status ribbon badges (`Draft`, `Confirmed`, `Done`, `Cancelled`), timing header, subject icon/label, course, batch, faculty, classroom, time interval, and type badge.

### Lesson Planning (`op.lesson`)
- [x] Extracted live specs into `docs/oec_spec/timetable/op_lesson.*` (7 views, 31 fields).
- [x] Fields: `name`, `course_id`, `batch_id`, `subject_id`, `faculty_id`, `start_datetime`, `end_datetime`, `session_ids`, `lesson_topic`, `state`, `company_id`, `active`.
- [x] State transitions: `draft` → `plan` (Planned) → `conduct` (Conducted) with `lesson_cancel` and `lesson_draft` (Set to Draft).
- [x] Buttons: `lesson_plan`, `lesson_conduct`, `lesson_cancel`, `lesson_draft`.

### Timetable Generation & Reports
- [x] `generate.time.table` wizard: fields `course_id`, `batch_id`, `start_date`, `end_date`, `skip_conflicts`, with button `act_gen_time_table` auto-generating weekly sessions across weekdays.
- [x] `time.table.report` wizard: fields `state`, `course_id`, `batch_id`, `faculty_id`, `start_date`, `end_date`, with print handler `gen_time_table_report`.
- [x] Full integration test suite passing (21/21) and production build passing 100%.

---

## Exams — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Exams | `op.exam.session` | list, form, calendar, pivot | same | [x] verified |
| Exams / Exam Sessions | `op.exam.session` | list, form, calendar, pivot | same | [x] verified |
| Exams / Exams | `op.exam` | list, form, calendar, pivot | same | [x] verified |
| Exams / Exam Attendees | `op.exam.attendees` | list, form, pivot | same | [x] verified |
| Exams / Result Templates | `op.result.template` | list, form | same | [x] verified |
| Exams / Marksheet Registers | `op.marksheet.register` | list, form | same | [x] verified |
| Exams / Marksheet Lines | `op.marksheet.line` | list, form, pivot | same | [x] verified |
| Exams / Result Lines | `op.result.line` | list, form | same | [x] added & verified |
| Reporting / Result Analysis | `op.result.line` | graph | same | [x] added & verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |
| Configuration / Exam Types | `op.exam.type` | list, form | same | [x] verified |
| Configuration / Exam Rooms | `op.exam.room` | list, form | same | [x] verified |

### Exam Sessions (`op.exam.session`)
- [x] Extracted live specs into `docs/oec_spec/exams/op_exam_session.*` (7 views, 37 fields).
- [x] Fields: `name`, `exam_code`, `course_id`, `batch_id`, `exam_type`, `year_id`, `term_id`, `start_date`, `end_date`, `venue`, `evaluation_type` (`normal`, `grade`, `gpa`, `cwa`, `cce`), `exam_board` (`CAIE`, `Edexcel`, `Internal`), `exams_count`, `state`, `active`.
- [x] State transitions: `draft` → `schedule` (Scheduled) → `held` (Held) → `done` (Done) with `cancel` and `act_draft` (Reset to Draft).
- [x] Buttons: `act_schedule`, `act_held`, `act_done`, `act_cancel`, `act_draft`.
- [x] Smart buttons: `Exams` (`op.exam:session_id`).

### Exams (`op.exam`)
- [x] Extracted live specs into `docs/oec_spec/exams/op_exam.*` (7 views, 41 fields).
- [x] Fields: `name`, `exam_code`, `session_id`, `subject_id`, `faculty_id`, `room_id`, `grading_assignment_id`, `start_time`, `end_time`, `total_marks`, `min_marks`, `attendees_count`, `results_entered`, `note`, `state`, `active`.
- [x] State transitions: `draft` → `schedule` → `held` → `result_updated` (Results Updated) → `done` with `cancel` and `act_draft`.
- [x] Buttons: `act_schedule`, `act_held`, `act_result_updated`, `act_done`, `act_cancel`, `act_draft`.
- [x] Smart buttons: `Attendees` (`op.exam.attendees:exam_id`).

### Exam Attendees (`op.exam.attendees`) & Rooms (`op.exam.room`)
- [x] Extracted live specs into `docs/oec_spec/exams/op_exam_attendees.*` and `docs/oec_spec/exams/op_exam_room.*`.
- [x] Roster tracking with student seat allocation, status (`present`/`absent`), raw score marks, and room capacity.

### Marksheets & Results Pipeline
- [x] `op.result.template`: Automated generation (`generate_result`) creating `op.marksheet.register`, aggregate student `op.marksheet.line`, and per-exam `op.result.line` entries.
- [x] `op.marksheet.register`: Validation workflow (`action_validate`), pass/fail metrics, and progression transcript synchronization.
- [x] `op.result.line`: Multi-scheme scoring (`marks`, `grade`, `grade_point`, `credit`, `qp`) with QWeb graph analytics.
- [x] Full integration test suite passing (22/22) and production build passing 100%.

---

## Grade Book — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Grade Book / Grading Assignment | `grading.assignment` | kanban, list, form | same | [x] verified |
| Grade Book / Grade Book | `gradebook.gradebook` | list, form | same | [x] verified |
| Reporting / Gradebook Excel Report | `grading.wizard` (wizard) | form | same | [x] added & verified |
| Reporting / Grade By Course | `op.course` | list, form, pivot | same | [x] verified |
| Reporting / Grade By Batch | `op.batch` | list, form, pivot | same | [x] verified |
| Reporting / Grade By Subject | `op.subject` | list, form | same | [x] verified |
| Reporting / Grades Analysis | `gradebook.line` | list, form, pivot | same | [x] verified |
| Reporting / Honor Roll | `op.honorroll` | list, form | same | [x] renamed & verified |
| Reporting / Grade By Report | client action `grade_book_grid_by_assignment` | client | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |
| Configuration / Assignment / Assignment Stages | `assignment.stage` | list, form | same | [x] renamed & verified |
| Configuration / Assignment / Assignment Types | `grading.assignment.type` | list, form | same | [x] verified |
| Configuration / Assignment / Grade Table | `op.grade.table` | list, form | same | [x] added & verified |
| Configuration / Course / Grade Scale | `op.grade.scale` | list, form | same | [x] verified |
| Configuration / Course / Grade Template | `op.grade.template` | list, form | same | [x] added & verified |

### Grading Assignment (`grading.assignment`)
- [x] Extracted live specs into `docs/oec_spec/gradebook/grading_assignment.*` (6 views, 51 fields).
- [x] Fields: `sequence`, `name`, `course_id`, `batch_id`, `subject_id`, `faculty_id`, `assignment_type`, `grade`, `point`, `year_id`, `term_id`, `issued_date`, `state`, `active`.
- [x] State transitions: `draft` → `published` (Published) → `grading_started` (Grading Started) → `grading_closed` (Grading Closed) → `grades_published` (Grades Published) with `cancelled` and `action_draft`.
- [x] Buttons: `action_published`, `action_grading_started`, `action_grading_closed`, `action_grades_published`, `action_cancelled`, `action_draft`.
- [x] Smart buttons: `Grade` (`gradebook.line:assignment_id`), `Statistics`.

### Grade Book (`gradebook.gradebook`)
- [x] Extracted live specs into `docs/oec_spec/gradebook/gradebook_gradebook.*` (6 views, 47 fields).
- [x] Fields: `name`, `student_id`, `course_id`, `academic_year_id`, `grade_scale_id`, `percentage`, `grade`, `report_type`, `line_ids`, `state`, `active`.
- [x] State transitions: `draft` → `inprogress` (In Progress) → `publish` (Published) with `cancelled` and `action_draft`.
- [x] Buttons: `action_inprogress`, `action_publish`, `recompute_data`, `student_Grade_override`, `action_cancelled`, `action_draft`.
- [x] Smart buttons: `Statistics`, `GradeBook` (`gradebook.line:gradebook_id`).

### Honor Roll (`op.honorroll`)
- [x] Model renamed to exact live technical name `op.honorroll`.
- [x] Fields: `name`, `student_id`, `course_id`, `year_id`, `subject_id`, `from_per`, `to_per`, `percentage`, `award_tier`, `description`, `state`, `active`.
- [x] Actions: `generate_honor_roll`, `action_cancel`, `action_draft`.

### Configuration Models & Wizards
- [x] `assignment.stage`: renamed to exact live technical name with `sequence`, `fold`, `state`.
- [x] `op.grade.table` & `op.grade.table.line`: defined with threshold boundaries and letter conversions.
- [x] `op.grade.scale` & `op.grade.scale.line`: active toggle workflow (`action_set_active`, `action_draft`).
- [x] `op.grade.template` & `grading.wizard`: grade template and Excel export wizard.
- [x] Full integration test suite passing (23/23) and production build passing 100%.

---

## Assignments — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Assignments / Assignments | `op.assignment` | list, form, pivot, graph | same | [x] verified |
| Assignments / Submissions | `op.assignment.sub.line` | list, form, pivot, graph | same | [x] verified |
| Reporting / Assignment Analysis | `op.assignment` | pivot | same | [x] verified |
| Reporting / Submission Analysis | `op.assignment.sub.line` | pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |
| Configuration / Assignment Types | `grading.assignment.type` | list, form | same | [x] verified |
| Configuration / Rubrics Template | `op.rubric.template` | list, form | same | [x] verified |
| Configuration / Assignment Grades | `op.assign.grade.config` | list, form | same | [x] added & verified |
| Configuration / Rubrics Level | `op.rubric.level` | list, form | same | [x] added & verified |
| Configuration / Late Submission | `late.submission` | list, form | same | [x] verified |

### Assignments (`op.assignment`)
- [x] Extracted live specs into `docs/oec_spec/assignments/op_assignment.*` (6 views, 71 fields).
- [x] Fields: `name`, `sequence`, `course_id`, `batch_id`, `subject_id`, `faculty_id`, `reviewer`, `assignment_type`, `grading_assignment_id`, `year_id`, `term_id`, `late_submission_id`, `company_id`, `attempt_type`, `attempt`, `max_attempt`, `grade`, `issued_date`, `submission_date`, `evaluation_type` (`mark`, `grade`), `marks`, `point`, `rubric_template_id`, `final_assessment_attempt_criteria`, `points_validation_status`, `allocation_ids`, `assignment_sub_line_count`, `missing_student_count`, `active`, `description`, `state`.
- [x] State transitions: `draft` → `publish` (Published) → `finish` (Finished) with `cancel` and `act_set_to_draft` (Reset to Draft).
- [x] Buttons: `act_publish`, `act_finish`, `update_mark`, `act_cancel`, `act_set_to_draft`.
- [x] Smart buttons: `Submissions` (`op.assignment.sub.line:assignment_id`).
- [x] Notebook tabs: Basic Information, Student Allocation, Outcome (`co_map_ids`), Student Additional Attempt, Missing Submissions.
- [x] Kanban card: `renderAssignmentCard` with sequence pill, name, subject icon, course, batch, submission due date, and submissions count badge.

### Submissions (`op.assignment.sub.line`)
- [x] Extracted live specs into `docs/oec_spec/assignments/op_assignment_sub_line.*` (6 views, 42 fields).
- [x] Fields: `assignment_id`, `student_id`, `submission_date`, `marks`, `penalty`, `obtained_mark`, `late_submit`, `progression_id`, `grade_table_id`, `grade_table_line_id`, `grades_id`, `rubric_template_id`, `rubric_type`, `assessment_attempt_line_count`, `description`, `note`, `state`, `company_id`, `active`.
- [x] State transitions: `draft` → `submit` (Submitted) → `to_assess` (To Assess) → `accept` (Accepted) / `reject` (Rejected) / `change` (Change Required) / `ignore` (Ignore).
- [x] Buttons: `act_submit`, `act_to_assess`, `act_accept`, `act_change_req`, `act_reject`, `act_draft` (Resubmit), `action_open_pdf_view`, `ignore_submission_attempt`, `annotate_submission`.
- [x] Smart buttons: `Assessment Attempts` (`op.assessment.attempt:assignment_sub_line_id`).

### Rubrics & Grading Config
- [x] `op.rubric.template`: Lifecycle transitions (`draft` → `in_use` → `expire` / `cancel` / `re_open`), `action_expire_template` with expiration timestamp and audit trail.
- [x] `op.rubric.element`: Criteria points and percentage breakdown lines.
- [x] `op.rubric.level`: Scoring tier configurations (`Exemplary`, `Competent`, `Threshold`).
- [x] `op.assign.grade.config`: Grade thresholds and qualitative classifications.
- [x] `late.submission` & `late.submission.line`: Multi-tier penalty rules (`no_of_days`, `penalty_type`, `penalty`).
- [x] Full integration test suite passing (24/24) and production build passing 100%.

---

## Accounting (Fees / Invoicing) — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| Invoicing / Overview | `account.journal` | kanban, form | same | [x] verified |
| Customers / Invoices | `account.move` | list, kanban, form, activity | same | [x] verified |
| Customers / Credit Notes | `account.move` | list, kanban, form, activity | same | [x] verified |
| Customers / Payments | `account.payment` | list, kanban, form, activity | same | [x] verified |
| Customers / Batch Payments | `account.batch.payment` | list, form | same | [x] added & verified |
| Customers / Follow-up Reports | `res.partner` | list, form | same | [x] verified |
| Customers / Products | `product.template` | kanban, list, form | same | [x] verified |
| Customers / Customers | `res.partner` | kanban, list, form | same | [x] verified |
| Vendors / Bills | `account.move` | list, kanban, form, activity | same | [x] verified |
| Vendors / Refunds | `account.move` | list, kanban, form, activity | same | [x] verified |
| Vendors / Payments | `account.payment` | list, kanban, form, activity | same | [x] verified |
| Vendors / Batch Payments | `account.batch.payment` | list, form | same | [x] added & verified |
| Vendors / Employee Expenses | `hr.expense` | list, kanban, form | same | [x] verified |
| Vendors / Products | `product.template` | kanban, list, form | same | [x] verified |
| Vendors / Vendors | `res.partner` | kanban, list, form | same | [x] verified |
| Accounting / Miscellaneous / Journal Entries | `account.move` | list, kanban, form | same | [x] verified |
| Accounting / Miscellaneous / Journal Items | `account.move.line` | list, pivot, graph | same | [x] verified |
| Accounting / Miscellaneous / Sales | `account.move` | list, form | same | [x] verified |
| Accounting / Miscellaneous / Purchases | `account.move` | list, form | same | [x] verified |
| Accounting / Miscellaneous / Bank and Cash | `account.move` | list, form | same | [x] verified |
| Accounting / Actions / Lock Dates | `account.change.lock.date` | form | same | [x] added & verified |
| Accounting / Assets / Asset Requests | `account.asset.request` | list, form | same | [x] added & verified |
| Accounting / Assets / Assets | `account.asset.asset` | list, form | same | [x] added & verified |
| Accounting / Assets / Generate Asset Entries | `asset.depreciation.confirmation.wizard` | form | same | [x] added & verified |
| Review / Review / 1099 Report | `l10n_us_1099.wizard` | form | same | [x] added & verified |
| Reporting / Invoice Analysis | `account.invoice.report` | pivot, graph | same | [x] added & verified |
| Reporting / Analytic Items | `account.analytic.line` | list, pivot, graph | same | [x] added & verified |
| Reporting / Asset Analysis | `asset.asset.report` | graph, pivot | same | [x] added & verified |
| Configuration / Settings | `res.config.settings` | form | settings_panel | [x] verified |
| Configuration / Invoicing / Payment Terms | `account.payment.term` | list, form | same | [x] added & verified |
| Configuration / Invoicing / Fees Terms | `op.fees.terms` | list, form | same | [x] verified |
| Configuration / Invoicing / Fees Element | `op.fees.element` | list, form | same | [x] verified |
| Configuration / Invoicing / Asset Category | `account.asset.category` | list, form | same | [x] added & verified |
| Configuration / Invoicing / Asset Request Reason | `asset.request.reason` | list, form | same | [x] added & verified |
| Configuration / Accounting / Chart of Accounts | `account.account` | list, form | same | [x] added & verified |
| Configuration / Accounting / Taxes | `account.tax` | list, form | same | [x] added & verified |
| Configuration / Accounting / Journals | `account.journal` | list, form | same | [x] verified |
| Configuration / Accounting / Currencies | `res.currency` | list, form | same | [x] added & verified |
| Configuration / Accounting / Fiscal Positions | `account.fiscal.position` | list, form | same | [x] added & verified |
| Configuration / Accounting / Journal Groups | `account.journal.group` | list, form | same | [x] added & verified |

### Invoices & Credit Notes (`account.move`)
- [x] Extracted live specs into `docs/oec_spec/accounting/account_move.*` (122 fields, 4 views).
- [x] Header statusbar states: `draft` (Draft) → `posted` (Posted) / `cancel` (Cancelled) with payment tracking (`not_paid`, `in_payment`, `paid`, `partial`, `reversed`).
- [x] Header action buttons: `action_post`, `action_register_payment`, `action_reverse`, `button_cancel`, `button_draft`, `action_invoice_sent`, `action_print_pdf`.
- [x] Smart buttons: `Payments` (`account.payment:move_id`).
- [x] Notebook tabs: Invoice Lines (`invoice_line_ids`), Journal Items (`line_ids`), Other Info (`invoice_user_id`, `payment_reference`, `fiscal_position_id`), Kenyan Statutory Information (M-Pesa STK push reference, Caution Money refund clearance, Pupil's pass fee reconciliation).

### Payments (`account.payment`)
- [x] Extracted live specs into `docs/oec_spec/accounting/account_payment.*` (68 fields).
- [x] Statusbar states: `draft`, `in_process`, `paid`, `cancel`, `rejected`.
- [x] Buttons: `action_post`, `action_validate`, `action_reject`, `action_draft`, `action_cancel`, `action_refund_wizard`.
- [x] Payment registration domain logic in `server/methods.ts`: settles invoice balance, records payment reference, recomputes `amount_residual` and `payment_state`.

### Fixed Assets (`account.asset.asset` & `account.asset.request`)
- [x] Statusbar & progressbar workflows: `draft` → `approved` → `allocated` → `returned` / `rejected`.
- [x] Depreciation engine: `compute_depreciation_board` domain method.
- [x] Full test suite (25/25) and TypeScript/Vite production build passing cleanly.

---

## LMS (backend + learner player) — detailed audit `[x]`

Live menus (from `menu_tree.md`):

| Menu | Live model | Live views | Local model | Status |
|---|---|---|---|---|
| LMS / Dashboard | `op.course` | kanban, list, form | same | [x] verified |
| LMS / Course Modules | `op.course.module` | list, form, kanban | same | [x] verified |
| Reporting / Summary | `lms.stats.dashboard` (client action) | dashboard | `lms_summary` | [x] added & verified |
| Reporting / Course Participation | `op.course.enrollment` | graph, list, pivot | same | [x] added & verified |
| Reporting / Course Profile Report | `op.course` | pivot | same | [x] verified |
| Reporting / Quiz Participation Report | `op.quiz` | list | same | [x] added & verified |
| Reporting / Quiz Statistics | `op.quiz.result` | graph | same | [x] added & verified |
| Reporting / Forum Participation | `op.course` | graph | same | [x] added & verified |
| Configuration / Tags | `op.course.tag` | list | same | [x] verified |
| Configuration / Category | `op.course.category` | list, form | same | [x] verified |
| LMS Course Generator | `lms_course_generator` (client action) | AI generator | `lms_course_generator` | [x] added & verified |

### Course (`op.course`)
- [x] Extracted live specs into `docs/oec_spec/lms/op_course.*` (128 fields, 6 views).
- [x] Live statusbar states: `draft` (Draft) → `open` (Confirm) → `closed` (Closed).
- [x] Header action button: `create_online_course` (sets `online_course_created`, `online_course`, `is_lms_published`, `website_published`, transitions to `open`, and initializes curriculum outline).
- [x] Smart buttons: `Subjects`, `LMS Course` (`op.course.module:course_id`), `Faculties`, `Students`, `Assignment`, `Course Credit`, `Time Table`, `GradeBook`, `Enrollments` (`op.course.enrollment:course_id`).
- [x] Notebook tabs: Content (`module_lines`), Subjects (`subject_ids`), Categories (`category_ids`), Grading (`grade_scale_id`, `grade_template_ids`), Enrollments (`enrollment_line`), Options (`evaluation_type`, `fees_term_id`, `min_unit_load`, `max_unit_load`, `is_lms_published`, `tag_ids`), Description (`short_desc`, `full_description`).
- [x] Kanban card: `renderCourseCard` matching `op_course.kanban.xml` with dynamic state ribbons (`Archived`, `Draft`, `Confirmed`, `Published`, `Closed`), hashtag course code, category badges, Enrolled count button with smart drilldown to `op.course.enrollment`, Lessons count button with smart drilldown to `op.course.module`, Duration in hours, and Rating stars with count.

### Course Modules & Curriculum (`op.course.module`)
- [x] Extracted live specs into `docs/oec_spec/lms/op_course_module.*` (77 fields, 6 views).
- [x] Content categories (`module_category`): `infographic` (Image), `article` (Article), `document` (Document), `video` (Video), `audio` (Audio), `quiz` (Quiz).
- [x] Sources (`source_type`): `local_file` (Upload from Device), `external` (Retrieve from Google Drive).
- [x] Media fields: `video_type` (`url`, `upload`), `video_url`, `audio_type`, `audio_url`, `document_name`, `document_binary_content`, `image_binary_content`, `embed_code`, `completion_time`, `quiz_id`.
- [x] Workflow buttons: `act_publish` and `act_unpublish`.
- [x] Kanban card: `renderCourseModuleCard` with category pill, title, course tag, duration, and publication status.

### Learner Enrollment & Progress Player (`op.course.enrollment` & `op.course.enrollment.line`)
- [x] Extracted live specs into `docs/oec_spec/lms/op_course_enrollment.*` (19 fields) and `op_course_enrollment_line.*`.
- [x] Enrollment lifecycle: `draft` → `in_progress` → `done`.
- [x] Learner enrollment method: `op.course.enroll_learner` creates enrollment, generates `op.course.enrollment.line` per course module, and increments course enrollment count.
- [x] Completion workflows: `action_complete` (sets `state = 'done'`, `progress = 100`, records completion timestamp, and marks all enrollment lines done), `action_reset` (resets to draft).
- [x] Kanban card: `renderEnrollmentCard` with learner name, course title, status badge, and completion progress bar.

### Course Generator & AI Syllabus
- [x] Action route `lms_course_generator` wired to AI Course Syllabus generator.
- [x] Action route `lms_summary` wired to LMS Executive Dashboard.
- [x] Full test suite passing (26/26) and production build passing with 0 errors.

---

## Module 11: Quiz `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`quiz` app).
Extracted specs live in `docs/oec_spec/quiz/` for 9 models:
- `op.quiz` (110 fields, 6 views)
- `op.quiz.line` (42 fields, 6 views)
- `op.quiz.result` (90 fields, 6 views)
- `op.quiz.result.line` (39 fields, 6 views)
- `op.question.bank` (18 fields, 6 views)
- `op.quiz.category` (15 fields, 6 views)
- `op.answer.grade` (14 fields, 6 views)
- `op.question.bank.type` (14 fields, 6 views)
- `op.quiz.config` (14 fields, 6 views)

### Leaf Menus (9/9 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Quiz / Quiz | `op.quiz` | list, form, kanban, pivot | same | [x] verified |
| Quiz / Results | `op.quiz.result` | list, pivot, form, graph | same | [x] verified |
| Question Bank / Question Bank | `op.question.bank` | list, form | same | [x] verified |
| Reporting / Quiz Result Analysis | `op.quiz.result` | graph, pivot | same | [x] verified |
| Configuration / Settings | `op.quiz.config` | list, form | same | [x] verified |
| Configuration / Quiz Category | `op.quiz.category` | list, form | same | [x] verified |
| Configuration / Grades | `op.answer.grade` | list, form | same | [x] verified |
| Configuration / Question Bank Type | `op.question.bank.type` | list, form | same | [x] verified |
| AI Quiz Generator | `quiz_ai_view` (client action) | AI generator | `quiz_ai_view` | [x] added & verified |

### Quiz Lifecycle & Statusbar (`op.quiz`)
- [x] Extracted live specs into `docs/oec_spec/quiz/op_quiz.*`.
- [x] Statusbar states: `draft` (Draft) → `open` (Confirm) → `done` (Done) / `cancel` (Closed).
- [x] Header action buttons:
  - `action_confirm`: Confirm quiz, activate, transition `draft` → `open`.
  - `view_quiz`: View exam / preview questions modal.
  - `action_done`: Transition `open` → `done`.
  - `action_cancel`: Close quiz, transition `open` → `cancel`.
  - `action_draft`: Re-open quiz, transition `cancel` → `draft`.
- [x] Smart buttons: `total_quiz` ("Resullt" stat button linking to `op.quiz.result:quiz_id`).
- [x] Notebook tabs: Questions (`line_ids`), Configuration (`time_config`, `time_limit_hr`, `time_limit_minute`, `single_page`, `prev_allow`, `show_answer`), Result Message, Description.

### Quiz Questions (`op.quiz.line`)
- [x] Extracted live specs into `docs/oec_spec/quiz/op_quiz_line.*`.
- [x] Question types (`que_type`): `optional` (Single Choice), `multiple_choice` (Multiple Choice), `descriptive` (Descriptive), `blank` (Fill in the Blanks), `match_following` (Match Following), `numeric` (Numeric).
- [x] Scoring & grades: `mark`, `grade_true_id`, `grade_false_id`, `bank_id`.

### Quiz Results & Grading (`op.quiz.result` & `op.quiz.result.line`)
- [x] Extracted live specs into `docs/oec_spec/quiz/op_quiz_result.*`.
- [x] Result statusbar states: `open` (In Progress) → `hold` (On Hold) → `submit` (Submitted) → `asses` (To Assess) → `done` (Done).
- [x] Header action buttons:
  - `get_action_submit`: Student submits attempt, records `submit_date`.
  - `get_action_asses`: Faculty / evaluator moves attempt to assessment (`asses`).
  - `get_action_done`: Finalizes grading, auto-sums line marks to `received_marks`, auto-calculates `score = (received_marks / total_marks) * 100`, counts `total_correct` and `total_incorrect`.
  - `get_action_re_open`: Re-opens attempt from `hold` to `open`.
- [x] Full integration test suite passing (29/29) and production build passing with 0 errors.

---

## Module 13: Digital Library `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`digital_library` app).
Extracted specs live in `docs/oec_spec/digital_library/` for 3 models:
- `op.digital.library.category` (15 fields, 6 views)
- `op.digital.library.material` (38 fields, 6 views)
- `op.digital.library.enrollment` (16 fields, 6 views)

### Leaf Menus (3/3 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Category | `op.digital.library.category` | list, form | same | [x] verified |
| Material | `op.digital.library.material` | list, form | same | [x] verified |
| Enrollment | `op.digital.library.enrollment` | list, form | same | [x] verified |

### Digital Materials & Curriculum Categorization (`op.digital.library.material`)
- [x] Extracted live specs into `docs/oec_spec/digital_library/op_digital_library_material.*`.
- [x] Content types: `document`, `video`, `audio`, `url`.
- [x] Sources: `upload` (Local Upload), `url` (External Resource), `youtube` (Video Embed).
- [x] Fields & metadata: `name`, `category_id`, `category_ids`, `author_ids`, `publisher_ids`, `material_tags`, `material_edition`, `isbn_code`, `language_id`, `publish_online`, `rating`, `total_reviews`, `material_description`.
- [x] Smart buttons: `Enrollments` (`op.digital.library.enrollment:material_id`).
- [x] Notebook tabs: Enrollments (`material_enrollment_line`), Reviews (`material_review_line`), Description (`material_description`).

### Learner Digital Enrollment & Tracking (`op.digital.library.enrollment`)
- [x] Extracted live specs into `docs/oec_spec/digital_library/op_digital_library_enrollment.*`.
- [x] Statusbar states: `draft` → `in_progress` → `completed`.
- [x] Domain RPC methods:
  - `enroll_learner`: enrolls student/user, records `enrollment_date`, initializes `state = 'in_progress'`.
  - `action_complete`: marks material completed, timestamps `last_access`.
  - `action_reset`: resets enrollment to in progress.
- [x] Full integration test suite passing (32/32) and production build passing with 0 errors.

---

## Module 14: Transportation `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`transportation` app).
Extracted specs live in `docs/oec_spec/transportation/` for 7 models:
- `op.route.register` (21 fields, 6 views)
- `op.route.line` (27 fields, 6 views)
- `op.transportation.agreement` (34 fields, 6 views)
- `op.route` (19 fields, 6 views)
- `op.stop` (18 fields, 6 views)
- `op.vehicle` (17 fields, 6 views)
- `cost.plan` (17 fields, 6 views)

### Leaf Menus (9/9 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Route Register | `op.route.register` | kanban, list, form | same | [x] verified |
| Trips | `op.route.line` | list, form, pivot, graph | same | [x] verified |
| Agreements | `op.transportation.agreement` | list, form, pivot, calendar | same | [x] verified |
| Reporting / Trips Analysis | `op.route.line` | pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Routes | `op.route` | list, form | same | [x] verified |
| Configuration / Stops | `op.stop` | list, form, pivot, graph | same | [x] verified |
| Configuration / Vehicles | `op.vehicle` | list, form | same | [x] verified |
| Configuration / Plan | `cost.plan` | list, form | same | [x] verified |

### Route Register, Trips & Transport Agreement Workflows
- [x] `op.route.register` lifecycle: `draft` → `confirm` (`close_register`) → `gathering` (`register_gathering`) → `cancel` (`cancel_register`) → `draft` (`set_to_draft`).
- [x] `op.route.line` (Trips) lifecycle: `draft` → `start` (`start_trip`) → `end` (`end_trip`).
- [x] `op.transportation.agreement` lifecycle: `draft` → `submit` (`submit_form`) → `confirm` (`confirm_in_progress`) → `agreement` (`agreement_confirm`) → `done` (`enroll_partner`).
- [x] Monthly transport fee invoicing (`invoice_now` / `get_invoice`): posts `account.move` (`fee_category: 'transport'`) and links `invoice_id`.

---

## Module 15: Campus `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`campus` app).
Extracted specs live in `docs/oec_spec/campus/` for 3 models:
- `op.campus.facility` (23 fields, 6 views)
- `op.facility.allocation` (20 fields, 6 views)
- `op.facility.type` (14 fields, 6 views)

### Leaf Menus (4/4 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Facilities / Facility | `op.campus.facility` | list, form, graph, pivot | same | [x] verified |
| Facilities / Facility Allocations | `op.facility.allocation` | calendar, list, pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Facility Type | `op.facility.type` | list, form | same | [x] verified |

### Facilities & Allocations
- [x] Hierarchical facility modeling (`parent_id`, `child_ids` Sub Facilities tab, `facility_allocation_lines` tab, `Allocations` smart button).
- [x] `op.facility.allocation.create_invoice`: posts facility booking invoice to `account.move` (`fee_category: 'facility'`) and links `invoice_id`.

---

## Module 16: Settings & Integrations `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`settings` app).
Extracted specs live in `docs/oec_spec/settings/` for 6 models:
- `res.users` (148 fields, 6 views)
- `res.company` (112 fields, 6 views)
- `res.users.role` (22 fields, 6 views)
- `op.board.affiliation` (15 fields, 6 views)
- `payment.provider` (64 fields, 6 views)
- `payment.transaction` (48 fields, 6 views)

### Leaf Menus (5/5 live menus + Technical integrations)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| General Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Users & Companies / Users | `res.users` | list, kanban, form | same | [x] verified |
| Users & Companies / Companies | `res.company` | list, kanban, form | same | [x] verified |
| Users & Companies / Roles | `res.users.role` | list, form | same | [x] verified |
| Users & Companies / Board Affiliation | `op.board.affiliation` | list, form | same | [x] verified |
| Technical / Payment Providers | `payment.provider` | kanban, list, form | same | [x] verified |
| Technical / Payment Transactions | `payment.transaction` | list, form | same | [x] verified |
| Technical / Scheduled Intervals (`ir.cron`) | `ir.cron` | list, form | same | [x] verified |
- [x] Full integration test suite passing (35/35) and production build passing with 0 errors.

---

## Module 17: Thesis `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`thesis` app).
Extracted specs live in `docs/oec_spec/thesis/` for 8 models:
- `op.thesis.registration` (34 fields, 6 views)
- `op.thesis.progress` (25 fields, 6 views)
- `op.thesis.extension` (29 fields, 6 views)
- `op.thesis.submission` (29 fields, 6 views)
- `op.thesis.committee` (17 fields, 6 views)
- `op.thesis.evaluation.template` (16 fields, 6 views)
- `op.thesis.extension.reason` (14 fields, 6 views)
- `op.thesis.report.type` (14 fields, 6 views)

### Leaf Menus (8/8 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Thesis Management / Registrations | `op.thesis.registration` | kanban, list, form, graph, pivot | same | [x] verified |
| Thesis Management / Progress Reports | `op.thesis.progress` | list, form, graph, pivot | same | [x] verified |
| Thesis Management / Extension Requests | `op.thesis.extension` | list, form, graph, pivot | same | [x] verified |
| Thesis Management / Submissions | `op.thesis.submission` | list, form, graph, pivot | same | [x] verified |
| Configuration / Committee Members | `op.thesis.committee` | list, form | same | [x] verified |
| Configuration / Evaluation Templates | `op.thesis.evaluation.template` | list, form | same | [x] verified |
| Configuration / Extension Reasons | `op.thesis.extension.reason` | list, form | same | [x] added & verified |
| Configuration / Report Types | `op.thesis.report.type` | list, form | same | [x] added & verified |

### Thesis Lifecycle, Multi-Tier Extension Approval & Submission Evaluation
- [x] Registration lifecycle: `draft` → `submitted` (`action_submit`) → `approved` (`action_approve`) → `in_progress` (`action_start`) → `completed` (`action_submit_thesis`, auto-creating `op.thesis.submission`).
- [x] Progress reports: `draft` → `submitted` → `action_provide_feedback` (timestamps `feedback_date` and supervisor feedback) → `approved` (`action_approve`).
- [x] Multi-tier extension approval: `draft` → `supervisor_review` (`action_submit`) → `hod_review` (`action_supervisor_approve`) → `approved` (`action_hod_approve`, updating `final_submission_deadline` on registration).
- [x] Submission evaluation: `submitted` → `under_review` (`action_start_review`) → `approved` (`action_approve`) → `evaluated` (`action_submit_evaluation`) → `completed` (`action_complete`).

---

## Module 18: OMR `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`omr` app).
Extracted specs live in `docs/oec_spec/omr/` for 4 models:
- `op.omr.exam` (23 fields, 6 views)
- `op.answer.sheets` (21 fields, 6 views)
- `op.answersheet.configuration` (18 fields, 6 views)
- `op.omr.template.wizard` (14 fields, 6 views)

### Leaf Menus (5/5 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Exam | `op.omr.exam` | kanban, list, form, pivot | same | [x] verified |
| Generate Sheet | `op.omr.template.wizard` | form | `wizard_omr_sheet` | [x] verified |
| Reporting / Answer Sheets | `op.answer.sheets` | pivot | same | [x] added & verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Answer Sheet | `op.answersheet.configuration` | list, form | same | [x] verified |

---

## Module 19: Events `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`events` app).
Extracted specs live in `docs/oec_spec/events/` for 7 models:
- `event.event` (115 fields, 6 views)
- `event.registration` (58 fields, 6 views)
- `event.type` (24 fields, 6 views)
- `event.stage` (17 fields, 6 views)
- `event.tag.category` (16 fields, 6 views)
- `event.question` (19 fields, 6 views)
- `event.lead.rule` (21 fields, 6 views)

### Leaf Menus (10/10 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Events | `event.event` | kanban, calendar, list, form, pivot, graph | same | [x] verified |
| Registration Desk | `event.registration` | list, kanban, form | same | [x] verified |
| Reporting / Attendees | `event.registration` | graph, pivot, kanban, list, form | same | [x] verified |
| Reporting / Revenues | `event.event` | graph, pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Event Templates | `event.type` | list, form | same | [x] added & verified |
| Configuration / Event Stages | `event.stage` | list, form | same | [x] added & verified |
| Configuration / Event Tags Categories | `event.tag.category` | list, form | same | [x] added & verified |
| Configuration / Event Questions | `event.question` | list, form | same | [x] added & verified |
| Configuration / Lead Generation | `event.lead.rule` | list, form | same | [x] added & verified |
- [x] Full integration test suite passing (37/37) and production build passing with 0 errors.

---

## Module 20: Placements `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`placements` app).
Extracted specs live in `docs/oec_spec/placements/` for 5 models:
- `op.activity.announcement` (31 fields, 6 views)
- `op.job.applicant` (42 fields, 6 views)
- `op.placement.offer` (23 fields, 6 views)
- `op.placement.cell` (18 fields, 6 views)
- `training.season` (17 fields, 6 views)

### Leaf Menus (10/10 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Opportunities / Job Opportunities | `op.activity.announcement` | kanban, list, form, pivot, calendar | same | [x] verified |
| Opportunities / Student Applications | `op.job.applicant` | kanban, list, form, graph, pivot | same | [x] verified |
| Opportunities / Placement Offers | `op.placement.offer` | list, form, pivot | same | [x] verified |
| Campus Events | `event.event` | kanban, list, form | same | [x] verified |
| Configuration / Coordination Teams | `op.placement.cell` | kanban, list, form | same | [x] verified |
| Configuration / Partner Companies | `res.partner` | kanban, list, form | same | [x] added & verified |
| Configuration / Recruitment Sessions | `training.season` | list, form | same | [x] verified |
| Configuration / Event Templates | `event.type` | list, form | same | [x] added & verified |
| Configuration / Event Stages | `event.stage` | list, form | same | [x] added & verified |
| Configuration / Event Tages | `event.tag.category` | list, form | same | [x] added & verified |

---

## Module 21: Alumni `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`alumni` app).
Extracted specs live in `docs/oec_spec/placements/op_alumni_group.*`.

### Leaf Menus (3/3 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Alumni Group | `op.alumni.group` | list, form | same | [x] verified |
| Alumni Job | `op.job.post` | list, form, pivot, calendar | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
- [x] `op.alumni.group.createforum`: creates dedicated alumni community forum (`FORUM-ALU-*`).

---

## Module 22: Job `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`job` app).
Extracted specs live in `docs/oec_spec/placements/` for 4 models: `op.job.post`, `op.job.applicant`, `op.job.type`, `job.post.stage`.

### Leaf Menus (4/4 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Job Post | `op.job.post` | kanban, list, form, pivot, calendar | same | [x] verified |
| Applicant | `op.job.applicant` | kanban, list, form, pivot, graph | same | [x] verified |
| Configuration / Job Type | `op.job.type` | list, form | same | [x] verified |
| Configuration / Stages | `job.post.stage` | list, form | same | [x] verified |

---

## Module 23: Job Queue `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`queue_job` app).
Extracted specs live in `docs/oec_spec/placements/` for 3 models: `queue.job`, `queue.job.channel`, `queue.job.function`.

### Leaf Menus (3/3 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Queue / Jobs | `queue.job` | list, form, pivot, graph | same | [x] verified |
| Queue / Channels | `queue.job.channel` | list, form | same | [x] verified |
| Queue / Job Functions | `queue.job.function` | list, form | same | [x] verified |
- [x] `queue.job` statusbar actions: `requeue` (`failed` → `pending`), `button_done` (`done`), `button_cancelled` (`cancelled`).

---

## Module 24: OnBoarding `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`onboarding` app).
Extracted specs live in `docs/oec_spec/placements/oe_onboarding_steps.*`.
- [x] Kanban view with `step_name`, `doc_link`, `youtube_link`, `open_action_view` (Start), and `step_done` (Mark as Done).
- [x] Full integration test suite passing (39/39) and production build passing with 0 errors.

---

## Module 25: Human Resources `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`hr` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`hr.employee`, `hr.department`, etc.).
- [x] **19/19 Leaf Menus Matched:** Employees, Departments, Certifications (`hr.employee.skill`), Training Attendances (`hr.resume.line`), Onsite (`event.event`), Skills Inventory, Certifications Report, Settings, Onboarding / Offboarding (`mail.activity.plan`), Work Locations (`hr.work.location`), Working Schedules (`resource.calendar`), Departure Reasons (`hr.departure.reason`), Skill Types (`hr.skill.type`), Job Positions (`hr.job`), Contract Templates (`hr.version`), Employment Types (`hr.contract.type`), Badges (`gamification.badge`), Challenges (`gamification.challenge`), Goals History (`gamification.goal`).

---

## Module 26: Recruitment `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`recruitment` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`hr.job`, `hr.applicant`, etc.).
- [x] **14/14 Leaf Menus Matched:** By Job Positions (`hr.job`), By Talent Pools (`hr.talent.pool`), All Applications (`hr.applicant`), Recruitment Analysis, Settings, Employment Types (`hr.contract.type`), Degrees (`hr.recruitment.degree`), Refuse Reasons (`hr.applicant.refuse.reason`), Tags (`hr.applicant.category`), Departments (`hr.department`), Skill Types (`hr.skill.type`), Activity Types (`mail.activity.type`), Activity Plans (`mail.activity.plan`), Emails (`hr.job.platform`).
- [x] `hr.applicant.hire`: converts hired applicant into an `hr.employee` record with Good Conduct / DBS verification status.

---

## Module 27: Time Off `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`time_off` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`hr.leave`, `hr.leave.allocation`, `hr.leave.type`).
- [x] **13/13 Leaf Menus Matched:** Dashboard, My Time Off, My Allocations, Overview, Time Off, Allocations, by Employee, by Type, Balance, Time Off Types (`hr.leave.type`), Accrual Plans (`hr.leave.accrual.plan`), Public Holidays (`resource.calendar.leaves`), Mandatory Days (`hr.leave.mandatory.day`).
- [x] `hr.leave` & `hr.leave.allocation` workflows: `confirm` → `validate1` (`action_approve`) → `validate` (`action_validate`) / `refuse` (`action_refuse`) / `cancel` (`action_cancel`).

---

## Module 28: Expenses `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`expenses` app).
Extracted specs live in `docs/oec_spec/hr_fleet/hr_expense.*`.
- [x] **5/5 Leaf Menus Matched:** My Expenses, Expenses to Process, Expenses Analysis, Settings, Expense Categories (`hr.expense.category`).
- [x] `hr.expense` lifecycle: `draft` → `submitted` (`action_submit`) → `approved` (`action_approve`) → `posted` (`action_post`, auto-posting reimbursement bill in `account.move` and linking `account_move_id`).

---

## Module 29: Approvals `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`approvals` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`multi.approval.type`, `multi.request`).
- [x] **5/5 Leaf Menus Matched:** Approval Types (`multi.approval.type`), My Request (`multi.request`), To Review, All Approval, Activity Types (`mail.activity.type`).
- [x] `multi.approval.type.create_request` and `multi.request` lifecycle: `new`/`draft` → `pending` (`action_confirm` with `date_confirmed`) → `approved` (`action_approve`) / `refused` (`action_refuse`) / `cancel` (`action_cancel`).

---

## Module 30: Fleet `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`fleet` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`fleet.vehicle`, `fleet.vehicle.log.contract`, `fleet.vehicle.log.services`, `fleet.vehicle.odometer`).
- [x] **10/10 Leaf Menus Matched:** Fleet (`fleet.vehicle`), Contracts (`fleet.vehicle.log.contract`), Services (`fleet.vehicle.log.services`), Odometers (`fleet.vehicle.odometer`), Costs, Odometers Report, Settings, Manufacturers (`fleet.vehicle.model.brand`), Models (`fleet.vehicle.model`), Categories (`fleet.vehicle.model.category`).
- [x] `fleet.vehicle.action_accept_driver_change` and smart buttons (`Contracts`, `Services`, `Odometer`).

---

## Module 31: Sales `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`sales` app).
Extracted specs live in `docs/oec_spec/commercial/` (`sale.order`, `crm.team`, `product.template`, `product.product`, `product.pricelist`).
- [x] **26/26 Leaf Menus Matched:** Quotations (`sale.order`), Orders, Sales Teams (`crm.team`), Customers (`res.partner`), Orders to Invoice, Orders to Upsell, Products (`product.template`), Product Variants (`product.product`), Pricelists (`product.pricelist`), Sales (`sale.report`), Salespersons, Products Analysis, Customers Analysis, Settings, Sales Teams (Config), Quotation Templates (`sale.order.template`), Headers/Footers (`quotation.document`), Delivery Methods (`delivery.carrier`), Tags (`crm.tag`), Attributes (`product.attribute`), Combo Choices (`product.combo`), Categories (`product.category`), Product Tags (`product.tag`), Payment Providers (`payment.provider`), Payment Methods (`payment.method`), Activity Plans (`mail.activity.plan`).
- [x] `sale.order` lifecycle: `draft` → `sent` (`action_quotation_send`) → `sale` (`action_confirm`) → `create_invoice` (generates posted `account.move` customer invoice and updates `invoice_status = 'invoiced'` and `invoice_count`).

---

## Module 32: Purchase `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`purchase` app).
Extracted specs live in `docs/oec_spec/commercial/purchase_order.*`.
- [x] **10/10 Leaf Menus Matched:** Requests for Quotation (`purchase.order`), Purchase Orders, Vendors (`res.partner`), Products (`product.template`), Product Variants (`product.product`), Purchase (`purchase.report`), Settings, Vendor Pricelists (`product.supplierinfo`), Attributes (`product.attribute`), Categories (`product.category`).
- [x] `purchase.order` lifecycle: `draft` → `purchase` (`button_confirm`) → `action_view_picking` (generates incoming `stock.picking` receipt).

---

## Module 33: Inventory `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`stock` app).
Extracted specs live in `docs/oec_spec/commercial/` (`stock.picking.type`, `stock.picking`, `stock.scrap`, `stock.lot`, `stock.warehouse`).
- [x] **18/18 Leaf Menus Matched:** Overview (`stock.picking.type`), Receipts (`stock.picking`), Deliveries (`stock.picking`), Physical Inventory (`product.product`), Scrap (`stock.scrap`), Replenishment (`stock.warehouse.orderpoint`), Products (`product.template`), Product Variants (`product.product`), Lots / Serial Numbers (`stock.lot`), Stock (`product.product`), Moves History (`stock.move.line`), Moves Analysis (`stock.move`), Settings, Warehouses (`stock.warehouse`), Operations Types (`stock.picking.type`), Categories (`product.category`), Attributes (`product.attribute`), Delivery Methods (`delivery.carrier`).
- [x] `stock.picking.button_validate`, `stock.scrap.action_validate`, and `stock.warehouse.orderpoint.action_replenish`.

---

## Module 34: CRM `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`crm` app).
Extracted specs live in `docs/oec_spec/commercial/` (`crm.lead`, `crm.tag`, `crm.lost.reason`).
- [x] **16/16 Leaf Menus Matched:** My Pipeline (`crm.lead`), My Activities, My Quotations (`sale.order`), Teams (`crm.team`), Customers (`res.partner`), Forecast, Pipeline, Leads, Activities (`crm.activity.report`), Settings, Sales Teams, Activity Types (`mail.activity.type`), Activity Plans (`mail.activity.plan`), Tags (`crm.tag`), Lost Reasons (`crm.lost.reason`), Lead Mining Requests (`crm.iap.lead.mining.request`).
- [x] `crm.lead.action_sale_quotations_new` and `crm.lead.convert_to_student` (converts opportunity into an `op.admission` application).

---

## Modules 35–42: Website, Email Marketing, Whatsapp, Live Chat, Surveys, Contacts, Discuss & Notice Board `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org`.
Extracted specs live in `docs/oec_spec/comms_system/`.
- [x] **Module 35: Website (42/42 Leaf Menus Matched):** Site (Homepage, Menu Editor, Pages `website.page`, Blog Posts `blog.post`, Products `product.template`, Events `event.event`, Jobs `hr.job`, Forum Posts `forum.post`, Technical Pages `website.technical.page`, Properties, Optimize SEO, Link Tracker, HTML/CSS Editor, Edit Menu), eCommerce (Orders `sale.order`, Unpaid Orders, Abandoned Carts, Customers `res.partner`, Products, Pricelists `product.pricelist`, eCommerce Categories `product.public.category`, Attributes `product.attribute`, Combo Choices `product.combo`, Product Tags `product.tag`, Product Ribbons `product.ribbon`), Reporting (Analytics, Online Sales `sale.report`, Visitors `website.visitor`, Page Views `website.track`), Configuration (Settings, Apps `ir.module.module`, Payment Providers `payment.provider`, Payment Methods `payment.method`, Delivery Methods `delivery.carrier`, Blogs `blog.blog`, Blog Tags `blog.tag`, Tag Categories `blog.tag.category`, Forums `forum.forum`, Ranks `gamification.karma.rank`, Forum Tags `forum.tag`, Badges `gamification.badge`, Close Reasons `forum.post.reason`).
- [x] **Module 36: Email Marketing (10/10 Leaf Menus Matched):** Mailings (`mailing.mailing`), Mailing Lists (`mailing.list`), Mailing List Contacts (`mailing.contact`), Mass Mailing Analysis (`mailing.trace.report`), Opt-Out Report (`mailing.subscription`), Settings, Link Tracker (`link.tracker`), Blacklisted Email Addresses (`mail.blacklist`), Optout Reasons (`mailing.subscription.optout`), Favorite Filters (`mailing.filter`).
- [x] **Module 37: Whatsapp (12/12 Leaf Menus Matched):** Chat (`whatsapp_inbox`), Contacts (`whatsapp.contact`), Campaign (`whatsapp.campaign`), Trace (`whatsapp.activity.trace`), Participants (`whatsapp.campaign.participants`), Business (`whatsapp.business`), Templates (`whatsapp.template`), Tags (`whatsapp.tag`), Templates Library (`whatsapp.template.library`), Server Action (`whatsapp.server.action`), Blocked Contacts (`whatsapp.contact`), Team Assignment (`whatsapp.team.assignment`).
- [x] **Module 38: Live Chat (10/10 Leaf Menus Matched):** Channels (`im_livechat.channel`), All Conversations (`discuss.channel`), Looking for Help (`discuss.channel`), Visitors (`website.visitor`), Agents (`im_livechat.channel.member.history`), Sessions (`im_livechat.report.channel`), Canned Responses (`mail.canned.response`), Chatbots (`chatbot.script`), Expertise (`im_livechat.expertise`), Tags (`im_livechat.conversation.tag`).
- [x] **Module 39: Surveys (5/5 Leaf Menus Matched):** Surveys (`survey.survey`), Participants (`survey.user_input`), Questions (`survey.question`), Suggested Values (`survey.question.answer`), Detailed Answers (`survey.user_input.line`).
- [x] **Module 40: Contacts (9/9 Leaf Menus Matched):** Contacts (`res.partner`), Contact Tags (`res.partner.category`), Contact Titles (`res.partner.title`), Industries (`res.partner.industry`), Countries (`res.country`), Fed. States (`res.country.state`), Country Group (`res.country.group`), Banks (`res.bank`), Bank Accounts (`res.partner.bank`).
- [x] **Module 41: Discuss (6/6 Leaf Menus Matched):** Discuss (`discuss.channel`), Channels (`discuss.channel`), Notifications, Voice & Video, Canned Responses (`mail.canned.response`), Roles (`res.role`).
- [x] **Module 42: Notice Board (5/5 Leaf Menus Matched):** Notices (`op.notice`), Circulars (`op.circular`), Settings, Groups (`op.notice.group`), Circular Types (`op.circular.type`), with `action_to_in_progress`, `action_to_publish`, `action_to_unpublish`, `action_to_cancel`, `action_to_draft`.

---

## Modules 43–53: Dashboards, KPI Dashboard, Calendar, Documents, E-Sign, Automated Marketing, Multi Campus, Spreadsheets, Apps, AIO & Helpdesk `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org`.
Extracted specs live in `docs/oec_spec/comms_system/`.
- [x] **Module 43: Dashboards (3/3 Leaf Menus Matched):** Dashboards (`bi_dashboard`), My Dashboard (`board.board`), Dashboards Config (`spreadsheet.dashboard.group`).
- [x] **Module 44: KPI Dashboard (4/4 Leaf Menus Matched):** My Dashboard (`kpi_dashboard`), Create Dashboard (`dashboard_pro.main_dashboard`), Demo (`kpi_dashboard`), OpenEduCat (`kpi_dashboard`).
- [x] **Module 45: Calendar (4/4 Leaf Menus Matched):** Calendar (`calendar.event`), Online Appointment (`calendar.online.appointment`), Online Appointment Resource (`calendar.appointment.resource`), Settings, plus `calendar.event.generate_meeting_link`.
- [x] **Module 46: Documents / DMS (8/8 Leaf Menus Matched):** Files (`dms.file`), Directories (`dms.directory`), General Settings, Tags (`dms.tag`), Categories (`dms.category`), Storages (`dms.storage`), Migration (`dms.file`), Access Groups (`dms.access.group`).
- [x] **Module 47: E-sign (4/4 Leaf Menus Matched):** E-sign (`e.sign.template`), Documents (`e.sign.request`), Field Types (`e.sign.items`), Roles (`e.sign.item.role`), with sequential 5-party routing, `create_request`, `sign_now`, `action_resend`, and `action_canceled`.
- [x] **Module 48: Automated Marketing (4/4 Leaf Menus Matched):** Campaigns (`marketing.campaign`), Link Tracker (`link.tracker`), Traces (`marketing.trace`), Participants (`marketing.participant`).
- [x] **Module 49: Multi Campus (1/1 Leaf Menu Matched):** Dashboard (`res.company` kanban).
- [x] **Module 50: Spreadsheets (1/1 Leaf Menu Matched):** Spreadsheets (`spreadsheet.spreadsheet`).
- [x] **Module 51: Apps (3/3 Leaf Menus Matched):** Main Apps (`ir.module.module`), Theme Store, Third-Party Apps.
- [x] **Module 52: AIO (30/30 Leaf Menus Matched):** Playground (`ai_playground`), Messages (`aio.playground.message`), Sessions (`aio.playground.session`), Session Tags (`aio.session.tag`), Session Analytics (`aio.session.analytics`), Agent Performance (`aio.agent.analytics`), Cost Optimization (`aio.cost.optimizer`), Student Engagement (`aio.engagement.metrics`), Token Trends (`aio.token.trend.analyzer`), Agent Library (`aio.agent.library`), Agents (`aio.agent`), Team Analytics (`aio.team.analytics`), Executions (`aio.agent.execution`), Model Providers (`aio.model.provider`), Models (`aio.model`), Workflows (`aio.workflow`), Workflow Executions (`aio.workflow.execution`), Steps (`aio.workflow.step`), Hooks (`aio.hook`), Hook Logs (`aio.hook.log`), Tools (`aio.tool`), Collections (`aio.collection`), Webhook Endpoints (`aio.webhook.endpoint`), Database Configs (`aio.database.config`), Guardrails (`aio.guardrail`), File Sources (`aio.file.source`), JSON Schemas (`aio.json.schema`), Output Templates (`aio.output.template`), Evaluations (`aio.agent.evaluation`), Tool Approvals (`aio.agent.approval`).
- [x] **Module 53: Helpdesk (10/10 Leaf Menus Matched):** Dashboard (`helpdesk.team`), My Tickets (`helpdesk.ticket`), All Tickets (`helpdesk.ticket`), Helpdesk Report (`helpdesk.report`), Customer Ratings (`rating.rating`), Settings, Helpdesk Team (`helpdesk.team`), Issue Type (`issue.type`), Tags (`helpdesk.tag`), Stages (`helpdesk.stage`), with `action_assign_to_me`, `action_create_opportunity`, and `solve`.
- [x] Full integration test suite passing (42/42) and production build passing with 0 errors.

---

## Module 12: Library `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`library` app).
Extracted specs live in `docs/oec_spec/library/` for 12 models:
- `op.media` (124 fields, 6 views)
- `op.media.unit` (25 fields, 6 views)
- `op.media.movement` (32 fields, 6 views)
- `op.media.queue` (23 fields, 6 views)
- `op.media.purchase` (27 fields, 6 views)
- `barcode.issue.media` (15 fields, 6 views)
- `op.library.card` (23 fields, 6 views)
- `op.library.card.type` (18 fields, 6 views)
- `op.publisher` (15 fields, 6 views)
- `op.author` (15 fields, 6 views)
- `op.tag` (14 fields, 6 views)
- `op.media.type` (24 fields, 6 views)

### Leaf Menus (20/20 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Dashboard | `op.media.type` | kanban, form | same | [x] verified |
| All Media / Media | `op.media` | list, form, pivot, graph | same | [x] verified |
| All Media / Media Units | `op.media.unit` | list, form, pivot, graph | same | [x] verified |
| All Media / Media Movements | `op.media.movement` | list, form, pivot | same | [x] verified |
| All Media / Media Queue Requests | `op.media.queue` | list, form, pivot, graph | same | [x] verified |
| All Media / Media Purchase Requests | `op.media.purchase` | list, form, pivot, graph | same | [x] verified |
| All Media / Issue Media | `barcode.issue.media` | form | same | [x] verified |
| Barcode | `openeducat_library_barcode.scan_view` | client action | `library_barcode_view` | [x] added & verified |
| Reporting / Media Analysis | `op.media` | pivot | same | [x] verified |
| Reporting / Media Unit Analysis | `op.media.unit` | pivot | same | [x] verified |
| Reporting / Media Movement Analysis | `op.media.movement` | pivot | same | [x] verified |
| Reporting / Media Queue Analysis | `op.media.queue` | pivot | same | [x] verified |
| Reporting / Media Purchase Analysis | `op.media.purchase` | pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Library Cards | `op.library.card` | list, form | same | [x] verified |
| Configuration / Publishers | `op.publisher` | list, form | same | [x] verified |
| Configuration / Authors | `op.author` | list, form | same | [x] verified |
| Configuration / Tags | `op.tag` | list, form | same | [x] verified |
| Configuration / Media Type | `op.media.type` | list, form | same | [x] verified |
| Configuration / Library Card Types | `op.library.card.type` | list, form | same | [x] verified |

### Media Inventory & Smart Buttons (`op.media` & `op.media.unit`)
- [x] Extracted live specs into `docs/oec_spec/library/op_media.*` and `op_media_unit.*`.
- [x] Smart buttons: `Units` (`op.media.unit:media_id`), `Movements` (`op.media.movement:media_id`), `Queue Requests` (`op.media.queue:media_id`).
- [x] Notebook tabs: Description (`description`), Education Details (`course_ids`, `subject_ids`), Media Queue Requests (`queue_ids`).
- [x] Media unit barcode generation and tracking (`available` ↔ `issue`).

### Media Movement Lifecycle & Overdue Fines (`op.media.movement`)
- [x] Extracted live specs into `docs/oec_spec/library/op_media_movement.*`.
- [x] States: `available` (Available) → `reserve` (Reserved) → `issue` (Issued) → `return` (Returned).
- [x] Domain RPC methods:
  - `issue_media`: issues copy to cardholder, updates unit state to `issue`, records `issued_date`.
  - `renew_media`: extends loan period by 14 days, flags `is_renew = true`.
  - `return_media`: marks returned, checks overdue threshold, calculates daily statutory penalty (KES 50/day), releases unit back to `available`.
  - `create_penalty_invoice`: posts overdue penalty invoice to `account.move` (`fee_category: 'library_fine'`) and links invoice ID.

### Media Queue & Purchase Workflows (`op.media.queue` & `op.media.purchase`)
- [x] Extracted live specs into `docs/oec_spec/library/op_media_queue.*` and `op_media_purchase.*`.
- [x] Queue states & actions: `request` → `accept` (`do_accept`), `reject` (`do_reject`), `request` (`do_request_again`).
- [x] Purchase request lifecycle: `draft` → `request` (`act_requested`) → `accept` (`act_accept`) / `reject` (`act_reject`).

### Barcode Checkout / Return (`barcode.issue.media`)
- [x] Barcode scanning transaction method `action_issue`: handles instant issue by barcode + card, and instant return check-in.
- [x] Full integration test suite passing (29/29) and production build passing with 0 errors.

---

## Module 13: Digital Library `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`digital_library` app).
Extracted specs live in `docs/oec_spec/digital_library/` for 3 models:
- `op.digital.library.category` (15 fields, 6 views)
- `op.digital.library.material` (38 fields, 6 views)
- `op.digital.library.enrollment` (16 fields, 6 views)

### Leaf Menus (3/3 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Category | `op.digital.library.category` | list, form | same | [x] verified |
| Material | `op.digital.library.material` | list, form | same | [x] verified |
| Enrollment | `op.digital.library.enrollment` | list, form | same | [x] verified |

### Digital Materials & Curriculum Categorization (`op.digital.library.material`)
- [x] Extracted live specs into `docs/oec_spec/digital_library/op_digital_library_material.*`.
- [x] Content types: `document`, `video`, `audio`, `url`.
- [x] Sources: `upload` (Local Upload), `url` (External Resource), `youtube` (Video Embed).
- [x] Fields & metadata: `name`, `category_id`, `category_ids`, `author_ids`, `publisher_ids`, `material_tags`, `material_edition`, `isbn_code`, `language_id`, `publish_online`, `rating`, `total_reviews`, `material_description`.
- [x] Smart buttons: `Enrollments` (`op.digital.library.enrollment:material_id`).
- [x] Notebook tabs: Enrollments (`material_enrollment_line`), Reviews (`material_review_line`), Description (`material_description`).

### Learner Digital Enrollment & Tracking (`op.digital.library.enrollment`)
- [x] Extracted live specs into `docs/oec_spec/digital_library/op_digital_library_enrollment.*`.
- [x] Statusbar states: `draft` → `in_progress` → `completed`.
- [x] Domain RPC methods:
  - `enroll_learner`: enrolls student/user, records `enrollment_date`, initializes `state = 'in_progress'`.
  - `action_complete`: marks material completed, timestamps `last_access`.
  - `action_reset`: resets enrollment to in progress.
- [x] Full integration test suite passing (32/32) and production build passing with 0 errors.

---

## Module 14: Transportation `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`transportation` app).
Extracted specs live in `docs/oec_spec/transportation/` for 7 models:
- `op.route.register` (21 fields, 6 views)
- `op.route.line` (27 fields, 6 views)
- `op.transportation.agreement` (34 fields, 6 views)
- `op.route` (19 fields, 6 views)
- `op.stop` (18 fields, 6 views)
- `op.vehicle` (17 fields, 6 views)
- `cost.plan` (17 fields, 6 views)

### Leaf Menus (9/9 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Route Register | `op.route.register` | kanban, list, form | same | [x] verified |
| Trips | `op.route.line` | list, form, pivot, graph | same | [x] verified |
| Agreements | `op.transportation.agreement` | list, form, pivot, calendar | same | [x] verified |
| Reporting / Trips Analysis | `op.route.line` | pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Routes | `op.route` | list, form | same | [x] verified |
| Configuration / Stops | `op.stop` | list, form, pivot, graph | same | [x] verified |
| Configuration / Vehicles | `op.vehicle` | list, form | same | [x] verified |
| Configuration / Plan | `cost.plan` | list, form | same | [x] verified |

### Route Register, Trips & Transport Agreement Workflows
- [x] `op.route.register` lifecycle: `draft` → `confirm` (`close_register`) → `gathering` (`register_gathering`) → `cancel` (`cancel_register`) → `draft` (`set_to_draft`).
- [x] `op.route.line` (Trips) lifecycle: `draft` → `start` (`start_trip`) → `end` (`end_trip`).
- [x] `op.transportation.agreement` lifecycle: `draft` → `submit` (`submit_form`) → `confirm` (`confirm_in_progress`) → `agreement` (`agreement_confirm`) → `done` (`enroll_partner`).
- [x] Monthly transport fee invoicing (`invoice_now` / `get_invoice`): posts `account.move` (`fee_category: 'transport'`) and links `invoice_id`.

---

## Module 15: Campus `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`campus` app).
Extracted specs live in `docs/oec_spec/campus/` for 3 models:
- `op.campus.facility` (23 fields, 6 views)
- `op.facility.allocation` (20 fields, 6 views)
- `op.facility.type` (14 fields, 6 views)

### Leaf Menus (4/4 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Facilities / Facility | `op.campus.facility` | list, form, graph, pivot | same | [x] verified |
| Facilities / Facility Allocations | `op.facility.allocation` | calendar, list, pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Facility Type | `op.facility.type` | list, form | same | [x] verified |

### Facilities & Allocations
- [x] Hierarchical facility modeling (`parent_id`, `child_ids` Sub Facilities tab, `facility_allocation_lines` tab, `Allocations` smart button).
- [x] `op.facility.allocation.create_invoice`: posts facility booking invoice to `account.move` (`fee_category: 'facility'`) and links `invoice_id`.

---

## Module 16: Settings & Integrations `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`settings` app).
Extracted specs live in `docs/oec_spec/settings/` for 6 models:
- `res.users` (148 fields, 6 views)
- `res.company` (112 fields, 6 views)
- `res.users.role` (22 fields, 6 views)
- `op.board.affiliation` (15 fields, 6 views)
- `payment.provider` (64 fields, 6 views)
- `payment.transaction` (48 fields, 6 views)

### Leaf Menus (5/5 live menus + Technical integrations)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| General Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Users & Companies / Users | `res.users` | list, kanban, form | same | [x] verified |
| Users & Companies / Companies | `res.company` | list, kanban, form | same | [x] verified |
| Users & Companies / Roles | `res.users.role` | list, form | same | [x] verified |
| Users & Companies / Board Affiliation | `op.board.affiliation` | list, form | same | [x] verified |
| Technical / Payment Providers | `payment.provider` | kanban, list, form | same | [x] verified |
| Technical / Payment Transactions | `payment.transaction` | list, form | same | [x] verified |
| Technical / Scheduled Intervals (`ir.cron`) | `ir.cron` | list, form | same | [x] verified |
- [x] Full integration test suite passing (35/35) and production build passing with 0 errors.

---

## Module 17: Thesis `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`thesis` app).
Extracted specs live in `docs/oec_spec/thesis/` for 8 models:
- `op.thesis.registration` (34 fields, 6 views)
- `op.thesis.progress` (25 fields, 6 views)
- `op.thesis.extension` (29 fields, 6 views)
- `op.thesis.submission` (29 fields, 6 views)
- `op.thesis.committee` (17 fields, 6 views)
- `op.thesis.evaluation.template` (16 fields, 6 views)
- `op.thesis.extension.reason` (14 fields, 6 views)
- `op.thesis.report.type` (14 fields, 6 views)

### Leaf Menus (8/8 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Thesis Management / Registrations | `op.thesis.registration` | kanban, list, form, graph, pivot | same | [x] verified |
| Thesis Management / Progress Reports | `op.thesis.progress` | list, form, graph, pivot | same | [x] verified |
| Thesis Management / Extension Requests | `op.thesis.extension` | list, form, graph, pivot | same | [x] verified |
| Thesis Management / Submissions | `op.thesis.submission` | list, form, graph, pivot | same | [x] verified |
| Configuration / Committee Members | `op.thesis.committee` | list, form | same | [x] verified |
| Configuration / Evaluation Templates | `op.thesis.evaluation.template` | list, form | same | [x] verified |
| Configuration / Extension Reasons | `op.thesis.extension.reason` | list, form | same | [x] added & verified |
| Configuration / Report Types | `op.thesis.report.type` | list, form | same | [x] added & verified |

### Thesis Lifecycle, Multi-Tier Extension Approval & Submission Evaluation
- [x] Registration lifecycle: `draft` → `submitted` (`action_submit`) → `approved` (`action_approve`) → `in_progress` (`action_start`) → `completed` (`action_submit_thesis`, auto-creating `op.thesis.submission`).
- [x] Progress reports: `draft` → `submitted` → `action_provide_feedback` (timestamps `feedback_date` and supervisor feedback) → `approved` (`action_approve`).
- [x] Multi-tier extension approval: `draft` → `supervisor_review` (`action_submit`) → `hod_review` (`action_supervisor_approve`) → `approved` (`action_hod_approve`, updating `final_submission_deadline` on registration).
- [x] Submission evaluation: `submitted` → `under_review` (`action_start_review`) → `approved` (`action_approve`) → `evaluated` (`action_submit_evaluation`) → `completed` (`action_complete`).

---

## Module 18: OMR `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`omr` app).
Extracted specs live in `docs/oec_spec/omr/` for 4 models:
- `op.omr.exam` (23 fields, 6 views)
- `op.answer.sheets` (21 fields, 6 views)
- `op.answersheet.configuration` (18 fields, 6 views)
- `op.omr.template.wizard` (14 fields, 6 views)

### Leaf Menus (5/5 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Exam | `op.omr.exam` | kanban, list, form, pivot | same | [x] verified |
| Generate Sheet | `op.omr.template.wizard` | form | `wizard_omr_sheet` | [x] verified |
| Reporting / Answer Sheets | `op.answer.sheets` | pivot | same | [x] added & verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Answer Sheet | `op.answersheet.configuration` | list, form | same | [x] verified |

---

## Module 19: Events `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`events` app).
Extracted specs live in `docs/oec_spec/events/` for 7 models:
- `event.event` (115 fields, 6 views)
- `event.registration` (58 fields, 6 views)
- `event.type` (24 fields, 6 views)
- `event.stage` (17 fields, 6 views)
- `event.tag.category` (16 fields, 6 views)
- `event.question` (19 fields, 6 views)
- `event.lead.rule` (21 fields, 6 views)

### Leaf Menus (10/10 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Events | `event.event` | kanban, calendar, list, form, pivot, graph | same | [x] verified |
| Registration Desk | `event.registration` | list, kanban, form | same | [x] verified |
| Reporting / Attendees | `event.registration` | graph, pivot, kanban, list, form | same | [x] verified |
| Reporting / Revenues | `event.event` | graph, pivot | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
| Configuration / Event Templates | `event.type` | list, form | same | [x] added & verified |
| Configuration / Event Stages | `event.stage` | list, form | same | [x] added & verified |
| Configuration / Event Tags Categories | `event.tag.category` | list, form | same | [x] added & verified |
| Configuration / Event Questions | `event.question` | list, form | same | [x] added & verified |
| Configuration / Lead Generation | `event.lead.rule` | list, form | same | [x] added & verified |
- [x] Full integration test suite passing (37/37) and production build passing with 0 errors.

---

## Module 20: Placements `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`placements` app).
Extracted specs live in `docs/oec_spec/placements/` for 5 models:
- `op.activity.announcement` (31 fields, 6 views)
- `op.job.applicant` (42 fields, 6 views)
- `op.placement.offer` (23 fields, 6 views)
- `op.placement.cell` (18 fields, 6 views)
- `training.season` (17 fields, 6 views)

### Leaf Menus (10/10 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Opportunities / Job Opportunities | `op.activity.announcement` | kanban, list, form, pivot, calendar | same | [x] verified |
| Opportunities / Student Applications | `op.job.applicant` | kanban, list, form, graph, pivot | same | [x] verified |
| Opportunities / Placement Offers | `op.placement.offer` | list, form, pivot | same | [x] verified |
| Campus Events | `event.event` | kanban, list, form | same | [x] verified |
| Configuration / Coordination Teams | `op.placement.cell` | kanban, list, form | same | [x] verified |
| Configuration / Partner Companies | `res.partner` | kanban, list, form | same | [x] added & verified |
| Configuration / Recruitment Sessions | `training.season` | list, form | same | [x] verified |
| Configuration / Event Templates | `event.type` | list, form | same | [x] added & verified |
| Configuration / Event Stages | `event.stage` | list, form | same | [x] added & verified |
| Configuration / Event Tages | `event.tag.category` | list, form | same | [x] added & verified |

---

## Module 21: Alumni `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`alumni` app).
Extracted specs live in `docs/oec_spec/placements/op_alumni_group.*`.

### Leaf Menus (3/3 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Alumni Group | `op.alumni.group` | list, form | same | [x] verified |
| Alumni Job | `op.job.post` | list, form, pivot, calendar | same | [x] verified |
| Configuration / Settings | `res.config.settings` | form | `settings_panel` | [x] verified |
- [x] `op.alumni.group.createforum`: creates dedicated alumni community forum (`FORUM-ALU-*`).

---

## Module 22: Job `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`job` app).
Extracted specs live in `docs/oec_spec/placements/` for 4 models: `op.job.post`, `op.job.applicant`, `op.job.type`, `job.post.stage`.

### Leaf Menus (4/4 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Job Post | `op.job.post` | kanban, list, form, pivot, calendar | same | [x] verified |
| Applicant | `op.job.applicant` | kanban, list, form, pivot, graph | same | [x] verified |
| Configuration / Job Type | `op.job.type` | list, form | same | [x] verified |
| Configuration / Stages | `job.post.stage` | list, form | same | [x] verified |

---

## Module 23: Job Queue `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`queue_job` app).
Extracted specs live in `docs/oec_spec/placements/` for 3 models: `queue.job`, `queue.job.channel`, `queue.job.function`.

### Leaf Menus (3/3 matched to live OpenEduCat instance)
| Live menu path | Action model | Live views | Local action / model | Status |
|---|---|---|---|---|
| Queue / Jobs | `queue.job` | list, form, pivot, graph | same | [x] verified |
| Queue / Channels | `queue.job.channel` | list, form | same | [x] verified |
| Queue / Job Functions | `queue.job.function` | list, form | same | [x] verified |
- [x] `queue.job` statusbar actions: `requeue` (`failed` → `pending`), `button_done` (`done`), `button_cancelled` (`cancelled`).

---

## Module 24: OnBoarding `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`onboarding` app).
Extracted specs live in `docs/oec_spec/placements/oe_onboarding_steps.*`.
- [x] Kanban view with `step_name`, `doc_link`, `youtube_link`, `open_action_view` (Start), and `step_done` (Mark as Done).
- [x] Full integration test suite passing (39/39) and production build passing with 0 errors.

---

## Module 25: Human Resources `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`hr` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`hr.employee`, `hr.department`, etc.).
- [x] **19/19 Leaf Menus Matched:** Employees, Departments, Certifications (`hr.employee.skill`), Training Attendances (`hr.resume.line`), Onsite (`event.event`), Skills Inventory, Certifications Report, Settings, Onboarding / Offboarding (`mail.activity.plan`), Work Locations (`hr.work.location`), Working Schedules (`resource.calendar`), Departure Reasons (`hr.departure.reason`), Skill Types (`hr.skill.type`), Job Positions (`hr.job`), Contract Templates (`hr.version`), Employment Types (`hr.contract.type`), Badges (`gamification.badge`), Challenges (`gamification.challenge`), Goals History (`gamification.goal`).

---

## Module 26: Recruitment `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`recruitment` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`hr.job`, `hr.applicant`, etc.).
- [x] **14/14 Leaf Menus Matched:** By Job Positions (`hr.job`), By Talent Pools (`hr.talent.pool`), All Applications (`hr.applicant`), Recruitment Analysis, Settings, Employment Types (`hr.contract.type`), Degrees (`hr.recruitment.degree`), Refuse Reasons (`hr.applicant.refuse.reason`), Tags (`hr.applicant.category`), Departments (`hr.department`), Skill Types (`hr.skill.type`), Activity Types (`mail.activity.type`), Activity Plans (`mail.activity.plan`), Emails (`hr.job.platform`).
- [x] `hr.applicant.hire`: converts hired applicant into an `hr.employee` record with Good Conduct / DBS verification status.

---

## Module 27: Time Off `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`time_off` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`hr.leave`, `hr.leave.allocation`, `hr.leave.type`).
- [x] **13/13 Leaf Menus Matched:** Dashboard, My Time Off, My Allocations, Overview, Time Off, Allocations, by Employee, by Type, Balance, Time Off Types (`hr.leave.type`), Accrual Plans (`hr.leave.accrual.plan`), Public Holidays (`resource.calendar.leaves`), Mandatory Days (`hr.leave.mandatory.day`).
- [x] `hr.leave` & `hr.leave.allocation` workflows: `confirm` → `validate1` (`action_approve`) → `validate` (`action_validate`) / `refuse` (`action_refuse`) / `cancel` (`action_cancel`).

---

## Module 28: Expenses `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`expenses` app).
Extracted specs live in `docs/oec_spec/hr_fleet/hr_expense.*`.
- [x] **5/5 Leaf Menus Matched:** My Expenses, Expenses to Process, Expenses Analysis, Settings, Expense Categories (`hr.expense.category`).
- [x] `hr.expense` lifecycle: `draft` → `submitted` (`action_submit`) → `approved` (`action_approve`) → `posted` (`action_post`, auto-posting reimbursement bill in `account.move` and linking `account_move_id`).

---

## Module 29: Approvals `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`approvals` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`multi.approval.type`, `multi.request`).
- [x] **5/5 Leaf Menus Matched:** Approval Types (`multi.approval.type`), My Request (`multi.request`), To Review, All Approval, Activity Types (`mail.activity.type`).
- [x] `multi.approval.type.create_request` and `multi.request` lifecycle: `new`/`draft` → `pending` (`action_confirm` with `date_confirmed`) → `approved` (`action_approve`) / `refused` (`action_refuse`) / `cancel` (`action_cancel`).

---

## Module 30: Fleet `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`fleet` app).
Extracted specs live in `docs/oec_spec/hr_fleet/` (`fleet.vehicle`, `fleet.vehicle.log.contract`, `fleet.vehicle.log.services`, `fleet.vehicle.odometer`).
- [x] **10/10 Leaf Menus Matched:** Fleet (`fleet.vehicle`), Contracts (`fleet.vehicle.log.contract`), Services (`fleet.vehicle.log.services`), Odometers (`fleet.vehicle.odometer`), Costs, Odometers Report, Settings, Manufacturers (`fleet.vehicle.model.brand`), Models (`fleet.vehicle.model`), Categories (`fleet.vehicle.model.category`).
- [x] `fleet.vehicle.action_accept_driver_change` and smart buttons (`Contracts`, `Services`, `Odometer`).

---

## Module 31: Sales `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`sales` app).
Extracted specs live in `docs/oec_spec/commercial/` (`sale.order`, `crm.team`, `product.template`, `product.product`, `product.pricelist`).
- [x] **26/26 Leaf Menus Matched:** Quotations (`sale.order`), Orders, Sales Teams (`crm.team`), Customers (`res.partner`), Orders to Invoice, Orders to Upsell, Products (`product.template`), Product Variants (`product.product`), Pricelists (`product.pricelist`), Sales (`sale.report`), Salespersons, Products Analysis, Customers Analysis, Settings, Sales Teams (Config), Quotation Templates (`sale.order.template`), Headers/Footers (`quotation.document`), Delivery Methods (`delivery.carrier`), Tags (`crm.tag`), Attributes (`product.attribute`), Combo Choices (`product.combo`), Categories (`product.category`), Product Tags (`product.tag`), Payment Providers (`payment.provider`), Payment Methods (`payment.method`), Activity Plans (`mail.activity.plan`).
- [x] `sale.order` lifecycle: `draft` → `sent` (`action_quotation_send`) → `sale` (`action_confirm`) → `create_invoice` (generates posted `account.move` customer invoice and updates `invoice_status = 'invoiced'` and `invoice_count`).

---

## Module 32: Purchase `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`purchase` app).
Extracted specs live in `docs/oec_spec/commercial/purchase_order.*`.
- [x] **10/10 Leaf Menus Matched:** Requests for Quotation (`purchase.order`), Purchase Orders, Vendors (`res.partner`), Products (`product.template`), Product Variants (`product.product`), Purchase (`purchase.report`), Settings, Vendor Pricelists (`product.supplierinfo`), Attributes (`product.attribute`), Categories (`product.category`).
- [x] `purchase.order` lifecycle: `draft` → `purchase` (`button_confirm`) → `action_view_picking` (generates incoming `stock.picking` receipt).

---

## Module 33: Inventory `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`stock` app).
Extracted specs live in `docs/oec_spec/commercial/` (`stock.picking.type`, `stock.picking`, `stock.scrap`, `stock.lot`, `stock.warehouse`).
- [x] **18/18 Leaf Menus Matched:** Overview (`stock.picking.type`), Receipts (`stock.picking`), Deliveries (`stock.picking`), Physical Inventory (`product.product`), Scrap (`stock.scrap`), Replenishment (`stock.warehouse.orderpoint`), Products (`product.template`), Product Variants (`product.product`), Lots / Serial Numbers (`stock.lot`), Stock (`product.product`), Moves History (`stock.move.line`), Moves Analysis (`stock.move`), Settings, Warehouses (`stock.warehouse`), Operations Types (`stock.picking.type`), Categories (`product.category`), Attributes (`product.attribute`), Delivery Methods (`delivery.carrier`).
- [x] `stock.picking.button_validate`, `stock.scrap.action_validate`, and `stock.warehouse.orderpoint.action_replenish`.

---

## Module 34: CRM `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org` (`crm` app).
Extracted specs live in `docs/oec_spec/commercial/` (`crm.lead`, `crm.tag`, `crm.lost.reason`).
- [x] **16/16 Leaf Menus Matched:** My Pipeline (`crm.lead`), My Activities, My Quotations (`sale.order`), Teams (`crm.team`), Customers (`res.partner`), Forecast, Pipeline, Leads, Activities (`crm.activity.report`), Settings, Sales Teams, Activity Types (`mail.activity.type`), Activity Plans (`mail.activity.plan`), Tags (`crm.tag`), Lost Reasons (`crm.lost.reason`), Lead Mining Requests (`crm.iap.lead.mining.request`).
- [x] `crm.lead.action_sale_quotations_new` and `crm.lead.convert_to_student` (converts opportunity into an `op.admission` application).

---

## Modules 35–42: Website, Email Marketing, Whatsapp, Live Chat, Surveys, Contacts, Discuss & Notice Board `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org`.
Extracted specs live in `docs/oec_spec/comms_system/`.
- [x] **Module 35: Website (42/42 Leaf Menus Matched):** Site (Homepage, Menu Editor, Pages `website.page`, Blog Posts `blog.post`, Products `product.template`, Events `event.event`, Jobs `hr.job`, Forum Posts `forum.post`, Technical Pages `website.technical.page`, Properties, Optimize SEO, Link Tracker, HTML/CSS Editor, Edit Menu), eCommerce (Orders `sale.order`, Unpaid Orders, Abandoned Carts, Customers `res.partner`, Products, Pricelists `product.pricelist`, eCommerce Categories `product.public.category`, Attributes `product.attribute`, Combo Choices `product.combo`, Product Tags `product.tag`, Product Ribbons `product.ribbon`), Reporting (Analytics, Online Sales `sale.report`, Visitors `website.visitor`, Page Views `website.track`), Configuration (Settings, Apps `ir.module.module`, Payment Providers `payment.provider`, Payment Methods `payment.method`, Delivery Methods `delivery.carrier`, Blogs `blog.blog`, Blog Tags `blog.tag`, Tag Categories `blog.tag.category`, Forums `forum.forum`, Ranks `gamification.karma.rank`, Forum Tags `forum.tag`, Badges `gamification.badge`, Close Reasons `forum.post.reason`).
- [x] **Module 36: Email Marketing (10/10 Leaf Menus Matched):** Mailings (`mailing.mailing`), Mailing Lists (`mailing.list`), Mailing List Contacts (`mailing.contact`), Mass Mailing Analysis (`mailing.trace.report`), Opt-Out Report (`mailing.subscription`), Settings, Link Tracker (`link.tracker`), Blacklisted Email Addresses (`mail.blacklist`), Optout Reasons (`mailing.subscription.optout`), Favorite Filters (`mailing.filter`).
- [x] **Module 37: Whatsapp (12/12 Leaf Menus Matched):** Chat (`whatsapp_inbox`), Contacts (`whatsapp.contact`), Campaign (`whatsapp.campaign`), Trace (`whatsapp.activity.trace`), Participants (`whatsapp.campaign.participants`), Business (`whatsapp.business`), Templates (`whatsapp.template`), Tags (`whatsapp.tag`), Templates Library (`whatsapp.template.library`), Server Action (`whatsapp.server.action`), Blocked Contacts (`whatsapp.contact`), Team Assignment (`whatsapp.team.assignment`).
- [x] **Module 38: Live Chat (10/10 Leaf Menus Matched):** Channels (`im_livechat.channel`), All Conversations (`discuss.channel`), Looking for Help (`discuss.channel`), Visitors (`website.visitor`), Agents (`im_livechat.channel.member.history`), Sessions (`im_livechat.report.channel`), Canned Responses (`mail.canned.response`), Chatbots (`chatbot.script`), Expertise (`im_livechat.expertise`), Tags (`im_livechat.conversation.tag`).
- [x] **Module 39: Surveys (5/5 Leaf Menus Matched):** Surveys (`survey.survey`), Participants (`survey.user_input`), Questions (`survey.question`), Suggested Values (`survey.question.answer`), Detailed Answers (`survey.user_input.line`).
- [x] **Module 40: Contacts (9/9 Leaf Menus Matched):** Contacts (`res.partner`), Contact Tags (`res.partner.category`), Contact Titles (`res.partner.title`), Industries (`res.partner.industry`), Countries (`res.country`), Fed. States (`res.country.state`), Country Group (`res.country.group`), Banks (`res.bank`), Bank Accounts (`res.partner.bank`).
- [x] **Module 41: Discuss (6/6 Leaf Menus Matched):** Discuss (`discuss.channel`), Channels (`discuss.channel`), Notifications, Voice & Video, Canned Responses (`mail.canned.response`), Roles (`res.role`).
- [x] **Module 42: Notice Board (5/5 Leaf Menus Matched):** Notices (`op.notice`), Circulars (`op.circular`), Settings, Groups (`op.notice.group`), Circular Types (`op.circular.type`), with `action_to_in_progress`, `action_to_publish`, `action_to_unpublish`, `action_to_cancel`, `action_to_draft`.

---

## Modules 43–53: Dashboards, KPI Dashboard, Calendar, Documents, E-Sign, Automated Marketing, Multi Campus, Spreadsheets, Apps, AIO & Helpdesk `[x]`

Source of truth: live OpenEduCat instance `https://21058239.o19.oeducat.org`.
Extracted specs live in `docs/oec_spec/comms_system/`.
- [x] **Module 43: Dashboards (3/3 Leaf Menus Matched):** Dashboards (`bi_dashboard`), My Dashboard (`board.board`), Dashboards Config (`spreadsheet.dashboard.group`).
- [x] **Module 44: KPI Dashboard (4/4 Leaf Menus Matched):** My Dashboard (`kpi_dashboard`), Create Dashboard (`dashboard_pro.main_dashboard`), Demo (`kpi_dashboard`), OpenEduCat (`kpi_dashboard`).
- [x] **Module 45: Calendar (4/4 Leaf Menus Matched):** Calendar (`calendar.event`), Online Appointment (`calendar.online.appointment`), Online Appointment Resource (`calendar.appointment.resource`), Settings, plus `calendar.event.generate_meeting_link`.
- [x] **Module 46: Documents / DMS (8/8 Leaf Menus Matched):** Files (`dms.file`), Directories (`dms.directory`), General Settings, Tags (`dms.tag`), Categories (`dms.category`), Storages (`dms.storage`), Migration (`dms.file`), Access Groups (`dms.access.group`).
- [x] **Module 47: E-sign (4/4 Leaf Menus Matched):** E-sign (`e.sign.template`), Documents (`e.sign.request`), Field Types (`e.sign.items`), Roles (`e.sign.item.role`), with sequential 5-party routing, `create_request`, `sign_now`, `action_resend`, and `action_canceled`.
- [x] **Module 48: Automated Marketing (4/4 Leaf Menus Matched):** Campaigns (`marketing.campaign`), Link Tracker (`link.tracker`), Traces (`marketing.trace`), Participants (`marketing.participant`).
- [x] **Module 49: Multi Campus (1/1 Leaf Menu Matched):** Dashboard (`res.company` kanban).
- [x] **Module 50: Spreadsheets (1/1 Leaf Menu Matched):** Spreadsheets (`spreadsheet.spreadsheet`).
- [x] **Module 51: Apps (3/3 Leaf Menus Matched):** Main Apps (`ir.module.module`), Theme Store, Third-Party Apps.
- [x] **Module 52: AIO (30/30 Leaf Menus Matched):** Playground (`ai_playground`), Messages (`aio.playground.message`), Sessions (`aio.playground.session`), Session Tags (`aio.session.tag`), Session Analytics (`aio.session.analytics`), Agent Performance (`aio.agent.analytics`), Cost Optimization (`aio.cost.optimizer`), Student Engagement (`aio.engagement.metrics`), Token Trends (`aio.token.trend.analyzer`), Agent Library (`aio.agent.library`), Agents (`aio.agent`), Team Analytics (`aio.team.analytics`), Executions (`aio.agent.execution`), Model Providers (`aio.model.provider`), Models (`aio.model`), Workflows (`aio.workflow`), Workflow Executions (`aio.workflow.execution`), Steps (`aio.workflow.step`), Hooks (`aio.hook`), Hook Logs (`aio.hook.log`), Tools (`aio.tool`), Collections (`aio.collection`), Webhook Endpoints (`aio.webhook.endpoint`), Database Configs (`aio.database.config`), Guardrails (`aio.guardrail`), File Sources (`aio.file.source`), JSON Schemas (`aio.json.schema`), Output Templates (`aio.output.template`), Evaluations (`aio.agent.evaluation`), Tool Approvals (`aio.agent.approval`).
- [x] **Module 53: Helpdesk (10/10 Leaf Menus Matched):** Dashboard (`helpdesk.team`), My Tickets (`helpdesk.ticket`), All Tickets (`helpdesk.ticket`), Helpdesk Report (`helpdesk.report`), Customer Ratings (`rating.rating`), Settings, Helpdesk Team (`helpdesk.team`), Issue Type (`issue.type`), Tags (`helpdesk.tag`), Stages (`helpdesk.stage`), with `action_assign_to_me`, `action_create_opportunity`, and `solve`.
- [x] Full integration test suite passing (42/42) and production build passing with 0 errors.
