import { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { BADGE_DEFINITIONS } from '../data/mockData';

export const useGamification = () => {
  const triggerBadgeUnlock = (badgeId: string) => {
    const badge = BADGE_DEFINITIONS.find((b) => b.id === badgeId);
    if (!badge) return;

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    toast.success(
      <div className="flex items-center gap-3">
        <span className="text-3xl">{badge.icon}</span>
        <div>
          <p className="font-bold">Badge Unlocked!</p>
          <p className="text-sm">{badge.name}</p>
        </div>
      </div>,
      {
        duration: 5000,
      }
    );
  };

  const triggerTierUp = (newTier: string) => {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min;
    };

    const interval: any = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
      });
    }, 250);

    toast.success(
      <div className="text-center">
        <p className="text-2xl font-bold">🎊 Level Up!</p>
        <p className="text-lg">You've reached {newTier} tier!</p>
      </div>,
      {
        duration: 6000,
      }
    );
  };

  const triggerPointsEarned = (points: number, taskName: string) => {
    toast.success(
      <div>
        <p className="font-bold">Task Completed!</p>
        <p className="text-sm">{taskName}</p>
        <p className="text-sm text-amber-400">+{points} points</p>
      </div>
    );
  };

  return {
    triggerBadgeUnlock,
    triggerTierUp,
    triggerPointsEarned,
  };
};
