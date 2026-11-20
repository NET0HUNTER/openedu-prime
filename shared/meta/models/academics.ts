import { defineModel as M } from '../dsl.js';

/** Modules 1–6: Admissions, Students, SIS, LMS, Time Table, Class Attendances. */
export const academicModels = [
  // Module 1: Admissions
  M('op.admission.register', 'Admission Register', {
    f: `name:char!; admission_base:sel(course=Course|program=Program)=course;
        academic_years_id:m2o(op.academic.year)!:Academic Year; course_id:m2o(op.course):Course;
        program_id:m2o(op.program):Program; academic_term_id:m2o(op.academic.term):Term;
        start_date:date!=today; end_date:date; max_count:integer=60; min_count:integer=1;
        fees:money:Course Fees=345000; product_id:char:Course Fees Product=Term Tuition Fee;
        registration_fees:bool:Registration Fees=false; register_product_id:char:Register Product;
        program_fees:money:Program Fees; minimum_age_criteria:float:Min Age (Yrs)=2;
        admission_template_id:m2o(op.admission.customtemplate):Template; sign_in_required:bool=true;
        admission_fees_line_ids:o2m(op.admission.fees.line,register_id):Course Fees Lines;
        state:sel(draft=Draft|confirm=Confirmed|application=Application Gathering|admission=Admission Process|cancel=Cancelled|done=Done)=draft`,
    buttons: 'confirm_register:!Confirm:draft>confirm; start_application:!Start Application:confirm>application; start_admission:!Start Admission:application>admission; close_register:!Done:admission>done; cancel_register:Cancel:draft,confirm>cancel; set_to_draft:Set to Draft:cancel>draft; action_reset_to_draft:Reset to Draft:confirm,application,admission,done>draft',
    smart: 'Applications:op.admission:register_id',
    views: 'kanban,list,form',
    panel: 'course_id',
    kanban: { title: 'name', sub: 'course_id,start_date', groupBy: 'none' },
    tabs: 'Configure Course Fees:admission_fees_line_ids',
  }),
  M('op.admission.fees.line', 'Admission Course Fees Line', {
    f: `register_id:m2o(op.admission.register)!; course_id:m2o(op.course)!:Course;
        course_fees_product_id:char:Fees Product=Term Tuition Fee;
        fees:money:Course Fees=345000;
        registration_fees:bool:Registration Fees=false;
        register_product_id:char:Register Product`,
    list: 'course_id,fees,course_fees_product_id,registration_fees,register_product_id',
  }),
  M('op.admission', 'Registration', {
    f: `application_number:char~!; register_id:m2o(op.admission.register)!; image:image;
        title:char=Mr./Ms.; first_name:char!; middle_name:char; last_name:char!; name:char:Name;
        email:char; phone:char; application_date:datetime=now; admission_date:date;
        course_id:m2o(op.course)!; batch_id:m2o(op.batch):Batch; program_id:m2o(op.program):Program;
        discount:float:Discount %; fees:money:Fees; due_date:date; fees_term_id:m2o(op.fees.terms);
        order_id:m2o(account.move):Order; fees_start_date:date;
        is_student:bool:Is Already Student=false; student_id:m2o(op.student):Student;
        partner_id:m2o(res.partner); tag_ids:m2m(admission.tag):Tags; company_id:m2o(res.company);
        stage_id:m2o(admission.stage):Stage;
        gender:sel(m=Male|f=Female)=m; birth_date:date!;
        citizenship:sel(kenyan=Kenyan Citizen|non_kenyan=Non-Kenyan (Pupil's Pass Required))=kenyan;
        pupils_pass_no:char:Pupil's Pass No; pupils_pass_expiry:date:Pupil's Pass Expiry;
        leaving_cert_verified:bool:Leaving Certificate Verified;
        interview_date:datetime:Parent/Head Interview; assessment_score:float:Entrance Assessment %;
        family_income:money; family_business:char;
        prev_institute_id:char:Previous Institute; prev_result:char:Previous Result; prev_course_id:char:Previous Course;
        street:char; street2:char; city:char=Nairobi; state_id:char:State; zip:char; country_id:m2o(res.country);
        campaign_id:char:Campaign; medium_id:char:Medium; source_id:char:Source; referred_by:char;
        team_id:m2o(helpdesk.team):Team; day_open:float:Days to Assign; day_close:float:Days to Close;
        similar_admission_count:integer:Similar Admissions=0;
        state:sel(draft=Draft|online=Online Admission|submit=Submitted|confirm=Confirmed|pending=Pending|cancel=Cancelled|sent=Sent for Signature|sign_received=Signature Received|sign_confirmed=Signature Confirmed|admission=Admission Confirm|reject=Rejected|done=Done)=draft`,
    buttons: 'submit_form:!Submit:draft>submit; confirm_in_progress:!Confirm:submit,online>confirm; send_for_signature:Send for Signature:confirm>sent; confirm_admin_signature:Confirm Admin Signature:sign_received>sign_confirmed; admission_confirm:!Admission Confirm:sign_confirmed>admission; enroll_student:!Enroll:admission,confirm,sign_confirmed@; confirm_rejected:Reject:confirm,sign_confirmed>reject; confirm_pending:Pending:submit>pending; confirm_cancel:Cancel:draft,submit,confirm,pending,sign_received,sign_confirmed,admission>cancel; confirm_to_draft:Set to Draft:pending,reject,cancel>draft; open_student:Open Student Profile:done@',
    smart: 'Similar Admissions:op.admission:course_id',
    views: 'kanban,list,form,pivot,graph',
    panel: 'course_id',
    kanban: { title: 'name', sub: 'application_number,course_id', groupBy: 'stage_id' },
    tabs: 'Admission Detail:register_id,application_number,application_date,admission_date,course_id,program_id,batch_id,fees_term_id,fees,discount,due_date,is_student,student_id,tag_ids,partner_id,company_id,fees_start_date|Educational Detail:prev_institute_id,prev_result,prev_course_id|Personal Detail:gender,birth_date,family_income,family_business,citizenship,pupils_pass_no,pupils_pass_expiry,leaving_cert_verified,interview_date,assessment_score,street,street2,city,state_id,zip,country_id|Extra Information:campaign_id,medium_id,source_id,referred_by,team_id,day_open,day_close',
    portal: { partnerField: 'partner_id', studentField: 'student_id' },
  }),
  M('op.student.course.change.req', 'Course Change Request', {
    f: `name:char~!; student_id:m2o(op.student)!; from_course_id:m2o(op.course)!:Current Course;
        to_course_id:m2o(op.course)!:Requested Course; approve_date:date; reason_to_change:text!:Reason;
        state:sel(draft=Draft|course_change_fees=Fees Payment|approve=Approve|cancel=Cancel|reject=Reject)=draft`,
    buttons: 'action_course_change_fees:Fees Payment:draft>course_change_fees; action_approve:!Approve:draft,course_change_fees>approve; action_reject:Reject:draft,course_change_fees>reject; action_cancel:Cancel:draft,course_change_fees>cancel',
  }),
  M('admission.stage', 'Admission Stage', {
    f: 'name:char!; sequence:integer=10; fold:bool:Folded in Kanban; state:char; view_boolean:bool=true; company_id:m2o(res.company)',
  }),
  M('admission.tag', 'Admission Tag', { f: 'name:char!; color:integer=1' }),
  M('op.admission.customtemplate', 'Admission Template', {
    f: 'name:char!; program_base_template:bool; admission_webpage:html:Form Instructions',
  }),
  M('admission.analysis', 'Admission Report', {
    f: 'start_date:date!=today; end_date:date; course_id:m2o(op.course); academic_years_id:m2o(op.academic.year); academic_term_id:m2o(op.academic.term)',
  }),

  // Module 2: Students
  M('op.student', 'Students', {
    f: `gr_no:char:Registration / Admission No; image_1920:image; title:char=Mr.;
        name:char:Name; first_name:char!; middle_name:char; last_name:char!; email:char; phone:char;
        gender:sel(m=Male|f=Female|o=Other)!=m; birth_date:date;
        course_id:m2o(op.course):Current Year Group / Course; batch_id:m2o(op.batch):Stream / Batch;
        program_id:m2o(op.program):Program; blood_group:sel(A+=A+|A-=A-|B+=B+|B-=B-|O+=O+|O-=O-|AB+=AB+|AB-=AB-);
        nationality:m2o(res.country); language:char:Language=English (US); citizenship:sel(kenyan=Kenyan Citizen|non_kenyan=Non-Kenyan)=kenyan;
        pupils_pass_no:char:Pupil's Pass No; pupils_pass_expiry:date:Pupil's Pass Expiry;
        street:char; street2:char; city:char=Nairobi; state_id:char:State; zip:char; country_id:m2o(res.country);
        company_id:m2o(res.company); lang:char:Language=English (US); emergency_contact:char:Emergency Contact;
        alumni_boolean:bool:Is An Alumni?; visa_info:char:Visa Info; category_id:char:Category;
        alumni_id:char:Alumni; passing_year_id:m2o(op.academic.year):Passing Year; current_position:char:Current Position;
        current_job:char:Current Job; descriptor:text:Face Descriptor; image_detect:image:Detected Face;
        student_count:integer:Student Count=1; fees_plan_details_count:integer:Fees Plan Count=0;
        library_card_id:m2o(op.library.card); ied_support:bool:IED / Learning Support; barcode:char:Badge ID; pin:char:Kiosk PIN;
        partner_id:m2o(res.partner); user_id:m2o(res.users);
        parent_ids:m2m(op.parent):Parents / Guardians;
        achievement_line_ids:o2m(op.achievement,student_id):Achievements;
        activity_line_ids:o2m(op.activity,student_id):Activities`,
    list: 'title,name,gender,birth_date,email,nationality,language,company_id,blood_group,library_card_id',
    smart: 'Admission:op.admission:student_id; Invoiced:account.move:student_id+amount_total; Fees Plan Details:op.fees.plan:student_id; Assignment:op.assignment.sub.line:student_id; Attendance:op.attendance.line:student_id; Activity:op.activity:student_id; GradeBook:gradebook.gradebook:student_id; Placements:op.placement.offer:student_id; Job Post:hr.job:student_id; Discipline:op.discipline:student_id; Media:op.media.movement:student_id; Health:op.health:student_id; Parents:op.parent:#parent_ids; Leads:crm.lead:student_id',
    views: 'kanban,list,form',
    panel: 'course_id',
    kanban: { title: 'name', sub: 'gr_no,course_id' },
    tabs: 'Other Information:gr_no,library_card_id,pin,barcode,course_id,batch_id,program_id,ied_support|Achievement:achievement_line_ids|Skills:activity_line_ids|Alumni Details:alumni_id,passing_year_id,current_position,current_job|Face Recognition:descriptor,image_detect|Compliance & Pass:nationality,citizenship,pupils_pass_no,pupils_pass_expiry,blood_group,emergency_contact|Parents & Contacts:parent_ids,partner_id,user_id,alumni_boolean',
    portal: { studentField: 'id' },
  }),
  M('op.student.course', 'Student Course Detail', {
    f: `student_id:m2o(op.student)!; course_id:m2o(op.course)!; batch_id:m2o(op.batch);
        academic_years_id:m2o(op.academic.year); academic_term_id:m2o(op.academic.term); roll_number:char;
        subject_ids:m2m(op.subject):Registered Subjects; program_id:m2o(op.program); fees_term_id:m2o(op.fees.terms);
        fees_plan_id:m2o(op.fees.plan); fees_start_date:date; state:sel(running=Running|finished=Finished|cancel=Cancelled)=running`,
    smart: 'Session:op.session:student_course_id',
    views: 'list,form,pivot',
  }),
  M('op.subject.registration', 'Subject Registration', {
    f: `name:char~!; student_id:m2o(op.student)!; course_id:m2o(op.course)!; batch_id:m2o(op.batch)!;
        compulsory_subject_ids:m2m(op.subject):Compulsory Subjects; elective_subject_ids:m2m(op.subject):Elective Subjects;
        is_extra_private_subject:bool:Extra Private Subject Requested; private_subject_name:char:Private Subject Name;
        has_practical_coursework:bool:Subject Has Practical/Coursework; igcse_credits_count:integer:IGCSE Credit Passes (A*-C)=5;
        english_math_passed:bool:English & Math Passed=true; min_unit_load:float; max_unit_load:float;
        state:sel(draft=Draft|submitted=Submitted|change_requested=Change Requested|approved=Approved|rejected=Rejected)=draft`,
    buttons: 'action_submitted:!Submit:draft@; submit:!Submit & Validate Rules:draft@; action_approve:!Approve:submitted>approved; action_reject:Reject:submitted>rejected; action_reject_change:Reject Change Request:change_requested>rejected; action_reset_draft:Reset to Draft:rejected,change_requested>draft; approve:Approve:submitted,esign_pending>approved; reject:Reject:draft,submitted,esign_pending>rejected',
    views: 'list,form,kanban,graph,pivot',
    portal: { studentField: 'student_id' },
  }),
  M('op.student.progression', 'Student Progression', {
    f: `name:char~!; student_id:m2o(op.student)!; date:date!=today; created_by:m2o(res.users); company_id:m2o(res.company);
        from_course_id:m2o(op.course); to_course_id:m2o(op.course); academic_year_id:m2o(op.academic.year);
        percentage:float; remarks:char;
        state:sel(draft=Draft|open=In Progress|done=Done|cancel=Cancelled)=draft`,
    buttons: 'state_open:!In Progress:draft>open; state_done:!Done:open>done; state_rejected:Cancel:draft,open>cancel; state_draft:Reset To Draft:open,cancel>draft; promote:!Promote Student:draft@',
    tabs: 'Activity:total_activity|Transcript:transcript|Achievement:total_achievement|Assignment:total_assignment|Attendance:total_attendance|Discipline:total_discipline|Marksheet:total_marksheet_line',
    views: 'list,form,pivot,graph',
  }),
  M('op.student.withdrawal', 'Student Withdrawal Request', {
    f: `name:char~!; sequence:char; student_id:m2o(op.student)!; course_id:m2o(op.course); batch_id:m2o(op.batch);
        academic_year_id:m2o(op.academic.year); requested_date:date!=today; requested_by:sel(parent=Parent|student=Student)=parent;
        principal_id:m2o(op.faculty); advisor_id:m2o(op.faculty); withdrawal_reason:text; comments:text; finance_clearance_done:bool=false;
        notice_date:date!=today; effective_date:date; notice_days_given:integer~:Notice Days Given;
        full_term_notice_met:bool~:Full Term Notice Met; caution_refund_amount:money:Caution Refund;
        state:sel(draft=Draft|submitted=Submitted|processed=In Process|approved=Approved|cancel=Cancelled)=draft`,
    buttons: 'action_submitted:!Submit:draft@; submit:!Submit Notice:draft@; action_processed:!In Process:submitted>processed; action_approved:!Approve:processed>approved; action_cancel:Cancel:draft,submitted,processed,approved>cancel; action_draft:Set to Draft:cancel>draft; refund_caution:!Process Caution Refund:approved>refunded',
    views: 'list,form',
  }),
  M('student.leave.request', 'Student Leave Request', {
    f: `student_id:m2o(op.student)!; leave_type:m2o(student.leave.type)!; start_date:datetime!=today;
        end_date:datetime!=today; duration:float=1.0; faculty_id:m2o(op.faculty); company_id:m2o(res.company);
        description:text; state:sel(draft=To Submit|confirm=To Validate|validate=Validated|approve=Approved|refuse=Refused|cancel=Cancelled)=draft`,
    buttons: 'action_confirm:!Confirm:draft>confirm; action_validate:!Validate:confirm>validate; action_approve:!Approve:validate>approve; action_refuse:Refuse:confirm,validate,approve>refuse; action_cancel:Cancel:validate,approve>cancel; action_draft:Mark as Draft:refuse,cancel>draft',
    views: 'kanban,list,form,calendar',
    cal: 'start_date',
    portal: { studentField: 'student_id' },
  }),
  M('student.leave.type', 'Leave Type', {
    nocompany: true,
    f: 'name:char!; code:char; requires_medical_note:bool; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.activity', 'Activity Log', {
    f: `student_id:m2o(op.student)!; faculty_id:m2o(op.faculty); type_id:m2o(op.activity.type)!:Activity Type;
        date:date!=today; description:text; company_id:m2o(res.company); progression_id:m2o(op.student.progression)`,
    views: 'list,form,pivot,graph',
    portal: { studentField: 'student_id' },
  }),
  M('op.achievement', 'Achievement', {
    f: `student_id:m2o(op.student)!; faculty_id:m2o(op.faculty); achievement_type_id:m2o(op.achievement.type)!:Achievement Type;
        achievement_date:date!=today; description:text; company_id:m2o(res.company); progression_id:m2o(op.student.progression)`,
    views: 'list,form,pivot,graph',
    portal: { studentField: 'student_id' },
  }),

  // Module 3: SIS
  M('op.faculty', 'Faculty', {
    f: `title:char=Mr.; first_name:char!; middle_name:char; last_name:char!; image_1920:image; email:char; phone:char;
        gender:sel(m=Male|f=Female|o=Other)!=m; birth_date:date; main_department_id:m2o(op.department):Department;
        emp_id:m2o(hr.employee):HR Employee; faculty_subject_ids:m2m(op.subject):Subjects Taught;
        street:char; street2:char; city:char=Nairobi; state_id:char; zip:char; country_id:m2o(res.country);
        police_clearance_no:char:Good Conduct Cert No; police_clearance_expiry:date:Good Conduct Expiry;
        library_card_id:m2o(op.library.card); bio_data:html:Bio; user_id:m2o(res.users); company_id:m2o(res.company);
        course_count:integer=0; subject_count:integer=0; assignment_count:integer=0; session_count:integer=0`,
    smart: 'Courses:op.course:faculty_id; Subjects:op.subject:#faculty_subject_ids; Assignment:op.assignment:faculty_id; Time Table:op.session:faculty_id; Sessions:op.session:faculty_id; Health:op.health:faculty_id; Media:op.media.movement:faculty_id',
    buttons: 'create_faculty_user:Create Faculty User:*@',
    views: 'kanban,list,form',
    panel: 'main_department_id',
    kanban: { title: 'first_name', sub: 'email,main_department_id' },
    tabs: 'Other Information:emp_id,main_department_id,user_id,police_clearance_no,police_clearance_expiry|Subjects:faculty_subject_ids|Library:library_card_id|Bio:bio_data',
  }),
  M('op.parent', 'Parent / Guardian', {
    f: `name:char!; relationship_id:m2o(op.parent.relationship):Relationship; email:char; mobile:char;
        student_ids:m2m(op.student):Students; partner_id:m2o(res.partner); user_id:m2o(res.users);
        tag_ids:m2m(res.partner.category):Tags; company_id:m2o(res.company)`,
    buttons: 'create_parent_user:Create Parent User:*@',
    views: 'kanban,list,form',
    kanban: { title: 'name', sub: 'email,mobile' },
  }),
  M('op.parent.relationship', 'Parent Relationship', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.department', 'Department', {
    f: 'name:char!; code:char!; parent_id:m2o(op.department); company_id:m2o(res.company)',
    smart: 'Courses:op.course:department_id; Faculties:op.faculty:main_department_id; Students:op.student:department_id; Subjects:op.subject:department_id; Batches:op.batch:department_id; TimeTable:op.session:department_id',
    views: 'kanban,list,form',
    kanban: { title: 'name', sub: 'code' },
  }),
  M('op.program.level', 'Program Level', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.program', 'Program', {
    f: `name:char!; code:char!; program_level_id:m2o(op.program.level)!; department_id:m2o(op.department);
        area_id:m2o(op.area); min_unit_load:float:Min Subjects=0; max_unit_load:float:Max Subjects=12;
        required_thesis:bool:Requires Thesis / Extended Project=false; short_desc:text; full_description:html;
        company_id:m2o(res.company)`,
    views: 'kanban,list,form',
    kanban: { title: 'name', sub: 'code,program_level_id' },
  }),
  M('op.course', 'Course', {
    f: `name:char!; code:char!; program_id:m2o(op.program); department_id:m2o(op.department);
        evaluation_type:sel(normal=Normal Exams|GPA=GPA|CWA=Coursework / Continuous|CCE=EYFS / Skill Assessment)=normal;
        fees_term_id:m2o(op.fees.terms); min_unit_load:float:Min Subjects=0; max_unit_load:float:Max Subjects=12;
        grade_scale_id:m2o(op.grade.scale):Grade Scale; grade_template_ids:m2m(op.grade.template);
        is_lms_published:bool:Published on LMS=true; is_published:bool:Is Published=true;
        website_published:bool:Website Published=true; online_course_created:bool=false; online_course:bool=true;
        lms_course_type:sel(training=Training|documentation=Documentation)=training;
        visibility:sel(public=Public|invited=On Invitation|connected=Signed In)=public;
        is_paid:bool=false; is_certificate:bool=false;
        total_time:float=4.0; total_modules:integer=0; total_enrollment:integer=0;
        rating_avg_stars:float=5.0; rating_count:integer=1;
        category_ids:m2m(op.course.category):Categories; category_id:m2o(op.course.category):Category; tag_ids:m2m(op.course.tag):Tags;
        short_desc:text; full_description:html; subject_ids:m2m(op.subject):Subjects;
        module_lines:o2m(op.course.module,course_id):Lessons;
        lms_module_ids:o2m(op.course.module,course_id):Lessons;
        enrollment_line:o2m(op.course.enrollment,course_id):Enrollments;
        state:sel(draft=Draft|open=Confirm|closed=Closed)=open;
        color:integer=0; company_id:m2o(res.company)`,
    buttons: 'create_online_course:Create Online Course:draft@',
    smart: 'Subjects:op.subject:course_id; LMS Course:op.course.module:course_id; Faculties:op.faculty:course_id; Students:op.student:course_id; Assignment:op.assignment:course_id; Course Credit:course.credit:course_id; Time Table:op.session:course_id; GradeBook:gradebook.gradebook:course_id; Enrollments:op.course.enrollment:course_id',
    list: 'name,code,program_id,department_id,subject_ids,evaluation_type,state,total_enrollment',
    tabs: 'Content:module_lines|Subjects:subject_ids|Categories:category_ids|Grading:grade_scale_id,grade_template_ids|Enrollments:enrollment_line|Options:evaluation_type,fees_term_id,min_unit_load,max_unit_load,is_lms_published,category_id,tag_ids|Description:short_desc,full_description',
    views: 'kanban,list,form,pivot,graph',
    panel: 'program_id',
    kanban: { title: 'name', sub: 'code,program_id' },
  }),
  M('op.batch', 'Batch / Stream', {
    f: `name:char!; code:char!; course_id:m2o(op.course)!; start_date:date!=today; end_date:date!;
        max_students:integer=25; staff_count:integer:Staff Count=2; company_id:m2o(res.company)`,
    smart: 'Students:op.student:batch_id; Sessions:op.session:batch_id',
    views: 'kanban,list,form',
    panel: 'course_id',
  }),
  M('op.section', 'Section', {
    f: 'name:char!; batch_ids:m2m(op.batch); course_ids:m2m(op.course); subject_id:m2o(op.subject); company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('op.subject', 'Subject', {
    f: `name:char!; code:char!; type:sel(theory=Theory|practical=Practical|both=Theory & Practical)=theory;
        subject_type:sel(compulsory=Compulsory|elective=Elective)=compulsory;
        exam_board:sel(CAIE=Cambridge (CAIE)|Edexcel=Pearson Edexcel|BTEC=Pearson BTEC|ASDAN=ASDAN|Internal=Internal / EYFS)=CAIE;
        has_coursework:bool:Has Practical / Coursework; subject_credit:float:Credit / Hours=4;
        department_id:m2o(op.department); course_id:m2o(op.course); company_id:m2o(res.company)`,
    panel: 'exam_board',
    views: 'list,kanban,form',
  }),
  M('op.academic.year', 'Academic Year', {
    f: `name:char!; start_date:date!; end_date:date!;
        term_structure:sel(three_terms=Three Terms (Sep / Jan / May)|two_semesters=Two Semesters)=three_terms;
        academic_term_ids:o2m(op.academic.term,academic_year_id):Academic Terms; company_id:m2o(res.company)`,
    buttons: 'term_create:!Create Terms:*@',
  }),
  M('op.academic.term', 'Academic Term', {
    f: 'name:char!; academic_year_id:m2o(op.academic.year)!; term_start_date:date!; term_end_date:date!; company_id:m2o(res.company)',
  }),
  M('op.classroom', 'Class Room', {
    f: 'name:char!; code:char!; capacity:integer!=25; course_id:m2o(op.course); batch_id:m2o(op.batch); company_id:m2o(res.company)',
  }),
  M('op.facility', 'Classroom Facility', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.fees.terms', 'Fees Terms', {
    f: `name:char!; code:char!; fees_terms:sel(fixed_days=Fixed Days|fixed_date=Termly Dates|duration_based=Duration Based)=fixed_date;
        term_duration:integer; bill_selection:sel(day=Days|month=Months|year=Years)=month;
        discount:float=0; expires_after:integer; note:text; active:bool=true; company_id:m2o(res.company)`,
    smart: 'Term Lines:op.fees.terms.line:fees_term_id',
    list: 'name,code,fees_terms,discount',
    views: 'list,form',
  }),
  M('op.fees.element', 'Fees Element', {
    f: 'name:char!; product_id:m2o(product.template); value:money!; company_id:m2o(res.company)',
    list: 'name,product_id,value',
    views: 'list,form',
  }),
  M('op.fees.terms.line', 'Fees Term Line', {
    f: 'fees_term_id:m2o(op.fees.terms)!; due_days:integer; due_date:date; value:float!; product_id:m2o(product.template)',
    list: 'fees_term_id,due_days,due_date,value,product_id',
    views: 'list,form',
  }),
  M('op.student.fees.details', 'Student Fees Details', {
    f: `student_id:m2o(op.student)!; course_id:m2o(op.course); batch_id:m2o(op.batch);
        invoice_id:m2o(account.move); amount:money!; product_id:m2o(product.template);
        fees_factor:float=100; discount:float=0; after_discount_amount:money;
        date:date=today; state:sel(draft=Draft|invoice=Invoiced|paid=Paid)=draft; company_id:m2o(res.company)`,
    list: 'student_id,course_id,batch_id,amount,after_discount_amount,state',
    views: 'list,kanban,form,pivot',
  }),
  M('op.fees.plan', 'Fees Plan', {
    f: `name:char~!; student_id:m2o(op.student)!; course_id:m2o(op.course); fees_term_id:m2o(op.fees.terms)!;
        product_id:m2o(product.template); paid_amount:money=0; total_amount:money=0; remaining_amount:money=0;
        company_id:m2o(res.company); state:sel(draft=Draft|running=Running|done=Done|cancel=Cancelled)=draft;
        line_ids:o2m(op.fees.plan.line,fees_plan_id):Installment Lines`,
    buttons: 'draft_fees_plan:Draft:cancel,done>draft; running_fees_plan:!Running:draft>running; done_fees_plan:!Done:running>done; cancel_fees_plan:Cancel:draft,running,done>cancel; generate_invoices:!Generate Due Invoices:*@',
    portal: { studentField: 'student_id' },
  }),
  M('op.fees.plan.line', 'Fees Plan Line', {
    f: `fees_plan_id:m2o(op.fees.plan)!; student_id:m2o(op.student); invoice_date:date; due_days:integer;
        fees_factor:float=100; product_name:char; amount:money!; paid_amount:money=0;
        fees_term_id:m2o(op.fees.terms); invoice_id:m2o(account.move);
        state:sel(draft=Draft|invoice=Invoiced|paid=Paid)=draft`,
    buttons: 'get_invoice:Create Invoice:draft@; action_get_invoice:View Invoice:invoice@',
  }),
  M('op.health', 'Student Health & Infirmary', {
    f: `type:sel(student=Student|faculty=Faculty)=student; student_id:m2o(op.student); faculty_id:m2o(op.faculty);
        height:float; weight:float; eyeglasses:bool=false; physical_challenges:bool=false;
        major_diseases:bool=false; regular_checkup:bool=false; blood_group:char; clinic_notes:text:Nurse Notes;
        company_id:m2o(res.company); state:sel(draft=Draft|confirm=Confirmed)=draft`,
    buttons: 'confirm_register:!Confirm:draft>confirm; set_to_draft:Set to Draft:confirm>draft',
    portal: { studentField: 'student_id' },
  }),
  M('student.migrate', 'Student Migration', {
    f: `date:date!=today; course_completed:bool=false; course_from_id:m2o(op.course)!;
        year_id:m2o(op.academic.year); course_to_id:m2o(op.course); term_id:m2o(op.academic.term);
        batch_id:m2o(op.batch); student_ids:m2m(op.student); company_id:m2o(res.company)`,
    buttons: 'student_migrate_forward:!Forward@; cancel:Cancel@',
    views: 'form',
  }),
  M('op.discipline', 'Discipline Record', {
    f: `name:char~!; student_id:m2o(op.student)!; date:date!=today; discipline_master:char;
        assigned_faculty_id:m2o(op.faculty); recipients_ids:m2m(res.partner); course_id:m2o(op.course);
        progression_id:m2o(op.student.progression); priority:sel(0=Low|1=Normal|2=High|3=Critical)=1;
        misbehaviour_type:sel(minor=Minor|major=Major|critical=Critical)=minor;
        misbehaviour_category_id:m2o(op.misbehaviour.category); misbehaviour_action:char;
        merit_points:integer=0; demerit_points:integer=0; schedule_meeting:bool=false; meeting_datetime:datetime;
        note:text; apology_text:text; apology_submitted_on:datetime; fine_amount:money=0;
        fine_invoice_id:m2o(account.move); company_id:m2o(res.company);
        state:sel(draft=Draft|email_sent=Email Sent|awaiting_letter=Awaiting Apology Letter|awaiting_meeting=Awaiting Meeting|action_taken=Action Taken|awaiting_payment=Awaiting Fine Payment|suspended=Suspended|done=Done)=draft`,
    buttons: 'send_email:!Send Email:draft>email_sent; apologies_letter:!Request Apology Letter:email_sent>awaiting_letter; meeting_awaiting:!Meeting With Parents:awaiting_letter>awaiting_meeting; take_action:!Take Action:awaiting_meeting,awaiting_letter,email_sent>action_taken; reset_draft:Reset Draft:email_sent,awaiting_letter,awaiting_meeting,action_taken,awaiting_payment,suspended,done>draft; resolve:Resolve:reported,action,action_taken>done',
    views: 'calendar,list,form,pivot,graph',
    cal: 'date',
    portal: { studentField: 'student_id' },
  }),
  M('suspended.student', 'Suspended Student', {
    f: `student_id:m2o(op.student)!; suspend_from_date:date!=today; suspend_to_date:date!;
        misbehaviour_category_id:m2o(op.misbehaviour.category); company_id:m2o(res.company)`,
    views: 'list,form',
  }),
  M('op.misbehaviour.category', 'Misbehaviour Category', {
    f: 'name:char!; misbehaviour_type:sel(minor=Minor|major=Major|critical=Critical)=minor; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.scholarship', 'Scholarship', {
    f: `name:char~!; student_id:m2o(op.student)!; course_id:m2o(op.course)!; batch_id:m2o(op.batch);
        type_id:m2o(op.scholarship.type); sponsor_id:m2o(res.partner); amount:money!; invoice_id:m2o(account.move);
        scholarship_stages_id:m2o(scholarship.stages); company_id:m2o(res.company);
        state:sel(draft=Draft|approved=Approved|disbursed=Disbursed)=draft`,
    buttons: 'make_invoices:!Invoice:*@; approve:!Approve:draft>approved; disburse:Disburse:approved>disbursed',
    views: 'kanban,list,form',
  }),
  M('scholarship.stages', 'Scholarship Stage', {
    f: 'name:char!; sequence:integer=10; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('grievance', 'Grievance', {
    f: `name:char~!; subject:char!; grievance_for:sel(student=Student|parent=Parent|faculty=Faculty)=student;
        student_id:m2o(op.student); parent_id:m2o(op.parent); faculty_id:m2o(op.faculty);
        grievance_category_id:m2o(grievance.category)!; grievance_team_id:m2o(grievance.team);
        course_id:m2o(op.course); batch_id:m2o(op.batch); created_date:date!=today; description:text;
        action_taken:text; company_id:m2o(res.company);
        state:sel(draft=Draft|submitted=Submitted|in_review=In Review|action=Action Taken|resolve=Resolved|close=Closed|reject=Rejected|cancel=Cancelled)=draft`,
    buttons: 'submitted_progressbar:!Submit:draft>submitted; inreview_progressbar:!In Review:submitted>in_review; resolve_progressbar:!Resolve:action>resolve; close_progressbar:!Close:resolve>close; reject_progressbar:Reject:in_review>reject; cancel_progressbar:Cancel:draft>cancel; review:Start Review:draft,submitted>in_review; resolve:!Resolve:in_review,action>resolve',
    views: 'kanban,list,form,search,pivot,activity',
    portal: { studentField: 'student_id' },
  }),
  M('grievance.category', 'Grievance Category', {
    f: 'name:char!; sla_days:integer=3; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('grievance.team', 'Grievance Team', {
    f: 'name:char!; leader_id:m2o(res.users); company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('op.ied.log', 'IED / Learning Support Log', {
    f: `student_id:m2o(op.student)!; specialist_role:sel(nurse=Registered Nurse|ot=Occupational Therapist|pt=Physiotherapist|sen=SEN Teacher)=ot;
        pathway:sel(eyfs_ied=EYFS IED (Ages 2-10)|asdan_hospitality=ASDAN Hospitality|asdan_hair=ASDAN Hair & Beauty|asdan_sports=ASDAN Sports|asdan_photo=ASDAN Photography & Multimedia|asdan_arts=ASDAN Performing Arts|asdan_computing=ASDAN Computing|asdan_landbase=ASDAN Landbase|asdan_office=ASDAN Office Assistance|asdan_fashion=ASDAN Fashion & Design)=eyfs_ied;
        session_date:datetime=now; progress_note:text!`,
    views: 'list,form,calendar',
    cal: 'session_date',
  }),

  // Module 10: LMS
  M('op.course.module', 'Course Module', {
    f: `name:char!; course_id:m2o(op.course)!; sequence:integer=10; is_module:bool=false;
        module_category:sel(infographic=Image|article=Article|document=Document|video=Video|audio=Audio|quiz=Quiz)=document;
        source_type:sel(local_file=Upload from Device|external=Retrieve from Google Drive)=local_file;
        video_type:sel(url=Url|upload=Upload)=url; audio_type:sel(url=Url|upload=Upload)=url;
        video_url:char; audio_url:char; document_google_url:char; image_google_url:char;
        document_name:char; document_binary_content:binary; image_binary_content:binary;
        quiz_id:m2o(op.quiz); user_id:m2o(res.users); embed_code:text; completion_time:float=1.0;
        is_published:bool=true; website_published:bool=true; active:bool=true;
        question_ids:o2m(op.course.question,module_id):Questions;
        company_id:m2o(res.company)`,
    buttons: 'act_publish:Publish:draft@; act_unpublish:Unpublish:published@',
    views: 'list,form,kanban',
    tabs: 'Document:module_category,source_type,video_type,video_url,audio_type,audio_url,document_name,document_binary_content,quiz_id,completion_time,embed_code|Questions:question_ids',
  }),

  M('op.lms.module', 'LMS Course Content', {
    f: `name:char!; course_id:m2o(op.course)!; sequence:integer=10;
        content_type:sel(video=Video|document=PDF / Slides|quiz=Quiz|assignment=Coursework)=document;
        module_category:sel(infographic=Image|article=Article|document=Document|video=Video|audio=Audio|quiz=Quiz)=document;
        duration_mins:integer=30; completion_time:float=0.5; is_published:bool=true; body:html;
        company_id:m2o(res.company)`,
    views: 'list,form,kanban',
  }),

  M('op.course.enrollment', 'LMS Course Enrollment', {
    f: `course_id:m2o(op.course)!; user_id:m2o(res.users)!; enrollment_date:datetime!=today;
        completion_date:datetime; state:sel(draft=Draft|in_progress=In Progress|done=Done)=in_progress;
        progress:integer=0; order_id:m2o(sale.order);
        enrollment_line:o2m(op.course.enrollment.line,enrollment_id):Enrollment Lines;
        company_id:m2o(res.company)`,
    buttons: 'action_start:Start:draft@; action_complete:Complete:in_progress@; action_reset:Reset:done@',
    views: 'list,form,graph,pivot,kanban',
    tabs: 'Module Content:enrollment_line',
  }),

  M('op.course.enrollment.line', 'Course Enrollment Line', {
    f: `enrollment_id:m2o(op.course.enrollment)!; module_id:m2o(op.course.module)!;
        is_completed:bool=false; completion_date:datetime; company_id:m2o(res.company)`,
    views: 'list,form',
  }),

  M('op.course.announcement', 'Course Announcement', {
    f: 'name:char!; course_id:m2o(op.course)!; user_id:m2o(res.users); announcement_html:html; company_id:m2o(res.company)',
    views: 'list,form',
  }),

  M('op.course.question', 'Content Quiz Question', {
    f: 'question:char!; module_id:m2o(op.course.module); sequence:integer=10; company_id:m2o(res.company)',
    views: 'list,form',
  }),

  M('op.course.answer', 'Slide Question Answer', {
    f: 'answer:char!; question_id:m2o(op.course.question); is_correct:bool=false; company_id:m2o(res.company)',
    views: 'list,form',
  }),

  M('op.course.plan', 'Course Plan', {
    f: 'name:char!; course_id:m2o(op.course)!; academic_term_id:m2o(op.academic.term); fees_term_id:m2o(op.fees.terms); company_id:m2o(res.company)',
    views: 'list,form',
  }),

  // Module 5: Time Table
  M('op.session', 'Timetable Session', {
    f: `name:char~!; timing:char:Timing; timing_slot:char:Interval Slot=08:00-08:45;
        faculty_id:m2o(op.faculty)!; course_id:m2o(op.course)!; batch_id:m2o(op.batch)!;
        subject_id:m2o(op.subject)!; classroom_id:m2o(op.classroom);
        start_datetime:datetime!=now; end_datetime:datetime!=now;
        type:sel(theory=Theory|practical=Practical)=theory;
        days:sel(monday=Monday|tuesday=Tuesday|wednesday=Wednesday|thursday=Thursday|friday=Friday|saturday=Saturday|sunday=Sunday)=monday;
        color:integer=0; meeting_count:integer=0; student_count:integer=0; active:bool=true;
        lesson_ids:m2m(op.lesson):Lesson Plans; student_ids:m2m(op.student):Students;
        state:sel(draft=Draft|confirm=Confirmed|done=Done|cancel=Cancelled)=draft`,
    buttons: 'lecture_confirm:!Confirm:draft>confirm; lecture_done:!Done:confirm>done; lecture_draft:Reset to Draft:confirm,cancel>draft; lecture_cancel:Cancel:confirm,done>cancel; confirm:!Confirm:draft>confirm; done:Done:confirm>done; reset:Reset to Draft:confirm,done,cancel>draft; cancel:Cancel:draft,confirm>cancel',
    smart: 'Attendance Sheet:op.attendance.sheet:session_id',
    views: 'calendar,kanban,list,pivot,form',
    cal: 'start_datetime,end_datetime',
    kanban: { title: 'name', sub: 'timing,subject_id', groupBy: 'days' },
    panel: 'faculty_id',
  }),
  M('op.lesson', 'Lesson Plan', {
    f: `name:char!:Lecture Name; course_id:m2o(op.course)!; batch_id:m2o(op.batch);
        subject_id:m2o(op.subject)!; faculty_id:m2o(op.faculty); start_datetime:datetime=now;
        end_datetime:datetime=now; lesson_topic:text!; session_ids:m2m(op.session):Sessions;
        state:sel(draft=Draft|plan=Planned|conduct=Conducted|cancel=Cancelled)=draft; active:bool=true`,
    buttons: 'lesson_plan:!Planned:draft>plan; lesson_conduct:!Conducted:plan>conduct; lesson_draft:Set to Draft:cancel>draft; lesson_cancel:Cancel:draft,plan>cancel',
    views: 'calendar,list,form,pivot,graph',
    cal: 'start_datetime,end_datetime',
  }),
  M('generate.time.table', 'Generate Timetable Wizard', {
    f: `name:char; course_id:m2o(op.course)!; batch_id:m2o(op.batch)!; start_date:date!=today; end_date:date!=today; skip_conflicts:bool=true`,
    buttons: 'act_gen_time_table:!Proceed:*@',
    views: 'form',
  }),
  M('time.table.report', 'Timetable Report Wizard', {
    f: `state:sel(faculty=Faculty|student=Student)=faculty; faculty_id:m2o(op.faculty); course_id:m2o(op.course); batch_id:m2o(op.batch); start_date:date!=today; end_date:date!=today`,
    buttons: 'gen_time_table_report:!Print:*@',
    views: 'form',
  }),

  // Module 6: Class Attendances
  M('op.attendance.register', 'Attendance Register', {
    f: `name:char!; code:char!; course_id:m2o(op.course)!; batch_id:m2o(op.batch); section_id:m2o(op.section);
        subject_id:m2o(op.subject); attendance_option:sel(generic=Generic|subject=Subject)=generic;
        auto_create:bool=true; auto_create_type:sel(daily=Daily|weekly=Weekly|monthly=Monthly)=daily;
        auto_create_if_session:bool; company_id:m2o(res.company); user_id:m2o(res.users);
        color:integer=0; sheet_count:integer=0; active:bool=true`,
    smart: 'Attendance Sheets:op.attendance.sheet:register_id',
    views: 'kanban,list,form',
  }),
  M('op.attendance.sheet', 'Attendance Sheet', {
    f: `name:char~!; register_id:m2o(op.attendance.register)!; course_id:m2o(op.course); batch_id:m2o(op.batch);
        session_id:m2o(op.session); faculty_id:m2o(op.faculty); attendance_date:date!=today;
        subject_id:m2o(op.subject); section_id:m2o(op.section); attendance_option:sel(generic=Generic|subject=Subject)=generic;
        company_id:m2o(res.company); attendance_percentage:float=100;
        total_present:integer=0; total_absent:integer=0; excused_count:integer=0; late_count:integer=0;
        state:sel(draft=Draft|start=Attendance Start|done=Attendance Taken|cancel=Cancelled)=draft;
        attendance_line:o2m(op.attendance.line,attendance_id):Student Lines; active:bool=true`,
    buttons: 'enable_kiosk:Enable Kiosk:draft@; attendance_start:Attendance Start:draft>start; attendance_done:!Attendance Taken:start@; take_attendance:!Attendance Taken:start@; attendance_cancel:Cancel:draft,start>cancel; attendance_draft:Draft:done,cancel>draft',
    smart: 'Present:op.attendance.line:attendance_id+present; Absent:op.attendance.line:attendance_id+absent; Absent Excused:op.attendance.line:attendance_id+excused; Late:op.attendance.line:attendance_id+late',
    tabs: 'Students:attendance_line',
    views: 'list,kanban,form,pivot,graph',
  }),
  M('op.attendance.line', 'Attendance Line', {
    f: `attendance_id:m2o(op.attendance.sheet)!; student_id:m2o(op.student)!; course_id:m2o(op.course);
        batch_id:m2o(op.batch); attendance_type_id:m2o(op.attendance.type); progression_id:m2o(op.student.progression);
        attendance_date:date!=today; present:bool=true; late:bool; excused:bool:Absent Excused;
        absent:bool:Absent Unexcused; remark:char; check_in:datetime; company_id:m2o(res.company);
        state:sel(draft=Draft|start=Attendance Start|done=Attendance Taken|cancel=Cancelled)=draft; active:bool=true`,
    list: 'student_id,present,excused,absent,late,remark',
    views: 'list,kanban,form,pivot,graph',
    portal: { studentField: 'student_id' },
  }),
  M('op.attendance.type', 'Attendance Type', {
    f: 'name:char!; present:bool; late:bool; excused:bool; absent:bool; company_id:m2o(res.company); active:bool=true',
    views: 'list,form',
  }),
  M('op.activity.type', 'Activity Type', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.achievement.type', 'Achievement Type', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.convocation.ceremony', 'Convocation Ceremony', {
    f: 'name:char!; code:char; date:date!=today; address_id:m2o(res.partner); academic_year_id:m2o(op.academic.year)!; max_guests_per_student:integer=2; venue:char; state:sel(draft=Draft|confirmed=Confirmed|done=Completed)=confirmed; company_id:m2o(res.company)',
    buttons: 'confirm:!Confirm:draft>confirmed; complete:Complete:confirmed>done',
    smart: 'Registration:op.convocation.registration:ceremony_id',
    views: 'kanban,list,form,calendar', cal: 'date',
  }),
  M('op.convocation.registration', 'Convocation Registration', {
    f: 'name:char~!; ceremony_id:m2o(op.convocation.ceremony)!; student_id:m2o(op.student)!; program_id:m2o(op.program); parent_id:m2o(op.parent); registration_date:date!=today; total_guests:integer=2; gown_size:sel(S=Small|M=Medium|L=Large|XL=XL)=M; guest_count:integer=2; attendance:bool=false; company_id:m2o(res.company); state:sel(draft=Draft|registered=Registered|done=Attended|cancelled=Cancelled)=registered',
    buttons: 'action_submit:!Registered:draft>registered; action_approve:!Attended:registered>done; action_cancel:Cancel:draft,registered>cancelled; action_draft:Reset to Draft:cancelled>draft',
    views: 'kanban,list,form',
  }),
  M('op.skill.category', 'Skill Category', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.skill', 'Skill', { f: 'name:char!; category_id:m2o(op.skill.category)!; company_id:m2o(res.company)' }),
  M('op.skill.level', 'Skill Level', { f: 'name:char!; level_progress:integer=50; company_id:m2o(res.company)' }),
  M('program.outcome', 'Program Outcome (OBE)', { f: 'name:char!; code:char!; program_id:m2o(op.program)!; target_attainment:float=75; company_id:m2o(res.company)' }),
  M('course.outcome', 'Course Outcome (OBE)', { f: 'name:char!; code:char!; course_id:m2o(op.course)!; program_outcome_id:m2o(program.outcome); company_id:m2o(res.company)' }),
  M('course.credit', 'Course Credit', { f: 'course_id:m2o(op.course)!; min_credit:float=12; max_credit:float=24; academic_year_id:m2o(op.academic.year); company_id:m2o(res.company)' }),
  M('school.offences', 'School Offence Rule', { f: 'name:char!; code:char; severity:sel(minor=Minor|major=Major|critical=Critical)=minor; company_id:m2o(res.company)' }),
  M('elearning.rules', 'Elearning Rule', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.student.skill.name', 'Skill Name', { f: 'name:char!; code:char; category_id:m2o(op.skill.category); company_id:m2o(res.company)' }),
  M('op.student.skill.level.name', 'Skill Level Name', { f: 'name:char!; level_progress:integer=50; company_id:m2o(res.company)' }),
  M('op.student.skill.type', 'Skill Assessment Template', { f: 'name:char!; company_id:m2o(res.company)' }),
  M('op.convocation.document', 'Convocation Document', { f: 'name:char!; code:char; document_type:sel(student=Student|guest=Guest)=student; company_id:m2o(res.company)' }),
  M('op.area', 'Area', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.specialization', 'Specialization', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.category', 'Category', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.scholarship.type', 'Scholarship Type', { f: 'name:char!; code:char; max_percentage:float=50; company_id:m2o(res.company)' }),
  M('op.course.tag', 'LMS Course Tag', { f: 'name:char!; color:integer=1' }),
  M('op.course.category', 'LMS Course Category', { f: 'name:char!; code:char; desc:text; description:text; active:bool=true; company_id:m2o(res.company)' }),
];
