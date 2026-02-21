// Admin Panel Layout Component
import { ReactNode, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Building2,
  Package,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronDown,
  Boxes,
  Store,
  FileCheck,
  DollarSign,
  ShoppingBag
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function AdminLayout({ children, title = 'Admin Panel' }: AdminLayoutProps) {
  const { data: session } = useSession();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/admin/login' });
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/admin/dashboard',
      active: router.pathname === '/admin/dashboard'
    },
    {
      title: 'Tenants',
      icon: Building2,
      href: '/admin/tenants',
      active: router.pathname.startsWith('/admin/tenants')
    },
    {
      title: 'Modules',
      icon: Boxes,
      href: '/admin/modules',
      active: router.pathname === '/admin/modules'
    },
    {
      title: 'Analytics',
      icon: BarChart3,
      href: '/admin/analytics',
      active: router.pathname === '/admin/analytics'
    },
    {
      title: 'Business Types',
      icon: ShoppingBag,
      href: '/admin/business-types',
      active: router.pathname === '/admin/business-types'
    },
    {
      title: 'Partners',
      icon: Users,
      href: '/admin/partners',
      active: router.pathname === '/admin/partners'
    },
    {
      title: 'Outlets',
      icon: Store,
      href: '/admin/outlets',
      active: router.pathname === '/admin/outlets'
    },
    {
      title: 'Activations',
      icon: FileCheck,
      href: '/admin/activations',
      active: router.pathname === '/admin/activations'
    },
    {
      title: 'Transactions',
      icon: DollarSign,
      href: '/admin/transactions',
      active: router.pathname === '/admin/transactions'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 fixed w-full z-30 top-0">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              >
                {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              
              <div className="flex items-center ml-4 lg:ml-0">
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                    BEDAGANG
                  </h1>
                </div>
                <div className="hidden md:block ml-4">
                  <span className="text-sm text-gray-500 font-medium">Admin Panel</span>
                </div>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-3">
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">{session?.user?.name || 'Admin'}</p>
                  <p className="text-xs text-gray-500">{session?.user?.role}</p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                  {session?.user?.name?.charAt(0) || 'A'}
                </div>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-16 h-full bg-white border-r border-gray-200 transition-all duration-300 z-20 ${
          sidebarOpen ? 'w-64' : 'w-0 lg:w-20'
        }`}
      >
        <nav className="h-full overflow-y-auto py-4">
          <div className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-all ${
                    item.active
                      ? 'bg-blue-50 text-blue-600 font-medium'
                      : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`h-5 w-5 flex-shrink-0 ${item.active ? 'text-blue-600' : 'text-gray-400'}`} />
                  {sidebarOpen && <span className="text-sm">{item.title}</span>}
                </Link>
              );
            })}
          </div>
        </nav>
      </aside>

      {/* Main Content - Full Width */}
      <main
        className={`pt-16 transition-all duration-300 min-h-screen ${
          sidebarOpen ? 'lg:pl-64' : 'lg:pl-20'
        }`}
      >
        <div className="p-4 sm:p-6 lg:p-8 w-full">
          <div className="w-full">
            {children}
          </div>
        </div>
      </main>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
