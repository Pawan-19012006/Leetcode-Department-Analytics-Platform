from datetime import datetime, timedelta, timezone
from app.repositories.student_repository import get_all_students
from app.repositories.profile_snapshot_repository import (
    get_latest_snapshot,
    get_snapshot_closest_to_date,
    get_all_snapshots_for_student
)

def get_tz_aware_now():
    return datetime.now(timezone.utc)

def get_student_window_stats(db, now=None):
    if now is None:
        now = get_tz_aware_now()

    students = get_all_students(db)
    weekly_date = now - timedelta(days=7)
    monthly_date = now - timedelta(days=30)
    prev_weekly_date = now - timedelta(days=14)
    prev_monthly_date = now - timedelta(days=60)

    student_stats = []

    for student in students:
        # Fetch snapshots
        latest = get_latest_snapshot(db, student.id)
        snap_7d = get_snapshot_closest_to_date(db, student.id, weekly_date)
        snap_30d = get_snapshot_closest_to_date(db, student.id, monthly_date)
        
        # Historical snapshots for double-window comparison
        snap_14d = get_snapshot_closest_to_date(db, student.id, prev_weekly_date)
        snap_60d = get_snapshot_closest_to_date(db, student.id, prev_monthly_date)

        # Baseline details
        rating = latest.current_rating if latest else 1500.0
        solved = latest.total_solved if latest else 0
        easy = latest.easy_solved if latest else 0
        medium = latest.medium_solved if latest else 0
        hard = latest.hard_solved if latest else 0
        contests = latest.contests_attended if latest else 0
        global_rank = latest.global_rank if latest else None
        top_percentage = latest.top_percentage if latest else None
        captured_at = latest.captured_at if latest else None

        # Weekly comparisons (Current Week vs Previous Week)
        # Week 1: Latest vs 7d ago
        w1_rating_change = rating - snap_7d.current_rating if (latest and snap_7d) else 0.0
        w1_solved_change = solved - snap_7d.total_solved if (latest and snap_7d) else 0
        w1_easy_change = easy - snap_7d.easy_solved if (latest and snap_7d) else 0
        w1_medium_change = medium - snap_7d.medium_solved if (latest and snap_7d) else 0
        w1_hard_change = hard - snap_7d.hard_solved if (latest and snap_7d) else 0
        w1_contests = contests - snap_7d.contests_attended if (latest and snap_7d) else 0

        # Week 2: 7d ago vs 14d ago
        w2_rating_change = snap_7d.current_rating - snap_14d.current_rating if (snap_7d and snap_14d) else 0.0
        w2_solved_change = snap_7d.total_solved - snap_14d.total_solved if (snap_7d and snap_14d) else 0
        w2_contests = snap_7d.contests_attended - snap_14d.contests_attended if (snap_7d and snap_14d) else 0

        # Monthly comparisons (Current Month vs Previous Month)
        # Month 1: Latest vs 30d ago
        m1_rating_change = rating - snap_30d.current_rating if (latest and snap_30d) else 0.0
        m1_solved_change = solved - snap_30d.total_solved if (latest and snap_30d) else 0
        m1_easy_change = easy - snap_30d.easy_solved if (latest and snap_30d) else 0
        m1_medium_change = medium - snap_30d.medium_solved if (latest and snap_30d) else 0
        m1_hard_change = hard - snap_30d.hard_solved if (latest and snap_30d) else 0
        m1_contests = contests - snap_30d.contests_attended if (latest and snap_30d) else 0

        # Month 2: 30d ago vs 60d ago
        m2_rating_change = snap_30d.current_rating - snap_60d.current_rating if (snap_30d and snap_60d) else 0.0
        m2_solved_change = snap_30d.total_solved - snap_60d.total_solved if (snap_30d and snap_60d) else 0
        m2_contests = snap_30d.contests_attended - snap_60d.contests_attended if (snap_30d and snap_60d) else 0

        # Activity indicators
        has_snapshots = latest is not None
        # Active in last 30d if they attended at least 1 contest or registered snapshots
        active_last_30d = w1_contests > 0 or m1_contests > 0 or (latest and (now - latest.captured_at.replace(tzinfo=timezone.utc)).days < 30)

        student_stats.append({
            "student_id": student.id,
            "name": student.name,
            "roll_no": student.roll_no,
            "leetcode_username": student.leetcode_username,
            "section": student.section,
            "batch": student.batch,
            "has_snapshots": has_snapshots,
            "current_rating": rating,
            "total_solved": solved,
            "easy_solved": easy,
            "medium_solved": medium,
            "hard_solved": hard,
            "contests_attended": contests,
            "global_rank": global_rank,
            "top_percentage": top_percentage,
            "captured_at": captured_at.isoformat() if captured_at else None,

            # Weekly Window metrics (w1)
            "weekly_rating_change": w1_rating_change,
            "weekly_solved_change": w1_solved_change,
            "weekly_easy_change": w1_easy_change,
            "weekly_medium_change": w1_medium_change,
            "weekly_hard_change": w1_hard_change,
            "weekly_contests": w1_contests,

            # Previous Weekly Window metrics (w2)
            "prev_weekly_rating_change": w2_rating_change,
            "prev_weekly_solved_change": w2_solved_change,
            "prev_weekly_contests": w2_contests,

            # Monthly Window metrics (m1)
            "monthly_rating_change": m1_rating_change,
            "monthly_solved_change": m1_solved_change,
            "monthly_easy_change": m1_easy_change,
            "monthly_medium_change": m1_medium_change,
            "monthly_hard_change": m1_hard_change,
            "monthly_contests": m1_contests,

            # Previous Monthly Window metrics (m2)
            "prev_monthly_rating_change": m2_rating_change,
            "prev_monthly_solved_change": m2_solved_change,
            "prev_monthly_contests": m2_contests,

            "active_last_30d": active_last_30d
        })

    return student_stats

def compute_department_health(student_stats, total_count):
    if total_count == 0:
        return 0, "Needs Data"

    active_students = [s for s in student_stats if s["has_snapshots"]]
    if not active_students:
        return 0, "Needs Data"

    # 1. Participation: Turnout rate in 30d
    active_30d = sum(1 for s in student_stats if s["active_last_30d"])
    participation_ratio = active_30d / total_count

    # 2. Growth: Percentage of active students with positive monthly rating changes
    positive_growth = sum(1 for s in active_students if s["monthly_rating_change"] > 0)
    growth_ratio = positive_growth / len(active_students)

    # 3. Quality: Percentage of active students above 1500 rating
    above_1500 = sum(1 for s in active_students if s["current_rating"] >= 1500)
    quality_ratio = above_1500 / len(active_students)

    # Combine metrics: 40% participation, 30% growth, 30% quality profile
    health_score = int((participation_ratio * 40) + (growth_ratio * 30) + (quality_ratio * 30))
    health_score = max(0, min(100, health_score))

    if health_score >= 85:
        status = "Excellent"
      
    elif health_score >= 70:
        status = "Good"
    elif health_score >= 50:
        status = "Average"
    else:
        status = "Needs Attention"

    return health_score, status

def get_overview_analytics_service(db):
    now = get_tz_aware_now()
    student_stats = get_student_window_stats(db, now)
    total_students = len(student_stats)

    active_cohort = [s for s in student_stats if s["has_snapshots"]]
    active_students = len(active_cohort)

    avg_rating = sum(s["current_rating"] for s in active_cohort) / active_students if active_students else 1500.0
    avg_solved = sum(s["total_solved"] for s in active_cohort) / active_students if active_students else 0.0
    avg_participation = sum(s["contests_attended"] for s in active_cohort) / active_students if active_students else 0.0

    above_1600 = sum(1 for s in active_cohort if s["current_rating"] >= 1600)
    below_1400 = sum(1 for s in active_cohort if s["current_rating"] < 1400)

    # Mathematical Health Score
    health_score, health_status = compute_department_health(student_stats, total_students)

    # Weekly highlights top 5
    # Weekly top 5 rating
    weekly_top_rating = sorted(
        [s for s in active_cohort if s["weekly_rating_change"] > 0],
        key=lambda s: (s["weekly_rating_change"], s["weekly_solved_change"]),
        reverse=True
    )[:5]

    # Weekly top 5 solved
    weekly_top_solved = sorted(
        [s for s in active_cohort if s["weekly_solved_change"] > 0],
        key=lambda s: (s["weekly_solved_change"], s["weekly_rating_change"]),
        reverse=True
    )[:5]

    # Monthly highlights top 5
    monthly_top_rating = sorted(
        [s for s in active_cohort if s["monthly_rating_change"] > 0],
        key=lambda s: (s["monthly_rating_change"], s["monthly_solved_change"]),
        reverse=True
    )[:5]

    monthly_top_solved = sorted(
        [s for s in active_cohort if s["monthly_solved_change"] > 0],
        key=lambda s: (s["monthly_solved_change"], s["monthly_rating_change"]),
        reverse=True
    )[:5]

    # Rating distribution bins
    bins = [
        {"bin": "< 1400", "count": 0},
        {"bin": "1400-1499", "count": 0},
        {"bin": "1500-1599", "count": 0},
        {"bin": "1600-1699", "count": 0},
        {"bin": "1700-1799", "count": 0},
        {"bin": "1800+", "count": 0}
    ]
    for s in active_cohort:
        r = s["current_rating"]
        if r < 1400:
            bins[0]["count"] += 1
        elif r < 1500:
            bins[1]["count"] += 1
        elif r < 1600:
            bins[2]["count"] += 1
        elif r < 1700:
            bins[3]["count"] += 1
        elif r < 1800:
            bins[4]["count"] += 1
        else:
            bins[5]["count"] += 1

    return {
        "total_students": total_students,
        "active_students": active_students,
        "average_rating": avg_rating,
        "average_solved": avg_solved,
        "average_participation": avg_participation,
        "students_above_1600": above_1600,
        "students_below_1400": below_1400,
        "health_score": health_score,
        "health_status": health_status,
        "weekly_top_rating": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "weekly_rating_change": s["weekly_rating_change"],
                "weekly_solved_change": s["weekly_solved_change"]
            }
            for s in weekly_top_rating
        ],
        "weekly_top_solved": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "weekly_rating_change": s["weekly_rating_change"],
                "weekly_solved_change": s["weekly_solved_change"]
            }
            for s in weekly_top_solved
        ],
        "monthly_top_rating": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "monthly_rating_change": s["monthly_rating_change"],
                "monthly_solved_change": s["monthly_solved_change"]
            }
            for s in monthly_top_rating
        ],
        "monthly_top_solved": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "monthly_rating_change": s["monthly_rating_change"],
                "monthly_solved_change": s["monthly_solved_change"]
            }
            for s in monthly_top_solved
        ],
        "rating_distribution": bins
    }

def get_weekly_analytics_service(db):
    now = get_tz_aware_now()
    student_stats = get_student_window_stats(db, now)
    active_cohort = [s for s in student_stats if s["has_snapshots"]]
    total_students = len(student_stats)

    # Turnout this week: active in at least 1 contest
    weekly_active = sum(1 for s in active_cohort if s["weekly_contests"] > 0)
    weekly_solved = sum(s["weekly_solved_change"] for s in active_cohort)
    avg_gain = sum(s["weekly_rating_change"] for s in active_cohort) / len(active_cohort) if active_cohort else 0.0
    participation_rate = (weekly_active / total_students * 100) if total_students else 0.0

    # Weekly Leaderboard
    # Primary Weight: rating change, Secondary: solved increase, Tertiary: weekly contest count
    weekly_leaderboard = sorted(
        active_cohort,
        key=lambda s: (s["weekly_rating_change"], s["weekly_solved_change"], s["weekly_contests"]),
        reverse=True
    )

    # Weekly Problems Leaderboard
    weekly_problems_leaderboard = sorted(
        active_cohort,
        key=lambda s: (s["weekly_solved_change"], s["weekly_rating_change"]),
        reverse=True
    )

    # Weekly Participation Leaderboard
    weekly_participation_leaderboard = sorted(
        active_cohort,
        key=lambda s: (s["weekly_contests"], s["weekly_solved_change"]),
        reverse=True
    )

    # Weekly Underperformers (worst first)
    # Largest rating decrease (rating change ascending), lowest participation (contests ascending)
    weekly_underperformers = sorted(
        [s for s in active_cohort if s["weekly_rating_change"] < 0 or s["weekly_contests"] == 0],
        key=lambda s: (s["weekly_rating_change"], s["weekly_contests"], s["weekly_solved_change"])
    )

    # Weekly rating distribution change (Current Week vs Previous Week)
    # Bins: we calculate current week bins vs prev week bins
    cur_bins = [0]*6
    prev_bins = [0]*6
    for s in active_cohort:
        r_cur = s["current_rating"]
        r_prev = r_cur - s["weekly_rating_change"]
        
        # current
        for i, val in enumerate([1400, 1500, 1600, 1700, 1800]):
            if r_cur < val:
                cur_bins[i] += 1
                break
        else:
            cur_bins[5] += 1

        # previous
        for i, val in enumerate([1400, 1500, 1600, 1700, 1800]):
            if r_prev < val:
                prev_bins[i] += 1
                break
        else:
            prev_bins[5] += 1

    bin_labels = ["< 1400", "1400-1499", "1500-1599", "1600-1699", "1700-1799", "1800+"]
    distribution_change = [
        {"bin": bin_labels[i], "change": cur_bins[i] - prev_bins[i]}
        for i in range(6)
    ]

    improved = sum(1 for s in active_cohort if s["weekly_rating_change"] > 0)
    declined = sum(1 for s in active_cohort if s["weekly_rating_change"] < 0)
    inactive = sum(1 for s in active_cohort if s["weekly_contests"] == 0)

    # Section mapping
    sections = {}
    for s in active_cohort:
        sec = s["section"] or "Unknown"
        if sec not in sections:
            sections[sec] = {"total_change": 0.0, "solved": 0, "count": 0}
        sections[sec]["total_change"] += s["weekly_rating_change"]
        sections[sec]["solved"] += s["weekly_solved_change"]
        sections[sec]["count"] += 1

    best_sec = "N/A"
    best_sec_val = -9999.0
    for sec, data in sections.items():
        avg_gain_sec = data["total_change"] / data["count"] if data["count"] > 0 else 0.0
        if avg_gain_sec > best_sec_val:
            best_sec_val = avg_gain_sec
            best_sec = sec

    # Highest weekly rating gain
    highest_gain_student = weekly_leaderboard[0] if weekly_leaderboard else None
    highest_solved_student = weekly_problems_leaderboard[0] if weekly_problems_leaderboard else None

    highest_gain_desc = f"{highest_gain_student['name']} (+{int(highest_gain_student['weekly_rating_change'])} pts)" if highest_gain_student and highest_gain_student["weekly_rating_change"] > 0 else "No gains"
    highest_solved_desc = f"{highest_solved_student['name']} (+{highest_solved_student['weekly_solved_change']} solved)" if highest_solved_student and highest_solved_student["weekly_solved_change"] > 0 else "No solved"

    insights = {
        "highest_rating_gain": highest_gain_desc,
        "most_problems_solved": highest_solved_desc,
        "best_performing_section": f"Section {best_sec}" if best_sec != "N/A" else "None",
        "inactive_students_count": inactive
    }

    return {
        "active_students": weekly_active,
        "problems_solved": weekly_solved,
        "average_rating_gain": avg_gain,
        "participation_rate": participation_rate,
        "top_performers": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "rating_gain": s["weekly_rating_change"],
                "problems_solved": s["weekly_solved_change"],
                "contests": s["weekly_contests"]
            }
            for s in weekly_leaderboard[:15]
        ],
        "underperformers": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "rating_loss": s["weekly_rating_change"],
                "contest_activity": s["weekly_contests"]
            }
            for s in weekly_underperformers[:15]
        ],
        "weekly_problems_leaderboard": [
            {"name": s["name"], "username": s["leetcode_username"], "solved_change": s["weekly_solved_change"]}
            for s in weekly_problems_leaderboard[:10]
        ],
        "weekly_participation_leaderboard": [
            {"name": s["name"], "username": s["leetcode_username"], "contests": s["weekly_contests"]}
            for s in weekly_participation_leaderboard[:10]
        ],
        "weekly_rating_distribution_change": distribution_change,
        "students_improved": improved,
        "students_declined": declined,
        "students_inactive": inactive,
        "insights": insights
    }

def get_monthly_analytics_service(db):
    now = get_tz_aware_now()
    student_stats = get_student_window_stats(db, now)
    active_cohort = [s for s in student_stats if s["has_snapshots"]]
    total_students = len(student_stats)

    monthly_active = sum(1 for s in active_cohort if s["monthly_contests"] > 0)
    monthly_solved = sum(s["monthly_solved_change"] for s in active_cohort)
    avg_gain = sum(s["monthly_rating_change"] for s in active_cohort) / len(active_cohort) if active_cohort else 0.0
    participation_rate = (monthly_active / total_students * 100) if total_students else 0.0

    # Monthly leaderboard
    monthly_leaderboard = sorted(
        active_cohort,
        key=lambda s: (s["monthly_rating_change"], s["monthly_solved_change"], s["monthly_contests"]),
        reverse=True
    )

    monthly_underperformers = sorted(
        [s for s in active_cohort if s["monthly_rating_change"] < 0 or s["monthly_contests"] == 0],
        key=lambda s: (s["monthly_rating_change"], s["monthly_contests"], s["monthly_solved_change"])
    )

    improved = sum(1 for s in active_cohort if s["monthly_rating_change"] > 0)
    declined = sum(1 for s in active_cohort if s["monthly_rating_change"] < 0)
    inactive = sum(1 for s in active_cohort if s["monthly_contests"] == 0)

    # Section statistics
    sections = {}
    for s in active_cohort:
        sec = s["section"] or "Unknown"
        if sec not in sections:
            sections[sec] = {"total_change": 0.0, "solved": 0, "count": 0}
        sections[sec]["total_change"] += s["monthly_rating_change"]
        sections[sec]["solved"] += s["monthly_solved_change"]
        sections[sec]["count"] += 1

    best_sec = "N/A"
    best_sec_val = -9999.0
    for sec, data in sections.items():
        avg_gain_sec = data["total_change"] / data["count"] if data["count"] > 0 else 0.0
        if avg_gain_sec > best_sec_val:
            best_sec_val = avg_gain_sec
            best_sec = sec

    # Average monthly growth percentage
    base_rating = sum(s["current_rating"] - s["monthly_rating_change"] for s in active_cohort)
    growth_pct = (sum(s["monthly_rating_change"] for s in active_cohort) / base_rating * 100) if base_rating > 0 else 0.0

    summary = {
        "average_rating_increase": avg_gain,
        "total_contests": sum(s["monthly_contests"] for s in active_cohort),
        "highest_participation": participation_rate,
        "best_section": f"Section {best_sec}" if best_sec != "N/A" else "None",
        "consistency_score": max(0, min(100, int(100 - (inactive / len(active_cohort) * 100)))) if active_cohort else 0
    }

    return {
        "active_students": monthly_active,
        "problems_solved": monthly_solved,
        "average_rating_gain": avg_gain,
        "participation_rate": participation_rate,
        "growth_percentage": growth_pct,
        "top_performers": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "rating_gain": s["monthly_rating_change"],
                "problems_solved": s["monthly_solved_change"],
                "contests": s["monthly_contests"]
            }
            for s in monthly_leaderboard[:15]
        ],
        "underperformers": [
            {
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "rating_loss": s["monthly_rating_change"],
                "contest_activity": s["monthly_contests"]
            }
            for s in monthly_underperformers[:15]
        ],
        "students_improved": improved,
        "students_declined": declined,
        "students_inactive": inactive,
        "summary": summary
    }

def get_watchlist_analytics_service(db):
    now = get_tz_aware_now()
    student_stats = get_student_window_stats(db, now)
    
    watchlist_students = []
    
    critical_count = 0
    at_risk_count = 0
    warning_count = 0
    good_count = 0

    for s in student_stats:
        if not s["has_snapshots"]:
            continue

        reasons = []
        status = "Good"

        # Check conditions
        # 1. Critical conditions
        # Inactive for 30+ days
        if not s["active_last_30d"]:
            status = "Critical"
            reasons.append("Inactive for over 30 days (no update)")
        # Rating drop of > 80 pts this month
        elif s["monthly_rating_change"] <= -80:
            status = "Critical"
            reasons.append(f"Rating dropped {int(abs(s['monthly_rating_change']))} points this month")

        # 2. At Risk conditions
        if status != "Critical":
            if s["monthly_rating_change"] <= -40:
                status = "At Risk"
                reasons.append(f"Rating dropped {int(abs(s['monthly_rating_change']))} points this month")
            if s["monthly_solved_change"] <= 0 and s["monthly_contests"] > 0:
                status = "At Risk"
                reasons.append("Zero problem solving growth this month")

        # 3. Warning conditions
        if status not in ["Critical", "At Risk"]:
            if s["weekly_rating_change"] <= -20:
                status = "Warning"
                reasons.append(f"Rating dropped {int(abs(s['weekly_rating_change']))} points this week")
            if s["monthly_contests"] == 0:
                status = "Warning"
                reasons.append("Zero contest participation this month")
            if s["weekly_contests"] == 0:
                # Add to warning list with reason
                if status == "Good":
                    status = "Warning"
                reasons.append("Missed contest this week")

        if status == "Critical":
            critical_count += 1
        elif status == "At Risk":
            at_risk_count += 1
        elif status == "Warning":
            warning_count += 1
        else:
            good_count += 1

        if status != "Good":
            watchlist_students.append({
                "name": s["name"],
                "roll_no": s["roll_no"],
                "username": s["leetcode_username"],
                "current_rating": s["current_rating"],
                "rating_change_30d": s["monthly_rating_change"],
                "problems_solved": s["monthly_solved_change"],
                "contest_attendance": f"{s['monthly_contests']} contests",
                "status": status,
                "reason": ", ".join(reasons)
            })

    # Sort watchlist by severity (Critical -> At Risk -> Warning)
    severity_order = {"Critical": 0, "At Risk": 1, "Warning": 2}
    watchlist_students.sort(key=lambda x: severity_order.get(x["status"], 3))

    return {
        "critical_count": critical_count,
        "at_risk_count": at_risk_count,
        "warning_count": warning_count,
        "good_count": good_count,
        "students": watchlist_students
    }

def get_department_intelligence_service(db):
    now = get_tz_aware_now()
    student_stats = get_student_window_stats(db, now)
    total_students = len(student_stats)

    active_cohort = [s for s in student_stats if s["has_snapshots"]]
    active_students = len(active_cohort)

    # 1. Math health score
    health_score, health_status = compute_department_health(student_stats, total_students)

    # Group comparison by Section
    sections = {}
    for s in active_cohort:
        sec = s["section"] or "Unknown"
        if sec not in sections:
            sections[sec] = {
                "total_rating": 0.0,
                "active_count": 0,
                "total_monthly_solved": 0,
                "total_monthly_contests": 0
            }
        sections[sec]["total_rating"] += s["current_rating"]
        sections[sec]["active_count"] += 1
        sections[sec]["total_monthly_solved"] += s["monthly_solved_change"]
        sections[sec]["total_monthly_contests"] += s["monthly_contests"]

    section_comparison = []
    best_sec_name = "None"
    best_sec_rating = 0.0
    worst_sec_name = "None"
    worst_sec_rating = 9999.0

    for name, data in sections.items():
        avg_rating = data["total_rating"] / data["active_count"] if data["active_count"] > 0 else 1500.0
        part_rate = (data["active_count"] / total_students * 100) if total_students > 0 else 0.0
        
        section_comparison.append({
            "section_name": f"Section {name}",
            "average_rating": avg_rating,
            "participation_rate": part_rate,
            "problems_solved": data["total_monthly_solved"],
            "active_students": data["active_count"]
        })

        if avg_rating > best_sec_rating:
            best_sec_rating = avg_rating
            best_sec_name = f"Section {name}"
        if avg_rating < worst_sec_rating:
            worst_sec_rating = avg_rating
            worst_sec_name = f"Section {name}"

    # Sort section comparisons alphabetically
    section_comparison.sort(key=lambda x: x["section_name"])

    # Faculty Insights observations list
    insights = []
    
    # Highest average section
    if best_sec_name != "None":
        insights.append({
            "type": "success",
            "text": f"{best_sec_name} currently holds the highest average rating at {int(best_sec_rating)} points."
        })

    # Participation observations
    inactive_30d = sum(1 for s in student_stats if not s["active_last_30d"])
    if inactive_30d > 0:
        insights.append({
            "type": "warning",
            "text": f"{inactive_30d} students remain inactive without contest participation for 30+ days."
        })

    # Sub-1400 rating threshold
    below_1400 = sum(1 for s in active_cohort if s["current_rating"] < 1400)
    if below_1400 > 0:
        insights.append({
            "type": "info",
            "text": f"{below_1400} students remain below the target 1400 rating placement eligibility band."
        })

    # Top performer improvement
    highest_monthly_improver = max(
        active_cohort,
        key=lambda s: s["monthly_rating_change"]
    ) if active_cohort else None
    
    if highest_monthly_improver and highest_monthly_improver["monthly_rating_change"] > 0:
        insights.append({
            "type": "success",
            "text": f"Top performer {highest_monthly_improver['name']} improved by {int(highest_monthly_improver['monthly_rating_change'])} points this month."
        })

    # Growth & Trends
    total_rating_now = sum(s["current_rating"] for s in active_cohort)
    total_weekly_gains = sum(s["weekly_rating_change"] for s in active_cohort)
    total_monthly_gains = sum(s["monthly_rating_change"] for s in active_cohort)

    base_weekly = total_rating_now - total_weekly_gains
    weekly_growth_pct = (total_weekly_gains / base_weekly * 100) if base_weekly > 0 else 0.0

    base_monthly = total_rating_now - total_monthly_gains
    monthly_growth_pct = (total_monthly_gains / base_monthly * 100) if base_monthly > 0 else 0.0

    avg_problems_growth = sum(s["monthly_solved_change"] for s in active_cohort) / active_students if active_students else 0.0

    return {
        "section_comparison": section_comparison,
        "faculty_insights": insights,
        "department_health_score": health_score,
        "weekly_growth_pct": weekly_growth_pct,
        "monthly_growth_pct": monthly_growth_pct,
        "average_problems_growth": avg_problems_growth,
        "participation_pct": (active_students / total_students * 100) if total_students else 0.0,
        "contest_attendance_pct": (sum(s["weekly_contests"] for s in active_cohort) / active_students * 100) if active_students else 0.0
    }
