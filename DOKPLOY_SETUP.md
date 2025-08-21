# Dokploy Configuration for GitHub Packages Deployment

## Overview
- **GitHub Actions**: Build images and push to GitHub Container Registry
- **Dokploy**: Pull images and deploy to your Application Server

## 1. Configure Dokploy Application

### Create a Docker Compose Application in Dokploy:

1. **Go to your Dokploy dashboard**
2. **Create new application** → **Docker Compose**
3. **Configuration**:
   - **Name**: `bough-burrow-prod`
   - **Server**: Select your Application Server (Hetzner VPS)
   - **Source**: Manual (no Git repository needed)
   - **Compose Content**: Copy the contents of `docker-compose.ghcr.yml`

### 2. Environment Variables in Dokploy

Add these environment variables in your Dokploy application:

```bash
# Registry path
REGISTRY=ghcr.io/luxumbra

# Database
POSTGRES_USER=medusa
POSTGRES_PASSWORD=your_secure_database_password
POSTGRES_DB=boughandburrow

# Redis
REDIS_PASSWORD=your_redis_password

# URLs (update with your actual domains)
NEXT_PUBLIC_BASE_URL=https://boughandburrow.com
NEXT_PUBLIC_MEDUSA_BACKEND_URL=https://api.boughandburrow.com
MEDUSA_BACKEND_URL=http://backend-server:9000

# CORS settings
STORE_CORS=https://boughandburrow.com
ADMIN_CORS=https://admin.boughandburrow.com
AUTH_CORS=https://admin.boughandburrow.com

# Security (generate secure random strings)
JWT_SECRET=your_jwt_secret_here
COOKIE_SECRET=your_cookie_secret_here
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_your_medusa_publishable_key

# Stripe
STRIPE_SECRET_KEY=sk_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_your_stripe_publishable_key

# Email
RESEND_API_KEY=your_resend_api_key
EMAIL_FROM=hello@boughandburrow.uk

# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=b3tpdz7f
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token

# Analytics (optional)
NEXT_PUBLIC_FATHOM_SITE_ID=your_fathom_site_id
```

## 3. GitHub Container Registry Access

### Make Packages Public (Recommended):
1. After first GitHub Actions build, go to your repository
2. Click "Packages" tab
3. For each package (backend, frontend, cms):
   - Click the package name
   - Go to "Package settings"
   - Change visibility to "Public"

### OR Configure Private Registry Access:
If keeping packages private, configure GitHub token in Dokploy:
1. Go to your application settings
2. Add registry authentication:
   - Registry: `ghcr.io`
   - Username: `luxumbra`
   - Password: Your GitHub Personal Access Token (with packages:read permission)

## 4. Domain Configuration

Configure these domains in Dokploy to point to your services:

### Frontend
- **Domain**: `boughandburrow.com` and `www.boughandburrow.com`
- **Service**: `frontend`
- **Port**: `8000`
- **SSL**: Enable automatic SSL

### Backend API
- **Domain**: `api.boughandburrow.com`
- **Service**: `backend-server`
- **Port**: `9000`
- **SSL**: Enable automatic SSL

### Admin Panel
- **Domain**: `admin.boughandburrow.com`
- **Service**: `backend-server`
- **Port**: `9000`
- **Path**: `/app`
- **SSL**: Enable automatic SSL

### CMS Studio
- **Domain**: `studio.boughandburrow.com`
- **Service**: `cms`
- **Port**: `3333`
- **SSL**: Enable automatic SSL

## 5. Deployment Workflow

### Manual Deployment:
1. GitHub Actions builds and pushes images
2. Go to Dokploy → Your Application → Deploy
3. Dokploy pulls latest images and restarts services

### Automatic Deployment (Optional):
1. **Get Dokploy Webhook URL**:
   - Go to your application in Dokploy
   - Find the webhook URL (usually `/api/webhooks/deploy/[app-id]`)

2. **Add to GitHub Secrets**:
   - Secret name: `DOKPLOY_WEBHOOK_URL`
   - Value: Your webhook URL

3. **GitHub Actions will automatically trigger Dokploy deployment** after successful build

## 6. First Deployment Steps

1. **Push your code** to trigger GitHub Actions build
2. **Make packages public** (see step 3 above)
3. **Deploy in Dokploy** (manually first time)
4. **Configure domains** (step 4 above)
5. **Test your application**

## 7. Database Migration

If you need to migrate data from your current setup:
1. **Backup current database** using your existing scripts
2. **Deploy new infrastructure** (without starting services)
3. **Import data** to new PostgreSQL instance
4. **Start services**

## Monitoring

- **Dokploy Dashboard**: Monitor deployment status and logs
- **GitHub Actions**: Monitor build status and image pushes
- **Docker logs**: Available through Dokploy interface

This setup gives you:
- ✅ Reliable image builds via GitHub Actions
- ✅ Easy deployment management via Dokploy
- ✅ Separation of build and deployment concerns
- ✅ Automatic deployments (optional)
- ✅ Rollback capabilities through Dokploy