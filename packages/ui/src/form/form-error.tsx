import { HTMLAttributes } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormField } from './form-field';

export interface FormErrorProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function FormError({ className = '', ...props }: FormErrorProps) {
  const { name, id } = useFormField();
  const { formState: { errors } } = useFormContext();
  
  const error = errors[name];
  
  if (!error?.message) {
    return null;
  }

  return (
    <div
      id={`${id}-error`}
      role="alert"
      aria-live="polite"
      className={`form-error ${className}`}
      {...props}
    >
      {error.message as string}
    </div>
  );
}