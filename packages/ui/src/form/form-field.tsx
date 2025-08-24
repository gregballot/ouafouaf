import { ReactNode, createContext, useContext } from 'react';

interface FormFieldContextType {
  name: string;
  id: string;
}

const FormFieldContext = createContext<FormFieldContextType | null>(null);

export function useFormField() {
  const context = useContext(FormFieldContext);
  if (!context) {
    throw new Error('useFormField must be used within a FormField');
  }
  return context;
}

export interface FormFieldProps {
  children: ReactNode;
  name: string;
  className?: string;
}

export function FormField({ children, name, className = '' }: FormFieldProps) {
  const id = `field-${name}`;

  return (
    <FormFieldContext.Provider value={{ name, id }}>
      <div className={`form-field ${className}`}>{children}</div>
    </FormFieldContext.Provider>
  );
}
