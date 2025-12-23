import { KPIData } from '@/lib/kpi/calculator';

export interface GuidanceRule {
  id: string;
  condition: (kpis: KPIData) => boolean;
  message: string;
  priority: 'critical' | 'high' | 'medium';
  action?: string;
  relatedAssumptions?: string[];
}

export const GUIDANCE_RULES: GuidanceRule[] = [
  {
    id: 'low-activation',
    condition: (kpis) => kpis.activation_rate < 60,
    message: 'Fix onboarding before marketing.',
    priority: 'critical',
    action: 'Review onboarding flow and user feedback',
    relatedAssumptions: ['A1', 'A2'],
  },
  {
    id: 'low-retention-d7',
    condition: (kpis) => kpis.d7_retention < 10,
    message: 'Focus on repeat-use triggers & reminders.',
    priority: 'critical',
    action: 'Improve retention features and notifications',
    relatedAssumptions: ['B2'],
  },
  {
    id: 'low-rating',
    condition: (kpis) => kpis.rating_avg < 4.2 && kpis.reviews_count > 0,
    message: 'Review top complaints; prioritize trust & clarity.',
    priority: 'high',
    action: 'Analyze negative reviews in feedback table',
    relatedAssumptions: ['E1'],
  },
  {
    id: 'few-reviews',
    condition: (kpis) => kpis.reviews_count < 10,
    message: 'Prompt happy users for review (soft).',
    priority: 'medium',
    action: 'Add gentle review prompt after positive interactions',
  },
  {
    id: 'low-installs',
    condition: (kpis) => kpis.installs < 50,
    message: 'Focus on awareness and acquisition.',
    priority: 'high',
    action: 'Increase marketing efforts and distribution channels',
  },
];

export function evaluateGuidance(kpis: KPIData): GuidanceRule[] {
  return GUIDANCE_RULES.filter(rule => rule.condition(kpis))
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
}
