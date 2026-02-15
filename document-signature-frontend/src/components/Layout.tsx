import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FileSignature, LogOut, LayoutDashboard, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-surface-50">
      {/* Header */}
      <header className="bg-white border-b border-surface-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <FileSignature className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900">DocSign</span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-6">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-surface-600 hover:text-primary-600 transition-colors text-sm font-medium"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            </nav>

            {/* User Menu (Desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <div className="text-sm">
                <p className="font-medium text-surface-900">{user?.name}</p>
                <p className="text-surface-500 text-xs">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-surface-500 hover:text-red-600 transition-colors text-sm"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden p-2 text-surface-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-surface-200 bg-white pb-4">
            <div className="px-4 py-3 space-y-3">
              <Link
                to="/dashboard"
                className="flex items-center gap-2 text-surface-700 hover:text-primary-600 py-2"
                onClick={() => setMobileMenuOpen(false)}
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <div className="border-t border-surface-200 pt-3">
                <p className="text-sm font-medium text-surface-900">{user?.name}</p>
                <p className="text-xs text-surface-500">{user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 text-red-600 text-sm font-medium py-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
}
