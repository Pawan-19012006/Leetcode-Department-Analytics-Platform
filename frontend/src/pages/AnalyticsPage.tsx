import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  TrendingUp,
  Zap,
  ChevronRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  fetchAndAggregateAllData,
  getDepartmentStats,
  getStudentsWithStats,
  getContests,
} from "../services/dataService";
import type { DepartmentStats, StudentWithStats } from "../services/dataService";

function AnalyticsPage() {
  const [data, setData] = useState<DepartmentStats | null>(null);
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [totalContestsCount, setTotalContestsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      await fetchAndAggregateAllData(force);
      setData(getDepartmentStats());
      setStudents(getStudentsWithStats());
      setTotalContestsCount(getContests().length);
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to connect to the backend server. Please make sure it is running.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
          <div className="w-8 h-8 rounded-full border-2 border-orange-500 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400 font-medium">Loading department statistics...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !data) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto gap-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500">
            <Zap size={24} />
          </div>
          <h2 className="text-lg font-semibold text-white">Connection Error</h2>
          <p className="text-sm text-zinc-400">
            {error || "An error occurred while aggregation computations were executing."}
          </p>
          <button
            onClick={() => loadData(true)}
            className="flex items-center gap-2 px-4 py-2 mt-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-sm font-medium rounded-lg transition-colors cursor-pointer"
          >
            <RefreshCw size={14} />
            <span>Try Again</span>
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Calculate "Needs Attention" List: Sort students by contests attended ascending (0 first)
  const needsAttention = [...students]
    .sort((a, b) => {
      // 0 attendance comes first. If equal, sort by roll no or name
      if (a.contests_attended !== b.contests_attended) {
        return a.contests_attended - b.contests_attended;
      }
      return a.name.localeCompare(b.name);
    })
    .slice(0, 5);

  // Department Health metric computations
  const latestParticipationRate =
    data.participation_trend.length > 0
      ? data.participation_trend[data.participation_trend.length - 1].rate
      : 0;

  const averageParticipationRate =
    data.participation_trend.length > 0
      ? Math.round(
          data.participation_trend.reduce((sum, t) => sum + t.rate, 0) /
            data.participation_trend.length
        )
      : 0;

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Analytics Dashboard
            </h1>
            <p className="text-sm text-zinc-300 mt-1">
              HOD & Faculty Overview of Student Performance metrics.
            </p>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm animate-none"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Syncing..." : "Sync Core"}</span>
          </button>
        </div>

        {/* SECTION 1: KPI HEADER */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-7 shadow-sm">
            <p className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Total Students</p>
            <h3 className="text-4xl font-extrabold text-white mt-2.5">{data.total_students}</h3>
            <span className="text-sm text-zinc-300 mt-1.5 block">In department directory</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-7 shadow-sm">
            <p className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Active Students</p>
            <h3 className="text-4xl font-extrabold text-white mt-2.5">{data.active_students}</h3>
            <span className="text-sm text-emerald-400 mt-1.5 block font-semibold">
              {data.active_percentage}% active standing
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-7 shadow-sm">
            <p className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-4xl font-extrabold text-white mt-2.5">{data.average_rating}</h3>
            <span className="text-sm text-zinc-300 mt-1.5 block">Attending average rating</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-7 shadow-sm">
            <p className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Elite Rated</p>
            <h3 className="text-4xl font-extrabold text-orange-400 mt-2.5">{data.high_performers.length}</h3>
            <span className="text-sm text-zinc-300 mt-1.5 block">Students rated ≥ 1600</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-7 col-span-2 lg:col-span-1 shadow-sm">
            <p className="text-sm font-bold text-zinc-300 uppercase tracking-wider">Contests Tracked</p>
            <h3 className="text-4xl font-extrabold text-white mt-2.5">{data.contests_tracked}</h3>
            <span className="text-sm text-zinc-300 mt-1.5 block">Weekly / Biweekly events</span>
          </div>
        </div>

        {/* SECTION 2: EXECUTIVE INSIGHTS (PRIMARY AREA) - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Card 1: Top Performers */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
              <div>
                <h4 className="text-xl font-semibold text-white">Top Performers</h4>
                <p className="text-sm text-zinc-300 mt-1">Highest current contest ratings</p>
              </div>
              <Link to="/rankings" className="text-zinc-300 hover:text-orange-500 transition-colors">
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="flex flex-col gap-5">
              {data.top_rated.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-6 py-5 rounded-lg bg-zinc-900/25 border border-zinc-900/60 hover:border-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-zinc-400 w-6">#{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-lg font-semibold text-zinc-100 hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-sm text-zinc-300 mt-1">
                        {student.roll_no} • Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-orange-400">{student.latest_rating}</span>
                    <span className="text-xs text-zinc-300 font-bold block leading-none mt-1.5 uppercase tracking-wider">
                      Rating
                    </span>
                  </div>
                </div>
              ))}
              {data.top_rated.length === 0 && (
                <div className="text-center py-6 text-sm text-zinc-300">No active students recorded.</div>
              )}
            </div>
          </div>

          {/* Card 2: Most Improved */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
              <div>
                <h4 className="text-xl font-semibold text-white">Most Improved</h4>
                <p className="text-sm text-zinc-300 mt-1">Highest cumulative rating gains</p>
              </div>
              <Link to="/rankings" className="text-zinc-300 hover:text-orange-500 transition-colors">
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="flex flex-col gap-5">
              {data.most_improved.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-6 py-5 rounded-lg bg-zinc-900/25 border border-zinc-900/60 hover:border-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-zinc-400 w-6">#{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-lg font-semibold text-zinc-100 hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-sm text-zinc-300 mt-1">
                        {student.roll_no} • Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-0.5 text-xl font-bold text-emerald-400">
                      <TrendingUp size={14} />+{student.rating_change.toFixed(0)}
                    </span>
                    <span className="text-xs text-zinc-300 font-bold block leading-none mt-1.5 uppercase tracking-wider">
                      Gain
                    </span>
                  </div>
                </div>
              ))}
              {data.most_improved.length === 0 && (
                <div className="text-center py-6 text-sm text-zinc-300">No students showing positive gains.</div>
              )}
            </div>
          </div>

          {/* Card 3: Needs Attention */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
              <div>
                <h4 className="text-xl font-semibold text-rose-400">Needs Attention</h4>
                <p className="text-sm text-zinc-300 mt-1">Lowest contest attendance rate</p>
              </div>
              <span className="text-rose-500/80">
                <AlertCircle size={18} />
              </span>
            </div>
            <div className="flex flex-col gap-5">
              {needsAttention.map((student) => {
                const isZero = student.contests_attended === 0;
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between px-6 py-5 rounded-lg bg-zinc-900/25 border border-zinc-900/60 hover:border-zinc-800 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                      <div>
                        <Link
                          to={`/students/${student.leetcode_username}`}
                          className="text-lg font-semibold text-zinc-100 hover:text-orange-500 transition-colors"
                        >
                          {student.name}
                        </Link>
                        <p className="text-sm text-zinc-300 mt-1">
                          {student.roll_no} • Sec {student.section}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xl font-bold ${isZero ? "text-rose-400" : "text-amber-400"}`}>
                        {student.contests_attended} / {totalContestsCount}
                      </span>
                      <span className="text-xs text-zinc-300 font-bold block leading-none mt-1.5 uppercase tracking-wider">
                        Attendance
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: High Performers */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col shadow-sm">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-5">
              <div>
                <h4 className="text-xl font-semibold text-white flex items-center gap-1.5">
                  <Sparkles size={16} className="text-amber-400" />
                  <span>High Performers</span>
                </h4>
                <p className="text-sm text-zinc-300 mt-1">Elite performers rated above 1600</p>
              </div>
              <span className="text-sm font-semibold px-3 py-1 bg-orange-500/15 border border-orange-500/20 text-orange-400 rounded-lg">
                Count: {data.high_performers.length}
              </span>
            </div>
            <div className="flex flex-col gap-5">
              {data.high_performers.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-6 py-5 rounded-lg bg-zinc-900/25 border border-zinc-900/60 hover:border-zinc-800 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-base font-bold text-zinc-400 w-6">#{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-lg font-semibold text-zinc-100 hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-sm text-zinc-300 mt-1">
                        {student.roll_no} • Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-orange-400">{student.latest_rating}</span>
                    <span className="text-xs text-zinc-300 font-bold block leading-none mt-1.5 uppercase tracking-wider">
                      Rating
                    </span>
                  </div>
                </div>
              ))}
              {data.high_performers.length === 0 && (
                <div className="text-center py-6 text-sm text-zinc-300">No students above 1600 rating.</div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: DEPARTMENT HEALTH */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 shadow-sm">
          <h4 className="text-xl font-semibold text-white mb-6 border-b border-zinc-900/60 pb-4">
            Department Health Standings
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="p-6 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-sm text-zinc-300 uppercase font-bold tracking-wider">
                Latest Attendance
              </span>
              <h5 className="text-4xl font-extrabold text-white mt-2">{latestParticipationRate}%</h5>
            </div>
            <div className="p-6 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-sm text-zinc-300 uppercase font-bold tracking-wider">
                Average Attendance
              </span>
              <h5 className="text-4xl font-extrabold text-white mt-2">{averageParticipationRate}%</h5>
            </div>
            <div className="p-6 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-sm text-zinc-300 uppercase font-bold tracking-wider">
                Active Ratio
              </span>
              <h5 className="text-4xl font-extrabold text-emerald-400 mt-2">
                {data.active_percentage}%
              </h5>
            </div>
            <div className="p-6 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-sm text-zinc-300 uppercase font-bold tracking-wider">
                Cohort Avg Rating
              </span>
              <h5 className="text-4xl font-extrabold text-white mt-2">{data.average_rating}</h5>
            </div>
          </div>
        </div>

        {/* SECTION 4: TRENDS (SECONDARY) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Chart 1: Department Rating Growth */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col">
            <div className="mb-3">
              <h4 className="text-base font-semibold text-zinc-200">Department Rating Growth Trend</h4>
              <p className="text-sm text-zinc-300 mt-1">Average contest rating per event</p>
            </div>
            <div className="h-44 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.growth_trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="contest_number"
                    stroke="#d4d4d8"
                    fontSize={10}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis stroke="#d4d4d8" fontSize={10} domain={["dataMin - 30", "dataMax + 30"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                    labelStyle={{ color: "#fafafa", fontSize: 11, fontWeight: 600 }}
                    itemStyle={{ color: "#f97316", fontSize: 12 }}
                    formatter={(value: any) => [`${value} Rating`, "Avg Rating"]}
                    labelFormatter={(label) => `Contest #${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="average_rating"
                    stroke="#ea580c"
                    strokeWidth={2}
                    dot={{ stroke: "#ea580c", strokeWidth: 1.5, r: 3, fill: "#09090b" }}
                    activeDot={{ r: 5, fill: "#ea580c" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Contest Participation Trend */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-8 flex flex-col">
            <div className="mb-3">
              <h4 className="text-base font-semibold text-zinc-200">Contest Participation Trend</h4>
              <p className="text-sm text-zinc-300 mt-1">Cohort attendance rate percentage per contest</p>
            </div>
            <div className="h-44 w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.participation_trend} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanAreaSmall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="contest_number"
                    stroke="#d4d4d8"
                    fontSize={10}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis stroke="#d4d4d8" fontSize={10} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                    labelStyle={{ color: "#fafafa", fontSize: 11, fontWeight: 600 }}
                    itemStyle={{ color: "#0d9488", fontSize: 12 }}
                    formatter={(value: any) => [`${value}%`, "Attendance"]}
                    labelFormatter={(label) => `Contest #${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cyanAreaSmall)"
                    dot={{ stroke: "#0d9488", strokeWidth: 1.5, r: 3, fill: "#09090b" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;