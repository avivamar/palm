/**
 * Operation Confirmations and Undo Component
 * 操作确认和撤销功能 - 为关键操作提供确认和撤销机制
 */

'use client';

import {
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  RefreshCw,
  Settings,
  Trash2,
  Undo2,
  X,
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', disabled, ...props }: any) => (
  <button
    className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    disabled={disabled}
    {...props}
  >
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types for different operation types
type OperationType
  = | 'delete'
    | 'archive'
    | 'sync'
    | 'bulk_update'
    | 'export'
    | 'import'
    | 'reset'
    | 'publish'
    | 'unpublish';

type OperationSeverity = 'low' | 'medium' | 'high' | 'critical';

type BaseOperation = {
  id: string;
  type: OperationType;
  title: string;
  description: string;
  severity: OperationSeverity;
  confirmText?: string;
  data?: any;
  metadata?: Record<string, any>;
};

type ConfirmationConfig = {
  title: string;
  description: string;
  confirmText: string;
  confirmVariant: 'default' | 'destructive';
  requiresTyping?: boolean;
  typeText?: string;
  countdown?: number;
  icon: React.ReactNode;
  severity: OperationSeverity;
};

// Predefined configurations for different operation types
const OPERATION_CONFIGS: Record<OperationType, ConfirmationConfig> = {
  delete: {
    title: 'Delete Items',
    description: 'This action cannot be undone. The selected items will be permanently removed.',
    confirmText: 'DELETE',
    confirmVariant: 'destructive',
    requiresTyping: true,
    typeText: 'DELETE',
    countdown: 3,
    icon: <Trash2 className="h-5 w-5 text-red-600" />,
    severity: 'critical',
  },
  archive: {
    title: 'Archive Items',
    description: 'The selected items will be moved to archive. You can restore them later.',
    confirmText: 'Archive',
    confirmVariant: 'default',
    icon: <Download className="h-5 w-5 text-orange-600" />,
    severity: 'medium',
  },
  sync: {
    title: 'Sync with Shopify',
    description: 'This will update all selected items in Shopify. Existing data may be overwritten.',
    confirmText: 'Start Sync',
    confirmVariant: 'default',
    icon: <RefreshCw className="h-5 w-5 text-blue-600" />,
    severity: 'medium',
  },
  bulk_update: {
    title: 'Bulk Update',
    description: 'Apply changes to multiple items at once. Review your changes carefully.',
    confirmText: 'Update All',
    confirmVariant: 'default',
    icon: <RefreshCw className="h-5 w-5 text-green-600" />,
    severity: 'medium',
  },
  export: {
    title: 'Export Data',
    description: 'Download the selected data as a file.',
    confirmText: 'Export',
    confirmVariant: 'default',
    icon: <Download className="h-5 w-5 text-blue-600" />,
    severity: 'low',
  },
  import: {
    title: 'Import Data',
    description: 'Import data from file. Existing records may be updated or replaced.',
    confirmText: 'Import',
    confirmVariant: 'default',
    icon: <Download className="h-5 w-5 text-purple-600" />,
    severity: 'high',
  },
  reset: {
    title: 'Reset Settings',
    description: 'All settings will be restored to default values. This cannot be undone.',
    confirmText: 'RESET',
    confirmVariant: 'destructive',
    requiresTyping: true,
    typeText: 'RESET',
    icon: <Settings className="h-5 w-5 text-red-600" />,
    severity: 'critical',
  },
  publish: {
    title: 'Publish Items',
    description: 'Make the selected items visible to customers.',
    confirmText: 'Publish',
    confirmVariant: 'default',
    icon: <CheckCircle className="h-5 w-5 text-green-600" />,
    severity: 'low',
  },
  unpublish: {
    title: 'Unpublish Items',
    description: 'Hide the selected items from customers.',
    confirmText: 'Unpublish',
    confirmVariant: 'default',
    icon: <X className="h-5 w-5 text-orange-600" />,
    severity: 'medium',
  },
};

// Confirmation Modal Component
type ConfirmationModalProps = {
  operation: BaseOperation;
  isOpen: boolean;
  onConfirm: (operation: BaseOperation) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export function ConfirmationModal({
  operation,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: ConfirmationModalProps) {
  const [typedText, setTypedText] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<NodeJS.Timeout | null>(null);

  const config = OPERATION_CONFIGS[operation.type];

  useEffect(() => {
    if (isOpen && config.countdown) {
      setCountdown(config.countdown);

      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            clearInterval(timer);
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      countdownRef.current = timer;

      return () => {
        clearInterval(timer);
      };
    }

    return () => {}; // Empty cleanup function for the else case
  }, [isOpen, config.countdown]);

  useEffect(() => {
    if (!isOpen) {
      setTypedText('');
      setCountdown(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const canConfirm = !config.requiresTyping
    || (typedText === config.typeText && (countdown === null || countdown === 0));

  const getSeverityColors = (severity: OperationSeverity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20';
      case 'high':
        return 'border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/20';
      case 'medium':
        return 'border-yellow-200 dark:border-yellow-800 bg-yellow-50 dark:bg-yellow-950/20';
      default:
        return 'border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/20';
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-card border border-border rounded-lg shadow-lg max-w-md w-full">
        {/* Header */}
        <div className={cn(
          'p-6 border-b border-border',
          getSeverityColors(config.severity),
        )}
        >
          <div className="flex items-center gap-3">
            {config.icon}
            <div>
              <h3 className="text-lg font-semibold text-foreground">
                {operation.title || config.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {operation.description || config.description}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Operation Details */}
          {operation.metadata && Object.keys(operation.metadata).length > 0 && (
            <div className="bg-muted/50 rounded-lg p-4">
              <h4 className="text-sm font-medium text-foreground mb-2">Operation Details:</h4>
              <dl className="space-y-1">
                {Object.entries(operation.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <dt className="text-muted-foreground">
                      {key}
                      :
                    </dt>
                    <dd className="text-foreground font-medium">{String(value)}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* Typing Confirmation */}
          {config.requiresTyping && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">
                Type
                {' '}
                <span className="font-mono bg-muted px-1 rounded">{config.typeText}</span>
                {' '}
                to confirm:
              </label>
              <input
                type="text"
                value={typedText}
                onChange={e => setTypedText(e.target.value)}
                className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground"
                placeholder={config.typeText}
                disabled={isLoading}
              />
            </div>
          )}

          {/* Countdown */}
          {countdown !== null && countdown > 0 && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg p-3">
              <Clock className="h-4 w-4" />
              <span>
                Please wait
                {countdown}
                {' '}
                second
                {countdown !== 1 ? 's' : ''}
                {' '}
                before confirming
              </span>
            </div>
          )}

          {/* Warning Message */}
          {config.severity === 'critical' && (
            <div className="flex items-start gap-2 text-sm text-red-600 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
              <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <span>This action is irreversible and may cause data loss.</span>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 pt-0 flex items-center gap-3 justify-end">
          <Button
            onClick={onCancel}
            variant="outline"
            disabled={isLoading}
          >
            Cancel
          </Button>

          <Button
            onClick={() => onConfirm(operation)}
            variant={config.confirmVariant}
            disabled={!canConfirm || isLoading}
            className="gap-2"
          >
            {isLoading
              ? (
                  <>
                    <div className="h-4 w-4 animate-spin border-2 border-current border-t-transparent rounded-full" />
                    Processing...
                  </>
                )
              : (
                  config.confirmText
                )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// Undo Toast Component
type UndoToastProps = {
  isVisible: boolean;
  message: string;
  onUndo: () => void;
  onDismiss: () => void;
  timeout?: number;
};

export function UndoToast({
  isVisible,
  message,
  onUndo,
  onDismiss,
  timeout = 5000,
}: UndoToastProps) {
  const [timeLeft, setTimeLeft] = useState(timeout / 1000);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isVisible) {
      setTimeLeft(timeout / 1000);

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            onDismiss();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }

    return () => {}; // Empty cleanup function for the else case
  }, [isVisible, timeout, onDismiss]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-card border border-border rounded-lg shadow-lg p-4 min-w-80 max-w-md z-50">
      <div className="flex items-center gap-3">
        <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">
            {message}
          </p>
          <p className="text-xs text-muted-foreground">
            Auto-dismiss in
            {' '}
            {timeLeft}
            s
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={onUndo}
            variant="outline"
            size="sm"
            className="gap-1"
          >
            <Undo2 className="h-3 w-3" />
            Undo
          </Button>

          <Button
            onClick={onDismiss}
            variant="ghost"
            size="sm"
            className="gap-1"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-2 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-primary transition-all duration-1000 ease-linear"
          style={{ width: `${(timeLeft / (timeout / 1000)) * 100}%` }}
        />
      </div>
    </div>
  );
}

// Operation History for Undo Stack
type OperationHistoryItem = {
  id: string;
  type: OperationType;
  title: string;
  timestamp: Date;
  undoAction?: () => Promise<void> | void;
  metadata?: Record<string, any>;
};

// Hook for managing operations with confirmation and undo
export function useOperationConfirmation() {
  const [currentOperation, setCurrentOperation] = useState<BaseOperation | null>(null);
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [undoToast, setUndoToast] = useState<{
    isVisible: boolean;
    message: string;
    undoAction?: () => Promise<void> | void;
  }>({ isVisible: false, message: '' });
  const [operationHistory, setOperationHistory] = useState<OperationHistoryItem[]>([]);

  const showConfirmation = useCallback((operation: BaseOperation) => {
    setCurrentOperation(operation);
    setIsConfirmationOpen(true);
  }, []);

  const hideConfirmation = useCallback(() => {
    setIsConfirmationOpen(false);
    setCurrentOperation(null);
    setIsLoading(false);
  }, []);

  const confirmOperation = useCallback(async (
    operation: BaseOperation,
    action: (operation: BaseOperation) => Promise<any>,
    undoAction?: () => Promise<void> | void,
  ) => {
    setIsLoading(true);

    try {
      const result = await action(operation);

      // Add to history
      const historyItem: OperationHistoryItem = {
        id: `op_${Date.now()}`,
        type: operation.type,
        title: operation.title,
        timestamp: new Date(),
        undoAction,
        metadata: operation.metadata,
      };

      setOperationHistory(prev => [historyItem, ...prev.slice(0, 9)]); // Keep last 10 operations

      // Show undo toast if undo action is available
      if (undoAction && operation.type !== 'delete') {
        setUndoToast({
          isVisible: true,
          message: `${operation.title} completed successfully`,
          undoAction,
        });
      }

      hideConfirmation();
      return result;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  }, [hideConfirmation]);

  const showUndoToast = useCallback((message: string, undoAction: () => Promise<void> | void) => {
    setUndoToast({
      isVisible: true,
      message,
      undoAction,
    });
  }, []);

  const hideUndoToast = useCallback(() => {
    setUndoToast({ isVisible: false, message: '' });
  }, []);

  const executeUndo = useCallback(async () => {
    if (undoToast.undoAction) {
      try {
        await undoToast.undoAction();
        setUndoToast({
          isVisible: true,
          message: 'Operation undone successfully',
        });
        setTimeout(hideUndoToast, 2000);
      } catch (error) {
        console.error('Undo failed:', error);
        setUndoToast({
          isVisible: true,
          message: 'Failed to undo operation',
        });
        setTimeout(hideUndoToast, 3000);
      }
    }
  }, [undoToast.undoAction, hideUndoToast]);

  return {
    // Confirmation modal
    currentOperation,
    isConfirmationOpen,
    isLoading,
    showConfirmation,
    hideConfirmation,
    confirmOperation,

    // Undo toast
    undoToast: undoToast.isVisible ? undoToast : null,
    showUndoToast,
    hideUndoToast,
    executeUndo,

    // History
    operationHistory,

    // Components
    ConfirmationModal: (props: Omit<ConfirmationModalProps, 'operation' | 'isOpen' | 'onCancel' | 'isLoading'>) =>
      currentOperation
        ? (
            <ConfirmationModal
              operation={currentOperation}
              isOpen={isConfirmationOpen}
              onCancel={hideConfirmation}
              isLoading={isLoading}
              {...props}
            />
          )
        : null,

    UndoToast: () => undoToast.isVisible
      ? (
          <UndoToast
            isVisible={undoToast.isVisible}
            message={undoToast.message}
            onUndo={executeUndo}
            onDismiss={hideUndoToast}
          />
        )
      : null,
  };
}

// Predefined operation creators
export const createDeleteOperation = (items: any[], metadata?: Record<string, any>): BaseOperation => ({
  id: `delete_${Date.now()}`,
  type: 'delete',
  title: `Delete ${items.length} item${items.length !== 1 ? 's' : ''}`,
  description: `Permanently remove ${items.length} selected item${items.length !== 1 ? 's' : ''}`,
  severity: 'critical',
  data: items,
  metadata: {
    count: items.length,
    ...metadata,
  },
});

export const createSyncOperation = (items: any[], metadata?: Record<string, any>): BaseOperation => ({
  id: `sync_${Date.now()}`,
  type: 'sync',
  title: `Sync ${items.length} item${items.length !== 1 ? 's' : ''} with Shopify`,
  description: `Update ${items.length} item${items.length !== 1 ? 's' : ''} in Shopify`,
  severity: 'medium',
  data: items,
  metadata: {
    count: items.length,
    ...metadata,
  },
});

export const createBulkUpdateOperation = (updates: any[], metadata?: Record<string, any>): BaseOperation => ({
  id: `bulk_update_${Date.now()}`,
  type: 'bulk_update',
  title: `Update ${updates.length} item${updates.length !== 1 ? 's' : ''}`,
  description: `Apply bulk changes to ${updates.length} item${updates.length !== 1 ? 's' : ''}`,
  severity: 'medium',
  data: updates,
  metadata: {
    count: updates.length,
    ...metadata,
  },
});
