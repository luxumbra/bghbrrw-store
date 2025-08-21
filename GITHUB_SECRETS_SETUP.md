# GitHub Secrets Setup for Bough & Burrow CI/CD

## Required GitHub Repository Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add the following secrets:

### Optional Webhook (for automatic deployment)
- `DOKPLOY_WEBHOOK_URL` - Dokploy webhook URL to trigger deployments (optional)

### Notes:
- `GITHUB_TOKEN` is automatically provided by GitHub Actions
- The workflow will use your GitHub username (`luxumbra`) as the registry owner
- No SSH keys needed since Dokploy handles deployment

## Server Setup (.env file)

Create this file on your Dokploy server at `~/bough-burrow/.env`:

```bash
# Registry path (automatically set by CI/CD)
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

# CORS settings (update with your actual domains)
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

## SSH Key Setup

1. Generate an SSH key pair on your local machine (if you don't have one):
   ```bash
   ssh-keygen -t rsa -b 4096 -f ~/.ssh/dokploy_deploy_key
   ```

2. Copy the public key to your Dokploy server:
   ```bash
   ssh-copy-id -i ~/.ssh/dokploy_deploy_key.pub user@your-server-ip
   ```

3. Add the **private key** content to GitHub Secrets as `DOKPLOY_SSH_KEY`
   ```bash
   cat ~/.ssh/dokploy_deploy_key
   ```

## Testing the Setup

1. Push changes to the `feat/BOU-35-migrate-infra-to-dokploy` branch to test builds
2. Push to `main` branch to trigger both build and deployment
3. Use the "Actions" tab in GitHub to monitor workflow progress

## Domain Configuration in Dokploy

After successful deployment, configure these domains in Dokploy:

- **Frontend**: `boughandburrow.com` → `frontend` service, port `8000`
- **Admin**: `admin.boughandburrow.com` → `backend-server` service, port `9000`
- **API**: `api.boughandburrow.com` → `backend-server` service, port `9000`
- **CMS**: `studio.boughandburrow.com` → `cms` service, port `3333`

## Package Visibility

After the first build, you'll need to make your GitHub packages public:
1. Go to your repository → Packages
2. Select each package (backend, frontend, cms)
3. Change visibility to public

Or set up package authentication on your server if keeping them private.