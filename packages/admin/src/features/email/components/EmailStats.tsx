'use client';

import React from 'react';
import {
  BarChart3,
  CheckCircle,
  Clock,
  Globe,
  Mail,
  Send,
} from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

import { useEmailManagementStore } from '../stores';

type EmailStatsProps = {
  detailed?: boolean;
};

export const EmailStats: React.FC<EmailStatsProps> = ({ detailed = false }) => {
  const { stats } = useEmailManagementStore();

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Templates</p>
                <p className="text-2xl font-bold">{stats.totalTemplates}</p>
              </div>
              <Mail className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Templates</p>
                <p className="text-2xl font-bold">{stats.activeTemplates}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Tests Sent</p>
                <p className="text-2xl font-bold">{formatNumber(stats.testsSent)}</p>
              </div>
              <Send className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Supported Languages</p>
                <p className="text-2xl font-bold">{stats.supportedLanguages}</p>
              </div>
              <Globe className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      {detailed && (
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Deployment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Deployment Status
              </CardTitle>
              <CardDescription>
                Latest deployment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Last Deployment</span>
                <Badge variant="outline">
                  {stats.lastDeployment
                    ? new Date(stats.lastDeployment).toLocaleDateString()
                    : 'Never'}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Templates</span>
                <span className="text-sm text-muted-foreground">
                  {stats.totalTemplates}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Active Templates</span>
                <span className="text-sm text-muted-foreground">
                  {stats.activeTemplates}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Testing Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Testing Activity
              </CardTitle>
              <CardDescription>
                Email testing statistics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Total Tests Sent</span>
                  <Badge variant="secondary">
                    {formatNumber(stats.testsSent)}
                  </Badge>
                </div>

                <div className="text-center py-8 text-muted-foreground">
                  <Send className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    {stats.testsSent > 0
                      ? `${stats.testsSent} test emails sent successfully`
                      : 'No test emails sent yet'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};