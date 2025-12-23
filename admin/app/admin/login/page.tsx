'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GlassCard } from '@/components/ui/glass-card';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard');
      router.refresh();
    }
  };

  return (
    <div className="min-h-screen bg-cockpit-bg flex items-center justify-center p-4">
      <GlassCard className="w-full max-w-md" glow>
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-display font-bold text-cockpit-text-primary mb-2">
            MMB Cockpit
          </h1>
          <p className="text-cockpit-text-secondary text-sm">
            Admin panel voor Mommy Milk Bar
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-cockpit-text-secondary text-sm mb-2 block">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-cockpit-surface border-cockpit-border text-cockpit-text-primary"
              placeholder="info@mommymilkbar.nl"
              required
            />
          </div>

          <div>
            <Label htmlFor="password" className="text-cockpit-text-secondary text-sm mb-2 block">
              Wachtwoord
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-cockpit-surface border-cockpit-border text-cockpit-text-primary"
              required
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-cockpit-status-error/10 border border-cockpit-status-error/30">
              <p className="text-sm text-cockpit-status-error">{error}</p>
            </div>
          )}

          <Button
            type="submit"
            disabled={loading}
            variant="cockpit"
            className="w-full"
          >
            {loading ? 'Inloggen...' : 'Log in'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-cockpit-border">
          <p className="text-xs text-cockpit-text-tertiary text-center">
            Premium admin panel • Dark cockpit theme
          </p>
        </div>
      </GlassCard>
    </div>
  );
}
