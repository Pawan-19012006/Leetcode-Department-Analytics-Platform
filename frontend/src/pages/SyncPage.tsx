import { useEffect, useState, useRef } from "react";
import {
  RefreshCw,
  UserPlus,
  Terminal as TerminalIcon,
  CheckCircle,
  XCircle,
  Database,
  Info,
  AlertTriangle,
} from "lucide-react";
import DashboardLayout from "../layouts/DashboardLayout";
import {
  fetchAndAggregateAllData,
  getStudentsWithStats,
  syncStudentProfile,
  syncAllStudents,
  createStudent,
  clearCache,
} from "../services/dataService";
import type { StudentWithStats } from "../services/dataService";

interface LogEntry {
  timestamp: string;
  type: "info" | "success" | "error";
  message: string;
}

function SyncPage() {
  const [students, setStudents] = useState<StudentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingSingle, setSyncingSingle] = useState(false);
  const [selectedUsername, setSelectedUsername] = useState("");

  // Sync Status and Outcome state
  const [syncStats, setSyncStats] = useState<{
    total_students: number;
    successful: number;
    failed: string[];
  } | null>(null);

  // Cooldown status state
  const [cooldownMessage, setCooldownMessage] = useState<string | null>(null);

  // Toast overlay state
  const [toast, setToast] = useState<{
    type: "success" | "warning" | "error";
    message: string;
  } | null>(null);

  // Registration Form State
  const [regName, setRegName] = useState("");
  const [regRoll, setRegRoll] = useState("");
  const [regUser, setRegUser] = useState("");
  const [regBatch, setRegBatch] = useState(new Date().getFullYear());
  const [regSection, setRegSection] = useState("A");
  const [regLoading, setRegLoading] = useState(false);
  const [regMessage, setRegMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);


  // Operations Logs
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      timestamp: new Date().toLocaleTimeString(),
      type: "info",
      message: "Sync console initialized. Ready for operations.",
    },
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  const addLog = (message: string, type: "info" | "success" | "error" = "info") => {
    setLogs((prev) => [
      ...prev,
      {
        timestamp: new Date().toLocaleTimeString(),
        type,
        message,
      },
    ]);
  };

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  const loadStudentsList = async () => {
    try {
      await fetchAndAggregateAllData();
      setStudents(getStudentsWithStats());
    } catch (err) {
      console.error(err);
      addLog("Failed to fetch students registry from database.", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentsList();
  }, []);

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setSyncStats(null);
    setCooldownMessage(null);
    addLog("Starting synchronization of all registered students...", "info");
    try {
      const res = await syncAllStudents();
      setSyncStats(res);
      addLog(
        `Sync-All completed. Total Students: ${res.total_students}, Successful: ${res.successful}, Failed: ${res.failed.length}`,
        "success"
      );
      if (res.failed.length > 0) {
        addLog(`Failed profiles: ${res.failed.join(", ")}`, "error");
      }
      clearCache();
      await loadStudentsList();

      setToast({ type: "success", message: "Department sync completed successfully." });
      setTimeout(() => setToast(null), 5000);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 429) {
        const msg = err.response?.data?.detail || "Sync is temporarily on cooldown. Please wait before syncing again.";
        setCooldownMessage(msg);
        addLog(`Sync Cooldown: ${msg}`, "info");
        setToast({
          type: "warning",
          message: "Sync is temporarily on cooldown. Please wait before syncing again."
        });
        setTimeout(() => setToast(null), 5000);
      } else {
        const errMsg = err.response?.data?.detail || err.message || "An unexpected error occurred.";
        addLog(`Sync-All failed: ${errMsg}`, "error");
        setToast({ type: "error", message: `Sync failed: ${errMsg}` });
        setTimeout(() => setToast(null), 5000);
      }
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncSingle = async () => {
    if (!selectedUsername) return;
    setSyncingSingle(true);
    setCooldownMessage(null);
    addLog(`Starting profile sync for student @${selectedUsername}...`, "info");
    try {
      const res = await syncStudentProfile(selectedUsername);
      addLog(
        `Profile @${selectedUsername} synced successfully. Snapshot ID: ${res.snapshot_id}`,
        "success"
      );
      clearCache();
      await loadStudentsList();

      setToast({ type: "success", message: `Sync completed for student @${selectedUsername}.` });
      setTimeout(() => setToast(null), 5000);
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 429) {
        const msg = err.response?.data?.detail || "Sync is temporarily on cooldown. Please wait before syncing again.";
        setCooldownMessage(msg);
        addLog(`Sync Cooldown: ${msg}`, "info");
        setToast({
          type: "warning",
          message: "Sync is temporarily on cooldown. Please wait before syncing again."
        });
        setTimeout(() => setToast(null), 5000);
      } else {
        const errMsg = err.response?.data?.detail || err.message || "An unexpected error occurred.";
        addLog(`Profile sync failed for @${selectedUsername}: ${errMsg}`, "error");
        setToast({ type: "error", message: `Sync failed: ${errMsg}` });
        setTimeout(() => setToast(null), 5000);
      }
    } finally {
      setSyncingSingle(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regRoll || !regUser) {
      setRegMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setRegLoading(true);
    setRegMessage(null);
    addLog(`Registering student: ${regName} (${regRoll}) with LeetCode @${regUser}...`, "info");

    try {
      const res = await createStudent({
        roll_no: regRoll.trim(),
        name: regName.trim(),
        batch: Number(regBatch),
        section: regSection.trim().toUpperCase(),
        leetcode_username: regUser.trim(),
      });

      setRegMessage({
        type: "success",
        text: `Successfully registered student. Student ID: ${res.student_id}`,
      });
      addLog(`Registered student ${regName} (${regRoll}) in database.`, "success");

      // Reset form
      setRegName("");
      setRegRoll("");
      setRegUser("");

      // Trigger automatic profile sync for the newly registered student
      addLog(`Auto-syncing snapshot for newly registered student @${regUser}...`, "info");
      await syncStudentProfile(regUser.trim());
      addLog(`Snapshot synced for newly registered student @${regUser}.`, "success");

      clearCache();
      await loadStudentsList();
    } catch (err: any) {
      console.error(err);
      const errorText = err.response?.data?.detail || err.message || "Failed to create student.";
      setRegMessage({
        type: "error",
        text: `Registration Failed: ${errorText}`,
      });
      addLog(`Failed to register student: ${errorText}`, "error");
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Sync Center</h1>
          <p className="text-sm text-zinc-300 mt-1">
            Initiate sync requests with LeetCode API, register new students, and check transaction logs.
          </p>
        </div>

        {/* Sync All Informational Banner */}
        {syncingAll && (
          <div className="bg-orange-500/10 border-l-4 border-orange-500 text-orange-400 p-5 rounded-r-xl flex items-start gap-3.5 animate-pulse">
            <Info className="shrink-0 mt-0.5" size={20} />
            <div>
              <h5 className="font-semibold text-zinc-150 text-base">Fetching data from LeetCode...</h5>
              <p className="text-sm text-zinc-300 mt-1">
                Fetching data from LeetCode. This may take several minutes depending on the number of students.
              </p>
            </div>
          </div>
        )}

        {/* Cooldown Warning Banner */}
        {cooldownMessage && (
          <div className="bg-amber-500/10 border-l-4 border-amber-500 text-amber-400 p-5 rounded-r-xl flex items-start gap-3.5">
            <AlertTriangle className="shrink-0 mt-0.5 text-amber-500" size={20} />
            <div>
              <h5 className="font-semibold text-zinc-150 text-base">Sync Cooldown Active</h5>
              <p className="text-sm text-zinc-300 mt-1">
                Sync is temporarily on cooldown. Please wait before syncing again.
              </p>
              <p className="text-sm font-mono text-amber-300 mt-2 bg-amber-950/20 border border-amber-900/30 px-3 py-1.5 rounded-lg w-fit">
                {cooldownMessage}
              </p>
            </div>
          </div>
        )}

        {/* Success summary card */}
        {syncStats && (
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 shadow-lg flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <CheckCircle size={18} className="text-emerald-500" />
              <h4 className="text-sm font-semibold text-white">Sync Summary Statistics</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-lg text-center">
                <span className="text-xs text-zinc-400 uppercase tracking-wider font-bold">Total Students</span>
                <h5 className="text-3xl font-extrabold text-white mt-1.5">{syncStats.total_students}</h5>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-lg text-center">
                <span className="text-xs text-emerald-400 uppercase tracking-wider font-bold">Successful Syncs</span>
                <h5 className="text-3xl font-extrabold text-emerald-400 mt-1.5">{syncStats.successful}</h5>
              </div>
              <div className="bg-zinc-900/20 border border-zinc-900 p-4 rounded-lg text-center">
                <span className="text-xs text-rose-400 uppercase tracking-wider font-bold">Failed Syncs</span>
                <h5 className="text-3xl font-extrabold text-rose-400 mt-1.5">{syncStats.failed.length}</h5>
              </div>
            </div>
            {syncStats.failed.length > 0 && (
              <div className="p-4 bg-rose-950/10 border border-rose-900/20 rounded-lg">
                <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">Failed Profiles:</span>
                <p className="text-sm text-zinc-300 mt-1 font-mono">{syncStats.failed.join(", ")}</p>
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Operations Panel */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Sync Triggers */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-6 flex flex-col gap-6 shadow-sm">
              <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
                <Database size={16} className="text-orange-500" />
                <h4 className="text-sm font-semibold text-white">LeetCode Sync Operations</h4>
              </div>

              {/* Sync All */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 bg-zinc-900/10 border border-zinc-900 rounded-lg">
                <div>
                  <h5 className="text-sm font-bold text-zinc-200">Sync Entire Department</h5>
                  <p className="text-xs text-zinc-400 mt-1">
                    Triggers backend data collection loops for all registered students.
                  </p>
                </div>
                <button
                  onClick={handleSyncAll}
                  disabled={loading || syncingAll || syncingSingle}
                  className="flex items-center justify-center gap-2 px-5 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-900 disabled:text-zinc-500 disabled:border-zinc-850 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                >
                  <RefreshCw size={13} className={syncingAll ? "animate-spin" : ""} />
                  <span>{syncingAll ? "Syncing Department..." : "Sync All Students"}</span>
                </button>
              </div>

              {/* Sync Single */}
              <div className="flex flex-col p-5 bg-zinc-900/10 border border-zinc-900 rounded-lg gap-4">
                <div>
                  <h5 className="text-sm font-bold text-zinc-200">Sync Individual Student</h5>
                  <p className="text-xs text-zinc-400 mt-1">
                    Syncs the latest profile data Snapshot for a single student.
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <select
                    value={selectedUsername}
                    onChange={(e) => setSelectedUsername(e.target.value)}
                    className="flex-1 bg-zinc-950 border border-zinc-900 text-zinc-300 text-sm font-semibold p-3 rounded-lg focus:outline-none focus:border-zinc-800 cursor-pointer"
                  >
                    <option value="">-- Select Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.leetcode_username}>
                        {s.name} ({s.roll_no}) - @{s.leetcode_username}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleSyncSingle}
                    disabled={loading || !selectedUsername || syncingAll || syncingSingle}
                    className="flex items-center justify-center gap-2 px-5 py-3 bg-zinc-900 border border-zinc-850 hover:bg-zinc-800 disabled:bg-zinc-950 disabled:border-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed text-zinc-200 text-xs font-bold rounded-lg transition-all active:scale-[0.98] cursor-pointer"
                  >
                    <RefreshCw size={13} className={syncingSingle ? "animate-spin" : ""} />
                    <span>{syncingSingle ? "Syncing Profile..." : "Sync Profile"}</span>
                  </button>
                </div>
              </div>
            </div>


            {/* Terminal Logs */}
            <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col flex-1 min-h-[300px]">
              <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <TerminalIcon size={16} className="text-zinc-500" />
                  <h4 className="text-sm font-semibold text-white">Activity Logs</h4>
                </div>
                <button
                  onClick={() =>
                    setLogs([
                      {
                        timestamp: new Date().toLocaleTimeString(),
                        type: "info",
                        message: "Console cleared.",
                      },
                    ])
                  }
                  className="text-[10px] text-zinc-500 hover:text-zinc-400 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Clear Console
                </button>
              </div>

              {/* Console Screen */}
              <div className="flex-1 bg-black border border-zinc-900 rounded-lg p-4 font-mono text-[11px] leading-relaxed overflow-y-auto h-64 flex flex-col gap-1.5 shadow-inner">
                {logs.map((log, idx) => (
                  <div
                    key={idx}
                    className={`flex items-start gap-2 ${
                      log.type === "success"
                        ? "text-emerald-400"
                        : log.type === "error"
                        ? "text-rose-400"
                        : "text-zinc-500"
                    }`}
                  >
                    <span className="text-[10px] text-zinc-600 font-semibold select-none">
                      [{log.timestamp}]
                    </span>
                    <span className="flex-1 whitespace-pre-wrap">{log.message}</span>
                  </div>
                ))}
                <div ref={terminalEndRef} />
              </div>
            </div>
          </div>

          {/* Registration Form */}
          <div className="bg-zinc-950 border border-zinc-900 rounded-xl p-5 flex flex-col gap-4 h-fit">
            <div className="flex items-center gap-2 border-b border-zinc-900 pb-3">
              <UserPlus size={16} className="text-orange-500" />
              <h4 className="text-sm font-semibold text-white">Register Student</h4>
            </div>

            <form onSubmit={handleRegister} className="flex flex-col gap-4 mt-2">
              {/* Full Name */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Full Name <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm p-3 rounded-lg focus:outline-none focus:border-zinc-700 font-medium"
                  required
                />
              </div>

              {/* Roll Number */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  Roll Number <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. 22CS034"
                  value={regRoll}
                  onChange={(e) => setRegRoll(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm p-3 rounded-lg focus:outline-none focus:border-zinc-700 font-mono"
                  required
                />
              </div>

              {/* LeetCode Username */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                  LeetCode Username <span className="text-orange-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. jdoe99"
                  value={regUser}
                  onChange={(e) => setRegUser(e.target.value)}
                  className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm p-3 rounded-lg focus:outline-none focus:border-zinc-700 font-mono"
                  required
                />
              </div>

              {/* Batch & Section */}
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Batch Year
                  </label>
                  <input
                    type="number"
                    value={regBatch}
                    onChange={(e) => setRegBatch(Number(e.target.value))}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm p-3 rounded-lg focus:outline-none focus:border-zinc-700"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-zinc-300 uppercase tracking-wider">
                    Section
                  </label>
                  <input
                    type="text"
                    value={regSection}
                    onChange={(e) => setRegSection(e.target.value)}
                    className="bg-zinc-900 border border-zinc-800 text-zinc-200 text-sm p-3 rounded-lg focus:outline-none focus:border-zinc-700 font-semibold"
                  />
                </div>
              </div>

              {regMessage && (
                <div
                  className={`p-3 rounded-lg border text-sm flex gap-2 items-start mt-2 ${
                    regMessage.type === "success"
                      ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                      : "bg-rose-500/10 border-rose-500/20 text-rose-400"
                  }`}
                >
                  <span className="shrink-0 mt-0.5">
                    {regMessage.type === "success" ? (
                      <CheckCircle size={14} />
                    ) : (
                      <XCircle size={14} />
                    )}
                  </span>
                  <span>{regMessage.text}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={regLoading || syncingAll || syncingSingle}
                className="w-full mt-2 py-3 bg-orange-600 hover:bg-orange-700 disabled:bg-zinc-900 disabled:text-zinc-655 disabled:border-zinc-900 disabled:cursor-not-allowed text-white text-sm font-bold rounded-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
              >
                {regLoading ? (
                  <RefreshCw size={14} className="animate-spin" />
                ) : (
                  <UserPlus size={14} />
                )}
                <span>{regLoading ? "Registering Student..." : "Register Student"}</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Floating success/warning/error toast overlay */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-lg border shadow-lg transition-all transform duration-300 animate-slide-in ${
          toast.type === "success"
            ? "bg-zinc-950/95 border-emerald-500/30 text-emerald-400"
            : toast.type === "warning"
            ? "bg-zinc-950/95 border-amber-500/30 text-amber-400"
            : "bg-zinc-950/95 border-red-500/30 text-red-400"
        }`}>
          {toast.type === "success" ? (
            <CheckCircle size={16} />
          ) : toast.type === "warning" ? (
            <AlertTriangle size={16} className="text-amber-400" />
          ) : (
            <XCircle size={16} />
          )}
          <span className="text-sm font-semibold text-zinc-100">{toast.message}</span>
        </div>
      )}
    </DashboardLayout>
  );
}

export default SyncPage;
