interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
}

function LoadingSpinner({ size = 'md' }: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 32,
  };

  const spinnerStyle = {
    width: `${sizeMap[size]}px`,
    height: `${sizeMap[size]}px`,
    border: '2px solid #d1d5db',
    borderTop: '2px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  return <div style={spinnerStyle} />;
}

interface LoadingPageProps {
  title?: string;
  message?: string;
}

export function LoadingPage({ title = 'Loading', message }: LoadingPageProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <LoadingSpinner size="lg" />
      <h2
        style={{
          fontSize: '1.25rem',
          fontWeight: '600',
          margin: '1.5rem 0 0.5rem 0',
          color: '#374151',
        }}
      >
        {title}
      </h2>
      {message && (
        <p
          style={{
            fontSize: '0.875rem',
            color: '#6b7280',
            margin: 0,
            maxWidth: '400px',
          }}
        >
          {message}
        </p>
      )}
    </div>
  );
}

interface InitializingAppProps {
  message?: string;
}

export function InitializingApp({
  message = 'Setting up your session...',
}: InitializingAppProps) {
  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        zIndex: 9999,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '1rem',
          padding: '2rem',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        }}
      >
        <LoadingSpinner size="lg" />
        <div style={{ textAlign: 'center' }}>
          <h3
            style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              margin: '0 0 0.25rem 0',
              color: '#374151',
            }}
          >
            Initializing App
          </h3>
          <p
            style={{
              fontSize: '0.875rem',
              color: '#6b7280',
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
