import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ProtectedRoute, RoleRoute } from './ProtectedRoute';

// Public Pages
import { LandingPage } from '../pages/public/LandingPage';
import { LoginPage } from '../pages/public/LoginPage';
import { RegisterPage } from '../pages/public/RegisterPage';
import { ForgotPasswordPage } from '../pages/public/ForgotPasswordPage';

// Customer Pages
import { CustomerDashboard } from '../pages/customer/CustomerDashboard';
import { CustomerChatPage } from '../pages/customer/CustomerChatPage';
import { CustomerTicketsPage } from '../pages/customer/CustomerTicketsPage';
import { CustomerTicketDetailsPage } from '../pages/customer/CustomerTicketDetailsPage';
import { CustomerKnowledgeBasePage } from '../pages/customer/CustomerKnowledgeBasePage';
import { CustomerNotificationsPage } from '../pages/customer/CustomerNotificationsPage';
import { CustomerProfilePage } from '../pages/customer/CustomerProfilePage';

// Agent Pages
import { AgentDashboard } from '../pages/agent/AgentDashboard';
import { AgentTicketsPage } from '../pages/agent/AgentTicketsPage';
import { AgentTicketDetailsPage } from '../pages/agent/AgentTicketDetailsPage';
import { AgentCustomersPage } from '../pages/agent/AgentCustomersPage';
import { AgentProfilePage } from '../pages/agent/AgentProfilePage';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminTicketsPage } from '../pages/admin/AdminTicketsPage';
import { AdminCustomersPage } from '../pages/admin/AdminCustomersPage';
import { AdminAgentsPage } from '../pages/admin/AdminAgentsPage';
import { AdminKnowledgeBasePage } from '../pages/admin/AdminKnowledgeBasePage';
import { AdminCategoriesPage } from '../pages/admin/AdminCategoriesPage';
import { AdminAnalyticsPage } from '../pages/admin/AdminAnalyticsPage';
import { AdminSettingsPage } from '../pages/admin/AdminSettingsPage';

// Error Pages
import { UnauthorizedPage } from '../pages/error/UnauthorizedPage';
import { NotFoundPage } from '../pages/error/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ForgotPasswordPage />} />

      {/* Protected Routes inside DashboardLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          {/* Customer & Shared Knowledge / Chat Routes (Accessible to Customer, Agent, Admin) */}
          <Route element={<RoleRoute allowedRoles={['customer', 'agent', 'admin']} />}>
            <Route path="/customer/dashboard" element={<CustomerDashboard />} />
            <Route path="/customer/chat" element={<CustomerChatPage />} />
            <Route path="/customer/tickets" element={<CustomerTicketsPage />} />
            <Route path="/customer/tickets/:id" element={<CustomerTicketDetailsPage />} />
            <Route path="/customer/knowledge-base" element={<CustomerKnowledgeBasePage />} />
            <Route path="/customer/notifications" element={<CustomerNotificationsPage />} />
            <Route path="/customer/profile" element={<CustomerProfilePage />} />
          </Route>


          {/* Agent Routes */}
          <Route element={<RoleRoute allowedRoles={['agent', 'admin']} />}>
            <Route path="/agent/dashboard" element={<AgentDashboard />} />
            <Route path="/agent/tickets" element={<AgentTicketsPage />} />
            <Route path="/agent/tickets/:id" element={<AgentTicketDetailsPage />} />
            <Route path="/agent/customers" element={<AgentCustomersPage />} />
            <Route path="/agent/profile" element={<AgentProfilePage />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<RoleRoute allowedRoles={['admin']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/tickets" element={<AdminTicketsPage />} />
            <Route path="/admin/customers" element={<AdminCustomersPage />} />
            <Route path="/admin/agents" element={<AdminAgentsPage />} />
            <Route path="/admin/categories" element={<AdminCategoriesPage />} />
            <Route path="/admin/knowledge-base" element={<AdminKnowledgeBasePage />} />
            <Route path="/admin/analytics" element={<AdminAnalyticsPage />} />
            <Route path="/admin/settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Route>

      {/* Error Routes */}
      <Route path="/403" element={<UnauthorizedPage />} />
      <Route path="/404" element={<NotFoundPage />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

