# Production Deployment Guide - Dokploy Migration

This guide covers migrating Bough & Burrow from Railway/Vercel to self-hosted infrastructure using Dokploy.

## 📋 Pre-Migration Checklist

### 1. Backup Current Data
```bash
# Create a backup of the current Railway database
./scripts/docker-dev.sh backup
```

### 2. Prepare Environment Configuration
```bash
# Copy and customize the production environment template
cp .env.production.template .env.production

# Edit .env.production with your actual values:
# - Database credentials
# - Domain names  
# - API keys (Stripe, Resend, etc.)
# - Secure secrets (JWT, Cookie secrets)
```

### 3. Update Domains
Replace placeholder domains in `.env.production`:
- `yourdomain.com` → Your actual domain
- `api.yourdomain.com` → Your API subdomain

## 🚀 Dokploy Application Configuration

### 1. Backend Application (Medusa API + Admin)

**Application Settings:**
- **Name:** `bough-burrow-backend`
- **Type:** Docker Compose
- **Repository:** Your Git repository
- **Branch:** `main` or production branch
- **Build Path:** `./apps/backend/Dockerfile`
- **Port:** `9000`

**Environment Variables:**
Import from `.env.production` or set individually:
```
DATABASE_URL=postgresql://medusa:your_password@postgres:5432/boughandburrow
REDIS_URL=redis://:your_redis_password@redis:6379
NODE_ENV=production
JWT_SECRET=your_jwt_secret
COOKIE_SECRET=your_cookie_secret
MEDUSA_BACKEND_URL=https://api.yourdomain.com
STRIPE_SECRET_KEY=sk_live_...
RESEND_API_KEY=re_...
```

**Health Check:**
- **Path:** `/health`
- **Port:** `9000`
- **Initial Delay:** 60 seconds

### 2. Frontend Application (Next.js Storefront)

**Application Settings:**
- **Name:** `bough-burrow-frontend`
- **Type:** Docker Compose
- **Repository:** Your Git repository
- **Branch:** `main` or production branch
- **Build Path:** `./apps/frontend/Dockerfile`
- **Port:** `8000`

**Environment Variables:**
```
NODE_ENV=production
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.yourdomain.com
NEXT_PUBLIC_BASE_URL=https://yourdomain.com
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
NEXT_PUBLIC_SANITY_PROJECT_ID=b3tpdz7f
```

**Health Check:**
- **Path:** `/api/health`
- **Port:** `8000`
- **Initial Delay:** 30 seconds

### 3. Database (PostgreSQL)

**Application Settings:**
- **Name:** `bough-burrow-postgres`
- **Type:** Docker
- **Image:** `postgres:16-alpine`
- **Port:** `5432`

**Environment Variables:**
```
POSTGRES_USER=medusa
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=boughandburrow
```

**Volumes:**
- **Mount Path:** `/var/lib/postgresql/data`
- **Host Path:** `/var/dokploy/postgres-data`

### 4. Redis (Cache & Sessions)

**Application Settings:**
- **Name:** `bough-burrow-redis`
- **Type:** Docker
- **Image:** `redis:7-alpine`
- **Port:** `6379`

**Command:** `redis-server --appendonly yes --requirepass your_redis_password`

**Volumes:**
- **Mount Path:** `/data`
- **Host Path:** `/var/dokploy/redis-data`

## 🌐 Domain & SSL Configuration

### 1. Configure Domains in Dokploy

**Backend Domain:**
- **Domain:** `api.yourdomain.com`
- **Application:** `bough-burrow-backend`
- **Port:** `9000`
- **SSL:** Enable automatic SSL

**Frontend Domain:**
- **Domain:** `yourdomain.com` and `www.yourdomain.com`
- **Application:** `bough-burrow-frontend`
- **Port:** `8000`
- **SSL:** Enable automatic SSL

### 2. DNS Configuration
Update your DNS records to point to your Dokploy server:
```
A     yourdomain.com         → YOUR_SERVER_IP
A     www.yourdomain.com     → YOUR_SERVER_IP
A     api.yourdomain.com     → YOUR_SERVER_IP
```

## 📊 Database Migration Process

### 1. Deploy Infrastructure First
Deploy PostgreSQL and Redis containers in Dokploy before migrating data.

### 2. Migrate Database Data
```bash
# Export current Railway database (already done if you ran backup)
./scripts/docker-dev.sh backup

# Set up environment variables for migration
export RAILWAY_DATABASE_URL="your_current_railway_url"
export NEW_DATABASE_URL="postgresql://medusa:password@your_server_ip:5432/boughandburrow"

# Restore to new database
./scripts/docker-dev.sh restore backups/your_backup_file.dump
```

### 3. Verify Migration
```bash
# Connect to new database and verify data
psql "postgresql://medusa:password@your_server_ip:5432/boughandburrow"

# Check key tables
\dt
SELECT COUNT(*) FROM product;
SELECT COUNT(*) FROM "user";
```

## 🔄 Deployment Sequence

### Phase 1: Infrastructure Setup
1. Deploy PostgreSQL container
2. Deploy Redis container
3. Configure domains and SSL

### Phase 2: Database Migration
1. Create final backup of Railway database
2. Import data to new PostgreSQL instance
3. Verify data integrity

### Phase 3: Application Deployment
1. Deploy backend application
2. Run database migrations: `medusa db:migrate`
3. Deploy frontend application
4. Test end-to-end functionality

### Phase 4: DNS Cutover
1. Update DNS records
2. Monitor applications
3. Verify SSL certificates
4. Test customer journey

## 🔍 Testing Checklist

- [ ] **Backend Health:** `https://api.yourdomain.com/health`
- [ ] **Frontend Health:** `https://yourdomain.com/api/health`
- [ ] **Admin Access:** `https://api.yourdomain.com/app`
- [ ] **Database Connection:** Applications can connect to PostgreSQL
- [ ] **Redis Connection:** Sessions and caching work
- [ ] **Stripe Integration:** Payment processing works
- [ ] **Email Integration:** Resend emails work
- [ ] **Sanity CMS:** Content loads correctly
- [ ] **SSL Certificates:** All domains have valid SSL

## 🔧 Troubleshooting

### Common Issues

**Database Connection Errors:**
- Check `DATABASE_URL` format
- Verify PostgreSQL container is running
- Check firewall rules

**Redis Connection Errors:**
- Verify `REDIS_URL` format and password
- Check Redis container status

**Build Failures:**
- Check Dockerfile paths
- Verify all dependencies are in package.json
- Check build logs in Dokploy

**SSL Issues:**
- Verify DNS is pointing to correct server
- Check domain configuration in Dokploy
- Ensure ports 80 and 443 are open

## 📈 Monitoring & Maintenance

### Set Up Monitoring
- Configure health check alerts in Dokploy
- Set up database backup schedules
- Monitor disk space and resource usage

### Regular Maintenance
- Keep containers updated
- Monitor database performance
- Review and rotate secrets regularly
- Maintain backup retention policy

## 💰 Cost Comparison

**Before (Railway + Vercel):**
- Railway: €20/month
- Vercel: €20/month
- **Total: €40/month**

**After (Self-hosted on Hetzner):**
- Hetzner VPS: €11.51/month
- **Total: €11.51/month**
- **Savings: €28.49/month (71%)**