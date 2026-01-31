import { useState } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Store, 
  Users, 
  Settings, 
  LogOut, 
  ShieldAlert,
  Activity,
  Menu,
  X
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useSuperAdmin } from '../contexts/SuperAdminContext';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Visão Global', path: '/admin/super' },
  { icon: Store, label: 'Gerenciar Lojas', path: '/admin/super/stores' },
  { icon: Users, label: 'Usuários', path: '/admin/super/users' },
  { icon: Activity, label: 'Logs do Sistema', path: '/admin/super/logs' },
  { icon: Settings, label: 'Configurações Globais', path: '/admin/super/settings' },
];

export default function SuperAdminLayout() {
  const { isAuthenticated, logout } = useSuperAdmin();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar - Dark Theme for Admin Distinction */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-300 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col shadow-xl",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 font-bold text-xl text-white">
            <ShieldAlert className="h-6 w-6 text-indigo-500" />
            <span>Super Admin</span>
          </div>
          <button 
            className="ml-auto lg:hidden text-slate-400"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 mt-2">
            Plataforma
          </p>
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-900/20" 
                    : "hover:bg-slate-800 hover:text-white"
                )}
              >
                <item.icon className={cn("h-5 w-5", isActive ? "text-white" : "text-slate-400")} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-9 w-9 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold shadow-lg">
              SA
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">Super Admin</p>
              <p className="text-xs text-slate-500 truncate">joaovicrengel@gmail.com</p>
            </div>
          </div>
          <button 
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 hover:text-red-300 rounded-md transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Encerrar Sessão
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 justify-between shadow-sm z-10">
          <button 
            className="lg:hidden p-2 -ml-2 text-slate-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="ml-auto flex items-center gap-4">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full border border-indigo-100">
              AMBIENTE DE ALTA SEGURANÇA
            </span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
