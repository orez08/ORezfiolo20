import React, { useState, useEffect } from 'react';
import {
  Users,
  Eye,
  Activity,
  MessageSquare,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ExternalLink,
  RefreshCw,
  Mail,
} from 'lucide-react';
import { api } from '../../services/api.ts';
import { DashboardStats, PortfolioData } from '../../types.ts';

interface AdminDashboardProps {
  portfolio: PortfolioData;
  onNavigateSection: (section: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  portfolio,
  onNavigateSection,
}) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h1 className="font-display font-medium text-2xl sm:text-3xl text-[#F5F1EA] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs font-sans text-[#F5F1EA]/50 uppercase tracking-widest mt-1">
            Real-time portfolio intelligence, visitor actions & inquiries
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA]/80 hover:text-[#F5F1EA] hover:border-[#E8746A] transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Visits */}
        <div className="p-5 rounded-sm bg-[#181818] border border-[#F5F1EA]/10 hover:border-[#8B1E1E] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-sans uppercase tracking-widest text-[#F5F1EA]/50">
              Total Visits
            </span>
            <Eye className="w-4 h-4 text-[#E8746A]" />
          </div>
          <div className="font-display text-3xl font-semibold text-[#F5F1EA]">
            {stats?.totalVisits ?? 0}
          </div>
          <div className="text-[10px] font-sans text-[#F5F1EA]/40 mt-1">
            Across desktop & mobile
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="p-5 rounded-sm bg-[#181818] border border-[#F5F1EA]/10 hover:border-[#8B1E1E] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-sans uppercase tracking-widest text-[#F5F1EA]/50">
              Unique Visitors
            </span>
            <Users className="w-4 h-4 text-[#E8746A]" />
          </div>
          <div className="font-display text-3xl font-semibold text-[#F5F1EA]">
            {stats?.uniqueVisitors ?? 0}
          </div>
          <div className="text-[10px] font-sans text-[#F5F1EA]/40 mt-1">
            Distinct prospective clients
          </div>
        </div>

        {/* Total Interactions */}
        <div className="p-5 rounded-sm bg-[#181818] border border-[#F5F1EA]/10 hover:border-[#8B1E1E] transition-colors">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-sans uppercase tracking-widest text-[#F5F1EA]/50">
              Interactions Logged
            </span>
            <Activity className="w-4 h-4 text-[#E8746A]" />
          </div>
          <div className="font-display text-3xl font-semibold text-[#F5F1EA]">
            {stats?.totalInteractions ?? 0}
          </div>
          <div className="text-[10px] font-sans text-[#F5F1EA]/40 mt-1">
            Clicks, case views & CTAs
          </div>
        </div>

        {/* Messages */}
        <div
          onClick={() => onNavigateSection('messages')}
          className="p-5 rounded-sm bg-[#181818] border border-[#F5F1EA]/10 hover:border-[#E8746A] transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-sans uppercase tracking-widest text-[#F5F1EA]/50">
              Project Inquiries
            </span>
            <div className="flex items-center gap-1.5">
              {stats && stats.unreadMessages > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#8B1E1E] text-[10px] font-sans font-bold text-[#F5F1EA]">
                  {stats.unreadMessages} new
                </span>
              )}
              <MessageSquare className="w-4 h-4 text-[#E8746A]" />
            </div>
          </div>
          <div className="font-display text-3xl font-semibold text-[#F5F1EA] group-hover:text-[#E8746A] transition-colors">
            {stats?.totalMessages ?? 0}
          </div>
          <div className="text-[10px] font-sans text-[#F5F1EA]/40 mt-1 flex items-center justify-between">
            <span>Form submissions</span>
            <span className="text-[#E8746A]">View inbox &rarr;</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Top Projects + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Top Projects & Referrers */}
        <div className="lg:col-span-5 space-y-6">
          {/* Top Projects */}
          <div className="p-6 rounded-sm bg-[#181818] border border-[#F5F1EA]/10">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5F1EA]/10">
              <h3 className="font-display font-medium text-base text-[#F5F1EA]">
                Top Explored Projects
              </h3>
              <button
                onClick={() => onNavigateSection('work')}
                className="text-xs font-sans text-[#E8746A] hover:underline"
              >
                Manage Work &rarr;
              </button>
            </div>

            {stats?.topProjects && stats.topProjects.length > 0 ? (
              <div className="space-y-3">
                {stats.topProjects.map((p, idx) => (
                  <div
                    key={p.title}
                    className="flex items-center justify-between text-xs font-sans p-2.5 rounded-sm bg-[#141414] border border-[#F5F1EA]/5"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="text-[#E8746A] font-semibold">0{idx + 1}</span>
                      <span className="text-[#F5F1EA] truncate">{p.title}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-[#1C1C1C] text-[#F5F1EA]/70 text-[11px] font-semibold">
                      {p.views} views
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#F5F1EA]/40 font-sans py-4">
                Visitor project clicks will rank here automatically.
              </p>
            )}
          </div>

          {/* Top Traffic Referrers */}
          <div className="p-6 rounded-sm bg-[#181818] border border-[#F5F1EA]/10">
            <h3 className="font-display font-medium text-base text-[#F5F1EA] mb-4 pb-3 border-b border-[#F5F1EA]/10">
              Acquisition Sources
            </h3>
            {stats?.topReferrers && stats.topReferrers.length > 0 ? (
              <div className="space-y-2.5">
                {stats.topReferrers.map((r) => (
                  <div
                    key={r.referrer}
                    className="flex items-center justify-between text-xs font-sans"
                  >
                    <span className="text-[#F5F1EA]/70 truncate max-w-[200px]">
                      {r.referrer}
                    </span>
                    <span className="text-[#E8746A]">{r.count}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#F5F1EA]/40 font-sans py-2">
                Referrer data will appear as visitors arrive.
              </p>
            )}
          </div>
        </div>

        {/* Right: Live Activity Stream */}
        <div className="lg:col-span-7 p-6 rounded-sm bg-[#181818] border border-[#F5F1EA]/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#F5F1EA]/10">
              <h3 className="font-display font-medium text-base text-[#F5F1EA] flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E8746A] animate-ping" />
                <span>Live Visitor Interactions Feed</span>
              </h3>
              <button
                onClick={() => onNavigateSection('visitors')}
                className="text-xs font-sans text-[#E8746A] hover:underline"
              >
                Detailed Logs & CSV &rarr;
              </button>
            </div>

            {stats?.recentActivities && stats.recentActivities.length > 0 ? (
              <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
                {stats.recentActivities.slice(0, 10).map((act) => (
                  <div
                    key={act.id}
                    className="p-3 rounded-sm bg-[#141414] border border-[#F5F1EA]/5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-full bg-[#1C1C1C] text-[10px] font-sans uppercase text-[#E8746A]">
                          {act.interactionType.replace('_', ' ')}
                        </span>
                        {act.visitorName && (
                          <span className="font-semibold text-[#F5F1EA]">
                            {act.visitorName}
                          </span>
                        )}
                        <span className="text-[#F5F1EA]/60 font-sans text-[11px]">
                          {act.details || act.page}
                        </span>
                      </div>
                    </div>
                    <div className="text-[10px] font-sans text-[#F5F1EA]/40 self-end sm:self-center">
                      {new Date(act.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-xs font-sans text-[#F5F1EA]/40">
                No recorded interactions yet. Activity appears as prospective clients navigate the site.
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#F5F1EA]/10 flex items-center justify-between text-xs font-sans text-[#F5F1EA]/50">
            <span>Auto-synced with single database source</span>
            <span className="text-[#E8746A]">Status: Active</span>
          </div>
        </div>
      </div>
    </div>
  );
};
