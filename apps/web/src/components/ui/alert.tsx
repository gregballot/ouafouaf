import styles from './alert.module.scss';

interface AlertProps {
  children: React.ReactNode;
  variant?: 'error' | 'success' | 'warning' | 'info';
  className?: string;
}

export function Alert({
  children,
  variant = 'error',
  className = '',
}: AlertProps) {
  const classes = [
    styles.alert,
    styles[`alert${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}
