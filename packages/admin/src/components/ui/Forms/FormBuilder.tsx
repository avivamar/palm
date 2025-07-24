/**
 * Form Components
 * 表单组件 - 表单构建器、验证信息和操作按钮
 */

'use client';

import {
  AlertCircle,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Info,
  Minus,
  Plus,
  Upload,
} from 'lucide-react';
import React, { useState } from 'react';

// Temporary simplified components
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }: any) => (
  <button className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${className}`} {...props}>
    {children}
  </button>
);

const Input = ({ className = '', ...props }: any) => (
  <input className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />
);

const Textarea = ({ className = '', ...props }: any) => (
  <textarea className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props} />
);

const Select = ({ children, className = '', ...props }: any) => (
  <select className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ${className}`} {...props}>
    {children}
  </select>
);

const Checkbox = ({ className = '', ...props }: any) => (
  <input type="checkbox" className={`h-4 w-4 rounded border border-input ${className}`} {...props} />
);

const cn = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ');

// Types
export type FormField = {
  id: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'file' | 'date' | 'number';
  label: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  options?: Array<{ label: string; value: any }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
  description?: string;
  defaultValue?: any;
  multiple?: boolean;
  accept?: string; // for file inputs
};

export type FormData = {
  [key: string]: any;
};

export type FormErrors = {
  [key: string]: string;
};

export type FormBuilderProps = {
  fields: FormField[];
  data: FormData;
  errors?: FormErrors;
  onChange: (data: FormData) => void;
  onValidate?: (field: string, value: any) => string | null;
  layout?: 'vertical' | 'horizontal' | 'grid';
  className?: string;
  disabled?: boolean;
  showValidationIcons?: boolean;
};

export function FormBuilder({
  fields,
  data,
  errors = {},
  onChange,
  onValidate,
  layout = 'vertical',
  className,
  disabled = false,
  showValidationIcons = true,
}: FormBuilderProps) {
  const [touched, setTouched] = useState<Set<string>>(new Set());

  const handleFieldChange = (fieldId: string, value: any) => {
    const newData = { ...data, [fieldId]: value };
    onChange(newData);

    // Validate field if custom validation is provided
    if (onValidate) {
      onValidate(fieldId, value);
    }
  };

  const handleFieldBlur = (fieldId: string) => {
    setTouched(prev => new Set(prev).add(fieldId));
  };

  const validateField = (field: FormField, value: any): string | null => {
    if (field.required && (!value || (typeof value === 'string' && value.trim() === ''))) {
      return `${field.label} is required`;
    }

    if (field.validation && value) {
      const { min, max, pattern, custom } = field.validation;

      if (min && typeof value === 'string' && value.length < min) {
        return `${field.label} must be at least ${min} characters`;
      }

      if (max && typeof value === 'string' && value.length > max) {
        return `${field.label} must not exceed ${max} characters`;
      }

      if (min && typeof value === 'number' && value < min) {
        return `${field.label} must be at least ${min}`;
      }

      if (max && typeof value === 'number' && value > max) {
        return `${field.label} must not exceed ${max}`;
      }

      if (pattern && typeof value === 'string' && !new RegExp(pattern).test(value)) {
        return `${field.label} format is invalid`;
      }

      if (custom) {
        return custom(value);
      }
    }

    return null;
  };

  const layoutClasses = {
    vertical: 'space-y-6',
    horizontal: 'space-y-4',
    grid: 'grid grid-cols-1 md:grid-cols-2 gap-6',
  };

  return (
    <div className={cn(layoutClasses[layout], className)}>
      {fields.map((field) => {
        const value = data[field.id] ?? field.defaultValue ?? '';
        const error = errors[field.id] || validateField(field, value);
        const isTouched = touched.has(field.id);
        const showError = error && isTouched;
        const isValid = !error && value && isTouched;

        return (
          <FormFieldWrapper
            key={field.id}
            field={field}
            value={value}
            error={showError ? error : undefined}
            isValid={isValid}
            showValidationIcons={showValidationIcons}
            disabled={disabled || field.disabled}
            layout={layout}
            onChange={value => handleFieldChange(field.id, value)}
            onBlur={() => handleFieldBlur(field.id)}
          />
        );
      })}
    </div>
  );
}

type FormFieldWrapperProps = {
  field: FormField;
  value: any;
  error?: string;
  isValid?: boolean;
  showValidationIcons?: boolean;
  disabled?: boolean;
  layout: 'vertical' | 'horizontal' | 'grid';
  onChange: (value: any) => void;
  onBlur: () => void;
};

function FormFieldWrapper({
  field,
  value,
  error,
  isValid,
  showValidationIcons,
  disabled,
  layout,
  onChange,
  onBlur,
}: FormFieldWrapperProps) {
  const isHorizontal = layout === 'horizontal';

  const labelElement = (
    <label className={cn(
      'text-sm font-medium text-foreground',
      field.required ? 'after:content-[\'*\'] after:ml-0.5 after:text-destructive' : '',
      disabled ? 'opacity-50' : '',
    )}
    >
      {field.label}
    </label>
  );

  const fieldElement = (
    <div className="relative">
      <FormFieldInput
        field={field}
        value={value}
        disabled={disabled}
        onChange={onChange}
        onBlur={onBlur}
        hasError={!!error}
      />

      {showValidationIcons && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          {error && (
            <AlertCircle className="h-4 w-4 text-destructive" />
          )}
          {isValid && (
            <Check className="h-4 w-4 text-green-600" />
          )}
        </div>
      )}
    </div>
  );

  const descriptionElement = field.description && (
    <div className="flex items-start gap-2 mt-1">
      <Info className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
      <p className="text-xs text-muted-foreground">
        {field.description}
      </p>
    </div>
  );

  const errorElement = error && (
    <p className="text-xs text-destructive mt-1 flex items-center gap-1">
      <AlertCircle className="h-3 w-3" />
      {error}
    </p>
  );

  if (isHorizontal) {
    return (
      <div className={cn('grid grid-cols-1 md:grid-cols-3 gap-4 items-start', disabled ? 'opacity-50' : '')}>
        <div className="space-y-1">
          {labelElement}
          {descriptionElement}
        </div>
        <div className="md:col-span-2 space-y-1">
          {fieldElement}
          {errorElement}
        </div>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', disabled ? 'opacity-50' : '')}>
      {labelElement}
      {fieldElement}
      {descriptionElement}
      {errorElement}
    </div>
  );
}

type FormFieldInputProps = {
  field: FormField;
  value: any;
  disabled?: boolean;
  hasError?: boolean;
  onChange: (value: any) => void;
  onBlur: () => void;
};

function FormFieldInput({
  field,
  value,
  disabled,
  hasError,
  onChange,
  onBlur,
}: FormFieldInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [fileList, setFileList] = useState<FileList | null>(null);

  const baseInputClasses = cn(
    'w-full',
    hasError ? 'border-destructive focus:border-destructive' : '',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    setFileList(files);
    if (field.multiple) {
      onChange(files ? Array.from(files) : []);
    } else {
      onChange(files?.[0] || null);
    }
  };

  switch (field.type) {
    case 'text':
    case 'email':
    case 'number':
      return (
        <Input
          type={field.type}
          placeholder={field.placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={baseInputClasses}
          required={field.required}
        />
      );

    case 'password':
      return (
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder={field.placeholder}
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(baseInputClasses, 'pr-10')}
            required={field.required}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      );

    case 'textarea':
      return (
        <Textarea
          placeholder={field.placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={baseInputClasses}
          required={field.required}
        />
      );

    case 'select':
      return (
        <div className="relative">
          <Select
            value={value}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            className={baseInputClasses}
            required={field.required}
          >
            {field.placeholder && (
              <option value="" disabled>
                {field.placeholder}
              </option>
            )}
            {field.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      );

    case 'checkbox':
      return (
        <label className="flex items-center gap-3 cursor-pointer">
          <Checkbox
            checked={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.checked)}
            onBlur={onBlur}
            disabled={disabled}
            required={field.required}
          />
          <span className="text-sm text-foreground">
            {field.placeholder || 'Check this option'}
          </span>
        </label>
      );

    case 'radio':
      return (
        <div className="space-y-3">
          {field.options?.map(option => (
            <label key={option.value} className="flex items-center gap-3 cursor-pointer">
              <input
                type="radio"
                name={field.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
                onBlur={onBlur}
                disabled={disabled}
                className="h-4 w-4 text-primary border-input"
                required={field.required}
              />
              <span className="text-sm text-foreground">
                {option.label}
              </span>
            </label>
          ))}
        </div>
      );

    case 'file':
      return (
        <div className="space-y-2">
          <div className="relative">
            <Input
              type="file"
              accept={field.accept}
              multiple={field.multiple}
              onChange={handleFileChange}
              onBlur={onBlur}
              disabled={disabled}
              className={cn(baseInputClasses, 'file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-muted file:text-muted-foreground hover:file:bg-muted/80')}
              required={field.required}
            />
            <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
          </div>
          {fileList && fileList.length > 0 && (
            <div className="space-y-1">
              {Array.from(fileList).map((file, index) => (
                <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="flex-1 truncate">{file.name}</span>
                  <span className="flex-shrink-0">
                    {(file.size / 1024).toFixed(1)}
                    {' '}
                    KB
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      );

    case 'date':
      return (
        <div className="relative">
          <Input
            type="date"
            value={value}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
            onBlur={onBlur}
            disabled={disabled}
            className={cn(baseInputClasses, 'pr-10')}
            required={field.required}
          />
          <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
      );

    default:
      return (
        <Input
          placeholder={field.placeholder}
          value={value}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
          onBlur={onBlur}
          disabled={disabled}
          className={baseInputClasses}
          required={field.required}
        />
      );
  }
}

// Dynamic form builder for complex forms
export type DynamicFormBuilderProps = {
  fields: FormField[];
  data: FormData;
  errors?: FormErrors;
  onChange: (data: FormData) => void;
  onAddField?: (field: FormField) => void;
  onRemoveField?: (fieldId: string) => void;
  onReorderFields?: (fromIndex: number, toIndex: number) => void;
  editable?: boolean;
  className?: string;
};

export function DynamicFormBuilder({
  fields,
  data,
  errors,
  onChange,
  onAddField,
  onRemoveField,
  onReorderFields,
  editable = false,
  className,
}: DynamicFormBuilderProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== dropIndex && onReorderFields) {
      onReorderFields(draggedIndex, dropIndex);
    }
    setDraggedIndex(null);
  };

  return (
    <div className={cn('space-y-4', className)}>
      {fields.map((field, index) => (
        <div
          key={field.id}
          className={cn(
            'relative border border-border rounded-lg p-4',
            editable ? 'cursor-move hover:border-muted-foreground' : '',
            draggedIndex === index ? 'opacity-50' : '',
          )}
          draggable={editable}
          onDragStart={() => handleDragStart(index)}
          onDragOver={handleDragOver}
          onDrop={e => handleDrop(e, index)}
        >
          {editable && (
            <div className="absolute top-2 right-2 flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemoveField?.(field.id)}
                className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
              >
                <Minus className="h-3 w-3" />
              </Button>
            </div>
          )}

          <FormBuilder
            fields={[field]}
            data={data}
            errors={errors}
            onChange={onChange}
            layout="vertical"
          />
        </div>
      ))}

      {editable && onAddField && (
        <Button
          variant="outline"
          onClick={() => {
            const newField: FormField = {
              id: `field_${Date.now()}`,
              type: 'text',
              label: 'New Field',
              placeholder: 'Enter value...',
            };
            onAddField(newField);
          }}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Field
        </Button>
      )}
    </div>
  );
}
