import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  Filter,
  Trophy,
  ArrowUpDown,
  RefreshCw,
  X,
  Sparkles,
  AlertTriangle,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  fetchAndAggregateAllData,
  getStudentsWithStats,
  getContests,
  deleteStudent,
} from "../services/dataService";
import type { StudentWithStats } from "../services/dataService";

function RankingsPage() {
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [totalContestsCount, setTotalContestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Delete Student Modal & Toast State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<StudentWithStats | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    setDeleting(true);
    try {
      await deleteStudent(studentToDelete.id);
      setShowDeleteModal(false);
      setToast({ type: "success", message: "Student deleted successfully" });
      setTimeout(() => setToast(null), 3000);
      await loadData(true);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to delete student. Please try again." });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setDeleting(false);
      setStudentToDelete(null);
    }
  };


  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [batchFilter, setBatchFilter] = useState("all");
  const [sectionFilter, setSectionFilter] = useState("all");
  const [ratingRangeFilter, setRatingRangeFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "solved" | "participation">("rating");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const loadData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      await fetchAndAggregateAllData(force);
      setStudents(getStudentsWithStats());
      setTotalContestsCount(getContests().length);
      setError(null);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch department standings. Verify that the backend is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSort = (field: "rating" | "solved" | "participation") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  // Extract distinct sections and batches for filters
  const sections = Array.from(new Set(students.map((s) => s.section).filter(Boolean))).sort();
  const batches = Array.from(new Set(students.map((s) => s.batch.toString()))).sort();

  // Apply filters
  const filteredStudents = students
    .filter((s) => {
      const matchesSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roll_no.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.leetcode_username.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesBatch = batchFilter === "all" || s.batch.toString() === batchFilter;
      const matchesSection = sectionFilter === "all" || s.section === sectionFilter;

      let matchesRating = true;
      if (ratingRangeFilter === "1800") matchesRating = s.latest_rating >= 1800;
      else if (ratingRangeFilter === "1600")
        matchesRating = s.latest_rating >= 1600 && s.latest_rating < 1800;
      else if (ratingRangeFilter === "1400")
        matchesRating = s.latest_rating >= 1400 && s.latest_rating < 1600;
      else if (ratingRangeFilter === "under1400") matchesRating = s.latest_rating < 1400;

      return matchesSearch && matchesBatch && matchesSection && matchesRating;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === "rating") {
        comparison = a.latest_rating - b.latest_rating;
      } else if (sortBy === "solved") {
        comparison = a.total_solved - b.total_solved;
      } else if (sortBy === "participation") {
        comparison = a.contests_attended - b.contests_attended;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

  const getRankBadge = (idx: number) => {
    if (idx === 0) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Trophy size={11} /> 1st
        </span>
      );
    }
    if (idx === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-zinc-300/10 text-zinc-300 border border-zinc-400/20">
          <Trophy size={11} /> 2nd
        </span>
      );
    }
    if (idx === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-700/10 text-amber-600 border border-amber-700/20">
          <Trophy size={11} /> 3rd
        </span>
      );
    }
    return <span className="text-zinc-400 font-medium">#{idx + 1}</span>;
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading department standings...</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">Department Standings</h1>
            <p className="text-sm text-zinc-400 mt-1">
              Department leaderboard ranked dynamically by LeetCode contest ratings.
            </p>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            <span>Sync Standings</span>
          </button>
        </div>

        {/* Error banner */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/25 text-red-400 p-4 rounded-xl text-xs flex gap-2">
            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}


        {/* Toolbar & Filters */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-sm">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-zinc-500 pointer-events-none">
                <Search size={14} />
              </span>
              <input
                type="text"
                placeholder="Search student, roll no, leetcode user..."
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

            {/* Filter Group */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Batch Filter */}
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg">
                <span className="text-zinc-500">
                  <Filter size={12} />
                </span>
                <select
                  value={batchFilter}
                  onChange={(e) => setBatchFilter(e.target.value)}
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

              {/* Section Filter */}
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg">
                <select
                  value={sectionFilter}
                  onChange={(e) => setSectionFilter(e.target.value)}
                  className="bg-transparent text-zinc-400 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Sections</option>
                  {sections.map((sec) => (
                    <option key={sec} value={sec}>
                      Section {sec}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Range Filter */}
              <div className="flex items-center gap-2 bg-zinc-950 border border-zinc-900 px-3 py-1.5 rounded-lg">
                <select
                  value={ratingRangeFilter}
                  onChange={(e) => setRatingRangeFilter(e.target.value)}
                  className="bg-transparent text-zinc-400 text-xs font-medium focus:outline-none cursor-pointer"
                >
                  <option value="all">All Ratings</option>
                  <option value="1800">Rated ≥ 1800</option>
                  <option value="1600">Rated 1600 - 1799</option>
                  <option value="1400">Rated 1400 - 1599</option>
                  <option value="under1400">Rated &lt; 1400</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Global Leaderboard Table */}
        <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-900 bg-zinc-900/20 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="p-4 w-28 text-center">Rank</th>
                  <th className="p-4">Student</th>
                  <th className="p-4">Roll No</th>
                  <th className="p-4">Batch</th>
                  <th className="p-4">Section</th>
                  <th
                    onClick={() => handleSort("rating")}
                    className="p-4 cursor-pointer hover:bg-zinc-900/40 w-36 select-none"
                  >
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>Rating</span>
                      <ArrowUpDown size={12} className="text-zinc-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("solved")}
                    className="p-4 cursor-pointer hover:bg-zinc-900/40 w-36 select-none text-center"
                  >
                    <div className="flex items-center gap-1.5 justify-center">
                      <span>Total Solved</span>
                      <ArrowUpDown size={12} className="text-zinc-500" />
                    </div>
                  </th>
                  <th
                    onClick={() => handleSort("participation")}
                    className="p-4 cursor-pointer hover:bg-zinc-900/40 w-44 select-none"
                  >
                    <div className="flex items-center gap-1.5 justify-end">
                      <span>Participation Rate</span>
                      <ArrowUpDown size={12} className="text-zinc-500" />
                    </div>
                  </th>
                  <th className="p-4 w-24 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-900/50 text-sm text-zinc-200">
                {filteredStudents.map((student, idx) => {
                  const hasAttended = student.is_active;
                  const rate =
                    totalContestsCount > 0
                      ? Math.round((student.contests_attended / totalContestsCount) * 100)
                      : 0;

                  return (
                    <tr
                      key={student.id}
                      className="transition-colors hover:bg-zinc-900/15"
                    >
                      {/* Rank Column */}
                      <td className="p-4 text-center font-semibold">
                        {getRankBadge(idx)}
                      </td>

                      {/* Student Name */}
                      <td className="p-4">
                        <div>
                          <Link
                            to={`/students/${student.leetcode_username}`}
                            className="font-semibold text-zinc-100 hover:text-orange-500 transition-colors flex items-center gap-1.5"
                          >
                            <span>{student.name}</span>
                            {student.latest_rating >= 1800 && (
                              <Sparkles size={12} className="text-amber-400" />
                            )}
                          </Link>
                          <span className="text-xs text-zinc-500 font-mono">
                            @{student.leetcode_username}
                          </span>
                        </div>
                      </td>

                      {/* Roll No */}
                      <td className="p-4 font-mono text-xs">{student.roll_no}</td>

                      {/* Batch */}
                      <td className="p-4 text-xs text-zinc-400">{student.batch}</td>

                      {/* Section */}
                      <td className="p-4 text-xs text-zinc-400">
                        {student.section || "--"}
                      </td>

                      {/* Latest Rating */}
                      <td className="p-4 text-right font-bold text-orange-400">
                        {hasAttended ? student.latest_rating : "1500 (Unrated)"}
                      </td>

                      {/* Total Solved */}
                      <td className="p-4 text-center font-semibold text-zinc-300">
                        {student.total_solved}
                      </td>

                      {/* Contest Participation */}
                      <td className="p-4 text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-semibold text-zinc-100">{rate}%</span>
                          <span className="text-[10px] text-zinc-500 mt-0.5">
                            {student.contests_attended} / {totalContestsCount} Contests
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setStudentToDelete(student);
                            setShowDeleteModal(true);
                          }}
                          className="p-2 text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer group"
                          title="Delete Student"
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {filteredStudents.length === 0 && (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-zinc-500 text-sm">
                      No student records match the active search and filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-scale-in">
            <div>
              <h3 className="text-2xl font-bold text-white">Delete Student</h3>
              <p className="text-sm text-zinc-400 mt-1">Please confirm student identity details below</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Name</span>
                <span className="font-semibold text-white">{studentToDelete.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Roll Number</span>
                <span className="font-mono text-white">{studentToDelete.roll_no}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">LeetCode Username</span>
                <span className="font-mono text-orange-450">@{studentToDelete.leetcode_username}</span>
              </div>
            </div>

            <div className="border-l-4 border-red-500 bg-red-500/5 p-4 rounded-r-lg">
              <h4 className="text-sm font-bold text-red-400 flex items-center gap-1.5 uppercase tracking-wide">
                ⚠️ WARNING
              </h4>
              <div className="text-xs text-zinc-300 mt-2 flex flex-col gap-1.5">
                <p>This action will permanently remove:</p>
                <ul className="list-disc pl-5 flex flex-col gap-0.5">
                  <li>Student Record</li>
                  <li>Contest Results</li>
                  <li>Profile Snapshots</li>
                  <li>Analytics History</li>
                </ul>
                <p className="mt-1 font-semibold text-zinc-200">This action cannot be undone. Please confirm before continuing.</p>
              </div>
            </div>

            <div className="flex gap-4 justify-end mt-2">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setStudentToDelete(null);
                }}
                disabled={deleting}
                className="px-4 py-2 border border-zinc-800 hover:bg-zinc-900 text-zinc-300 font-semibold rounded-lg text-sm transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 active:scale-95 text-white font-semibold rounded-lg text-sm transition-all cursor-pointer disabled:opacity-50 flex items-center gap-2"
              >
                {deleting ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete Student</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Success/Error Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all transform duration-300 animate-slide-in ${
          toast.type === "success"
            ? "bg-zinc-950/95 border-emerald-500/30 text-emerald-400"
            : "bg-zinc-950/95 border-red-500/30 text-red-400"
        }`}>
          {toast.type === "success" ? <CheckCircle size={16} /> : <XCircle size={16} />}
          <span className="text-sm font-semibold text-zinc-100">{toast.message}</span>
        </div>
      )}
    </DashboardLayout>
  );
}

export default RankingsPage;
