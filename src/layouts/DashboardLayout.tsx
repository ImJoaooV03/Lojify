import { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Store,
  BarChart3,
  Package,
  Palette,
  TicketPercent,
  Tags,
  Star
} from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from '../components/ui/Button';
import { useAuth } from '../contexts/AuthContext';

const sidebarItems = [
  { icon: LayoutDashboard, label: 'Visão Geral', path: '/dashboard' },
  { icon: Package, label: 'Pedidos', path: '/dashboard/orders' },
  { icon: ShoppingBag, label: 'Produtos', path: '/dashboard/products' },
  { icon: Tags, label: 'Categorias', path: '/dashboard/categories' },
  { icon: Users, label: 'Clientes', path: '/dashboard/customers' },
  { icon: TicketPercent, label: 'Cupons', path: '/dashboard/coupons' },
  { icon: Star, label: 'Avaliações', path: '/dashboard/reviews' },
  { icon: BarChart3, label: 'Relatórios', path: '/dashboard/reports' },
  { icon: Palette, label: 'Minha Loja', path: '/dashboard/store' },
  { icon: Settings, label: 'Configurações', path: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const { store, profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:transform-none flex flex-col",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl text-indigo-600">
            <Store className="h-6 w-6" />
            <span>Lojify</span>
          </Link>
          <button 
            className="ml-auto lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          >
            <X className="h-6 w-6 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-indigo-50 text-indigo-600" 
                    : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                )}
              >
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold overflow-hidden">
              {store?.logo_url ? (
                <img src={store.logo_url} alt="Logo" className="h-full w-full object-cover" />
              ) : (
                profile?.full_name?.charAt(0) || 'U'
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-gray-900 truncate">{store?.name || 'Carregando...'}</p>
              <p className="text-xs text-gray-500 truncate">{profile?.email}</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
            onClick={signOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-8 justify-between lg:justify-end">
          <button 
            className="lg:hidden p-2 -ml-2 text-gray-600"
            onClick={() => setIsSidebarOpen(true)}
          >
            <Menu className="h-6 w-6" />
          </button>
          
          <div className="flex items-center gap-4">
            {store && (
              <Link to={`/s/${store.slug}`} target="_blank">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  Ver minha loja
                </Button>
              </Link>
            )}
            <Link to="/dashboard/products/new">
              <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                Criar Produto
              </Button>
            </Link>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
