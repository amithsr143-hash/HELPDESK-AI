import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Settings, Save, ShieldCheck, Clock, Sliders, BellRing, Sparkles, FolderTree, Users, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminSettingsPage = () => {
  const [defaultPriority, setDefaultPriority] = useState('medium');
  const [autoAssignment, setAutoAssignment] = useState(true);
  const [autoEscalateUrgent, setAutoEscalateUrgent] = useState(true);
  const [aiConfidenceThreshold, setAiConfidenceThreshold] = useState('85');
  const [supportHours, setSupportHours] = useState('09:00 - 18:00 EST');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [inAppNotifications, setInAppNotifications] = useState(true);

  const handleSave = (e) => {
    e.preventDefault();
    toast.success('Platform operational settings saved successfully!');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Platform Settings & Advisory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Configure default ticket handling policies, AI escalation thresholds, and support working schedules.
        </p>
      </div>

      {/* Quick Access to Category & Role Management */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          to="/admin/categories"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-brand-500 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <FolderTree className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 transition">
                Category Management
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Manage departments, routing classifications & active queues
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 transition" />
        </Link>

        <Link
          to="/admin/customers"
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-brand-500 transition flex items-center justify-between group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-blue-600 transition">
                Role & User Permissions
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Grant Customer, Support Agent, or Administrator roles
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition" />
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Support Automation Rules */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sliders className="w-5 h-5 text-brand-600 dark:text-brand-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Ticket Routing & Automation Policies
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Default Ticket Priority
              </label>
              <select
                value={defaultPriority}
                onChange={(e) => setDefaultPriority(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Support Working Hours
              </label>
              <input
                type="text"
                value={supportHours}
                onChange={(e) => setSupportHours(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoAssignment}
                onChange={(e) => setAutoAssignment(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Automatic Round-Robin Agent Assignment
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Assign newly created tickets automatically to active support agents with the lowest current workload.
                </span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoEscalateUrgent}
                onChange={(e) => setAutoEscalateUrgent(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  Auto-Escalate Critical Service Outages
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Instantly flag tickets containing severe negative sentiment or outage keywords as Urgent.
                </span>
              </div>
            </label>
          </div>
        </div>

        {/* AI Behavior Configuration */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Google Gemini AI Assistant Rules
            </h2>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Minimum AI Confidence Threshold for Direct Resolution: {aiConfidenceThreshold}%
            </label>
            <input
              type="range"
              min="50"
              max="95"
              step="5"
              value={aiConfidenceThreshold}
              onChange={(e) => setAiConfidenceThreshold(e.target.value)}
              className="w-full accent-brand-600"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              If Gemini evaluation confidence falls below this threshold, the chatbot will proactively prompt the customer to escalate to human support.
            </p>
          </div>

          <div className="p-3.5 bg-brand-50 dark:bg-brand-950/40 rounded-xl border border-brand-200/80 dark:border-brand-800/60 text-xs text-brand-900 dark:text-brand-300 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0 mt-0.5" />
            <span>
              <strong>Security Protocol:</strong> Server secrets, Gemini API tokens, and Supabase service-role credentials are exclusively managed server-side via environment variables to prevent client exposure.
            </span>
          </div>
        </div>

        {/* Notifications Dispatch */}
        <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <BellRing className="w-5 h-5 text-amber-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Customer Notification Channels
            </h2>
          </div>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inAppNotifications}
                onChange={(e) => setInAppNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                In-App Realtime Notification Bell & Drawer
              </span>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={emailNotifications}
                onChange={(e) => setEmailNotifications(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500 border-slate-300"
              />
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                Email Dispatch on Ticket Creation, Assignment, and Resolution
              </span>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
          >
            <Save className="w-4 h-4" /> Save Advisory Settings
          </button>
        </div>
      </form>
    </div>
  );
};

