import { Outlet } from 'react-router-dom';
import Navbar from '../components/public/Navbar.jsx';
import Footer from '../components/public/Footer.jsx';

function RootLayout() {
  return (
    <div className="min-h-svh flex flex-col selection:bg-emerald-500/20 selection:text-emerald-300">
      {/* Public Sticky Navigation */}
      <Navbar />

      {/* Main Content Area (padding-top offsets sticky header) */}
      <div className="flex-1 flex flex-col pt-16 sm:pt-18">
        <Outlet />
      </div>

      {/* Dynamic Public Footer */}
      <Footer />
    </div>
  );
}

export default RootLayout;

