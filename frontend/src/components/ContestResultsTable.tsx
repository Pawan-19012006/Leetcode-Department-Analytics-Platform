import { Link } from "react-router-dom";
import { Trophy, TrendingUp, TrendingDown } from "lucide-react";

export interface ExtendedContestResult {
  rank: number | null; // local rank
  global_rank: number | null;
  student_name: string;
  roll_no: string;
  leetcode_username: string;
  problems_solved: number;
  total_problems: number;
  finish_time_seconds: number;
  rating_after: number;
  rating_change: number;
  status: "Attended" | "Not Attended";
  batch: number;
}

type Props = {
  results: ExtendedContestResult[];
};

function ContestResultsTable({ results }: Props) {
  const formatTime = (secs: number) => {
    if (secs <= 0) return "--:--";
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h > 0 ? `${h}h ` : ""}${m}m ${s}s`;
  };

  const getRankBadge = (rank: number | null) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <Trophy size={11} /> 1st
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-zinc-300/10 text-zinc-300 border border-zinc-400/20">
          <Trophy size={11} /> 2nd
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold bg-amber-700/10 text-amber-600 border border-amber-700/20">
          <Trophy size={11} /> 3rd
        </span>
      );
    }
    return rank ? `#${rank}` : "--";
  };

  return (
    <div className="overflow-hidden rounded-xl border border-zinc-900 bg-zinc-950">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-zinc-900 bg-zinc-900/20 text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              <th className="p-4 w-28">Dept Rank</th>
              <th className="p-4">Student</th>
              <th className="p-4 w-28">Roll No</th>
              <th className="p-4 w-24">Batch</th>
              <th className="p-4 text-center w-28">Solved</th>
              <th className="p-4 w-32">Contest Rank</th>
              <th className="p-4 w-28">Finish Time</th>
              <th className="p-4 w-28">Rating</th>
              <th className="p-4 w-28">Change</th>
              <th className="p-4 w-32">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-900/50 text-sm">
            {results.map((result) => {
              const isAbsent = result.status === "Not Attended";
              return (
                <tr
                  key={result.leetcode_username}
                  className={`transition-colors hover:bg-zinc-900/20 ${
                    isAbsent ? "text-zinc-500 opacity-60" : "text-zinc-200"
                  }`}
                >
                  {/* Dept Rank */}
                  <td className="p-4 font-semibold">{getRankBadge(result.rank)}</td>

                  {/* Student */}
                  <td className="p-4">
                    <div>
                      <Link
                        to={`/students/${result.leetcode_username}`}
                        className="font-semibold text-zinc-100 hover:text-orange-500 transition-colors block"
                      >
                        {result.student_name}
                      </Link>
                      <span className="text-xs text-zinc-500 font-mono">
                        @{result.leetcode_username}
                      </span>
                    </div>
                  </td>

                  {/* Roll Number */}
                  <td className="p-4 font-mono text-xs">{result.roll_no}</td>

                  {/* Batch */}
                  <td className="p-4 text-xs text-zinc-400">{result.batch}</td>

                  {/* Solved Count */}
                  <td className="p-4 text-center font-semibold">
                    {isAbsent ? (
                      <span className="text-zinc-600">-</span>
                    ) : (
                      <span
                        className={
                          result.problems_solved === result.total_problems
                            ? "text-emerald-500"
                            : "text-zinc-200"
                        }
                      >
                        {result.problems_solved} / {result.total_problems}
                      </span>
                    )}
                  </td>

                  {/* Global Rank */}
                  <td className="p-4 font-mono text-xs">
                    {isAbsent || !result.global_rank ? "--" : result.global_rank.toLocaleString()}
                  </td>

                  {/* Finish Time */}
                  <td className="p-4 text-xs">
                    {isAbsent ? "--" : formatTime(result.finish_time_seconds)}
                  </td>

                  {/* Rating After */}
                  <td className="p-4 font-semibold text-xs">
                    {result.rating_after ? Math.round(result.rating_after) : "1500"}
                  </td>

                  {/* Rating Change */}
                  <td className="p-4">
                    {isAbsent || result.rating_change === 0 ? (
                      <span className="text-zinc-600 text-xs">0</span>
                    ) : result.rating_change > 0 ? (
                      <span className="inline-flex items-center gap-0.5 text-xs text-emerald-400 font-bold">
                        <TrendingUp size={11} />+{result.rating_change.toFixed(0)}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-0.5 text-xs text-rose-400 font-bold">
                        <TrendingDown size={11} />
                        {result.rating_change.toFixed(0)}
                      </span>
                    )}
                  </td>

                  {/* Status Badge */}
                  <td className="p-4">
                    {isAbsent ? (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                        Absent
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        Present
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
            {results.length === 0 && (
              <tr>
                <td colSpan={10} className="p-8 text-center text-zinc-500 text-sm">
                  No records match the current filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ContestResultsTable;