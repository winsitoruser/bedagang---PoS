import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useEffect } from 'react';
import { 
  Settings, Store, Users, Shield, Bell, HardDrive, Database,
  CreditCard, MessageSquare, Mail, ChefHat, Package, ChevronRight,
  Zap, Building2
} from 'lucide-react';

interface SettingItem {
  title: string;
  description: string;
  href: string;
  icon: any;
  color: string;
  bgColor: string;
}

const settingsGroups = [
  {
    title: 'Bisnis',
    items: [
      {
        title: 'Pengaturan Toko',
        description: 'Nama toko, alamat, pajak, dan pengaturan umum',
        href: '/settings/store',
        icon: Store,
        color: 'text-blue-600',
        bgColor: 'bg-blue-50'
      },
      {
        title: 'Cabang / Outlet',
        description: 'Kelola cabang dan outlet bisnis Anda',
        href: '/settings/store/branches',
        icon: Building2,
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50'
      }
    ]
  },
  {
    title: 'Integrasi',
    items: [
      {
        title: 'Payment Gateway & API',
        description: 'Midtrans, Xendit, WhatsApp, Email SMTP',
        href: '/settings/integrations',
        icon: Zap,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      },
      {
        title: 'Hardware',
        description: 'Printer, barcode scanner, cash drawer',
        href: '/settings/hardware',
        icon: HardDrive,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100'
      }
    ]
  },
  {
    title: 'Operasional',
    items: [
      {
        title: 'Resep & Produksi',
        description: 'Kelola resep dan bahan baku',
        href: '/settings/recipes',
        icon: ChefHat,
        color: 'text-amber-600',
        bgColor: 'bg-amber-50'
      },
      {
        title: 'Inventori',
        description: 'Pengaturan stok dan notifikasi',
        href: '/settings/inventory',
        icon: Package,
        color: 'text-emerald-600',
        bgColor: 'bg-emerald-50'
      }
    ]
  },
  {
    title: 'Pengguna & Keamanan',
    items: [
      {
        title: 'Pengguna & Role',
        description: 'Kelola akses pengguna dan hak akses',
        href: '/settings/users',
        icon: Users,
        color: 'text-violet-600',
        bgColor: 'bg-violet-50'
      },
      {
        title: 'Keamanan',
        description: 'Password, 2FA, dan keamanan akun',
        href: '/settings/security',
        icon: Shield,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      }
    ]
  },
  {
    title: 'Sistem',
    items: [
      {
        title: 'Notifikasi',
        description: 'Pengaturan notifikasi dan alert',
        href: '/settings/notifications',
        icon: Bell,
        color: 'text-pink-600',
        bgColor: 'bg-pink-50'
      },
      {
        title: 'Backup & Restore',
        description: 'Backup data dan restore sistem',
        href: '/settings/backup',
        icon: Database,
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50'
      }
    ]
  }
];

export default function SettingsIndex() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    }
  }, [status, router]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-2 text-gray-600">Memuat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Pengaturan - Bedagang POS</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white shadow-sm border-b sticky top-0 z-10">
          <div className="max-w-5xl mx-auto px-4 py-5">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-gradient-to-br from-gray-700 to-gray-900 rounded-xl">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">Pengaturan</h1>
                <p className="text-sm text-gray-500">Kelola pengaturan bisnis dan sistem Anda</p>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-5xl mx-auto px-4 py-6">
          <div className="space-y-8">
            {settingsGroups.map((group) => (
              <div key={group.title}>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">
                  {group.title}
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {group.items.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="bg-white rounded-xl border p-5 hover:shadow-lg hover:border-gray-300 transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className={`p-3 rounded-xl ${item.bgColor}`}>
                          <item.icon className={`w-6 h-6 ${item.color}`} />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 group-hover:text-blue-600 transition-colors">
                            {item.title}
                          </h3>
                          <p className="text-sm text-gray-500 mt-1">{item.description}</p>
                        </div>
                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Access - Integrations */}
          <div className="mt-10 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold">Integrasi Penting</h3>
                <p className="text-blue-100 mt-1">Hubungkan Payment Gateway, WhatsApp, dan Email untuk notifikasi otomatis</p>
              </div>
              <Link
                href="/settings/integrations"
                className="px-5 py-2.5 bg-white text-blue-600 rounded-lg font-medium hover:bg-blue-50 transition-colors flex items-center gap-2"
              >
                <Zap size={18} />
                Kelola Integrasi
              </Link>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-4">
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <CreditCard className="w-8 h-8 text-blue-200 mb-2" />
                <h4 className="font-semibold">Payment Gateway</h4>
                <p className="text-sm text-blue-200">Midtrans, Xendit</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <MessageSquare className="w-8 h-8 text-green-200 mb-2" />
                <h4 className="font-semibold">WhatsApp</h4>
                <p className="text-sm text-blue-200">Twilio, Wablas, Fonnte</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 backdrop-blur">
                <Mail className="w-8 h-8 text-purple-200 mb-2" />
                <h4 className="font-semibold">Email SMTP</h4>
                <p className="text-sm text-blue-200">Gmail, Mailgun, SendGrid</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
