# Security Guidelines

This document outlines security principles and practices to ensure the application remains secure across all layers of the stack.

## Core Security Principles

### Environment Variable Management

- **Never include fallback secrets** in code - always require environment variables for sensitive data
- **Fail fast if missing** - application should not start without required security configuration
- **No hardcoded credentials** - all sensitive data must come from environment variables
- **Separate configurations** for development, staging, and production environments

```typescript
// ✅ Good - Required environment variables
const config = {
  jwtSecret: process.env.JWT_SECRET,
  databaseUrl: process.env.DATABASE_URL,
  encryptionKey: process.env.ENCRYPTION_KEY,
};

if (!config.jwtSecret || !config.databaseUrl || !config.encryptionKey) {
  throw new Error('Missing required security environment variables');
}

// ❌ Bad - Fallback secrets in code
const jwtSecret = process.env.JWT_SECRET || 'default-secret-key';
```

### Multi-Layer Validation

- **Validate inputs at all boundaries**: client, API, and database layers
- **Never trust external data** - validate everything that crosses system boundaries
- **Client-side validation** for user experience, **server-side validation** for security
- **Database constraints** as the final validation layer

```typescript
// Frontend validation
const loginSchema = z.object({
  email: z.string().email().max(255),
  password: z.string().min(8).max(128),
});

// API validation
export async function authenticate(payload: unknown) {
  const validatedPayload = loginSchema.parse(payload); // Throws if invalid

  // Additional business logic validation
  const email = Email.create(validatedPayload.email);
  if (!email) {
    throw new InvalidEmailError();
  }

  // Continue with secure processing...
}
```

### Database Security

- **Use parameterized queries exclusively** - never use string concatenation for SQL
- **Kysely provides automatic parameterization** - leverage type-safe query building
- **Database-level constraints** for critical business rules
- **Least privilege principle** for database user permissions

```typescript
// ✅ Good - Parameterized query with Kysely
const user = await db
  .selectFrom('users')
  .selectAll()
  .where('email', '=', email.toString()) // Automatically parameterized
  .executeTakeFirst();

// ❌ Bad - String concatenation (SQL injection risk)
const query = `SELECT * FROM users WHERE email = '${email}'`;
```

### Defensive Programming

- **Always check for null/undefined** before using critical data
- **Assume external systems can fail** or return unexpected data
- **Validate data shapes** especially from external APIs or user input
- **Graceful error handling** without exposing sensitive information

```typescript
// ✅ Good - Defensive programming
export async function getUserProfile(userId: string) {
  if (!userId?.trim()) {
    throw new InvalidInputError('User ID is required');
  }

  const user = await userRepository.findById(userId);
  if (!user) {
    throw new UserNotFoundError(); // Don't expose existence check details
  }

  return {
    id: user.id,
    email: user.email.toString(),
    // Only expose safe, intended data
  };
}
```

## Authentication & Authorization

### JWT Token Security

- **Strong secret generation** - use cryptographically secure random secrets
- **Appropriate token expiration** - balance security with user experience
- **Secure token storage** - httpOnly cookies preferred over localStorage
- **Token validation** on every protected route

```typescript
// JWT configuration
const jwtConfig = {
  secret: process.env.JWT_SECRET, // Must be cryptographically secure
  expiresIn: '24h', // Appropriate expiration
  issuer: 'ouafouaf-api',
  audience: 'ouafouaf-web',
};

// Secure cookie configuration
const cookieOptions = {
  httpOnly: true, // Prevent XSS access
  secure: process.env.NODE_ENV === 'production', // HTTPS only in production
  sameSite: 'strict' as const, // CSRF protection
  maxAge: 24 * 60 * 60 * 1000, // 24 hours
};
```

### Password Security

- **Strong hashing** - use bcrypt or similar with appropriate salt rounds
- **Password complexity requirements** - enforce minimum security standards
- **Rate limiting** on authentication attempts
- **Account lockout** after repeated failures

```typescript
// Password hashing
export class Password {
  private static readonly SALT_ROUNDS = 12;

  static async create(plaintext: string): Promise<Password> {
    this.validateStrength(plaintext); // Enforce complexity
    const hash = await bcrypt.hash(plaintext, this.SALT_ROUNDS);
    return new Password(hash);
  }

  async verify(plaintext: string): Promise<boolean> {
    return bcrypt.compare(plaintext, this.hash);
  }
}
```

## Input Validation & Sanitization

### Validation Strategy

- **Schema-based validation** using Zod for consistent validation rules
- **Strict type checking** at runtime for external data
- **Whitelist approach** - only allow known, expected values
- **Context-appropriate validation** - different rules for different use cases

```typescript
// Comprehensive validation schemas
const createUserSchema = z.object({
  email: z
    .string()
    .email('Invalid email format')
    .max(255, 'Email too long')
    .toLowerCase()
    .trim(),
  password: z
    .string()
    .min(8, 'Password too short')
    .max(128, 'Password too long')
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      'Password complexity requirements not met'
    ),
  name: z
    .string()
    .min(1, 'Name required')
    .max(100, 'Name too long')
    .regex(/^[a-zA-Z\s-']+$/, 'Invalid characters in name'),
});
```

### Output Encoding

- **Escape HTML content** when rendering user-generated content
- **JSON encoding** for API responses to prevent injection
- **Context-aware encoding** based on output destination
- **Content Security Policy** headers to prevent XSS

## Network Security

### HTTPS Enforcement

- **Force HTTPS** in production environments
- **Secure cookie flags** for HTTPS-only transmission
- **HSTS headers** to prevent downgrade attacks
- **Certificate validation** for external API calls

### CORS Configuration

```typescript
// Restrictive CORS policy
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  credentials: true, // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

### Rate Limiting

- **API rate limiting** to prevent abuse
- **Authentication attempt limits** to prevent brute force
- **IP-based limiting** for suspicious activity
- **User-based limiting** for resource-intensive operations

## Data Protection

### Sensitive Data Handling

- **Encryption at rest** for sensitive database fields
- **Encryption in transit** with HTTPS
- **No sensitive data in logs** - sanitize log output
- **Data retention policies** - remove data when no longer needed

```typescript
// Logging without sensitive data
logger.info('User login attempt', {
  userId: user.id,
  ip: request.ip,
  userAgent: request.headers['user-agent'],
  // ❌ Don't log: password, email, session tokens
});
```

### Database Security

- **Connection string security** - never log database URLs
- **Database user permissions** - minimal required access
- **Connection pooling limits** - prevent connection exhaustion
- **Query timeout limits** - prevent resource exhaustion

## Error Handling Security

### Information Disclosure Prevention

- **Generic error messages** for external users
- **Detailed logging** for internal debugging
- **No stack traces** in production API responses
- **Consistent error response format** to prevent information leaking

```typescript
// Error response without sensitive information
export class DomainError extends Error {
  abstract readonly httpStatus: number;
  abstract readonly code: string;

  toResponse() {
    return {
      error: {
        message: this.message, // Safe, user-friendly message
        code: this.code,
        // ❌ Don't include: stack trace, internal details, file paths
      },
    };
  }
}
```

### Graceful Error Handling

- **Fail securely** - errors should not expose system internals
- **Consistent error timing** - prevent timing attacks
- **Error recovery** - graceful degradation when possible
- **Security event logging** - log security-relevant errors

## Monitoring & Audit

### Security Logging

- **Authentication events** - login attempts, failures, successes
- **Authorization failures** - access attempts to restricted resources
- **Input validation failures** - potential attack attempts
- **System security events** - configuration changes, security updates

```typescript
// Security event logging
export function logSecurityEvent(event: SecurityEvent) {
  logger.warn('Security event', {
    type: event.type,
    userId: event.userId,
    ip: event.ip,
    timestamp: event.timestamp,
    details: event.sanitizedDetails, // No sensitive data
  });
}
```

### Monitoring Strategy

- **Failed authentication monitoring** - detect brute force attempts
- **Unusual access patterns** - detect potential security breaches
- **Performance anomalies** - detect potential DoS attacks
- **Configuration drift** - detect unauthorized changes

## Security Testing

### Testing Security Controls

- **Authentication testing** - verify token validation and expiration
- **Authorization testing** - verify access controls work correctly
- **Input validation testing** - test boundary conditions and malicious input
- **Error handling testing** - verify secure error responses

```typescript
// Security test example
describe('Authentication Security', () => {
  it('should reject expired tokens', async () => {
    const expiredToken = generateExpiredToken();

    const response = await request(app)
      .get('/api/protected')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);

    expect(response.body.error.code).toBe('TOKEN_EXPIRED');
    expect(response.body.error.message).not.toContain('internal'); // No sensitive details
  });
});
```

## Security Checklist

### Development Phase

- [ ] All environment variables for secrets are required (no fallbacks)
- [ ] Input validation at all system boundaries
- [ ] Parameterized database queries only
- [ ] Proper password hashing implementation
- [ ] Secure JWT configuration
- [ ] HTTPS enforcement in production
- [ ] Error messages don't expose sensitive information

### Deployment Phase

- [ ] Strong, unique secrets generated for production
- [ ] Database user has minimal required permissions
- [ ] CORS policy restricts origins appropriately
- [ ] Rate limiting configured for API endpoints
- [ ] Security headers configured (CSP, HSTS, etc.)
- [ ] SSL certificate properly configured
- [ ] Security monitoring and alerting set up

This security framework ensures defense-in-depth while maintaining usability and development efficiency.
