1) Product Modules

Department Analytics

Student Analytics

Contest Analytics

2) Database Schema

students

profile_snapshots

contests

contest_results

language_stats

3) Key Rules

students = identity table

profile_snapshots = historical profile data

contests = contest master data

contest_results = student performance per contest

language_stats = current language stats only

4) Collection Policy

Every Sunday

Fetch profile data

Insert profile snapshot

Fetch contest history

Insert contest results

Never overwrite historical records