import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';
import { Users, Target, TrendingUp, Award } from 'lucide-react';
import { useAmbassadorStore } from '../stores/ambassadorStore';

export const Landing = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'organization' | 'ambassador'>('organization');

  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user) {
    navigate(user.role === 'organization' ? '/org/dashboard' : '/ambassador/dashboard');
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    if (isLogin) {
      const success = login(email, password);
      if (success) {
        toast.success('Welcome to CampusConnect!');
      } else {
        toast.error('Invalid credentials');
      }
    } else {
      const userId = `usr_${Date.now()}`;
      const success = useAuthStore.getState().register({ id: userId, email, password, role });
      if (success) {
        if (role === 'ambassador') {
          // Initialize their ambassador profile
          useAmbassadorStore.getState().addAmbassador({
            id: userId,
            name: email.split('@')[0],
            email: email,
            college: 'New University',
            year: 1,
            points: 0,
            streak: 0,
            badgeCount: 0,
            tasksCompleted: 0,
            status: 'Active',
            tier: 'Bronze',
            joinDate: new Date().toISOString(),
            lastActiveDate: new Date().toISOString(),
            badges: [],
            referralCode: `REF-${Math.floor(Math.random() * 10000)}`,
          });
        }
        toast.success('Account created successfully!');
      } else {
        toast.error('Registration failed');
      }
    }
  };

  const handleDemoLogin = (demoRole: 'organization' | 'ambassador') => {
    const credentials =
      demoRole === 'organization'
        ? { email: 'admin@techlaunch.in', password: 'Admin@123' }
        : { email: 'ambassador@demo.com', password: 'Demo@123' };

    const success = login(credentials.email, credentials.password);
    if (success) {
      toast.success('Welcome to CampusConnect!');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-12 items-center min-h-screen">
          <div className="flex-1 text-white">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
              CampusConnect
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              Automated Campus Ambassador Management Platform
            </p>
            <p className="text-gray-400 mb-12 text-lg">
              Transform your Campus Ambassador program with automated task management,
              gamification, and real-time analytics.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                <Users className="text-indigo-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold mb-1">Manage Ambassadors</h3>
                  <p className="text-sm text-gray-400">
                    Track performance, assign tasks, and engage your campus ambassadors
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                <Target className="text-purple-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold mb-1">Smart Task System</h3>
                  <p className="text-sm text-gray-400">
                    Create, assign, and auto-approve tasks with proof verification
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                <TrendingUp className="text-emerald-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold mb-1">Real-time Analytics</h3>
                  <p className="text-sm text-gray-400">
                    Monitor program health, engagement, and ambassador performance
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50">
                <Award className="text-amber-400 flex-shrink-0" size={24} />
                <div>
                  <h3 className="font-semibold mb-1">Gamification</h3>
                  <p className="text-sm text-gray-400">
                    Points, badges, streaks, and leaderboards to boost engagement
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-[450px]">
            <div className="bg-slate-800 rounded-2xl shadow-2xl p-8 border border-slate-700">
              <div className="flex gap-2 mb-6">
                <button
                  onClick={() => setIsLogin(true)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    isLogin
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-gray-400 hover:text-white'
                  }`}
                >
                  Login
                </button>
                <button
                  onClick={() => setIsLogin(false)}
                  className={`flex-1 py-2 px-4 rounded-lg font-semibold transition-all ${
                    !isLogin
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-gray-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    I am a/an
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('organization')}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${
                        role === 'organization'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      Organization
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('ambassador')}
                      className={`py-2 px-4 rounded-lg font-medium transition-all ${
                        role === 'ambassador'
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-700 text-gray-400 hover:text-white'
                      }`}
                    >
                      Ambassador
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    placeholder="••••••••"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-semibold rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
                >
                  {isLogin ? 'Login' : 'Create Account'}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-slate-700">
                <p className="text-sm text-gray-400 mb-3 text-center">Quick Demo Access</p>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => handleDemoLogin('organization')}
                    className="w-full py-2 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all text-sm"
                  >
                    Demo as Organization
                  </button>
                  <button
                    onClick={() => handleDemoLogin('ambassador')}
                    className="w-full py-2 px-4 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-all text-sm"
                  >
                    Demo as Ambassador
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
