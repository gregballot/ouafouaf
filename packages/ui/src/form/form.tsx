import { ReactNode, FormHTMLAttributes } from 'react';
import { UseFormReturn, FormProvider } from 'react-hook-form';

export interface FormProps extends Omit<FormHTMLAttributes<HTMLFormElement>, 'onSubmit'> {
  children: ReactNode;
  form: UseFormReturn<any>;
  onSubmit: (data: any) => void | Promise<void>;
  className?: string;
}

export function Form({ children, form, onSubmit, className = '', ...props }: FormProps) {
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