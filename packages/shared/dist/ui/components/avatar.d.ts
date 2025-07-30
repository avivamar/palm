import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';
declare const Avatar: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root> & {
        ref?: React.RefObject<React.ElementRef<typeof AvatarPrimitive.Root> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const AvatarImage: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image> & {
        ref?: React.RefObject<React.ElementRef<typeof AvatarPrimitive.Image> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
declare const AvatarFallback: {
    ({ ref, className, ...props }: React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback> & {
        ref?: React.RefObject<React.ElementRef<typeof AvatarPrimitive.Fallback> | null>;
    }): React.JSX.Element;
    displayName: string | undefined;
};
export { Avatar, AvatarFallback, AvatarImage };
//# sourceMappingURL=avatar.d.ts.map