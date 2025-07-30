import type * as LabelPrimitive from '@radix-ui/react-label';
import type { ControllerProps, FieldPath, FieldValues } from 'react-hook-form';
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
declare const Form: <TFieldValues extends FieldValues, TContext = any, TTransformedValues = TFieldValues>(props: import("react-hook-form").FormProviderProps<TFieldValues, TContext, TTransformedValues>) => import("react").JSX.Element;
declare const FormField: <TFieldValues extends FieldValues = FieldValues, TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>>({ ...props }: ControllerProps<TFieldValues, TName>) => React.JSX.Element;
declare const useFormField: () => {
    invalid: boolean;
    isDirty: boolean;
    isTouched: boolean;
    isValidating: boolean;
    error?: import("react-hook-form").FieldError;
    id: any;
    name: any;
    formItemId: string;
    formDescriptionId: string;
    formMessageId: string;
};
declare function FormItem({ className, ...props }: React.ComponentProps<'div'>): React.JSX.Element;
declare function FormLabel({ className, ...props }: React.ComponentProps<typeof LabelPrimitive.Root>): React.JSX.Element;
declare function FormControl({ ...props }: React.ComponentProps<typeof Slot>): React.JSX.Element;
declare function FormDescription({ className, ...props }: React.ComponentProps<'p'>): React.JSX.Element;
declare function FormMessage({ className, ...props }: React.ComponentProps<'p'>): React.JSX.Element | null;
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField, };
//# sourceMappingURL=form.d.ts.map