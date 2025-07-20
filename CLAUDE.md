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
- `reset` - Reset database (WARNING: destroys all data)
- `cleanup` - Clean up Docker resources

### Local Development Commands
- `pnpm install` - Install all dependencies
- `pnpm --filter @boughandburrow/backend dev` - Start backend
- `pnpm --filter @boughandburrow/frontend dev` - Start frontend

## Services & Ports

| Service   | URL                    | Port | Description           |
|-----------|------------------------|------|----------------------|
| Frontend  | http://localhost:8000      | 8000 | Next.js application  |
| Backend   | http://localhost:9000      | 9000 | Medusa API           |
| Admin UI  | http://localhost:9000/app  | 9000 | Medusa Admin         |
| Postgres  | localhost:5432             | 5432 | Database             |
| Redis     | localhost:6379             | 6379 | Cache/Sessions       |

## Environment Variables

### Backend (apps/backend/.env)
```bash
# Database
DATABASE_URL=postgresql://medusa:medusa@postgres:5432/boughandburrow_dev

# Medusa Core
NODE_ENV=development
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret

# Redis
REDIS_URL=redis://redis:6379

# External Services
STRIPE_API_KEY=your_stripe_key
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
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_key
```

## Troubleshooting

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
- Prod database uses `sslmode=prefer`or`sslmode=require`. Dev should not include `sslmode` at all - using with `disable` broke the connection.
- All services are containerized for consistency
- Use `./scripts/docker-dev.sh` for common operations
- Check logs frequently when troubleshooting

## Contributing

1. Use the provided scripts for common operations
2. Document any new environment variables
3. Update this file when adding new services or changing ports
4. Test both Docker and local development workflows
