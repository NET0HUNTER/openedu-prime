| # | Live app | Local app | Live leaf menus | Missing locally | Model mismatches |
|---|---|---|---|---|---|
| 1 | Admissions | Admissions | 9 | 0 | 4 |
| 2 | Students | Students | 17 | 4 | 0 |
| 3 | SIS | SIS | 57 | 25 | 5 |
| 4 | LMS | LMS | 10 | 6 | 0 |
| 5 | Time Table | Time Table | 5 | 0 | 0 |
| 6 | Class Attendances | Class Attendances | 9 | 0 | 0 |
| 7 | Assignments | Assignments | 10 | 2 | 0 |
| 8 | Exams | Exams | 11 | 2 | 0 |
| 9 | Grade Book | Grade Book | 15 | 2 | 2 |
| 10 | Job Queue | Job Queue | 3 | 0 | 0 |
| 11 | Quiz | Quiz | 9 | 0 | 0 |
| 12 | Thesis | Thesis | 8 | 2 | 0 |
| 13 | OMR | OMR | 5 | 1 | 0 |
| 14 | Campus | Campus | 4 | 0 | 0 |
| 15 | Transportation | Transportation | 9 | 1 | 1 |
| 16 | Library | Library | 20 | 2 | 0 |
| 17 | Digital Library | Digital Library | 3 | 0 | 0 |
| 18 | Events | Events | 10 | 6 | 1 |
| 19 | Placements | Placements | 10 | 5 | 0 |
| 20 | Alumni | Alumni | 3 | 0 | 0 |
| 21 | Fleet | Fleet | 10 | 7 | 0 |
| 22 | Recruitment | Recruitment | 14 | 10 | 0 |
| 23 | Job | Job | 4 | 0 | 0 |
| 24 | OnBoarding | OnBoarding | 0 | 0 | 0 |
| 25 | Human Resources | Human Resources | 19 | 16 | 0 |
| 26 | Time Off | Time Off | 13 | 11 | 0 |
| 27 | Expenses | Expenses | 5 | 0 | 1 |
| 28 | Approvals | Approvals | 5 | 3 | 0 |
| 29 | Sales | Sales | 26 | 18 | 1 |
| 30 | Accounting | Accounting | 40 | 28 | 5 |
| 31 | Purchase | Purchase | 10 | 6 | 0 |
| 32 | Inventory | Inventory | 18 | 16 | 0 |
| 33 | CRM | CRM | 17 | 13 | 1 |
| 34 | Website | Website | 42 | 37 | 0 |
| 35 | Email Marketing | Email Marketing | 10 | 8 | 0 |
| 36 | Whatsapp | Whatsapp | 12 | 11 | 0 |
| 37 | Live Chat | Live Chat | 10 | 9 | 0 |
| 38 | Surveys | Surveys | 5 | 4 | 0 |
| 39 | Contacts | Contacts | 9 | 7 | 0 |
| 40 | Discuss | Discuss | 6 | 5 | 0 |
| 41 | Notice Board | Notice Board | 5 | 0 | 0 |
| 42 | Dashboards | Dashboards | 3 | 0 | 0 |
| 43 | KPI Dashboard | KPI Dashboard | 4 | 4 | 0 |
| 44 | Calendar | Calendar | 5 | 2 | 0 |
| 45 | Documents | Documents | 8 | 6 | 0 |
| 46 | E-sign | E-sign | 4 | 3 | 0 |
| 47 | Automated Marketing | Automated Marketing | 4 | 3 | 0 |
| 48 | Multi Campus | Multi Campus | 1 | 1 | 0 |
| 49 | Spreadsheets | Spreadsheets | 0 | 0 | 0 |
| 50 | Apps | Apps | 3 | 3 | 0 |
| 51 | Settings | Settings | 5 | 3 | 0 |
| 52 | AIO | AIO | 30 | 26 | 0 |
| 53 | Helpdesk | Helpdesk | 10 | 5 | 0 |

Local-only apps: none

### 1. Admissions 
- Root action: `op.admission.register` {kanban,form,list}
- Model mismatches:
  - [ ] Course Change Request: live `op.student.course.change.req` vs local `student.course.change.request`
  - [ ] Admission Stages: live `admission.stage` vs local `op.admission.stage`
  - [ ] Admission Tags: live `admission.tag` vs local `op.admission.tag`
  - [ ] Admission Templates: live `op.admission.customtemplate` vs local `op.admission.custom.template`

### 2. Students 
- Root action: `op.student` {kanban,list,form,activity}
- Missing menus:
  - [ ] General / Student Withdrawal Request → `op.student.withdrawal` {list,form}
  - [ ] General / Student Leave Request → `student.leave.request` {calendar,kanban,list,form,search}
  - [ ] Reporting / Student Withdrawal Analysis → `student.withdrawal.analysis.wizard` {form}
  - [ ] Configuration / Leave Type → `student.leave.type` {list,form}

### 3. SIS 
- Root action: `op.department` {kanban,form}
- Missing menus:
  - [ ] Dashboard / Section → `op.section` {kanban,list,form}
  - [ ] Dashboard / Convocation → `op.convocation.ceremony` {kanban,form}
  - [ ] General / Discipline / Suspended Students → `suspended.student` {list,form}
  - [ ] Reporting / Migration Report → `migration.report` {pivot}
  - [ ] Reporting / Discipline / Misbehaviour Type Wise → `misbehaviour.type` {form}
  - [ ] Reporting / Discipline / Student Wise → `student.wise` {form}
  - [ ] Reporting / Attainment → `attainment.dashboard.record` {pivot}
  - [ ] Reporting / Skill Assessment / Skill Assessment Analysis → `op.student.skill.assessment.line` {pivot}
  - [ ] Configuration / Settings → `res.config.settings` {form}
  - [ ] Configuration / Course Management / Course Credit → `course.credit` {list,form}
  - [ ] Configuration / OBE / Program outcome → `program.outcome` {list,form}
  - [ ] Configuration / OBE / Course outcome → `course.outcome` {list,form}
  - [ ] Configuration / Skill Assessment / Skills → `op.student.skill.name` {list,form}
  - [ ] Configuration / Skill Assessment / Skills Category → `op.skill.category` {list,form}
  - [ ] Configuration / Skill Assessment / Skill Assessment Template → `op.student.skill.type` {list,form}
  - [ ] Configuration / General Management / Facilities → `op.facility` {list,form}
  - [ ] Configuration / General Management / Convocation Documents → `op.convocation.document` {list,form}
  - [ ] Configuration / General Management / Categories → `op.category` {list,form}
  - [ ] Configuration / General Management / Area → `op.area` {list,form}
  - [ ] Configuration / General Management / Specialization → `op.specialization` {list,form}
  - [ ] Configuration / General Management / Scholarship Stages → `scholarship.stages` {list,form}
  - [ ] Configuration / Discipline / Elearning Rules → `elearning.rules` {list,form}
  - [ ] Configuration / Discipline / Misbehaviour Categories → `op.misbehaviour.category` {list,form}
  - [ ] Configuration / Grievances / Grievance Category → `grievance.category` {list,form}
  - [ ] Configuration / Grievances / Grievance Teams → `grievance.team` {kanban,list,form,search}
- Model mismatches:
  - [ ] Grievances: live `grievance` vs local `op.grievance`
  - [ ] Grievances: live `grievance` vs local `op.grievance`
  - [ ] Ceremonies: live `op.convocation.ceremony` vs local `op.convocation`
  - [ ] Skill Levels: live `op.student.skill.level.name` vs local `op.skill.level`
  - [ ] School Offences: live `school.offences` vs local `op.discipline.offence`

### 4. LMS 
- Root action: `op.course` {kanban,list,form}
- Missing menus:
  - [ ] Dashboard → `op.course` {kanban,list,form}
  - [ ] Reporting / Summary → `False` {}
  - [ ] Reporting / Course Participation → `op.course.enrollment` {graph}
  - [ ] Reporting / Quiz Participation Report → `op.quiz` {list}
  - [ ] Reporting / Quiz Statistics → `op.quiz.result` {graph}
  - [ ] Reporting / Forum Participation → `op.course` {graph}

### 5. Time Table 
- Root action: `op.session` {kanban,calendar,pivot}
- Menu structure: matches (views/forms still to verify)

### 6. Class Attendances 
- Root action: `op.attendance.register` {kanban,list,form}
- Menu structure: matches (views/forms still to verify)

### 7. Assignments 
- Root action: `op.assignment` {list,form,pivot,graph}
- Missing menus:
  - [ ] Configuration / Assignment Grades → `op.assign.grade.config` {list,form}
  - [ ] Configuration / Rubrics Level → `op.rubric.level` {list,form}

### 8. Exams 
- Root action: `op.exam.session` {list,form,calendar,pivot}
- Missing menus:
  - [ ] Exams / Result Lines → `op.result.line` {list,form}
  - [ ] Reporting / Result Analysis → `op.result.line` {graph}

### 9. Grade Book 
- Root action: `grading.assignment` {kanban,list,form}
- Missing menus:
  - [ ] Reporting / Gradebook Excel Report → `grading.wizard` {form}
  - [ ] Reporting / Grade By Report → `False` {}
- Model mismatches:
  - [ ] Honor Roll: live `op.honorroll` vs local `op.honor.roll`
  - [ ] Assignment Stages: live `assignment.stage` vs local `grading.assignment.stage`

### 10. Job Queue 
- Root action: `queue.job` {list,form,pivot,graph}
- Menu structure: matches (views/forms still to verify)

### 11. Quiz 
- Root action: `op.quiz` {list,form}
- Menu structure: matches (views/forms still to verify)

### 12. Thesis 
- Root action: `op.thesis.registration` {kanban,list,form,graph,pivot}
- Missing menus:
  - [ ] Configuration / Extension Reasons → `op.thesis.extension.reason` {list,form}
  - [ ] Configuration / Report Types → `op.thesis.report.type` {list,form}

### 13. OMR 
- Root action: `op.omr.exam` {kanban,list,form,pivot}
- Missing menus:
  - [ ] Reporting / Answer Sheets → `op.answer.sheets` {pivot}

### 14. Campus 
- Root action: `op.campus.facility` {list,form,graph,pivot}
- Menu structure: matches (views/forms still to verify)

### 15. Transportation 
- Root action: `op.route.register` {kanban,list,form}
- Missing menus:
  - [ ] Configuration / Plan → `cost.plan` {list,form}
- Model mismatches:
  - [ ] Vehicles: live `op.vehicle` vs local `fleet.vehicle`

### 16. Library 
- Root action: `op.media.type` {kanban,form}
- Missing menus:
  - [ ] All Media / Issue Media → `barcode.issue.media` {form}
  - [ ] Configuration / Tags → `op.tag` {list,form}

### 17. Digital Library 
- Root action: `op.digital.library.category` {list,form}
- Menu structure: matches (views/forms still to verify)

### 18. Events 
- Root action: `event.event` {kanban,calendar,list,form,pivot,graph,activity}
- Missing menus:
  - [ ] Registration Desk → `False` {}
  - [ ] Configuration / Event Templates → `event.type` {list,form}
  - [ ] Configuration / Event Stages → `event.stage` {list,form}
  - [ ] Configuration / Event Tags Categories → `event.tag.category` {list,form}
  - [ ] Configuration / Event Questions → `event.question` {list,form}
  - [ ] Configuration / Lead Generation → `event.lead.rule` {list,form}
- Model mismatches:
  - [ ] Revenues: live `event.sale.report` vs local `event.event`

### 19. Placements 
- Root action: `op.activity.announcement` {kanban,list,form,pivot,calendar,activity}
- Missing menus:
  - [ ] Opportunities / Job Opportunities → `op.activity.announcement` {kanban,list,form,pivot,calendar,activity}
  - [ ] Configuration / Partner Companies → `res.partner` {kanban,list,form}
  - [ ] Configuration / Event Templates → `event.type` {list,form}
  - [ ] Configuration / Event Stages → `event.stage` {list,form}
  - [ ] Configuration / Event Tages → `event.tag.category` {list,form}

### 20. Alumni 
- Root action: `op.alumni.group` {list,form}
- Menu structure: matches (views/forms still to verify)

### 21. Fleet 
- Root action: `fleet.vehicle` {kanban,list,form,pivot,activity}
- Missing menus:
  - [ ] Fleet / Fleet → `fleet.vehicle` {kanban,list,form,pivot,activity}
  - [ ] Fleet / Odometers → `fleet.vehicle.odometer` {list,form,graph}
  - [ ] Reporting / Costs → `fleet.vehicle.cost.report` {graph,pivot}
  - [ ] Reporting / Odometers → `fleet.vehicle.odometer.report` {graph}
  - [ ] Configuration / Models / Manufacturers → `fleet.vehicle.model.brand` {kanban,list,form}
  - [ ] Configuration / Models / Models → `fleet.vehicle.model` {list,form}
  - [ ] Configuration / Models / Categories → `fleet.vehicle.model.category` {list}

### 22. Recruitment 
- Root action: `hr.job` {kanban,list,form}
- Missing menus:
  - [ ] Applications / By Talent Pools → `hr.talent.pool` {kanban,list,form}
  - [ ] Configuration / Job Positions / Employment Types → `hr.contract.type` {list}
  - [ ] Configuration / Applications / Degrees → `hr.recruitment.degree` {list,form}
  - [ ] Configuration / Applications / Refuse Reasons → `hr.applicant.refuse.reason` {list,form}
  - [ ] Configuration / Applications / Tags → `hr.applicant.category` {list,form}
  - [ ] Configuration / Employees / Departments → `hr.department` {list,form}
  - [ ] Configuration / Employees / Skill Types → `hr.skill.type` {list,form}
  - [ ] Configuration / Activities / Activity Types → `mail.activity.type` {list,kanban,form}
  - [ ] Configuration / Activities / Activity Plans → `mail.activity.plan` {list,kanban,form}
  - [ ] Configuration / Job Boards / Emails → `hr.job.platform` {list,form}

### 23. Job 
- Root action: `op.job.post` {kanban,list,form,pivot,calendar,activity}
- Menu structure: matches (views/forms still to verify)

### 24. OnBoarding 
- Root action: `oe.onboarding.steps` {kanban}
- Menu structure: matches (views/forms still to verify)

### 25. Human Resources 
- Root action: `hr.employee` {kanban,list,form,activity,graph,pivot}
- Missing menus:
  - [ ] Learning / Certifications → `hr.employee.skill` {list,form}
  - [ ] Learning / Training Attendances → `hr.resume.line` {list,kanban,form,calendar}
  - [ ] Learning / Courses / Onsite → `event.event` {kanban,calendar,list,form,pivot,graph,activity}
  - [ ] Reporting / Skills / Skills Inventory → `hr.employee.skill.report` {list,pivot}
  - [ ] Reporting / Skills / Certifications → `hr.employee.certification.report` {list,pivot}
  - [ ] Configuration / Employee / Onboarding / Offboarding → `mail.activity.plan` {list,kanban,form}
  - [ ] Configuration / Employee / Work Locations → `hr.work.location` {list,form}
  - [ ] Configuration / Employee / Working Schedules → `resource.calendar` {list,form}
  - [ ] Configuration / Employee / Departure Reasons → `hr.departure.reason` {list}
  - [ ] Configuration / Employee / Skill Types → `hr.skill.type` {list,form}
  - [ ] Configuration / Recruitment / Job Positions → `hr.job` {list,form}
  - [ ] Configuration / Recruitment / Contract Templates → `hr.version` {list,form}
  - [ ] Configuration / Recruitment / Employment Types → `hr.contract.type` {list}
  - [ ] Configuration / Challenges / Badges → `gamification.badge` {kanban,list,form}
  - [ ] Configuration / Challenges / Challenges → `gamification.challenge` {kanban,list,form}
  - [ ] Configuration / Challenges / Goals History → `gamification.goal` {list,kanban}

### 26. Time Off 
- Root action: `hr.leave` {calendar,list,form,activity}
- Missing menus:
  - [ ] My Time / Dashboard → `hr.leave` {calendar,list,form,activity}
  - [ ] My Time / My Time Off → `hr.leave` {list,form,kanban,activity}
  - [ ] My Time / My Allocations → `hr.leave.allocation` {list,kanban,form,activity}
  - [ ] Overview → `hr.leave.report.calendar` {calendar}
  - [ ] Management / Allocations → `hr.leave.allocation` {kanban,list,form,activity}
  - [ ] Reporting / by Employee → `hr.leave` {list,graph,pivot,calendar,form}
  - [ ] Reporting / by Type → `hr.leave.report` {graph,list,pivot}
  - [ ] Reporting / Balance → `` {}
  - [ ] Configuration / Accrual Plans → `hr.leave.accrual.plan` {list,form}
  - [ ] Configuration / Public Holidays → `resource.calendar.leaves` {list,form}
  - [ ] Configuration / Mandatory Days → `hr.leave.mandatory.day` {list,form}

### 27. Expenses 
- Root action: `hr.expense` {list,kanban,form,graph,pivot,activity}
- Model mismatches:
  - [ ] Expense Categories: live `product.product` vs local `hr.expense.category`

### 28. Approvals 
- Root action: `multi.approval.type` {kanban,list,form}
- Missing menus:
  - [ ] Approvals / My Request → `multi.request` {list,form}
  - [ ] Approvals / All Approval → `multi.request` {search,list,form}
  - [ ] Activity Types → `mail.activity.type` {list,form}

### 29. Sales 
- Root action: `sale.order` {list,kanban,form,calendar,pivot,graph,activity}
- Missing menus:
  - [ ] Orders / Sales Teams → `crm.team` {kanban,form}
  - [ ] Products / Product Variants → `product.product` {kanban,list,form,activity}
  - [ ] Products / Pricelists → `product.pricelist` {list,kanban,form}
  - [ ] Reporting / Sales → `sale.report` {graph,pivot,list,form}
  - [ ] Reporting / Salespersons → `sale.report` {graph,pivot}
  - [ ] Reporting / Products → `sale.report` {graph,pivot}
  - [ ] Configuration / Sales Teams → `crm.team` {list,form}
  - [ ] Configuration / Sales Orders / Quotation Templates → `sale.order.template` {list,form}
  - [ ] Configuration / Sales Orders / Headers/Footers → `quotation.document` {kanban,list,form}
  - [ ] Configuration / Sales Orders / Delivery Methods → `delivery.carrier` {list,form}
  - [ ] Configuration / Sales Orders / Tags → `crm.tag` {list,form}
  - [ ] Configuration / Products / Attributes → `product.attribute` {list,form}
  - [ ] Configuration / Products / Combo Choices → `product.combo` {list,form}
  - [ ] Configuration / Products / Categories → `product.category` {list,form}
  - [ ] Configuration / Products / Product Tags → `product.tag` {list,form}
  - [ ] Configuration / Online Payments / Payment Providers → `payment.provider` {kanban,list,form}
  - [ ] Configuration / Online Payments / Payment Methods → `payment.method` {list,kanban,form}
  - [ ] Configuration / Activities / Activity Plans → `mail.activity.plan` {list,kanban,form}
- Model mismatches:
  - [ ] Customers: live `sale.report` vs local `res.partner`

### 30. Accounting 
- Root action: `account.journal` {kanban,form}
- Missing menus:
  - [ ] Customers / Batch Payments → `account.batch.payment` {list,form,kanban,activity}
  - [ ] Customers / Products → `product.template` {list,form}
  - [ ] Vendors / Refunds → `account.move` {list,kanban,form,activity}
  - [ ] Vendors / Batch Payments → `account.batch.payment` {list,form,kanban,activity}
  - [ ] Vendors / Employee Expenses → `hr.expense` {list,kanban,form,pivot,graph}
  - [ ] Vendors / Products → `product.template` {list,form}
  - [ ] Vendors / Vendors → `res.partner` {list,kanban,form}
  - [ ] Accounting / Transactions / Journal Entries → `account.move` {list,kanban,form,activity}
  - [ ] Accounting / Closing / Reconcile → `account.move.line` {list}
  - [ ] Accounting / Closing / Lock Dates… → `account.change.lock.date` {form}
  - [ ] Accounting / Generate Assets Entries → `asset.depreciation.confirmation.wizard` {list,form}
  - [ ] Assets / Request Assets → `account.asset.request` {list,form,search,pivot}
  - [ ] Assets / Request Reasons → `asset.request.reason` {list,form}
  - [ ] Review / Control / Journal Items → `account.move.line` {list,pivot,graph,kanban}
  - [ ] Review / Logs / Audit Trail → `mail.message` {list}
  - [ ] Reporting / Taxes & Fiscal / 1099 Report… → `l10n_us_1099.wizard` {form}
  - [ ] Reporting / Management / Analytic Report → `account.analytic.line` {list,form}
  - [ ] Configuration / Asset Types → `account.asset.category` {list,kanban,form}
  - [ ] Configuration / Accounting / Chart of Accounts → `account.account` {list,kanban,form}
  - [ ] Configuration / Accounting / Taxes → `account.tax` {list,kanban,form}
  - [ ] Configuration / Accounting / Currencies → `res.currency` {list,kanban,form}
  - [ ] Configuration / Accounting / Fiscal Positions → `account.fiscal.position` {list,kanban,form}
  - [ ] Configuration / Accounting / Multi-Ledger → `account.journal.group` {list,form}
  - [ ] Configuration / Invoicing / Payment Terms → `account.payment.term` {list,kanban,form}
  - [ ] Configuration / Invoicing / Product Categories → `product.category` {list,form}
  - [ ] Configuration / Online Payments / Payment Providers → `payment.provider` {kanban,list,form}
  - [ ] Configuration / Online Payments / Payment Methods → `payment.method` {list,kanban,form}
  - [ ] Configuration / Sync Errors → `exchange.rate.sync.error` {list,form}
- Model mismatches:
  - [ ] Payments: live `account.payment` vs local `payment.transaction`
  - [ ] Payments: live `account.payment` vs local `payment.transaction`
  - [ ] Assets: live `account.asset.asset` vs local `asset.request`
  - [ ] Invoice Analysis: live `account.invoice.report` vs local `account.move`
  - [ ] Assets: live `asset.asset.report` vs local `asset.request`

### 31. Purchase 
- Root action: `purchase.order` {list,kanban,form,pivot,graph,calendar,activity}
- Missing menus:
  - [ ] Orders / Requests for Quotation → `purchase.order` {list,kanban,form,pivot,graph,calendar,activity}
  - [ ] Products / Product Variants → `product.product` {list,kanban,form,activity}
  - [ ] Reporting / Purchase → `purchase.report` {graph,pivot}
  - [ ] Configuration / Vendor Pricelists → `product.supplierinfo` {list,form,kanban}
  - [ ] Configuration / Products / Attributes → `product.attribute` {list,form}
  - [ ] Configuration / Products / Categories → `product.category` {list,form}

### 32. Inventory 
- Root action: `stock.picking.type` {kanban,form}
- Missing menus:
  - [ ] Overview → `stock.picking.type` {kanban,form}
  - [ ] Operations / Transfers / Receipts → `` {}
  - [ ] Operations / Transfers / Deliveries → `` {}
  - [ ] Operations / Adjustments / Physical Inventory → `` {}
  - [ ] Operations / Adjustments / Scrap → `stock.scrap` {list,form,kanban,pivot,graph}
  - [ ] Operations / Procurement / Replenishment → `` {}
  - [ ] Products / Product Variants → `product.product` {list,form,kanban}
  - [ ] Products / Lots / Serial Numbers → `stock.lot` {list,form}
  - [ ] Reporting / Stock → `product.product` {list,form}
  - [ ] Reporting / Moves History → `stock.move.line` {list,kanban,pivot,form}
  - [ ] Reporting / Moves Analysis → `stock.move` {list,form}
  - [ ] Configuration / Warehouse Management / Warehouses → `stock.warehouse` {list,form}
  - [ ] Configuration / Warehouse Management / Operations Types → `stock.picking.type` {list,form}
  - [ ] Configuration / Products / Categories → `product.category` {list,form}
  - [ ] Configuration / Products / Attributes → `product.attribute` {list,form}
  - [ ] Configuration / Delivery / Delivery Methods → `delivery.carrier` {list,form}

### 33. CRM 
- Root action: `` {}
- Missing menus:
  - [ ] Sales / My Pipeline → `` {}
  - [ ] Sales / My Quotations → `sale.order` {list,kanban,form,calendar,pivot,graph,activity}
  - [ ] Sales / Teams → `crm.team` {kanban,form}
  - [ ] Reporting / Forecast → `` {}
  - [ ] Reporting / Leads → `crm.lead` {graph,pivot,list}
  - [ ] Reporting / Activities → `crm.activity.report` {graph,pivot,list}
  - [ ] Configuration → `` {}
  - [ ] Configuration / Sales Teams → `crm.team` {list,form}
  - [ ] Configuration / Activities / Activity Types → `mail.activity.type` {list,kanban,form}
  - [ ] Configuration / Activities / Activity Plans → `mail.activity.plan` {list,kanban,form}
  - [ ] Configuration / Pipeline / Tags → `crm.tag` {list,form}
  - [ ] Configuration / Pipeline / Lost Reasons → `crm.lost.reason` {list,form}
  - [ ] Configuration / Lead Generation / Lead Mining Requests → `crm.iap.lead.mining.request` {list,form}
- Model mismatches:
  - [ ] My Activities: live `crm.lead` vs local `mail.activity`

### 34. Website 
- Root action: `False` {}
- Missing menus:
  - [ ] Site / Homepage → `False` {}
  - [ ] Site / Menu Editor → `False` {}
  - [ ] Site / Content / Blog Posts → `blog.post` {list,kanban,form}
  - [ ] Site / Content / Events → `event.event` {list,kanban}
  - [ ] Site / Content / Jobs → `hr.job` {list,kanban,form}
  - [ ] Site / Content / Forum Posts → `forum.post` {list,kanban,graph}
  - [ ] Site / Content / Technical Pages → `website.technical.page` {list}
  - [ ] Site / This page / Properties → `False` {}
  - [ ] Site / This page / Optimize SEO → `False` {}
  - [ ] Site / This page / Link Tracker → `False` {}
  - [ ] Site / This page / HTML / CSS Editor → `False` {}
  - [ ] Site / This page / Edit Menu → `False` {}
  - [ ] eCommerce / Orders / Unpaid Orders → `sale.order` {list,kanban,form,activity}
  - [ ] eCommerce / Orders / Abandoned Carts → `sale.order` {list,kanban,form,activity}
  - [ ] eCommerce / Orders / Customers → `res.partner` {list,kanban,form,activity}
  - [ ] eCommerce / Products / Pricelists → `product.pricelist` {list,kanban,form}
  - [ ] eCommerce / Products / eCommerce Categories → `product.public.category` {list,form}
  - [ ] eCommerce / Products / Attributes → `product.attribute` {list,form}
  - [ ] eCommerce / Products / Combo Choices → `product.combo` {list,form}
  - [ ] eCommerce / Products / Product Tags → `product.tag` {list,form}
  - [ ] eCommerce / Products / Product Ribbons → `product.ribbon` {list,form}
  - [ ] Reporting / Analytics → `` {}
  - [ ] Reporting / Online Sales → `sale.report` {pivot,graph}
  - [ ] Reporting / Visitors → `website.visitor` {kanban,list,form,graph}
  - [ ] Reporting / Page Views → `website.track` {list}
  - [ ] Configuration / Apps → `ir.module.module` {kanban,list,form}
  - [ ] Configuration / eCommerce / Payment Providers → `payment.provider` {kanban,list,form}
  - [ ] Configuration / eCommerce / Payment Methods → `payment.method` {list,kanban,form}
  - [ ] Configuration / eCommerce / Delivery Methods → `delivery.carrier` {list,form}
  - [ ] Configuration / Blog / Blogs → `blog.blog` {list,form}
  - [ ] Configuration / Blog / Tags → `blog.tag` {list,form}
  - [ ] Configuration / Blog / Tag Categories → `blog.tag.category` {list,form}
  - [ ] Configuration / Forum / Forums → `forum.forum` {list,form}
  - [ ] Configuration / Forum / Ranks → `gamification.karma.rank` {list,form}
  - [ ] Configuration / Forum / Tags → `forum.tag` {list,form}
  - [ ] Configuration / Forum / Badges → `gamification.badge` {kanban,list,form}
  - [ ] Configuration / Forum / Close Reasons → `forum.post.reason` {list}

### 35. Email Marketing 
- Root action: `mailing.mailing` {list,kanban,form,calendar}
- Missing menus:
  - [ ] Mailing Lists / Mailing Lists → `mailing.list` {kanban,list,form}
  - [ ] Mailing Lists / Mailing List Contacts → `mailing.contact` {list,kanban,form,graph,pivot}
  - [ ] Reporting / Mass Mailing Analysis → `mailing.trace.report` {graph,pivot,list}
  - [ ] Reporting / Opt-Out Report → `mailing.subscription` {graph,pivot,list,form}
  - [ ] Configuration / Link Tracker → `link.tracker` {list,form,graph}
  - [ ] Configuration / Blacklisted Email Addresses → `mail.blacklist` {list,form}
  - [ ] Configuration / Optout Reasons → `mailing.subscription.optout` {list,form}
  - [ ] Configuration / Favorite Filters → `mailing.filter` {list,form}

### 36. Whatsapp 
- Root action: `False` {}
- Missing menus:
  - [ ] Chat → `False` {}
  - [ ] Contacts → `whatsapp.contact` {list,form,pivot}
  - [ ] Campaign / Trace → `whatsapp.activity.trace` {graph,pivot,list,form}
  - [ ] Campaign / Participants → `whatsapp.campaign.participants` {list,form}
  - [ ] Configuration / Business → `whatsapp.business` {list,form}
  - [ ] Configuration / Templates → `whatsapp.template` {list,form}
  - [ ] Configuration / Tags → `whatsapp.tag` {list,form}
  - [ ] Configuration / Templates Library → `whatsapp.template.library` {list,form}
  - [ ] Configuration / Server Action → `whatsapp.server.action` {list,form}
  - [ ] Configuration / Blocked Contacts → `whatsapp.contact` {list,form}
  - [ ] Configuration / Team Assignment → `whatsapp.team.assignment` {list,form}

### 37. Live Chat 
- Root action: `im_livechat.channel` {kanban,form}
- Missing menus:
  - [ ] Sessions / All Conversations → `discuss.channel` {kanban,list,pivot,graph,form}
  - [ ] Sessions / Looking for Help → `discuss.channel` {list,kanban,form}
  - [ ] Visitors → `website.visitor` {kanban,list,form,graph}
  - [ ] Reporting / Agents → `im_livechat.channel.member.history` {pivot,graph}
  - [ ] Reporting / Sessions → `im_livechat.report.channel` {graph,pivot}
  - [ ] Configuration / Canned Responses → `mail.canned.response` {list,form,kanban}
  - [ ] Configuration / Chatbots → `chatbot.script` {list,form}
  - [ ] Configuration / Expertise → `im_livechat.expertise` {list,form}
  - [ ] Configuration / Tags → `im_livechat.conversation.tag` {list,form}

### 38. Surveys 
- Root action: `survey.survey` {kanban,list,form,activity}
- Missing menus:
  - [ ] Participants → `survey.user_input` {list,kanban,form}
  - [ ] Questions & Answers / Questions → `survey.question` {list,form}
  - [ ] Questions & Answers / Suggested Values → `survey.question.answer` {list,form}
  - [ ] Questions & Answers / Detailed Answers → `survey.user_input.line` {list,form}

### 39. Contacts 
- Root action: `res.partner` {list,kanban,form,activity}
- Missing menus:
  - [ ] Configuration / Contact Tags → `res.partner.category` {list,form}
  - [ ] Configuration / Contact Titles → `res.partner.title` {list,form}
  - [ ] Configuration / Industries → `res.partner.industry` {list,form}
  - [ ] Configuration / Localization / Fed. States → `res.country.state` {list,form}
  - [ ] Configuration / Localization / Country Group → `res.country.group` {list,form}
  - [ ] Configuration / Bank Accounts / Banks → `res.bank` {list,form}
  - [ ] Configuration / Bank Accounts / Bank Accounts → `res.partner.bank` {list,form}

### 40. Discuss 
- Root action: `False` {}
- Missing menus:
  - [ ] Discuss → `False` {}
  - [ ] Configuration / Notifications → `False` {}
  - [ ] Configuration / Voice & Video → `False` {}
  - [ ] Configuration / Canned Responses → `mail.canned.response` {list,form,kanban}
  - [ ] Configuration / Roles → `res.role` {list,form}

### 41. Notice Board 
- Root action: `op.notice` {list,kanban,form,pivot}
- Menu structure: matches (views/forms still to verify)

### 42. Dashboards 
- Root action: `False` {}
- Menu structure: matches (views/forms still to verify)

### 43. KPI Dashboard 
- Root action: `dashboard_pro.main_dashboard` {}
- Missing menus:
  - [ ] My Dashboard → `dashboard_pro.main_dashboard` {}
  - [ ] Create Dashboard → `dashboard_pro.main_dashboard` {list,form}
  - [ ] Demo → `dashboard_pro.main_dashboard` {}
  - [ ] OpenEduCat → `dashboard_pro.main_dashboard` {}

### 44. Calendar 
- Root action: `calendar.event` {calendar,list,form}
- Missing menus:
  - [ ] Configuration → `calendar.event` {calendar,list,form}
  - [ ] Configuration / Online Appointment Resource → `calendar.appointment.resource` {list,form}

### 45. Documents 
- Root action: `dms.file` {kanban,list,graph,pivot,form}
- Missing menus:
  - [ ] Configuration / General Settings → `res.config.settings` {form}
  - [ ] Configuration / Organizing / Tags → `dms.tag` {kanban,list,form}
  - [ ] Configuration / Organizing / Categories → `dms.category` {list,form}
  - [ ] Configuration / System / Storages → `dms.storage` {list,form}
  - [ ] Configuration / System / Migration → `dms.file` {list}
  - [ ] Configuration / System / Access Groups → `dms.access.group` {list,form}

### 46. E-sign 
- Root action: `e.sign.template` {kanban,list,form}
- Missing menus:
  - [ ] Documents → `e.sign.request` {kanban,list,form}
  - [ ] Configuration / Field Types → `e.sign.items` {list,form}
  - [ ] Configuration / Roles → `e.sign.item.role` {list,form}

### 47. Automated Marketing 
- Root action: `marketing.campaign` {kanban,list,form}
- Missing menus:
  - [ ] Reporting / Link Tracker → `link.tracker` {graph,pivot,list,form}
  - [ ] Reporting / Traces → `marketing.trace` {graph,pivot,list,form}
  - [ ] Reporting / Participants → `marketing.participant` {graph,pivot,list,form}

### 48. Multi Campus 
- Root action: `res.company` {kanban}
- Missing menus:
  - [ ] Dashboard → `res.company` {kanban}

### 49. Spreadsheets 
- Root action: `spreadsheet.spreadsheet` {list,form}
- Menu structure: matches (views/forms still to verify)

### 50. Apps 
- Root action: `ir.module.module` {kanban,list,form}
- Missing menus:
  - [ ] Apps / Main Apps → `ir.module.module` {kanban,list,form}
  - [ ] Apps / Theme Store → `` {}
  - [ ] Apps / Third-Party Apps → `` {}

### 51. Settings 
- Root action: `res.config.settings` {form}
- Missing menus:
  - [ ] General Settings → `res.config.settings` {form}
  - [ ] Users & Companies / Roles → `res.users.role` {list,form}
  - [ ] Users & Companies / Board Affiliation → `op.board.affiliation` {list,form}

### 52. AIO 
- Root action: `False` {}
- Missing menus:
  - [ ] Playground / Playground → `False` {}
  - [ ] Playground / Messages → `aio.playground.message` {list,form}
  - [ ] Playground / Sessions → `aio.playground.session` {list,kanban,form,pivot,graph}
  - [ ] Playground / Session Tags → `aio.session.tag` {list,form}
  - [ ] Playground / Analytics / Session Analytics → `aio.session.analytics` {graph,pivot,list}
  - [ ] Playground / Analytics / Agent Performance → `aio.agent.analytics` {list,graph,form}
  - [ ] Playground / Analytics / Cost Optimization → `aio.cost.optimizer` {form}
  - [ ] Playground / Analytics / Student Engagement → `aio.engagement.metrics` {list,graph,form}
  - [ ] Playground / Analytics / Token Trends → `aio.token.trend.analyzer` {form}
  - [ ] Agents / Agents → `aio.agent` {kanban,list,form}
  - [ ] Agents / Team Analytics → `aio.team.analytics` {list,form}
  - [ ] Executions / Executions → `aio.agent.execution` {list,form}
  - [ ] Configuration / Model Providers → `aio.model.provider` {list,form,pivot,graph}
  - [ ] Configuration / Workflows / Executions → `aio.workflow.execution` {list,form}
  - [ ] Configuration / Workflows / Steps → `aio.workflow.step` {list,form}
  - [ ] Configuration / Hooks / Hooks → `aio.hook` {list,kanban,form}
  - [ ] Configuration / Hooks / Hook Logs → `aio.hook.log` {list,form}
  - [ ] Configuration / Collections → `aio.collection` {list,form}
  - [ ] Configuration / Webhook Endpoints → `aio.webhook.endpoint` {list,form}
  - [ ] Configuration / Database Configs → `aio.database.config` {list,form}
  - [ ] Configuration / Guardrails → `aio.guardrail` {list,kanban,form}
  - [ ] Configuration / File Sources → `aio.file.source` {list,form}
  - [ ] Configuration / JSON Schemas → `aio.json.schema` {list,form}
  - [ ] Configuration / Output Templates → `aio.output.template` {list,form}
  - [ ] Configuration / Evaluations → `aio.agent.evaluation` {list,form}
  - [ ] Configuration / Tool Approvals → `aio.agent.approval` {list,form}

### 53. Helpdesk 
- Root action: `helpdesk.team` {kanban,form}
- Missing menus:
  - [ ] Dashboard → `helpdesk.team` {kanban,form}
  - [ ] Tickets / My Tickets → `helpdesk.ticket` {list,kanban,form,pivot}
  - [ ] Reporting / Helpdesk Report → `helpdesk.report` {graph,pivot,list}
  - [ ] Reporting / Customer Ratings → `rating.rating` {kanban,form,list,pivot,graph}
  - [ ] Configuration / Tags → `helpdesk.tag` {list,form}
