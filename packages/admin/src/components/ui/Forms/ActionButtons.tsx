/**
 * Action Buttons Components
 * 操作按钮组件 - 表单操作按钮和动作组合
 */

'use client';

import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Loader2,
  Minus,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import React from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
export type ActionButtonProps = {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  fullWidth?: boolean;
};

export function ActionButton({
  variant = 'primary',
  size = 'medium',
  loading = false,
  disabled = false,
  icon,
  children,
  onClick,
  type = 'button',
  className,
  fullWidth = false,
}: ActionButtonProps) {
  const variantClasses = {
    primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
    secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
    outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  };

  const sizeClasses = {
    small: 'h-8 px-3 text-xs',
    medium: 'h-10 px-4 py-2',
    large: 'h-12 px-8 text-base',
  };

  const iconSizes = {
    small: 'h-3 w-3',
    medium: 'h-4 w-4',
    large: 'h-5 w-5',
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        'relative',
        variantClasses[variant],
        sizeClasses[size],
        fullWidth ? 'w-full' : '',
        (disabled || loading) ? 'opacity-50 cursor-not-allowed' : '',
        className,
      )}
    >
      {loading
        ? (
            <>
              <Loader2 className={cn('animate-spin', iconSizes[size], children ? 'mr-2' : '')} />
              {children}
            </>
          )
        : (
            <>
              {icon && (
                <span className={cn(iconSizes[size], children ? 'mr-2' : '')}>
                  {icon}
                </span>
              )}
              {children}
            </>
          )}
    </Button>
  );
}

// Form action buttons group
export type FormActionsProps = {
  onSave?: () => void;
  onCancel?: () => void;
  onReset?: () => void;
  saveText?: string;
  cancelText?: string;
  resetText?: string;
  saving?: boolean;
  disabled?: boolean;
  layout?: 'horizontal' | 'vertical' | 'split';
  alignment?: 'left' | 'center' | 'right';
  className?: string;
  size?: 'small' | 'medium' | 'large';
  primaryAction?: 'save' | 'cancel';
};

export function FormActions({
  onSave,
  onCancel,
  onReset,
  saveText = 'Save',
  cancelText = 'Cancel',
  resetText = 'Reset',
  saving = false,
  disabled = false,
  layout = 'horizontal',
  alignment = 'right',
  className,
  size = 'medium',
  primaryAction = 'save',
}: FormActionsProps) {
  const layoutClasses = {
    horizontal: 'flex gap-3',
    vertical: 'flex flex-col gap-3',
    split: 'flex justify-between',
  };

  const alignmentClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  const buttonOrder = layout === 'split' ? 'reverse' : 'normal';

  const saveButton = onSave && (
    <ActionButton
      variant={primaryAction === 'save' ? 'primary' : 'secondary'}
      size={size}
      loading={saving}
      disabled={disabled}
      onClick={onSave}
      type="submit"
      icon={<Save />}
    >
      {saveText}
    </ActionButton>
  );

  const cancelButton = onCancel && (
    <ActionButton
      variant={primaryAction === 'cancel' ? 'primary' : 'outline'}
      size={size}
      disabled={saving}
      onClick={onCancel}
      icon={<X />}
    >
      {cancelText}
    </ActionButton>
  );

  const resetButton = onReset && (
    <ActionButton
      variant="ghost"
      size={size}
      disabled={disabled || saving}
      onClick={onReset}
      icon={<RotateCcw />}
    >
      {resetText}
    </ActionButton>
  );

  return (
    <div className={cn(
      layoutClasses[layout],
      layout !== 'split' ? alignmentClasses[alignment] : '',
      className,
    )}
    >
      {layout === 'split'
        ? (
            <>
              <div className="flex gap-3">
                {resetButton}
              </div>
              <div className="flex gap-3">
                {buttonOrder === 'reverse'
                  ? (
                      <>
                        {saveButton}
                        {cancelButton}
                      </>
                    )
                  : (
                      <>
                        {cancelButton}
                        {saveButton}
                      </>
                    )}
              </div>
            </>
          )
        : (
            <>
              {resetButton}
              {cancelButton}
              {saveButton}
            </>
          )}
    </div>
  );
}

// CRUD action buttons
export type CrudActionsProps = {
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onCopy?: () => void;
  viewText?: string;
  editText?: string;
  deleteText?: string;
  copyText?: string;
  size?: 'small' | 'medium' | 'large';
  layout?: 'horizontal' | 'dropdown';
  confirmDelete?: boolean;
  deleteConfirmText?: string;
  disabled?: boolean;
  className?: string;
};

export function CrudActions({
  onView,
  onEdit,
  onDelete,
  onCopy,
  viewText = 'View',
  editText = 'Edit',
  deleteText = 'Delete',
  copyText = 'Copy',
  size = 'small',
  layout = 'horizontal',
  confirmDelete = true,
  disabled = false,
  className,
}: CrudActionsProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = () => {
    if (confirmDelete && !showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }
    onDelete?.();
    setShowDeleteConfirm(false);
  };

  const buttons = [
    onView && (
      <ActionButton
        key="view"
        variant="ghost"
        size={size}
        disabled={disabled}
        onClick={onView}
        icon={<Eye />}
      >
        {layout === 'horizontal' ? viewText : ''}
      </ActionButton>
    ),
    onEdit && (
      <ActionButton
        key="edit"
        variant="ghost"
        size={size}
        disabled={disabled}
        onClick={onEdit}
        icon={<Edit />}
      >
        {layout === 'horizontal' ? editText : ''}
      </ActionButton>
    ),
    onCopy && (
      <ActionButton
        key="copy"
        variant="ghost"
        size={size}
        disabled={disabled}
        onClick={onCopy}
        icon={<Copy />}
      >
        {layout === 'horizontal' ? copyText : ''}
      </ActionButton>
    ),
    onDelete && !showDeleteConfirm && (
      <ActionButton
        key="delete"
        variant="ghost"
        size={size}
        disabled={disabled}
        onClick={handleDelete}
        icon={<Trash2 />}
        className="text-destructive hover:text-destructive"
      >
        {layout === 'horizontal' ? deleteText : ''}
      </ActionButton>
    ),
    onDelete && showDeleteConfirm && (
      <div key="delete-confirm" className="flex gap-1">
        <ActionButton
          variant="destructive"
          size="small"
          onClick={handleDelete}
          icon={<Check />}
        >
          Yes
        </ActionButton>
        <ActionButton
          variant="outline"
          size="small"
          onClick={() => setShowDeleteConfirm(false)}
          icon={<X />}
        >
          No
        </ActionButton>
      </div>
    ),
  ].filter(Boolean);

  if (layout === 'dropdown') {
    return (
      <div className={cn('relative group', className)}>
        <ActionButton
          variant="ghost"
          size={size}
          disabled={disabled}
          icon={<MoreHorizontal />}
        >
          Actions
        </ActionButton>
        <div className="absolute right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 min-w-[120px]">
          <div className="py-1">
            {buttons.map((button, index) => (
              <div key={index} className="px-1">
                {button}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-1', className)}>
      {buttons}
    </div>
  );
}

// Bulk actions for tables
export type BulkActionsProps = {
  selectedCount: number;
  onSelectAll?: () => void;
  onClearSelection?: () => void;
  onBulkDelete?: () => void;
  onBulkExport?: () => void;
  onBulkEdit?: () => void;
  actions?: Array<{
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: ActionButtonProps['variant'];
    disabled?: boolean;
  }>;
  className?: string;
};

export function BulkActions({
  selectedCount,
  onClearSelection,
  onBulkDelete,
  onBulkExport,
  onBulkEdit,
  actions = [],
  className,
}: BulkActionsProps) {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className={cn('flex items-center gap-3 p-3 bg-accent/50 border border-border rounded-lg', className)}>
      <span className="text-sm font-medium text-foreground">
        {selectedCount}
        {' '}
        selected
      </span>

      <div className="flex gap-2">
        {onBulkEdit && (
          <ActionButton
            variant="outline"
            size="small"
            onClick={onBulkEdit}
            icon={<Edit />}
          >
            Edit
          </ActionButton>
        )}

        {onBulkExport && (
          <ActionButton
            variant="outline"
            size="small"
            onClick={onBulkExport}
            icon={<Download />}
          >
            Export
          </ActionButton>
        )}

        {actions.map((action, index) => (
          <ActionButton
            key={index}
            variant={action.variant || 'outline'}
            size="small"
            onClick={action.onClick}
            disabled={action.disabled}
            icon={action.icon}
          >
            {action.label}
          </ActionButton>
        ))}

        {onBulkDelete && (
          <ActionButton
            variant="destructive"
            size="small"
            onClick={onBulkDelete}
            icon={<Trash2 />}
          >
            Delete
          </ActionButton>
        )}

        {onClearSelection && (
          <ActionButton
            variant="ghost"
            size="small"
            onClick={onClearSelection}
            icon={<X />}
          >
            Clear
          </ActionButton>
        )}
      </div>
    </div>
  );
}

// Navigation actions for multi-step forms
export type NavigationActionsProps = {
  currentStep: number;
  totalSteps: number;
  onPrevious?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  previousText?: string;
  nextText?: string;
  submitText?: string;
  canGoNext?: boolean;
  canGoPrevious?: boolean;
  submitting?: boolean;
  className?: string;
};

export function NavigationActions({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  onSubmit,
  previousText = 'Previous',
  nextText = 'Next',
  submitText = 'Submit',
  canGoNext = true,
  canGoPrevious = true,
  submitting = false,
  className,
}: NavigationActionsProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className={cn('flex justify-between items-center', className)}>
      <div>
        {!isFirstStep && onPrevious && (
          <ActionButton
            variant="outline"
            onClick={onPrevious}
            disabled={!canGoPrevious || submitting}
            icon={<ChevronLeft />}
          >
            {previousText}
          </ActionButton>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">
          Step
          {' '}
          {currentStep + 1}
          {' '}
          of
          {' '}
          {totalSteps}
        </span>
      </div>

      <div>
        {isLastStep
          ? (
              onSubmit && (
                <ActionButton
                  variant="primary"
                  onClick={onSubmit}
                  loading={submitting}
                  disabled={!canGoNext}
                  icon={<Check />}
                >
                  {submitText}
                </ActionButton>
              )
            )
          : (
              onNext && (
                <ActionButton
                  variant="primary"
                  onClick={onNext}
                  disabled={!canGoNext || submitting}
                  icon={<ChevronRight />}
                >
                  {nextText}
                </ActionButton>
              )
            )}
      </div>
    </div>
  );
}

// Quick action buttons
export const QuickActions = {
  Add: ({ onClick, text = 'Add', ...props }: Partial<ActionButtonProps> & { onClick?: () => void; text?: string }) => (
    <ActionButton variant="primary" onClick={onClick} icon={<Plus />} {...props}>
      {text}
    </ActionButton>
  ),

  Remove: ({ onClick, text = 'Remove', ...props }: Partial<ActionButtonProps> & { onClick?: () => void; text?: string }) => (
    <ActionButton variant="destructive" onClick={onClick} icon={<Minus />} {...props}>
      {text}
    </ActionButton>
  ),

  Upload: ({ onClick, text = 'Upload', ...props }: Partial<ActionButtonProps> & { onClick?: () => void; text?: string }) => (
    <ActionButton variant="outline" onClick={onClick} icon={<Upload />} {...props}>
      {text}
    </ActionButton>
  ),

  Download: ({ onClick, text = 'Download', ...props }: Partial<ActionButtonProps> & { onClick?: () => void; text?: string }) => (
    <ActionButton variant="outline" onClick={onClick} icon={<Download />} {...props}>
      {text}
    </ActionButton>
  ),

  External: ({ onClick, text = 'Open', ...props }: Partial<ActionButtonProps> & { onClick?: () => void; text?: string }) => (
    <ActionButton variant="ghost" onClick={onClick} icon={<ExternalLink />} {...props}>
      {text}
    </ActionButton>
  ),
};
