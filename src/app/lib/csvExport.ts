import { Ambassador } from '../stores/ambassadorStore';

export const exportAmbassadorsToCSV = (ambassadors: Ambassador[]) => {
  const headers = ['Name', 'College', 'Points', 'Tasks Completed', 'Badges', 'Tier', 'Streak', 'Status'];

  const csvContent = [
    headers.join(','),
    ...ambassadors.map((amb) =>
      [
        `"${amb.name}"`,
        `"${amb.college}"`,
        amb.points,
        amb.tasksCompleted,
        amb.badgeCount,
        amb.tier,
        amb.streak,
        amb.status,
      ].join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `ambassadors_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
