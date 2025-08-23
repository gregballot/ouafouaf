# Implementation Plan: User Authentication DDD Refactoring

This document outlines the step-by-step implementation plan for refactoring the current authentication system to follow our DDD + Hexagonal Architecture patterns.

## Current State Analysis

### Existing Files to Refactor
- `src/routes/auth.ts` - Contains mixed HTTP/business/data logic
- `src/lib/auth.ts` - JWT utilities and password hashing
- `@repo/database` - Database functions (createUser, findUserByEmail, updateLastLogin)

### Current Issues
- Business logic mixed with HTTP handling
- Direct database calls from routes
- No domain modeling or validation
- Difficult to unit test business rules
- No transaction management

## Implementation Phases

### Phase 1: Foundation Setup
**Goal**: Set up basic infrastructure and shared utilities

#### 1.1 Install Dependencies
```bash
# Add Result pattern library or implement our own
# Add test dependencies if needed
pnpm add --filter=api <testing-deps>
```

#### 1.2 Create Shared Utilities
- `src/shared/Result.ts` - Result pattern implementation
- `src/shared/types.ts` - Common types (Transaction, etc.)

#### 1.3 Database Transaction Setup
- Update Fastify hooks for transaction management
- Ensure transaction is attached to request object

### Phase 2: User Domain Creation
**Goal**: Create the User subdomain with entity, repository, and events

#### 2.1 User Entity
Create `src/domain/User/User.ts`:
- User entity class with private constructor
- Inline Email and Password value objects
- Static create() factory method
- Business methods (authenticate, etc.)
- getInternalState() for persistence

#### 2.2 User Repository
Create `src/domain/User/UserRepository.ts`:
- Constructor takes transaction
- Smart save() method (create/update)
- findByEmail() and findById() methods
- Uses Result pattern for error handling

#### 2.3 User Events
Create `src/domain/User/event.ts`:
- UserRegistered domain event
- UserLoggedIn domain event  
- UserEvents union type

#### 2.4 User Builder (for tests)
Create `src/domain/User/UserBuilder.ts`:
- Fluent builder pattern
- Default test values
- build() method returns User entity

### Phase 3: Domain Event Infrastructure
**Goal**: Set up centralized event handling

#### 3.1 Base Event Types
Create `src/domain/DomainEvent/DomainEvent.ts`:
- DomainEvent interface
- Base event properties

#### 3.2 Event Repository
Create `src/domain/DomainEvent/EventRepository.ts`:
- publish() method for storing events
- findByAggregateId() for event sourcing
- Uses transaction from constructor

#### 3.3 Event Aggregation
Create `src/domain/DomainEvent/index.ts`:
- Import and re-export all domain events
- AllDomainEvents union type
- Type-safe event aggregation

### Phase 4: Feature Implementation
**Goal**: Implement business use cases as feature functions

#### 4.1 Register User Feature
Create `src/domain/User/features/register-user.ts`:
- RegisterUserPayload type
- RegisterUserDependencies type
- registerUser() function
- Email uniqueness validation
- User creation and persistence
- Domain event publishing

#### 4.2 Authenticate User Feature
Create `src/domain/User/features/authenticate-user.ts`:
- AuthenticateUserPayload type
- AuthenticateUserDependencies type
- authenticateUser() function
- Credential verification
- Token generation
- Login time tracking

### Phase 5: Testing Infrastructure
**Goal**: Create comprehensive test suite

#### 5.1 Entity Unit Tests
Create `src/domain/User/User.test.ts`:
- Test User.create() with valid/invalid data
- Test business methods (authenticate, etc.)
- Test value object validation (Email, Password)
- Test getInternalState() output

#### 5.2 Feature Integration Tests
Create `src/domain/User/features/register-user.test.ts`:
- Test successful user registration
- Test duplicate email handling
- Test invalid input handling
- Use UserBuilder for test data
- Use real database transactions

Create `src/domain/User/features/authenticate-user.test.ts`:
- Test successful authentication
- Test invalid credentials
- Test user not found scenarios
- Verify login time updates

#### 5.3 Test Setup
- Configure test database
- Set up transaction rollback after each test
- Create test utilities for database setup

### Phase 6: Route Layer Integration
**Goal**: Update HTTP routes to use new architecture

#### 6.1 Update Auth Routes
Update `src/routes/auth.ts`:
- Remove business logic from route handlers
- Instantiate repositories with request.transaction
- Call feature functions with typed payloads
- Handle Result pattern responses
- Map domain objects to HTTP responses

#### 6.2 Route Tests
Create `src/routes/auth.test.ts`:
- End-to-end API tests
- Test HTTP contract compatibility
- Test error response formats
- Test transaction rollback on errors

### Phase 7: Cleanup and Migration
**Goal**: Remove old code and ensure clean migration

#### 7.1 Remove Old Code
- Remove unused functions from `src/lib/auth.ts`
- Remove direct database calls from routes
- Clean up unused imports

#### 7.2 Verify Compatibility
- Ensure API responses match existing format
- Verify JWT tokens work with existing frontend
- Test database schema compatibility

## Implementation Order

### Files to Create (in order)
1. `src/shared/Result.ts`
2. `src/domain/User/User.ts`
3. `src/domain/User/UserRepository.ts`
4. `src/domain/User/event.ts`
5. `src/domain/DomainEvent/DomainEvent.ts`
6. `src/domain/DomainEvent/EventRepository.ts`
7. `src/domain/DomainEvent/index.ts`
8. `src/domain/User/UserBuilder.ts`
9. `src/domain/User/features/register-user.ts`
10. `src/domain/User/features/authenticate-user.ts`
11. Tests (entities first, then features)
12. Updated routes
13. Route tests

### Database Considerations
- Existing database schema should work as-is
- User table: id, email, password_hash, created_at, updated_at, last_login
- May need events table for domain events
- Ensure transaction support is enabled

### Testing Strategy
- Run entity tests first (fastest feedback)
- Run feature integration tests with test database
- Run route tests for API compatibility
- Maintain test isolation with transaction rollback

### Rollback Plan
- Keep old route handlers alongside new ones
- Use feature flags or route prefixes during migration
- Can switch back to old implementation if issues arise
- Database schema remains unchanged

## Success Criteria

### Functional Requirements
- ✅ User registration works with same API contract
- ✅ User authentication works with existing JWT tokens
- ✅ All existing API responses maintain format
- ✅ Database transactions work correctly
- ✅ Domain events are published successfully

### Quality Requirements  
- ✅ Entity unit tests pass (business rule validation)
- ✅ Feature integration tests pass (real database)
- ✅ Route tests pass (API contract compliance)
- ✅ Code coverage on domain logic > 80%
- ✅ No business logic remains in route handlers

### Performance Requirements
- ✅ Authentication performance equal or better
- ✅ Database queries optimized (no N+1 problems)
- ✅ Transaction overhead minimal

## Timeline Estimates

- **Phase 1 (Foundation)**: 2-3 hours
- **Phase 2 (User Domain)**: 4-5 hours  
- **Phase 3 (Events)**: 2-3 hours
- **Phase 4 (Features)**: 3-4 hours
- **Phase 5 (Testing)**: 4-6 hours
- **Phase 6 (Routes)**: 2-3 hours
- **Phase 7 (Cleanup)**: 1-2 hours

**Total Estimated Time**: 18-26 hours

## Risk Mitigation

### Technical Risks
- **Transaction performance**: Monitor for connection pool issues
- **Event storage**: Start simple, can enhance later
- **Type complexity**: Keep Result pattern simple

### Migration Risks
- **API compatibility**: Maintain exact response formats
- **Database integrity**: Use transactions consistently
- **Team adoption**: Document patterns clearly

### Testing Risks
- **Test database setup**: Ensure isolated test environment
- **Test data management**: Use builders consistently
- **Integration complexity**: Test transaction rollback thoroughly

## Next Steps

1. **Review and approve this plan**
2. **Set up development environment**
3. **Begin Phase 1 implementation**
4. **Review each phase before proceeding**
5. **Test thoroughly at each step**

This plan ensures a systematic migration from the current architecture to the new DDD + Hexagonal approach while maintaining system stability and API compatibility.