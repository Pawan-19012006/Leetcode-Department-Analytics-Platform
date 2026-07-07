import { useEffect, useState } from "react";
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  Award,
  Calendar,
  Activity,
  FileText,
  BarChart3,
  Info,
  AlertTriangle,
  CheckCircle,
  ShieldAlert
} from "lucide-react";
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Cell
} from "recharts";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  fetchAndAggregateAllData,
  getDashboardOverview,
  getWeeklyAnalytics,
  getMonthlyAnalytics,
  getWatchlistData,
  getDepartmentIntelligence
} from "../services/dataService";
import type {
  DashboardOverview,
  WeeklyAnalytics,
  MonthlyAnalytics,
  WatchlistData,
  DepartmentIntelligence
} from "../services/dataService";
import {
  formatRating,
  formatRatingChange,
  formatPercentage,
  formatScore
} from "../utils/formatter";

type TabType = "overview" | "weekly" | "monthly" | "watchlist" | "intelligence";

function AnalyticsPage() {
  const [currentTab, setCurrentTab] = useState<TabType>("overview");
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [weekly, setWeekly] = useState<WeeklyAnalytics | null>(null);
  const [monthly, setMonthly] = useState<MonthlyAnalytics | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistData | null>(null);
  const [intelligence, setIntelligence] = useState<DepartmentIntelligence | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async (force = false) => {
    try {
      if (force) setRefreshing(true);
      else setLoading(true);

      await fetchAndAggregateAllData(force);
      
      setOverview(getDashboardOverview());
      setWeekly(getWeeklyAnalytics());
      setMonthly(getMonthlyAnalytics());
      setWatchlist(getWatchlistData());
      setIntelligence(getDepartmentIntelligence());
      
      setError(null);
    } catch (err: any) {
      console.error(err);
      setError("Failed to fetch department metrics. Please verify that the backend server is online.");
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
          <div className="w-10 h-10 rounded-full border-2 border-zinc-700 border-t-transparent animate-spin" />
          <p className="text-sm text-zinc-400 font-medium tracking-wide">Assembling department metrics intelligence...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !overview || !weekly || !monthly || !watchlist || !intelligence) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto my-12 p-8 bg-zinc-900 border border-zinc-800 rounded-lg">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <AlertCircle size={24} />
            <h3 className="text-lg font-bold">Data Connection Offline</h3>
          </div>
          <p className="text-sm text-zinc-400 leading-relaxed mb-6">
            {error || "An unexpected error occurred while loading aggregation stats."}
          </p>
          <button
            onClick={() => loadData(true)}
            className="flex items-center gap-2 px-4 py-2 bg-zinc-800 hover:bg-zinc-750 text-zinc-200 text-sm font-semibold rounded border border-zinc-700"
          >
            <RefreshCw size={14} />
            Retry Connection
          </button>
        </div>
      </DashboardLayout>
    );
  }

  // Format rating change values with positive/negative signs and corresponding color classes
  const formatChange = (val: number) => {
    const text = formatRatingChange(val);
    const rounded = Math.round(val);
    if (rounded > 0) return { text, className: "text-emerald-500" };
    if (rounded < 0) return { text, className: "text-rose-500" };
    return { text: "0", className: "text-zinc-500" };
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6 text-zinc-200">
        
        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-5">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100">Department Performance Intelligence</h1>
            <p className="text-xs text-zinc-400 mt-1">Dean &amp; Faculty Executive Decision Support System</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-zinc-500 font-mono">Sync Interval: 60s Cached</span>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 disabled:opacity-50 text-xs font-semibold rounded border border-zinc-800 transition"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Syncing..." : "Sync Dashboard"}
            </button>
          </div>
        </div>

        {/* TOP TAB NAVIGATION */}
        <div className="flex border-b border-zinc-800 gap-1 overflow-x-auto">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "weekly", label: "Weekly Analytics" },
              { id: "monthly", label: "Monthly Analytics" },
              { id: "watchlist", label: "Watchlist & Intervention" },
              { id: "intelligence", label: "Department Intelligence" }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-4 py-2.5 text-sm font-semibold tracking-wide border-b-2 transition -mb-px whitespace-nowrap ${
                currentTab === tab.id
                  ? "border-zinc-300 text-zinc-100"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ============================================================== */}
        {/* TAB 1 — OVERVIEW */}
        {/* ============================================================== */}
        {currentTab === "overview" && (
          <div className="space-y-6">
            
            {/* SECTION 1: Executive KPI Row */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { label: "Total Students", value: formatScore(overview.total_students), desc: "Enrolled in portal" },
                { label: "Active Students", value: formatScore(overview.active_students), desc: "Contest participants" },
                { label: "Average Rating", value: formatRating(overview.average_rating), desc: "Department overall average" },
                { label: "Avg Problems Solved", value: formatScore(overview.average_solved), desc: "In profile snapshot" },
                { label: "Above 1600", value: formatScore(overview.students_above_1600), desc: "Elite performers" },
                { label: "Below 1400", value: formatScore(overview.students_below_1400), desc: "Needs development support" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
                  <span className="text-xs text-zinc-400 font-semibold">{kpi.label}</span>
                  <span className="text-2xl font-bold tracking-tight text-zinc-100 my-2">{kpi.value}</span>
                  <span className="text-[10px] text-zinc-500 leading-normal">{kpi.desc}</span>
                </div>
              ))}
            </div>

            {/* SECTION 2: Department Standing */}
            <div className="bg-zinc-900 border border-zinc-800 p-6 rounded flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-zinc-300">Department Performance Standing</h3>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    overview.health_status === "Excellent" || overview.health_status === "Good"
                      ? "bg-emerald-950 text-emerald-400 border border-emerald-900"
                      : overview.health_status === "Average"
                      ? "bg-amber-950 text-amber-400 border border-amber-900"
                      : "bg-rose-950 text-rose-400 border border-rose-900"
                  }`}>
                    {overview.health_status}
                  </span>
                </div>
                <p className="text-xs text-zinc-400 max-w-xl">
                  Comprehensive performance index calculated dynamically from contest participation frequency, positive rating growth trends, and overall student coding activity profiles.
                </p>
              </div>
              <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-850 p-4 rounded min-w-[200px] justify-between">
                <span className="text-xs font-semibold text-zinc-400">Standing Score:</span>
                <span className="text-xl font-bold text-zinc-200">{formatScore(overview.health_score)}/100</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* SECTION 3: Top Performers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Award size={16} className="text-zinc-400" />
                    Top Performance Standings
                  </h3>
                  <span className="text-xs text-zinc-550">Highest current LeetCode rating</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="pb-2 w-12">Rank</th>
                        <th className="pb-2">Student</th>
                        <th className="pb-2 text-right">Rating</th>
                        <th className="pb-2 text-right">30D Change</th>
                        <th className="pb-2 text-right">Contests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {overview.top_performers.map(student => {
                        const change = formatChange(student.change_30d);
                        return (
                          <tr key={student.username} className="hover:bg-zinc-950/40">
                            <td className="py-2.5 font-mono text-zinc-400">#{student.rank}</td>
                            <td className="py-2.5">
                              <div className="font-semibold text-zinc-300">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className="py-2.5 text-right font-semibold font-mono text-zinc-200">{formatRating(student.rating)}</td>
                            <td className={`py-2.5 text-right font-mono font-semibold ${change.className}`}>{change.text}</td>
                            <td className="py-2.5 text-right font-mono text-zinc-400">{formatScore(student.contests)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 4: Most Improved Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <TrendingUp size={16} className="text-zinc-400" />
                    Highest Rating Improvement
                  </h3>
                  <span className="text-xs text-zinc-550">Highest overall rating gain</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="pb-2 w-12">Rank</th>
                        <th className="pb-2">Student</th>
                        <th className="pb-2 text-right">Rating Gain</th>
                        <th className="pb-2 text-right">Solved Growth (30D)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {overview.most_improved.map(student => (
                        <tr key={student.username} className="hover:bg-zinc-950/40">
                          <td className="py-3 font-mono text-zinc-400">#{student.rank}</td>
                          <td className="py-3">
                            <div className="font-semibold text-zinc-300">{student.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-emerald-500">+{formatRating(student.rating_gain)}</td>
                          <td className="py-3 text-right font-mono text-zinc-400">+{formatScore(student.problems_solved_growth)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 5: Needs Attention Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-zinc-400" />
                    Performance Intervention Watchlist
                  </h3>
                  <span className="text-xs text-zinc-550">Sorted worst-first (Rating drops &amp; low turnout)</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="pb-2">Student</th>
                        <th className="pb-2 text-right">Current Rating</th>
                        <th className="pb-2 text-right">30D Change</th>
                        <th className="pb-2 text-right">Contest Turnout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {overview.needs_attention.map(student => {
                        const change = formatChange(student.change_30d);
                        return (
                          <tr key={student.username} className="hover:bg-zinc-950/40">
                            <td className="py-3">
                              <div className="font-semibold text-zinc-300">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className="py-3 text-right font-mono font-semibold text-zinc-200">{formatRating(student.rating)}</td>
                            <td className={`py-3 text-right font-mono font-semibold ${change.className}`}>{change.text}</td>
                            <td className="py-3 text-right font-mono text-zinc-400">{student.contest_activity}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* SECTION 6: Rating Distribution Chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4 flex flex-col">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <BarChart3 size={16} className="text-zinc-400" />
                    Overall Rating Distribution
                  </h3>
                  <span className="text-xs text-zinc-550">Total active students categorized by rating</span>
                </div>
                <div className="h-64 w-full mt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overview.rating_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="bin" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} tickFormatter={(v) => formatScore(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "4px" }}
                        formatter={(value: any) => [formatScore(value), "Count"]}
                      />
                      <Bar dataKey="count" fill="#4b5563" radius={[2, 2, 0, 0]}>
                        {overview.rating_distribution.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx >= 3 ? "#4b5563" : "#6b7280"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2 — WEEKLY ANALYTICS */}
        {/* ============================================================== */}
        {currentTab === "weekly" && (
          <div className="space-y-6">
            
            {/* Section 1: KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Active Students (This Week)", value: formatScore(weekly.active_students), desc: "Attended contests this week" },
                { label: "Problems Solved", value: formatScore(weekly.problems_solved), desc: "Solved in contests this week" },
                { label: "Average Rating Gain", value: formatRatingChange(weekly.average_rating_gain), desc: "Change across active students", isSigned: true },
                { label: "Participation Rate", value: formatPercentage(weekly.participation_rate), desc: "Percent of department active" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
                  <span className="text-xs text-zinc-400 font-semibold">{kpi.label}</span>
                  <span className={`text-2xl font-bold tracking-tight text-zinc-100 my-2 ${
                    kpi.isSigned && Math.round(Number(weekly.average_rating_gain)) > 0 ? "text-emerald-500" : ""
                  }`}>
                    {kpi.value}
                  </span>
                  <span className="text-[10px] text-zinc-500 leading-normal">{kpi.desc}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Top Weekly Performers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Award size={16} className="text-zinc-400" />
                    Top Weekly Performers
                  </h3>
                  <span className="text-xs text-zinc-550">Highest rating gains this week</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="pb-2">Student</th>
                        <th className="pb-2 text-right">Rating Gain</th>
                        <th className="pb-2 text-right">Problems Solved</th>
                        <th className="pb-2 text-right">Contests Attended</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {weekly.top_performers.map(student => (
                        <tr key={student.username} className="hover:bg-zinc-950/40">
                          <td className="py-2.5">
                            <div className="font-semibold text-zinc-300">{student.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-emerald-500">+{formatRating(student.rating_gain)}</td>
                          <td className="py-2.5 text-right font-mono text-zinc-400">{formatScore(student.problems_solved)}</td>
                          <td className="py-2.5 text-right font-mono text-zinc-400">{formatScore(student.contests)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Weekly Underperformers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <TrendingDown size={16} className="text-zinc-400" />
                    Weekly Underperformers
                  </h3>
                  <span className="text-xs text-zinc-550">Students with rating losses this week</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="pb-2">Student</th>
                        <th className="pb-2 text-right">Rating Loss</th>
                        <th className="pb-2 text-right">Contest Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {weekly.underperformers.length > 0 ? (
                        weekly.underperformers.map(student => (
                          <tr key={student.username} className="hover:bg-zinc-950/40">
                            <td className="py-3">
                              <div className="font-semibold text-zinc-300">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className="py-3 text-right font-mono font-semibold text-rose-500">{formatRatingChange(student.rating_loss)}</td>
                            <td className="py-3 text-right font-mono text-zinc-400">{formatScore(student.contest_activity)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-550 italic">
                            No students experienced rating drops this week.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Week Summary Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-3 flex items-center gap-2">
                <FileText size={16} className="text-zinc-400" />
                Weekly Performance Summary &amp; Analytics Insights
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Highest Rating Gain", value: weekly.insights.highest_rating_gain, iconColor: "text-emerald-500" },
                  { label: "Most Problems Solved", value: weekly.insights.most_problems_solved, iconColor: "text-zinc-400" },
                  { label: "Best Performing Section", value: weekly.insights.best_performing_section, iconColor: "text-zinc-400" },
                  { label: "Inactive Students Count", value: `${formatScore(weekly.insights.inactive_students_count)} Students`, iconColor: "text-rose-400" }
                ].map((insight, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-850 p-4 rounded">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{insight.label}</span>
                    <p className={`text-sm font-bold mt-2 text-zinc-200 ${insight.iconColor}`}>{insight.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 3 — MONTHLY ANALYTICS */}
        {/* ============================================================== */}
        {currentTab === "monthly" && (
          <div className="space-y-6">
            
            {/* Section 1: KPI Row */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { label: "Active Students (Month)", value: formatScore(monthly.active_students), desc: "Participated this month" },
                { label: "Problems Solved", value: formatScore(monthly.problems_solved), desc: "Solved in contests this month" },
                { label: "Average Rating Gain", value: formatRatingChange(monthly.average_rating_gain), desc: "Monthly department average", isSigned: true },
                { label: "Participation Rate", value: formatPercentage(monthly.participation_rate), desc: "Percent of department active" },
                { label: "Rating Growth", value: formatPercentage(monthly.growth_percentage), desc: "Change index vs base" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 p-4 rounded flex flex-col justify-between">
                  <span className="text-xs text-zinc-400 font-semibold">{kpi.label}</span>
                  <span className={`text-2xl font-bold tracking-tight text-zinc-100 my-2 ${
                    kpi.isSigned && Math.round(Number(monthly.average_rating_gain)) > 0 ? "text-emerald-500" : ""
                  }`}>
                    {kpi.value}
                  </span>
                  <span className="text-[10px] text-zinc-500 leading-normal">{kpi.desc}</span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Monthly Top Performers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <Award size={16} className="text-zinc-400" />
                    Monthly Top Performers
                  </h3>
                  <span className="text-xs text-zinc-550">Highest rating gains this month</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="pb-2">Student</th>
                        <th className="pb-2 text-right">Rating Gain</th>
                        <th className="pb-2 text-right">Problems Solved</th>
                        <th className="pb-2 text-right">Contests Attended</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {monthly.top_performers.map(student => (
                        <tr key={student.username} className="hover:bg-zinc-950/40">
                          <td className="py-2.5">
                            <div className="font-semibold text-zinc-300">{student.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                          </td>
                          <td className="py-2.5 text-right font-mono font-semibold text-emerald-500">+{formatRating(student.rating_gain)}</td>
                          <td className="py-2.5 text-right font-mono text-zinc-400">{formatScore(student.problems_solved)}</td>
                          <td className="py-2.5 text-right font-mono text-zinc-400">{formatScore(student.contests)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Underperformers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <TrendingDown size={16} className="text-zinc-400" />
                    Monthly Underperformers
                  </h3>
                  <span className="text-xs text-zinc-550">Highest rating losses this month</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                        <th className="pb-2">Student</th>
                        <th className="pb-2 text-right">Rating Loss</th>
                        <th className="pb-2 text-right">Contests Attended</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {monthly.underperformers.length > 0 ? (
                        monthly.underperformers.map(student => (
                          <tr key={student.username} className="hover:bg-zinc-950/40">
                            <td className="py-3">
                              <div className="font-semibold text-zinc-300">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className="py-3 text-right font-mono font-semibold text-rose-500">{formatRatingChange(student.rating_loss)}</td>
                            <td className="py-3 text-right font-mono text-zinc-400">{formatScore(student.contest_activity)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-550 italic">
                            No students experienced rating drops this month.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Monthly Summary Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
              <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-3 flex items-center gap-2">
                <Calendar size={16} className="text-zinc-400" />
                Monthly Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {[
                  { label: "Avg Rating Increase", value: `+${formatRating(monthly.summary.average_rating_increase)} Points`, iconColor: "text-emerald-500" },
                  { label: "Total Contests Tracked", value: `${formatScore(monthly.summary.total_contests)} Contests`, iconColor: "text-zinc-400" },
                  { label: "Highest Participation Turnout", value: formatPercentage(monthly.summary.highest_participation), iconColor: "text-zinc-400" },
                  { label: "Best Performing Section", value: monthly.summary.best_section, iconColor: "text-zinc-400" },
                  { label: "Consistency Score (Overall)", value: `${formatScore(monthly.summary.consistency_score)}/100`, iconColor: "text-zinc-400" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-850 p-4 rounded">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">{item.label}</span>
                    <p className={`text-sm font-bold mt-2 text-zinc-200 ${item.iconColor}`}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 4 — WATCHLIST */}
        {/* ============================================================== */}
        {currentTab === "watchlist" && (
          <div className="space-y-6">
            
            {/* SECTION 1: Summary Counts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: "Critical Priority", value: formatScore(watchlist.critical_count), borderClass: "border-rose-900 bg-rose-950/20 text-rose-500" },
                { label: "At Risk", value: formatScore(watchlist.at_risk_count), borderClass: "border-amber-900 bg-amber-950/25 text-amber-500" },
                { label: "Warning Alert", value: formatScore(watchlist.warning_count), borderClass: "border-zinc-800 bg-zinc-900/60 text-zinc-300" },
                { label: "Good Standing", value: formatScore(watchlist.good_count), borderClass: "border-zinc-850 bg-zinc-900/30 text-emerald-500" }
              ].map((c, idx) => (
                <div key={idx} className={`border p-4 rounded flex items-center justify-between ${c.borderClass}`}>
                  <span className="text-xs font-semibold">{c.label}</span>
                  <span className="text-2xl font-bold tracking-tight">{c.value}</span>
                </div>
              ))}
            </div>

            {/* SECTION 2: Student Watchlist Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <div>
                  <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-zinc-400" />
                    Academic Intervention Watchlist
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Status rules based on rating drops &amp; activity decay indicators</p>
                </div>
                <span className="text-xs text-zinc-550">Sorted by Priority Score</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                      <th className="pb-2">Student</th>
                      <th className="pb-2 text-right">Current Rating</th>
                      <th className="pb-2 text-right">30D Change</th>
                      <th className="pb-2 text-right">Problems Solved</th>
                      <th className="pb-2 text-right">Contest Attendance</th>
                      <th className="pb-2 text-center w-24">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {watchlist.students.map(student => {
                      const change = formatChange(student.rating_change_30d);
                      
                      let statusBadgeClass = "text-zinc-500 border-zinc-800 bg-zinc-950";
                      if (student.status === "Critical") statusBadgeClass = "text-rose-400 border-rose-950 bg-rose-950/20";
                      else if (student.status === "At Risk") statusBadgeClass = "text-amber-400 border-amber-950 bg-amber-950/20";
                      else if (student.status === "Warning") statusBadgeClass = "text-zinc-300 border-zinc-800 bg-zinc-900/60";
                      else if (student.status === "Good") statusBadgeClass = "text-emerald-400 border-emerald-950 bg-emerald-950/20";

                      return (
                        <tr key={student.username} className="hover:bg-zinc-950/40">
                          <td className="py-3">
                            <div className="font-semibold text-zinc-300">{student.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                          </td>
                          <td className="py-3 text-right font-mono font-semibold text-zinc-200">{formatRating(student.current_rating)}</td>
                          <td className={`py-3 text-right font-mono font-semibold ${change.className}`}>{change.text}</td>
                          <td className="py-3 text-right font-mono text-zinc-400">{formatScore(student.problems_solved)}</td>
                          <td className="py-3 text-right font-mono text-zinc-400">{student.contest_attendance}</td>
                          <td className="py-3 text-center">
                            <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border ${statusBadgeClass}`}>
                              {student.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 5 — DEPARTMENT INTELLIGENCE */}
        {/* ============================================================== */}
        {currentTab === "intelligence" && (
          <div className="space-y-6">
            
            {/* Section Performance Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-zinc-300 flex items-center gap-2">
                  <Activity size={16} className="text-zinc-400" />
                  Section Performance Comparison
                </h3>
                <span className="text-xs text-zinc-550">Average statistics of student groups</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-zinc-800 text-zinc-500 font-semibold uppercase tracking-wider">
                      <th className="pb-2">Section</th>
                      <th className="pb-2 text-right">Average Rating</th>
                      <th className="pb-2 text-right">Participation Rate</th>
                      <th className="pb-2 text-right">Monthly Problems Solved</th>
                      <th className="pb-2 text-right">Active Students</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {intelligence.section_comparison.map(sec => (
                      <tr key={sec.section_name} className="hover:bg-zinc-950/40">
                        <td className="py-3 font-semibold text-zinc-200">{sec.section_name}</td>
                        <td className="py-3 text-right font-mono font-semibold text-zinc-200">{formatRating(sec.average_rating)}</td>
                        <td className="py-3 text-right font-mono text-zinc-400">{formatPercentage(sec.participation_rate)}</td>
                        <td className="py-3 text-right font-mono text-zinc-400">{formatScore(sec.problems_solved)} solved</td>
                        <td className="py-3 text-right font-mono text-zinc-400">{formatScore(sec.active_students)} students</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Insights & Comparison Graph */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Performance Insights */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-3 flex items-center gap-2">
                  <Info size={16} className="text-zinc-400" />
                  Faculty Performance Insights
                </h3>
                <div className="space-y-3">
                  {intelligence.faculty_insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-zinc-950/40 border border-zinc-850 rounded">
                      <div className="mt-0.5">
                        {insight.type === "warning" ? (
                          <AlertTriangle size={14} className="text-rose-500" />
                        ) : insight.type === "success" ? (
                          <CheckCircle size={14} className="text-emerald-500" />
                        ) : (
                          <Info size={14} className="text-zinc-400" />
                        )}
                      </div>
                      <p className="text-xs text-zinc-300 leading-normal">{insight.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Visualization: Section Comparison Bar Chart */}
              <div className="bg-zinc-900 border border-zinc-800 rounded p-5 space-y-4">
                <h3 className="text-sm font-bold text-zinc-300 border-b border-zinc-800 pb-3 flex items-center gap-2">
                  <BarChart3 size={16} className="text-zinc-400" />
                  Average Rating comparison
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={intelligence.section_comparison} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="section_name" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} domain={[1200, 1600]} tickFormatter={(v) => formatRating(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "4px" }}
                        formatter={(value: any) => [formatRating(value), "Average Rating"]}
                      />
                      <Bar dataKey="average_rating" fill="#52525b" radius={[2, 2, 0, 0]}>
                        {intelligence.section_comparison.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx % 2 === 0 ? "#52525b" : "#71717a"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>

          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;