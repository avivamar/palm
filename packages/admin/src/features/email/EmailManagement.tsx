'use client';

import React from 'react';
import { Mail, Settings, TestTube, Upload, BarChart3 } from 'lucide-react';
import { useEmailManagementStore } from './stores/email-store';
import { 
  TemplateManager,
  EmailStats
} from './components';

interface EmailManagementProps {
  className?: string;
  detailed?: boolean;
}

export const EmailManagement: React.FC<EmailManagementProps> = ({ 
  className = '',
  detailed = false 
}) => {
  const { stats, actions } = useEmailManagementStore();

  React.useEffect(() => {
    actions.loadTemplates();
    actions.refreshStats();
  }, [actions]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 pb-4">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Mail className="h-6 w-6" />
          Email Management
        </h1>
        <p className="text-gray-600 mt-1">
          Manage email templates, configuration, and deployment
        </p>
      </div>

      {/* Stats Overview */}
      {detailed && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <EmailStats detailed={detailed} />
        </div>
      )}

      {/* Main Content */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <TabButton 
              icon={<Mail className="h-4 w-4" />}
              label="Templates"
              count={stats.totalTemplates}
              active={true}
            />
            <TabButton 
              icon={<Settings className="h-4 w-4" />}
              label="Configuration"
            />
            <TabButton 
              icon={<TestTube className="h-4 w-4" />}
              label="Testing"
            />
            <TabButton 
              icon={<Upload className="h-4 w-4" />}
              label="Deployment"
            />
            <TabButton 
              icon={<BarChart3 className="h-4 w-4" />}
              label="Analytics"
            />
          </nav>
        </div>

        <div className="p-6">
          {/* Tab Content - for now just show Templates */}
          <TemplateManager />
        </div>
      </div>
    </div>
  );
};

interface TabButtonProps {
  icon: React.ReactNode;
  label: string;
  count?: number;
  active?: boolean;
}

const TabButton: React.FC<TabButtonProps> = ({ icon, label, count, active = false }) => {
  return (
    <button
      className={`
        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm
        ${active 
          ? 'border-blue-500 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
        }
      `}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span className="bg-gray-100 text-gray-600 py-0.5 px-2 rounded-full text-xs">
          {count}
        </span>
      )}
    </button>
  );
};