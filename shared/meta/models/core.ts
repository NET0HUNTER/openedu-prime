import { defineModel as M } from '../dsl.js';

/** Base / system models: companies (campuses), settings, users, chatter, scheduler, queue, integrations. */
export const coreModels = [
  M('res.company', 'Campus / Company', {
    nocompany: true,
    f: `name:char!; code:char:Campus Code; parent_id:m2o(res.company):Parent Organisation;
        campus_type:sel(group=Group / Board|school=School|campus=Campus)=campus; logo:image:Logo;
        motto:char; head_of_school:char:Head of School; founded:char:Founded;
        street:char; street2:char; city:char; country_id:m2o(res.country):Country;
        postal_address:char:Postal Address; phone:char; phone2:char:Phone 2; email:char; website:char;
        latitude:float; longitude:float; currency:char=KES; board_affiliation:char:Board Affiliations;
        curriculum_summary:char:Curricula; student_capacity:integer; staff_count:integer;
        theme_primary:char:Brand Primary=#1565C0; theme_primary_dark:char:Brand Primary Dark=#0D47A1;
        theme_accent:char:Accent=#714B67; theme_gold:char:Gold / Highlight=#F59E0B;
        theme_card_1:char:Card Tint 1=#FCE4EC; theme_card_2:char:Card Tint 2=#E8EAF6;
        theme_surface_1:char:Surface 1=#FFFFFF; theme_surface_2:char:Surface 2=#E3F2FD;
        theme_bg:char:Workspace Background=#f9fbfc; theme_font:char:Font Family=Rubik;
        menu_style:sel(apps=Apps|sidebar=Sidebar)=apps; chatter_position:sel(sided=Sided|bottom=Bottom)=sided;
        dark_mode:bool; description:html:About;
        report_header:text:Document Header Text; report_footer:text:Document Footer Legal Text;
        external_report_layout_id:sel(standard=Standard|boxed=Boxed|bold=Bold|striped=Striped)=standard;
        paperformat:sel(a4=A4 (210x297mm)|letter=US Letter)=a4; watermark_enabled:bool:Print Watermark=true`,
    list: 'name,code,campus_type,parent_id,city,phone,email,head_of_school',
    tabs: 'Contact:street,street2,city,country_id,postal_address,phone,phone2,email,website,latitude,longitude|Theme Customizer:theme_primary,theme_primary_dark,theme_accent,theme_gold,theme_card_1,theme_card_2,theme_surface_1,theme_surface_2,theme_bg,theme_font,menu_style,chatter_position,dark_mode|Document Layout:external_report_layout_id,paperformat,watermark_enabled,report_header,report_footer|Board Affiliation:board_affiliation,curriculum_summary,student_capacity,staff_count',
    views: 'kanban,list,form',
    kanban: { title: 'name', sub: 'head_of_school,city' },
  }),
  M('res.config.settings', 'Settings', {
    f: `name:char=Settings; seed_profile:char~:Active Seed Profile;
        term_program:char:Label for "Program"=Program; term_course:char:Label for "Course"=Course;
        term_batch:char:Label for "Batch"=Batch; term_subject:char:Label for "Subject"=Subject;
        term_faculty:char:Label for "Faculty"=Faculty; term_student:char:Label for "Student"=Student;
        academic_year_start_month:integer:Academic Year Start Month=9; withdrawal_notice_days:integer:Withdrawal Notice (days)=90;
        attendance_absentee_alert:bool:Absentee Alerts=true; absentee_channel:sel(whatsapp=WhatsApp|sms=SMS|email=Email)=whatsapp;
        library_fine_per_day:money:Library Fine / Day=20; compliance_warning_days:integer:Compliance Warning (days)=60;
        mpesa_env:sel(simulate=Simulation|sandbox=Daraja Sandbox|production=Daraja Production)=simulate;
        mpesa_consumer_key:char; mpesa_consumer_secret:char; mpesa_shortcode:char:Paybill / Till; mpesa_passkey:char;
        mpesa_callback_url:char:Callback URL;
        whatsapp_provider:sel(simulate=Simulation|meta_cloud=Meta WhatsApp Cloud API)=simulate; whatsapp_token:char; whatsapp_phone_number_id:char;
        sms_provider:sel(simulate=Simulation|africastalking=Africa's Talking)=simulate; sms_username:char; sms_api_key:char; sms_sender_id:char;
        email_provider:sel(simulate=Simulation|smtp=SMTP)=simulate; smtp_host:char; smtp_port:integer=587; smtp_user:char;
        ai_provider:sel(none=Disabled|openai=OpenAI|gemini=Google Gemini)=none; ai_api_key:char; ai_model:char;
        meeting_provider:sel(none=None|google_meet=Google Meet|teams=Microsoft Teams|zoom=Zoom|bbb=BigBlueButton)=none; meeting_api_key:char;
        sso_provider:sel(none=Disabled|google=Google Workspace OAuth2|microsoft=Microsoft Entra ID|saml=SAML 2.0)=none; sso_client_id:char; sso_issuer_url:char;
        webhook_url:char; webhook_secret:char;
        etims_enabled:bool:KRA eTIMS Invoicing; exam_board_edi:bool:Exam Board EDI Export;
        website_title:char; website_tagline:char; public_admissions_open:bool=true; demo_logins:bool:Show Demo Login Buttons=true`,
    tabs: 'Terminology:term_program,term_course,term_batch,term_subject,term_faculty,term_student|Academic Rules:academic_year_start_month,withdrawal_notice_days,library_fine_per_day,compliance_warning_days,attendance_absentee_alert,absentee_channel|Payments (M-Pesa):mpesa_env,mpesa_consumer_key,mpesa_consumer_secret,mpesa_shortcode,mpesa_passkey,mpesa_callback_url,etims_enabled|Messaging:whatsapp_provider,whatsapp_token,whatsapp_phone_number_id,sms_provider,sms_username,sms_api_key,sms_sender_id,email_provider,smtp_host,smtp_port,smtp_user|AI & Meetings:ai_provider,ai_api_key,ai_model,meeting_provider,meeting_api_key,exam_board_edi|SSO & Webhooks:sso_provider,sso_client_id,sso_issuer_url,webhook_url,webhook_secret|Website:website_title,website_tagline,public_admissions_open,demo_logins',
    views: 'form,list',
  }),
  M('res.users', 'User', {
    nocompany: true,
    f: `name:char!; login:char!; role:sel(admin=Administrator|faculty=Faculty|backoffice=Backoffice|student=Student (Portal)|parent=Parent (Portal))!=backoffice;
        image:image; student_id:m2o(op.student); parent_id:m2o(op.parent); faculty_id:m2o(op.faculty); employee_id:m2o(hr.employee);
        company_id:m2o(res.company):Default Campus; company_ids:m2m(res.company):Allowed Campuses; is_demo:bool:Demo Login; lang:char=en_US; active:bool=true`,
    list: 'name,login,role,company_id,is_demo,active',
    views: 'list,kanban,form',
  }),
  M('res.users.role', 'User Role', {
    nocompany: true,
    f: `name:char!; code:char; model_access_count:integer=12; rules_count:integer=8;
        comment:text:Internal Notes; active:bool=true`,
    list: 'name,code,model_access_count,rules_count,active',
    views: 'list,form',
  }),
  M('op.board.affiliation', 'Board Affiliation', {
    f: 'name:char!; code:char!; note:text:Description; company_id:m2o(res.company)',
    list: 'name,code,company_id',
    views: 'list,form',
  }),
  M('res.partner', 'Contact', {
    f: `name:char!; image:image; is_company:bool; is_student:bool:Is a Student; is_parent:bool:Is a Parent; is_venue:bool:Venue;
        email:char; phone:char; mobile:char; street:char; city:char; country_id:m2o(res.country); vat:char:KRA PIN / Tax ID;
        website:char; function:char:Job Position; comment:text:Notes`,
    views: 'kanban,list,form',
    kanban: { title: 'name', sub: 'email,phone' },
  }),
  M('res.partner.category', 'Contact Tag', { nocompany: true, f: 'name:char!; color:integer=1', views: 'list,form' }),
  M('res.partner.title', 'Contact Title', { nocompany: true, f: 'name:char!; shortcut:char!', views: 'list,form' }),
  M('res.partner.industry', 'Industry', { nocompany: true, f: 'name:char!; full_name:char; active:bool=true', views: 'list,form' }),
  M('res.country', 'Country', { nocompany: true, f: 'name:char!; code:char', views: 'list,form' }),
  M('res.country.state', 'Fed. State / County', { nocompany: true, f: 'name:char!; code:char!; country_id:m2o(res.country)!', views: 'list,form' }),
  M('res.country.group', 'Country Group', { nocompany: true, f: 'name:char!; country_ids:m2m(res.country)', views: 'list,form' }),
  M('res.bank', 'Bank', { nocompany: true, f: 'name:char!; bic:char:Bank Identifier Code; city:char; country:m2o(res.country); active:bool=true', views: 'list,form' }),
  M('res.partner.bank', 'Bank Account', { f: 'acc_number:char!:Account Number; partner_id:m2o(res.partner)!:Account Holder; bank_id:m2o(res.bank); allow_out_payment:bool=true; company_id:m2o(res.company)', rec: 'acc_number', views: 'list,form' }),
  M('res.lang', 'Language', { nocompany: true, f: 'name:char!; code:char!; iso_code:char; active:bool=true' }),
  M('ir.cron', 'Scheduled Action', {
    nocompany: true,
    f: `name:char!; method:char!:Job; cron:char!:Schedule (cron, EAT); channel:char=root; model:char:Target Model;
        active:bool=true; last_run:datetime~; next_run:datetime~; last_result:char~; description:text`,
    list: 'name,cron,channel,active,last_run,next_run,last_result',
    buttons: 'run_now:!Run Now:*@',
  }),
  M('queue.job', 'Job', {
    nocompany: true,
    f: `name:char!; uuid:char; graph_uuid:char; method:char;
        job_function_id:m2o(queue.job.function); channel:char=root; cron_id:m2o(ir.cron);
        priority:integer=10; retry:integer=0; max_retries:integer=5;
        user_id:m2o(res.users); company_id:m2o(res.company);
        state:sel(wait_dependencies=Wait Dependencies|pending=Pending|enqueued=Enqueued|started=Started|done=Done|failed=Failed|cancelled=Cancelled)=pending;
        date_created:datetime=now; date_started:datetime; date_done:datetime;
        exec_time:float:Time (s); result:text; exc_name:char; exc_info:text`,
    list: 'name,channel,state,date_created,date_done,exec_time',
    buttons: 'requeue:!Requeue Job:failed>pending; button_done:!Set to Done:wait_dependencies,pending,enqueued,failed>done; button_cancelled:Cancel Job:wait_dependencies,pending,enqueued,failed>cancelled',
    tabs: 'Results:result,exc_name,exc_info',
    views: 'list,form,pivot,graph',
  }),
  M('queue.job.channel', 'Job Channel', {
    nocompany: true,
    f: 'name:char!; parent_id:m2o(queue.job.channel); capacity:integer=1',
    views: 'list,form',
  }),
  M('queue.job.function', 'Job Function', {
    nocompany: true,
    f: 'name:char!; channel_id:m2o(queue.job.channel); retry_pattern:char; allow_commit:bool=true',
    views: 'list,form',
  }),
  M('mail.message', 'Message', {
    nocompany: true,
    f: `res_model:char; res_id:integer; body:text; author_id:m2o(res.users);
        message_type:sel(comment=Message|note=Log Note|tracking=Tracking|notification=Notification)=comment; date:datetime=now`,
    list: 'date,res_model,res_id,author_id,message_type,body',
  }),
  M('mail.activity', 'Activity', {
    nocompany: true,
    f: `summary:char!; res_model:char; res_id:integer; activity_type:sel(todo=To-Do|call=Call|meeting=Meeting|email=Email|upload=Upload Document)=todo;
        date_deadline:date!=today; user_id:m2o(res.users):Assigned To; note:text; state:sel(planned=Planned|done=Done)=planned`,
    buttons: 'mark_done:!Mark Done:planned>done',
    views: 'list,kanban,form,calendar',
    cal: 'date_deadline',
  }),
  M('comm.outbox', 'Outgoing Message', {
    f: `to:char!:Recipient; recipient_name:char; channel:sel(whatsapp=WhatsApp|sms=SMS|email=Email)!=whatsapp;
        subject:char; body:text; res_model:char; res_id:integer; provider:char~; provider_ref:char~;
        state:sel(queued=Queued|sent=Sent|delivered=Delivered|failed=Failed)=queued; error:char~; date:datetime=now`,
    list: 'date,channel,to,recipient_name,subject,state,provider',
    buttons: 'retry:Retry:failed@',
  }),
  M('payment.transaction', 'Payment Transaction', {
    f: `reference:char!; provider:sel(mpesa=M-Pesa|bank=Bank|card=Card)=mpesa; phone:char; amount:money!;
        move_id:m2o(account.move):Invoice; student_id:m2o(op.student); merchant_request_id:char~; checkout_request_id:char~;
        mpesa_receipt:char~:M-Pesa Receipt; result_desc:char~; state:sel(pending=Pending|done=Done|error=Error|cancel=Cancelled)=pending; date:datetime=now`,
    list: 'date,reference,provider,phone,amount,move_id,mpesa_receipt,state',
    buttons: 'simulate_callback:Simulate Callback:pending@',
  }),
  M('ir.module.module', 'Module', {
    nocompany: true,
    f: `name:char!:Technical Name; shortdesc:char:Module Name; category:char; author:char; summary:char;
        state:sel(installed=Installed|uninstalled=Not Installed)=installed`,
    views: 'kanban,list,form',
    panel: 'category',
    kanban: { title: 'shortdesc', sub: 'name,category', groupBy: 'none' },
    buttons: 'button_install:!Activate:uninstalled>installed; button_uninstall:Uninstall:installed>uninstalled',
  }),
  M('dashboard.kpi', 'KPI Tile', {
    nocompany: true,
    f: `name:char!; model:char!; measure:sel(count=Count|sum=Sum)=count; field:char:Sum Field; domain:char:Domain (JSON);
        target:float:Target; color:char; icon:char; sequence:integer=10; dashboard:sel(executive=Executive|admissions=Admissions|academics=Academics|finance=Finance|compliance=Compliance)=executive`,
    list: 'sequence,name,dashboard,model,measure,field,target',
  }),
];
