import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  TrendingUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  RefreshCw,
  BarChart3,
  Bot,
  FileText,
  Download,
  Printer
} from 'lucide-react';
import { adminService } from '../../services/admin.service';
import { Modal } from '../../components/common/Modal';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import toast from 'react-hot-toast';

export const AdminAnalyticsPage = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);

  const fetchAnalytics = async () => {
    try {
      const res = await adminService.getAIAnalytics();
      if (res?.data) {
        setAnalytics(res.data);
      }
    } catch (err) {
      toast.error('Failed to load AI analytics');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    fetchAnalytics();
  };

  const handleDownloadCsv = () => {
    if (!analytics) return;
    const { metrics, ai_insights } = analytics;
    let csvContent = 'data:text/csv;charset=utf-8,';
    csvContent += 'HELPDESK AI - EXECUTIVE SUPPORT & COMPLAINTS REPORT\n\n';
    csvContent += `Generated On,${new Date().toISOString()}\n`;
    csvContent += `CSAT Satisfaction Score,${metrics?.csatScore || 4.5}/5.0\n`;
    csvContent += `AI Resolution Rate,${metrics?.aiResolutionRate || 78}%\n`;
    csvContent += `Average Resolution Time,${metrics?.avgResolutionHours || 2.4} hours\n\n`;

    csvContent += 'TOP RECURRING CUSTOMER ISSUES & COMPLAINTS\n';
    csvContent += 'Issue,Occurrences,AI Recommendation\n';
    (ai_insights?.top_issues || []).forEach((iss) => {
      csvContent += `"${iss.issue.replace(/"/g, '""')}",${iss.frequency},"${iss.recommendation.replace(/"/g, '""')}"\n`;
    });

    csvContent += '\nTICKET CATEGORY DISTRIBUTION\n';
    csvContent += 'Category,Ticket Count\n';
    (metrics?.categoryDistribution || []).forEach((cat) => {
      csvContent += `"${cat.name}",${cat.count}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `helpdesk-ai-report-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Executive analytics report downloaded as CSV');
  };

  if (loading) return <LoadingSpinner size="lg" text="Computing live analytics & running Gemini insights..." />;

  const { metrics, ai_insights } = analytics || {};
  const sentimentPieData = [
    { name: 'Positive', value: ai_insights?.sentiment_overview?.positive || metrics?.sentimentDistribution?.[0]?.count || 1, color: '#10b981' },
    { name: 'Neutral', value: ai_insights?.sentiment_overview?.neutral || metrics?.sentimentDistribution?.[1]?.count || 2, color: '#94a3b8' },
    { name: 'Negative', value: ai_insights?.sentiment_overview?.negative || metrics?.sentimentDistribution?.[2]?.count || 1, color: '#ef4444' }
  ];

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
              AI Customer Experience Analytics & Reports
            </h1>
            <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
              <Sparkles className="w-3 h-3 text-brand-600" /> Gemini Insights
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data aggregated from live tickets and analyzed with Google Gemini for actionable service improvements.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowReportModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
          >
            <FileText className="w-3.5 h-3.5" />
            Executive Report
          </button>

          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-800 dark:text-slate-200 shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Gemini AI Executive Performance Summary */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-brand-500/15 space-y-3">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-white" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-200">
            Gemini AI Executive Summary
          </h2>
        </div>
        <p className="text-sm sm:text-base text-white/95 leading-relaxed">
          {ai_insights?.overall_summary || 'Analyzing current operational metrics and ticket resolution patterns...'}
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-brand-100">
          <span>AI Resolution Rate: <strong>{metrics?.aiResolutionRate}%</strong></span>
          <span>•</span>
          <span>CSAT Satisfaction: <strong>{metrics?.csatScore}/5.0</strong></span>
          <span>•</span>
          <span>Average Resolution: <strong>{metrics?.avgResolutionHours} hours</strong></span>
        </div>
      </div>

      {/* Top Recurring Issues & Actionable Recommendations */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-brand-600 dark:text-brand-400" />
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Most Common Customer Issues & Recommendations
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(ai_insights?.top_issues || []).map((issue, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {issue.issue}
                </h4>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-950 dark:text-brand-300">
                  {issue.frequency} occurrences
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <strong>AI Recommendation:</strong> {issue.recommendation}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Grid: Sentiment Overview & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sentiment Pie */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Customer Sentiment Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Tone and sentiment detected across all support interactions
          </p>

          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={sentimentPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {sentimentPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
            Ticket Category Volume
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
            Live distribution across departments
          </p>

          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metrics?.categoryDistribution || []} layout="vertical">
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={11} tickLine={false} width={105} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Actionable Improvement Suggestions & Priority Recommendations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-brand-600 dark:text-brand-400">
            <Lightbulb className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              AI Process Improvement Suggestions
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {(ai_insights?.improvement_suggestions || []).map((sugg, i) => (
              <li key={i} className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-brand-500 shrink-0 mt-0.5" />
                <span>{sugg}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
            <AlertTriangle className="w-5 h-5" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Immediate Priority Recommendations
            </h3>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
            {(ai_insights?.priority_recommendations || []).map((rec, i) => (
              <li key={i} className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Executive Report Modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Executive Performance & Complaints Report"
        maxWidth="max-w-2xl"
      >
        <div className="space-y-5">
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Executive Briefing Summary
            </h4>
            <p className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 leading-relaxed">
              {ai_insights?.overall_summary}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">CSAT Score</span>
              <p className="text-lg font-extrabold text-emerald-600 mt-1">{metrics?.csatScore} / 5.0</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">AI Resolution</span>
              <p className="text-lg font-extrabold text-brand-600 mt-1">{metrics?.aiResolutionRate}%</p>
            </div>
            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] uppercase font-bold text-slate-400">Avg Resolution</span>
              <p className="text-lg font-extrabold text-indigo-600 mt-1">{metrics?.avgResolutionHours}h</p>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Common Customer Complaints & Recommended Mitigations
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {(ai_insights?.top_issues || []).map((iss, i) => (
                <div key={i} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                    <span>{iss.issue}</span>
                    <span className="text-brand-600">{iss.frequency} tickets</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400">{iss.recommendation}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 transition"
            >
              <Printer className="w-3.5 h-3.5" /> Print Report
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowReportModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
              <button
                onClick={handleDownloadCsv}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-xs transition"
              >
                <Download className="w-3.5 h-3.5" /> Download CSV
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
};
