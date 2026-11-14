import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, Headphones, Award, Clock, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';

export const AgentProfilePage = () => {
  const { user } = useAuth();
  const [performance, setPerformance] = useState(null);

  useEffect(() => {
    api
      .get('/agents/performance')
      .then((res) => {
        if (res?.data) setPerformance(res.data);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Agent Profile & Stats</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review your personal resolution performance benchmarks and contact credentials.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs p-6 space-y-6">
        <div className="flex items-center gap-4">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
            alt="Agent Avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30"
          />
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.full_name}</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 font-semibold uppercase">
              Support Specialist (Agent)
            </span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Assigned</span>
            <p className="text-lg font-extrabold text-slate-900 dark:text-white">
              {performance?.totalAssigned || 0}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Resolved</span>
            <p className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
              {performance?.resolvedCount || 0}
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">Avg Resolution</span>
            <p className="text-lg font-extrabold text-brand-600 dark:text-brand-400">
              {performance?.avgResolutionHours || '1.8'}h
            </p>
          </div>
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-center">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">CSAT Score</span>
            <p className="text-lg font-extrabold text-amber-500">
              {performance?.csatScore || '4.9'}/5.0
            </p>
          </div>
        </div>

        {/* Credentials list */}
        <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Email Address</span>
            <span className="font-semibold text-slate-900 dark:text-white">{user?.email}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
            <span className="text-slate-400">Agent ID</span>
            <span className="font-mono text-slate-600 dark:text-slate-300">{user?.id}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-slate-400">Support Working Hours</span>
            <span className="font-semibold text-slate-900 dark:text-white">09:00 AM – 06:00 PM (EST)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

