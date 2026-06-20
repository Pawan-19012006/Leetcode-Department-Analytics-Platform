import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  ExternalLink,
  TrendingUp,
  TrendingDown,
  Info,
  Clock,
  Trash2,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  fetchAndAggregateAllData,
  getStudentProfile,
  deleteStudent,
} from "../services/dataService";
import type { StudentWithStats } from "../services/dataService";


function StudentProfilePage() {
  const { username } = useParams<{ username: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<StudentWithStats | undefined>(undefined);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Delete Student Modal & Toast State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const handleConfirmDelete = async () => {
    if (!student) return;
    setDeleting(true);
    try {
      await deleteStudent(student.id);
      setShowDeleteModal(false);
      setToast({ type: "success", message: "Student deleted successfully" });
      await fetchAndAggregateAllData(true);
      setTimeout(() => {
        setToast(null);
        navigate("/rankings");
      }, 2000);
    } catch (err) {
      console.error(err);
      setToast({ type: "error", message: "Failed to delete student. Please try again." });
      setTimeout(() => setToast(null), 3000);
    } finally {
      setDeleting(false);
    }
  };

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        await fetchAndAggregateAllData();
        if (username) {
          const profile = getStudentProfile(username);
          setStudent(profile);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch student profile statistics.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [username]);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Retrieving student files...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !student) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto gap-4">
          <div className="w-12 h-12 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500">
            <Info size={24} />
          </div>
          <h2 className="text-lg font-semibold text-white">Student Profile Not Found</h2>
          <p className="text-sm text-zinc-400">
            Could not retrieve data for student username &quot;{username}&quot;.
          </p>
          <Link
            to="/rankings"
            className="flex items-center gap-2 px-4 py-2 mt-2 bg-orange-600 hover:bg-orange-700 text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            <span>Back to Leaderboard</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const formatTime = (secs: number) => {
    if (secs <= 0) return "--:--";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Back Link */}
        <div>
          <Link
            to="/rankings"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <ArrowLeft size={13} />
            <span>Back to Standings</span>
          </Link>
        </div>

        {/* Profile Card Header */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-bl from-orange-500/[0.015] to-transparent blur-3xl pointer-events-none" />

          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white text-2xl shadow-lg shadow-orange-500/10">
              {student.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">{student.name}</h2>
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Roll No: {student.roll_no}</span>
                <span className="text-zinc-600">•</span>
                <span>Batch: {student.batch}</span>
                <span className="text-zinc-600">•</span>
                <span>Section: {student.section}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href={`https://leetcode.com/${student.leetcode_username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] w-fit"
            >
              <span className="font-mono">@{student.leetcode_username}</span>
              <ExternalLink size={12} />
            </a>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-red-950/20 border border-red-900/30 hover:border-red-900/60 hover:bg-red-900/20 text-red-400 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              <Trash2 size={12} />
              <span>Delete Student</span>
            </button>
          </div>
        </div>

        {/* Info Alert Box regarding API limitations */}
        <div className="bg-zinc-950 border border-zinc-900/80 rounded-xl p-4 flex gap-3 text-xs text-zinc-400">
          <span className="text-orange-500 mt-0.5">
            <Info size={16} />
          </span>
          <div>
            <span className="font-semibold text-zinc-300 block mb-0.5">
              Notice on LeetCode Statistics:
            </span>
            General LeetCode profile fields (e.g. Overall solved problems, language statistics) are not exposed by the current backend APIs. The statistics, growth trends, and activity tracking metrics presented below are computed strictly from **contest participation results**.
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contest Rating</p>
            <h4 className="text-3xl font-bold text-orange-400 mt-1">{student.latest_rating}</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Current performance rating</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Best Rank</p>
            <h4 className="text-3xl font-bold text-white mt-1">
              {student.best_rank ? student.best_rank.toLocaleString() : "--"}
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">Highest global contest rank</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Contests Attended</p>
            <h4 className="text-3xl font-bold text-white mt-1">{student.contests_attended}</h4>
            <p className="text-[10px] text-zinc-500 mt-1">Total contests recorded</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Average Rank</p>
            <h4 className="text-3xl font-bold text-white mt-1">
              {student.is_active ? student.average_rank.toLocaleString() : "--"}
            </h4>
            <p className="text-[10px] text-zinc-500 mt-1">Global average standing</p>
          </div>
        </div>

        {student.is_active ? (
          <>
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Rating History Chart */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white">Contest Rating Progression</h4>
                  <p className="text-xs text-zinc-500">Rating timeline across attended contests</p>
                </div>
                <div className="h-64 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={student.history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="contest_number"
                        stroke="#52525b"
                        fontSize={9}
                        tickFormatter={(val) => `#${val}`}
                      />
                      <YAxis stroke="#52525b" fontSize={9} domain={["dataMin - 50", "dataMax + 50"]} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                        labelStyle={{ color: "#a1a1aa", fontSize: 10, fontWeight: 600 }}
                        itemStyle={{ color: "#ea580c", fontSize: 11 }}
                        formatter={(value: any) => [`${value} Rating`, "Rating"]}
                        labelFormatter={(label) => `Contest #${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="rating_after"
                        stroke="#ea580c"
                        strokeWidth={2}
                        dot={{ stroke: "#ea580c", strokeWidth: 1.5, r: 2.5, fill: "#09090b" }}
                        activeDot={{ r: 4 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Problems Solved Chart */}
              <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-white">Problems Solved Trend</h4>
                  <p className="text-xs text-zinc-500">Problems solved in each contest</p>
                </div>
                <div className="h-64 w-full mt-auto">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={student.history} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="contest_number"
                        stroke="#52525b"
                        fontSize={9}
                        tickFormatter={(val) => `#${val}`}
                      />
                      <YAxis stroke="#52525b" fontSize={9} domain={[0, 4]} allowDecimals={false} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                        labelStyle={{ color: "#a1a1aa", fontSize: 10, fontWeight: 600 }}
                        itemStyle={{ color: "#f59e0b", fontSize: 11 }}
                        formatter={(value: any) => [`${value} / 4 Problems`, "Solved"]}
                        labelFormatter={(label) => `Contest #${label}`}
                      />
                      <Bar
                        dataKey="problems_solved"
                        fill="#f59e0b"
                        radius={[3, 3, 0, 0]}
                        maxBarSize={30}
                        className="fill-amber-600/60 stroke-amber-500/80 stroke-[1px]"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Performance Timeline */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
              <h4 className="text-sm font-semibold text-white mb-6">Contest History Timeline</h4>
              <div className="relative pl-6 border-l border-zinc-900 flex flex-col gap-6 ml-2">
                {[...student.history].reverse().map((record) => {
                  const isPositive = record.rating_change > 0;
                  return (
                    <div key={record.contest_id} className="relative group">
                      {/* Bullet Point */}
                      <span className="absolute -left-[31px] top-1.5 w-2.5 h-2.5 rounded-full bg-zinc-950 border-2 border-orange-500 ring-[5px] ring-[#09090b]" />

                      <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-lg hover:border-zinc-800 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex flex-col gap-1">
                          <span className="font-semibold text-zinc-100">{record.contest_name}</span>
                          <span className="text-[10px] text-zinc-500 flex items-center gap-1.5 font-medium">
                            <Calendar size={11} />
                            {new Date(record.contest_date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                            <Clock size={11} className="ml-1" />
                            {formatTime(record.finish_time_seconds)}
                          </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-semibold">
                              Contest Rank
                            </span>
                            <span className="font-semibold text-zinc-300 font-mono">
                              #{record.rank.toLocaleString()}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-semibold">
                              Solved
                            </span>
                            <span className="font-semibold text-zinc-300">
                              {record.problems_solved} / {record.total_problems}
                            </span>
                          </div>

                          <div>
                            <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-semibold">
                              Rating After
                            </span>
                            <span className="font-semibold text-zinc-200">
                              {Math.round(record.rating_after)}
                            </span>
                          </div>

                          <div className="text-right min-w-[70px]">
                            <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-semibold">
                              Change
                            </span>
                            {record.rating_change === 0 ? (
                              <span className="font-semibold text-zinc-500">0</span>
                            ) : isPositive ? (
                              <span className="font-bold text-emerald-400 flex items-center gap-0.5 justify-end">
                                <TrendingUp size={11} />+{record.rating_change.toFixed(0)}
                              </span>
                            ) : (
                              <span className="font-bold text-rose-400 flex items-center gap-0.5 justify-end">
                                <TrendingDown size={11} />
                                {record.rating_change.toFixed(0)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : (
          <div className="p-12 text-center bg-zinc-950 border border-zinc-900 rounded-xl">
            <p className="text-sm text-zinc-500 font-medium">
              This student has not participated in any tracked contests.
            </p>
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showDeleteModal && student && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 max-w-md w-full shadow-2xl flex flex-col gap-6 animate-scale-in">
            <div>
              <h3 className="text-2xl font-bold text-white">Delete Student</h3>
              <p className="text-sm text-zinc-400 mt-1">Please confirm student identity details below</p>
            </div>

            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-5 flex flex-col gap-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Name</span>
                <span className="font-semibold text-white">{student.name}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">Roll Number</span>
                <span className="font-mono text-white">{student.roll_no}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-400">LeetCode Username</span>
                <span className="font-mono text-orange-450">@{student.leetcode_username}</span>
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

export default StudentProfilePage;
