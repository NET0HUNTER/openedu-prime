import { defineModel as M } from '../dsl.js';

/** Modules 7–13: Assignments, Exams, Grade Book, Quiz, Thesis, OMR. */
export const assessmentModels = [
  // Module 7: Assignments
  M('op.assignment', 'Assignment / Coursework', {
    f: `name:char!; sequence:char; course_id:m2o(op.course)!; batch_id:m2o(op.batch)!;
        subject_id:m2o(op.subject)!; faculty_id:m2o(op.faculty)!; reviewer:m2o(op.faculty);
        assignment_type:m2o(grading.assignment.type)!; grading_assignment_id:m2o(grading.assignment);
        year_id:m2o(op.academic.year); term_id:m2o(op.academic.term); late_submission_id:m2o(late.submission);
        company_id:m2o(res.company); attempt_type:sel(single=Single Attempt|multiple=Multiple Attempt)=single;
        attempt:sel(first_graded=First Graded Attempt|last_graded=Last Graded Attempt|lowest_grade=Lowest Grade|highest_grade=Highest Grade|average_of_graded=Average of Graded Attempts)=highest_grade;
        max_attempt:integer=1; grade:m2o(op.grade.table);
        issued_date:datetime=now; submission_date:datetime=now;
        evaluation_type:sel(mark=Marks|grade=Grade)=mark; marks:float=100; point:float=100;
        rubric_template_id:m2o(op.rubric.template);
        final_assessment_attempt_criteria:sel(best_attempt=Best Attempt|worst_attempt=Worst Attempt|first_attempt=First Attempt|last_attempt=Last Attempt)=best_attempt;
        points_validation_status:sel(valid=Points Distributed Correctly|invalid=Points Distribution Mismatch|no_template=No Rubric Template Selected)=no_template;
        allocation_ids:m2m(op.student); assignment_sub_line_count:integer=0;
        missing_student_count:integer=0; is_submission_deadline_passed:bool=false;
        active:bool=true; description:text;
        state:sel(draft=Draft|publish=Published|finish=Finished|cancel=Cancel)=draft`,
    buttons: 'act_publish:!Publish:draft>publish; act_finish:!Finish:publish>finish; update_mark:Update Grades:publish@; act_cancel:Cancel:publish>cancel; act_set_to_draft:Reset to Draft:publish,cancel>draft',
    smart: 'Submissions:op.assignment.sub.line:assignment_id',
    list: 'name,course_id,batch_id,subject_id,assignment_type,issued_date,submission_date,state',
    panel: 'subject_id',
    views: 'list,kanban,form,pivot,graph',
    ribbon: 'state=publish:PUBLISHED; state=finish:FINISHED; state=cancel:CANCELLED',
  }),
  M('op.assignment.sub.line', 'Assignment Submission', {
    f: `assignment_id:m2o(op.assignment)!; student_id:m2o(op.student)!; submission_date:datetime=now;
        marks:float=0; penalty:float=0; obtained_mark:float=0; late_submit:bool=false;
        progression_id:m2o(op.student.progression); grade_table_id:m2o(op.grade.table);
        grade_table_line_id:m2o(op.grade.table.line); grades_id:m2o(op.assign.grade.config);
        rubric_template_id:m2o(op.rubric.template);
        rubric_type:sel(points=Points|percent=Percent)=points;
        assessment_attempt_line_count:integer=0; description:text; note:text;
        company_id:m2o(res.company); active:bool=true;
        state:sel(draft=Draft|submit=Submitted|to_assess=To Assess|accept=Accepted|reject=Rejected|change=Change Req.|ignore=Ignore)=draft`,
    buttons: 'act_submit:!Submit:draft>submit; act_to_assess:!To Assess:submit>to_assess; act_accept:!Accept:to_assess>accept; act_change_req:Change Require:to_assess>change; act_reject:Reject:to_assess>reject; act_draft:Resubmit:reject,change>draft; action_open_pdf_view:Add Rubric Assessment:to_assess@; ignore_submission_attempt:Ignore Attempt:submit,to_assess,reject,change@; annotate_submission:Annotate Submission:submit,to_assess,accept@',
    smart: 'Assessment Attempts:op.assessment.attempt:assignment_sub_line_id',
    list: 'assignment_id,student_id,submission_date,obtained_mark,late_submit,state',
    views: 'list,kanban,form,pivot,graph',
    portal: { studentField: 'student_id' },
  }),
  M('grading.assignment.type', 'Assignment Type', {
    f: 'name:char!; code:char!; assign_type:sel(assignment=Assignment|exam=Exam|quiz=Quiz)=assignment; company_id:m2o(res.company)',
    list: 'name,code,assign_type',
    views: 'list,form',
  }),
  M('op.rubric.template', 'Rubrics Template', {
    f: `name:char!; rubrics_type:sel(points=Points|percent=Percent)=points;
        points_validation_status:sel(valid=Percentages Distributed Correctly|invalid=Percentages Must Total 100%|no_elements=No Elements Added|not_applicable=Not Applicable for Points)=valid;
        company_id:m2o(res.company); template_expired:bool=false;
        template_expired_by:m2o(res.users); template_expired_date:datetime;
        state:sel(draft=Draft|in_use=In Use|cancel=Cancelled|expire=Expired)=in_use`,
    buttons: 'act_in_use:!In Use:draft>in_use; act_re_open:Re-open:cancel>in_use; act_cancel:Cancel:draft,in_use>cancel; action_expire_template:Mark as Expired:draft,cancel@',
    smart: 'Rubric Elements:op.rubric.element:rubrics_template_id',
    list: 'name,rubrics_type,points_validation_status,state',
    views: 'list,form',
  }),
  M('op.rubric.element', 'Rubric Element', {
    f: 'name:char!; rubrics_template_id:m2o(op.rubric.template)!; rubrics_type:sel(points=Points|percent=Percent)=points; point:float=10; percentage:float=25',
    list: 'name,rubrics_template_id,point,percentage',
    views: 'list,form',
  }),
  M('op.rubric.level', 'Rubric Level Configuration', {
    f: 'name:char!; sequence:integer=10; is_active:bool=true; percentage:float=100',
    list: 'sequence,name,percentage,is_active',
    views: 'list,form',
  }),
  M('op.assign.grade.config', 'Assignment Grade Configuration', {
    f: 'grade:char!; company_id:m2o(res.company)',
    list: 'grade,company_id',
    views: 'list,form',
  }),
  M('late.submission', 'Late Submission Rule', {
    f: 'name:char!; company_id:m2o(res.company)',
    smart: 'Rules:late.submission.line:late_submission_id',
    list: 'name,company_id',
    views: 'list,form',
  }),
  M('late.submission.line', 'Late Submission Penalty Line', {
    f: 'late_submission_id:m2o(late.submission)!; no_of_days:integer=1; penalty_type:sel(percentage=Percentage|fixed=Fixed)=percentage; penalty:float=5',
    list: 'late_submission_id,no_of_days,penalty_type,penalty',
    views: 'list,form',
  }),
  M('op.assessment.attempt', 'Assessment Attempt', {
    f: 'name:char!; assignment_sub_line_id:m2o(op.assignment.sub.line)!; assessment_by:m2o(op.faculty); assessment_date:datetime=now; assessment_score:float=0; final_score:float=0; feedback:text',
    list: 'name,assignment_sub_line_id,assessment_by,assessment_date,assessment_score,final_score',
    views: 'list,form',
  }),

  // Module 8: Exams
  M('op.exam.session', 'Exam Session', {
    f: `name:char!; exam_code:char!; exam_type:m2o(op.exam.type)!; course_id:m2o(op.course)!; batch_id:m2o(op.batch)!;
        year_id:m2o(op.academic.year); term_id:m2o(op.academic.term); start_date:date!; end_date:date!;
        venue:char=Main Examination Hall; evaluation_type:sel(normal=Marks & Grade|grade=Grade Only|gpa=GPA|cwa=CWA|cce=CCE)=normal;
        exam_board:sel(CAIE=Cambridge (CAIE)|Edexcel=Pearson Edexcel|Internal=Internal Mock)=CAIE;
        exams_count:integer=0; active:bool=true;
        state:sel(draft=Draft|schedule=Scheduled|held=Held|done=Done|cancel=Cancelled)=draft`,
    buttons: 'act_schedule:!Schedule:draft>schedule; act_held:!Held:schedule>held; act_done:!Done:schedule,held>done; act_cancel:Cancel:schedule,held>cancel; act_draft:Draft:held,schedule,cancel>draft; schedule:!Schedule:draft>schedule; done:Complete:held,schedule>done',
    smart: 'Exams:op.exam:session_id',
    list: 'name,exam_code,course_id,batch_id,exam_type,start_date,end_date,venue,state',
    panel: 'course_id',
    views: 'list,calendar,form,pivot',
    cal: 'start_date,end_date',
  }),
  M('op.exam', 'Exam', {
    f: `name:char!; exam_code:char!; session_id:m2o(op.exam.session)!; subject_id:m2o(op.subject)!;
        faculty_id:m2o(op.faculty); room_id:m2o(op.exam.room):Exam Room; grading_assignment_id:m2o(grading.assignment);
        start_time:datetime=now; end_time:datetime=now; total_marks:float=100; min_marks:float=40;
        attendees_count:integer=0; results_entered:bool=true; active:bool=true;
        note:text; state:sel(draft=Draft|schedule=Scheduled|held=Held|result_updated=Results Updated|done=Done|cancel=Cancelled)=draft`,
    buttons: 'act_schedule:!Schedule Exam:draft>schedule; act_held:!Held Exam:schedule>held; act_result_updated:Result Updated:held>result_updated; act_done:!Finalize:result_updated>done; act_cancel:Cancel:draft,held,schedule>cancel; act_draft:Draft:cancel>draft; schedule:!Schedule Exam:draft>schedule; update_result:Mark Results Updated:held>result_updated; done:!Finalize:result_updated>done; cancel:Cancel:draft,held>cancel',
    smart: 'Attendees:op.exam.attendees:exam_id',
    list: 'name,exam_code,session_id,subject_id,start_time,end_time,total_marks,state',
    panel: 'subject_id',
    views: 'list,calendar,form,pivot',
    cal: 'start_time,end_time',
  }),
  M('op.exam.attendees', 'Exam Attendee / Score', {
    f: `exam_id:m2o(op.exam)!; student_id:m2o(op.student)!; room_id:m2o(op.exam.room);
        course_id:m2o(op.course); batch_id:m2o(op.batch); marks:float; grade:char~;
        status:sel(present=Present|absent=Absent)=present; note:char; active:bool=true`,
    portal: { studentField: 'student_id' },
    views: 'list,form,pivot',
  }),
  M('op.result.template', 'Result Template', {
    f: `name:char!; exam_session_id:m2o(op.exam.session)!; grade_scale_id:m2o(op.grade.scale);
        evaluation_type:sel(normal=Marks & Grade|grade=Grade Only|gpa=GPA|cwa=CWA|cce=CCE)=normal;
        result_date:date!=today; active:bool=true;
        state:sel(draft=Draft|result_generated=Result Generated|generated=Result Generated)=draft`,
    buttons: 'generate_result:!Generate Result:draft@',
    views: 'list,form',
  }),
  M('op.marksheet.register', 'Marksheet Register', {
    f: `name:char!; exam_session_id:m2o(op.exam.session)!; result_template_id:m2o(op.result.template);
        generated_by:m2o(res.users); generated_date:date!=today; total_pass:integer~; total_failed:integer~;
        marksheet_line:o2m(op.marksheet.line,marksheet_reg_id):Student Marksheets; active:bool=true;
        state:sel(draft=Draft|validated=Validated|cancelled=Cancelled)=draft`,
    buttons: 'action_validate:!Validate Marksheet:draft>validated; act_draft:Set to Draft:cancelled>draft; act_cancel:Cancel:draft>cancelled; validate:!Validate Marksheets:draft>validated; cancel:Cancel:draft>cancelled',
    views: 'list,form',
  }),
  M('op.marksheet.line', 'Marksheet Line', {
    f: `marksheet_reg_id:m2o(op.marksheet.register)!; student_id:m2o(op.student)!; progression_id:m2o(op.student.progression);
        total_marks:float; percentage:float; grade:char; gpa:float; gpa_count:float;
        evaluation_type:sel(normal=Marks & Grade|grade=Grade Only|gpa=GPA|cwa=CWA|cce=CCE)=normal;
        status:sel(pass=Pass|fail=Fail)=pass; result_line:o2m(op.result.line,marksheet_line_id):Result Lines; active:bool=true`,
    portal: { studentField: 'student_id' },
    views: 'list,form,pivot',
  }),
  M('op.result.line', 'Result Line', {
    f: `marksheet_line_id:m2o(op.marksheet.line); student_id:m2o(op.student)!; exam_id:m2o(op.exam)!;
        marks:float; grade:char; grade_point:float; credit:float; qp:float;
        evaluation_type:sel(normal=Marks & Grade|grade=Grade Only|gpa=GPA|cwa=CWA|cce=CCE)=normal;
        status:sel(pass=Pass|fail=Fail)=pass; active:bool=true`,
    portal: { studentField: 'student_id' },
    views: 'list,form,graph',
  }),
  M('op.exam.type', 'Exam Type', { f: 'name:char!; code:char; active:bool=true', views: 'list,form' }),
  M('op.exam.room', 'Exam Room', { f: 'name:char!; classroom_id:m2o(op.classroom); capacity:integer=40; active:bool=true', views: 'list,form' }),

  // Module 9: Grade Book
  M('grading.assignment', 'Grading Assignment', {
    f: `sequence:char~!; name:char!; course_id:m2o(op.course)!; batch_id:m2o(op.batch); subject_id:m2o(op.subject);
        faculty_id:m2o(op.faculty)!; assignment_type:m2o(grading.assignment.type)!;
        grade:m2o(op.grade.table); point:float=100;
        year_id:m2o(op.academic.year); term_id:m2o(op.academic.term); issued_date:datetime=now;
        active:bool=true;
        state:sel(draft=Draft|published=Published|grading_started=Grading Started|grading_closed=Grading Closed|grades_published=Grades Published|cancelled=Cancelled)=draft`,
    buttons: 'action_published:!Publish:draft>published; action_grading_started:Grading Started:published>grading_started; action_grading_closed:Grading Closed:grading_started>grading_closed; action_grades_published:!Grades Published:grading_closed>grades_published; action_cancelled:Close:published,grading_started,grading_closed,grades_published>cancelled; action_draft:Draft:cancelled>draft; publish:!Publish:draft>published; start_grading:Start Grading:published>grading_started; close:!Publish Grades:grading_started>grades_published',
    smart: 'Grade:gradebook.line:assignment_id',
    views: 'kanban,list,form',
  }),
  M('gradebook.gradebook', 'Grade Book', {
    f: `name:char~!; student_id:m2o(op.student)!; course_id:m2o(op.course)!; academic_year_id:m2o(op.academic.year)!;
        grade_scale_id:m2o(op.grade.scale); percentage:float~; grade:char~; report_type:sel(normal=Normal|detailed=Detailed)=normal;
        line_ids:o2m(gradebook.line,gradebook_id):Assessment Lines; active:bool=true;
        state:sel(draft=Draft|inprogress=In Progress|in_progress=In Progress|publish=Published|cancelled=Cancelled)=draft`,
    buttons: 'action_inprogress:!In Progress:draft>inprogress; action_publish:!Publish:inprogress,in_progress>publish; recompute_data:!Recompute:*@; student_Grade_override:Generate Final Grade:inprogress,in_progress,publish@; action_cancelled:Cancel:publish>cancelled; action_draft:Draft:cancelled>draft; recompute:!Recompute Grades:*@; publish:!Publish Transcript:draft,inprogress,in_progress>publish',
    smart: 'GradeBook:gradebook.line:gradebook_id',
    portal: { studentField: 'student_id' },
    views: 'list,form',
  }),
  M('gradebook.line', 'Gradebook Line', {
    f: `gradebook_id:m2o(gradebook.gradebook)!; assignment_id:m2o(grading.assignment); subject_id:m2o(op.subject); term_id:m2o(op.academic.term);
        course_id:m2o(op.course); academic_term_id:m2o(op.academic.term);
        assignment_name:char; calculated_score:float; override_score:float; final_grade:char; comment:char; active:bool=true`,
    views: 'list,form,pivot',
  }),
  M('op.honorroll', 'Honor Roll', {
    f: `name:char!; student_id:m2o(op.student); course_id:m2o(op.course); year_id:m2o(op.academic.year); subject_id:m2o(op.subject);
        from_per:float=80; to_per:float=100; percentage:float; award_tier:char=Principal Honor List; description:text; active:bool=true;
        state:sel(draft=Draft|generate=Honor Roll Generated|cancel=Cancelled)=draft`,
    buttons: 'generate_honor_roll:!Generate Honor Roll:draft>generate; action_cancel:Cancel:generate>cancel; action_draft:Draft:cancel>draft',
    views: 'list,form',
  }),
  M('assignment.stage', 'Assignment Stage', {
    f: 'name:char!; sequence:integer=10; fold:bool=false; state:sel(draft=Draft|published=Published|grading_started=Grading Started|grading_closed=Grading Closed|grades_published=Grades Published|cancelled=Cancelled)=draft; active:bool=true',
    views: 'list,form',
  }),
  M('grading.wizard', 'Gradebook Excel Report Wizard', {
    f: 'course_id:m2o(op.course); batch_id:m2o(op.batch); year_id:m2o(op.academic.year); term_id:m2o(op.academic.term); report_type:sel(student=Student|batch=Batch)=batch; student_id:m2o(op.student)',
    buttons: 'action_export:!Export:*@',
    views: 'form',
  }),
  M('op.grade.table', 'Grade Table', {
    f: 'name:char!; active:bool=true; grade_table_ids:o2m(op.grade.table.line,table_id):Grade Lines',
    views: 'list,form',
  }),
  M('op.grade.table.line', 'Grade Table Line', {
    f: 'table_id:m2o(op.grade.table)!; name:char!; percentage:float=100',
    views: 'list,form',
  }),
  M('op.grade.scale', 'Grade Scale', {
    f: `name:char!; board:char=Cambridge / Edexcel / BTEC; state:sel(draft=Draft|active=Active)=active; active:bool=true;
        line_ids:o2m(op.grade.scale.line,scale_id):Grade Boundaries`,
    buttons: 'action_set_active:!Active:draft>active; action_draft:Draft:active>draft; activate:!Active:draft>active; draft:Set Draft:active>draft',
    views: 'list,form',
  }),
  M('op.grade.scale.line', 'Grade Boundary', {
    f: 'scale_id:m2o(op.grade.scale)!; name:char!:Grade; min_pct:float!:Min %; max_pct:float!:Max %; gpa:float:GPA / Points',
    views: 'list,form',
  }),
  M('op.grade.template', 'Grade Template', {
    f: 'name:char!; course_id:m2o(op.course); grade_scale_id:m2o(op.grade.scale); active:bool=true',
    views: 'list,form',
  }),

  // Module 11: Quiz
  M('op.quiz', 'Online Quiz', {
    f: `name:char!; categ_id:m2o(op.quiz.category)!; course_id:m2o(op.course); subject_id:m2o(op.subject);
        quiz_config:sel(normal=Normal|quiz_bank_random=Random from Bank|quiz_bank_selected=Selected from Bank)=normal;
        assigned_to:sel(open_for_all=Open for All|specific_course=Specific Course|specific_batch=Specific Batch|specific_student=Specific Student)=open_for_all;
        total_marks:float=20; lms:bool=false;
        time_config:bool=false; time_limit_hr:integer=0; time_limit_minute:integer=30;
        single_page:bool=false; prev_allow:bool=true; show_answer:bool=false;
        course_ids:m2m(op.course):Courses; batch_ids:m2m(op.batch):Batches;
        line_ids:o2m(op.quiz.line,quiz_id):Questions;
        result_ids:o2m(op.quiz.result,quiz_id):Results;
        description:text; company_id:m2o(res.company); active:bool=true;
        state:sel(draft=Draft|open=Confirm|done=Done|cancel=Closed)=draft`,
    buttons: 'action_confirm:Confirm:draft>open; view_quiz:View Exam:open@; action_done:Done:open>done; action_cancel:Closed:open>cancel; action_draft:Re-open:cancel>draft',
    smart: 'Result:op.quiz.result:quiz_id',
    views: 'list,form,kanban,pivot',
    tabs: 'Questions:line_ids|Configuration:time_config,time_limit_hr,time_limit_minute,single_page,prev_allow,show_answer|Result Message:total_marks|Description:description',
    panel: 'categ_id',
    ribbon: 'state=open:LIVE',
  }),
  M('op.quiz.line', 'Quiz Question', {
    f: `name:char!:Question; quiz_id:m2o(op.quiz)!; mark:float=2; sequence:integer=10;
        que_type:sel(optional=Single Choice|multiple_choice=Multiple Choice|descriptive=Descriptive|blank=Fill in the Blanks|match_following=Match Following|numeric=Numeric)=optional;
        case_sensitive:bool=false; answer:text;
        grade_true_id:m2o(op.answer.grade); grade_false_id:m2o(op.answer.grade);
        bank_id:m2o(op.question.bank); company_id:m2o(res.company)`,
    views: 'list,form',
  }),
  M('op.quiz.question', 'Quiz Question Legacy', {
    f: 'quiz_id:m2o(op.quiz)!; question:char!; qtype:sel(mcq=Multiple Choice|tf=True/False|short=Short Answer)=mcq; options:text; correct_answer:char; marks:float=2; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.question.bank', 'Question Bank', {
    f: `name:char!; bank_type_id:m2o(op.question.bank.type)!; subject_id:m2o(op.subject);
        line_ids:o2m(op.quiz.line,bank_id):Questions; active:bool=true; company_id:m2o(res.company)`,
    views: 'list,form',
  }),
  M('op.quiz.config', 'Quiz Configuration', {
    f: 'name:char!; quiz_id:m2o(op.quiz); bank_id:m2o(op.question.bank); no_of_question:integer=10; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.quiz.result', 'Quiz Result', {
    f: `name:char~!; quiz_id:m2o(op.quiz)!; student_id:m2o(op.student); user_id:m2o(res.users);
        categ_id:m2o(op.quiz.category); total_marks:float=20; received_marks:float=0; score:float=0;
        total_question:integer=0; total_correct:integer=0; total_incorrect:integer=0;
        submit_date:datetime; finish_date:datetime; warnings_count:integer=0;
        line_ids:o2m(op.quiz.result.line,result_id):Result Lines;
        company_id:m2o(res.company);
        state:sel(open=In Progress|hold=On Hold|submit=Submitted|asses=To Assess|done=Done)=done`,
    buttons: 'get_action_submit:Submit:open>submit; get_action_asses:To Assess:submit>asses; get_action_done:Done:asses>done; get_action_re_open:ReOpen:hold>open',
    views: 'list,pivot,form,graph',
    tabs: 'Result:line_ids',
    portal: { studentField: 'student_id' },
  }),
  M('op.quiz.result.line', 'Quiz Result Line', {
    f: `name:char!:Question; result_id:m2o(op.quiz.result)!;
        que_type:sel(optional=Single Choice|multiple_choice=Multiple Choice|descriptive=Descriptive|blank=Fill in the Blanks)=optional;
        question_mark:float=2; mark:float=0; answer:text:Correct Answer; given_answer:text:Given Answer;
        company_id:m2o(res.company)`,
    views: 'list,form',
  }),
  M('op.quiz.category', 'Quiz Category', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),
  M('op.answer.grade', 'Answer Grade', { f: 'name:char!; min_score:float=80; max_score:float=100; remarks:char; company_id:m2o(res.company)' }),
  M('op.question.bank.type', 'Question Bank Type', { f: 'name:char!; code:char; company_id:m2o(res.company)' }),

  // Module 17: Thesis / Extended Project
  M('op.thesis.registration', 'Thesis / Extended Essay', {
    f: `code:char~!; name:char!:Title; student_id:m2o(op.student)!; program_id:m2o(op.program);
        department_id:m2o(op.department); research_area:char!; supervisor_id:m2o(op.faculty);
        registration_date:date=today; program_duration_months:integer=12;
        default_submission_deadline:date; final_submission_deadline:date;
        progress_count:integer=0; extension_count:integer=0;
        committee_ids:o2m(op.thesis.committee,registration_id):Committee Members;
        progress_report_ids:o2m(op.thesis.progress,registration_id):Progress Reports;
        extension_ids:o2m(op.thesis.extension,registration_id):Extension Requests;
        company_id:m2o(res.company);
        state:sel(draft=Draft|submitted=Submitted|approved=Approved|in_progress=In Progress|completed=Completed|cancelled=Cancelled)=draft`,
    buttons: 'action_submit:!Submit:draft>submitted; action_approve:!Approve:submitted>approved; action_start:!Start Research:approved>in_progress; action_submit_thesis:!Submit Thesis:in_progress>completed; action_cancel:Cancel:draft,submitted>cancelled; submit:Submit:draft>submitted; approve:Approve:submitted>approved; start:!Start Research:approved>in_progress; complete:Complete:in_progress>completed',
    smart: 'Progress Reports:op.thesis.progress:registration_id; Extensions:op.thesis.extension:registration_id',
    tabs: 'Committee Members:committee_ids|Progress Reports:progress_report_ids|Extension Requests:extension_ids',
    views: 'kanban,list,form,graph,pivot',
    portal: { studentField: 'student_id' },
  }),
  M('op.thesis.progress', 'Thesis Progress Report', {
    f: `name:char!; registration_id:m2o(op.thesis.registration)!; student_id:m2o(op.student);
        report_id:m2o(op.thesis.report.type); report_date:date!=today; feedback_date:date;
        report_content:text; milestones_completed:text; supervisor_feedback:text;
        company_id:m2o(res.company);
        state:sel(draft=Draft|submitted=Submitted|approved=Approved|rejected=Rejected|reviewed=Reviewed)=draft`,
    buttons: 'action_submit:!Submit:draft>submitted; action_provide_feedback:!Provide Feedback:submitted@; action_approve:Approve:submitted>approved; action_request_revision:Request Revision:submitted>rejected',
    tabs: 'Report Content:report_content,milestones_completed|Supervisor Feedback:supervisor_feedback',
    views: 'list,form,graph,pivot',
  }),
  M('op.thesis.extension', 'Thesis Extension Request', {
    f: `name:char~!; registration_id:m2o(op.thesis.registration)!; student_id:m2o(op.student);
        request_date:date=today; current_deadline:date; requested_deadline:date!;
        extension_duration:integer=14; extension_days:integer=14;
        reason_id:m2o(op.thesis.extension.reason); reason:text; reason_details:text;
        supervisor_id:m2o(op.faculty); hod_id:m2o(op.faculty);
        supervisor_comment:text; hod_comment:text; company_id:m2o(res.company);
        state:sel(draft=Draft|submitted=Submitted|supervisor_review=Supervisor Review|hod_review=HoD Review|approved=Approved|rejected=Rejected)=draft`,
    buttons: 'action_submit:!Submit:draft>supervisor_review; action_supervisor_approve:!Approve as Supervisor:supervisor_review>hod_review; action_supervisor_reject:Reject as Supervisor:supervisor_review>rejected; action_hod_approve:!Approve as HoD:hod_review>approved; action_hod_reject:Reject as HoD:hod_review>rejected; approve:!Approve Extension:submitted,supervisor_review,hod_review>approved; reject:Reject:submitted,supervisor_review,hod_review>rejected',
    tabs: 'Reason Details:reason_details,reason|Supervisor Comment:supervisor_comment|HoD Comment:hod_comment',
    views: 'list,form,graph,pivot',
  }),
  M('op.thesis.submission', 'Thesis Submission', {
    f: `name:char~!; title:char!; registration_id:m2o(op.thesis.registration)!; student_id:m2o(op.student);
        examiner_id:m2o(op.faculty); evaluation_template_id:m2o(op.thesis.evaluation.template);
        submission_date:date=today; total_score:float=0; thesis_file:binary; thesis_filename:char;
        revision_comments:text; company_id:m2o(res.company);
        state:sel(draft=Draft|submitted=Submitted|under_review=Under Review|review=Under Review|evaluated=Evaluated|approved=Approved|completed=Completed)=submitted`,
    buttons: 'action_submit:!Submit:draft>submitted; action_start_review:!Start Review:submitted>under_review; action_approve:!Approve:under_review>approved; action_request_revision:Request Revision:under_review>draft; action_submit_evaluation:!Submit Evaluation:approved>evaluated; action_complete:!Complete:evaluated>completed; start_review:!Start Review:submitted>review; evaluate:Complete Evaluation:review,under_review>evaluated',
    tabs: 'Thesis Document:thesis_file,thesis_filename|Revision Comments:revision_comments|Evaluation:total_score',
    views: 'list,form,graph,pivot',
  }),
  M('op.thesis.committee', 'Thesis Committee Member', {
    f: 'name:char!; registration_id:m2o(op.thesis.registration); faculty_id:m2o(op.faculty)!; role:sel(chair=Chair|supervisor=Supervisor|examiner=External Examiner)=supervisor; email:char; phone:char; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.thesis.evaluation.template', 'Thesis Evaluation Template', {
    f: 'name:char!; max_marks:float=100; criteria_summary:text!; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.thesis.extension.reason', 'Thesis Extension Reason', {
    f: 'name:char!; code:char; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.thesis.report.type', 'Thesis Report Type', {
    f: 'name:char!; code:char; company_id:m2o(res.company)',
    views: 'list,form',
  }),

  // Module 18: OMR
  M('op.omr.exam', 'OMR Exam', {
    f: `name:char!; subject_id:m2o(op.subject)!;
        answersheet_config_id:m2o(op.answersheet.configuration);
        answersheet_configuration_id:m2o(op.answersheet.configuration);
        is_student_upload_omr:bool:Allow Student Upload; display_result:bool=true;
        scanned_count:integer~:Answer Sheets Scanned; answersheet_count:integer=0;
        answer_sheets_line:o2m(op.answer.sheets,omr_exam_id):Student Answers Detail;
        company_id:m2o(res.company);
        state:sel(draft=Draft|confirm=Confirmed|done=Done|cancel=Cancelled)=draft`,
    buttons: 'action_confirm_progressbar:!Confirm:draft>confirm; scan:!Batch Scan & Grade:confirm@; action_done_progressbar:Done:confirm>done; action_cancel_progressbar:Cancel:draft,confirm>cancel; action_draft_progressbar:Draft:cancel>draft; confirm:!Confirm:draft>confirm; done:Done:confirm>done',
    smart: 'Answer Sheets:op.answer.sheets:omr_exam_id',
    tabs: 'Student Answers Detail:answer_sheets_line',
    views: 'kanban,list,form,pivot',
  }),
  M('op.answer.sheets', 'OMR Answer Sheet', {
    f: `student_id:m2o(op.student)!; roll_number:char; omr_exam_id:m2o(op.omr.exam)!;
        key_type:char=A; right_answer:integer=0; wrong_answer:integer=0; not_attampted:integer=0;
        score:float=0; date_time:datetime=now; result_json:text; company_id:m2o(res.company)`,
    tabs: 'Exam Details:key_type,right_answer,wrong_answer,not_attampted,score,date_time|Result:result_json',
    views: 'list,form,pivot,graph',
  }),
  M('op.answersheet.configuration', 'OMR Answer Key', {
    f: 'name:char!; subject_id:m2o(op.subject)!; question_count:integer=50; options_count:integer=4; answer_key:text:Answer Key JSON; company_id:m2o(res.company)',
    views: 'list,form',
  }),
  M('op.omr.template.wizard', 'Generate OMR Sheet Wizard', {
    f: 'name:char=OMR Sheet Template; question_count:integer=50; options_count:integer=4; company_id:m2o(res.company)',
    views: 'form',
  }),
];
