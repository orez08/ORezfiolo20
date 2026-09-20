import React, { useState, useEffect } from 'react';
import {
  Search,
  Download,
  Filter,
  UserCheck,
  Globe,
  Monitor,
  Smartphone,
  MousePointer,
  RefreshCw,
  Clock,
  Calendar,
} from 'lucide-react';
import { api } from '../../../services/api.ts';
import { VisitorLog } from '../../../types.ts';

export const VisitorsTracker: React.FC = () => {
  const [logs, setLogs] = useState<VisitorLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getVisitorLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to fetch visitor logs', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleDownloadCsv = () => {
    window.location.href = '/api/analytics/export';
  };

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesType = typeFilter === 'all' || log.interactionType === typeFilter;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      log.visitorId?.toLowerCase().includes(query) ||
      log.visitorName?.toLowerCase().includes(query) ||
      log.visitorEmail?.toLowerCase().includes(query) ||
      log.details?.toLowerCase().includes(query) ||
      log.projectClicked?.toLowerCase().includes(query) ||
      log.sectionViewed?.toLowerCase().includes(query) ||
      log.city?.toLowerCase().includes(query) ||
      log.country?.toLowerCase().includes(query);

    return matchesType && matchesSearch;
  });

  // Calculate quick stats for simple chart / distribution
  const typeCounts: Record<string, number> = {
    visit: 0,
    project_click: 0,
    contact_click: 0,
    form_submission: 0,
  };

  logs.forEach((l) => {
    if (typeCounts[l.interactionType] !== undefined) {
      typeCounts[l.interactionType]++;
    }
  });

  const totalActions = logs.length || 1;

  return (
    <div className="space-y-8 max-w-6xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F5F1EA]/10 pb-6">
        <div>
          <h2 className="font-display font-medium text-2xl text-[#F5F1EA]">
            Visitors & Interaction Intelligence
          </h2>
          <p className="text-xs font-sans text-[#F5F1EA]/50 mt-1 uppercase tracking-wider">
            Audited sessions, project clicks, and identities linked from contact inquiries
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={fetchLogs}
            disabled={loading}
            className="p-2.5 rounded-full border border-[#F5F1EA]/15 text-[#F5F1EA]/70 hover:text-[#F5F1EA] hover:border-[#E8746A] transition-colors"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#181818] border border-[#F5F1EA]/20 text-xs font-sans uppercase tracking-wider text-[#F5F1EA] hover:border-[#E8746A] hover:bg-[#8B1E1E] transition-colors shadow-lg"
          >
            <Download className="w-3.5 h-3.5 text-[#E8746A]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Distribution Chart Bar */}
      <div className="bg-[#181818] p-6 rounded-sm border border-[#F5F1EA]/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-sans text-[#F5F1EA]/60 uppercase">
          <span>Interaction Breakdown</span>
          <span>{logs.length} Total Captured Events</span>
        </div>

        {/* Visual percentage bar */}
        <div className="h-3.5 w-full bg-[#141414] rounded-full overflow-hidden flex">
          <div
            style={{ width: `${(typeCounts.visit / totalActions) * 100}%` }}
            className="bg-neutral-600 h-full"
            title={`Visits: ${typeCounts.visit}`}
          />
          <div
            style={{ width: `${(typeCounts.project_click / totalActions) * 100}%` }}
            className="bg-[#8B1E1E] h-full"
            title={`Project Clicks: ${typeCounts.project_click}`}
          />
          <div
            style={{ width: `${(typeCounts.contact_click / totalActions) * 100}%` }}
            className="bg-[#E8746A] h-full"
            title={`Contact Clicks: ${typeCounts.contact_click}`}
          />
          <div
            style={{ width: `${(typeCounts.form_submission / totalActions) * 100}%` }}
            className="bg-emerald-500 h-full"
            title={`Form Submissions: ${typeCounts.form_submission}`}
          />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-[11px] font-sans pt-1">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-neutral-600" />
            <span className="text-[#F5F1EA]/70">Site Visits ({typeCounts.visit})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B1E1E]" />
            <span className="text-[#F5F1EA]/70">Project Clicks ({typeCounts.project_click})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#E8746A]" />
            <span className="text-[#F5F1EA]/70">Contact Clicks ({typeCounts.contact_click})</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-[#F5F1EA]/70">Form Briefs ({typeCounts.form_submission})</span>
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#F5F1EA]/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by client name, email, project..."
            className="w-full pl-10 pr-4 py-2 rounded-sm bg-[#181818] border border-[#F5F1EA]/15 text-xs text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-[#F5F1EA]/40" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 rounded-sm bg-[#181818] border border-[#F5F1EA]/15 text-xs font-sans text-[#F5F1EA] focus:outline-none focus:border-[#E8746A]"
          >
            <option value="all">All Interaction Types</option>
            <option value="visit">Site / Section Visits</option>
            <option value="project_click">Project Views</option>
            <option value="contact_click">Email / Phone Clicks</option>
            <option value="form_submission">Form Submissions</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-[#181818] rounded-sm border border-[#F5F1EA]/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-sans">
            <thead className="bg-[#141414] border-b border-[#F5F1EA]/10 text-[10px] uppercase tracking-wider text-[#F5F1EA]/50">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Visitor Identity</th>
                <th className="py-3 px-4">Interaction Type</th>
                <th className="py-3 px-4">Activity Details</th>
                <th className="py-3 px-4">Device / Geo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F5F1EA]/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#F5F1EA]/40">
                    No matching activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const hasIdentity = Boolean(log.visitorName || log.visitorEmail);
                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-[#1C1C1C] transition-colors ${
                        hasIdentity ? 'bg-[#8B1E1E]/5' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#F5F1EA]/60">
                        <div>
                          {new Date(log.timestamp).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-[#F5F1EA]/40">
                          {new Date(log.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Identity (linked if submitted form) */}
                      <td className="py-3 px-4">
                        {hasIdentity ? (
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-3.5 h-3.5 text-[#E8746A] flex-shrink-0" />
                            <div>
                              <div className="font-semibold text-[#F5F1EA]">
                                {log.visitorName || 'Identified Lead'}
                              </div>
                              <div className="text-[10px] text-[#E8746A] font-sans">
                                {log.visitorEmail}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="text-[#F5F1EA]/40 font-sans text-[11px] truncate max-w-[120px]">
                            {log.visitorId.slice(0, 12)}...
                          </div>
                        )}
                      </td>

                      {/* Type */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-semibold ${
                            log.interactionType === 'form_submission'
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                              : log.interactionType === 'contact_click'
                              ? 'bg-[#8B1E1E]/40 text-[#E8746A] border border-[#8B1E1E]'
                              : log.interactionType === 'project_click'
                              ? 'bg-[#1C1C1C] text-[#F5F1EA] border border-[#F5F1EA]/20'
                              : 'bg-[#141414] text-[#F5F1EA]/60'
                          }`}
                        >
                          {log.interactionType.replace('_', ' ')}
                        </span>
                      </td>

                      {/* Details */}
                      <td className="py-3 px-4 text-[#F5F1EA]/80 max-w-xs">
                        <div className="truncate font-sans font-normal text-xs">
                          {log.details || log.projectClicked || log.sectionViewed || log.page}
                        </div>
                        {log.referrer && log.referrer !== 'Direct' && (
                          <div className="text-[10px] text-[#F5F1EA]/40 truncate">
                            via {log.referrer}
                          </div>
                        )}
                      </td>

                      {/* Device & Geo */}
                      <td className="py-3 px-4 whitespace-nowrap text-[#F5F1EA]/50 text-[11px]">
                        <div className="flex items-center gap-1.5">
                          {log.device === 'Mobile' ? (
                            <Smartphone className="w-3 h-3 text-[#F5F1EA]/40" />
                          ) : (
                            <Monitor className="w-3 h-3 text-[#F5F1EA]/40" />
                          )}
                          <span>
                            {log.browser} • {log.device}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-[#F5F1EA]/40 mt-0.5">
                          <Globe className="w-2.5 h-2.5" />
                          <span>
                            {log.city || 'Lagos'}, {log.country || 'Nigeria'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
