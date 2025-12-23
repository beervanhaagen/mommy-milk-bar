import { GlassCard } from '@/components/ui/glass-card';

export default function SettingsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-cockpit-text-primary mb-2">
          Settings
        </h1>
        <p className="text-cockpit-text-secondary">
          Admin panel settings and configuration
        </p>
      </div>

      <GlassCard className="p-12 text-center">
        <p className="text-cockpit-text-secondary">
          Settings feature coming soon
        </p>
      </GlassCard>
    </div>
  );
}
