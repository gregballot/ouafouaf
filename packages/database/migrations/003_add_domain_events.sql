-- Create domain_events table for event sourcing
CREATE TABLE domain_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    aggregate_id UUID NOT NULL,
    event_name VARCHAR(255) NOT NULL,
    event_data JSONB NOT NULL,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for querying events by name
CREATE INDEX idx_domain_events_name ON domain_events(event_name);

-- Index for querying events by occurrence time
CREATE INDEX idx_domain_events_occurred_at ON domain_events(occurred_at);

-- Index for querying events by aggregate ID (most common query)
CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_id);

-- Index for querying events by aggregate and time
CREATE INDEX idx_domain_events_aggregate_time ON domain_events(aggregate_id, occurred_at);

-- Index for general JSON queries
CREATE INDEX idx_domain_events_data ON domain_events USING GIN (event_data);