import { useEffect, useState } from "react";
import { Search, Filter, RefreshCw, X, AlertTriangle, CheckCircle2, UserX } from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import ContestResultsTable from "../components/ContestResultsTable";
import type { ExtendedContestResult } from "../components/ContestResultsTable";
import {
  fetchAndAggregateAllData,
  getContests,
  getContestResults,
  getStudentsWithStats,
} from "../services/dataService";
import type { Contest, StudentWithStats } from "../services/dataService";

function ContestPage() {
  const [contests, setContests] = useState<Contest[]>([]);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [contestType, setContestType] = useState<"weekly" | "biweekly">("weekly");
  const [selectedContestId, setSelectedContestId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Filter/Sort States
  const [searchQuery, setSearchQuery] = useState("");
  const [yearFilter, setYearFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("rank"); // 'rank', 'solved', 'change'

  const loadData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      await fetchAndAggregateAllData(force);
      const allContests = getContests();
      const allStudents = getStudentsWithStats();

      setContests(allContests);
      setStudents(allStudents);

      // Auto-select the latest contest of the selected type if nothing is selected yet
      const typeContests = allContests.filter(
        (c) => c.contest_type.toLowerCase() === contestType
      );
      if (typeContests.length > 0) {
        setSelectedContestId(typeContests[0].id);
      } else {
        setSelectedContestId(null);
      }
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch contest information. Verify that the backend server is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update contest selection when type changes
  useEffect(() => {
    if (contests.length === 0) return;
    const typeContests = contests.filter(
      (c) => c.contest_type.toLowerCase() === contestType
    );
    if (typeContests.length > 0) {
      setSelectedContestId(typeContests[0].id);
    } else {
      setSelectedContestId(null);
    }
  }, [contestType, contests]);

  const selectedContest = contests.find((c) => c.id === selectedContestId);

  // Compile contest results combining Present & Absent lists
  const getExtendedResults = (): ExtendedContestResult[] => {
    if (!selectedContestId) return [];

    const rawResults = getContestResults(selectedContestId);

    // 1. Map present students
    const presentResults: ExtendedContestResult[] = rawResults.map((r, idx) => {
      const studentInfo = students.find(
        (s) => s.roll_no === r.roll_no || s.leetcode_username.toLowerCase() === r.leetcode_username.toLowerCase()
      );
      return {
        ...r,
        rank: idx + 1, // local rank sorted by global rank
        global_rank: r.rank,
        status: "Attended" as const,
        batch: studentInfo?.batch || 0,
      };
    });

    // 2. Identify absent students (in students registry but not in contest results)
    const absentResults: ExtendedContestResult[] = students
      .filter((student) => {
        return !rawResults.some(
          (r) =>
            r.roll_no === student.roll_no ||
            r.leetcode_username.toLowerCase() === student.leetcode_username.toLowerCase()
        );
      })
      .map((student) => ({
        rank: null,
        global_rank: null,
        student_name: student.name,
        roll_no: student.roll_no,
        leetcode_username: student.leetcode_username,
        problems_solved: 0,
        total_problems: 4,
        finish_time_seconds: 0,
        rating_after: student.latest_rating,
        rating_change: 0,
        status: "Not Attended" as const,
        batch: student.batch,
      }));

    // Combine lists
    return [...presentResults, ...absentResults];
  };

  const allExtendedResults = getExtendedResults();

  // Filtered & Sorted results
  const filteredResults = allExtendedResults
    .filter((res) => {
      // Search matches name, roll number, or username
      const matchesSearch =
        res.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        res.leetcode_username.toLowerCase().includes(searchQuery.toLowerCase());

      // Year/batch match
      const matchesYear = yearFilter === "all" || res.batch.toString() === yearFilter;

      // Status match
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "present" && res.status === "Attended") ||
        (statusFilter === "absent" && res.status === "Not Attended");

      return matchesSearch && matchesYear && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "rank") {
        // Present ranks first, then absent
        if (a.rank === null && b.rank === null) return a.student_name.localeCompare(b.student_name);
        if (a.rank === null) return 1;
        if (b.rank === null) return -1;
        return a.rank - b.rank;
      }
      if (sortBy === "solved") {
        return b.problems_solved - a.problems_solved;
      }
      if (sortBy === "change") {
        return b.rating_change - a.rating_change;
      }
      return 0;
    });

  // Calculate Summary metrics
  const totalStudents = allExtendedResults.length;
  const attendedCount = allExtendedResults.filter((r) => r.status === "Attended").length;
  const absentCount = totalStudents - attendedCount;
  const averageRank =
    attendedCount > 0
      ? Math.round(
          allExtendedResults
            .filter((r) => r.status === "Attended" && r.global_rank)
            .reduce((sum, r) => sum + (r.global_rank || 0), 0) / attendedCount
        )
      : 0;

  // List of distinct years/batches for filtering
  const batches = Array.from(new Set(students.map((s) => s.batch.toString()))).sort();

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading contest logs...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Contest Dashboard</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Select and drill down into individual LeetCode Weekly or Biweekly Contest standings.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Contest Type Toggle */}
            <div className="flex p-0.5 bg-zinc-950 border border-zinc-900 rounded-lg">
              <button
                onClick={() => setContestType("weekly")}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  contestType === "weekly"
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/10 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Weekly
              </button>
              <button
                onClick={() => setContestType("biweekly")}
                className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                  contestType === "biweekly"
                    ? "bg-orange-500/10 text-orange-500 border border-orange-500/10 shadow-sm"
                    : "text-zinc-400 hover:text-zinc-300"
                }`}
              >
                Biweekly
              </button>
            </div>

            {/* Sync Button */}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs flex gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}


        {/* Contest Selector and Selector Info */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1 max-w-sm">
            <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-2">
              Select Contest
            </label>
            <select
              value={selectedContestId ?? ""}
              onChange={(e) => setSelectedContestId(Number(e.target.value) || null)}
              className="w-full bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm font-semibold p-2.5 rounded-lg focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="">-- No Contest Selected --</option>
              {contests
                .filter((c) => c.contest_type.toLowerCase() === contestType)
                .sort((a, b) => b.contest_number - a.contest_number)
                .slice(0, 15)
                .map((contest) => (
                  <option key={contest.id} value={contest.id}>
                    {contest.contest_name}
                  </option>
                ))}
            </select>
          </div>

          {selectedContest && (
            <div className="text-right text-xs text-zinc-500 flex flex-col justify-end">
              <span className="font-semibold text-zinc-400 text-sm">
                {selectedContest.contest_name}
              </span>
              <span className="mt-1">
                Date: {new Date(selectedContest.contest_date).toLocaleDateString("en-US", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          )}
        </div>

        {selectedContestId ? (
          <>
            {/* Contest Summary Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Cohort</p>
                <h4 className="text-3xl font-bold text-white mt-1.5">{totalStudents}</h4>
                <p className="text-[10px] text-zinc-400 mt-1.5">Registered students</p>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-emerald-500">
                  Attended
                </p>
                <h4 className="text-3xl font-bold text-white mt-1.5 flex items-baseline gap-2">
                  <span>{attendedCount}</span>
                  <span className="text-xs font-medium text-emerald-500">
                    ({totalStudents > 0 ? Math.round((attendedCount / totalStudents) * 100) : 0}%)
                  </span>
                </h4>
                <p className="text-[10px] text-emerald-500/80 flex items-center gap-1 mt-1.5 font-medium">
                  <CheckCircle2 size={11} /> Participated in contest
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider text-rose-400">
                  Absent
                </p>
                <h4 className="text-3xl font-bold text-white mt-1.5 flex items-baseline gap-2">
                  <span>{absentCount}</span>
                  <span className="text-xs font-medium text-rose-400">
                    ({totalStudents > 0 ? Math.round((absentCount / totalStudents) * 100) : 0}%)
                  </span>
                </h4>
                <p className="text-[10px] text-rose-400/80 flex items-center gap-1 mt-1.5 font-medium">
                  <UserX size={11} /> Missed this schedule
                </p>
              </div>

              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
                <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Average Rank</p>
                <h4 className="text-3xl font-bold text-white mt-1.5">
                  {attendedCount > 0 ? averageRank.toLocaleString() : "--"}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1.5">Global rank average</p>
              </div>
            </div>

            {/* Filter and Table Section */}
            <div className="flex flex-col gap-4">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Search Bar */}
                <div className="relative flex-1 max-w-sm">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                    <Search size={14} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search name, roll no, username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-900 rounded-lg pl-10 pr-4 py-2.5 text-zinc-200 placeholder-zinc-500 text-sm focus:outline-none focus:border-zinc-800 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-zinc-500 hover:text-zinc-300"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>

                {/* Filters Row */}
                <div className="flex flex-wrap items-center gap-3">
                  {/* Filter Year */}
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg">
                    <span className="text-zinc-500">
                      <Filter size={12} />
                    </span>
                    <select
                      value={yearFilter}
                      onChange={(e) => setYearFilter(e.target.value)}
                      className="bg-transparent text-zinc-400 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Batches</option>
                      {batches.map((b) => (
                        <option key={b} value={b}>
                          Batch {b}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filter Status */}
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="bg-transparent text-zinc-400 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="all">All Statuses</option>
                      <option value="present">Present Only</option>
                      <option value="absent">Absent Only</option>
                    </select>
                  </div>

                  {/* Sort By */}
                  <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg">
                    <span className="text-xs text-zinc-500 font-semibold">Sort:</span>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="bg-transparent text-zinc-400 text-xs font-medium focus:outline-none cursor-pointer"
                    >
                      <option value="rank">Dept Rank</option>
                      <option value="solved">Solved Count</option>
                      <option value="change">Rating Change</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Table */}
              <ContestResultsTable results={filteredResults} />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 bg-zinc-950 border border-zinc-900 rounded-xl text-center gap-3">
            <AlertTriangle size={32} className="text-amber-500/80" />
            <h4 className="text-base font-semibold text-white">No Contests Logged</h4>
            <p className="text-xs text-zinc-500 max-w-sm">
              Please sync the database snapshot using the Sync Center or register students to begin analytics tracking.
            </p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}

export default ContestPage;