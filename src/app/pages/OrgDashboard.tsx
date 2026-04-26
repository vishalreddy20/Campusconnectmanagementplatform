import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useAmbassadorStore } from '../stores/ambassadorStore';
import { useTaskStore } from '../stores/taskStore';
import { Avatar } from '../components/shared/Avatar';
import { Modal } from '../components/shared/Modal';
import { toast } from 'sonner';
import {
  Users,
  CheckCircle2,
  Award,
  TrendingUp,
  Search,
  Filter,
  Plus,
  LogOut,
  BarChart3,
  ListTodo,
  Trophy,
} from 'lucide-react';
import { calculateProgramHealthScore, TIER_COLORS } from '../lib/gamification';
import { exportAmbassadorsToCSV } from '../lib/csvExport';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { TaskType, ProofType } from '../stores/taskStore';

export const OrgDashboard = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuthStore();
  const { ambassadors, flagAmbassador, removeAmbassador } = useAmbassadorStore();
  const { tasks, submissions, getPendingSubmissions, approveSubmission, rejectSubmission } =
    useTaskStore();

  const [currentTab, setCurrentTab] = useState<
    'overview' | 'ambassadors' | 'tasks' | 'submissions' | 'analytics' | 'leaderboard'
  >('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive' | 'Flagged'>(
    'All'
  );
  const [selectedAmbassador, setSelectedAmbassador] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState<string | null>(null);

  const [newTask, setNewTask] = useState({
    title: '',
    type: 'Social Post' as TaskType,
    description: '',
    points: 50,
    deadline: '',
    proofRequired: true,
    proofType: 'Image' as ProofType,
    autoApprove: false,
  });

  const activeAmbassadors = ambassadors.filter((amb) => amb.status === 'Active');
  const thisWeekTasks = submissions.filter((sub) => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return new Date(sub.submittedAt) > weekAgo && sub.status === 'approved';
  });

  const totalPointsAwarded = submissions
    .filter((sub) => sub.status === 'approved')
    .reduce((sum, sub) => sum + (sub.pointsAwarded || 0), 0);

  const activeStreaks = ambassadors.filter((amb) => amb.streak > 0).length;

  const healthScore = calculateProgramHealthScore(
    submissions.filter((s) => s.status === 'approved').length,
    submissions.length,
    activeAmbassadors.length,
    ambassadors.length
  );

  const filteredAmbassadors = useMemo(() => {
    let filtered = ambassadors;

    if (searchQuery) {
      filtered = filtered.filter(
        (amb) =>
          amb.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          amb.college.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'All') {
      filtered = filtered.filter((amb) => amb.status === statusFilter);
    }

    return filtered;
  }, [ambassadors, searchQuery, statusFilter]);

  const pendingSubmissions = getPendingSubmissions();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleApprove = (submissionId: string, points: number) => {
    approveSubmission(submissionId, points);
    const submission = submissions.find((s) => s.id === submissionId);
    if (submission) {
      toast.success(`Approved submission! ${points} points awarded.`);
    }
    setShowApproveModal(false);
    setSelectedSubmission(null);
  };

  const handleReject = (submissionId: string, reason: string) => {
    rejectSubmission(submissionId, reason);
    toast.error('Submission rejected');
  };

  const ambassadorDetail = selectedAmbassador
    ? ambassadors.find((a) => a.id === selectedAmbassador)
    : null;

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.title.trim()) {
      toast.error('Task title is required');
      return;
    }
    if (newTask.points < 10) {
      toast.error('Points must be at least 10');
      return;
    }
    if (!newTask.deadline || new Date(newTask.deadline) <= new Date()) {
      toast.error('Deadline must be a future date');
      return;
    }
    
    useTaskStore.getState().addTask({
      title: newTask.title,
      type: newTask.type,
      description: newTask.description,
      points: newTask.points,
      deadline: newTask.deadline,
      proofRequired: newTask.proofRequired,
      proofType: newTask.proofRequired ? newTask.proofType : undefined,
      autoApprove: newTask.autoApprove,
      status: 'Active',
      createdAt: new Date().toISOString(),
      assignedTo: 'all'
    });

    toast.success('Task created successfully');
    setShowTaskModal(false);
    setNewTask({
      title: '',
      type: 'Social Post',
      description: '',
      points: 50,
      deadline: '',
      proofRequired: true,
      proofType: 'Image',
      autoApprove: false,
    });
  };

  // Analytics Data Prep
  const COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
  const taskTypeData = useMemo(() => {
    const counts: Record<string, number> = {};
    tasks.forEach(t => { counts[t.type] = (counts[t.type] || 0) + 1; });
    return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }, [tasks]);

  const collegeData = useMemo(() => {
    const counts: Record<string, number> = {};
    ambassadors.forEach(a => { counts[a.college] = (counts[a.college] || 0) + a.points; });
    return Object.entries(counts)
      .map(([name, points]) => ({ name, points }))
      .sort((a, b) => b.points - a.points)
      .slice(0, 3);
  }, [ambassadors]);

  const signupsData = useMemo(() => {
    return ambassadors.map(a => ({ date: a.joinDate })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((v, i) => ({ date: v.date, count: i + 1 }));
  }, [ambassadors]);

  return (
    <div className="min-h-screen bg-slate-900">
      <nav className="bg-slate-800 border-b border-slate-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">CampusConnect</h1>
          <div className="flex items-center gap-4">
            <span className="text-gray-300">TechLaunch India</span>
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

      <div className="flex">
        <aside className="w-64 bg-slate-800 min-h-screen border-r border-slate-700 p-4">
          <nav className="space-y-2">
            {[
              { id: 'overview', label: 'Overview', icon: TrendingUp },
              { id: 'ambassadors', label: 'Ambassadors', icon: Users },
              { id: 'tasks', label: 'Tasks', icon: ListTodo },
              { id: 'submissions', label: 'Submissions', icon: CheckCircle2 },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCurrentTab(tab.id as any)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    currentTab === tab.id
                      ? 'bg-indigo-600 text-white'
                      : 'text-gray-400 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  {tab.label}
                  {tab.id === 'submissions' && pendingSubmissions.length > 0 && (
                    <span className="ml-auto bg-amber-500 text-white text-xs px-2 py-1 rounded-full">
                      {pendingSubmissions.length}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {currentTab === 'overview' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Dashboard Overview</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-blue-500/20 rounded-lg">
                      <Users className="text-blue-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Total Ambassadors</p>
                      <p className="text-3xl font-bold text-white">{ambassadors.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/20 rounded-lg">
                      <CheckCircle2 className="text-emerald-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Tasks This Week</p>
                      <p className="text-3xl font-bold text-white">{thisWeekTasks.length}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-amber-500/20 rounded-lg">
                      <Award className="text-amber-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Points Awarded</p>
                      <p className="text-3xl font-bold text-white">{totalPointsAwarded}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-purple-500/20 rounded-lg">
                      <TrendingUp className="text-purple-400" size={24} />
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Active Streaks</p>
                      <p className="text-3xl font-bold text-white">{activeStreaks}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 mb-6">
                <h3 className="text-xl font-bold text-white mb-4">Program Health Score</h3>
                <div className="flex items-center gap-8">
                  <div className="relative w-32 h-32">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        className="text-slate-700"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="currentColor"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${(healthScore / 100) * 351.86} 351.86`}
                        className="text-emerald-400"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-3xl font-bold text-white">{healthScore}%</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-gray-300 mb-4">
                      Your program is performing{' '}
                      {healthScore >= 80 ? 'excellently' : healthScore >= 60 ? 'well' : 'moderately'}
                      . This score is calculated based on task completion rates and ambassador engagement.
                    </p>
                    <div className="flex gap-4">
                      <div>
                        <p className="text-sm text-gray-400">Active Rate</p>
                        <p className="text-lg font-semibold text-white">
                          {Math.round((activeAmbassadors.length / ambassadors.length) * 100)}%
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-400">Completion Rate</p>
                        <p className="text-lg font-semibold text-white">
                          {submissions.length > 0
                            ? Math.round(
                                (submissions.filter((s) => s.status === 'approved').length /
                                  submissions.length) *
                                  100
                              )
                            : 0}
                          %
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {pendingSubmissions.length > 0 && (
                <div className="bg-amber-900/20 border border-amber-700 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-amber-400 mb-2">
                    {pendingSubmissions.length} Pending Submission{pendingSubmissions.length !== 1 ? 's' : ''}
                  </h3>
                  <p className="text-gray-300">
                    Review and approve task submissions from your ambassadors.
                  </p>
                  <button
                    onClick={() => setCurrentTab('submissions')}
                    className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition-colors"
                  >
                    Review Now
                  </button>
                </div>
              )}
            </div>
          )}

          {currentTab === 'ambassadors' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Ambassadors</h2>
                <button
                  onClick={() => exportAmbassadorsToCSV(ambassadors)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Export CSV
                </button>
              </div>

              <div className="flex gap-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by name or college..."
                    className="w-full pl-10 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                  <option>Flagged</option>
                </select>
              </div>

              <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-slate-700">
                    <tr>
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
                        Tier
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                        Streak
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredAmbassadors.map((amb) => (
                      <tr
                        key={amb.id}
                        onClick={() => setSelectedAmbassador(amb.id)}
                        className="hover:bg-slate-700 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar name={amb.name} size="sm" />
                            <span className="text-white font-medium">{amb.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-300">{amb.college}</td>
                        <td className="px-6 py-4 text-white font-semibold">{amb.points}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${TIER_COLORS[amb.tier]} text-white`}
                          >
                            {amb.tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          {amb.streak > 0 ? (
                            <span className="text-orange-400 font-semibold">
                              🔥 {amb.streak} days
                            </span>
                          ) : (
                            <span className="text-gray-500">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              amb.status === 'Active'
                                ? 'bg-emerald-500/20 text-emerald-400'
                                : amb.status === 'Flagged'
                                ? 'bg-red-500/20 text-red-400'
                                : 'bg-gray-500/20 text-gray-400'
                            }`}
                          >
                            {amb.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {currentTab === 'submissions' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Pending Submissions</h2>

              {pendingSubmissions.length === 0 ? (
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-12 text-center">
                  <CheckCircle2 className="mx-auto text-emerald-400 mb-4" size={48} />
                  <p className="text-xl text-white font-semibold mb-2">All caught up!</p>
                  <p className="text-gray-400">No pending submissions to review.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pendingSubmissions.map((sub) => {
                    const task = tasks.find((t) => t.id === sub.taskId);
                    const ambassador = ambassadors.find((a) => a.id === sub.ambassadorId);
                    if (!task || !ambassador) return null;

                    return (
                      <div key={sub.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                        <div className="flex items-start gap-4 mb-4">
                          <Avatar name={ambassador.name} size="md" />
                          <div className="flex-1">
                            <p className="text-white font-semibold">{ambassador.name}</p>
                            <p className="text-sm text-gray-400">{ambassador.college}</p>
                          </div>
                          <span className="text-amber-400 font-semibold">{task.points} pts</span>
                        </div>

                        <h3 className="text-lg font-semibold text-white mb-2">{task.title}</h3>
                        <p className="text-sm text-gray-400 mb-4">
                          Submitted {new Date(sub.submittedAt).toLocaleString()}
                        </p>

                        {sub.proof && (
                          <div className="mb-4 p-3 bg-slate-700 rounded-lg">
                            {sub.proofType === 'URL' ? (
                              <a
                                href={sub.proof}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-indigo-400 hover:underline text-sm break-all"
                              >
                                {sub.proof}
                              </a>
                            ) : (
                              <p className="text-gray-300 text-sm">{sub.proof}</p>
                            )}
                          </div>
                        )}

                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(sub.id, task.points)}
                            className="flex-1 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors font-medium"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(sub.id, 'Did not meet requirements')}
                            className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {currentTab === 'tasks' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Tasks</h2>
                <button
                  onClick={() => setShowTaskModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <Plus size={20} />
                  Create Task
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tasks.map((task) => {
                  const completionCount = submissions.filter(
                    (sub) => sub.taskId === task.id && sub.status === 'approved'
                  ).length;

                  return (
                    <div key={task.id} className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-lg font-semibold text-white">{task.title}</h3>
                        <span className="px-2 py-1 bg-indigo-500/20 text-indigo-400 text-xs rounded-full">
                          {task.type}
                        </span>
                      </div>
                      <p className="text-gray-400 text-sm mb-4">{task.description}</p>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-amber-400 font-bold">{task.points} points</span>
                        <span className="text-gray-400 text-sm">
                          Due: {new Date(task.deadline).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-400">{completionCount} completed</span>
                        <span className="text-gray-600">•</span>
                        <span
                          className={
                            task.autoApprove ? 'text-emerald-400' : 'text-yellow-400'
                          }
                        >
                          {task.autoApprove ? 'Auto-approve' : 'Manual review'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {currentTab === 'leaderboard' && (
            <div>
              <h2 className="text-3xl font-bold text-white mb-6">Leaderboard</h2>

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
                        Badges
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-300 uppercase">
                        Streak
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {[...ambassadors]
                      .sort((a, b) => b.points - a.points)
                      .map((amb, index) => {
                        const rank = index + 1;
                        const rankColors =
                          rank === 1
                            ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white'
                            : rank === 2
                            ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-white'
                            : rank === 3
                            ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white'
                            : 'bg-slate-700 text-gray-300';

                        return (
                          <tr key={amb.id} className={rank <= 3 ? `bg-slate-700/50` : ''}>
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
                                <span className="text-white font-medium">{amb.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{amb.college}</td>
                            <td className="px-6 py-4">
                              <span className="text-amber-400 font-bold text-lg">{amb.points}</span>
                            </td>
                            <td className="px-6 py-4 text-gray-300">{amb.badgeCount}</td>
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
            </div>
          )}

          {currentTab === 'analytics' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold text-white">Analytics</h2>
                <button
                  onClick={() => exportAmbassadorsToCSV(ambassadors)}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  Export CSV
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Task Type Distribution</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={taskTypeData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {taskTypeData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap justify-center gap-4 mt-4">
                    {taskTypeData.map((entry, index) => (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                        <span className="text-sm text-gray-300">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Ambassador Growth</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={signupsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={12} tickFormatter={(tick) => tick.substring(5)} />
                        <YAxis stroke="#94A3B8" fontSize={12} allowDecimals={false} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Line type="monotone" dataKey="count" stroke="#6366F1" strokeWidth={3} dot={{ r: 4, fill: '#6366F1' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Top 3 Colleges by Points</h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={collegeData} layout="vertical" margin={{ left: 50 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#334155" horizontal={true} vertical={false} />
                        <XAxis type="number" stroke="#94A3B8" fontSize={12} />
                        <YAxis type="category" dataKey="name" stroke="#94A3B8" fontSize={12} width={100} tickFormatter={(val) => val.length > 15 ? val.substring(0, 15) + '...' : val} />
                        <Tooltip
                          cursor={{ fill: '#334155' }}
                          contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155', color: '#fff' }}
                          itemStyle={{ color: '#fff' }}
                        />
                        <Bar dataKey="points" fill="#10B981" radius={[0, 4, 4, 0]} barSize={20} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                
                <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-white mb-4">Top 5 Ambassadors</h3>
                  <div className="space-y-4">
                    {[...ambassadors]
                      .sort((a, b) => b.points - a.points)
                      .slice(0, 5)
                      .map((amb, index) => (
                        <div key={amb.id} className="flex items-center gap-4 p-3 bg-slate-700/50 rounded-lg">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                            index === 0 ? 'bg-yellow-500 text-white' :
                            index === 1 ? 'bg-gray-400 text-white' :
                            index === 2 ? 'bg-amber-700 text-white' :
                            'bg-slate-600 text-gray-300'
                          }`}>
                            {index + 1}
                          </div>
                          <Avatar name={amb.name} size="sm" />
                          <div className="flex-1">
                            <p className="text-white font-medium text-sm">{amb.name}</p>
                            <p className="text-gray-400 text-xs">{amb.college}</p>
                          </div>
                          <span className="text-amber-400 font-bold">{amb.points}</span>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <Modal
        isOpen={!!selectedAmbassador}
        onClose={() => setSelectedAmbassador(null)}
        title="Ambassador Details"
        size="lg"
      >
        {ambassadorDetail && (
          <div>
            <div className="flex items-start gap-6 mb-6">
              <Avatar name={ambassadorDetail.name} size="xl" />
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">{ambassadorDetail.name}</h3>
                <p className="text-gray-400 mb-2">{ambassadorDetail.college}</p>
                <div className="flex gap-3">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r ${
                      TIER_COLORS[ambassadorDetail.tier]
                    } text-white`}
                  >
                    {ambassadorDetail.tier}
                  </span>
                  <span className="px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-sm font-semibold">
                    {ambassadorDetail.points} points
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-6">
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Tasks Completed</p>
                <p className="text-2xl font-bold text-white">{ambassadorDetail.tasksCompleted}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Badges Earned</p>
                <p className="text-2xl font-bold text-white">{ambassadorDetail.badgeCount}</p>
              </div>
              <div className="bg-slate-700 rounded-lg p-4">
                <p className="text-gray-400 text-sm mb-1">Current Streak</p>
                <p className="text-2xl font-bold text-white">
                  {ambassadorDetail.streak > 0 ? `🔥 ${ambassadorDetail.streak}` : '-'}
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  flagAmbassador(ambassadorDetail.id, 'Manual review required');
                  toast.success('Ambassador flagged');
                  setSelectedAmbassador(null);
                }}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Flag Ambassador
              </button>
              <button
                onClick={() => {
                  if (confirm('Are you sure you want to remove this ambassador?')) {
                    removeAmbassador(ambassadorDetail.id);
                    toast.success('Ambassador removed');
                    setSelectedAmbassador(null);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        title="Create New Task"
        size="md"
      >
        <form onSubmit={handleCreateTask} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Task Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="e.g., Share our Instagram reel"
              maxLength={100}
            />
            <div className="text-right text-xs text-gray-400 mt-1">{newTask.title.length}/100</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Task Type</label>
              <select
                value={newTask.type}
                onChange={(e) => setNewTask({ ...newTask, type: e.target.value as TaskType })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Referral</option>
                <option>Social Post</option>
                <option>Event Attendance</option>
                <option>Content Creation</option>
                <option>Custom</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Points Value (10-500)</label>
              <input
                type="number"
                min="10"
                max="500"
                value={newTask.points}
                onChange={(e) => setNewTask({ ...newTask, points: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
            <textarea
              value={newTask.description}
              onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[100px]"
              placeholder="Provide clear instructions for the ambassador..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({ ...newTask, deadline: e.target.value })}
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div>
              <p className="font-medium text-white">Proof Required</p>
              <p className="text-xs text-gray-400">Ambassador must upload proof</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={newTask.proofRequired}
                onChange={(e) => setNewTask({ ...newTask, proofRequired: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          {newTask.proofRequired && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Proof Type</label>
              <select
                value={newTask.proofType}
                onChange={(e) => setNewTask({ ...newTask, proofType: e.target.value as ProofType })}
                className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option>Image</option>
                <option>URL</option>
                <option>Screenshot</option>
              </select>
            </div>
          )}

          <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
            <div>
              <p className="font-medium text-white">Auto-Approve Submissions</p>
              <p className="text-xs text-gray-400">Points credited immediately without manual review</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={newTask.autoApprove}
                onChange={(e) => setNewTask({ ...newTask, autoApprove: e.target.checked })}
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-500"></div>
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={() => setShowTaskModal(false)}
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors font-medium"
            >
              Create Task
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
