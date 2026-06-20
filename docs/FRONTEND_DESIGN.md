APPLICATION STRUCTURE

This is not a LeetCode clone.

This is a Department Performance Analytics Platform.

Pages planned:

1. Analytics Dashboard
2. Contest Dashboard
3. Student Dashboard
4. Department Rankings
5. Student Profiles
6. Sync Center (Admin)
7. Reports & Exports

--------------------------------

ANALYTICS DASHBOARD

Purpose:
High-level department insights.

Sections:

Top KPI Cards
- Total Students
- Active Students
- Contest Participants
- Average Rating

Charts
- Rating Distribution
- Contest Participation Trend
- Problems Solved Trend
- Department Growth

Leaderboards
- Top Rated Students
- Most Improved Students
- Most Active Students

Quick Insights
- Students At Risk
- Students Improving
- Placement Ready Students

--------------------------------

CONTEST DASHBOARD

Purpose:
Analyze a single contest.

Layout:

Contest Type Toggle
[ Weekly ] [ Biweekly ]

Contest Selector
[ Contest Number Dropdown ]

Summary Cards
- Contest Name
- Total Students
- Attended
- Not Attended
- Average Rank

Department Rankings Table

Columns:
- Department Rank
- Student Name
- Year
- Roll Number
- Problems Solved
- Contest Rank
- Rating
- Status

Status:
- Attended
- Not Attended

Visual Requirements:
- Top 3 badges
- Green positive indicators
- Red not-attended indicators
- Search
- Filters
- Sorting

--------------------------------

STUDENT PROFILE PAGE

Purpose:
View complete student performance.

Sections:

Profile Card
- Name
- Roll Number
- LeetCode Username
- Current Rating

Statistics
- Problems Solved
- Contest Count
- Average Rank

Charts
- Rating History
- Contest History

Contest Timeline

--------------------------------

DEPARTMENT RANKINGS

Purpose:
Department-wide leaderboard.

Columns:
- Rank
- Student
- Year
- Rating
- Total Solved
- Contest Participation

Filters:
- Year
- Section
- Rating Range

--------------------------------

DESIGN PHILOSOPHY

Think:

LeetCode + GitHub + Linear + Stripe

NOT:

College ERP
Excel Sheet
Bootstrap Admin Panel

The UI should look like a modern SaaS analytics product.