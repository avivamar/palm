import type { VariantProps } from 'class-variance-authority';
import * as ToastPrimitives from '@radix-ui/react-toast';
import * as React from 'react';
declare const ToastProvider: import("react").FC<ToastPrimitives.ToastProviderProps>;
declare const ToastViewport: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Viewport> & {
        ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Viewport> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const toastVariants: (props?: ({
    variant?: "default" | "destructive" | null | undefined;
} & import("class-variance-authority/types").ClassProp) | undefined) => string;
declare const Toast: {
    ({ ref, className, variant, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Root> & VariantProps<typeof toastVariants> & {
        ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Root> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const ToastAction: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Action> & {
        ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Action> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const ToastClose: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Close> & {
        ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Close> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const ToastTitle: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Title> & {
        ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Title> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const ToastDescription: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof ToastPrimitives.Description> & {
        ref?: React.RefObject<React.ElementRef<typeof ToastPrimitives.Description> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
type ToastProps = React.ComponentPropsWithoutRef<typeof Toast>;
type ToastActionElement = React.ReactElement<typeof ToastAction>;
export { Toast, ToastAction, type ToastActionElement, ToastClose, ToastDescription, type ToastProps, ToastProvider, ToastTitle, ToastViewport, };
//# sourceMappingURL=toast.d.ts.map