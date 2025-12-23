import { GlassCard } from '@/components/ui/glass-card';

export default function WeeklyReviewPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-cockpit-text-primary mb-2">
          Weekly Review
        </h1>
        <p className="text-cockpit-text-secondary">
          Weekly reflection and planning
        </p>
      </div>

      <GlassCard className="p-12 text-center">
        <p className="text-cockpit-text-secondary">
          Weekly review feature coming soon
        </p>
      </GlassCard>
    </div>
  );
}
