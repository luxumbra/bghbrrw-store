# Bough & Burrow - Development Documentation

## Quick Start

### Using Docker (Recommended)
```bash
# Start the development environment
./scripts/docker-dev.sh up

# Run database migrations and seed data
./scripts/docker-dev.sh setup

# View logs
./scripts/docker-dev.sh logs backend
./scripts/docker-dev.sh logs frontend

# Stop the environment
./scripts/docker-dev.sh down
```

### Using Local Development
```bash
# Install dependencies
pnpm install

# Start backend
pnpm --filter @boughandburrow/backend dev

# Start frontend (in another terminal)
pnpm --filter @boughandburrow/frontend dev
```

## Available Commands

### Docker Commands (`./scripts/docker-dev.sh`)
- `up` - Start the development environment
- `down` - Stop the development environment
- `restart` - Restart all services
- `logs [service]` - View logs (optionally specify service)
- `migrate` - Run database migrations
- `seed` - Seed the database with sample data
- `setup` - Setup database (migrate + seed)
- `seed-bnb` - Seed the database with Bough & Burrow specific data
- `backup` - Backup the database
- `restore` - Restore the database from a backup
- `reset` - Reset database (WARNING: destroys all data)
- `cleanup` - Clean up Docker resources

### Local Development Commands
- `pnpm install` - Install all dependencies
- `pnpm --filter @badgerstore/backend dev` - Start backend
- `pnpm --filter @badgerstore/frontend dev` - Start frontend
- `pnpm --filter @badgerstore/cms dev` - Start CMS (Sanity Studio)

## Services & Ports

| Service   | URL                    | Port | Description           |
|-----------|------------------------|------|----------------------|
| Frontend  | http://localhost:8000      | 8000 | Next.js application  |
| Backend   | http://localhost:9000      | 9000 | Medusa API           |
| Admin UI  | http://localhost:9000/app  | 9000 | Medusa Admin         |
| CMS       | http://localhost:3333      | 3333 | Sanity Studio        |
| Database  | Neon Cloud                 | N/A  | PostgreSQL (Cloud)   |
| Redis     | localhost:6379             | 6379 | Cache/Sessions       |

## Environment Variables

### Backend (apps/backend/.env)
```bash
# Database (Neon Cloud)
DATABASE_URL=postgresql://neondb_owner:npg_OCZvp2N6Uark@ep-noisy-silence-abpv5ua5-pooler.eu-west-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# Medusa Core
NODE_ENV=development
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Redis
REDIS_URL=redis://redis:6379

# External Services
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
RESEND_API_KEY=your_resend_key
EMAIL_FROM=hello@boughandburrow.uk
```

### Frontend (apps/frontend/.env.local)
```bash
# Medusa
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=your_publishable_key

# Environment
NODE_ENV=development
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# External Services
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=b3tpdz7f
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
```

### CMS (Environment Variables)
```bash
# Sanity Studio (set in docker-compose.yml)
SANITY_STUDIO_PROJECT_ID=b3tpdz7f
SANITY_STUDIO_DATASET=production
```

## Troubleshooting

### Critical Issues & Solutions

#### 5. Medusa CLI Error: "TypeError: cmd is not a function"
**Problem:** Backend fails to start with CLI internal error in versions 2.8.4+
**Error:** 
```
TypeError: cmd is not a function
at /workspace/node_modules/.pnpm/@medusajs+cli@2.8.4_.../src/create-cli.ts:384:11
```
**Root Cause:** Internal bug in Medusa CLI versions 2.8.4 and 2.8.5
**Solution:** Use Medusa v2.8.0 (confirmed stable version)
```bash
# In apps/backend/package.json, set all @medusajs packages to "2.8.0"
"@medusajs/admin-sdk": "2.8.0",
"@medusajs/cli": "2.8.0", 
"@medusajs/dashboard": "2.8.0",
"@medusajs/framework": "2.8.0",
"@medusajs/medusa": "2.8.0",
"@medusajs/test-utils": "2.8.0"
```

#### 6. Stripe Integration Compatibility Issues
**Problem:** Custom Stripe provider fails with "Class extends value undefined"
**Root Cause:** Payment provider API changes between Medusa versions
**Solution:** Use official built-in Stripe provider instead of custom implementation
```typescript
// In medusa-config.ts - use this:
{
  resolve: "@medusajs/medusa/payment-stripe",
  id: "stripe",
  options: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    capture: true,
  },
}

// Instead of custom provider path like:
// resolve: "./src/modules/stripe"
```

#### 7. Docker Volume Mount Issues
**Problem:** Dependencies not found in container despite being installed
**Symptoms:** 
- `Cannot find module '@medusajs/cli'`
- `Cannot find module 'stripe'`
**Root Cause:** Incorrect Docker volume mounting paths
**Solution:** Fix volume paths in docker-compose.yml
```yaml
# Correct volume mounting:
volumes:
  - ./apps/backend:/workspace/apps/backend
  - ./node_modules:/workspace/node_modules
  - ./apps/backend/node_modules:/workspace/apps/backend/node_modules

# Avoid using Docker named volumes for node_modules in development
```

#### 8. pnpm Workspace Dependency Resolution
**Problem:** Dependencies installed but not accessible in Docker containers
**Solution:** Ensure proper workspace structure and symlink preservation
```bash
# Always reinstall after major changes:
rm pnpm-lock.yaml
pnpm install

# Use proper Docker build context (project root, not app directory)
```

### Development Environment Issues Encountered

#### Version Compatibility Matrix
| Medusa Version | CLI Status | Stripe Provider | Recommendation |
|----------------|------------|-----------------|----------------|
| 2.8.0 | ✅ Working | ✅ Official provider | **Use this** |
| 2.8.1-2.8.3 | ❓ Untested | ✅ Official provider | Untested |
| 2.8.4 | ❌ CLI broken | ✅ Official provider | Avoid |
| 2.8.5 | ❌ CLI broken | ✅ Official provider | Avoid |

#### Docker Build Timeout Issues
**Problem:** Docker builds timing out during dependency installation
**Solution:** Increase Docker timeouts
```bash
export DOCKER_CLIENT_TIMEOUT=600
export COMPOSE_HTTP_TIMEOUT=600
docker-compose up -d --build
```

### Common Issues

#### 1. Database Connection Issues
**Problem:** SSL connection errors or missing tables
**Solution:**
```bash
# Check database connection
docker exec -it boughandburrow-postgres psql -U medusa -d boughandburrow_dev

# Run migrations
./scripts/docker-dev.sh setup

# Check environment variables
docker exec -it boughandburrow-backend env | grep DATABASE_URL
```

#### 2. Frontend Can't Connect to Backend
**Problem:** Frontend shows connection errors
**Solution:**
- Check `NEXT_PUBLIC_MEDUSA_BACKEND_URL` in frontend `.env.local`
- Ensure backend is running on port 9000
- Check Docker network connectivity

#### 3. Missing Dependencies
**Problem:** Module not found errors
**Solution:**
```bash
# Install dependencies
pnpm install

# Rebuild Docker containers
docker-compose down
docker-compose up --build
```

#### 4. Port Conflicts
**Problem:** Services won't start due to port conflicts
**Solution:**
```bash
# Check what's using the ports
lsof -i :8000
lsof -i :9000

# Stop conflicting services or change ports in docker-compose.yml
```

### Database Management

#### Reset Database (DESTROYS ALL DATA)
```bash
./scripts/docker-dev.sh reset
```

#### Backup Database
```bash
docker exec boughandburrow-postgres pg_dump -U medusa boughandburrow_dev > backup.sql
```

#### Restore Database
```bash
docker exec -i boughandburrow-postgres psql -U medusa boughandburrow_dev < backup.sql
```

## Development Workflow

### 1. Starting Development
```bash
# Start everything
./scripts/docker-dev.sh up

# Setup database (first time only)
./scripts/docker-dev.sh setup

# Check logs
./scripts/docker-dev.sh logs

# Seed database (if you need to reset)
This seeds all products, admin user, and the rest of the admin dashboard data.
./scripts/docker-dev.sh seed-bnb
```

### 2. Making Changes
- Frontend changes are hot-reloaded automatically
- Backend changes require restart: `docker-compose restart backend`
- Database changes require migrations: `./scripts/docker-dev.sh migrate`

### 3. Debugging
```bash
# View specific service logs
./scripts/docker-dev.sh logs backend
./scripts/docker-dev.sh logs frontend

# Connect to database
docker exec -it boughandburrow-postgres psql -U medusa -d boughandburrow_dev

# Access backend container
docker exec -it boughandburrow-backend sh
```

## Useful Links

### Documentation
- [Medusa Documentation](https://docs.medusajs.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Docker Documentation](https://docs.docker.com/)

### Tools & Services
- [Medusa Admin](http://localhost:7000) - Admin interface
- [Stripe Dashboard](https://dashboard.stripe.com/) - Payment processing
- [Resend Dashboard](https://resend.com/dashboard) - Email service

### Development Tools
- [PostgreSQL Client](https://www.postgresql.org/docs/current/app-psql.html)
- [Redis CLI](https://redis.io/docs/manual/cli/)
- [Docker Compose](https://docs.docker.com/compose/)

## Project Structure

```
website/
├── apps/
│   ├── backend/          # Medusa backend
│   │   ├── src/
│   │   ├── medusa-config.ts
│   │   └── package.json
│   └── frontend/         # Next.js frontend
│       ├── src/
│       ├── next.config.js
│       └── package.json
├── scripts/
│   └── docker-dev.sh     # Development helper script
├── docker-compose.yml    # Docker services configuration
└── package.json          # Workspace configuration
```

## Notes

- The frontend runs on port 8000 (not the default 3000)
- **Database Migration**: Project has been migrated from local Docker PostgreSQL to Neon Cloud database
  - Development uses Neon 'develop' branch
  - Production uses Neon 'main' branch
  - Connection requires `sslmode=require&channel_binding=require`
- All services are containerized for consistency (except database which is now cloud-hosted)
- Use `./scripts/docker-dev.sh` for common operations
- Check logs frequently when troubleshooting

## Stripe Integration

### Current Setup (Official Provider)
The project uses Medusa's built-in Stripe payment provider, configured in `apps/backend/medusa-config.ts`:

```typescript
{
  resolve: "@medusajs/medusa/payment-stripe",
  id: "stripe",
  options: {
    apiKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    capture: true,
  },
}
```

### Development Setup
1. Create a Stripe account at https://stripe.com
2. Get your test API keys from the Stripe Dashboard
3. Add the keys to your environment files:
   - Backend: `STRIPE_API_KEY` and `STRIPE_WEBHOOK_SECRET`
   - Frontend: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`

### Webhook Configuration
The official Stripe provider handles webhooks automatically. For local development:
- Webhook endpoint: `http://localhost:9000/webhooks/stripe` (handled by Medusa)
- Required events (configured in Stripe Dashboard):
  - `payment_intent.amount_capturable_updated`
  - `payment_intent.succeeded`
  - `payment_intent.payment_failed`
  - `payment_intent.partially_funded`

### Supported Payment Methods
The official provider supports:
- Credit/Debit Cards
- Apple Pay / Google Pay (with `automatic_payment_methods: true`)
- iDeal (Netherlands)
- Bancontact (Belgium)
- BLIK, giropay, Przelewy24, PromptPay

### Migration Notes
- **Previous Implementation**: Custom Stripe provider was removed due to API compatibility issues
- **Current Implementation**: Uses official `@medusajs/medusa/payment-stripe` provider
- **Benefits**: Better stability, automatic updates, official support

### Recent Improvements (2025-08-17)
The Stripe integration has been significantly enhanced with the following improvements:

#### ✅ Environment Variable Standardization
- Unified `STRIPE_SECRET_KEY` naming across all configuration files
- Updated documentation to match actual implementation
- Removed inconsistencies between backend and frontend configs

#### ✅ Enhanced Error Handling & Resilience
- **Graceful Degradation**: Payment failures no longer crash the entire checkout flow
- **User-Friendly Messages**: Clear, actionable error messages for users
- **Retry Mechanisms**: Automatic retry capabilities for transient failures
- **Loading States**: Proper loading indicators during payment initialization

#### ✅ React Best Practices & TypeScript
- **Error Boundaries**: `PaymentErrorBoundary` component prevents payment crashes
- **Type Safety**: Comprehensive TypeScript types in `/types/stripe.ts`
- **Custom Hooks**: `useStripePayment` hook for clean payment handling
- **Validation**: Proper validation for payment sessions and configurations

#### ✅ Next.js Performance Optimizations
- **Code Splitting**: Dynamic imports reduce initial bundle size
- **Lazy Loading**: Stripe components load only when needed
- **Caching**: Optimized Stripe instance caching with `stripe-loader.ts`
- **Preloading**: Smart preloading on checkout pages for better UX

#### ✅ Improved Webhook Handling
- **Removed @ts-ignore**: Proper TypeScript interfaces for webhook processing
- **Enhanced Logging**: Detailed webhook processing logs for debugging
- **Better Validation**: Comprehensive request validation and error responses
- **Error Codes**: Structured error responses with appropriate HTTP status codes

### Architecture Overview
```
Frontend Payment Flow:
├── PaymentWrapper (validation & routing)
├── DynamicStripeWrapper (lazy loading)
├── StripeWrapper (initialization & error handling)
├── PaymentErrorBoundary (crash prevention)
└── Elements (Stripe payment form)

Backend Webhook Flow:
├── /api/webhooks/stripe (validation)
├── PaymentModuleService (processing)
└── Order Creation (completion)
```

### Files Modified
- `apps/backend/medusa-config.ts` - Stripe provider configuration
- `apps/backend/.env.example` - Environment variable standardization
- `apps/frontend/.env.example` - Frontend environment consistency
- `apps/backend/src/api/webhooks/stripe/route.ts` - Enhanced webhook handling
- `apps/frontend/src/modules/checkout/components/payment-wrapper/` - Payment components
- `apps/frontend/src/types/stripe.ts` - TypeScript definitions
- `apps/frontend/src/hooks/useStripePayment.ts` - Payment processing hook
- `apps/frontend/src/lib/stripe/stripe-loader.ts` - Optimized Stripe loading

### Testing Guide
For manual testing of the improved Stripe integration, use these test cards:

#### Successful Payments
- **Visa**: `4242424242424242` (Any CVC, any future date)
- **Visa (debit)**: `4000056655665556`
- **Mastercard**: `5555555555554444`
- **American Express**: `378282246310005`

#### Error Scenarios
- **Generic decline**: `4000000000000002`
- **Insufficient funds**: `4000000000009995`
- **Lost card**: `4000000000009987`
- **Stolen card**: `4000000000009979`
- **Expired card**: `4000000000000069`
- **Processing error**: `4000000000000119`

#### Test Workflow
1. **Environment Setup**: Ensure test Stripe keys are configured
2. **Payment Flow**: Test complete checkout with various card types
3. **Error Handling**: Verify graceful error messages for failed cards
4. **Loading States**: Check loading indicators during payment processing
5. **Retry Functionality**: Test retry mechanisms for failed payments
6. **Mobile Testing**: Verify payment flow on mobile devices
7. **Network Issues**: Test behavior with slow/interrupted connections

## Contributing

1. Use the provided scripts for common operations
2. Document any new environment variables
3. Update this file when adding new services or changing ports
4. Test both Docker and local development workflows
