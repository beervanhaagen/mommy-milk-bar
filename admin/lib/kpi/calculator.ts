import { createClient } from '@/lib/supabase/server';

export interface KPIData {
  installs: number;
  activation_rate: number;
  d1_retention: number;
  d7_retention: number;
  reviews_count: number;
  rating_avg: number;
}

export async function calculateKPIs(): Promise<KPIData> {
  const supabase = await createClient();

  // 1. Installs (total profiles)
  const { count: installs } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  // 2. Activation rate (completed onboarding)
  const { count: activated } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('has_completed_onboarding', true);

  const activation_rate = installs && installs > 0
    ? ((activated || 0) / installs) * 100
    : 0;

  // 3. D1 Retention (active within 1 day of signup)
  // Users where last_active_at is within 1 day of created_at
  const oneDayAgo = new Date();
  oneDayAgo.setDate(oneDayAgo.getDate() - 1);

  const { data: d1Users } = await supabase
    .from('profiles')
    .select('created_at, last_active_at')
    .not('last_active_at', 'is', null);

  const d1Count = d1Users?.filter(user => {
    if (!user.last_active_at || !user.created_at) return false;
    const createdAt = new Date(user.created_at);
    const lastActive = new Date(user.last_active_at);
    const diffDays = (lastActive.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 1;
  }).length || 0;

  const d1_retention = installs && installs > 0
    ? (d1Count / installs) * 100
    : 0;

  // 4. D7 Retention (active within 7 days of signup)
  const d7Count = d1Users?.filter(user => {
    if (!user.last_active_at || !user.created_at) return false;
    const createdAt = new Date(user.created_at);
    const lastActive = new Date(user.last_active_at);
    const diffDays = (lastActive.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length || 0;

  const d7_retention = installs && installs > 0
    ? (d7Count / installs) * 100
    : 0;

  // 5. Reviews count
  const { count: reviews_count } = await supabase
    .from('feedback')
    .select('*', { count: 'exact', head: true });

  // 6. Rating average (map NPS 1-10 to rating 1-5)
  const { data: feedbackData } = await supabase
    .from('feedback')
    .select('nps_score')
    .not('nps_score', 'is', null);

  const rating_avg = feedbackData && feedbackData.length > 0
    ? feedbackData.reduce((sum, f) => sum + (f.nps_score || 0), 0) / feedbackData.length / 2
    : 0;

  return {
    installs: installs || 0,
    activation_rate: Math.round(activation_rate * 10) / 10,
    d1_retention: Math.round(d1_retention * 10) / 10,
    d7_retention: Math.round(d7_retention * 10) / 10,
    reviews_count: reviews_count || 0,
    rating_avg: Math.round(rating_avg * 10) / 10,
  };
}

export async function saveKPISnapshot(kpis: KPIData): Promise<void> {
  const supabase = await createClient();
  const today = new Date().toISOString().split('T')[0];

  const snapshots = [
    { metric: 'installs', value: kpis.installs },
    { metric: 'activation_rate', value: kpis.activation_rate },
    { metric: 'd1_retention', value: kpis.d1_retention },
    { metric: 'd7_retention', value: kpis.d7_retention },
    { metric: 'reviews_count', value: kpis.reviews_count },
    { metric: 'rating_avg', value: kpis.rating_avg },
  ];

  for (const snapshot of snapshots) {
    await supabase
      .from('kpi_snapshots')
      .upsert({
        date: today,
        metric: snapshot.metric,
        value: snapshot.value,
        source: 'Auto-calculated'
      }, {
        onConflict: 'date,metric'
      });
  }
}
