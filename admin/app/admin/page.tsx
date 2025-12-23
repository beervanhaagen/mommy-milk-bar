import { Users, TrendingUp, BarChart3, Star, MessageSquare, Target } from 'lucide-react';
import { HeroStatTile } from '@/components/dashboard/HeroStatTile';
import { CockpitGuidance } from '@/components/dashboard/CockpitGuidance';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';
import { calculateKPIs } from '@/lib/kpi/calculator';
import { evaluateGuidance } from '@/lib/guidance/rules';
import { createClient } from '@/lib/supabase/server';
import { formatPercent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  // Calculate KPIs
  const kpis = await calculateKPIs();
  const guidance = evaluateGuidance(kpis);

  // Get at-risk assumptions
  const supabase = await createClient();
  const { data: atRiskAssumptions } = await supabase
    .from('assumptions')
    .select('*')
    .in('risk', ['critical', 'high'])
    .in('status', ['untested', 'invalidated'])
    .order('risk', { ascending: false })
    .limit(5);

  // Get running experiments
  const { data: runningExperiments } = await supabase
    .from('experiments')
    .select('*')
    .eq('status', 'running')
    .limit(5);

  // Get active OKRs
  const { data: activeOKRs } = await supabase
    .from('okrs')
    .select(`
      *,
      krs (*)
    `)
    .eq('status', 'active')
    .limit(3);

  // Determine status based on thresholds
  const getActivationStatus = () => {
    if (kpis.activation_rate >= 70) return 'good';
    if (kpis.activation_rate >= 60) return 'warning';
    return 'danger';
  };

  const getRetentionStatus = (rate: number) => {
    if (rate >= 20) return 'good';
    if (rate >= 10) return 'warning';
    return 'danger';
  };

  const getRatingStatus = () => {
    if (kpis.rating_avg >= 4.5) return 'good';
    if (kpis.rating_avg >= 4.2) return 'warning';
    return 'danger';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display font-bold text-cockpit-text-primary mb-2">
          Dashboard
        </h1>
        <p className="text-cockpit-text-secondary">
          MMB Cockpit • Real-time product metrics en guidance
        </p>
      </div>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <HeroStatTile
          label="Total Installs"
          value={kpis.installs}
          icon={Users}
          status="good"
        />
        <HeroStatTile
          label="Activation Rate"
          value={formatPercent(kpis.activation_rate)}
          icon={TrendingUp}
          status={getActivationStatus()}
        />
        <HeroStatTile
          label="D1 Retention"
          value={formatPercent(kpis.d1_retention)}
          icon={BarChart3}
          status={getRetentionStatus(kpis.d1_retention)}
        />
        <HeroStatTile
          label="D7 Retention"
          value={formatPercent(kpis.d7_retention)}
          icon={BarChart3}
          status={getRetentionStatus(kpis.d7_retention)}
        />
        <HeroStatTile
          label="Reviews"
          value={kpis.reviews_count}
          icon={MessageSquare}
          status={kpis.reviews_count >= 10 ? 'good' : 'warning'}
        />
        <HeroStatTile
          label="Avg Rating"
          value={kpis.rating_avg.toFixed(1)}
          icon={Star}
          status={getRatingStatus()}
          suffix="/5"
        />
      </div>

      {/* Cockpit Guidance */}
      <div>
        <h2 className="text-xl font-semibold text-cockpit-text-primary mb-4 flex items-center gap-2">
          <Target className="h-5 w-5 text-cockpit-accent-pink" />
          Cockpit Guidance
        </h2>
        <CockpitGuidance guidance={guidance} />
      </div>

      {/* Grid Layout for Additional Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* At-Risk Assumptions */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-cockpit-text-primary mb-4">
            At-Risk Assumptions
          </h3>
          {atRiskAssumptions && atRiskAssumptions.length > 0 ? (
            <div className="space-y-3">
              {atRiskAssumptions.map((assumption) => (
                <div
                  key={assumption.id}
                  className="flex items-start justify-between p-3 rounded-lg bg-cockpit-surface/50 border border-cockpit-border"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="outline" className="text-xs">
                        {assumption.code}
                      </Badge>
                      <Badge
                        variant={assumption.risk === 'critical' ? 'error' : 'warning'}
                        className="text-xs"
                      >
                        {assumption.risk}
                      </Badge>
                    </div>
                    <p className="text-sm text-cockpit-text-primary font-medium">
                      {assumption.title}
                    </p>
                    <p className="text-xs text-cockpit-text-tertiary mt-1">
                      {assumption.category} • {assumption.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-cockpit-text-secondary">
              Geen at-risk assumptions op dit moment
            </p>
          )}
        </GlassCard>

        {/* Running Experiments */}
        <GlassCard className="p-6">
          <h3 className="text-lg font-semibold text-cockpit-text-primary mb-4">
            Running Experiments
          </h3>
          {runningExperiments && runningExperiments.length > 0 ? (
            <div className="space-y-3">
              {runningExperiments.map((experiment) => (
                <div
                  key={experiment.id}
                  className="p-3 rounded-lg bg-cockpit-surface/50 border border-cockpit-border"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="success" className="text-xs">
                      Running
                    </Badge>
                    {experiment.assumption_codes?.map((code: string) => (
                      <Badge key={code} variant="outline" className="text-xs">
                        {code}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-sm text-cockpit-text-primary font-medium">
                    {experiment.name}
                  </p>
                  <p className="text-xs text-cockpit-text-tertiary mt-1">
                    {experiment.method} • {experiment.metric_primary}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-cockpit-text-secondary">
              Geen actieve experimenten
            </p>
          )}
        </GlassCard>
      </div>

      {/* OKR Progress */}
      {activeOKRs && activeOKRs.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-cockpit-text-primary mb-4">
            Active OKRs
          </h2>
          <div className="grid grid-cols-1 gap-4">
            {activeOKRs.map((okr: any) => (
              <GlassCard key={okr.id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="success" className="mb-2">
                      {okr.period}
                    </Badge>
                    <h3 className="text-lg font-semibold text-cockpit-text-primary">
                      {okr.objective}
                    </h3>
                  </div>
                </div>
                {okr.krs && okr.krs.length > 0 && (
                  <div className="space-y-3">
                    {okr.krs.map((kr: any) => {
                      const progress = (kr.current / kr.target) * 100;
                      return (
                        <div key={kr.id}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm text-cockpit-text-primary">
                              {kr.name}
                            </span>
                            <span className="text-sm text-cockpit-text-secondary">
                              {kr.current} / {kr.target} {kr.unit}
                            </span>
                          </div>
                          <div className="w-full bg-cockpit-surface rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-cockpit-accent-berry to-cockpit-accent-pink h-2 rounded-full transition-all"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </GlassCard>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
