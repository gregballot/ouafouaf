import { ReactNode, FormHTMLAttributes } from 'react';
import { UseFormReturn, FormProvider, FieldValues } from 'react-hook-form';

export interface FormProps<T extends FieldValues = FieldValues> extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  form: UseFormReturn<T>;
  onSubmit: (data: T) => void | Promise<void>;
  className?: string;
}

export function Form<T extends FieldValues = FieldValues>({ children, form, onSubmit, className = '', ...props }: FormProps<T>) {
  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <FormProvider {...form}>
      <form
        onSubmit={handleSubmit}
        className={`form ${className}`}
        noValidate
        {...props}
      >
        {children}
      </form>
    </FormProvider>
  );
}