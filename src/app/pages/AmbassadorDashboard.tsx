import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAmbassadorStore } from '../stores/ambassadorStore';
import { useTaskStore } from '../stores/taskStore';
import { Avatar } from '../components/shared/Avatar';
import { BadgeDisplay } from '../components/shared/BadgeDisplay';
import { Modal } from '../components/shared/Modal';
import { useGamification } from '../hooks/useGamification';
import { toast } from 'sonner';
import { useDropzone } from 'react-dropzone';
import {
  LogOut,
  Trophy,
  Award,
  Flame,
  TrendingUp,
  CheckCircle2,
  Clock,
  Upload,
  Link as LinkIcon,
} from 'lucide-react';
import { TIER_COLORS, calculatePercentile } from '../lib/gamification';
import { BADGE_DEFINITIONS } from '../data/mockData';
import { isPast, formatDistanceToNow, parseISO } from 'date-fns';

export const AmbassadorDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { ambassadors, getAmbassadorById, addPoints, updateStreakForAmbassador, pointsHistory } =
    useAmbassadorStore();
  const { tasks, submissions, submitTask, hasSubmittedTask, getSubmissionsByAmbassador } =
    useTaskStore();
  const { triggerBadgeUnlock, triggerTierUp, triggerPointsEarned } = useGamification();

  const [currentTab, setCurrentTab] = useState<'tasks' | 'points' | 'leaderboard'>('tasks');
  const [taskTab, setTaskTab] = useState<'available' | 'in_progress' | 'completed' | 'expired'>(
    'available'
  );
  const [selectedTask, setSelectedTask] = useState<string | null>(null);
  const [submissionProof, setSubmissionProof] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const ambassador = user ? getAmbassadorById(user.id) : null;
  const mySubmissions = user ? getSubmissionsByAmbassador(user.id) : [];
  const myPointsHistory = user ? pointsHistory.filter((h) => h.ambassadorId === user.id) : [];

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadedFile(acceptedFiles[0]);
      toast.success(`File "${acceptedFiles[0].name}" uploaded`);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
    },
  });

  const availableTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!user || task.status !== 'Active') return false;
      const hasSubmitted = hasSubmittedTask(user.id, task.id);
      const isExpired = isPast(parseISO(task.deadline));
      return !hasSubmitted && !isExpired;
    });
  }, [tasks, user, submissions]);

  const completedTasks = useMemo(() => {
    return mySubmissions.filter((sub) => sub.status === 'approved');
  }, [mySubmissions]);

  const expiredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (!user) return false;
      const hasSubmitted = hasSubmittedTask(user.id, task.id);
      const isExpired = isPast(parseISO(task.deadline));
      return !hasSubmitted && isExpired;
    });
  }, [tasks, user, submissions]);

  const sortedLeaderboard = useMemo(() => {
    return [...ambassadors].sort((a, b) => b.points - a.points);
  }, [ambassadors]);

  const myRank = ambassador
    ? sortedLeaderboard.findIndex((a) => a.id === ambassador.id) + 1
    : 0;
  const percentile = ambassador ? calculatePercentile(myRank, ambassadors.length) : 0;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleSubmitTask = () => {
    if (!user || !selectedTask) return;

    const task = tasks.find((t) => t.id === selectedTask);
    if (!task) return;

    if (task.proofRequired && !submissionProof && !uploadedFile) {
      toast.error('Please provide proof for this task');
      return;
    }

    const proof = uploadedFile ? uploadedFile.name : submissionProof;

    submitTask({
      taskId: selectedTask,
      ambassadorId: user.id,
      proof,
      proofType: task.proofType,
    });

    if (task.autoApprove && ambassador) {
      updateStreakForAmbassador(user.id);

      const oldTier = ambassador.tier;
      const effects = addPoints(user.id, task.points, task.title);

      triggerPointsEarned(task.points, task.title);

      effects.forEach((effect) => {
        if (effect.startsWith('badge:')) {
          const badgeId = effect.split(':')[1];
          setTimeout(() => triggerBadgeUnlock(badgeId), 500);
        } else if (effect.startsWith('tier:')) {
          const newTier = effect.split(':')[1];
          if (newTier !== oldTier) {
            setTimeout(() => triggerTierUp(newTier), 1000);
          }
        }
      });

      toast.success(`Task completed! +${task.points} points earned`);
    } else {
      toast.success('Task submitted! Waiting for review.');
    }

    setSelectedTask(null);
    setSubmissionProof('');
    setUploadedFile(null);
  };

  if (!ambassador || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">CampusConnect</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">{ambassador.name}</span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        <div className="bg-slate-800 rounded-xl border border-slate-700 p-8 mb-8">
          <div className="flex items-start gap-6">
            <Avatar name={ambassador.name} size="xl" />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-white mb-2">{ambassador.name}</h2>
              <p className="text-gray-400 mb-3">
                {ambassador.college} • Year {ambassador.year}
              </p>
              <div className="flex flex-wrap gap-3 mb-4">
                <span
                  className={`px-4 py-2 rounded-full font-semibold bg-gradient-to-r ${
                    TIER_COLORS[ambassador.tier]
                  } text-white`}
                >
                  {ambassador.tier}
                </span>
                <span className="px-4 py-2 bg-amber-500/20 text-amber-400 rounded-full font-bold">
                  {ambassador.points} points
                </span>
                {ambassador.streak > 0 && (
                  <span className="px-4 py-2 bg-orange-500/20 text-orange-400 rounded-full font-semibold flex items-center gap-2">
                    <Flame size={18} />
                    {ambassador.streak} day streak
                  </span>
                )}
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div>
                  <span className="text-gray-400">Rank:</span>{' '}
                  <span className="text-white font-semibold">#{myRank}</span>
                </div>
                <div>
                  <span className="text-gray-400">Percentile:</span>{' '}
                  <span className="text-emerald-400 font-semibold">Top {percentile}%</span>
                </div>
                <div>
                  <span className="text-gray-400">Tasks:</span>{' '}
                  <span className="text-white font-semibold">{ambassador.tasksCompleted}</span>
                </div>
                <div>
                  <span className="text-gray-400">Badges:</span>{' '}
                  <span className="text-white font-semibold">{ambassador.badgeCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-4 mb-6">
          {[
            { id: 'tasks', label: 'My Tasks', icon: CheckCircle2 },
            { id: 'points', label: 'Points & Badges', icon: Award },
            { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id as any)}
                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                  currentTab === tab.id
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700'
                }`}
              >
                <Icon size={20} />
                {tab.label}
              </button>
            );
          })}
        </div>

        {currentTab === 'tasks' && (
          <div>
            <div className="flex gap-2 mb-6">
              {[
                { id: 'available', label: 'Available', count: availableTasks.length },
                { id: 'completed', label: 'Completed', count: completedTasks.length },
                { id: 'expired', label: 'Expired', count: expiredTasks.length },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setTaskTab(tab.id as any)}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    taskTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-800 text-gray-400 hover:text-white'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taskTab === 'available' &&
                availableTasks.map((task) => {
                  const timeLeft = formatDistanceToNow(parseISO(task.deadline), {
                    addSuffix: true,
                  });

                  return (
                    <div
                      key={task.id}
                      className="bg-slate-800 rounded-xl border border-slate-700 p-6 hover:border-indigo-500 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                          {task.type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{task.description}</p>
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-amber-400 font-bold text-xl">{task.points} pts</span>
                        <span className="text-gray-400 text-sm flex items-center gap-1">
                          <Clock size={14} />
                          {timeLeft}
                        </span>
                      </div>
                      <button
                        onClick={() => setSelectedTask(task.id)}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
                      >
                        Start Task
                      </button>
                    </div>
                  );
                })}

              {taskTab === 'completed' &&
                completedTasks.map((sub) => {
                  const task = tasks.find((t) => t.id === sub.taskId);
                  if (!task) return null;

                  return (
                    <div
                      key={sub.id}
                      className="bg-slate-800 rounded-xl border border-emerald-700 p-6"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <CheckCircle2 className="text-emerald-400" size={24} />
                      </div>
                      <p className="text-gray-400 text-sm mb-4">
                        Completed {new Date(sub.submittedAt).toLocaleDateString()}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-emerald-400 font-bold">
                          +{sub.pointsAwarded} points earned
                        </span>
                      </div>
                    </div>
                  );
                })}

              {taskTab === 'expired' &&
                expiredTasks.map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-800 rounded-xl border border-slate-700 p-6 opacity-50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                      <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">
                        Expired
                      </span>
                    </div>
                    <p className="text-gray-400 text-sm mb-4">{task.description}</p>
                    <p className="text-gray-500 text-sm">
                      Deadline was {new Date(task.deadline).toLocaleDateString()}
                    </p>
                  </div>
                ))}
            </div>

            {taskTab === 'available' && availableTasks.length === 0 && (
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={48} />
                <p className="text-xl text-white font-semibold mb-2">All caught up!</p>
                <p className="text-gray-400">No available tasks right now. Check back soon!</p>
              </div>
            )}
          </div>
        )}

        {currentTab === 'points' && (
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Points History</h3>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {myPointsHistory.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                      Complete tasks to start earning points!
                    </p>
                  ) : (
                    [...myPointsHistory].reverse().map((entry) => (
                      <div
                        key={entry.id}
                        className="flex items-center justify-between p-3 bg-slate-700 rounded-lg"
                      >
                        <div className="flex-1">
                          <p className="text-white font-medium">{entry.taskName}</p>
                          <p className="text-xs text-gray-400">
                            {new Date(entry.date).toLocaleString()}
                          </p>
                        </div>
                        <span
                          className={`font-bold ${
                            entry.type === 'earned' || entry.type === 'bonus'
                              ? 'text-emerald-400'
                              : 'text-red-400'
                          }`}
                        >
                          {entry.type !== 'deducted' ? '+' : '-'}
                          {entry.points}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                <h3 className="text-xl font-bold text-white mb-4">Badge Collection</h3>
                <div className="grid grid-cols-3 gap-4">
                  {BADGE_DEFINITIONS.map((badge) => {
                    const unlocked = ambassador.badges.includes(badge.id);
                    return (
                      <BadgeDisplay
                        key={badge.id}
                        badgeId={badge.id}
                        size="md"
                        showName
                        locked={!unlocked}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'leaderboard' && (
          <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Rank
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Ambassador
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    College
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Points
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                    Streak
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {sortedLeaderboard.map((amb, index) => {
                  const rank = index + 1;
                  const isMe = amb.id === ambassador.id;
                  const rankColors =
                    rank === 1
                      ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                      : rank === 2
                      ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
                      : rank === 3
                      ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white'
                      : 'bg-slate-700 text-gray-300';

                  return (
                    <tr
                      key={amb.id}
                      className={`${
                        rank <= 3 ? 'bg-slate-700/50' : ''
                      } ${
                        isMe ? 'bg-indigo-900/30 border-l-4 border-indigo-500' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${rankColors}`}
                        >
                          {rank}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar name={amb.name} size="sm" />
                          <span className={`font-medium ${isMe ? 'text-indigo-400' : 'text-white'}`}>
                            {amb.name} {isMe && '(You)'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{amb.college}</td>
                      <td className="px-6 py-4">
                        <span className="text-amber-400 font-bold text-lg">{amb.points}</span>
                      </td>
                      <td className="px-6 py-4">
                        {amb.streak > 0 ? (
                          <span className="text-orange-400 font-semibold">
                            🔥 {amb.streak}
                          </span>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedTask}
        onClose={() => {
          setSelectedTask(null);
          setSubmissionProof('');
          setUploadedFile(null);
        }}
        title="Submit Task"
        size="md"
      >
        {selectedTask && (() => {
          const task = tasks.find((t) => t.id === selectedTask);
          if (!task) return null;

          return (
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">{task.title}</h3>
              <p className="text-gray-400 mb-6">{task.description}</p>

              <div className="bg-slate-700 rounded-lg p-4 mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Points:</span>
                  <span className="text-amber-400 font-bold text-xl">{task.points}</span>
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300">Deadline:</span>
                  <span className="text-white">
                    {formatDistanceToNow(parseISO(task.deadline), { addSuffix: true })}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Review:</span>
                  <span className={task.autoApprove ? 'text-emerald-400' : 'text-yellow-400'}>
                    {task.autoApprove ? 'Auto-approved' : 'Manual review'}
                  </span>
                </div>
              </div>

              {task.proofRequired && (
                <div className="mb-6">
                  <label className="block text-white font-medium mb-2">
                    Proof Required ({task.proofType})
                  </label>

                  {task.proofType === 'URL' && (
                    <div>
                      <input
                        type="url"
                        value={submissionProof}
                        onChange={(e) => setSubmissionProof(e.target.value)}
                        placeholder="https://example.com/proof"
                        className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  )}

                  {(task.proofType === 'Image' || task.proofType === 'Screenshot') && (
                    <div>
                      <div
                        {...getRootProps()}
                        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                          isDragActive
                            ? 'border-indigo-500 bg-indigo-500/10'
                            : 'border-slate-600 hover:border-indigo-500'
                        }`}
                      >
                        <input {...getInputProps()} />
                        <Upload className="mx-auto mb-3 text-gray-400" size={32} />
                        {uploadedFile ? (
                          <p className="text-white">{uploadedFile.name}</p>
                        ) : (
                          <>
                            <p className="text-white mb-1">
                              {isDragActive ? 'Drop the file here' : 'Drag & drop an image here'}
                            </p>
                            <p className="text-gray-400 text-sm">or click to select (max 5MB)</p>
                          </>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setSelectedTask(null);
                    setSubmissionProof('');
                    setUploadedFile(null);
                  }}
                  className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitTask}
                  disabled={task.proofRequired && !submissionProof && !uploadedFile}
                  className="flex-1 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Task
                </button>
              </div>
            </div>
          );
        })()}
      </Modal>
    </div>
  );
};
