import * as React from 'react';
export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;
declare const Input: {
    ({ ref, className, type, ...props }: InputProps & {
        ref?: React.RefObject<HTMLInputElement | null>;
    }): React.JSX.Element;
    displayName: string;
};
export { Input };
//# sourceMappingURL=input.d.ts.map