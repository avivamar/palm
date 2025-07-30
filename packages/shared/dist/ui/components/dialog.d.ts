import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
declare const Dialog: import("react").FC<DialogPrimitive.DialogProps>;
declare const DialogTrigger: import("react").ForwardRefExoticComponent<DialogPrimitive.DialogTriggerProps & import("react").RefAttributes<HTMLButtonElement>>;
declare const DialogPortal: import("react").FC<DialogPrimitive.DialogPortalProps>;
declare const DialogClose: import("react").ForwardRefExoticComponent<DialogPrimitive.DialogCloseProps & import("react").RefAttributes<HTMLButtonElement>>;
declare const DialogOverlay: React.ForwardRefExoticComponent<React.RefAttributes<never>>;
declare const DialogContent: React.ForwardRefExoticComponent<React.RefAttributes<never>>;
declare const DialogHeader: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
declare const DialogFooter: {
    ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>): React.JSX.Element;
    displayName: string;
};
declare const DialogTitle: React.ForwardRefExoticComponent<React.RefAttributes<never>>;
declare const DialogDescription: React.ForwardRefExoticComponent<React.RefAttributes<never>>;
export { Dialog, DialogPortal, DialogOverlay, DialogClose, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, };
//# sourceMappingURL=dialog.d.ts.map