import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  TrendingUp,
  Award,
  Zap,
  ChevronRight,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
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
} from "../services/dataService";
import type { DepartmentStats } from "../services/dataService";


function AnalyticsPage() {
  const [data, setData] = useState<DepartmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      await fetchAndAggregateAllData(force);
      setData(getDepartmentStats());
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

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white">
              Department Analytics
            </h1>
            <p className="text-sm text-zinc-400 mt-1">
              Top-level insights compiled from Student Contest Standings.
            </p>
          </div>
          <button
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-200 text-xs font-semibold rounded-lg transition-all active:scale-[0.98] disabled:opacity-50 cursor-pointer shadow-sm"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
            <span>{refreshing ? "Syncing..." : "Sync Latest Data"}</span>
          </button>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-zinc-800 group-hover:text-zinc-700 transition-colors pointer-events-none">
              <Users size={40} />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Total Students</p>
            <h3 className="text-3xl font-bold text-white mt-2">{data.total_students}</h3>
            <p className="text-[11px] text-zinc-400 mt-2">Registered in tracking index</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-zinc-800 group-hover:text-zinc-700 transition-colors pointer-events-none">
              <Zap size={40} />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Active Students</p>
            <h3 className="text-3xl font-bold text-white mt-2">{data.active_students}</h3>
            <p className="text-[11px] text-zinc-400 mt-2">
              <span className="text-emerald-500 font-semibold">{data.active_percentage}%</span> of total department
            </p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-zinc-800 group-hover:text-zinc-700 transition-colors pointer-events-none">
              <Award size={40} />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Average Rating</p>
            <h3 className="text-3xl font-bold text-white mt-2">{data.average_rating}</h3>
            <p className="text-[11px] text-zinc-400 mt-2">Active student contest average</p>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 text-zinc-800 group-hover:text-zinc-700 transition-colors pointer-events-none">
              <TrendingUp size={40} />
            </div>
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Contests Tracked</p>
            <h3 className="text-3xl font-bold text-white mt-2">{data.contests_tracked}</h3>
            <p className="text-[11px] text-zinc-400 mt-2">LeetCode Weekly / Biweekly</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Growth Trend */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 lg:col-span-2 flex flex-col">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white">Department Rating Growth Trend</h4>
              <p className="text-xs text-zinc-500">Average contest rating per event over time</p>
            </div>
            <div className="h-72 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.growth_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="contest_number"
                    stroke="#52525b"
                    fontSize={10}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis stroke="#52525b" fontSize={10} domain={["dataMin - 50", "dataMax + 50"]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: 11, fontWeight: 600 }}
                    itemStyle={{ color: "#f97316", fontSize: 12 }}
                    formatter={(value: any) => [`${value} Rating`, "Avg Rating"]}
                    labelFormatter={(label) => `Contest #${label}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="average_rating"
                    stroke="url(#orangeGradient)"
                    strokeWidth={2.5}
                    dot={{ stroke: "#ea580c", strokeWidth: 1.5, r: 3, fill: "#09090b" }}
                    activeDot={{ r: 5, fill: "#ea580c" }}
                  />
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#ea580c" />
                      <stop offset="100%" stopColor="#f59e0b" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Rating Distribution */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white">Rating Distribution</h4>
              <p className="text-xs text-zinc-500">Distribution of active student ratings</p>
            </div>
            <div className="h-72 w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.rating_distribution} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="bin" stroke="#52525b" fontSize={10} />
                  <YAxis stroke="#52525b" fontSize={10} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: 11, fontWeight: 600 }}
                    itemStyle={{ color: "#ea580c", fontSize: 12 }}
                    formatter={(value: any) => [`${value} Students`, "Count"]}
                  />
                  <Bar
                    dataKey="count"
                    fill="#e0a96d"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                    className="fill-orange-600/60 stroke-orange-500/80 stroke-[1.5px]"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Participation rates */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 lg:col-span-3 flex flex-col">
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-white">Contest Attendance Rates</h4>
              <p className="text-xs text-zinc-500">Participation rate of active students over the last N events</p>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.participation_trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="cyanArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#18181b" strokeDasharray="3 3" vertical={false} />
                  <XAxis
                    dataKey="contest_number"
                    stroke="#52525b"
                    fontSize={10}
                    tickFormatter={(val) => `#${val}`}
                  />
                  <YAxis stroke="#52525b" fontSize={10} unit="%" domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#09090b", border: "1px solid #27272a" }}
                    labelStyle={{ color: "#a1a1aa", fontSize: 11, fontWeight: 600 }}
                    itemStyle={{ color: "#0d9488", fontSize: 12 }}
                    formatter={(value: any) => [`${value}%`, "Attendance Rate"]}
                    labelFormatter={(label) => `Contest #${label}`}
                  />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#0d9488"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#cyanArea)"
                    dot={{ stroke: "#0d9488", strokeWidth: 1, r: 2, fill: "#09090b" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Leaderboards List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Rated */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Top Rated Students</h4>
                <p className="text-xs text-zinc-500">Highest current contest ratings</p>
              </div>
              <Link
                to="/rankings"
                className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="flex flex-col gap-3.5">
              {data.top_rated.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 w-4">{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-sm font-semibold text-white hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {student.roll_no} • Batch {student.batch} • Sec {student.section}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-orange-400">{student.latest_rating}</div>
                    <span className="text-[9px] text-zinc-500 tracking-wide uppercase font-semibold">
                      Rating
                    </span>
                  </div>
                </div>
              ))}
              {data.top_rated.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500">No active students recorded.</div>
              )}
            </div>
          </div>

          {/* Most Improved */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white">Most Improved Students</h4>
                <p className="text-xs text-zinc-500">Highest overall rating gains</p>
              </div>
              <Link
                to="/rankings"
                className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="flex flex-col gap-3.5">
              {data.most_improved.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 w-4">{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-sm font-semibold text-white hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {student.roll_no} • {student.leetcode_username}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold text-emerald-400 flex items-center gap-0.5 justify-end">
                      <TrendingUp size={11} />+{student.rating_change.toFixed(0)}
                    </div>
                    <span className="text-[9px] text-zinc-500 tracking-wide uppercase font-semibold">
                      Growth
                    </span>
                  </div>
                </div>
              ))}
              {data.most_improved.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500">No students showing positive gains.</div>
              )}
            </div>
          </div>

          {/* High Performers */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-sm font-semibold text-white">High Performers</h4>
                <p className="text-xs text-zinc-500">Contest rating exceeding 1600</p>
              </div>
              <Link
                to="/rankings"
                className="text-zinc-500 hover:text-orange-500 transition-colors flex items-center"
              >
                <ChevronRight size={18} />
              </Link>
            </div>
            <div className="flex flex-col gap-3.5">
              {data.high_performers.slice(0, 5).map((student, idx) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/20 border border-zinc-900/60 hover:border-zinc-800 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-zinc-600 w-4">{idx + 1}</span>
                    <div>
                      <Link
                        to={`/students/${student.leetcode_username}`}
                        className="text-sm font-semibold text-white hover:text-orange-500 transition-colors"
                      >
                        {student.name}
                      </Link>
                      <p className="text-[10px] text-zinc-500 mt-0.5">
                        {student.roll_no} • Rated {student.latest_rating}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold text-orange-500 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20">
                      Elite
                    </div>
                    <p className="text-[8px] text-zinc-500 font-semibold tracking-wider uppercase mt-1">
                      {student.contests_attended} Contests
                    </p>
                  </div>
                </div>
              ))}
              {data.high_performers.length === 0 && (
                <div className="text-center py-6 text-xs text-zinc-500">No students currently above 1600 rating.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;