'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Warehouse, 
  Package, 
  ArrowLeftRight, 
  ClipboardList, 
  CookingPot,
  TrendingUp,
  CheckCircle,
  LogOut,
  User as UserIcon
} from 'lucide-react';
import styles from './Sidebar.module.css';

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/' },
  { icon: Warehouse, label: 'Bodegas', href: '/warehouses' },
  { icon: Package, label: 'Productos', href: '/products' },
  { icon: ArrowLeftRight, label: 'Movimientos', href: '/movements' },
  { icon: CookingPot, label: 'Recetas', href: '/recipes' },
  { icon: ClipboardList, label: 'Inventario', href: '/inventory' },
  { icon: CheckCircle, label: 'Toma Invent.', href: '/inventory-count' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  // Hide sidebar on login page
  if (pathname === '/auth/login') return null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logo}>
        <TrendingUp className={styles.logoIcon} />
        <span>WMS Pro</span>
      </div>

      <nav className={styles.nav}>
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href} 
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className={styles.footer}>
        {session?.user && (
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              <UserIcon size={18} />
            </div>
            <div className={styles.userDetails}>
              <span className={styles.userName}>{session.user.name || 'Usuario'}</span>
              <span className={styles.userRole}>{(session.user as { role?: string }).role || 'Staff'}</span>
            </div>
          </div>
        )}
        <button 
          onClick={() => signOut({ callbackUrl: '/auth/login' })} 
          className={styles.logoutBtn}
        >
          <LogOut size={20} />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
