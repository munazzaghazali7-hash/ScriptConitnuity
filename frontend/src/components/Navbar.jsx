import { Link, useLocation } from 'react-router-dom';
import { Film } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const isHome = location.pathname === '/';

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
      <div className="container-main">
        <nav className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 text-text-primary hover:text-accent transition-colors outline-none"
          >
            <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center border border-white/20">
              <Film size={18} className="text-accent" />
            </div>
            <span className="text-lg font-mono font-medium tracking-tight">
              ContinuityAgent
            </span>
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {isHome && (
              <a
                href="#faq"
                className="hidden md:block text-sm font-mono text-text-secondary hover:text-text-primary transition-colors"
              >
                FAQ
              </a>
            )}
            <Link
              to="/upload?demo=true"
              className="text-sm font-mono text-text-secondary hover:text-text-primary transition-colors px-3 py-2"
            >
              Demo
            </Link>
            <Link to="/upload" className="btn-primary !py-1.5 !px-4">
              Start Building
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
