import { Link } from "react-router-dom";

function Sidebar() {

  return (

    <div className="w-64 bg-slate-900 text-white h-screen">

      <div className="p-6 text-2xl font-bold border-b border-slate-700">

        LeetTracker

      </div>

      <nav className="p-4 space-y-3">

        <Link
          to="/"
          className="block px-4 py-3 rounded-lg hover:bg-slate-800"
        >
          Analytics
        </Link>

        <Link
          to="/contests"
          className="block px-4 py-3 rounded-lg hover:bg-slate-800"
        >
          Contests
        </Link>

      </nav>

    </div>

  );
}

export default Sidebar;