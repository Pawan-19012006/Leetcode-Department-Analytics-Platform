# 📊 LeetCode Department Analytics Platform (LDAP)

[![Tech Stack - Python](https://img.shields.io/badge/Backend-Python%203.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![Framework - FastAPI](https://img.shields.io/badge/API-FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Database - PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Frontend - React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20TS-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![Styles - Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Excel - openpyxl](https://img.shields.io/badge/Audit-Excel%20Archive-217346?style=for-the-badge&logo=microsoftexcel&logoColor=white)](https://openpyxl.readthedocs.io/)

A state-of-the-art **Executive Intelligence Center** for department heads, placement coordinators, and faculty leads to monitor, audit, and direct student coding progress. This platform acts as the authoritative source of truth, automating LeetCode profile tracking and producing historical performance archives to support critical educational decisions.

---

## 🎯 Product & Business Context

Unlike generic student dashboards designed for simple visualization, LDAP is focused entirely on **Executive Decision Making**. The platform's layout, APIs, and archival engines are built to answer critical department-level questions at a glance:

> 1. **How is the department performing overall?**
> 2. **Who is improving rapidly and who is declining?**
> 3. **Which batches/sections are performing best?**
> 4. **Which students need immediate faculty intervention?**
> 5. **What performance shifts occurred this week vs. this month?**
> 6. **Where should placement coordinators focus their attention?**

---

## 🛠️ System Architecture

LDAP is structured as a decoupled two-tier application utilizing a FastAPI service layer and a React client-side presentation layer. 

### Ingestion & Data Flow Pipeline

```mermaid
flowchart TD
    subgraph Client [Presentation Layer - React]
        UI[Executive Dashboard]
        SyncCtrl[Sync Center Console]
    end

    subgraph Service [Service Layer - FastAPI]
        API[API Endpoints Router]
        StudentSvc[Student Service]
        SnapshotSvc[Snapshot Service]
        ExcelSvc[Excel Archive Engine]
        Collector[LeetCode API Collector]
    end

    subgraph Data [Storage Layer]
        DB[(PostgreSQL Database)]
        MasterExcel[Department_Analytics_Master.xlsx]
    end

    subgraph External [External Source]
        LC[LeetCode GraphQL API]
    end

    %% Flow connections
    SyncCtrl -- POST /sync-all --> API
    API --> StudentSvc
    StudentSvc --> Collector
    Collector -- GraphQL Query --> LC
    LC -- JSON Response --> Collector
    Collector --> SnapshotSvc
    SnapshotSvc --> DB
    StudentSvc -- Trigger Update --> ExcelSvc
    ExcelSvc --> DB
    ExcelSvc -- Write/Commit --> MasterExcel
    DB -- Fetch Stats --> API
    API -- JSON Response --> UI
```

---

## 💾 Database Schema

The database consists of 5 core tables managed via SQLAlchemy ORM mapping historical snapshots, contest participation, and language statistics.

```mermaid
erDiagram
    students ||--o{ profile_snapshots : "captures historical snapshots"
    students ||--o{ contest_results : "participates in"
    students ||--o{ language_stats : "uses languages"
    contests ||--o{ contest_results : "contains results for"

    students {
        int id PK
        string roll_no UK
        string name
        int batch
        string section
        string leetcode_username UK
        timestamp created_at
        timestamp updated_at
    }

    profile_snapshots {
        int id PK
        int student_id FK
        timestamp captured_at UK
        double current_rating
        int global_rank
        int contests_attended
        int total_solved
        int easy_solved
        int medium_solved
        int hard_solved
        double top_percentage
    }

    contests {
        int id PK
        string contest_name UK
        string contest_type
        int contest_number
        timestamp contest_date
    }

    contest_results {
        int id PK
        int student_id FK
        int contest_id FK
        int global_rank
        int problems_solved
        int total_problems
        int finish_time_seconds
        double rating_after
        double rating_change
        timestamp fetched_at
    }

    language_stats {
        int id PK
        int student_id FK
        string language_name
        int problems_solved
    }
```

---

## 🚀 Core Features

### 1. Time-Window Analytics (Weekly & Monthly)
Metrics are calculated comparing specific time-windows to identify real-time student activity shifts instead of cumulative, lifetime gains:
* **Weekly Performance**: Compares the current 7-day period against the previous 7 days (Contest rating differences, problems solved delta, and active contest participation shifts).
* **Monthly Performance**: Compares the current 30-day snapshot against the previous 30 days.

### 2. Department Standings Redesign
A high-density spreadsheet-style table optimized for sorting student achievements:
* Left-aligned text columns (Rank, Student, Roll No) combined with right-aligned numeric columns (Rating, Easy, Medium, Hard, and Total Solved) for optimal readability.
* Multi-field sorting supporting difficulty-specific solves and contest ratings.

### 3. Automated Excel Archival Audit
* **Authoritative Archive**: Writes directly to a single file `Department_Analytics_Master.xlsx` at the project root folder.
* **Summary Sheet**: Sheet 1 serves as an audit log detailing chronological sync runs, average ratings, and difficulty solve ratios.
* **Deduplication**: Running multiple sync operations on the same calendar day overwrites that day's sheet (e.g. `10-Jul-2026`) and updates the Summary log row instead of adding duplicates.
* **Missing Value Fallbacks**: Evaluates missing/failed user statistics to `"NA"`, preventing zero-skewed metrics or crashing.

---

## 📁 Project Directory Structure

```text
Leetcode-Tracker/
├── app/                              # FastAPI Backend Application
│   ├── api/                          # HTTP Routers (Student & Contest endpoints)
│   ├── database/                     # DB Session setup & Connection drivers
│   ├── models/                       # SQLAlchemy Database Schema models
│   ├── repositories/                 # SQL database CRUD transactions
│   ├── services/                     # Business Logic (Averages, Ranks, Time-windows)
│   │   ├── excel_service.py          # Master Workbook generation (Summary & Date sheets)
│   │   ├── student_service.py        # Student syncing coordination & cooldowns
│   │   └── analytics_service.py      # Calculations for time-window deltas
│   └── collectors/                   # LeetCode GraphQL API HTTP engines
├── docs/                             # DB specifications and spec outlines
├── frontend/                         # Vite + React Client App
│   ├── src/
│   │   ├── layouts/                  # Base dashboards container shells
│   │   ├── pages/                    # Rankings, Analytics, and Sync console
│   │   ├── services/                 # API connection mappings
│   │   └── index.css                 # Base system layout & typography
│   ├── vite.config.ts
│   └── package.json
├── Department_Analytics_Master.xlsx  # Authoritative Archival Spreadsheet
├── main.py                           # Application launcher entry point
├── requirements.txt                  # Python dependencies
└── walkthrough.md                    # Changelog and verification records
```

---

## ⚙️ Installation & Developer Guide

### Prerequisites
* Python 3.11+
* Node.js 18+
* PostgreSQL server running locally

### 1. Database Setup
Create a PostgreSQL database named `leetcode_tracker` on your local server:
```sql
CREATE DATABASE leetcode_tracker;
```

### 2. Environment Configuration
Create a `.env` file at the root of the directory:
```env
DATABASE_URL=postgresql://postgres:<password>@localhost:5432/leetcode_tracker
```

### 3. Backend Setup
1. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   pip install openpyxl
   ```
3. Run the backend dev server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 4. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install npm packages:
   ```bash
   npm install
   ```
3. Launch the Vite local dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to `http://localhost:5173`.

---

## 📊 Excel Archival System Specifications

The automated archive updates immediately after a **Sync All** operation:

### Sheet 1: `Summary` (Audit Log)
| Sync Date | Total Students | Successful Students | Failed Students | Average Rating | Average Problems Solved | Average Easy | Average Medium | Average Hard |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 09-Jul-2026 | 63 | 63 | 0 | 1497 | 441 | 253 | 163 | 25 |
| 10-Jul-2026 | 63 | 63 | 0 | 1496 | 447 | 256 | 166 | 25 |

### Snapshot Sheet (e.g. `10-Jul-2026`)
| Roll No | Student Name | LeetCode Username | Contest Rating | Total Solved | Easy Solved | Medium Solved | Hard Solved | Latest Weekly Contest Rank | Latest Biweekly Contest Rank |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| 24CB0060 | Vaishnavee | VaishnaveeMurugan | 1483.17 | 346 | 190 | 147 | 9 | 9125 | 9175 |
| 24CB0041 | Rahul Elango | rahulelango1906 | 1270.63 | 427 | 151 | 225 | 51 | 18939 | 13500 |

---

## 🛡️ Data Collection & Cooldown Policy
* **Sync Frequency**: Snapshot sync is scheduled to run every Sunday.
* **API Cooldown**: To protect against LeetCode GraphQL rate limiting, a strict **60-second cooldown** is enforced on the `/sync-all` endpoint between requests, returning a `429 Too Many Requests` if violated.
