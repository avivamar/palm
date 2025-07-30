import * as React from 'react';
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
declare const StaticAccordionItem: React.FC<AccordionItemProps>;
declare const StaticAccordionTrigger: React.FC<AccordionTriggerProps>;
declare const StaticAccordionContent: React.FC<AccordionContentProps>;
type StaticAccordionProps = {
    className?: string;
    children: React.ReactNode;
};
declare const StaticAccordion: React.FC<StaticAccordionProps>;
export { StaticAccordion, StaticAccordionContent, StaticAccordionItem, StaticAccordionTrigger, };
//# sourceMappingURL=static-accordion.d.ts.map