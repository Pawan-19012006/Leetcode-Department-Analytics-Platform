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
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              Executive Analytics Dashboard
            </h1>
            <p className="text-xs text-zinc-500 mt-0.5">
              HOD & Faculty Overview of Student Performance metrics.
            </p>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-[11px] font-bold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw size={11} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Syncing..." : "Sync Core"}</span>
          </button>
        </div>

        {/* SECTION 1: KPI HEADER */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-2xl font-bold text-white mt-1.5">{data.total_students}</h3>
            <span className="text-[9px] text-zinc-500 mt-1 block">In department directory</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Active Students</p>
            <h3 className="text-2xl font-bold text-white mt-1.5">{data.active_students}</h3>
            <span className="text-[9px] text-emerald-500 mt-1 block font-medium">
              {data.active_percentage}% active standing
            </span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-2xl font-bold text-white mt-1.5">{data.average_rating}</h3>
            <span className="text-[9px] text-zinc-500 mt-1 block">Attending average rating</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Elite Rated</p>
            <h3 className="text-2xl font-bold text-orange-400 mt-1.5">{data.high_performers.length}</h3>
            <span className="text-[9px] text-zinc-500 mt-1 block">Students rated ≥ 1600</span>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 col-span-2 lg:col-span-1">
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Contests Tracked</p>
            <h3 className="text-2xl font-bold text-white mt-1.5">{data.contests_tracked}</h3>
            <span className="text-[9px] text-zinc-500 mt-1 block">Weekly / Biweekly events</span>
          </div>
        </div>

        {/* SECTION 2: EXECUTIVE INSIGHTS (PRIMARY AREA) - 2x2 Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Top Performers */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Top Performers</h4>
                <p className="text-[11px] text-zinc-500">Highest current contest ratings</p>
              </div>
              <Link to="/rankings" className="text-zinc-500 hover:text-orange-500 transition-colors">
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {data.top_rated.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-600 w-5">#{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-xs font-bold text-zinc-200 hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-[9px] text-zinc-500 mt-0.5">
                        {student.roll_no} • Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-orange-400">{student.latest_rating}</span>
                    <span className="text-[8px] text-zinc-500 font-bold block leading-none mt-0.5">
                      RATING
                    </span>
                  </div>
                </div>
              ))}
              {data.top_rated.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500">No active students recorded.</div>
              )}
            </div>
          </div>

          {/* Card 2: Most Improved */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white">Most Improved</h4>
                <p className="text-[11px] text-zinc-500">Highest cumulative rating gains</p>
              </div>
              <Link to="/rankings" className="text-zinc-500 hover:text-orange-500 transition-colors">
                <ChevronRight size={16} />
              </Link>
            </div>
            <div className="flex flex-col gap-2.5">
              {data.most_improved.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-600 w-5">#{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-xs font-bold text-zinc-200 hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-[9px] text-zinc-500 mt-0.5">
                        {student.roll_no} • Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400 font-extrabold">
                      <TrendingUp size={11} />+{student.rating_change.toFixed(0)}
                    </span>
                    <span className="text-[8px] text-zinc-500 font-bold block leading-none mt-0.5">
                      GAIN
                    </span>
                  </div>
                </div>
              ))}
              {data.most_improved.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500">No students showing positive gains.</div>
              )}
            </div>
          </div>

          {/* Card 3: Needs Attention */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white text-rose-400">Needs Attention</h4>
                <p className="text-[11px] text-zinc-500">Lowest contest attendance rate</p>
              </div>
              <span className="text-rose-500/80">
                <AlertCircle size={15} />
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {needsAttention.map((student) => {
                const isZero = student.contests_attended === 0;
                return (
                  <div
                    key={student.id}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-900 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                      <div>
                        <Link
                          to={`/students/${student.leetcode_username}`}
                          className="text-xs font-bold text-zinc-200 hover:text-orange-500 transition-colors"
                        >
                          {student.name}
                        </Link>
                        <p className="text-[9px] text-zinc-500 mt-0.5">
                          {student.roll_no} • Sec {student.section}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {isZero ? (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/25">
                          0 participation
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/25">
                          {student.contests_attended} / {totalContestsCount} attended
                        </span>
                      )}
                      <span className="text-[8px] text-zinc-500 font-bold block leading-none mt-1">
                        ATTENDANCE
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: High Performers */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between border-b border-zinc-900/60 pb-3 mb-4">
              <div>
                <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-400" />
                  <span>High Performers</span>
                </h4>
                <p className="text-[11px] text-zinc-500">Elite performers rated above 1600</p>
              </div>
              <span className="text-xs font-bold px-2 py-0.5 bg-orange-500/15 border border-orange-500/20 text-orange-400 rounded-lg">
                Count: {data.high_performers.length}
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              {data.high_performers.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-900 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[11px] font-bold text-zinc-600 w-5">#{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-xs font-bold text-zinc-200 hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-[9px] text-zinc-500 mt-0.5">
                        {student.roll_no} • Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-extrabold text-orange-400">{student.latest_rating}</span>
                    <span className="text-[8px] text-zinc-500 font-bold block leading-none mt-0.5">
                      RATING
                    </span>
                  </div>
                </div>
              ))}
              {data.high_performers.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500">No students above 1600 rating.</div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: DEPARTMENT HEALTH */}
        <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5">
          <h4 className="text-sm font-bold text-white mb-4 border-b border-zinc-900/60 pb-2">
            Department Health Standings
          </h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Latest Attendance
              </span>
              <h5 className="text-xl font-extrabold text-white mt-1">{latestParticipationRate}%</h5>
            </div>
            <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Average Attendance
              </span>
              <h5 className="text-xl font-extrabold text-white mt-1">{averageParticipationRate}%</h5>
            </div>
            <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Active Ratio
              </span>
              <h5 className="text-xl font-extrabold text-emerald-400 mt-1">
                {data.active_percentage}%
              </h5>
            </div>
            <div className="p-4 bg-zinc-900/10 border border-zinc-900 rounded-lg text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider">
                Cohort Avg Rating
              </span>
              <h5 className="text-xl font-extrabold text-white mt-1">{data.average_rating}</h5>
            </div>
          </div>
        </div>

        {/* SECTION 4: TRENDS (SECONDARY) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Department Rating Growth */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col">
            <div className="mb-2">
              <h4 className="text-xs font-bold text-zinc-300">Department Rating Growth Trend</h4>
              <p className="text-[10px] text-zinc-500">Average contest rating per event</p>
            </div>
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.growth_trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="contest_number"
                    stroke="#52525b"
                    fontSize={8}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis stroke="#52525b" fontSize={8} domain={["dataMin - 30", "dataMax + 30"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: 9, fontWeight: 600 }}
                    itemStyle={{ color: "#f97316", fontSize: 10 }}
                    formatter={(value: any) => [`${value} Rating`, "Avg Rating"]}
                    labelFormatter={(label) => `Contest #${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="average_rating"
                    stroke="#ea580c"
                    strokeWidth={1.5}
                    dot={{ stroke: "#ea580c", strokeWidth: 1, r: 2, fill: "#09090b" }}
                    activeDot={{ r: 4, fill: "#ea580c" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Contest Participation Trend */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-4 flex flex-col">
            <div className="mb-2">
              <h4 className="text-xs font-bold text-zinc-300">Contest Participation Trend</h4>
              <p className="text-[10px] text-zinc-500">Cohort attendance rate percentage per contest</p>
            </div>
            <div className="h-32 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.participation_trend} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanAreaSmall" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="contest_number"
                    stroke="#52525b"
                    fontSize={8}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis stroke="#52525b" fontSize={8} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: 9, fontWeight: 600 }}
                    itemStyle={{ color: "#0d9488", fontSize: 10 }}
                    formatter={(value: any) => [`${value}%`, "Attendance"]}
                    labelFormatter={(label) => `Contest #${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#0d9488"
                    strokeWidth={1.5}
                    fillOpacity={1}
                    fill="url(#cyanAreaSmall)"
                    dot={{ stroke: "#0d9488", strokeWidth: 1, r: 2, fill: "#09090b" }}
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