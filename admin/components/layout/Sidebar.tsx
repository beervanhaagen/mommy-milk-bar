'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Target,
  FlaskConical,
  Crosshair,
  Calendar,
  Settings,
} from 'lucide-react';

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard,
  },
  {
    name: 'Assumptions',
    href: '/admin/assumptions',
    icon: Target,
  },
  {
    name: 'Experiments',
    href: '/admin/experiments',
    icon: FlaskConical,
  },
  {
    name: 'OKRs',
    href: '/admin/okrs',
    icon: Crosshair,
  },
  {
    name: 'Weekly Review',
    href: '/admin/weekly-review',
    icon: Calendar,
  },
  {
    name: 'Settings',
    href: '/admin/settings',
    icon: Settings,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 border-r border-cockpit-border bg-cockpit-surface/30">
      <nav className="flex flex-col gap-2 p-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-all',
                isActive
                  ? 'bg-cockpit-accent-berry/20 text-cockpit-accent-pink shadow-glow'
                  : 'text-cockpit-text-secondary hover:bg-cockpit-surface hover:text-cockpit-text-primary'
              )}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
