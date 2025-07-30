'use client';
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import { Slot } from '@radix-ui/react-slot';
import * as React from 'react';
import { Controller, FormProvider, useFormContext, } from 'react-hook-form';
import { Label } from './label';
import { cn } from '@rolitt/shared/utils';
const Form = FormProvider;
const FormFieldContext = React.createContext({});
const FormField = (_a) => {
    var props = __rest(_a, []);
    return (<FormFieldContext value={{ name: props.name }}>
      <Controller {...props}/>
    </FormFieldContext>);
};
const FormItemContext = React.createContext({});
const useFormField = () => {
    const fieldContext = React.use(FormFieldContext);
    const itemContext = React.use(FormItemContext);
    const { getFieldState, formState } = useFormContext();
    const fieldState = getFieldState(fieldContext.name, formState);
    if (!fieldContext) {
        throw new Error('useFormField should be used within <FormField>');
    }
    const { id } = itemContext;
    return Object.assign({ id, name: fieldContext.name, formItemId: `${id}-form-item`, formDescriptionId: `${id}-form-item-description`, formMessageId: `${id}-form-item-message` }, fieldState);
};
function FormItem(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const id = React.useId();
    return (<FormItemContext value={{ id }}>
      <div data-slot="form-item" className={cn('grid gap-2', className)} {...props}/>
    </FormItemContext>);
}
function FormLabel(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { error, formItemId } = useFormField();
    return (<Label data-slot="form-label" data-error={!!error} className={cn('data-[error=true]:text-destructive', className)} htmlFor={formItemId} {...props}/>);
}
function FormControl(_a) {
    var props = __rest(_a, []);
    const { error, formItemId, formDescriptionId, formMessageId } = useFormField();
    return (<Slot data-slot="form-control" id={formItemId} aria-describedby={!error
            ? `${formDescriptionId}`
            : `${formDescriptionId} ${formMessageId}`} aria-invalid={!!error} {...props}/>);
}
function FormDescription(_a) {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { formDescriptionId } = useFormField();
    return (<p data-slot="form-description" id={formDescriptionId} className={cn('text-muted-foreground text-sm', className)} {...props}/>);
}
function FormMessage(_a) {
    var _b;
    var { className } = _a, props = __rest(_a, ["className"]);
    const { error, formMessageId } = useFormField();
    const body = error ? String((_b = error === null || error === void 0 ? void 0 : error.message) !== null && _b !== void 0 ? _b : '') : props.children;
    if (!body) {
        return null;
    }
    return (<p data-slot="form-message" id={formMessageId} className={cn('text-destructive text-sm', className)} {...props}>
      {body}
    </p>);
}
export { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, useFormField, };
//# sourceMappingURL=form.jsx.map