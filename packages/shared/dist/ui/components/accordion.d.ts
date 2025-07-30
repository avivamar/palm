import * as AccordionPrimitive from '@radix-ui/react-accordion';
import * as React from 'react';
declare const Accordion: import("react").ForwardRefExoticComponent<(AccordionPrimitive.AccordionSingleProps | AccordionPrimitive.AccordionMultipleProps) & import("react").RefAttributes<HTMLDivElement>>;
declare const AccordionItem: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item> & {
        ref?: React.RefObject<React.ElementRef<typeof AccordionPrimitive.Item> | null>;
    }): React.JSX.Element;
    displayName: string;
};
declare const AccordionTrigger: {
    ({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger> & {
        ref?: React.RefObject<React.ElementRef<typeof AccordionPrimitive.Trigger> | null>;
    }): React.JSX.Element;
    displayName: string;
};
declare const AccordionContent: {
    ({ ref, className, children, ...props }: React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content> & {
        ref?: React.RefObject<React.ElementRef<typeof AccordionPrimitive.Content> | null>;
    }): React.JSX.Element;
    displayName: string;
};
export { Accordion, AccordionContent, AccordionItem, AccordionTrigger };
//# sourceMappingURL=accordion.d.ts.map