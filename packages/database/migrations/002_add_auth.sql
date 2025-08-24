-- Add authentication fields to users table
ALTER TABLE users
ADD COLUMN password_hash VARCHAR(255) NOT NULL,
ADD COLUMN last_login TIMESTAMP WITH TIME ZONE;

-- Create index for email lookups (for login performance)
CREATE INDEX idx_users_email ON users(email);

-- Create index for authentication queries
CREATE INDEX idx_users_auth ON users(email, password_hash);