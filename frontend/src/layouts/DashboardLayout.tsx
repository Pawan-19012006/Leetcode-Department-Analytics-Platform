import Sidebar from "../components/Sidebar";

type Props = {

  children: React.ReactNode;

};

function DashboardLayout({

  children

}: Props) {

  return (

    <div className="flex min-h-screen bg-slate-950">

      <Sidebar />

      <main className="flex-1 p-8">

        {children}

      </main>

    </div>

  );
}

export default DashboardLayout;