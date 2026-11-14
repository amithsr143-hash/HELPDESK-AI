import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Sparkles,
  User,
  AlertTriangle,
  RotateCcw,
  Plus,
  History,
  MessageSquare,
  Clock,
  ShieldAlert,
  Loader2,
  BookOpen,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { chatService } from '../../services/chat.service';
import { Modal } from '../../components/common/Modal';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export const CustomerChatPage = () => {
  const initialWelcome = {
    id: 'welcome',
    sender_type: 'ai',
    content:
      'Hello! I am HELPDESK AI, your intelligent support assistant. I can answer questions about billing, order tracking, returns, and troubleshooting from our verified knowledge base. How can I help you today?',
    created_at: new Date().toISOString()
  };

  const [messages, setMessages] = useState([initialWelcome]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loadingConversations, setLoadingConversations] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [escalationData, setEscalationData] = useState(null);
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [isEscalating, setIsEscalating] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  const suggestedQuestions = [
    'What is your 30-day refund policy?',
    'How do I reset my account password?',
    'How can I track my package delivery?',
    'I need to escalate an issue to a human agent'
  ];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const fetchConversations = async (autoSelectFirst = false) => {
    setLoadingConversations(true);
    try {
      const res = await chatService.getConversations();
      if (res?.data) {
        setConversations(res.data);
        if (autoSelectFirst && res.data.length > 0) {
          handleSelectConversation(res.data[0]);
        }
      }
    } catch (e) {
      // Non-blocking
    } finally {
      setLoadingConversations(false);
    }
  };

  useEffect(() => {
    fetchConversations(true);
  }, []);

  const handleSelectConversation = async (conv) => {
    if (conv.id === conversationId) return;
    setConversationId(conv.id);
    setIsTyping(false);
    setEscalationData(null);

    try {
      const res = await chatService.getConversation(conv.id);
      if (res?.data) {
        const rawMsgs = res.data.messages || [];
        if (rawMsgs.length > 0) {
          setMessages(
            rawMsgs.map((m) => ({
              id: m.id,
              sender_type: m.sender_type,
              content: m.content,
              metadata: m.metadata || null,
              created_at: m.created_at
            }))
          );
        } else {
          setMessages([initialWelcome]);
        }
      }
    } catch (err) {
      toast.error('Failed to load conversation history');
    }
  };

  const handleStartNewChat = () => {
    setConversationId(null);
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender_type: 'ai',
        content:
          'New conversation started. How can HELPDESK AI help resolve your support query today?',
        created_at: new Date().toISOString()
      }
    ]);
    setInputText('');
    setEscalationData(null);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text || !text.trim() || isTyping) return;

    const userMsg = {
      id: Date.now().toString(),
      sender_type: 'customer',
      content: text,
      created_at: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsTyping(true);

    try {
      const res = await chatService.sendMessage({
        conversation_id: conversationId,
        message: text
      });

      if (res?.data) {
        setConversationId(res.data.conversation_id);
        const aiMsg = {
          id: (Date.now() + 1).toString(),
          sender_type: 'ai',
          content: res.data.ai_response.response,
          metadata: res.data.ai_response,
          created_at: new Date().toISOString()
        };
        setMessages((prev) => [...prev, aiMsg]);

        // Refresh conversation history in background
        fetchConversations(false);

        // If Gemini recommends escalation or customer requested human support
        if (
          res.data.ai_response.requires_human ||
          res.data.ai_response.suggested_action === 'escalate_to_human'
        ) {
          setEscalationData({
            conversation_id: res.data.conversation_id,
            subject: text.slice(0, 80),
            description: `Escalated inquiry from AI Chatbot: "${text}". Customer requires specialist review.`,
            priority: res.data.ai_response.sentiment === 'negative' ? 'high' : 'medium'
          });
        }
      }
    } catch (err) {
      toast.error(err.message || 'Failed to get response from AI. Please try again.', { id: 'ai-chat-err' });
    } finally {
      setIsTyping(false);
    }
  };

  const handleConfirmEscalation = async () => {
    if (!escalationData) return;
    setIsEscalating(true);
    try {
      const res = await chatService.escalateToTicket(escalationData);
      const ticket = res.data;
      toast.success(`Support Ticket #${ticket.ticket_number} created successfully!`);
      setShowEscalationModal(false);
      setEscalationData(null);

      // Append confirmation message to chat
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          sender_type: 'ai',
          content: `Support ticket #${ticket.ticket_number} has been created and assigned to our specialist queue. You can track progress in your My Tickets tab.`,
          created_at: new Date().toISOString()
        }
      ]);

      // Direct option to open ticket
      navigate(`/customer/tickets/${ticket.id}`);
    } catch (err) {
      toast.error(err.message || 'Failed to create escalated ticket');
    } finally {
      setIsEscalating(false);
    }
  };

  const handleClearChat = () => {
    handleStartNewChat();
    toast.success('Chat history cleared');
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex glass-panel rounded-3xl shadow-2xl overflow-hidden border border-slate-200/80 dark:border-slate-800/80 relative">
      {/* Collapsible Conversation History Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-72 sm:w-80' : 'w-0'
        } transition-all duration-200 border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col bg-slate-50/50 dark:bg-slate-950/60 backdrop-blur-md overflow-hidden shrink-0`}
      >
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-brand-500/15 flex items-center justify-center text-brand-600 dark:text-brand-400">
              <History className="w-3.5 h-3.5" />
            </div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Chat History
            </h3>
          </div>
          <button
            onClick={handleStartNewChat}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white shadow-xs hover:shadow-glow-sm transition"
            title="Start new conversation"
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {loadingConversations ? (
            <div className="p-4 text-center text-xs text-slate-400">Loading history...</div>
          ) : conversations.length > 0 ? (
            conversations.map((conv) => {
              const isActive = conv.id === conversationId;
              const msgCount = conv.messages?.length || 0;
              return (
                <button
                  key={conv.id}
                  onClick={() => handleSelectConversation(conv)}
                  className={`w-full text-left p-3 rounded-2xl text-xs transition flex items-start gap-2.5 group relative ${
                    isActive
                      ? 'bg-gradient-to-r from-brand-500/15 via-purple-500/10 to-transparent border-l-4 border-brand-500 text-brand-950 dark:text-brand-100 font-bold shadow-xs'
                      : 'hover:bg-slate-200/40 dark:hover:bg-slate-800/50 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <MessageSquare
                    className={`w-4 h-4 shrink-0 mt-0.5 ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate">
                      {conv.title || 'Support Conversation'}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-normal">
                      <span>
                        {conv.created_at ? format(new Date(conv.created_at), 'MMM d, h:mm a') : 'Recent'}
                      </span>
                      {msgCount > 0 && <span className="px-1.5 py-0.5 rounded-full bg-slate-200/60 dark:bg-slate-800 text-[9px]">{msgCount} msgs</span>}
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 shrink-0 transition ${
                      isActive
                        ? 'text-brand-600 dark:text-brand-400'
                        : 'opacity-0 group-hover:opacity-100 text-slate-400'
                    }`}
                  />
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No previous chats yet. Messages you send will appear here.
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="flex-1 flex flex-col min-w-0 bg-transparent">
        {/* Chat Header */}
        <div className="px-4 sm:px-6 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between bg-white/40 dark:bg-slate-900/40 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition"
              title={sidebarOpen ? 'Hide conversation history' : 'Show conversation history'}
            >
              {sidebarOpen ? (
                <PanelLeftClose className="w-5 h-5" />
              ) : (
                <PanelLeftOpen className="w-5 h-5" />
              )}
            </button>

            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-brand-600 via-indigo-600 to-purple-600 text-white flex items-center justify-center shadow-glow-sm shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-extrabold text-slate-900 dark:text-white bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 dark:from-brand-400 dark:via-indigo-300 dark:to-purple-300 bg-clip-text text-transparent">
                  HELPDESK AI Assistant
                </h2>
                <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100/80 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300/40 dark:border-emerald-800/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live & Ready
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Grounded in verified Knowledge Base • Google Gemini Powered
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {escalationData && (
              <button
                onClick={() => setShowEscalationModal(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800 animate-bounce"
              >
                <AlertTriangle className="w-3.5 h-3.5" /> Escalate to Human Ticket
              </button>
            )}

            <button
              onClick={handleClearChat}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl hover:bg-slate-200/50 dark:hover:bg-slate-800 transition"
              title="Reset Chat View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/20 dark:bg-slate-950/30">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender_type === 'customer' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender_type === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                  msg.sender_type === 'customer'
                    ? 'bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 text-white rounded-tr-none shadow-glow-sm'
                    : 'glass-card text-slate-800 dark:text-slate-100 rounded-tl-none border border-slate-200/70 dark:border-slate-700/60 shadow-xs'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>

                {/* Display AI Metadata pills if present */}
                {msg.metadata && (
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center gap-1.5 text-[10px]">
                    <span className="px-2 py-0.5 rounded-md bg-brand-500/10 text-brand-700 dark:text-brand-300 font-mono font-semibold">
                      intent: {msg.metadata.intent}
                    </span>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-mono font-semibold">
                      confidence: {Math.round((msg.metadata.confidence || 0.9) * 100)}%
                    </span>
                    {msg.metadata.related_articles?.length > 0 && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-medium">
                        <BookOpen className="w-3 h-3" /> {msg.metadata.related_articles[0]}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {msg.sender_type === 'customer' && (
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-purple-500 to-pink-500 text-white flex items-center justify-center shrink-0 text-xs shadow-xs">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-glow-sm">
                <Bot className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3.5 rounded-2xl glass-card text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 border border-brand-500/30">
                <span className="w-2 h-2 rounded-full bg-brand-500 animate-ping" />
                HELPDESK AI is formulating answer...
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Question Chips */}
        <div className="px-4 py-2 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-2 overflow-x-auto">
          <span className="text-[11px] font-bold text-slate-400 shrink-0">Suggested:</span>
          {suggestedQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-xs px-3.5 py-1.5 rounded-full glass-card hover:border-brand-500 dark:hover:border-brand-400 hover:text-brand-600 dark:hover:text-brand-400 hover:scale-[1.02] shadow-xs hover:shadow-glow-sm shrink-0 transition-all font-medium"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Message Input Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-4 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md border-t border-slate-200/80 dark:border-slate-800/80 flex items-center gap-3"
        >
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Ask a question or describe your issue (Shift + Enter for new lines)..."
            className="flex-1 px-4 py-3 rounded-2xl text-xs sm:text-sm bg-white dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 focus:outline-none focus:ring-2 focus:ring-brand-500 text-slate-900 dark:text-white shadow-xs"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isTyping}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 hover:opacity-95 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-glow-sm disabled:opacity-50 transition"
          >
            <span>Send</span>
            <Send className="w-4 h-4" />
          </button>
        </form>

        {/* Escalation Confirmation Modal */}
        <Modal
          isOpen={showEscalationModal}
          onClose={() => setShowEscalationModal(false)}
          title="Escalate Issue to Support Specialist"
        >
          <div className="space-y-4">
            <div className="p-3.5 bg-rose-50 dark:bg-rose-950/50 rounded-xl border border-rose-200 dark:border-rose-800 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-900 dark:text-rose-200 leading-relaxed">
                We will create an official support ticket and route it directly to our specialist team.
                You will receive an assigned ticket number and notifications as updates occur.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ticket Subject
              </label>
              <input
                type="text"
                value={escalationData?.subject || ''}
                onChange={(e) =>
                  setEscalationData((prev) => ({ ...prev, subject: e.target.value }))
                }
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={escalationData?.description || ''}
                onChange={(e) =>
                  setEscalationData((prev) => ({ ...prev, description: e.target.value }))
                }
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <button
                type="button"
                onClick={() => setShowEscalationModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmEscalation}
                disabled={isEscalating}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-700 text-white shadow-md disabled:opacity-50"
              >
                {isEscalating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm Escalation'}
              </button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};
