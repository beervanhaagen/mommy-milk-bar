import { createClient } from '@/lib/supabase/server';
import { GlassCard } from '@/components/ui/glass-card';

export const dynamic = 'force-dynamic';

export default async function ExperimentsPage() {
  const supabase = await createClient();

  const { data: experiments } = await supabase
    .from('experiments')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-cockpit-text-primary mb-2">
          Experiments
        </h1>
        <p className="text-cockpit-text-secondary">
          Tests to validate assumptions
        </p>
      </div>

      <GlassCard className="p-12 text-center">
        <p className="text-cockpit-text-secondary">
          Experiments feature coming soon. Full CRUD in volgende iteratie.
        </p>
        {experiments && experiments.length > 0 && (
          <p className="text-sm text-cockpit-text-tertiary mt-2">
            {experiments.length} experiment(s) gevonden in database
          </p>
        )}
      </GlassCard>
    </div>
  );
}
