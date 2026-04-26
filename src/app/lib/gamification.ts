import { differenceInCalendarDays, isSameDay, parseISO } from 'date-fns';

export const TIER_THRESHOLDS = {
  Bronze: 0,
  Silver: 100,
  Gold: 300,
  Platinum: 600,
  Diamond: 1000,
} as const;

export type Tier = keyof typeof TIER_THRESHOLDS;

export const TIER_COLORS = {
  Bronze: 'from-amber-700 to-amber-900',
  Silver: 'from-gray-400 to-gray-600',
  Gold: 'from-yellow-400 to-yellow-600',
  Platinum: 'from-purple-400 to-purple-600',
  Diamond: 'from-cyan-400 to-blue-600',
};

export const calculateTier = (points: number): Tier => {
  if (points >= TIER_THRESHOLDS.Diamond) return 'Diamond';
  if (points >= TIER_THRESHOLDS.Platinum) return 'Platinum';
  if (points >= TIER_THRESHOLDS.Gold) return 'Gold';
  if (points >= TIER_THRESHOLDS.Silver) return 'Silver';
  return 'Bronze';
};

export const getNextTier = (currentTier: Tier): Tier | null => {
  const tiers: Tier[] = ['Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond'];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

export const getPointsToNextTier = (points: number): number | null => {
  const currentTier = calculateTier(points);
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return null;
  return TIER_THRESHOLDS[nextTier] - points;
};

export const calculateStreakMultiplier = (streak: number): number => {
  return streak >= 3 ? 1.2 : 1.0;
};

export const calculateEarlySubmissionBonus = (
  taskCreatedAt: string | Date,
  deadline: string | Date,
  submittedAt: string | Date
): number => {
  const created = typeof taskCreatedAt === 'string' ? parseISO(taskCreatedAt) : taskCreatedAt;
  const due = typeof deadline === 'string' ? parseISO(deadline) : deadline;
  const submitted = typeof submittedAt === 'string' ? parseISO(submittedAt) : submittedAt;

  const totalDuration = due.getTime() - created.getTime();
  const timeTaken = submitted.getTime() - created.getTime();

  if (timeTaken <= totalDuration * 0.5) {
    return 0.1;
  }
  return 0;
};

export const FIRST_SUBMISSION_BONUS = 15;

export const calculateFinalPoints = (
  basePoints: number,
  streak: number,
  isEarlySubmission: boolean,
  isFirstSubmission: boolean
): number => {
  let points = basePoints;

  points *= calculateStreakMultiplier(streak);

  if (isEarlySubmission) {
    points *= 1 + calculateEarlySubmissionBonus(
      new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      new Date()
    );
  }

  if (isFirstSubmission) {
    points += FIRST_SUBMISSION_BONUS;
  }

  return Math.round(points);
};

export const updateStreak = (
  currentStreak: number,
  lastActiveDate: string | Date | null,
  newActivityDate: string | Date = new Date()
): number => {
  if (!lastActiveDate) {
    return 1;
  }

  const lastActive = typeof lastActiveDate === 'string' ? parseISO(lastActiveDate) : lastActiveDate;
  const newActive = typeof newActivityDate === 'string' ? parseISO(newActivityDate) : newActivityDate;

  if (isSameDay(lastActive, newActive)) {
    return currentStreak;
  }

  const daysDifference = differenceInCalendarDays(newActive, lastActive);

  if (daysDifference === 1) {
    return currentStreak + 1;
  }

  if (daysDifference > 1) {
    return 1;
  }

  return currentStreak;
};

export const checkStreakBroken = (lastActiveDate: string | Date): boolean => {
  const lastActive = typeof lastActiveDate === 'string' ? parseISO(lastActiveDate) : lastActiveDate;
  const today = new Date();
  const daysSinceActive = differenceInCalendarDays(today, lastActive);

  return daysSinceActive > 1;
};

export const checkBadgeUnlocked = (
  badgeCondition: (stats: any) => boolean,
  stats: any
): boolean => {
  return badgeCondition(stats);
};

export const getNewlyUnlockedBadges = (
  currentBadges: string[],
  allBadgeDefinitions: Array<{ id: string; condition: (stats: any) => boolean }>,
  stats: any
): string[] => {
  const newBadges: string[] = [];

  for (const badge of allBadgeDefinitions) {
    if (!currentBadges.includes(badge.id) && badge.condition(stats)) {
      newBadges.push(badge.id);
    }
  }

  return newBadges;
};

export const calculatePercentile = (rank: number, totalAmbassadors: number): number => {
  if (totalAmbassadors === 0) return 0;
  const percentile = ((totalAmbassadors - rank + 1) / totalAmbassadors) * 100;
  return Math.round(percentile);
};

export const calculateProgramHealthScore = (
  tasksCompleted: number,
  tasksAssigned: number,
  activeAmbassadors: number,
  totalAmbassadors: number
): number => {
  if (tasksAssigned === 0 || totalAmbassadors === 0) return 0;

  const completionRate = tasksCompleted / tasksAssigned;
  const engagementRate = activeAmbassadors / totalAmbassadors;

  const healthScore = (completionRate * 0.6 + engagementRate * 0.4) * 100;

  return Math.min(100, Math.round(healthScore));
};

export const getAvatarColor = (name: string): string => {
  const colors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-amber-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
    'bg-emerald-500',
    'bg-teal-500',
    'bg-cyan-500',
    'bg-sky-500',
    'bg-blue-500',
    'bg-indigo-500',
    'bg-violet-500',
    'bg-purple-500',
    'bg-fuchsia-500',
    'bg-pink-500',
    'bg-rose-500',
  ];

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
};

export const getInitials = (name: string): string => {
  const parts = name.trim().split(' ');
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
