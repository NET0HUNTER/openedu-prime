import { defineModel as M } from '../dsl.js';

/** Modules 14–24, 41, 52, 53: Campus, Transportation, Fleet, Library, Digital Library, Events, Placements, Alumni, Recruitment, Job, OnBoarding, Notice Board, AIO, Helpdesk. */
export const campusModels = [
  // Module 14: Campus
  M('op.facility.type', 'Facility Type', {
    f: 'name:char!; code:char; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.campus.facility', 'Campus Facility', {
    f: `name:char!; code:char!; facility_type_id:m2o(op.facility.type)!; parent_id:m2o(op.campus.facility):Parent Zone;
        capacity:integer=30; description:text;
        child_ids:o2m(op.campus.facility,parent_id):Sub Facilities;
        facility_allocation_lines:o2m(op.facility.allocation,facility_id):Facility Allocation;
        active:bool=true; company_id:m2o(res.company)`,
    smart: 'Allocations:op.facility.allocation:facility_id',
    tabs: 'Sub Facilities:child_ids|Facility Allocation:facility_allocation_lines',
    panel: 'facility_type_id',
    views: 'list,form,graph,pivot,kanban',
  }),
  M('op.facility.allocation', 'Facility Allocation', {
    f: `partner_id:m2o(res.partner)!:Person; facility_id:m2o(op.campus.facility)!; product_name:char=Facility Usage Fee;
        fee_amount:money=5000; from_date:datetime!=now; to_date:datetime!=now;
        invoice_id:m2o(account.move); active:bool=true; company_id:m2o(res.company)`,
    buttons: 'create_invoice:!Create Invoice:*@',
    views: 'calendar,list,form,pivot',
    cal: 'from_date,to_date',
  }),

  // Module 15: Transportation & Module 30: Fleet
  M('fleet.vehicle.model.brand', 'Vehicle Manufacturer', {
    f: 'name:char!; image_128:image; model_count:integer=1',
    views: 'kanban,list,form',
  }),
  M('fleet.vehicle.model.category', 'Vehicle Category', {
    f: 'name:char!; sequence:integer=10',
    views: 'list,form',
  }),
  M('fleet.vehicle.model', 'Vehicle Model', {
    f: 'name:char!; brand_id:m2o(fleet.vehicle.model.brand)!; category_id:m2o(fleet.vehicle.model.category); vehicle_type:sel(car=Bus / Car|bike=Bike)=car; seats:integer=33; doors:integer=2',
    views: 'list,form',
  }),
  M('fleet.vehicle', 'Fleet Vehicle', {
    f: `name:char!; license_plate:char!; model_id:m2o(fleet.vehicle.model); model_name:char=Isuzu School Bus;
        driver_id:m2o(res.partner):Driver; future_driver_id:m2o(res.partner):Future Driver;
        category_id:m2o(fleet.vehicle.model.category); category:char=School Bus;
        seats:integer=33; odometer:float=0; odometer_unit:sel(kilometers=km|miles=mi)=kilometers;
        vin_sn:char:Chassis Number; acquisition_date:date=today; car_value:money=8500000;
        contract_count:integer=0; service_count:integer=0; odometer_count:integer=0;
        active:bool=true; company_id:m2o(res.company);
        state:sel(registered=Active|maintenance=Maintenance|reserve=Reserve)=registered`,
    buttons: 'action_accept_driver_change:!Apply New Driver:*@',
    smart: 'Contracts:fleet.vehicle.log.contract:vehicle_id; Services:fleet.vehicle.log.services:vehicle_id; Odometer:fleet.vehicle.odometer:vehicle_id',
    views: 'kanban,list,form,pivot',
    kanban: { title: 'name', sub: 'license_plate,driver_id' },
  }),
  M('fleet.vehicle.odometer', 'Vehicle Odometer Log', {
    f: 'name:char; vehicle_id:m2o(fleet.vehicle)!; date:date=today; value:float=0; unit:char=km; driver_id:m2o(res.partner); company_id:m2o(res.company)',
    views: 'list,form,graph',
  }),
  M('op.vehicle', 'Transport Vehicle', {
    f: `name:char!; license_plate:char!; capacity:integer=33; driver_id:m2o(res.partner);
        model_name:char=Isuzu NQR 33-Seater; active:bool=true; company_id:m2o(res.company)`,
    list: 'name,license_plate,capacity,driver_id,company_id',
    views: 'list,form',
  }),
  M('cost.plan', 'Cost Plan', {
    f: `name:char!; code:char; plan_description:text; bill:integer=1;
        bill_selection:sel(days=Days|weeks=Weeks|months=Months|years=Years)=months;
        expires_after:integer=3; periodicity:sel(monthly=Monthly|termly=Termly|annual=Annual)=termly;
        amount:money=18500; company_id:m2o(res.company)`,
    list: 'name,code,bill,bill_selection,expires_after,company_id',
    views: 'list,form',
  }),
  M('op.route', 'Transport Route', {
    f: `name:char!; vehicle_id:m2o(fleet.vehicle); op_vehicle_id:m2o(op.vehicle);
        cost:money:Monthly Fee=18500; stop_ids:o2m(op.stop,route_id):Stop(s);
        active:bool=true; company_id:m2o(res.company)`,
    tabs: 'Stop(s):stop_ids',
    list: 'name,vehicle_id,cost,company_id',
    views: 'list,form',
  }),
  M('op.stop', 'Bus Stop', {
    f: `sequence:integer=10; name:char!; route_id:m2o(op.route)!;
        estimated_arrival_conf:float=6.75; estimated_arrival:char=06:45 AM;
        partner_ids:m2m(res.partner):Person(s); active:bool=true; company_id:m2o(res.company)`,
    tabs: 'Person(s):partner_ids',
    list: 'sequence,name,route_id,estimated_arrival_conf,company_id',
    views: 'list,form,pivot,graph',
  }),
  M('op.route.register', 'Route Register', {
    f: `name:char!; route_id:m2o(op.route)!; start_date:date!=today; end_date:date!;
        cost:money=18500; plan_id:m2o(cost.plan);
        transport_lines:o2m(op.transportation.agreement,route_register_id):Agreement Applicants;
        company_id:m2o(res.company);
        state:sel(draft=Draft|confirm=Confirmed|cancel=Cancelled|gathering=Register Gathering)=draft`,
    buttons: 'close_register:!Confirm:draft>confirm; register_gathering:!Start Registration:confirm>gathering; cancel_register:Cancel:draft,confirm,gathering>cancel; set_to_draft:Set to Draft:cancel>draft; confirm:!Confirm:draft>confirm; open_reg:!Open Registration:confirm>gathering',
    tabs: 'Agreement Applicants:transport_lines',
    smart: 'Agreements:op.transportation.agreement:route_register_id',
    kanban: { title: 'name', sub: 'route_id,start_date', groupBy: 'none' },
    views: 'kanban,list,form',
  }),
  M('op.route.line', 'Transport Trip', {
    f: `name:char~!; route_id:m2o(op.route)!; route_type:sel(pickup=Morning Pickup|drop=Afternoon Drop)=pickup;
        route_date:date!=today; start_time:char=06:30; driver_id:m2o(res.partner);
        active:bool=true; company_id:m2o(res.company);
        state:sel(draft=Draft|start=In Transit|end=Completed)=draft`,
    buttons: 'start_trip:!Start Trip:draft>start; end_trip:!End Trip:start>end',
    views: 'list,form,pivot,graph,kanban,calendar',
    cal: 'route_date',
  }),
  M('op.transportation.agreement', 'Transport Agreement', {
    f: `partner_id:m2o(res.partner)!:Student / Parent; student_id:m2o(op.student);
        route_register_id:m2o(op.route.register)!; route_id:m2o(op.route)!; stop_id:m2o(op.stop)!;
        plan_id:m2o(cost.plan); date:date!=today; end_date:date; expires_after:integer=3;
        prev_invoice_date:date; next_invoice_date:date; bill:integer=1;
        bill_selection:sel(days=Days|weeks=Weeks|months=Months|years=Years)=months;
        monthly_fee:money=18500; invoice_id:m2o(account.move); company_id:m2o(res.company);
        state:sel(draft=Draft|submit=Submitted|pending=Pending|confirm=Confirmed|agreement=Agreement Confirmed|done=Active|reject=Rejected|cancel=Cancelled)=confirm`,
    buttons: 'submit_form:!Submit:draft>submit; confirm_in_progress:!Confirm:submit,pending>confirm; agreement_confirm:!Agreement Confirm:confirm>agreement; enroll_partner:!Enroll:agreement>done; confirm_pending:Pending:submit>pending; confirm_rejected:Reject:confirm>reject; confirm_cancel:Cancel:draft,submit,pending,confirm,agreement>cancel; confirm_to_draft:Draft:pending,reject,cancel>draft; confirm:!Confirm:draft>confirm; activate:Activate:confirm>done; invoice_now:Bill Month:*@',
    views: 'list,form,pivot,calendar',
    cal: 'date',
  }),

  // Module 16: Library & Module 17: Digital Library
  M('op.media.type', 'Media Type', {
    f: `name:char!; code:char!; issued:integer=0; available:integer=0;
        due_media_today:integer=0; due_media_month:integer=0;
        color:integer=0; total_media:integer=0; company_id:m2o(res.company)`,
    views: 'kanban,list,form',
  }),
  M('op.library.card.type', 'Library Card Type', {
    f: `name:char!; code:char; duration:integer=14; penalty_amt_per_day:float=50;
        allowable_media:integer=3; max_books:integer=3; duration_days:integer=14;
        company_id:m2o(res.company)`,
    views: 'list,form',
  }),
  M('op.library.card', 'Library Card', {
    f: `number:char~!; library_card_type_id:m2o(op.library.card.type);
        type:sel(student=Student|faculty=Faculty)=student;
        student_id:m2o(op.student); faculty_id:m2o(op.faculty); partner_id:m2o(res.partner);
        issue_date:date=today; card_type:char=Standard Student;
        active:bool=true; company_id:m2o(res.company)`,
    list: 'number,library_card_type_id,type,student_id,faculty_id,issue_date',
    views: 'list,form',
  }),
  M('op.media', 'Library Book / Media', {
    f: `name:char!:Title; isbn:char:ISBN; edition:char; internal_code:char;
        media_type_id:m2o(op.media.type)!; author_ids:m2m(op.author); publisher_ids:m2m(op.publisher);
        authors:char; publishers:char; tags:m2m(op.tag); course_ids:m2m(op.course);
        subject_ids:m2m(op.subject); total_units:integer=0; total_media_queue_req:integer=0;
        description:html; active:bool=true; company_id:m2o(res.company);
        unit_ids:o2m(op.media.unit,media_id):Physical Units;
        queue_ids:o2m(op.media.queue,media_id):Queue Requests`,
    smart: 'Units:op.media.unit:media_id; Movements:op.media.movement:media_id; Queue Requests:op.media.queue:media_id',
    tabs: 'Description:description|Education Details:course_ids,subject_ids|Media Queue Requests:queue_ids',
    list: 'name,isbn,media_type_id,internal_code,total_units,active',
    panel: 'media_type_id',
    views: 'kanban,list,form,pivot,graph',
  }),
  M('op.media.unit', 'Media Unit', {
    f: `name:char!; barcode:char!; media_id:m2o(op.media)!; media_type_id:m2o(op.media.type);
        movement_lines:o2m(op.media.movement,media_unit_id); active:bool=true; company_id:m2o(res.company);
        state:sel(available=Available|issue=Issued)=available`,
    buttons: 'issue_media:Issue Media:available>issue; return_media:Return Media:issue>available',
    tabs: 'Movements:movement_lines',
    list: 'name,barcode,media_id,media_type_id,state',
    views: 'list,kanban,form,pivot,graph',
  }),
  M('op.media.movement', 'Media Movement', {
    f: `media_id:m2o(op.media)!; media_type_id:m2o(op.media.type); media_unit_id:m2o(op.media.unit)!;
        queue_count:integer=0; library_card_id:m2o(op.library.card)!; student_id:m2o(op.student);
        faculty_id:m2o(op.faculty); type:sel(student=Student|faculty=Faculty)=student;
        issued_date:datetime=now; return_date:datetime=now; actual_return_date:datetime;
        penalty:float=0; invoice_id:m2o(account.move); is_renew:bool=false;
        active:bool=true; company_id:m2o(res.company);
        state:sel(available=Available|reserve=Reserved|issue=Issued|return=Returned)=issue`,
    buttons: 'issue_media:Issue Media:available,reserve>issue; renew_media:Renew Media:issue@; return_media:Return Media:issue>return; create_penalty_invoice:Create Invoice:return@; return:!Return Media:issue>return; renew:Renew (+14d):issue@',
    list: 'media_id,media_unit_id,library_card_id,student_id,faculty_id,issued_date,return_date,state,penalty',
    views: 'list,form,pivot',
    portal: { studentField: 'student_id' },
  }),
  M('op.media.queue', 'Media Queue Request', {
    f: `name:char!; user_id:m2o(res.users); student_id:m2o(op.student); media_id:m2o(op.media)!;
        date_from:date=today; date_to:date=today; active:bool=true; company_id:m2o(res.company);
        state:sel(request=Request|accept=Accept|reject=Reject)=request`,
    buttons: 'do_accept:Accept:request>accept; do_reject:Reject:request,accept>reject; do_request_again:Request Again:reject>request; accept:!Allocate Copy:request>accept',
    list: 'name,user_id,media_id,date_from,date_to,state',
    views: 'list,form,pivot,graph',
  }),
  M('op.media.purchase', 'Media Purchase Request', {
    f: `request_no:char~; name:char!:Title; author:char; publisher:char; edition:char;
        media_type_id:m2o(op.media.type); course_ids:m2m(op.course); subject_ids:m2m(op.subject);
        requested_id:m2o(res.users); requested_by:m2o(op.faculty); request_date:date=today;
        active:bool=true; company_id:m2o(res.company);
        state:sel(draft=Draft|request=Request|accept=Accept|reject=Reject)=draft`,
    buttons: 'act_requested:Request Media:draft>request; act_accept:Accept:request>accept; act_reject:Reject:request>reject; approve:!Approve Purchase:draft>accept',
    list: 'name,author,publisher,media_type_id,request_date,state',
    views: 'list,form,pivot,graph',
  }),
  M('barcode.issue.media', 'Barcode Issue / Return Media', {
    f: `library_card_id:m2o(op.library.card); media_unit_id:m2o(op.media.unit); media_id:m2o(op.media);
        barcode:char; transaction_type:sel(issue=Issue|return=Return)=issue; company_id:m2o(res.company)`,
    buttons: 'action_issue:!Execute Transaction:*@',
    views: 'form',
  }),
  M('op.author', 'Library Author', {
    f: 'name:char!; address_id:m2o(res.partner); media_ids:m2m(op.media); country:char=Kenya; bio:text; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.publisher', 'Library Publisher', {
    f: 'name:char!; address_id:m2o(res.partner); media_ids:m2m(op.media); city:char=London; website:char; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.tag', 'Media Tag', {
    f: 'name:char!; color:integer=0; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.digital.library.category', 'Digital Library Category', {
    f: 'name:char!; code:char; description:text; material_count:integer=0; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.digital.library.material', 'Digital Library Material', {
    f: `name:char!:Material Title;
        material_type:sel(document=Document|video=Video|audio=Audio|url=URL)=document;
        material_source:sel(upload=Local Upload|url=External URL|youtube=YouTube)=upload;
        category_id:m2o(op.digital.library.category); category_ids:m2m(op.digital.library.category);
        author_ids:m2m(op.author); publisher_ids:m2m(op.publisher); authors:char; publishers:char;
        material_tags:m2m(op.tag); material_edition:char; edition:char; isbn_code:char;
        language_id:m2o(res.lang); publish_online:bool=true; rating:float=5; total_reviews:integer=0;
        material_url:char; material_description:html;
        material_enrollment_line:o2m(op.digital.library.enrollment,material_id):Enrollments;
        company_id:m2o(res.company); active:bool=true`,
    tabs: 'Enrollments:material_enrollment_line|Description:material_description',
    smart: 'Enrollments:op.digital.library.enrollment:material_id',
    views: 'kanban,list,form',
    panel: 'category_id',
  }),

  // Module 19: Events (Clubs, Sports, Convocation)
  M('event.type', 'Event Template', {
    f: 'name:char!; default_timezone:char=Africa/Nairobi; has_seats_limitation:bool=true; seats_max:integer=40; note:text; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('event.stage', 'Event Stage', {
    f: 'name:char!; sequence:integer=10; fold:bool=false; pipe_end:bool=false; description:text',
    views: 'list,form',
  }),
  M('event.tag.category', 'Event Tags Category', {
    f: 'name:char!; is_published:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('event.question', 'Event Question', {
    f: 'title:char!; name:char; question_type:sel(simple_choice=Selection|text_box=Text Input)=simple_choice; is_mandatory_answer:bool=false; once_per_order:bool=false; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('event.lead.rule', 'Event Lead Generation Rule', {
    f: 'name:char!; lead_creation_basis:sel(attendee=Per Attendee|order=Per Order)=attendee; lead_creation_trigger:sel(create=At Registration|confirm=When Confirmed|done=When Attended)=confirm; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('event.event', 'Campus Event / Club', {
    f: `name:char!; event_category:sel(club_paid=Paid Specialist Club (15:20-16:20)|club_free=Teacher-Led Club (Tue/Thu)|sports=Sports (KAIS/PIPSSA)|saturday=Saturday Enrichment|academic=MUN / World Scholar's Cup|convocation=Convocation / Ceremony)=club_paid;
        event_type_id:m2o(event.type); stage_id:m2o(event.stage);
        date_begin:datetime!=now; date_end:datetime!=now; date_tz:char=Africa/Nairobi;
        venue:char; address_id:m2o(res.partner); organizer_id:m2o(res.partner); user_id:m2o(res.users);
        seats_max:integer=40; seats_taken:integer=0; seats_limited:bool=true;
        is_convocation:bool=false; training_event:bool=false;
        ticket_price:money:Term / Club Fee=0; sale_price_total:money=0;
        is_published:bool=true; active:bool=true; company_id:m2o(res.company);
        stage:sel(new=New|booked=Open for Registration|announced=Running|ended=Ended)=booked;
        description:html`,
    buttons: 'announce:!Announce:new,booked>announced; close:End Event:announced>ended; action_invite_contacts:Invite:*@',
    smart: 'Attendees:event.registration:event_id',
    views: 'kanban,calendar,list,form,pivot,graph',
    cal: 'date_begin,date_end',
    panel: 'event_category',
  }),
  M('event.registration', 'Event Attendee Registration', {
    f: `event_id:m2o(event.event)!; partner_id:m2o(res.partner); name:char!:Attendee Name;
        email:char!; phone:char; company_name:char;
        is_convocation:bool=false; program_id:m2o(op.program);
        active:bool=true; company_id:m2o(res.company);
        state:sel(draft=Unconfirmed|open=Registered|done=Attended|cancel=Cancelled)=open`,
    buttons: 'action_confirm:!Registered:draft>open; action_set_done:!Attended:open>done; action_send_badge_email:Send by Email:open,done@; action_cancel:Cancel Registration:draft,open,done>cancel; checkin:!Check In:open>done',
    views: 'list,kanban,form,pivot,graph',
  }),

  // Module 20: Placements, Module 21: Alumni, Module 22: Recruitment, Module 23: Job, Module 24: OnBoarding
  M('op.activity.announcement', 'Placement / University Opportunity', {
    f: `seq:char~!; name:char!; partner_id:m2o(res.partner):University / Partner;
        team_id:m2o(op.placement.cell); season_id:m2o(training.season);
        process:char=Interview & Portfolio Review;
        opportunity_type:sel(university=University Fair|internship=Internship|placement=Career Placement)=university;
        experience:char=Entry Level; start_date:date!=today; end_date:date!;
        written_test:bool=false; group_discussion:bool=false; application_count:integer=0;
        description:text; active:bool=true; company_id:m2o(res.company);
        state:sel(draft=Draft|confirm=Confirmed|published=Published|unpublished=Unpublished)=published`,
    buttons: 'set_confirm:!Confirm:draft>confirm; set_published:!Publish:confirm,unpublished>published; set_unpublished:Unpublish:published>unpublished; set_draft:Draft:confirm,published,unpublished>draft; publish:!Publish:draft,confirm,unpublished>published; unpublish:Unpublish:published>unpublished',
    smart: 'Applications:op.job.applicant:activity_id',
    views: 'kanban,list,form,pivot,calendar',
    cal: 'start_date,end_date',
  }),
  M('op.placement.offer', 'Placement / University Offer', {
    f: `partner_id:m2o(res.partner)!:University / Employer; student_id:m2o(op.student)!; join_date:date;
        offer_package:char:Program / Scholarship; training_period:integer=6;
        training_type:sel(months=Months|years=Years)=months; company_id:m2o(res.company);
        state:sel(draft=Draft|offer=Offer Received|join=Accepted / Joined|reject=Declined|cancel=Cancelled)=offer`,
    buttons: 'placement_offer:!Offer:draft>offer; placement_join:!Join:offer>join; confirm_rejected:Reject:draft,offer>reject; confirm_cancel:Cancel:draft,offer,join>cancel; join:!Accept & Join:offer>join; reject:Decline:offer>reject',
    views: 'list,form,pivot',
    portal: { studentField: 'student_id' },
  }),
  M('op.alumni.group', 'Alumni Batch Group', {
    nocompany: true,
    f: `name:char!; graduation_year:integer=2025; alumni_fees_amount:money=0; member_count:integer=120;
        event_count:integer=1; forum_id:char; description:html; active:bool=true; company_id:m2o(res.company)`,
    buttons: 'createforum:!Create Forum:*@',
    views: 'list,form',
  }),
  M('hr.job', 'Recruitment Position', {
    f: `name:char!; department_id:m2o(hr.department); no_of_recruitment:integer=2;
        is_published:bool=true; description:html`,
    smart: 'Applicants:hr.applicant:job_id',
    views: 'kanban,list,form',
    ribbon: 'is_published=true:PUBLISHED',
  }),
  M('hr.applicant', 'Job Applicant', {
    f: `name:char!:Subject / Role; partner_name:char!:Applicant Name; email_from:char!; partner_phone:char;
        job_id:m2o(hr.job)!; police_clearance_verified:bool:Certificate of Good Conduct Verified;
        stage:sel(new=Initial Qualification|interview1=First Interview|interview2=Demo Lesson / Panel|offer=Contract Proposal|hired=Hired & Cleared|refused=Refused)=new;
        notes:text`,
    buttons: 'hire:!Hire & Create Employee:offer@; refuse:Refuse:new,interview1,interview2,offer>refused',
    views: 'kanban,list,form',
  }),
  M('op.job.post', 'Campus / Alumni Job Post', {
    nocompany: true,
    f: `name:char!; job_post:char:Job Position;
        employment_type:sel(full=Full-Time|part=Part-Time|internship=Internship / Attachment|volunteer=Volunteer)=internship;
        salary_from:money=0; salary_upto:money=0; payable_at:sel(monthly=Monthly|annually=Annually)=monthly;
        created_by:sel(admin=Admin|alumni=Alumni)=admin; alumni_student_id:m2o(op.student);
        expected_employees:integer=1; start_date:date=today; end_date:date;
        street:char; city:char; url:char; active:bool=true; company_id:m2o(res.company);
        state:sel(draft=Draft|review=Review|submit=Start Recruitment|recruiting=Recruitment in Progress|done=Done|stopped=Not Recruiting|cancel=Cancelled)=recruiting;
        description:html`,
    buttons: 'set_review:!Review:draft>review; set_submit:!Start Recruitment:review,done>submit; set_done:Stop Recruitment:submit,recruiting>done; set_cancel:Cancel Recruitment:submit,recruiting>cancel',
    tabs: 'Offer:salary_from,salary_upto,payable_at,employment_type,url|Other Information:created_by,alumni_student_id,start_date,end_date,expected_employees|Description:description',
    views: 'kanban,list,form,pivot,calendar',
    cal: 'start_date,end_date',
  }),
  M('oe.onboarding.steps', 'Onboarding Setup Step', {
    nocompany: true,
    f: `sequence:integer=10; name:char!; step_name:char; target_model:char!; description:char;
        doc_link:char; youtube_link:char; is_start:bool=true; is_done:bool=false; completed:bool=false`,
    buttons: 'open_action_view:!Start:*@; step_done:!Mark as Done:*@; mark_done:!Mark Completed:*@',
    views: 'kanban,list,form',
  }),

  // Module 41: Notice Board
  M('op.notice', 'Notice', {
    f: `notice_number:char~!; name:char!:Title; subject:char!;
        created_by:m2o(res.users); created_date:date=today;
        group_ids:m2m(op.notice.group):Notice Groups;
        academic_year_id:m2o(op.academic.year); academic_term_id:m2o(op.academic.term);
        start_date:date!=today; end_date:date; target_audience:sel(all=All Campuses|parents=Parents Only|students=Students Only|staff=Faculty & Staff)=all;
        high_priority:bool:High Priority / Urgent; description:html!; company_id:m2o(res.company);
        state:sel(draft=Draft|in_progress=In Progress|publish=Published|published=Published|unpublished=Unpublished|cancel=Cancelled)=draft`,
    buttons: 'action_to_in_progress:!In Progress:draft>in_progress; action_to_publish:!Publish:in_progress,draft,unpublished@; action_to_cancel:Cancel:in_progress>cancel; action_to_unpublish:Unpublish:publish,published>unpublished; action_to_draft:Mark as Draft:cancel>draft; publish:!Publish & Broadcast:draft,in_progress,unpublished@; unpublish:Unpublish:publish,published>unpublished',
    views: 'list,kanban,form,pivot',
    ribbon: 'state=published:PUBLISHED; state=publish:PUBLISHED',
  }),
  M('op.circular', 'Circular', {
    f: `circular_number:char~!; name:char!;
        circular_type_id:m2o(op.circular.type):Circular Type;
        circular_type:sel(GEN=General (GEN)|EXM=Exams (EXM)|HOL=Holiday (HOL)|SAF=Health & Safety Drill (SAF))=GEN;
        created_by:m2o(res.users); created_date:date=today;
        group_ids:m2m(op.notice.group):Notice Groups;
        academic_year_id:m2o(op.academic.year); academic_term_id:m2o(op.academic.term);
        subject:char!; start_date:date!=today; end_date:date; high_priority:bool; description:html!; company_id:m2o(res.company);
        state:sel(draft=Draft|in_progress=In Progress|publish=Published|published=Published|unpublished=Unpublished|cancel=Cancelled)=draft`,
    buttons: 'action_in_progress:!In Progress:draft>in_progress; action_publish:!Publish:in_progress,draft,unpublished@; action_cancel:Cancel:in_progress>cancel; action_unpublish:Unpublish:publish,published>unpublished; action_draft:Mark as Draft:cancel>draft; publish:!Publish & Email Parents:draft,in_progress,unpublished@; unpublish:Unpublish:publish,published>unpublished',
    views: 'list,kanban,form,pivot',
    ribbon: 'state=published:PUBLISHED; state=publish:PUBLISHED',
  }),

  // Module 52: AIO (AI Agents)
  M('aio.agent.library', 'AI Agent Library', {
    f: `name:char!; agent_type:sel(single=Single Agent|workflow=Multi-Step Workflow)=single;
        model_name:char=OpenEduCat School Assistant; module_names:char; available_in_portal:bool=true;
        instructions:text!; company_id:m2o(res.company);
        state:sel(draft=Draft|deployed=Deployed)=deployed`,
    buttons: 'deploy:!Deploy:draft>deployed; test_run:Test in Playground:*@',
    views: 'kanban,list,form',
    ribbon: 'state=deployed:DEPLOYED',
  }),
  M('aio.agent', 'AI Agent Instance', {
    f: `name:char!; library_id:m2o(aio.agent.library); model_id:m2o(aio.model);
        system_prompt:text; temperature:float=0.2; active:bool=true; company_id:m2o(res.company);
        state:sel(draft=Draft|active=Active|paused=Paused)=active`,
    buttons: 'action_activate:!Activate:draft,paused>active; action_pause:Pause:active>paused',
    views: 'kanban,list,form',
  }),
  M('aio.playground.message', 'AI Playground Message', {
    f: 'session_id:m2o(aio.playground.session); role:sel(user=User|assistant=Assistant|system=System)=user; content:text!; tokens_used:integer=120; date:datetime=now; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.playground.session', 'AI Playground Session', {
    f: 'name:char!; user_id:m2o(res.users); agent_id:m2o(aio.agent); total_tokens:integer=640; message_count:integer=4; state:sel(active=Active|closed=Closed)=active; company_id:m2o(res.company)',
    views: 'list,kanban,form,pivot,graph',
  }),
  M('aio.session.tag', 'AI Session Tag', {
    nocompany: true,
    f: 'name:char!; color:integer=1',
    views: 'list,form',
  }),
  M('aio.session.analytics', 'AI Session Analytics', {
    f: 'name:char!; session_date:date=today; total_sessions:integer=25; avg_response_ms:integer=420; satisfaction_score:float=4.9; company_id:m2o(res.company)',
    views: 'graph,pivot,list',
  }),
  M('aio.agent.analytics', 'AI Agent Performance', {
    f: 'name:char!; agent_id:m2o(aio.agent); executions_count:integer=140; success_rate:float=98.5; total_tokens:integer=45000; company_id:m2o(res.company)',
    views: 'list,graph,form',
  }),
  M('aio.cost.optimizer', 'AI Cost Optimization', {
    f: 'name:char=Monthly Token Budget & Caching; monthly_budget_usd:float=150; current_spend_usd:float=28.4; semantic_cache_enabled:bool=true; company_id:m2o(res.company)',
    views: 'form,list',
  }),
  M('aio.engagement.metrics', 'Student AI Engagement Metrics', {
    f: 'name:char!; course_id:m2o(op.course); active_learners:integer=85; study_queries:integer=410; quiz_generations:integer=32; company_id:m2o(res.company)',
    views: 'list,graph,form',
  }),
  M('aio.token.trend.analyzer', 'AI Token Trend Analyzer', {
    f: 'name:char=Token Consumption Forecast; period:sel(7d=Last 7 Days|30d=Last 30 Days|90d=Quarter)=30d; prompt_tokens:integer=32000; completion_tokens:integer=13000; company_id:m2o(res.company)',
    views: 'form,list',
  }),
  M('aio.team.analytics', 'AI Team Analytics', {
    f: 'name:char!; agents_count:integer=5; handoffs_count:integer=18; avg_resolution_sec:float=3.4; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.agent.execution', 'AI Agent Execution Log', {
    f: 'name:char~!; agent_id:m2o(aio.agent); user_id:m2o(res.users); input_prompt:text; output_response:text; duration_ms:integer=380; state:sel(running=Running|done=Completed|failed=Failed)=done; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.model.provider', 'AI Model Provider', {
    f: 'name:char!; code:sel(gemini=Google Gemini|openai=OpenAI|anthropic=Anthropic|local=Local Ollama)=gemini; api_base_url:char; is_active:bool=true; company_id:m2o(res.company)',
    views: 'list,form,pivot,graph',
  }),
  M('aio.workflow.execution', 'AI Workflow Execution', {
    f: 'name:char~!; workflow_id:m2o(aio.workflow); trigger_record:char; state:sel(running=Running|completed=Completed|failed=Failed)=completed; executed_at:datetime=now; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.workflow.step', 'AI Workflow Step', {
    f: 'name:char!; workflow_id:m2o(aio.workflow)!; sequence:integer=10; agent_id:m2o(aio.agent); tool_id:m2o(aio.tool); company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.hook', 'AI Event Hook', {
    f: 'name:char!; model_name:char=op.admission; trigger_event:sel(on_create=On Create|on_write=On Update|on_stage=On Stage Change)=on_create; workflow_id:m2o(aio.workflow); active:bool=true; company_id:m2o(res.company)',
    views: 'list,kanban,form',
  }),
  M('aio.hook.log', 'AI Hook Log', {
    f: 'name:char!; hook_id:m2o(aio.hook); res_id:integer=1; status:sel(success=Success|error=Error)=success; timestamp:datetime=now; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.collection', 'AI RAG Knowledge Collection', {
    f: 'name:char!; vector_dimension:integer=1536; documents_count:integer=24; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.webhook.endpoint', 'AI Webhook Endpoint', {
    f: 'name:char!; endpoint_url:char!; secret_token:char; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.database.config', 'AI Database Connector', {
    f: 'name:char!; db_type:sel(postgres=PostgreSQL|sqlite=SQLite|vector=pgvector)=postgres; read_only:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.guardrail', 'AI Safety Guardrail', {
    f: 'name:char!; policy_type:sel(pii=PII Redaction|child_safety=Child Protection Filter|hallucination=Fact Grounding)=child_safety; enforcement:sel(block=Block|warn=Warn|redact=Redact)=block; active:bool=true; company_id:m2o(res.company)',
    views: 'list,kanban,form',
  }),
  M('aio.file.source', 'AI Knowledge File Source', {
    f: 'name:char!; collection_id:m2o(aio.collection); file_type:char=pdf; chunk_size:integer=512; state:sel(indexed=Indexed|pending=Pending)=indexed; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.json.schema', 'AI Structured Output Schema', {
    f: 'name:char!; schema_version:char=1.0; schema_json:text!; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.output.template', 'AI Output Prompt Template', {
    f: 'name:char!; template_body:text!; format:sel(markdown=Markdown|json=JSON|html=HTML)=markdown; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.agent.evaluation', 'AI Agent Evaluation Benchmark', {
    f: 'name:char!; agent_id:m2o(aio.agent); accuracy_score:float=96.4; latency_ms:integer=410; evaluated_on:date=today; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('aio.agent.approval', 'AI Human-in-the-Loop Tool Approval', {
    f: 'name:char!; agent_id:m2o(aio.agent); tool_id:m2o(aio.tool); requested_by:m2o(res.users); state:sel(pending=Pending|approved=Approved|rejected=Rejected)=pending; company_id:m2o(res.company)',
    buttons: 'action_approve:!Approve:pending>approved; action_reject:Reject:pending>rejected',
    views: 'list,form',
  }),

  // Module 53: Helpdesk
  M('helpdesk.ticket', 'Helpdesk Ticket', {
    f: `ticket_seq:char~!; issue_name:char!:Subject; user_id:m2o(res.users):Assigned To;
        partner_id:m2o(res.partner):Requester; partner_name:char; email:char;
        team_id:m2o(helpdesk.team):Helpdesk Team; issue_type_id:m2o(issue.type):Issue Type;
        tag_ids:m2m(helpdesk.tag):Tags; stage_id:m2o(helpdesk.stage):Stage;
        team_name:sel(it_software=IT & ERP Support|hardware=Smart Classroom & AV|facilities=Campus Facilities & Maintenance|admissions=Admissions & Parent Desk)=it_software;
        priority:priority:Priority=1; rating_last_value:float=5;
        start_date:datetime=now; last_updated_date:datetime=now; end_date:datetime; close_date:date;
        help_description:text!; active:bool=true; company_id:m2o(res.company);
        stage:sel(draft=Draft|new=New|in_progress=In Progress|done=Done)=new`,
    buttons: 'action_assign_to_me:!Assign To Me:*@; action_create_opportunity:Create Opportunity:*@; assign_me:Assign To Me:draft,new>in_progress; solve:!Mark Resolved:new,in_progress>done',
    tabs: 'Description:help_description',
    views: 'list,kanban,form,pivot',
  }),
  M('helpdesk.report', 'Helpdesk Analysis Report', {
    f: 'name:char!; team_id:m2o(helpdesk.team); issue_type_id:m2o(issue.type); user_id:m2o(res.users); ticket_count:integer=1; rating:float=4.9; stage:char=done; company_id:m2o(res.company)',
    views: 'graph,pivot,list',
  }),
  M('rating.rating', 'Customer Rating', {
    f: 'res_name:char!:Document; partner_id:m2o(res.partner):Customer; rated_partner_id:m2o(res.partner):Assigned To; rating:float=5; rating_text:sel(top=Satisfied|ok=Okay|ko=Dissatisfied)=top; feedback:text; company_id:m2o(res.company)',
    rec: 'res_name',
    views: 'kanban,form,list,pivot,graph',
  }),
  M('helpdesk.tag', 'Helpdesk Tag', {
    nocompany: true,
    f: 'name:char!; color:integer=1',
    views: 'list,form',
  }),
  M('op.cost.plan', 'Transport Cost Plan', { f: 'name:char!; periodicity:sel(monthly=Monthly|termly=Termly|annual=Annual)=termly; amount:money!' }),
  M('op.digital.library.enrollment', 'Digital Library Enrollment', {
    f: `material_id:m2o(op.digital.library.material)!; user_id:m2o(res.users); student_id:m2o(op.student);
        enrollment_date:datetime=now; last_access:datetime; category_ids:m2m(op.digital.library.category);
        state:sel(draft=Draft|in_progress=In Progress|completed=Completed)=in_progress;
        company_id:m2o(res.company); active:bool=true`,
    buttons: 'action_complete:Complete:in_progress>completed; action_reset:Reset:completed>in_progress',
    list: 'material_id,user_id,enrollment_date,state',
    views: 'list,form',
    portal: { studentField: 'student_id' },
  }),
  M('op.placement.cell', 'Placement Coordination Team', {
    f: 'name:char!; coordinator_id:m2o(op.faculty); email:char; active:bool=true; company_id:m2o(res.company)',
    views: 'kanban,list,form',
  }),
  M('training.season', 'Recruitment Session', {
    f: 'name:char!; academic_year_id:m2o(op.academic.year); start_date:date!; end_date:date!; active:bool=true; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('fleet.vehicle.log.contract', 'Vehicle Contract / Insurance', { f: 'name:char!; vehicle_id:m2o(fleet.vehicle)!; insurer:char=Jubilee Insurance; amount:money!; expiration_date:date!' }),
  M('fleet.vehicle.log.services', 'Vehicle Service Log', { f: 'name:char!; vehicle_id:m2o(fleet.vehicle)!; service_type:char=Scheduled 10,000km Service; amount:money!; date:date!=today' }),
  M('op.job.type', 'Job Post Type', {
    f: 'name:char!; code:char; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('job.post.stage', 'Job Post Stage', {
    f: 'name:char!; sequence:integer=10; fold:bool=false; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.job.applicant', 'Student Job Applicant', {
    f: `name:char!:Candidate; job_post_id:m2o(op.job.post); post_id:m2o(op.job.post);
        activity_id:m2o(op.activity.announcement); stage_id:m2o(job.post.stage);
        student_id:m2o(op.student); user_id:m2o(res.users); email:char!; mobile:char;
        date:date=today; salary_expected:money=0; salary_proposed:money=0; availability:date;
        final_score:float=0; written_score:float=0; interview_score:float=0; gd_score:float=0;
        cover_letter:text; notes:text; is_offer:bool=false; active:bool=true; company_id:m2o(res.company);
        state:sel(applied=Applied|first_interview=First Interview|second_interview=Second Interview|shortlisted=Shortlisted|contract_proposal=Contract Proposal|hired=Placed|contract_signed=Contract Signed)=applied`,
    buttons: 'shortlist:!Shortlist:applied>shortlisted; action_offer:!Send Offer:second_interview,shortlisted@; hire:Mark Placed:shortlisted,contract_proposal>hired',
    tabs: 'Contract:salary_expected,salary_proposed,availability|Additional Information:cover_letter,notes',
    views: 'kanban,list,form,pivot,graph',
  }),
  M('op.notice.group', 'Notice Group', { f: 'name:char!; audience:char=All Campuses & Parents' }),
  M('op.circular.type', 'Circular Type', { f: 'name:char!; code:char!' }),
  M('aio.workflow', 'AI Multi-Agent Workflow', { f: 'name:char!; trigger_model:char; steps_summary:text; state:sel(draft=Draft|active=Active)=active' }),
  M('aio.model', 'AI LLM Model', { f: 'name:char!; provider:sel(gemini=Google Gemini|openai=OpenAI|local=Oshwal On-Prem)=gemini; model_id:char!; context_window:integer=128000' }),
  M('aio.tool', 'AI Agent Tool', { f: 'name:char!; technical_name:char!; description:text!' }),
  M('helpdesk.team', 'Helpdesk Team', {
    f: 'name:char!; leader_id:m2o(res.users); alias_email:char',
    views: 'kanban,list,form',
  }),
  M('issue.type', 'Helpdesk Issue Type', { f: 'name:char!; code:char' }),
  M('helpdesk.stage', 'Helpdesk Stage', { f: 'name:char!; sequence:integer=10; fold:bool' }),
];
