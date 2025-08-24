import { InputHTMLAttributes, forwardRef } from 'react';
import { useFormContext } from 'react-hook-form';
import { useFormField } from './form-field';

export interface FormInputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'name'> {
  className?: string;
}

export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
  ({ className = '', type = 'text', ...props }, ref) => {
    const { name, id } = useFormField();
    const {
      register,
      formState: { errors },
    } = useFormContext();

    const error = errors[name];
    const hasError = !!error;

    const registration = register(name);

    return (
      <input
        {...registration}
        {...props}
        ref={(e) => {
          registration.ref(e);
          if (typeof ref === 'function') {
            ref(e);
          } else if (ref) {
            ref.current = e;
          }
        }}
        id={id}
        type={type}
        className={`form-input ${hasError ? 'form-input--error' : ''} ${className}`}
        aria-invalid={hasError}
        aria-describedby={hasError ? `${id}-error` : undefined}
      />
    );
  }
);

FormInput.displayName = 'FormInput';
