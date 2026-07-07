import api from "./api";

// Base API types matching backend returns
export interface Student {
  id: number;
  roll_no: string;
  name: string;
  batch: number;
  section: string;
  leetcode_username: string;
  created_at: string;
  updated_at: string | null;
}

export interface Contest {
  id: number;
  contest_name: string;
  contest_type: string;
  contest_number: number;
  contest_date: string;
}

export interface ContestResult {
  rank: number;
  student_name: string;
  roll_no: string;
  leetcode_username: string;
  problems_solved: number;
  total_problems: number;
  finish_time_seconds: number;
  rating_after: number;
  rating_change: number;
}

// Custom frontend aggregated types
export interface StudentContestHistory extends ContestResult {
  contest_id: number;
  contest_name: string;
  contest_date: string;
  contest_number: number;
  contest_type: string;
}

export interface StudentWithStats extends Student {
  latest_rating: number;
  best_rank: number | null;
  contests_attended: number;
  total_solved: number;
  easy_solved: number;
  medium_solved: number;
  hard_solved: number;
  average_rank: number;
  rating_change: number;
  is_active: boolean;
  history: StudentContestHistory[];
}

export interface DepartmentStats {
  total_students: number;
  active_students: number;
  active_percentage: number;
  average_rating: number;
  contests_tracked: number;
  rating_distribution: { bin: string; count: number }[];
  participation_trend: { contest_name: string; contest_number: number; rate: number }[];
  growth_trend: { contest_name: string; contest_number: number; average_rating: number }[];
  top_rated: StudentWithStats[];
  most_improved: StudentWithStats[];
  high_performers: StudentWithStats[];
}

// ==========================================
// NEW HOD PERFORMANCE INTELLIGENCE TYPES
// ==========================================

export interface TopWeeklyPerformer {
  name: string;
  roll_no: string;
  username: string;
  rating_gain: number;
  problems_solved: number;
  contests: number;
}

export interface WeeklyUnderperformer {
  name: string;
  roll_no: string;
  username: string;
  rating_loss: number;
  contest_activity: number;
}

export interface TopWeeklyProblemPerformer {
  name: string;
  username: string;
  solved_change: number;
}

export interface TopWeeklyParticipationPerformer {
  name: string;
  username: string;
  contests: number;
}

export interface DashboardOverview {
  total_students: number;
  active_students: number;
  average_rating: number;
  average_solved: number;
  average_participation?: number;
  students_above_1600: number;
  students_below_1400: number;

  health_score: number;
  health_status: "Excellent" | "Good" | "Average" | "Needs Attention" | "Needs Data";

  weekly_top_rating: {
    name: string;
    roll_no: string;
    username: string;
    weekly_rating_change: number;
    weekly_solved_change: number;
  }[];

  weekly_top_solved: {
    name: string;
    roll_no: string;
    username: string;
    weekly_rating_change: number;
    weekly_solved_change: number;
  }[];

  monthly_top_rating: {
    name: string;
    roll_no: string;
    username: string;
    monthly_rating_change: number;
    monthly_solved_change: number;
  }[];

  monthly_top_solved: {
    name: string;
    roll_no: string;
    username: string;
    monthly_rating_change: number;
    monthly_solved_change: number;
  }[];

  rating_distribution: { bin: string; count: number }[];
}

export interface WeeklyAnalytics {
  active_students: number;
  problems_solved: number;
  average_rating_gain: number;
  participation_rate: number;

  top_performers: TopWeeklyPerformer[];
  underperformers: WeeklyUnderperformer[];
  weekly_problems_leaderboard: TopWeeklyProblemPerformer[];
  weekly_participation_leaderboard: TopWeeklyParticipationPerformer[];
  weekly_rating_distribution_change: { bin: string; change: number }[];
  students_improved: number;
  students_declined: number;
  students_inactive: number;

  insights: {
    highest_rating_gain: string;
    most_problems_solved: string;
    best_performing_section: string;
    inactive_students_count: number;
  };
}

export interface MonthlyAnalytics {
  active_students: number;
  problems_solved: number;
  average_rating_gain: number;
  participation_rate: number;
  growth_percentage: number;

  top_performers: {
    name: string;
    roll_no: string;
    username: string;
    rating_gain: number;
    problems_solved: number;
    contests: number;
  }[];

  underperformers: {
    name: string;
    roll_no: string;
    username: string;
    rating_loss: number;
    contest_activity: number;
  }[];

  students_improved: number;
  students_declined: number;
  students_inactive: number;

  summary: {
    average_rating_increase: number;
    total_contests: number;
    highest_participation: number;
    best_section: string;
    consistency_score: number;
  };
}

export interface WatchlistStudent {
  name: string;
  roll_no: string;
  username: string;
  current_rating: number;
  rating_change_30d: number;
  problems_solved: number;
  contest_attendance: string;
  status: "Critical" | "At Risk" | "Warning" | "Good";
  reason: string;
}

export interface WatchlistData {
  students: WatchlistStudent[];
  critical_count: number;
  at_risk_count: number;
  warning_count: number;
  good_count: number;
}

export interface SectionComparison {
  section_name: string;
  average_rating: number;
  participation_rate: number;
  problems_solved: number;
  active_students: number;
}

export interface DepartmentIntelligence {
  section_comparison: SectionComparison[];
  faculty_insights: { text: string; type: "info" | "success" | "warning" }[];
  department_health_score: number;
  weekly_growth_pct: number;
  monthly_growth_pct: number;
  average_problems_growth: number;
  participation_pct: number;
  contest_attendance_pct: number;
}

// In-memory data store cache
let cache: {
  students: Student[];
  contests: Contest[];
  contestResults: Record<number, ContestResult[]>;
  studentsWithStats: StudentWithStats[];
  departmentStats: DepartmentStats | null;

  // New analytics caches
  overview: DashboardOverview | null;
  weekly: WeeklyAnalytics | null;
  monthly: MonthlyAnalytics | null;
  watchlist: WatchlistData | null;
  intelligence: DepartmentIntelligence | null;

  lastFetched: number | null;
} = {
  students: [],
  contests: [],
  contestResults: {},
  studentsWithStats: [],
  departmentStats: null,

  overview: null,
  weekly: null,
  monthly: null,
  watchlist: null,
  intelligence: null,

  lastFetched: null,
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute Cache Time-To-Live

/**
 * Checks if the cache is active and not expired
 */
export function isCacheValid(): boolean {
  if (!cache.lastFetched || cache.students.length === 0 || !cache.overview) return false;
  return Date.now() - cache.lastFetched < CACHE_TTL_MS;
}

/**
 * Clears the in-memory cache to force a fresh reload
 */
export function clearCache() {
  cache = {
    students: [],
    contests: [],
    contestResults: {},
    studentsWithStats: [],
    departmentStats: null,
    overview: null,
    weekly: null,
    monthly: null,
    watchlist: null,
    intelligence: null,
    lastFetched: null,
  };
}

/**
 * Fetches all necessary backend data and runs the aggregation engine.
 */
export async function fetchAndAggregateAllData(force = false): Promise<void> {
  if (!force && isCacheValid()) {
    return;
  }

  // 1. Fetch data from backend
  const [
    studentsRes,
    contestsRes,
    snapshotsRes,
    overviewRes,
    weeklyRes,
    monthlyRes,
    watchlistRes,
    intelligenceRes
  ] = await Promise.all([
    api.get<Student[]>("/students"),
    api.get<Contest[]>("/contests"),
    api.get<any[]>("/students/snapshots/latest"),
    api.get<DashboardOverview>("/analytics/overview"),
    api.get<WeeklyAnalytics>("/analytics/weekly"),
    api.get<MonthlyAnalytics>("/analytics/monthly"),
    api.get<WatchlistData>("/analytics/watchlist"),
    api.get<DepartmentIntelligence>("/analytics/intelligence")
  ]);

  const students = studentsRes.data;
  const snapshots = snapshotsRes.data;
  const snapshotMap = new Map<string, any>();
  snapshots.forEach((snap) => {
    snapshotMap.set(snap.leetcode_username.toLowerCase(), snap);
  });

  const contests = contestsRes.data.sort((a, b) => a.contest_number - b.contest_number);

  // 2. Fetch Results for all Contests in parallel
  const resultsPromises = contests.map((contest) =>
    api.get<ContestResult[]>(`/contests/${contest.id}/results`).then((res) => ({
      contestId: contest.id,
      data: res.data,
    }))
  );

  const resultsResponses = await Promise.all(resultsPromises);
  const contestResults: Record<number, ContestResult[]> = {};
  resultsResponses.forEach((res) => {
    contestResults[res.contestId] = res.data;
  });

  // 3. Process each student's contest history (keeping profile page and list details working)
  const studentsWithStats: StudentWithStats[] = students.map((student) => {
    const history: StudentContestHistory[] = [];

    contests.forEach((contest) => {
      const results = contestResults[contest.id] || [];
      const match = results.find(
        (r) =>
          r.roll_no === student.roll_no ||
          r.leetcode_username.toLowerCase() === student.leetcode_username.toLowerCase()
      );

      if (match) {
        history.push({
          ...match,
          contest_id: contest.id,
          contest_name: contest.contest_name,
          contest_date: contest.contest_date,
          contest_number: contest.contest_number,
          contest_type: contest.contest_type,
        });
      }
    });

    const is_active = history.length > 0;
    const latest_rating = is_active ? history[history.length - 1].rating_after : 1500;
    const best_rank = is_active ? Math.min(...history.map((h) => h.rank)) : null;
    const contests_attended = history.length;

    const snapshot = snapshotMap.get(student.leetcode_username.toLowerCase());
    const total_solved = snapshot ? snapshot.total_solved : 0;
    const easy_solved = snapshot ? snapshot.easy_solved : 0;
    const medium_solved = snapshot ? snapshot.medium_solved : 0;
    const hard_solved = snapshot ? snapshot.hard_solved : 0;

    const average_rank = is_active
      ? Math.round(history.reduce((sum, h) => sum + h.rank, 0) / history.length)
      : 0;

    const rating_change = is_active
      ? history.reduce((sum, h) => sum + h.rating_change, 0)
      : 0;

    return {
      ...student,
      latest_rating,
      best_rank,
      contests_attended,
      total_solved,
      easy_solved,
      medium_solved,
      hard_solved,
      average_rank,
      rating_change,
      is_active,
      history,
    };
  });

  const activeStudentsList = studentsWithStats.filter((s) => s.is_active);
  const activeCount = activeStudentsList.length;
  const totalStudentsCount = students.length;
  const activePercentage = totalStudentsCount > 0 ? Math.round((activeCount / totalStudentsCount) * 100) : 0;
  const averageRating =
    activeCount > 0
      ? Math.round(activeStudentsList.reduce((sum, s) => sum + s.latest_rating, 0) / activeCount)
      : 1500;

  const top_rated = [...activeStudentsList].sort((a, b) => b.latest_rating - a.latest_rating);
  const most_improved = [...activeStudentsList]
    .filter((s) => s.rating_change > 0)
    .sort((a, b) => b.rating_change - a.rating_change);
  const high_performers = [...activeStudentsList]
    .filter((s) => s.latest_rating >= 1600)
    .sort((a, b) => b.latest_rating - a.latest_rating);

  const bins = [
    { bin: "< 1400", count: 0 },
    { bin: "1400-1499", count: 0 },
    { bin: "1500-1599", count: 0 },
    { bin: "1600-1699", count: 0 },
    { bin: "1700-1799", count: 0 },
    { bin: "1800+", count: 0 },
  ];

  activeStudentsList.forEach((student) => {
    const r = student.latest_rating;
    if (r < 1400) bins[0].count++;
    else if (r < 1500) bins[1].count++;
    else if (r < 1600) bins[2].count++;
    else if (r < 1700) bins[3].count++;
    else if (r < 1800) bins[4].count++;
    else bins[5].count++;
  });

  const participation_trend = contests.map((contest) => {
    const results = contestResults[contest.id] || [];
    const attendedCount = results.length;
    const rate = activeCount > 0 ? parseFloat(((attendedCount / activeCount) * 100).toFixed(1)) : 0;
    return {
      contest_name: contest.contest_name,
      contest_number: contest.contest_number,
      rate,
    };
  });

  const growth_trend = contests.map((contest) => {
    const results = contestResults[contest.id] || [];
    const avgRating =
      results.length > 0
        ? Math.round(results.reduce((sum, r) => sum + r.rating_after, 0) / results.length)
        : 1500;
    return {
      contest_name: contest.contest_name,
      contest_number: contest.contest_number,
      average_rating: avgRating,
    };
  });

  const departmentStats: DepartmentStats = {
    total_students: totalStudentsCount,
    active_students: activeCount,
    active_percentage: activePercentage,
    average_rating: averageRating,
    contests_tracked: contests.length,
    rating_distribution: bins,
    participation_trend,
    growth_trend,
    top_rated,
    most_improved,
    high_performers,
  };

  // 4. Update Cache
  cache.students = students;
  cache.contests = [...contests].sort((a, b) => b.contest_number - a.contest_number);
  cache.contestResults = contestResults;
  cache.studentsWithStats = studentsWithStats;
  cache.departmentStats = departmentStats;

  // Set analytics caches direct from backend
  cache.overview = overviewRes.data;
  cache.weekly = weeklyRes.data;
  cache.monthly = monthlyRes.data;
  cache.watchlist = watchlistRes.data;
  cache.intelligence = intelligenceRes.data;

  cache.lastFetched = Date.now();
}

export function getStudentsWithStats(): StudentWithStats[] {
  return cache.studentsWithStats;
}

export function getContests(): Contest[] {
  return cache.contests;
}

export function getContestResults(contestId: number): ContestResult[] {
  return cache.contestResults[contestId] || [];
}

export function getDepartmentStats(): DepartmentStats {
  if (!cache.departmentStats) {
    throw new Error("Data not aggregated. Call fetchAndAggregateAllData() first.");
  }
  return cache.departmentStats;
}

export function getStudentProfile(username: string): StudentWithStats | undefined {
  const normalized = username.toLowerCase();
  return cache.studentsWithStats.find((s) => s.leetcode_username.toLowerCase() === normalized);
}

export async function syncStudentProfile(username: string): Promise<any> {
  const response = await api.post(`/students/sync/${username}`);
  return response.data;
}

export async function syncAllStudents(): Promise<any> {
  const response = await api.post("/sync-all");
  return response.data;
}

export async function createStudent(studentData: {
  roll_no: string;
  name: string;
  batch: number;
  section: string;
  leetcode_username: string;
}): Promise<any> {
  const response = await api.post("/students", studentData);
  return response.data;
}

export async function deleteStudent(studentId: number): Promise<any> {
  const response = await api.delete(`/students/${studentId}`);
  return response.data;
}

// ==========================================
// NEW ANALYTICS GETTERS (FROM BACKEND CACHE)
// ==========================================

export function getDashboardOverview(): DashboardOverview {
  if (!cache.overview) {
    throw new Error("Overview data not aggregated. Call fetchAndAggregateAllData() first.");
  }
  return cache.overview;
}

export function getWeeklyAnalytics(): WeeklyAnalytics {
  if (!cache.weekly) {
    throw new Error("Weekly data not aggregated. Call fetchAndAggregateAllData() first.");
  }
  return cache.weekly;
}

export function getMonthlyAnalytics(): MonthlyAnalytics {
  if (!cache.monthly) {
    throw new Error("Monthly data not aggregated. Call fetchAndAggregateAllData() first.");
  }
  return cache.monthly;
}

export function getWatchlistData(): WatchlistData {
  if (!cache.watchlist) {
    throw new Error("Watchlist data not aggregated. Call fetchAndAggregateAllData() first.");
  }
  return cache.watchlist;
}

export function getDepartmentIntelligence(): DepartmentIntelligence {
  if (!cache.intelligence) {
    
    throw new Error("Intelligence data not aggregated. Call fetchAndAggregateAllData() first.");
  }
  return cache.intelligence;
}
