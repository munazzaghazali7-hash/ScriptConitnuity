import { Link, useLocation } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-transparent">
      <div className="container-main">
        <nav className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-3 text-platinum hover:text-white transition-colors outline-none"
          >
            <div className="w-8 h-8 flex items-center justify-center">
              <Film size={20} className="text-white" />
            </div>
            <span className="text-[16px] font-medium tracking-wide uppercase">
              SCRIPTCONTINUITY
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-6">
            {isHome && (
              <a
                href="#how-it-works"
                className="btn-ghost hidden md:block"
              >
                Features
              </a>
            )}
            <Link
              to="/upload?demo=true"
              className="btn-ghost hidden md:block"
            >
              Demo
            </Link>
            <Link to="/upload" className="btn-primary">
              Launch App
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
