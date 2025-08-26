import { forwardRef } from 'react';
import styles from './checkbox.module.scss';

export interface CheckboxProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: boolean;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, className, ...props }, ref) => {
    return (
      <label className={`${styles.checkbox} ${className || ''}`}>
        <input
          type="checkbox"
          ref={ref}
          className={styles.checkboxInput}
          {...props}
        />
        {label && <span className={styles.checkboxLabel}>{label}</span>}
      </label>
    );
  }
);

Checkbox.displayName = 'Checkbox';
