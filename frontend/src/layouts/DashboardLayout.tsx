import Sidebar from "../components/Sidebar";

type Props = {
  children: React.ReactNode;
};

function DashboardLayout({ children }: Props) {
  return (
    <div className="flex min-h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-orange-500/20 selection:text-orange-400">
      {/* Background radial effects */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />
      <div className="fixed top-0 left-64 right-0 h-[500px] bg-gradient-to-b from-orange-500/[0.02] via-transparent to-transparent blur-3xl pointer-events-none" />

      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 relative">
        <main className="flex-1 p-8 max-w-7xl w-full mx-auto relative z-10">
          {children}
        </main>
      </div>
    </div>
  );
}

export default DashboardLayout;