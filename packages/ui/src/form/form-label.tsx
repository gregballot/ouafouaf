import { LabelHTMLAttributes, ReactNode } from 'react';
import { useFormField } from './form-field';

export interface FormLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  children: ReactNode;
  required?: boolean;
  className?: string;
}

export function FormLabel({ children, required = false, className = '', ...props }: FormLabelProps) {
  const { id } = useFormField();

  return (
    <label
      htmlFor={id}
      className={`form-label ${required ? 'form-label--required' : ''} ${className}`}
      {...props}
    >
      {children}
      {required && <span className="form-label__required" aria-hidden="true">*</span>}
    </label>
  );
}