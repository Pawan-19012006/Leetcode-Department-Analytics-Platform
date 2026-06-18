1) Project Overview

Department-wide LeetCode performance tracking platform.

The platform automatically collects, stores,
analyzes and visualizes LeetCode performance
data for CSBS students.

The system serves as the department's source
of truth for coding performance analytics.

2) Problem Statement

Students manually submit forms.

No centralized historical database.

No analytics.

No trend monitoring.

No participation tracking.

3) Goals

Automate LeetCode data collection.

Maintain historical records.

Provide department analytics.

Provide contest analytics.

Generate reports.

Track long-term student growth.

4) User Roles

Admin (Faculty)

Viewer (Students)

5) Product Architecture

Dashboard

├── Department Analytics
├── Student Analytics
└── Contest Analytics

6) Department Analytics

Average Rating

Top 10 Rating

Top 10 Solved

Participation Rate

Most Improved Students

Rating Distribution

7) Student Analytics

Search

Filters

Sorting

Student Table

Student Detail Panel

8) Contest Analytics

Contest Explorer

Weekly Tab

Biweekly Tab

Contest Summary

Contest Ranking Table

9) Database Requirements

Students

Profile Snapshots

Contests

Contest Results

Language Statistics

10) Data Collection Workflow

Student List
      ↓
LeetCode GraphQL
      ↓
Collector Service
      ↓
Validation
      ↓
PostgreSQL
      ↓
Analytics APIs
      ↓
Dashboard

11) Future Enhancements

Participation Analytics

Inactive Student Detection

Rating Predictions

Batch Comparisons

Excel Reports

Email Reports