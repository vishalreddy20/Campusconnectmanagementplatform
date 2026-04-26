import { getInitials, getAvatarColor } from '../../lib/gamification';

interface AvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-xl',
};

export const Avatar = ({ name, size = 'md', className = '' }: AvatarProps) => {
  const initials = getInitials(name);
  const colorClass = getAvatarColor(name);

  return (
    <div
      className={`${sizeClasses[size]} ${colorClass} rounded-full flex items-center justify-center font-semibold text-white ${className}`}
    >
      {initials}
    </div>
  );
};
