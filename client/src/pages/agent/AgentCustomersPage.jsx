import React, { useState, useEffect } from 'react';
import { Users, Search, Mail, Phone, Ticket, ArrowRight } from 'lucide-react';
import { api } from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Link } from 'react-router-dom';

export const AgentCustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get('/admin/users', { role: 'customer', search });
      if (res?.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error fetching customers', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">Customer Directory</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review customer contact credentials, company profiles, and previous support tickets.
        </p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSearch} className="relative max-w-md">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search customers by name or email..."
          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-500"
        />
      </form>

      {/* Customers List */}
      {loading ? (
        <LoadingSpinner text="Retrieving customers..." />
      ) : customers.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {customers.map((c) => (
            <div
              key={c.id}
              className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <img
                    src={c.avatar_url || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'}
                    alt={c.full_name}
                    className="w-11 h-11 rounded-full object-cover border border-slate-200 dark:border-slate-700"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">{c.full_name}</h3>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                      Customer
                    </span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{c.email}</span>
                  </div>
                  {c.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <span>{c.phone}</span>
                    </div>
                  )}
                </div>
              </div>

              <Link
                to={`/agent/tickets?search=${c.email}`}
                className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 text-slate-700 dark:text-slate-200 transition"
              >
                <Ticket className="w-3.5 h-3.5 text-brand-600" />
                View Customer Tickets
              </Link>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          icon={Users}
          title="No customers found"
          description="No customer records match your query."
        />
      )}
    </div>
  );
};

