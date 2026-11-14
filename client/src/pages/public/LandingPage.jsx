import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Bot,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  HeartHandshake,
  CheckCircle2,
  TrendingUp,
  MessageSquare,
  HelpCircle,
  ChevronRight,
  Send
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LandingPage = () => {
  const { isAuthenticated, role } = useAuth();
  const [demoInput, setDemoInput] = useState('');
  const [demoChat, setDemoChat] = useState([
    { sender: 'ai', text: 'Hello! I am HELPDESK AI. How can I help resolve your support query today?' }
  ]);
  const [isDemoTyping, setIsDemoTyping] = useState(false);

  const handleDemoSend = (e) => {
    e.preventDefault();
    if (!demoInput.trim()) return;

    const userText = demoInput;
    setDemoChat((prev) => [...prev, { sender: 'user', text: userText }]);
    setDemoInput('');
    setIsDemoTyping(true);

    setTimeout(() => {
      let aiReply = "I can assist you with that! According to our official knowledge base, we provide a 30-day money-back guarantee, instant password resets, and 24/7 specialist escalation.";
      if (userText.toLowerCase().includes('refund')) {
        aiReply = "Our refund policy allows a full 30-day money-back guarantee on all subscription plans. I can escalate this and open a ticket for our billing team if you'd like!";
      } else if (userText.toLowerCase().includes('password')) {
        aiReply = "To reset your password, visit the login page and click 'Forgot Password'. A secure reset link will be sent to your registered email.";
      }
      setDemoChat((prev) => [...prev, { sender: 'ai', text: aiReply }]);
      setIsDemoTyping(false);
    }, 900);
  };

  const getDashboardPath = () => {
    if (role === 'admin') return '/admin/dashboard';
    if (role === 'agent') return '/agent/dashboard';
    return '/customer/dashboard';
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/70 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-brand-500/25">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <span className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-brand-600 to-indigo-600 dark:from-brand-400 dark:to-indigo-300 bg-clip-text text-transparent">
                HELPDESK AI
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium leading-none">
                Instant Answers. Smarter Support.
              </p>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600 dark:text-slate-300">
            <a href="#features" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Features</a>
            <a href="#how-it-works" className="hover:text-brand-600 dark:hover:text-brand-400 transition">How It Works</a>
            <a href="#roles" className="hover:text-brand-600 dark:hover:text-brand-400 transition">Roles & Access</a>
          </div>

          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link
                to={getDashboardPath()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
              >
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 transition"
                >
                  Get Started <ArrowRight className="w-4 h-4" />
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.100),transparent)] dark:bg-[radial-gradient(45rem_50rem_at_top,theme(colors.brand.950),transparent)] opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-50 dark:bg-brand-950/70 border border-brand-200 dark:border-brand-800 text-brand-700 dark:text-brand-300 text-xs font-semibold mb-6 animate-pulse">
              <Sparkles className="w-3.5 h-3.5" /> Next-Generation AI Customer Experience Platform
            </div>

            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 dark:text-white leading-[1.15]">
              Instant Answers.{' '}
              <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Smarter Support.
              </span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-slate-600 dark:text-slate-300 leading-relaxed">
              Empower your business with Google Gemini AI. Resolve 80% of customer questions instantly, intelligently auto-classify tickets, route escalations to specialists, and unlock deep customer experience analytics.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/customer/chat"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-brand-600 hover:bg-brand-700 text-white shadow-xl shadow-brand-500/25 transition transform hover:-translate-y-0.5"
              >
                Try AI Chatbot Now <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl text-sm font-semibold bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 shadow-xs transition"
              >
                Sign In Demo Accounts
              </Link>
            </div>
          </div>

          {/* Interactive AI Chatbot Preview Card */}
          <div className="mt-16 max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-semibold">Live Interactive AI Chatbot Preview</span>
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Gemini 2.5 Flash Grounded</span>
            </div>

            <div className="p-6 h-72 overflow-y-auto space-y-3 bg-slate-50/50 dark:bg-slate-950/50">
              {demoChat.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-brand-600 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-brand-600 text-white rounded-tr-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 rounded-tl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {isDemoTyping && (
                <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                  <Bot className="w-4 h-4 animate-spin text-brand-500" /> HELPDESK AI is analyzing...
                </div>
              )}
            </div>

            <form onSubmit={handleDemoSend} className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex gap-2">
              <input
                type="text"
                value={demoInput}
                onChange={(e) => setDemoInput(e.target.value)}
                placeholder="Ask about refund policy, tracking, or how escalation works..."
                className="flex-1 px-4 py-2.5 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white"
              />
              <button
                type="submit"
                className="px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section id="features" className="py-20 bg-white dark:bg-slate-900/40 border-t border-slate-200/80 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Engineered for Enterprise Support Excellence
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Everything needed to reduce support ticket backlogs, maintain high CSAT satisfaction, and automate resolution workflows.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-brand-100 dark:bg-brand-950/80 text-brand-600 dark:text-brand-400 flex items-center justify-center mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI-Powered Instant Answers</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Google Gemini API contextual chatbot grounds answers in your verified Knowledge Base FAQs, preventing hallucinations while answering customer queries 24/7 in milliseconds.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-5">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Intelligent Ticket Classification</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                When tickets are created or escalated from chat, AI analyzes subject and intent to assign category, detect urgency sentiment, and route to the best qualified agent.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-700/60 hover:shadow-lg transition">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Real Customer Experience Analytics</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Never rely on mock metrics. Aggregates live database statistics, CSAT ratings, average resolution times, and delivers AI-generated operational recommendations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* User Roles Section */}
      <section id="roles" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
              Three Unified Roles in One Platform
            </h2>
            <p className="mt-3 text-slate-600 dark:text-slate-400 text-sm">
              Role-Based Access Control powered by Supabase Auth and PostgreSQL Row Level Security.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">
                  Customer Role
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Self-Serve & Quick Resolution</h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> AI Conversational Chatbot</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> One-click Ticket Escalation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Transparent Progress Tracking</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 1-5 Star Satisfaction Feedback</li>
                </ul>
              </div>
              <Link
                to="/customer/dashboard"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 transition"
              >
                Customer Portal <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
                  Support Agent Role
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">High-Velocity Ticket Triage</h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Assigned Ticket Queue</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> AI Problem Summaries & Priority Hints</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Private Internal Notes</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-blue-500" /> Customer Interaction History</li>
                </ul>
              </div>
              <Link
                to="/agent/dashboard"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 transition"
              >
                Agent Workspace <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-2">
                  Administrator Role
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-3">Executive Control & Insights</h3>
                <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400 mb-6">
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Live Aggregated Metrics & Charts</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Gemini AI CX Analytics Recommendations</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> Knowledge Base CMS & Publishing</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-purple-500" /> User & Agent Permissions Management</li>
                </ul>
              </div>
              <Link
                to="/admin/dashboard"
                className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 transition"
              >
                Admin Console <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-12 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 text-white flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-sm text-slate-900 dark:text-white">HELPDESK AI</p>
              <p className="text-[10px] text-slate-400">Instant Answers. Smarter Support.</p>
            </div>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            © {new Date().getFullYear()} HELPDESK AI. Built with React, Node.js, Supabase & Google Gemini AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

