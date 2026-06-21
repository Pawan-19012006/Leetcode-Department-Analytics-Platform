import { NavLink } from "react-router-dom";
import { LayoutDashboard, Award, Trophy, RefreshCw } from "lucide-react";

function Sidebar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
      isActive
        ? "bg-orange-500/10 text-orange-500 border border-orange-500/20 shadow-[0_0_12px_rgba(234,88,12,0.1)]"
        : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent"
    }`;

  return (
    <aside className="w-64 bg-zinc-950 border-r border-zinc-900 text-white flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-zinc-900 flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center font-bold text-white shadow-lg shadow-orange-500/20">
          L
        </div>
        <div>
          <h1 className="font-bold text-base leading-none tracking-tight">CSBS LeetTracker</h1>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1.5">
        <NavLink to="/" className={linkClass}>
          <LayoutDashboard size={18} />
          <span>Analytics Dashboard</span>
        </NavLink>

        <NavLink to="/contests" className={linkClass}>
          <Award size={18} />
          <span>Contest Dashboard</span>
        </NavLink>

        <NavLink to="/rankings" className={linkClass}>
          <Trophy size={18} />
          <span>Department Standings</span>
        </NavLink>

        <NavLink to="/sync" className={linkClass}>
          <RefreshCw size={18} />
          <span>Sync Center</span>
        </NavLink>
      </nav>
    </aside>
  );
}

export default Sidebar;