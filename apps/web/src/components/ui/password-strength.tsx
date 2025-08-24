interface PasswordStrengthProps {
  password: string;
  strength: { score: number; feedback: string[] };
}

function getStrengthColor(score: number): string {
  if (score <= 1) return '#ef4444'; // red
  if (score <= 2) return '#f59e0b'; // yellow
  if (score <= 3) return '#3b82f6'; // blue
  return '#22c55e'; // green
}

function getStrengthText(score: number): string {
  if (score <= 1) return 'Weak';
  if (score <= 2) return 'Fair';
  if (score <= 3) return 'Good';
  return 'Strong';
}

export function PasswordStrength({
  password,
  strength,
}: PasswordStrengthProps) {
  if (!password) return null;

  return (
    <div style={{ marginTop: '0.5rem' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          marginBottom: '0.25rem',
        }}
      >
        <div
          style={{
            height: '4px',
            width: '100%',
            backgroundColor: '#e5e5e5',
            borderRadius: '2px',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${(strength.score / 4) * 100}%`,
              backgroundColor: getStrengthColor(strength.score),
              transition: 'all 0.3s ease',
            }}
          />
        </div>
        <span
          style={{
            fontSize: '0.75rem',
            fontWeight: '500',
            color: getStrengthColor(strength.score),
            minWidth: '50px',
          }}
        >
          {getStrengthText(strength.score)}
        </span>
      </div>
      {strength.feedback.length > 0 && (
        <ul
          style={{
            fontSize: '0.75rem',
            color: '#6b7280',
            margin: '0',
            paddingLeft: '1rem',
            listStyle: 'disc',
          }}
        >
          {strength.feedback.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
