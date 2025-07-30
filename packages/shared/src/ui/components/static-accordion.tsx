'use client';

import { ChevronDown } from 'lucide-react';
import * as React from 'react';
import { cn } from '@rolitt/shared/utils';

type AccordionItemProps = {
  className?: string;
  children: React.ReactNode;
  value: string;
};

type AccordionTriggerProps = {
  className?: string;
  children: React.ReactNode;
};

type AccordionContentProps = {
  className?: string;
  children: React.ReactNode;
};

const StaticAccordionItem: React.FC<AccordionItemProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className={cn('border-b', className)}
    {...props}
  >
    {children}
  </div>
);
StaticAccordionItem.displayName = 'StaticAccordionItem';

const StaticAccordionTrigger: React.FC<AccordionTriggerProps> = ({
  className,
  children,
  ...props
}) => (
  <div className="flex">
    <button
      type="button"
      className={cn(
        'flex flex-1 items-center justify-between py-4 font-medium transition-all hover:underline',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown className="h-4 w-4 shrink-0" />
    </button>
  </div>
);
StaticAccordionTrigger.displayName = 'StaticAccordionTrigger';

const StaticAccordionContent: React.FC<AccordionContentProps> = ({
  className,
  children,
  ...props
}) => (
  <div
    className="overflow-hidden text-sm"
    {...props}
  >
    <div className={cn('pb-4 pt-0', className)}>{children}</div>
  </div>
);
StaticAccordionContent.displayName = 'StaticAccordionContent';

type StaticAccordionProps = {
  className?: string;
  children: React.ReactNode;
};

const StaticAccordion: React.FC<StaticAccordionProps> = ({
  className,
  children,
  ...props
}) => (
  <div className={cn('w-full', className)} {...props}>
    {children}
  </div>
);

export {
  StaticAccordion,
  StaticAccordionContent,
  StaticAccordionItem,
  StaticAccordionTrigger,
};
