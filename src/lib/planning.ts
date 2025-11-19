import { DrinkPlan, FeedHistoryPoint, PatternContext, PlanAssessment, Feasibility } from '../types/planning';

const PACE_HOURS = {
  ONE_HOUR: 1,
  TWO_HOURS: 2,
  THREE_HOURS: 3,
} as const;

// Helper functions
function addMinutes(d: Date, m: number): Date {
  return new Date(d.getTime() + m * 60000);
}

function addHours(d: Date, h: number): Date {
  return addMinutes(d, h * 60);
}

function medianOf(nums: number[]): number {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function msToMin(ms: number): number {
  return Math.round(ms / 60000);
}

export function drinkWindowEnd(plan: DrinkPlan): Date {
  return addHours(plan.startAt, PACE_HOURS[plan.pace]);
}

export function safeFeedAt(plan: DrinkPlan): Date {
  const end = drinkWindowEnd(plan);
  const perDrinkHours = 2; // conservatief
  const raw = addHours(end, plan.drinks * perDrinkHours);
  return addMinutes(raw, plan.safetyBufferMin ?? 30);
}

export function predictNextFeeds(history: FeedHistoryPoint[], count = 3, eveningCluster = false): Date[] {
  if (!history.length) return [];
  
  // Neem intervallen laatste 5 voedingen
  const intervals = history.slice(-6).map((p, i, arr) => 
    i ? p.at.getTime() - arr[i - 1].at.getTime() : null
  ).filter(Boolean) as number[];
  
  const median = msToMin(medianOf(intervals));
  const adjusted = eveningCluster ? Math.max(90, median * 0.85) : median; // iets korter in avond
  const last = history[history.length - 1].at;
  
  return Array.from({ length: count }, (_, i) => addMinutes(last, adjusted * (i + 1)));
}

export function assessPlan(
  plan: DrinkPlan,
  history: FeedHistoryPoint[],
  ctx: PatternContext
): PlanAssessment {
  const sfa = safeFeedAt(plan);
  const next = predictNextFeeds(history, 2, ctx.eveningCluster);
  const nextFeed = next[0];

  // Bandbreedtes
  const green = sfa.getTime() <= addMinutes(nextFeed, -10).getTime();
  const yellow = sfa.getTime() <= addMinutes(nextFeed, 30).getTime();

  let feasibility: Feasibility = green ? 'GREEN' : (yellow ? 'YELLOW' : 'RED');
  let freezer = 0;
  const tips: string[] = [];

  if (feasibility === 'GREEN') {
    tips.push('Past tussen voedingen zonder vriesvoorraad.');
  } else if (feasibility === 'YELLOW') {
    // Probeer optimalisaties zonder vriesvoorraad
    tips.push('Optie: voed 30–45 min vóór start.');
    tips.push('Optie: start eerste slok 20–30 min later.');
    tips.push('Optie: bundel drankjes in 1 uur.');
    if (plan.goal === 'MAX_RELAX' || plan.canMicroPump) {
      freezer = Math.max(ctx.typicalMlPerFeed - (plan.microPumpTargetMl ?? 0), 0);
      tips.push(`Micro-pomp ${plan.microPumpTargetMl ?? 80} ml om krappe overlap te overbruggen.`);
    }
  } else {
    tips.push('Past niet comfortabel:');
    tips.push('• Voed vóór start en verschuif eerste slok.');
    tips.push('• Of verlaag aantal drankjes (–1).');
    if (plan.canMicroPump) {
      freezer = Math.max(ctx.typicalMlPerFeed - (plan.microPumpTargetMl ?? 0), 0);
      tips.push(`Met micro-pomp ${plan.microPumpTargetMl ?? 80} ml wordt het mogelijk, met kleine marge.`);
    }
  }

  // Doel "MIN_FREEZER": toon 0-strategie eerst
  if (plan.goal === 'MIN_FREEZER' && freezer > 0) {
    tips.unshift('Doel is minimale vriesvoorraad: probeer eerst voeden/verschuiven/bundelen.');
  }

  // Tipping points - simplified to avoid recursion
  const plusOneWorks = feasibility !== 'RED'; // Simplified check
  const noFreezerWorks = freezer === 0;

  return {
    feasibility,
    safeFeedAt: sfa,
    nextFeeds: next,
    freezerNeededMl: freezer,
    tips,
    tippingPoints: {
      plusOneWorks,
      plusOneCondition: plusOneWorks ? `+1 drankje past als je ${addMinutes(plan.startAt, -30).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} voedt` : undefined,
      noFreezerWorks,
      noFreezerCondition: noFreezerWorks ? `Zonder vriesvoorraad lukt het als je ${addMinutes(plan.startAt, 20).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} start` : undefined,
    }
  };
}

export function plusOneScenario(plan: DrinkPlan, history: FeedHistoryPoint[], ctx: PatternContext): PlanAssessment {
  // Simplified calculation to avoid recursion
  const plusOnePlan = { ...plan, drinks: plan.drinks + 1 };
  const sfa = safeFeedAt(plusOnePlan);
  const next = predictNextFeeds(history, 2, ctx.eveningCluster);
  const nextFeed = next[0];
  
  const green = sfa.getTime() <= addMinutes(nextFeed, -10).getTime();
  const yellow = sfa.getTime() <= addMinutes(nextFeed, 30).getTime();
  const feasibility: Feasibility = green ? 'GREEN' : (yellow ? 'YELLOW' : 'RED');
  
  return {
    feasibility,
    safeFeedAt: sfa,
    nextFeeds: next,
    freezerNeededMl: feasibility === 'GREEN' ? 0 : 120,
    tips: feasibility === 'GREEN' ? ['Past perfect!'] : ['Krap, maar mogelijk'],
    tippingPoints: {
      plusOneWorks: feasibility !== 'RED',
      plusOneCondition: undefined,
      noFreezerWorks: feasibility === 'GREEN',
      noFreezerCondition: undefined,
    }
  };
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('nl-NL', { 
    hour: '2-digit', 
    minute: '2-digit' 
  });
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('nl-NL', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function getFeasibilityColor(feasibility: Feasibility): string {
  switch (feasibility) {
    case 'GREEN': return '#4CAF50';
    case 'YELLOW': return '#FF9800';
    case 'RED': return '#F44336';
    default: return '#9E9E9E';
  }
}

export function getFeasibilityText(feasibility: Feasibility): string {
  switch (feasibility) {
    case 'GREEN': return 'Ruime marge — geen vriesvoorraad nodig';
    case 'YELLOW': return 'Krap — met kleine schuif of micro-pomp lukt het';
    case 'RED': return 'Past niet — pas timing/hoeveelheid aan';
    default: return 'Berekenen...';
  }
}
