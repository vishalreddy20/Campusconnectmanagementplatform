import { BADGE_DEFINITIONS } from '../../data/mockData';

interface BadgeDisplayProps {
  badgeId: string;
  size?: 'sm' | 'md' | 'lg';
  showName?: boolean;
  unlockDate?: string;
  locked?: boolean;
}

const sizeClasses = {
  sm: 'w-10 h-10 text-lg',
  md: 'w-14 h-14 text-2xl',
  lg: 'w-20 h-20 text-4xl',
};

export const BadgeDisplay = ({
  badgeId,
  size = 'md',
  showName = false,
  unlockDate,
  locked = false,
}: BadgeDisplayProps) => {
  const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
  if (!badge) return null;

  return (
    <div className={`flex flex-col items-center gap-2 ${locked ? 'opacity-40' : ''}`}>
      <div
        className={`${sizeClasses[size]} rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg ${
          locked ? 'grayscale' : ''
        }`}
        title={badge.description}
      >
        <span>{badge.icon}</span>
      </div>
      {showName && (
        <div className="text-center">
          <p className="text-sm font-semibold text-white">{badge.name}</p>
          <p className="text-xs text-gray-400">{badge.description}</p>
          {unlockDate && !locked && (
            <p className="text-xs text-gray-500 mt-1">
              Unlocked {new Date(unlockDate).toLocaleDateString()}
            </p>
          )}
          {locked && <p className="text-xs text-gray-500 mt-1">Locked</p>}
        </div>
      )}
    </div>
  );
};
