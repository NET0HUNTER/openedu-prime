import { defineModel as M } from '../dsl.js';

/** Modules 25–40, 42–47, 49: HR, Time Off, Expenses, Approvals, Sales, Accounting, Purchase, Inventory, CRM, Website, Marketing, WhatsApp, Live Chat, Surveys, Discuss, Calendar, DMS, E-Sign, Spreadsheets. */
export const backofficeModels = [
  // Modules 25–29: HR, Recruitment, Time Off, Expenses & Approvals
  M('hr.department', 'Department', {
    f: 'name:char!; manager_id:m2o(hr.employee):Manager; parent_id:m2o(hr.department); total_employees:integer=10; color:integer=1; active:bool=true; company_id:m2o(res.company)',
    smart: 'Employees:hr.employee:department_id',
    views: 'kanban,list,form',
  }),
  M('hr.employee', 'Employee', {
    f: `name:char!; image:image; job_title:char!; job_id:m2o(hr.job); department_id:m2o(hr.department)!;
        parent_id:m2o(hr.employee):Manager; coach_id:m2o(hr.employee):Coach;
        work_email:char!; work_phone:char; mobile_phone:char;
        work_location_id:m2o(hr.work.location); resource_calendar_id:m2o(resource.calendar);
        employee_type:sel(faculty=Teaching Faculty|admin=Administration / SLT|support=Clinical / Support Staff|transport=Driver / Fleet)=faculty;
        gender:sel(m=Male|f=Female|o=Other)=f; birthday:date; country_id:m2o(res.country);
        police_clearance_no:char:Certificate of Good Conduct No;
        police_clearance_expiry:date:Good Conduct Expiry; dbs_verified:bool:Child Protection Cleared=true;
        user_id:m2o(res.users); badge_id:char; pin:char;
        employee_skill_ids:o2m(hr.employee.skill,employee_id):Skills & Certifications;
        resume_line_ids:o2m(hr.resume.line,employee_id):Resume;
        active:bool=true; company_id:m2o(res.company)`,
    views: 'kanban,list,form,graph,pivot',
    panel: 'department_id',
    smart: 'Time Off:hr.leave:employee_id',
    tabs: 'Work Information:department_id,job_id,parent_id,coach_id,work_location_id,resource_calendar_id,employee_type,company_id|Resume:resume_line_ids,badge_id|Certifications:employee_skill_ids,police_clearance_no,police_clearance_expiry,dbs_verified|Personal:gender,birthday,country_id|Payroll:work_phone,mobile_phone|Settings:user_id,pin',
    kanban: { title: 'name', sub: 'job_title,work_email' },
  }),
  M('hr.talent.pool', 'Talent Pool', {
    f: 'name:char!; pool_manager:m2o(res.users); description:text; color:integer=1; company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('hr.contract.type', 'Employment Type', {
    f: 'name:char!; code:char; sequence:integer=10; country_id:m2o(res.country)',
    views: 'list,form',
  }),
  M('hr.recruitment.degree', 'Recruitment Degree', {
    f: 'name:char!; sequence:integer=1; score:float=1',
    views: 'list,form',
  }),
  M('hr.applicant.refuse.reason', 'Applicant Refuse Reason', {
    f: 'name:char!; sequence:integer=10; active:bool=true',
    views: 'list,form',
  }),
  M('hr.applicant.category', 'Applicant Tag', {
    f: 'name:char!; color:integer=1',
    views: 'list,form',
  }),
  M('hr.skill.type', 'Skill Type', {
    f: 'name:char!; color:integer=1; active:bool=true',
    views: 'list,form',
  }),
  M('hr.employee.skill', 'Employee Skill / Certification', {
    f: 'employee_id:m2o(hr.employee)!; skill_type_id:m2o(hr.skill.type); name:char!:Skill / Certification; level_progress:integer=85; valid_from:date=today; valid_to:date; company_id:m2o(res.company)',
    views: 'list,form,pivot',
  }),
  M('hr.resume.line', 'Training / Resume Line', {
    f: 'employee_id:m2o(hr.employee)!; name:char!:Title; date_start:date!=today; date_end:date; description:text; display_type:sel(classic=Experience|education=Education|certification=Certification|course=Training Course)=course; company_id:m2o(res.company)',
    views: 'list,kanban,form,calendar',
    cal: 'date_start,date_end',
  }),
  M('hr.work.location', 'Work Location', {
    f: 'name:char!; address_id:m2o(res.partner); location_type:sel(home=Home|office=Campus / Office|other=Other)=office; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('resource.calendar', 'Working Schedule', {
    f: 'name:char!; hours_per_day:float=8; full_time_required_hours:float=40; tz:char=Africa/Nairobi; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('hr.departure.reason', 'Departure Reason', {
    f: 'name:char!; sequence:integer=10; reason_code:integer=1',
    views: 'list,form',
  }),
  M('hr.version', 'Contract Template', {
    f: 'name:char!; job_id:m2o(hr.job); department_id:m2o(hr.department); contract_type_id:m2o(hr.contract.type); wage:money=120000; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('hr.job.platform', 'Job Board Email Platform', {
    f: 'name:char!; email:char!; regex:char',
    views: 'list,form',
  }),
  M('mail.activity.type', 'Activity Type', {
    nocompany: true,
    f: 'name:char!; summary:char; category:sel(default=None|upload_file=Upload Document|phonecall=Phonecall|meeting=Meeting)=default; delay_count:integer=0; delay_unit:sel(days=days|weeks=weeks|months=months)=days; icon:char=fa-tasks; active:bool=true',
    views: 'list,kanban,form',
  }),
  M('mail.activity.plan', 'Activity Plan (Onboarding / Offboarding)', {
    f: 'name:char!; res_model:char=hr.employee; active:bool=true; company_id:m2o(res.company)',
    views: 'list,kanban,form',
  }),
  M('gamification.badge', 'Employee Badge', {
    f: 'name:char!; description:text; level:sel(bronze=Bronze|silver=Silver|gold=Gold)=gold; active:bool=true; company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('gamification.challenge', 'Gamification Challenge', {
    f: 'name:char!; period:sel(once=Non Recurring|daily=Daily|weekly=Weekly|monthly=Monthly|yearly=Yearly)=monthly; state:sel(draft=Draft|inprogress=In Progress|done=Done)=inprogress; company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('gamification.goal', 'Goal History', {
    f: 'user_id:m2o(res.users)!; challenge_id:m2o(gamification.challenge); target_goal:float=100; current:float=80; state:sel(draft=Draft|inprogress=In Progress|reached=Reached|failed=Failed)=inprogress; company_id:m2o(res.company)',
    views: 'list,kanban,form',
  }),
  M('hr.leave', 'Time Off Request', {
    f: `employee_id:m2o(hr.employee)!; department_id:m2o(hr.department);
        holiday_status_id:m2o(hr.leave.type);
        leave_type:sel(annual=Paid Time Off|sick=Sick Time Off|parental=Parental Leave|training=CPD / Training Leave)=annual;
        request_date_from:date=today; request_date_to:date=today;
        date_from:date!=today; date_to:date!=today; duration_days:float=1; duration_display:char=1 day;
        name:char!:Reason; company_id:m2o(res.company);
        state:sel(confirm=To Approve|validate1=Second Approval|validate=Approved|refuse=Refused|cancel=Cancelled)=confirm`,
    buttons: 'action_approve:!Approve:confirm>validate1; action_validate:!Validate:confirm,validate1>validate; action_refuse:Refuse:confirm,validate1,validate>refuse; action_back_to_approval:Back to Approval:validate,refuse>confirm; action_cancel:Cancel:confirm,validate1>cancel; approve:!Approve:confirm>validate1; validate:!Validate:confirm,validate1>validate; refuse:Refuse:confirm,validate1>refuse',
    views: 'calendar,list,kanban,form,pivot,graph',
    cal: 'date_from,date_to',
  }),
  M('hr.leave.allocation', 'Time Off Allocation', {
    f: `name:char!:Description; employee_id:m2o(hr.employee)!; holiday_status_id:m2o(hr.leave.type)!;
        allocation_type:sel(regular=Regular Allocation|accrual=Accrual Allocation)=regular;
        date_from:date!=today; date_to:date; number_of_days:float=21; company_id:m2o(res.company);
        state:sel(confirm=To Approve|refuse=Refused|validate1=Second Approval|validate=Approved)=confirm`,
    buttons: 'action_approve:!Approve:confirm>validate; action_refuse:Refuse:confirm,validate>refuse',
    views: 'list,kanban,form,pivot',
  }),
  M('hr.leave.accrual.plan', 'Time Off Accrual Plan', {
    f: 'name:char!; time_off_type_id:m2o(hr.leave.type); transition_mode:sel(immediately=Immediately|end_of_accrual=After this accrual period)=immediately; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('resource.calendar.leaves', 'Public Holiday', {
    f: 'name:char!; date_from:datetime!=now; date_to:datetime!=now; calendar_id:m2o(resource.calendar); company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('hr.leave.mandatory.day', 'Mandatory Day', {
    f: 'name:char!; start_date:date!=today; end_date:date!=today; color:integer=1; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('hr.expense', 'Expense', {
    f: `name:char!:Description; employee_id:m2o(hr.employee)!; product_id:m2o(hr.expense.category);
        category:sel(travel=Travel & Transport|supplies=Lab & Classroom Supplies|meals=Staff Meals|events=Sports & Events)=supplies;
        quantity:float=1; price_unit:money=0; tax_amount:money=0;
        total_amount:money!; date:date!=today;
        payment_mode:sel(own_account=Employee (to reimburse)|company_account=Company)=own_account;
        account_move_id:m2o(account.move); company_id:m2o(res.company);
        state:sel(draft=Draft|submitted=Submitted|reported=Submitted|approved=Approved|posted=Posted|in_payment=In Payment|paid=Paid|done=Paid|refused=Refused)=draft`,
    buttons: 'action_submit:!Submit:draft>submitted; action_approve:!Approve:submitted,reported>approved; action_post:!Post Journal Entries:approved>posted; action_refuse:Refuse:submitted,reported,approved>refused; action_reset:Reset:submitted,reported,approved,refused>draft; submit:!Submit:draft>reported; approve:!Approve:reported,submitted>approved; pay:!Pay:approved,posted>done',
    smart: 'Journal Entry:account.move:id',
    views: 'list,kanban,form,pivot,graph',
  }),
  M('multi.request', 'Approval Request', {
    f: `name:char!; approval_type_id:m2o(multi.approval.type);
        approval_type:sel(fee_waiver=Fee Waiver / Scholarship|private_igcse=Private IGCSE Subject|procurement=CapEx Purchase|withdrawal=Caution Refund)=fee_waiver;
        user_id:m2o(res.users); partner_id:m2o(res.partner);
        date:date!=today; date_confirmed:datetime; date_start:date; date_end:date;
        location:char; quantity:float=1; amount:money=0; reference:char; reason:text!;
        company_id:m2o(res.company);
        state:sel(new=To Submit|draft=To Submit|pending=Submitted|submitted=Submitted|approved=Approved|refused=Refused|cancel=Cancelled)=draft`,
    buttons: 'action_confirm:!Submit:new,draft>pending; action_approve:!Approve:pending,submitted>approved; action_refuse:Refuse:pending,submitted>refused; action_cancel:Cancel:pending,submitted,approved>cancel; action_draft:Back To Draft:cancel,refused>new; submit:!Submit:draft,new>submitted; approve:!Approve:submitted,pending>approved; refuse:Refuse:submitted,pending>refused',
    tabs: 'Description:reason|Details:location,partner_id,quantity,amount,reference',
    views: 'kanban,list,form',
  }),

  // Modules 29–33: Finance & Commercial
  M('sale.order', 'Sales Order', {
    f: `name:char~!; partner_id:m2o(res.partner)!:Customer;
        partner_invoice_id:m2o(res.partner):Invoice Address; partner_shipping_id:m2o(res.partner):Delivery Address;
        sale_order_template_id:m2o(sale.order.template):Quotation Template;
        validity_date:date:Expiration; date_order:datetime=now;
        pricelist_id:m2o(product.pricelist):Pricelist; payment_term_id:m2o(account.payment.term):Payment Terms;
        user_id:m2o(res.users):Salesperson; team_id:m2o(crm.team):Sales Team;
        amount_untaxed:money=0; amount_tax:money=0; amount_total:money!;
        order_summary:text:Items (Uniforms / Books / Services);
        order_line:o2m(sale.order.line,order_id):Order Lines;
        invoice_status:sel(upselling=Upselling Opportunity|invoiced=Fully Invoiced|to invoice=To Invoice|no=Nothing to Invoice)=to invoice;
        delivery_count:integer=0; invoice_count:integer=0;
        note:text:Terms and Conditions; company_id:m2o(res.company);
        state:sel(draft=Quotation|sent=Quotation Sent|sale=Sales Order|cancel=Cancelled)=draft`,
    buttons: 'action_quotation_send:!Send:draft,sent,sale@; action_confirm:!Confirm:draft,sent>sale; create_invoice:!Create Invoice:sale@; action_cancel:Cancel:draft,sent,sale>cancel; action_draft:Set to Quotation:cancel>draft; send:Send Quotation:draft>sent; confirm:!Confirm Order:draft,sent>sale',
    smart: 'Invoices:account.move:partner_id|Delivery:stock.picking:partner_id',
    tabs: 'Order Lines:order_line,order_summary,note|Other Info:user_id,team_id,payment_term_id,pricelist_id,invoice_status,company_id',
    views: 'list,kanban,form,calendar,pivot,graph',
    cal: 'date_order',
  }),
  M('sale.order.line', 'Sales Order Line', {
    f: `order_id:m2o(sale.order)!; product_id:m2o(product.template)!:Product;
        name:char!:Description; product_uom_qty:float=1:Quantity;
        price_unit:money=0:Unit Price; price_subtotal:money=0:Subtotal; company_id:m2o(res.company)`,
    list: 'product_id,name,product_uom_qty,price_unit,price_subtotal',
    views: 'list,form',
  }),
  M('crm.team', 'Sales Team', {
    f: `name:char!; user_id:m2o(res.users):Team Leader; invoiced_target:money=1500000:Invoicing Target;
        alias_name:char:Email Alias; use_leads:bool=true; use_opportunities:bool=true;
        member_ids:m2m(res.users):Members; active:bool=true; company_id:m2o(res.company)`,
    tabs: 'Members:member_ids',
    views: 'kanban,list,form',
  }),
  M('product.product', 'Product Variant', {
    nocompany: true,
    f: `name:char!; default_code:char:Internal Reference; barcode:char;
        product_tmpl_id:m2o(product.template):Product Template; categ_id:m2o(product.category):Product Category;
        lst_price:money=0:Sales Price; standard_price:money=0:Cost;
        qty_available:float=100:On Hand; virtual_available:float=100:Forecasted;
        active:bool=true`,
    views: 'kanban,list,form',
  }),
  M('product.pricelist', 'Pricelist', {
    f: `name:char!; currency_id:m2o(res.currency); code:char; selectable:bool=true;
        active:bool=true; company_id:m2o(res.company)`,
    buttons: 'action_open_pricelist_report:Print:*@',
    views: 'list,kanban,form',
  }),
  M('sale.report', 'Sales Analysis Report', {
    f: `name:char:Order Reference; partner_id:m2o(res.partner):Customer; product_id:m2o(product.template):Product;
        user_id:m2o(res.users):Salesperson; team_id:m2o(crm.team):Sales Team;
        date:date=today; price_total:money=0:Total; state:char=sale; company_id:m2o(res.company)`,
    views: 'graph,pivot,list,form',
  }),
  M('sale.order.template', 'Quotation Template', {
    f: 'name:char!; number_of_days:integer=30:Quotation Duration; note:text:Terms and Conditions; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('quotation.document', 'Header / Footer Document', {
    f: 'name:char!; document_type:sel(header=Header|footer=Footer)=header; active:bool=true; company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('delivery.carrier', 'Delivery Method', {
    f: 'name:char!; delivery_type:sel(fixed=Fixed Price|base_on_rule=Based on Rules)=fixed; fixed_price:money=500; is_published:bool=true; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('crm.tag', 'CRM / Sales Tag', {
    nocompany: true,
    f: 'name:char!; color:integer=1',
    views: 'list,form',
  }),
  M('product.attribute', 'Product Attribute', {
    nocompany: true,
    f: 'name:char!; display_type:sel(radio=Radio|pills=Pills|select=Select|color=Color)=radio; create_variant:sel(always=Instantly|dynamic=Dynamically|no_variant=Never)=always',
    views: 'list,form',
  }),
  M('product.combo', 'Product Combo Choice', {
    f: 'name:char!; base_price:money=0; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('product.tag', 'Product Tag', {
    nocompany: true,
    f: 'name:char!; color:integer=1; visible_to_customers:bool=true',
    views: 'list,form',
  }),
  M('account.move', 'Invoice / Fee Statement', {
    f: `name:char~!; move_type:sel(out_invoice=Student / Customer Invoice|in_invoice=Vendor Bill|out_refund=Credit Note / Caution Refund|in_refund=Vendor Refund|entry=Journal Entry)=out_invoice;
        partner_id:m2o(res.partner)!:Customer; student_id:m2o(op.student):Student; admission_id:m2o(op.admission);
        fee_category:sel(tuition=Termly Tuition|admission=Admission Fee|caution=Caution Money Deposit|clubs=Paid Specialist Club|transport=School Transport|exam_board=CAIE / Edexcel Exam Fee|other=Other)=tuition;
        invoice_date:date!=today; invoice_date_due:date!; date:date=today; line_description:char:Fee Breakdown;
        amount_total:money!; amount_residual:money~:Balance Due; etims_cu_no:char~:KRA eTIMS CU Invoice No;
        ref:char; payment_reference:char; payment_count:integer=0;
        journal_id:m2o(account.journal); currency_id:m2o(res.currency); company_id:m2o(res.company);
        invoice_line_ids:o2m(account.move.line,move_id):Invoice Lines; narration:text:Terms and Conditions;
        state:sel(draft=Draft|posted=Posted|cancel=Cancelled)=draft;
        payment_state:sel(not_paid=Not Paid|in_payment=In Payment|partial=Partially Paid|paid=Paid|reversed=Reversed)=not_paid`,
    list: 'name,partner_id,invoice_date,invoice_date_due,amount_total,payment_state,state',
    tabs: 'Invoice Lines:invoice_line_ids|Journal Items:invoice_line_ids|Other Info:move_type,fee_category,admission_id,etims_cu_no,line_description,ref,payment_reference',
    buttons: 'action_post:!Confirm:draft@; action_register_payment:!Pay:posted@; action_invoice_sent:Send:posted@; action_print_pdf:Print:posted@; pay_mpesa:Pay via M-Pesa:posted@; action_reverse:Credit Note:posted@; button_draft:Reset to Draft:posted,cancel>draft; button_cancel:Cancel:draft>cancel; mark_paid:Mark Paid:posted@; send_invoice:!Send:posted@; print_invoice:!Print:posted@; action_credit_note:Credit Note:posted@; action_reset_to_draft:Reset to Draft:posted,cancel>draft; cancel:Cancel:draft>cancel',
    smart: 'Payments:account.payment:move_id',
    views: 'list,kanban,form,pivot,graph',
    ribbon: 'payment_state=paid:PAID; payment_state=in_payment:IN PAYMENT; state=posted:CONFIRMED; state=cancel:CANCELLED',
    portal: { studentField: 'student_id', partnerField: 'partner_id' },
  }),
  M('account.move.line', 'Invoice Line', {
    f: `move_id:m2o(account.move)!:Invoice; name:char!:Product / Description;
        account_id:m2o(account.account); product_id:m2o(product.template);
        account_name:char:Account=400000 Academic Tuition Revenue;
        quantity:float!=1; price_unit:money!:Price; tax_label:char:Taxes=0% Exempt;
        price_subtotal:money~:Amount; company_id:m2o(res.company)`,
    list: 'name,product_id,quantity,price_unit,tax_label,price_subtotal',
  }),
  M('purchase.order', 'Purchase Order', {
    f: `name:char~!; priority:priority=0; partner_id:m2o(res.partner)!:Vendor;
        partner_ref:char:Vendor Reference; date_order:datetime=now:Order Deadline;
        date_approve:datetime:Confirmation Date; date_planned:datetime=now:Expected Arrival;
        picking_type_id:m2o(stock.picking.type):Deliver To;
        order_summary:text:Items; order_line:o2m(purchase.order.line,order_id):Products;
        amount_total:money!; invoice_count:integer=0; incoming_picking_count:integer=1;
        company_id:m2o(res.company);
        state:sel(draft=RFQ|sent=RFQ Sent|to approve=To Approve|purchase=Purchase Order|cancel=Cancelled)=draft`,
    buttons: 'action_rfq_send:!Send RFQ:draft,sent@; button_confirm:!Confirm Order:draft,sent>purchase; button_approve:!Approve Order:to approve>purchase; action_view_picking:!Receive:purchase@; button_draft:Set to Draft:cancel>draft; button_cancel:Cancel:draft,sent,to approve,purchase>cancel; confirm:!Confirm Order:draft,sent>purchase',
    smart: 'Receipt:stock.picking:partner_id|Vendor Bills:account.move:partner_id',
    tabs: 'Products:order_line,order_summary|Other Information:date_approve,picking_type_id,company_id',
    views: 'list,kanban,form,pivot,graph,calendar',
    cal: 'date_order',
  }),
  M('purchase.order.line', 'Purchase Order Line', {
    f: `order_id:m2o(purchase.order)!; product_id:m2o(product.template)!:Product;
        name:char!:Description; product_qty:float=1:Quantity;
        price_unit:money=0:Unit Price; price_subtotal:money=0:Subtotal; company_id:m2o(res.company)`,
    list: 'product_id,name,product_qty,price_unit,price_subtotal',
    views: 'list,form',
  }),
  M('purchase.report', 'Purchase Analysis Report', {
    f: `name:char; partner_id:m2o(res.partner):Vendor; product_id:m2o(product.template):Product;
        date_order:date=today; price_total:money=0:Total; state:char=purchase; company_id:m2o(res.company)`,
    views: 'graph,pivot,list',
  }),
  M('product.supplierinfo', 'Vendor Pricelist', {
    f: `partner_id:m2o(res.partner)!:Vendor; product_tmpl_id:m2o(product.template):Product;
        min_qty:float=1:Quantity; price:money=0:Price; delay:integer=3:Delivery Lead Time; company_id:m2o(res.company)`,
    views: 'list,form,kanban',
  }),
  M('stock.picking.type', 'Operation Type', {
    f: `name:char!; code:sel(incoming=Receipt|outgoing=Delivery|internal=Internal Transfer)=incoming;
        sequence_code:char!; warehouse_id:m2o(stock.warehouse):Warehouse;
        count_picking_ready:integer=2:To Process; count_picking_waiting:integer=0:Waiting;
        count_picking_late:integer=0:Late; color:integer=1; active:bool=true; company_id:m2o(res.company)`,
    smart: 'Transfers:stock.picking:picking_type_id',
    views: 'kanban,list,form',
  }),
  M('stock.picking', 'Inventory Transfer', {
    f: `name:char~!; priority:priority=0;
        picking_type_id:m2o(stock.picking.type):Operation Type;
        picking_type:sel(incoming=Receipt|outgoing=Delivery Order|internal=Internal Transfer)=incoming;
        partner_id:m2o(res.partner):Contact; scheduled_date:datetime=now;
        date_done:datetime:Effective Date; origin:char:Source Document;
        items_summary:text; move_ids:o2m(stock.move,picking_id):Operations;
        company_id:m2o(res.company);
        state:sel(draft=Draft|waiting=Waiting|confirmed=Waiting|assigned=Ready|done=Done|cancel=Cancelled)=assigned`,
    buttons: 'action_confirm:!Mark as Todo:draft>assigned; action_assign:!Check Availability:confirmed,waiting>assigned; button_validate:!Validate:draft,confirmed,waiting,assigned>done; action_cancel:Cancel:draft,waiting,confirmed,assigned>cancel; validate:!Validate Transfer:draft,assigned>done',
    smart: 'Moves:stock.move:picking_id',
    tabs: 'Operations:move_ids,items_summary|Additional Info:picking_type_id,picking_type,origin,date_done,company_id',
    views: 'list,kanban,form,calendar',
    cal: 'scheduled_date',
  }),
  M('stock.scrap', 'Stock Scrap', {
    f: `name:char~!; product_id:m2o(product.template)!:Product; scrap_qty:float=1:Quantity;
        lot_id:m2o(stock.lot):Lot/Serial; picking_id:m2o(stock.picking):Picking;
        origin:char:Source Document; should_replenish:bool=false; date_done:datetime;
        company_id:m2o(res.company);
        state:sel(draft=Draft|done=Done)=draft`,
    buttons: 'action_validate:!Validate:draft>done',
    views: 'list,form,kanban,pivot,graph',
  }),
  M('stock.lot', 'Lot / Serial Number', {
    f: `name:char!:Lot/Serial Number; product_id:m2o(product.template)!:Product;
        ref:char:Internal Reference; product_qty:float=1:On Hand Quantity;
        standard_price:money=0:Cost; note:text:Description; company_id:m2o(res.company)`,
    views: 'list,form',
  }),
  M('stock.move', 'Stock Move', {
    f: `name:char!:Description; picking_id:m2o(stock.picking); product_id:m2o(product.template)!:Product;
        product_uom_qty:float=1:Demand; quantity:float=1:Quantity;
        date:datetime=now; reference:char;
        state:sel(draft=New|confirmed=Waiting|assigned=Available|done=Done|cancel=Cancelled)=done;
        company_id:m2o(res.company)`,
    views: 'list,form,pivot,graph',
  }),
  M('stock.move.line', 'Product Move History', {
    f: `reference:char!; move_id:m2o(stock.move); picking_id:m2o(stock.picking);
        product_id:m2o(product.template)!:Product; lot_id:m2o(stock.lot):Lot/Serial Number;
        quantity:float=1:Quantity; date:datetime=now;
        state:sel(draft=Draft|assigned=Ready|done=Done|cancel=Cancelled)=done;
        company_id:m2o(res.company)`,
    views: 'list,kanban,pivot,form',
  }),
  M('stock.warehouse', 'Warehouse', {
    f: `name:char!; code:char!:Short Name; partner_id:m2o(res.partner):Address;
        active:bool=true; company_id:m2o(res.company)`,
    views: 'list,form',
  }),
  M('stock.warehouse.orderpoint', 'Replenishment / Reordering Rule', {
    f: `name:char~!; product_id:m2o(product.template)!:Product; warehouse_id:m2o(stock.warehouse):Warehouse;
        product_min_qty:float=10:Min Quantity; product_max_qty:float=100:Max Quantity;
        qty_to_order:float=25:To Order; trigger:sel(auto=Auto|manual=Manual)=auto; company_id:m2o(res.company)`,
    buttons: 'action_replenish:!Order Once:*@',
    views: 'list,form',
  }),
  M('crm.lead', 'Admission / CRM Lead', {
    f: `name:char!:Opportunity; type:sel(lead=Lead|opportunity=Opportunity)=opportunity;
        contact_name:char!; partner_id:m2o(res.partner):Customer;
        email_from:char!; phone:char!;
        user_id:m2o(res.users):Salesperson; team_id:m2o(crm.team):Sales Team;
        target_campus:m2o(res.company):Target Campus; target_course:m2o(op.course):Interested Year Group;
        student_id:m2o(op.student):Converted Student;
        expected_revenue:money:Est. Annual Fees=950000; probability:float=60; priority:priority:Priority=1;
        tag_ids:m2m(crm.tag):Tags; lost_reason_id:m2o(crm.lost.reason):Lost Reason;
        quotation_count:integer=0; sale_order_count:integer=0;
        stage:sel(new=New Inquiry|qualified=Qualified|proposition=Campus Tour / Assessment|won=Enrolled|lost=Lost)=new;
        description:text:Internal Notes; active:bool=true; company_id:m2o(res.company)`,
    buttons: 'action_sale_quotations_new:!New Quotation:new,qualified,proposition@; action_set_won_rainbowman:!Won:new,qualified,proposition>won; convert_to_student:!Convert To Student:new,qualified,proposition@; action_set_lost:Lost:new,qualified,proposition>lost; action_restore:Restore:lost>new; mark_won:Mark Won:new,qualified,proposition>won',
    smart: 'Quotations:sale.order:partner_id',
    tabs: 'Internal Notes:description|Extra Info:contact_name,email_from,phone,target_campus,target_course,user_id,team_id,lost_reason_id',
    views: 'kanban,list,form,calendar,pivot,graph',
    ribbon: 'stage=won:WON; stage=lost:LOST',
  }),
  M('crm.lost.reason', 'Lost Reason', {
    nocompany: true,
    f: 'name:char!; leads_count:integer=0; active:bool=true',
    views: 'list,form',
  }),
  M('crm.iap.lead.mining.request', 'Lead Mining Request', {
    f: `name:char~!; search_type:sel(companies=Companies|people=Companies and their Contacts)=companies;
        lead_count:integer=20:Number of Leads; team_id:m2o(crm.team):Sales Team; user_id:m2o(res.users):Salesperson;
        state:sel(draft=Draft|done=Done|error=Error)=draft; company_id:m2o(res.company)`,
    buttons: 'action_submit:!Submit:draft>done',
    views: 'list,form',
  }),
  M('crm.activity.report', 'CRM Activities Analysis', {
    f: `date:datetime=now; lead_id:m2o(crm.lead):Opportunity; user_id:m2o(res.users):Salesperson;
        team_id:m2o(crm.team):Sales Team; mail_activity_type_id:m2o(mail.activity.type):Activity Type;
        body:text:Activity Description; company_id:m2o(res.company)`,
    views: 'graph,pivot,list',
  }),

  // Modules 34–38, 40, 47: Website, Marketing, WhatsApp, Live Chat, Surveys, Discuss
  M('website.page', 'Website Page / Blog / Forum', {
    nocompany: true,
    f: `name:char!; url:char!; page_type:sel(page=Page|blog=Blog Post|forum=Forum)=page;
        is_published:bool=true; summary:text; body:html`,
    views: 'list,kanban,form',
    ribbon: 'is_published=true:PUBLISHED',
  }),
  M('blog.post', 'Blog Post', {
    f: `name:char!:Title; subtitle:char; blog_id:m2o(blog.blog); author_id:m2o(res.partner);
        published_date:date=today; is_published:bool=true; visits:integer=120; content:html; company_id:m2o(res.company)`,
    views: 'list,kanban,form',
    ribbon: 'is_published=true:PUBLISHED',
  }),
  M('blog.blog', 'Blog', {
    f: 'name:char!; subtitle:char; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('blog.tag', 'Blog Tag', {
    nocompany: true,
    f: 'name:char!; category_id:m2o(blog.tag.category); color:integer=1',
    views: 'list,form',
  }),
  M('blog.tag.category', 'Blog Tag Category', {
    nocompany: true,
    f: 'name:char!',
    views: 'list,form',
  }),
  M('forum.post', 'Forum Post', {
    f: `name:char!:Title; forum_id:m2o(forum.forum); create_uid:m2o(res.users);
        views:integer=45; vote_count:integer=8; state:sel(active=Active|close=Closed)=active; content:html; company_id:m2o(res.company)`,
    views: 'list,kanban,graph,form',
  }),
  M('forum.forum', 'Forum', {
    f: 'name:char!; mode:sel(questions=Questions|discussions=Discussions)=questions; default_order:char=last_activity_date; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('gamification.karma.rank', 'Forum Karma Rank', {
    nocompany: true,
    f: 'name:char!; karma_min:integer=100; description:text',
    views: 'list,form',
  }),
  M('forum.tag', 'Forum Tag', {
    f: 'name:char!; forum_id:m2o(forum.forum); posts_count:integer=5; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('forum.post.reason', 'Forum Close Reason', {
    nocompany: true,
    f: 'name:char!; reason_type:char=basic',
    views: 'list,form',
  }),
  M('website.technical.page', 'Technical Website Page', {
    nocompany: true,
    f: 'name:char!; view_key:char!; website_url:char!',
    views: 'list,form',
  }),
  M('product.public.category', 'eCommerce Category', {
    f: 'name:char!; parent_id:m2o(product.public.category); sequence:integer=10; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('product.ribbon', 'Product Ribbon', {
    nocompany: true,
    f: 'name:char!; bg_color:char=#1565C0; text_color:char=#FFFFFF; position:sel(left=Left|right=Right)=left',
    views: 'list,form',
  }),
  M('website.visitor', 'Website Visitor', {
    f: 'name:char!; partner_id:m2o(res.partner); visit_count:integer=3; page_count:integer=12; last_connection_datetime:datetime=now; is_connected:bool=true; company_id:m2o(res.company)',
    views: 'kanban,list,form,graph',
  }),
  M('website.track', 'Website Page View', {
    f: 'visitor_id:m2o(website.visitor); page_id:m2o(website.page); url:char!; visit_datetime:datetime=now; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('mailing.mailing', 'Email Mailing', {
    f: `subject:char!; mailing_model_name:char=All Enrolled Parents; target_audience:char=All Enrolled Parents;
        body_html:html; sent:integer=145; sent_count:integer=145~; opened_ratio:float=68; replied_ratio:float=12; clicks_ratio:float=34; open_rate:float=68~;
        schedule_date:datetime; favorite:bool=false; company_id:m2o(res.company);
        state:sel(draft=Draft|in_queue=In Queue|sending=Sending|done=Sent)=draft`,
    buttons: 'action_launch:!Send:draft@; action_schedule:Schedule:draft>in_queue; action_test:Test:*@; action_cancel:Cancel:in_queue>draft; send_now:!Send Now:draft@',
    rec: 'subject',
    views: 'list,kanban,form,calendar,graph',
    cal: 'schedule_date',
  }),
  M('mailing.list', 'Mailing List', {
    f: 'name:char!; contact_count:integer=320; is_public:bool=true; active:bool=true; company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('mailing.contact', 'Mailing List Contact', {
    f: 'name:char!; email:char!; company_name:char; opt_out:bool=false; company_id:m2o(res.company)',
    views: 'list,kanban,form,graph,pivot',
  }),
  M('mailing.trace.report', 'Mass Mailing Analysis', {
    f: 'name:char!; mailing_type:char=mail; scheduled_date:date=today; sent:integer=145; opened:integer=98; replied:integer=14; clicked:integer=42; state:char=done; company_id:m2o(res.company)',
    views: 'graph,pivot,list',
  }),
  M('mailing.subscription', 'Mailing List Subscription', {
    f: 'contact_id:m2o(mailing.contact); list_id:m2o(mailing.list); opt_out:bool=false; opt_out_datetime:datetime; company_id:m2o(res.company)',
    views: 'graph,pivot,list,form',
  }),
  M('link.tracker', 'Link Tracker', {
    f: 'title:char!; url:char!; short_url:char; count:integer=58; company_id:m2o(res.company)',
    views: 'list,form,graph,pivot',
  }),
  M('mail.blacklist', 'Blacklisted Email Address', {
    nocompany: true,
    f: 'email:char!; active:bool=true',
    views: 'list,form',
  }),
  M('mailing.subscription.optout', 'Optout Reason', {
    nocompany: true,
    f: 'name:char!; sequence:integer=10; is_feedback:bool=false',
    views: 'list,form',
  }),
  M('mailing.filter', 'Favorite Mailing Filter', {
    f: 'name:char!; mailing_model_name:char=op.student; mailing_domain:char=[]; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('marketing.campaign', 'Automated Campaign', {
    f: `name:char!; target_model:char=Admissions / Parents; participants_count:integer=45;
        workflow_summary:text; company_id:m2o(res.company);
        state:sel(draft=New|new=New|running=Running|stopped=Stopped)=running`,
    buttons: 'action_start_campaign:!Start:draft,new,stopped>running; action_stop_campaign:Stop:running>stopped; start:!Start:new,draft,stopped>running; stop:Stop:running>stopped',
    views: 'kanban,list,form',
  }),
  M('marketing.trace', 'Marketing Automation Trace', {
    f: 'campaign_id:m2o(marketing.campaign); participant_id:m2o(marketing.participant); activity_type:char=email; state:sel(scheduled=Scheduled|processed=Processed|rejected=Rejected|canceled=Cancelled)=processed; schedule_date:datetime=now; company_id:m2o(res.company)',
    views: 'graph,pivot,list,form',
  }),
  M('marketing.participant', 'Marketing Participant', {
    f: 'name:char!; campaign_id:m2o(marketing.campaign); model_name:char=op.admission; state:sel(running=Running|completed=Completed|unlinked=Removed)=running; company_id:m2o(res.company)',
    views: 'graph,pivot,list,form',
  }),
  M('whatsapp.campaign', 'WhatsApp Campaign / Broadcast', {
    f: `name:char!; whatsapp_business_id:m2o(whatsapp.business);
        template_name:char=Parent Notice / Fee Reminder; target_model:char=Parents & Guardians;
        total_participant_count:integer=120; message_preview:text!; sent_count:integer=120~;
        company_id:m2o(res.company);
        state:sel(draft=Draft|new=New|running=Running|stopped=Stopped)=new`,
    buttons: 'action_start_campaign:!Start:draft,new,stopped>running; action_stop_campaign:Stop:running>stopped; generate_campaign_participants:Generate Participants:running@; execute_activities:Execute Activities:running@; start:!Send Broadcast:new,draft@; stop:Stop:running>stopped',
    smart: 'Participants:whatsapp.campaign.participants:campaign_id',
    views: 'kanban,list,form',
  }),
  M('whatsapp.contact', 'WhatsApp Contact', {
    f: 'name:char!; mobile:char!; partner_id:m2o(res.partner); is_blocked:bool=false; last_messaged:datetime=now; company_id:m2o(res.company)',
    views: 'list,form,pivot',
  }),
  M('whatsapp.activity.trace', 'WhatsApp Activity Trace', {
    f: 'name:char!; campaign_id:m2o(whatsapp.campaign); state:sel(scheduled=Scheduled|sent=Sent|delivered=Delivered|read=Read|replied=Replied|failed=Failed)=delivered; scheduled_date:datetime=now; company_id:m2o(res.company)',
    views: 'graph,pivot,list,form',
  }),
  M('whatsapp.campaign.participants', 'WhatsApp Campaign Participant', {
    f: 'name:char!; campaign_id:m2o(whatsapp.campaign); contact_id:m2o(whatsapp.contact); state:sel(running=Running|completed=Completed)=running; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('whatsapp.business', 'WhatsApp Business Account', {
    f: 'name:char!; phone_number:char!; phone_number_id:char; waba_id:char; state:sel(draft=Draft|verified=Verified)=verified; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('whatsapp.template', 'WhatsApp Template', {
    f: 'name:char!; category:sel(utility=Utility|marketing=Marketing|authentication=Authentication)=utility; lang_code:char=en; body:text!; state:sel(draft=Draft|approved=Approved)=approved; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('whatsapp.tag', 'WhatsApp Tag', {
    nocompany: true,
    f: 'name:char!; color:integer=2',
    views: 'list,form',
  }),
  M('whatsapp.template.library', 'WhatsApp Template Library', {
    nocompany: true,
    f: 'name:char!; category:char=Education; body_preview:text!',
    views: 'list,form',
  }),
  M('whatsapp.server.action', 'WhatsApp Server Action', {
    f: 'name:char!; model_name:char=op.admission; template_id:m2o(whatsapp.template); company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('whatsapp.team.assignment', 'WhatsApp Team Assignment', {
    f: 'name:char!; user_id:m2o(res.users); max_chats:integer=20; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('im_livechat.channel', 'Live Chat Channel', {
    f: 'name:char!; chatbot_name:char=Oshwal Admissions Bot; url_regex:char=/admissions; happy_pct:float=92; company_id:m2o(res.company)',
    views: 'kanban,list,form,graph',
  }),
  M('im_livechat.channel.member.history', 'Live Chat Agent History', {
    f: 'channel_id:m2o(im_livechat.channel); partner_id:m2o(res.partner):Agent; session_count:integer=18; rating:float=4.8; company_id:m2o(res.company)',
    views: 'pivot,graph,list',
  }),
  M('im_livechat.report.channel', 'Live Chat Session Report', {
    f: 'channel_id:m2o(im_livechat.channel); start_date:date=today; duration_mins:float=8.5; messages_count:integer=12; rating:float=5; company_id:m2o(res.company)',
    views: 'graph,pivot,list',
  }),
  M('mail.canned.response', 'Canned Response', {
    nocompany: true,
    f: 'source:char!:Shortcut; substitution:text!:Substitution; description:char',
    views: 'list,form,kanban',
  }),
  M('chatbot.script', 'Chatbot Script', {
    f: 'title:char!; active:bool=true; operator_partner_id:m2o(res.partner); company_id:m2o(res.company)',
    rec: 'title',
    views: 'list,form',
  }),
  M('im_livechat.expertise', 'Live Chat Expertise', {
    nocompany: true,
    f: 'name:char!',
    views: 'list,form',
  }),
  M('im_livechat.conversation.tag', 'Live Chat Tag', {
    nocompany: true,
    f: 'name:char!; color:integer=1',
    views: 'list,form',
  }),
  M('survey.survey', 'Survey / Parent Feedback', {
    f: `title:char!; survey_type:sel(survey=Parent Satisfaction|assessment=Teacher Eval|live_session=Open Day Poll)=survey;
        questions_count:integer=8; answer_count:integer=42; participants_count:integer=42;
        active:bool=true; company_id:m2o(res.company);
        state:sel(open=Published|closed=Closed)=open`,
    buttons: 'action_send_survey:!Share:*@; action_test_survey:Test:*@; action_result_survey:See Results:*@',
    smart: 'Participations:survey.user_input:survey_id',
    rec: 'title',
    views: 'kanban,list,form,graph',
  }),
  M('survey.user_input', 'Survey Participation', {
    f: 'survey_id:m2o(survey.survey)!; partner_id:m2o(res.partner); email:char; scoring_percentage:float=90; state:sel(new=Not Started|in_progress=In Progress|done=Completed)=done; company_id:m2o(res.company)',
    views: 'list,kanban,form',
  }),
  M('survey.question', 'Survey Question', {
    f: 'title:char!; survey_id:m2o(survey.survey)!; question_type:sel(simple_choice=Multiple choice: only one answer|multiple_choice=Multiple choice: multiple answers allowed|text_box=Multiple Lines Text Box|char_box=Single Line Text Box)=simple_choice; constr_mandatory:bool=true; company_id:m2o(res.company)',
    rec: 'title',
    views: 'list,form',
  }),
  M('survey.question.answer', 'Survey Suggested Value', {
    f: 'value:char!; question_id:m2o(survey.question)!; is_correct:bool=false; answer_score:float=10; company_id:m2o(res.company)',
    rec: 'value',
    views: 'list,form',
  }),
  M('survey.user_input.line', 'Survey Detailed Answer', {
    f: 'user_input_id:m2o(survey.user_input)!; survey_id:m2o(survey.survey); question_id:m2o(survey.question); answer_type:char=text_box; value_char_box:char; answer_score:float=10; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('discuss.channel', 'Discuss Channel', {
    nocompany: true,
    f: `name:char!; channel_type:sel(channel=Public Channel|group=Staff Group|chat=Direct Message)=channel;
        description:char; members_count:integer=12`,
    views: 'kanban,list,pivot,graph,form',
  }),
  M('res.role', 'Discuss Role', {
    nocompany: true,
    f: 'name:char!; description:char',
    views: 'list,form',
  }),

  // Modules 42–46, 49: Dashboards, Calendar, Online Appointments, Documents (DMS), E-Sign, Spreadsheets
  M('board.board', 'Personal Dashboard', {
    f: 'name:char=My Dashboard; layout:char=2-1; company_id:m2o(res.company)',
    views: 'form,list',
  }),
  M('spreadsheet.dashboard.group', 'Dashboard Group', {
    f: 'name:char!; sequence:integer=10; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('dashboard_pro.main_dashboard', 'KPI Dashboard Definition', {
    f: 'name:char!; theme:char=OpenEduCat Executive; is_active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('calendar.online.appointment', 'Online Appointment Type', {
    nocompany: true,
    f: `name:char!; code:char!; duration_hours:float=0.5; staff_in_charge:char; share_url:char~;
        is_published:bool=true; description:text`,
    views: 'kanban,list,form',
    ribbon: 'is_published=true:PUBLISHED',
  }),
  M('calendar.appointment.resource', 'Online Appointment Resource', {
    f: 'name:char!; capacity:integer=1; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('calendar.event', 'Calendar Event / Meeting', {
    f: `name:char!:Meeting Subject; start_date:datetime!=now; stop_date:datetime!=now; location:char;
        course_ids:m2m(op.course):Courses; batch_ids:m2m(op.batch):Batches; meeting_url:char:Online Meeting URL;
        description:text`,
    buttons: 'generate_meeting_link:Create Online Meeting:*@',
    views: 'calendar,list,form',
    cal: 'start_date,stop_date',
  }),
  M('dms.file', 'Document (DMS)', {
    f: `name:char!; directory_id:m2o(dms.directory); directory:char=OERB Policies & Compliance;
        category_id:m2o(dms.category);
        category:sel(policy=School Policy|circular=Circular|student_doc=Student Record|hr_doc=Child Protection)=policy;
        tag_ids:m2m(dms.tag); extension:char=pdf; size_kb:integer=240; is_public_policy:bool=true; content_summary:text`,
    views: 'kanban,list,graph,pivot,form',
    panel: 'category',
  }),
  M('dms.tag', 'DMS Tag', {
    f: 'name:char!; category_id:m2o(dms.category); color:integer=1; company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('dms.category', 'DMS Category', {
    f: 'name:char!; parent_id:m2o(dms.category); active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('dms.storage', 'DMS Storage', {
    f: 'name:char!; save_type:sel(database=Database|file=Filestore|attachment=Attachment)=database; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('dms.access.group', 'DMS Access Group', {
    f: 'name:char!; perm_read:bool=true; perm_create:bool=true; perm_write:bool=true; perm_unlink:bool=false; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('e.sign.template', 'E-Sign Policy Template', {
    f: `name:char!; roles_required:char=Parent / Guardian; policy_code:char; description:text; company_id:m2o(res.company)`,
    buttons: 'create_request:!Send for Signature:*@',
    views: 'kanban,list,form',
  }),
  M('e.sign.request', 'E-Sign Signing Request', {
    f: `name:char~!; template_id:m2o(e.sign.template)!; signer_name:char!; signer_email:char!;
        student_id:m2o(op.student); admission_id:m2o(op.admission); is_sign_order:bool=true; sequential_order:bool=true;
        signers_summary:char:Signatory Chain; routing_progress:char=1 / 1 Signed; signed_date:datetime;
        access_url:char; company_id:m2o(res.company);
        state:sel(draft=Draft|sent=Sent for Signature|partially_signed=Partially Signed|signed=Fully Signed|canceled=Cancelled|cancelled=Cancelled)=sent`,
    buttons: 'sign_now:!Sign Document:sent,partially_signed@; open_preview:Preview:*@; action_resend:Resend:canceled,cancelled>sent; action_canceled:Cancel:sent,signed>canceled; cancel:Cancel:sent>cancelled',
    views: 'kanban,list,form',
    ribbon: 'state=signed:Fully Signed; state=partially_signed:Partially',
    portal: { studentField: 'student_id' },
  }),
  M('e.sign.items', 'E-Sign Field Type', {
    nocompany: true,
    f: 'name:char!; item_type:sel(signature=Signature|initial=Initial|text=Text|date=Date)=signature; required:bool=true',
    views: 'list,form',
  }),
  M('e.sign.item.role', 'E-Sign Signer Role', {
    nocompany: true,
    f: 'name:char!; color:integer=1',
    views: 'list,form',
  }),
  M('spreadsheet.spreadsheet', 'Spreadsheet', {
    f: 'name:char!; category:char=Admissions & Fee Reconciliation; last_edited:datetime=now',
    views: 'list,form',
  }),
  M('hr.leave.type', 'Time Off Type', {
    f: 'name:char!; code:char; requires_allocation:bool=true; max_days:integer=21; color:integer=1; active:bool=true; company_id:m2o(res.company)',
    views: 'list,kanban,form',
  }),
  M('hr.expense.category', 'Expense Category', {
    f: 'name:char!; code:char; default_account:char=6100 Operating Expense; price_unit:money=0; active:bool=true; company_id:m2o(res.company)',
    views: 'list,kanban,form',
  }),
  M('multi.approval.type', 'Approval Type', {
    f: `name:char!; image:image; description:text; priority:integer=10;
        approval_minimum:integer=1; minimum_approvers:integer=1;
        apply_for_model:char; is_configured:bool=true; active:bool=true; company_id:m2o(res.company)`,
    buttons: 'action_configure:!Configure:*@; create_request:!Create New Request:*@',
    views: 'kanban,list,form',
  }),
  M('product.template', 'School Shop / Fee Product', { nocompany: true, f: 'name:char!; category:sel(uniform=School Uniform|books=Books & Stationery|fee=Academic / Club Fee|transport=Transport Service)=uniform; list_price:money!; qty_available:integer=100; is_published:bool=true; description:text', views: 'kanban,list,form', ribbon: 'is_published=true:IN SHOP' }),
  M('account.payment', 'Payment', {
    f: `name:char~!; payment_type:sel(inbound=Receive|outbound=Send)=inbound;
        partner_type:sel(customer=Customer|supplier=Vendor)=customer;
        partner_id:m2o(res.partner)!; student_id:m2o(op.student); amount:money!;
        date:date!=today; journal_id:m2o(account.journal)!;
        payment_method_line_id:char=Manual; memo:char; move_id:m2o(account.move);
        currency_id:m2o(res.currency); company_id:m2o(res.company);
        batch_payment_id:m2o(account.batch.payment);
        state:sel(draft=Draft|in_process=In Process|paid=Paid|cancel=Cancelled|rejected=Rejected)=draft`,
    buttons: 'action_post:!Confirm:draft>in_process; action_validate:!Validate:in_process>paid; action_draft:Reset to Draft:in_process,cancel,rejected>draft; action_cancel:Cancel:draft,in_process>cancel; action_reject:Reject:in_process>rejected; action_refund_wizard:Refund:paid@',
    smart: 'Invoices:account.move:id',
    list: 'date,name,journal_id,payment_type,partner_id,amount,state',
    views: 'list,kanban,form,graph,pivot',
  }),
  M('account.batch.payment', 'Batch Payment', {
    f: `name:char~!; batch_type:sel(customer=Customer|vendor=Vendor)=customer;
        journal_id:m2o(account.journal)!; date:date!=today;
        payment_ids:m2m(account.payment); company_id:m2o(res.company);
        state:sel(draft=Draft|sent=Sent|reconciled=Reconciled)=draft`,
    buttons: 'validate_batch_button:!Validate:draft>sent; print_batch_payment:Print:sent@',
    list: 'name,date,journal_id,batch_type,state',
    views: 'list,kanban,form',
  }),
  M('account.journal', 'Accounting Journal', {
    f: `name:char!; code:char!; type:sel(sale=Sales / Tuition|purchase=Purchases|bank=Bank & M-Pesa|cash=Cash|credit=Credit|general=Miscellaneous)=bank;
        default_account_id:m2o(account.account); suspense_account_id:m2o(account.account);
        default_account:char; company_id:m2o(res.company); active:bool=true`,
    smart: 'Journal Items:account.move.line:journal_id',
    list: 'name,type,code,company_id',
    views: 'kanban,list,form',
    kanban: { title: 'name', sub: 'code,type', groupBy: 'none' },
  }),
  M('account.account', 'Chart of Accounts', {
    f: `code:char!; name:char!; account_type:sel(asset_receivable=Receivable|liability_payable=Payable|asset_cash=Bank and Cash|asset_current=Current Assets|asset_non_current=Non-current Assets|liability_current=Current Liabilities|liability_non_current=Non-current Liabilities|equity=Equity|income=Income|expense=Expenses)=income;
        company_id:m2o(res.company); deprecated:bool=false`,
    list: 'code,name,account_type,company_id',
    views: 'list,kanban,form',
  }),
  M('account.tax', 'Tax', {
    f: `name:char!; type_tax_use:sel(sale=Sales|purchase=Purchases|none=None)=sale;
        amount_type:sel(percent=Percentage|fixed=Fixed)=percent; amount:float=0;
        company_id:m2o(res.company); active:bool=true`,
    list: 'name,type_tax_use,amount_type,amount,company_id',
    views: 'list,kanban,form',
  }),
  M('account.payment.term', 'Payment Terms', {
    f: 'name:char!; note:text; company_id:m2o(res.company); active:bool=true',
    list: 'name,company_id',
    views: 'list,kanban,form',
  }),
  M('account.fiscal.position', 'Fiscal Position', {
    f: 'name:char!; company_id:m2o(res.company); active:bool=true',
    list: 'name,company_id',
    views: 'list,kanban,form',
  }),
  M('account.journal.group', 'Journal Group / Multi-Ledger', {
    f: 'name:char!; sequence:integer=10; company_id:m2o(res.company)',
    list: 'sequence,name,company_id',
    views: 'list,form',
  }),
  M('account.asset.asset', 'Asset', {
    f: `name:char!; code:char; category_id:m2o(account.asset.category)!;
        date:date!=today; value:money!; salvage_value:money=0; value_residual:money;
        partner_id:m2o(res.partner); invoice_id:m2o(account.move);
        company_id:m2o(res.company);
        state:sel(draft=Draft|open=Running|oe_paused=Paused|close=Closed)=draft`,
    buttons: 'validate:!Confirm:draft>open; compute_depreciation_board:Compute Depreciation:draft@; action_oe_resume:Resume:oe_paused>open; action_oe_sell:Sell:open>close; action_oe_dispose:Dispose:open>close; set_to_draft:Set to Draft:open,close>draft',
    smart: 'Posted Entries:account.move:id',
    list: 'name,code,category_id,date,value,value_residual,state',
    views: 'list,kanban,form',
  }),
  M('account.asset.category', 'Asset Category', {
    f: `name:char!; journal_id:m2o(account.journal); account_asset_id:m2o(account.account);
        account_depreciation_id:m2o(account.account); account_expense_depreciation_id:m2o(account.account);
        method_time:sel(number=Number of Depreciations|end=Ending Date)=number;
        method_number:integer=5; method_period:integer=12; company_id:m2o(res.company)`,
    list: 'name,journal_id,method_number,method_period',
    views: 'list,kanban,form',
  }),
  M('account.asset.request', 'Asset Request', {
    f: `name:char~!; request_for:sel(student=Student|faculty=Faculty)=student;
        student_id:m2o(op.student); faculty_id:m2o(op.faculty);
        requested_asset:char!; asset_id:m2o(account.asset.asset);
        request_reason_id:m2o(asset.request.reason); request_date:date=today;
        approve_date:date; reject_date:date; allocate_date:date; return_date:date;
        company_id:m2o(res.company);
        state:sel(draft=Draft|approved=Approved|allocate=Allocated|returned=Returned|rejected=Rejected)=draft`,
    buttons: 'approved_progressbar:!Approve:draft@; reject_progressbar:Reject:draft@; allocate_progressbar:!Allocate:approved@; return_progressbar:Return:allocate@',
    list: 'name,request_for,requested_asset,request_date,state',
    views: 'list,form,pivot',
  }),
  M('asset.request.reason', 'Asset Request Reason', {
    f: 'name:char!; company_id:m2o(res.company)',
    list: 'name,company_id',
    views: 'list,form',
  }),
  M('res.currency', 'Currency', {
    nocompany: true,
    f: 'name:char!; symbol:char!; active:bool=true',
    list: 'name,symbol,active',
    views: 'list,kanban,form',
  }),
  M('account.change.lock.date', 'Change Lock Dates', {
    f: 'fiscalyear_lock_date:date; tax_lock_date:date; company_id:m2o(res.company)',
    views: 'form',
  }),
  M('asset.depreciation.confirmation.wizard', 'Generate Asset Entries', {
    f: 'date:date=today; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('l10n_us_1099.wizard', '1099 Tax Report Wizard', {
    f: 'tax_year:char=2026; company_id:m2o(res.company)',
    views: 'form',
  }),
  M('account.invoice.report', 'Invoice Analysis Report', {
    f: 'name:char; partner_id:m2o(res.partner); invoice_date:date; price_subtotal:money; price_average:money; state:char; payment_state:char',
    views: 'graph,pivot',
  }),
  M('account.analytic.line', 'Analytic Line', {
    f: 'name:char!; date:date!=today; amount:money!; unit_amount:float=1; account_id:m2o(account.account); partner_id:m2o(res.partner); company_id:m2o(res.company)',
    list: 'date,name,partner_id,amount',
    views: 'list,form',
  }),
  M('asset.asset.report', 'Asset Analysis Report', {
    f: 'name:char; category_id:m2o(account.asset.category); asset_date:date; gross_value:money; depreciation_value:money; residual_value:money',
    views: 'graph,pivot',
  }),
  M('product.category', 'Product Category', {
    f: 'name:char!; parent_id:m2o(product.category)',
    list: 'name,parent_id',
    views: 'list,form',
  }),
  M('payment.provider', 'Payment Provider', {
    f: 'name:char!; code:char!; state:sel(disabled=Disabled|enabled=Enabled|test=Test Mode)=enabled; company_id:m2o(res.company)',
    list: 'name,code,state,company_id',
    views: 'kanban,list,form',
  }),
  M('payment.method', 'Payment Method', {
    f: 'name:char!; code:char!; active:bool=true',
    list: 'name,code,active',
    views: 'list,kanban,form',
  }),
  M('exchange.rate.sync.error', 'Exchange Rate Sync Error', {
    f: 'name:char!; error_message:text; date:datetime=now',
    list: 'name,date,error_message',
    views: 'list,form',
  }),
  M('dms.directory', 'DMS Directory', { f: 'name:char!; parent_id:m2o(dms.directory); category:char=Policies; is_root_directory:bool=true', views: 'kanban,list,form' }),
];
