import Navbar from '@/components/Dashboard/NavBar';
import Sidebar from '@/components/Dashboard/Sidebar';


export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <Navbar />
      <div className="flex">
        <Sidebar />
        {children}
      </div>

    </div>
  );
}
