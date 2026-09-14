import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.js';
import { getHealth } from '../../services/api.js';
import { getAdminStats } from '../../services/authApi.js';
import {
  Code2,
  FolderGit2,
  GraduationCap,
  Mail,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Server,
  Database,
  Activity,
  Loader2,
  AlertCircle,
} from 'lucide-react';

export default function DashboardOverview() {
  const { admin, token } = useAuth();

  const [backendHealth, setBackendHealth] = useState({
    loading: true,
    healthy: false,
    message: '',
    timestamp: null,
  });

  const [stats, setStats] = useState({
    loading: true,
    error: null,
    data: null,
  });

  // Fetch backend health
  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        const res = await getHealth();
        if (isMounted && res.success) {
          setBackendHealth({
            loading: false,
            healthy: true,
            message: res.message || 'Operational',
            timestamp: res.timestamp,
          });
        }
      } catch {
        if (isMounted) {
          setBackendHealth({ loading: false, healthy: false, message: 'Unavailable', timestamp: null });
        }
      }
    }
    checkHealth();
    return () => { isMounted = false; };
  }, []);

  // Fetch real dashboard stats
  useEffect(() => {
    if (!token) return;
    let isMounted = true;

    async function fetchStats() {
      try {
        const res = await getAdminStats(token);
        if (isMounted && res.success) {
          setStats({ loading: false, error: null, data: res.data });
        }
      } catch (err) {
        if (isMounted) {
          setStats({ loading: false, error: err.message || 'Failed to load stats', data: null });
        }
      }
    }

    fetchStats();
    return () => { isMounted = false; };
  }, [token]);

  const metricCards = [
    {
      label: 'Total Skills',
      key: 'skills',
      icon: Code2,
      link: '/admin/skills',
      color: 'from-blue-500/10 to-indigo-500/10 text-blue-400 border-blue-500/20',
    },
    {
      label: 'Total Projects',
      key: 'projects',
      icon: FolderGit2,
      link: '/admin/projects',
      color: 'from-emerald-500/10 to-teal-500/10 text-emerald-400 border-emerald-500/20',
    },
    {
      label: 'Timeline Entries',
      key: 'timelineEntries',
      icon: GraduationCap,
      link: '/admin/timeline',
      color: 'from-purple-500/10 to-pink-500/10 text-purple-400 border-purple-500/20',
    },
    {
      label: 'Contact Inquiries',
      key: 'totalMessages',
      icon: Mail,
      link: '/admin/messages',
      color: 'from-amber-500/10 to-orange-500/10 text-amber-400 border-amber-500/20',
      badge: stats.data?.unreadMessages > 0 ? `${stats.data.unreadMessages} unread` : null,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-900/90 to-zinc-950 p-6 sm:p-8 border border-zinc-800/80 shadow-xl">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 rounded-full bg-emerald-500/5 blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-mono uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-2">
              <Sparkles className="w-3 h-3" />
              <span>Admin Session Active</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-zinc-100">
              Welcome back, {admin?.username || 'Administrator'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1 max-w-xl">
              Manage your portfolio content, projects, education history, and review contact submissions from this secure console.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to="/admin/profile"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-emerald-500 text-zinc-950 hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
            >
              <span>Edit Profile</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Stats Error Banner */}
      {stats.error && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
          <span>Could not load statistics: {stats.error}</span>
        </div>
      )}

      {/* Live Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((card) => {
          const Icon = card.icon;
          const value = stats.data?.[card.key];
          return (
            <Link
              key={card.label}
              to={card.link}
              className="group p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:border-zinc-700 transition-all hover:bg-zinc-900/90 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs font-medium text-zinc-400">{card.label}</p>
                  <div className="mt-1.5 flex items-baseline gap-1.5">
                    {stats.loading ? (
                      <Loader2 className="w-5 h-5 text-zinc-600 animate-spin" />
                    ) : (
                      <p className="text-2xl font-bold text-zinc-100 tracking-tight">
                        {value ?? '—'}
                      </p>
                    )}
                  </div>
                  {card.badge && !stats.loading && (
                    <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/20">
                      {card.badge}
                    </span>
                  )}
                </div>
                <div className={`p-2.5 rounded-xl border bg-gradient-to-br ${card.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-zinc-800/60 flex items-center justify-between text-[11px] text-zinc-500">
                <span>{stats.loading ? 'Loading...' : value === 0 ? 'Empty collection' : 'Click to manage'}</span>
                <ArrowRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-300 group-hover:translate-x-0.5 transition-all" />
              </div>
            </Link>
          );
        })}
      </div>

      {/* System Status & Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Backend & Database Health Widget */}
        <div className="p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-semibold text-zinc-200">System Status</h3>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Server className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300 font-medium">Express API</span>
              </div>
              <div className="flex items-center gap-1.5">
                {backendHealth.loading ? (
                  <Loader2 className="w-3 h-3 text-zinc-400 animate-spin" />
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full ${
                      backendHealth.healthy ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'
                    }`}
                  />
                )}
                <span className="text-xs text-zinc-400 font-mono">
                  {backendHealth.loading ? 'Checking...' : backendHealth.healthy ? 'Online (Port 5000)' : 'Offline'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Database className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300 font-medium">MongoDB Atlas</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs text-zinc-400 font-mono">portfolio</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/60 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-zinc-400" />
                <span className="text-xs text-zinc-300 font-medium">Server Time</span>
              </div>
              <span className="text-[11px] text-zinc-400 font-mono">
                {backendHealth.timestamp
                  ? new Date(backendHealth.timestamp).toLocaleTimeString()
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Quick Launchpad */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-zinc-200 mb-1">Management Launchpad</h3>
            <p className="text-xs text-zinc-400 mb-4">
              Navigate to portfolio sections to manage your professional profile and assets.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { name: 'Profile Details', path: '/admin/profile', desc: 'About & bio' },
                { name: 'Skills Registry', path: '/admin/skills', desc: 'Tech stack' },
                { name: 'Projects Showcase', path: '/admin/projects', desc: 'Case studies' },
                { name: 'Timeline', path: '/admin/timeline', desc: 'Degree & career' },
                { name: 'Inquiries', path: '/admin/messages', desc: 'Contact submissions' },
                { name: 'Website Settings', path: '/admin/settings', desc: 'Meta & appearance' },
              ].map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="p-3 rounded-xl bg-zinc-950/50 border border-zinc-800/60 hover:border-zinc-700 hover:bg-zinc-800/40 transition-all text-left group"
                >
                  <p className="text-xs font-semibold text-zinc-200 group-hover:text-emerald-400 transition-colors">
                    {item.name}
                  </p>
                  <p className="text-[10px] text-zinc-500 mt-0.5">{item.desc}</p>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-zinc-800/60 flex items-center justify-between text-xs text-zinc-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Authentication system active & verified</span>
            </span>
            <span className="font-mono text-[10px]">STEP 5 FOUNDATION</span>
          </div>
        </div>
      </div>
    </div>
  );
}
