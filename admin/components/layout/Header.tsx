'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

export function Header() {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-cockpit-border bg-cockpit-bg/95 backdrop-blur supports-[backdrop-filter]:bg-cockpit-bg/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="text-xl font-display font-bold text-cockpit-text-primary">
            MMB Cockpit
          </h1>
          <div className="h-4 w-px bg-cockpit-border" />
          <p className="text-sm text-cockpit-text-secondary">
            Premium Control Room
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-cockpit-status-success animate-pulse" />
            <span className="text-xs text-cockpit-text-tertiary">Live</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="text-cockpit-text-secondary hover:text-cockpit-text-primary"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Uitloggen
          </Button>
        </div>
      </div>
    </header>
  );
}
