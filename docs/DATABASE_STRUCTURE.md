 
 LIST OF ALL TABLES
                List of tables
 Schema |       Name        | Type  |  Owner   
--------+-------------------+-------+----------
 public | contest_results   | table | postgres
 public | contests          | table | postgres
 public | language_stats    | table | postgres
 public | profile_snapshots | table | postgres
 public | students          | table | postgres
(5 rows)

CONTEST_RESULTS table

                                           Table "public.contest_results"
       Column        |           Type           | Collation | Nullable |                   Default                   
---------------------+--------------------------+-----------+----------+---------------------------------------------
 id                  | integer                  |           | not null | nextval('contest_results_id_seq'::regclass)
 student_id          | integer                  |           | not null | 
 contest_id          | integer                  |           | not null | 
 global_rank         | integer                  |           |          | 
 problems_solved     | integer                  |           |          | 
 total_problems      | integer                  |           |          | 
 finish_time_seconds | integer                  |           |          | 
 rating_after        | double precision         |           |          | 
 rating_change       | double precision         |           |          | 
 fetched_at          | timestamp with time zone |           |          | now()
Indexes:
    "contest_results_pkey" PRIMARY KEY, btree (id)
    "ix_contest_results_contest_id" btree (contest_id)
    "ix_contest_results_id" btree (id)
    "ix_contest_results_student_id" btree (student_id)
    "unique_student_contest" UNIQUE CONSTRAINT, btree (student_id, contest_id)
Foreign-key constraints:
    "contest_results_contest_id_fkey" FOREIGN KEY (contest_id) REFERENCES contests(id)
    "contest_results_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id)


Contests table
                                         Table "public.contests"
     Column     |           Type           | Collation | Nullable |               Default                
----------------+--------------------------+-----------+----------+--------------------------------------
 id             | integer                  |           | not null | nextval('contests_id_seq'::regclass)
 contest_name   | character varying(100)   |           | not null | 
 contest_type   | character varying(20)    |           | not null | 
 contest_number | integer                  |           |          | 
 contest_date   | timestamp with time zone |           | not null | 
Indexes:
    "contests_pkey" PRIMARY KEY, btree (id)
    "ix_contests_id" btree (id)
    "unique_contest_name" UNIQUE CONSTRAINT, btree (contest_name)
Referenced by:
    TABLE "contest_results" CONSTRAINT "contest_results_contest_id_fkey" FOREIGN KEY (contest_id) REFERENCES contests(id)

Language Stats Table
                                        Table "public.language_stats"
     Column      |         Type          | Collation | Nullable |                  Default                   
-----------------+-----------------------+-----------+----------+--------------------------------------------
 id              | integer               |           | not null | nextval('language_stats_id_seq'::regclass)
 student_id      | integer               |           | not null | 
 language_name   | character varying(50) |           | not null | 
 problems_solved | integer               |           |          | 
Indexes:
    "language_stats_pkey" PRIMARY KEY, btree (id)
    "ix_language_stats_id" btree (id)
    "ix_language_stats_student_id" btree (student_id)
    "unique_student_language" UNIQUE CONSTRAINT, btree (student_id, language_name)
Foreign-key constraints:
    "language_stats_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id)



Profile Snapshots Table
                                          Table "public.profile_snapshots"
      Column       |           Type           | Collation | Nullable |                    Default                    
-------------------+--------------------------+-----------+----------+-----------------------------------------------
 id                | integer                  |           | not null | nextval('profile_snapshots_id_seq'::regclass)
 student_id        | integer                  |           | not null | 
 captured_at       | timestamp with time zone |           | not null | now()
 current_rating    | double precision         |           |          | 
 global_rank       | integer                  |           |          | 
 contests_attended | integer                  |           |          | 
 total_solved      | integer                  |           |          | 
 easy_solved       | integer                  |           |          | 
 medium_solved     | integer                  |           |          | 
 hard_solved       | integer                  |           |          | 
 top_percentage    | double precision         |           |          | 
Indexes:
    "profile_snapshots_pkey" PRIMARY KEY, btree (id)
    "ix_profile_snapshots_id" btree (id)
    "ix_profile_snapshots_student_id" btree (student_id)
    "unique_student_snapshot" UNIQUE CONSTRAINT, btree (student_id, captured_at)
Foreign-key constraints:
    "profile_snapshots_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id)



Student Table
                                          Table "public.students"
      Column       |           Type           | Collation | Nullable |               Default                
-------------------+--------------------------+-----------+----------+--------------------------------------
 id                | integer                  |           | not null | nextval('students_id_seq'::regclass)
 roll_no           | character varying(20)    |           | not null | 
 name              | character varying(100)   |           | not null | 
 batch             | integer                  |           | not null | 
 section           | character varying(10)    |           |          | 
 leetcode_username | character varying(100)   |           | not null | 
 created_at        | timestamp with time zone |           |          | now()
 updated_at        | timestamp with time zone |           |          | 
Indexes:
    "students_pkey" PRIMARY KEY, btree (id)
    "ix_students_id" btree (id)
    "ix_students_leetcode_username" UNIQUE, btree (leetcode_username)
    "ix_students_roll_no" UNIQUE, btree (roll_no)
Referenced by:
    TABLE "contest_results" CONSTRAINT "contest_results_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id)
    TABLE "language_stats" CONSTRAINT "language_stats_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id)
    TABLE "profile_snapshots" CONSTRAINT "profile_snapshots_student_id_fkey" FOREIGN KEY (student_id) REFERENCES students(id)

FOREIGN KEYS:

    table_name     | column_name | foreign_table_name | foreign_column_name 
-------------------+-------------+--------------------+---------------------
 profile_snapshots | student_id  | students           | id
 contest_results   | student_id  | students           | id
 contest_results   | contest_id  | contests           | id
 language_stats    | student_id  | students           | id
(4 rows)

