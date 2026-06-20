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

// In-memory data store cache
let cache: {
  students: Student[];
  contests: Contest[];
  contestResults: Record<number, ContestResult[]>;
  studentsWithStats: StudentWithStats[];
  departmentStats: DepartmentStats | null;
  lastFetched: number | null;
} = {
  students: [],
  contests: [],
  contestResults: {},
  studentsWithStats: [],
  departmentStats: null,
  lastFetched: null,
};

const CACHE_TTL_MS = 60 * 1000; // 1 minute Cache Time-To-Live

/**
 * Checks if the cache is active and not expired
 */
export function isCacheValid(): boolean {
  if (!cache.lastFetched || cache.students.length === 0) return false;
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
    lastFetched: null,
  };
}

/**
 * Fetches all necessary backend data and runs the aggregation engine.
 * Calls /students, /contests, and /contests/{id}/results for all contests.
 */
export async function fetchAndAggregateAllData(force = false): Promise<void> {
  if (!force && isCacheValid()) {
    return;
  }

  // 1. Fetch Students, Contests & Latest Snapshots
  const [studentsRes, contestsRes, snapshotsRes] = await Promise.all([
    api.get<Student[]>("/students"),
    api.get<Contest[]>("/contests"),
    api.get<any[]>("/students/snapshots/latest"),
  ]);

  const students = studentsRes.data;
  const snapshots = snapshotsRes.data;
  const snapshotMap = new Map<string, any>();
  snapshots.forEach((snap) => {
    snapshotMap.set(snap.leetcode_username.toLowerCase(), snap);
  });

  // Sort contests chronologically ascending for trend lines, but keep descending copy for selectors
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

  // 3. Process each student's contest history
  const studentsWithStats: StudentWithStats[] = students.map((student) => {
    // Collect all results for this student across all contests
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

    // Compute student level statistics
    const is_active = history.length > 0;
    const latest_rating = is_active ? history[history.length - 1].rating_after : 1500; // default LeetCode rating
    const best_rank = is_active ? Math.min(...history.map((h) => h.rank)) : null;
    const contests_attended = history.length;

    // Use total_solved from the latest profile snapshot
    const snapshot = snapshotMap.get(student.leetcode_username.toLowerCase());
    const total_solved = snapshot ? snapshot.total_solved : 0;

    const average_rank = is_active
      ? Math.round(history.reduce((sum, h) => sum + h.rank, 0) / history.length)
      : 0;

    // Rating change: latest contest rating minus 1500, or final minus initial rating change sum
    const rating_change = is_active
      ? history.reduce((sum, h) => sum + h.rating_change, 0)
      : 0;

    return {
      ...student,
      latest_rating,
      best_rank,
      contests_attended,
      total_solved,
      average_rank,
      rating_change,
      is_active,
      history,
    };
  });

  // 4. Compute Department Overview Statistics
  const activeStudentsList = studentsWithStats.filter((s) => s.is_active);
  const activeCount = activeStudentsList.length;
  const totalStudentsCount = students.length;
  const activePercentage = totalStudentsCount > 0 ? Math.round((activeCount / totalStudentsCount) * 100) : 0;
  const averageRating =
    activeCount > 0
      ? Math.round(activeStudentsList.reduce((sum, s) => sum + s.latest_rating, 0) / activeCount)
      : 1500;

  // Top Rated: Active students sorted by latest rating descending
  const top_rated = [...activeStudentsList].sort((a, b) => b.latest_rating - a.latest_rating);

  // Most Improved: Active students sorted by total positive rating change descending
  const most_improved = [...activeStudentsList]
    .filter((s) => s.rating_change > 0)
    .sort((a, b) => b.rating_change - a.rating_change);

  // High Performers: Active students with latest rating >= 1600
  const high_performers = [...activeStudentsList]
    .filter((s) => s.latest_rating >= 1600)
    .sort((a, b) => b.latest_rating - a.latest_rating);

  // Rating Distribution Bins
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

  // Trends per contest (ascending date order)
  const participation_trend = contests.map((contest) => {
    const results = contestResults[contest.id] || [];
    const attendedCount = results.length;
    // Rate relative to active students count (or total students, let's use total active students count)
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

  // 5. Update Cache
  cache.students = students;
  // Keep contests ordered descending (newest first) for selection dropdowns
  cache.contests = [...contests].sort((a, b) => b.contest_number - a.contest_number);
  cache.contestResults = contestResults;
  cache.studentsWithStats = studentsWithStats;
  cache.departmentStats = departmentStats;
  cache.lastFetched = Date.now();
}

/**
 * Gets cached list of all students with statistics.
 */
export function getStudentsWithStats(): StudentWithStats[] {
  return cache.studentsWithStats;
}

/**
 * Gets cached list of all raw contests.
 */
export function getContests(): Contest[] {
  return cache.contests;
}

/**
 * Gets cached contest results for a specific contest ID.
 */
export function getContestResults(contestId: number): ContestResult[] {
  return cache.contestResults[contestId] || [];
}

/**
 * Gets the aggregated department analytics.
 */
export function getDepartmentStats(): DepartmentStats {
  if (!cache.departmentStats) {
    throw new Error("Data not aggregated. Call fetchAndAggregateAllData() first.");
  }
  return cache.departmentStats;
}

/**
 * Gets a complete profile record for a student by their username.
 */
export function getStudentProfile(username: string): StudentWithStats | undefined {
  const normalized = username.toLowerCase();
  return cache.studentsWithStats.find((s) => s.leetcode_username.toLowerCase() === normalized);
}

/**
 * API wrapper to sync a single student snapshot.
 */
export async function syncStudentProfile(username: string): Promise<any> {
  const response = await api.post(`/students/sync/${username}`);
  return response.data;
}

/**
 * API wrapper to sync all students snapshots.
 */
export async function syncAllStudents(): Promise<any> {
  const response = await api.post("/sync-all");
  return response.data;
}

/**
 * API wrapper to create a new student.
 */
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

/**
 * API wrapper to delete a student.
 */
export async function deleteStudent(studentId: number): Promise<any> {
  const response = await api.delete(`/students/${studentId}`);
  return response.data;
}

