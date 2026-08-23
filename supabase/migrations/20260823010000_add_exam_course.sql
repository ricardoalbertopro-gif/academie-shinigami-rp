alter table public.exam_attempts
add column course_id text not null default 'combat';

alter table public.exam_attempts
add constraint exam_attempts_course_id_check
check (course_id in ('combat', 'arts-spirituels', 'militaire'));

create index exam_attempts_course_id_idx
on public.exam_attempts (course_id);
