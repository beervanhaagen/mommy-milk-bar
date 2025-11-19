export type Pace = 'ONE_HOUR' | 'TWO_HOURS' | 'THREE_HOURS';
export type Goal = 'MIN_FREEZER' | 'MAX_RELAX';
export type Feasibility = 'GREEN' | 'YELLOW' | 'RED';

export type DrinkPlan = {
  startAt: Date;
  drinks: number;
  pace: Pace;
  drinkType: 'WINE' | 'BEER' | 'COCKTAIL' | 'OTHER';
  safetyBufferMin?: number;
  goal: Goal;
  canPreFeed: boolean;
  canMicroPump: boolean;
  microPumpTargetMl?: number;
  prePump?: boolean;
  targetVolumeMl?: number;
  freezerStockMl?: number;
};

export type FeedHistoryPoint = { 
  at: Date;
  amountMl?: number;
};

export type PatternContext = { 
  typicalMlPerFeed: number; 
  eveningCluster: boolean;
};

export type PlanAssessment = {
  feasibility: Feasibility;
  safeFeedAt: Date;
  nextFeeds: Date[];
  freezerNeededMl: number;
  tips: string[];
  tippingPoints: {
    plusOneWorks: boolean;
    plusOneCondition?: string;
    noFreezerWorks: boolean;
    noFreezerCondition?: string;
  };
};

export type StoredPlan = {
  id: string;
  plan: DrinkPlan;
  assessment: PlanAssessment;
  createdAt: Date;
  status: 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';
};

export type PlanState = {
  currentStep: 'START' | 'DETAILS' | 'CONTEXT' | 'RESULT';
  plan: Partial<DrinkPlan>;
  assessment?: PlanAssessment;
};
