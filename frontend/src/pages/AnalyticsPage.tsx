import { useEffect, useState } from "react";
import {
  TrendingUp,
  RefreshCw,
  AlertCircle,
  TrendingDown,
  Award,
  Calendar,
  FileText,
  BarChart3,
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
      <div className="p-8 max-w-7xl mx-auto space-y-10 text-zinc-200">
        
        {/* Keyframe fade-in transition styled locally */}
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fade-in {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>

        {/* HEADER BAR */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-100">
              Department Performance Intelligence
            </h1>
            <p className="text-sm text-zinc-450 mt-1.5">
              Dean &amp; Faculty Executive Decision Support System
            </p>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-zinc-550 font-mono tracking-wider">Sync Interval: 60s Cached</span>
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 disabled:opacity-50 text-xs font-bold rounded border border-zinc-800 transition-all duration-200"
            >
              <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
              {refreshing ? "Syncing..." : "Sync Dashboard"}
            </button>
          </div>
        </div>

        {/* TOP TAB NAVIGATION */}
        <div className="flex border-b border-zinc-855 gap-2 overflow-x-auto">
          {(
            [
              { id: "overview", label: "Overview" },
              { id: "weekly", label: "Weekly Analytics" },
              { id: "monthly", label: "Monthly Analytics" },
              { id: "watchlist", label: "Watchlist & Intervention" }
            ] as const
          ).map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`px-5 py-3.5 text-sm font-semibold tracking-wide border-b-2 transition-all duration-200 -mb-px whitespace-nowrap ${
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
          <div className="space-y-10 animate-fade-in">

            {/* SECTION 1: KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
              {[
                { label: "Total Students", value: formatScore(overview.total_students), desc: "Registered cohort profiles" },
                { label: "Active Students", value: formatScore(overview.active_students), desc: "Participated this month" },
                { label: "Average Contest Rating", value: formatRating(overview.average_rating), desc: "Mean LeetCode rating" },
                { label: "Average Problems Solved", value: formatScore(overview.average_solved), desc: "Mean solve average" },
                { label: "Students Above 1600", value: formatScore(overview.students_above_1600), desc: "Elite performer count" },
                { label: "Students Below 1400", value: formatScore(overview.students_below_1400), desc: "Development support group" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300">
                  <span className="text-4xl font-extrabold tracking-tight text-zinc-100">{kpi.value}</span>
                  <span className="text-xs font-bold text-zinc-400 mt-3">{kpi.label}</span>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{kpi.desc}</p>
                </div>
              ))}
            </div>

            {/* SECTION 2 & 3: Weekly & Monthly Highlights side-by-side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Weekly Highlights Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <Award size={16} className="text-zinc-450" />
                    Top 5 Weekly Performers
                  </h3>
                  <span className="text-xs text-zinc-500">Highest weekly rating change</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-right">Weekly Rating Change</th>
                        <th className="py-3 px-4 text-right">Problems Solved Increase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {overview.weekly_top_rating.slice(0, 5).map(student => {
                        const change = formatChange(student.weekly_rating_change);
                        return (
                          <tr key={student.username} className="hover:bg-zinc-850/50 transition-all duration-200">
                            <td className="py-4 px-4">
                              <div className="text-sm font-semibold text-zinc-200">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className={`py-4 px-4 text-right font-mono font-semibold text-sm ${change.className}`}>{change.text}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-450">+{formatScore(student.weekly_solved_change)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Highlights Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <TrendingUp size={16} className="text-zinc-450" />
                    Top 5 Monthly Performers
                  </h3>
                  <span className="text-xs text-zinc-500">Highest monthly rating change</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-right">Monthly Rating Change</th>
                        <th className="py-3 px-4 text-right">Problems Solved Increase</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {overview.monthly_top_rating.slice(0, 5).map(student => {
                        const change = formatChange(student.monthly_rating_change);
                        return (
                          <tr key={student.username} className="hover:bg-zinc-850/50 transition-all duration-200">
                            <td className="py-4 px-4">
                              <div className="text-sm font-semibold text-zinc-200">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className={`py-4 px-4 text-right font-mono font-semibold text-sm ${change.className}`}>{change.text}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-450">+{formatScore(student.monthly_solved_change)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* SECTION 4: Rating Distribution Chart with Option A Insights Column */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 flex flex-col justify-between">
                <div className="border-b border-zinc-800 pb-3 mb-4">
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <BarChart3 size={16} className="text-zinc-400" />
                    Overall Rating Distribution
                  </h3>
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={overview.rating_distribution} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="bin" stroke="#71717a" fontSize={11} />
                      <YAxis stroke="#71717a" fontSize={11} tickFormatter={(v) => formatScore(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "4px" }}
                        formatter={(value: any) => [formatScore(value), "Count"]}
                      />
                      <Bar dataKey="count" fill="#3f3f46" radius={[2, 2, 0, 0]}>
                        {overview.rating_distribution.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={idx >= 3 ? "#52525b" : "#71717a"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-zinc-950 border border-zinc-850 p-6 rounded-lg flex flex-col justify-between space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Distribution Insights</h4>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-normal">
                    Percentage categorization of cohort performance bands.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="border-l-2 border-rose-500 pl-4 py-1">
                    <span className="text-2xl font-extrabold text-zinc-200 block">{formatScore(overview.students_below_1400)} Students</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Below 1400 Rating Threshold</span>
                  </div>
                  <div className="border-l-2 border-emerald-500 pl-4 py-1">
                    <span className="text-2xl font-extrabold text-zinc-200 block">{formatScore(overview.students_above_1600)} Students</span>
                    <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Elite Coding Cohort (1600+)</span>
                  </div>
                </div>
                
                <div className="text-[10px] text-zinc-650 border-t border-zinc-850 pt-3 leading-relaxed">
                  Interventions are recommended for students falling below the 1400 rating threshold to ensure foundational concept mastery.
                </div>
              </div>
            </div>

          </div>
        )}

        {/* ============================================================== */}
        {/* TAB 2 — WEEKLY ANALYTICS */}
        {/* ============================================================== */}
        {currentTab === "weekly" && (
          <div className="space-y-10 animate-fade-in">
            
            {/* Section 1: KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Active Students (This Week)", value: formatScore(weekly.active_students), desc: "Contest participant turnout" },
                { label: "Problems Solved", value: formatScore(weekly.problems_solved), desc: "Solved in weekly contests" },
                { label: "Average Rating Gain", value: formatRatingChange(weekly.average_rating_gain), desc: "Average change across cohort", isSigned: true },
                { label: "Participation Rate", value: formatPercentage(weekly.participation_rate), desc: "Percent of department active" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300">
                  <span className={`text-4xl font-extrabold tracking-tight text-zinc-100 ${
                    kpi.isSigned && Math.round(Number(weekly.average_rating_gain)) > 0 ? "text-emerald-500" : ""
                  }`}>
                    {kpi.value}
                  </span>
                  <span className="text-xs font-bold text-zinc-400 mt-3">{kpi.label}</span>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{kpi.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Top Weekly Performers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <Award size={16} className="text-zinc-450" />
                    Top Weekly Performers (Leaderboard)
                  </h3>
                  <span className="text-xs text-zinc-550">Ranked by weekly score weights</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12">Rank</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-right">Rating Change</th>
                        <th className="py-3 px-4 text-right">Problems Solved Increase</th>
                        <th className="py-3 px-4 text-right">Weekly Contests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {weekly.top_performers.map((student, idx) => {
                        const change = formatChange(student.rating_gain);
                        return (
                          <tr key={student.username} className="hover:bg-zinc-850/50 transition-all duration-200">
                            <td className="py-4 px-4 font-mono text-sm text-zinc-400">#{idx + 1}</td>
                            <td className="py-4 px-4">
                              <div className="text-sm font-semibold text-zinc-200">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className={`py-4 px-4 text-right font-mono font-semibold text-sm ${change.className}`}>{change.text}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-450">+{formatScore(student.problems_solved)}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-455">{formatScore(student.contests)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Weekly Underperformers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <TrendingDown size={16} className="text-zinc-450" />
                    Weekly Underperformers
                  </h3>
                  <span className="text-xs text-zinc-550">Sorted worst first</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-right">Weekly Change</th>
                        <th className="py-3 px-4 text-right">Contest Activity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {weekly.underperformers.length > 0 ? (
                        weekly.underperformers.map(student => (
                          <tr key={student.username} className="hover:bg-zinc-850/50 transition-all duration-200">
                            <td className="py-4 px-4">
                              <div className="text-sm font-semibold text-zinc-200">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-semibold text-sm text-rose-500">{formatRatingChange(student.rating_loss)}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-450">{formatScore(student.contest_activity)} contests</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-550 italic text-sm">
                            No students experienced rating drops this week.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>

            {/* Weekly rating distribution change bar chart */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base md:text-lg font-bold text-zinc-300 border-b border-zinc-800 pb-4">
                  Weekly Rating Distribution Shifts
                </h3>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={weekly.weekly_rating_distribution_change} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <CartesianGrid stroke="#27272a" strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="bin" stroke="#71717a" fontSize={10} />
                      <YAxis stroke="#71717a" fontSize={10} tickFormatter={(v) => formatRatingChange(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: "#18181b", border: "1px solid #27272a", borderRadius: "4px" }}
                        formatter={(value: any) => [formatRatingChange(value), "Shift"]}
                      />
                      <Bar dataKey="change" fill="#3f3f46" radius={[2, 2, 0, 0]}>
                        {weekly.weekly_rating_distribution_change.map((item, idx) => (
                          <Cell key={`cell-${idx}`} fill={item.change >= 0 ? "#10b981" : "#ef4444"} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <h3 className="text-base md:text-lg font-bold text-zinc-300 border-b border-zinc-800 pb-4">
                  Activity Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-850 rounded">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Students Improved</span>
                    <span className="text-lg font-bold text-emerald-500">+{formatScore(weekly.students_improved)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-850 rounded">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Students Declined</span>
                    <span className="text-lg font-bold text-rose-500">{formatScore(weekly.students_declined)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-850 rounded">
                    <span className="text-xs text-zinc-400 font-bold uppercase tracking-wider">Students Inactive</span>
                    <span className="text-lg font-bold text-zinc-450">{formatScore(weekly.students_inactive)}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Week Summary Panel */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base md:text-lg font-bold text-zinc-300 border-b border-zinc-800 pb-4 flex items-center gap-2">
                <FileText size={16} className="text-zinc-450" />
                Weekly Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { label: "Highest Rating Gain", value: weekly.insights.highest_rating_gain, iconColor: "text-emerald-500" },
                  { label: "Most Problems Solved", value: weekly.insights.most_problems_solved, iconColor: "text-zinc-200" },
                  { label: "Best Performing Section", value: weekly.insights.best_performing_section, iconColor: "text-zinc-200" },
                  { label: "Inactive Students Count", value: `${formatScore(weekly.insights.inactive_students_count)} Students`, iconColor: "text-rose-450" }
                ].map((insight, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-850 p-6 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{insight.label}</span>
                    <p className={`text-base font-bold mt-3 ${insight.iconColor}`}>{insight.value}</p>
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
          <div className="space-y-10 animate-fade-in">
            
            {/* Section 1: KPI Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { label: "Active Students (Month)", value: formatScore(monthly.active_students), desc: "Contest participants this month" },
                { label: "Problems Solved", value: formatScore(monthly.problems_solved), desc: "Solved in contests this month" },
                { label: "Average Rating Gain", value: formatRatingChange(monthly.average_rating_gain), desc: "Mean monthly progress", isSigned: true },
                { label: "Participation Rate", value: formatPercentage(monthly.participation_rate), desc: "Percent of department active" },
                { label: "Rating Growth", value: formatPercentage(monthly.growth_percentage), desc: "Monthly rating change delta" }
              ].map((kpi, idx) => (
                <div key={idx} className="bg-zinc-900 border border-zinc-800 p-6 rounded-xl flex flex-col justify-between hover:border-zinc-700 hover:bg-zinc-900/80 transition-all duration-300">
                  <span className={`text-4xl font-extrabold tracking-tight text-zinc-100 ${
                    kpi.isSigned && Math.round(Number(monthly.average_rating_gain)) > 0 ? "text-emerald-500" : ""
                  }`}>
                    {kpi.value}
                  </span>
                  <span className="text-xs font-bold text-zinc-400 mt-3">{kpi.label}</span>
                  <p className="text-[10px] text-zinc-500 mt-1 leading-normal">{kpi.desc}</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Monthly Top Performers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <Award size={16} className="text-zinc-450" />
                    Monthly Top Performers
                  </h3>
                  <span className="text-xs text-zinc-550">Highest rating gains this month</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 px-4 w-12">Rank</th>
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-right">Monthly Change</th>
                        <th className="py-3 px-4 text-right">Problems Solved Increase</th>
                        <th className="py-3 px-4 text-right">Monthly Contests</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {monthly.top_performers.map((student, idx) => {
                        const change = formatChange(student.rating_gain);
                        return (
                          <tr key={student.username} className="hover:bg-zinc-850/50 transition-all duration-200">
                            <td className="py-4 px-4 font-mono text-sm text-zinc-400">#{idx + 1}</td>
                            <td className="py-4 px-4">
                              <div className="text-sm font-semibold text-zinc-200">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className={`py-4 px-4 text-right font-mono font-semibold text-sm ${change.className}`}>{change.text}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-450">+{formatScore(student.problems_solved)}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-450">{formatScore(student.contests)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Underperformers Table */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <TrendingDown size={16} className="text-zinc-450" />
                    Monthly Underperformers
                  </h3>
                  <span className="text-xs text-zinc-550">Highest rating losses this month</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-850 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                        <th className="py-3 px-4">Student</th>
                        <th className="py-3 px-4 text-right">Rating Loss</th>
                        <th className="py-3 px-4 text-right">Contests Attended</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-850">
                      {monthly.underperformers.length > 0 ? (
                        monthly.underperformers.map(student => (
                          <tr key={student.username} className="hover:bg-zinc-850/50 transition-all duration-200">
                            <td className="py-4 px-4">
                              <div className="text-sm font-semibold text-zinc-200">{student.name}</div>
                              <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-semibold text-sm text-rose-500">{formatRatingChange(student.rating_loss)}</td>
                            <td className="py-4 px-4 text-right font-mono text-sm text-zinc-400">{formatScore(student.contest_activity)}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-8 text-center text-zinc-550 italic text-sm">
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
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-6">
              <h3 className="text-base md:text-lg font-bold text-zinc-300 border-b border-zinc-800 pb-4 flex items-center gap-2">
                <Calendar size={16} className="text-zinc-450" />
                Monthly Performance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {[
                  { label: "Avg Rating Increase", value: `+${formatRating(monthly.summary.average_rating_increase)} Points`, iconColor: "text-emerald-500" },
                  { label: "Total Contests Tracked", value: `${formatScore(monthly.summary.total_contests)} Contests`, iconColor: "text-zinc-200" },
                  { label: "Highest Turnout", value: formatPercentage(monthly.summary.highest_participation), iconColor: "text-zinc-200" },
                  { label: "Best Performing Section", value: monthly.summary.best_section, iconColor: "text-zinc-200" },
                  { label: "Consistency Score", value: `${formatScore(monthly.summary.consistency_score)}/100`, iconColor: "text-zinc-200" }
                ].map((item, idx) => (
                  <div key={idx} className="bg-zinc-950 border border-zinc-850 p-6 rounded-lg">
                    <span className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">{item.label}</span>
                    <p className={`text-base font-bold mt-3 ${item.iconColor}`}>{item.value}</p>
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
          <div className="space-y-10 animate-fade-in">
            
            {/* SECTION 1: Summary Counts */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: "Critical Priority", value: formatScore(watchlist.critical_count), borderClass: "border-rose-900/60 bg-rose-950/20 text-rose-400" },
                { label: "At Risk", value: formatScore(watchlist.at_risk_count), borderClass: "border-amber-900/60 bg-amber-950/25 text-amber-400" },
                { label: "Warning Alert", value: formatScore(watchlist.warning_count), borderClass: "border-zinc-800 bg-zinc-900/60 text-zinc-300" },
                { label: "Good Standing", value: formatScore(watchlist.good_count), borderClass: "border-emerald-950/50 bg-zinc-900/30 text-emerald-450" }
              ].map((c, idx) => (
                <div key={idx} className={`border p-6 rounded-xl flex items-center justify-between hover:border-zinc-700 transition-all duration-300 ${c.borderClass}`}>
                  <span className="text-sm font-bold uppercase tracking-wider">{c.label}</span>
                  <span className="text-3xl font-extrabold tracking-tight">{c.value}</span>
                </div>
              ))}
            </div>

            {/* SECTION 2: Student Watchlist Table */}
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
                <div>
                  <h3 className="text-base md:text-lg font-bold text-zinc-300 flex items-center gap-2">
                    <ShieldAlert size={16} className="text-zinc-450" />
                    Academic Intervention Watchlist
                  </h3>
                  <p className="text-[10px] text-zinc-500 mt-1">Status rules based on rating drops &amp; activity decay indicators</p>
                </div>
                <span className="text-xs text-zinc-555">Sorted by Severity</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-850 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4 text-right">Current Rating</th>
                      <th className="py-3 px-4 text-right">30D Change</th>
                      <th className="py-3 px-4 text-right">Problems Solved</th>
                      <th className="py-3 px-4 text-right">Contest Attendance</th>
                      <th className="py-3 px-4">Reason for Status</th>
                      <th className="py-3 px-4 text-center w-28">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-850">
                    {watchlist.students.map(student => {
                      const change = formatChange(student.rating_change_30d);
                      
                      let statusBadgeClass = "text-zinc-500 border-zinc-800 bg-zinc-950";
                      let rowIndicatorClass = "border-l-2 border-transparent";
                      
                      if (student.status === "Critical") {
                        statusBadgeClass = "text-rose-450 border-rose-950 bg-rose-950/20";
                        rowIndicatorClass = "border-l-2 border-rose-500";
                      } else if (student.status === "At Risk") {
                        statusBadgeClass = "text-amber-450 border-amber-950 bg-amber-950/20";
                        rowIndicatorClass = "border-l-2 border-amber-500";
                      } else if (student.status === "Warning") {
                        statusBadgeClass = "text-zinc-300 border-zinc-800 bg-zinc-900/60";
                        rowIndicatorClass = "border-l-2 border-zinc-700";
                      } else if (student.status === "Good") {
                        statusBadgeClass = "text-emerald-450 border-emerald-950 bg-emerald-950/20";
                        rowIndicatorClass = "border-l-2 border-emerald-500";
                      }

                      return (
                        <tr key={student.username} className={`hover:bg-zinc-850/50 transition-all duration-200 ${rowIndicatorClass}`}>
                          <td className="py-4 px-4">
                            <div className="text-sm font-semibold text-zinc-200">{student.name}</div>
                            <div className="text-[10px] text-zinc-500 font-mono mt-0.5">{student.roll_no} • @{student.username}</div>
                          </td>
                          <td className="py-4 px-4 text-right font-mono font-semibold text-sm text-zinc-200">{formatRating(student.current_rating)}</td>
                          <td className={`py-4 px-4 text-right font-mono font-semibold text-sm ${change.className}`}>{change.text}</td>
                          <td className="py-4 px-4 text-right font-mono text-sm text-zinc-400">+{formatScore(student.problems_solved)}</td>
                          <td className="py-4 px-4 text-right font-mono text-sm text-zinc-400">{student.contest_attendance}</td>
                          <td className="py-4 px-4 text-xs text-zinc-400 font-medium">{student.reason}</td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block px-3 py-1 rounded text-[10px] font-bold border ${statusBadgeClass}`}>
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

      </div>
    </DashboardLayout>
  );
}

export default AnalyticsPage;