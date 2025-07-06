#!/bin/bash
# scripts/docker-dev.sh - Development environment management

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to start development environment
dev_up() {
    print_status "Starting Bough and Burrow development environment..."

    # Create env files if they don't exist
    if [ ! -f "apps/backend/.env" ]; then
        print_warning "Backend .env file not found. Creating from template..."
        create_backend_env
    fi

    if [ ! -f "apps/frontend/.env.local" ]; then
        print_warning "Frontend .env.local file not found. Creating from template..."
        create_frontend_env
    fi

    docker-compose up -d postgres redis
    print_status "Waiting for database to be ready..."
    sleep 10

    docker-compose up -d backend
    print_status "Waiting for backend to be ready..."
    sleep 15

    docker-compose up -d frontend

    print_status "Development environment is starting up!"
    print_status "Backend (Medusa): http://localhost:9000"
    print_status "Admin UI: http://localhost:7000"
    print_status "Frontend (Next.js): http://localhost:8000"
    print_status "PostgreSQL: localhost:5432"
    print_status "Redis: localhost:6379"
}

# Function to stop development environment
dev_down() {
    print_status "Stopping development environment..."
    docker-compose down
}

# Function to restart services
dev_restart() {
    print_status "Restarting development environment..."
    docker-compose restart
}

# Function to view logs
dev_logs() {
    if [ -z "$1" ]; then
        docker-compose logs -f
    else
        docker-compose logs -f "$1"
    fi
}

# Function to run database migrations
db_migrate() {
    print_status "Running database migrations..."
    docker-compose exec backend npx medusa db:migrate
}

# Function to seed database
db_seed() {
    print_status "Seeding database..."
    docker-compose exec backend npx medusa run seed
}

# Function to setup database (migrate + seed)
db_setup() {
    print_status "Setting up database (migrate + seed)..."
    docker-compose run --rm backend npx medusa db:migrate
    docker-compose run --rm backend npx medusa run seed
}

# Function to reset database
db_reset() {
    print_warning "This will destroy all data in the database. Are you sure? (y/N)"
    read -r response
    if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
        print_status "Resetting database..."
        docker-compose down
        docker volume rm website_postgres_data 2>/dev/null || true
        docker-compose up -d postgres
        sleep 10
        db_setup
    else
        print_status "Database reset cancelled."
    fi
}

# Function to create backend .env file
create_backend_env() {
    cat > apps/backend/.env << EOF
# Database (Docker will override this)
DATABASE_URL=postgresql://medusa:medusa@localhost:5432/boughandburrow_dev

# Medusa Core
NODE_ENV=development
MEDUSA_ADMIN_ONBOARDING_TYPE=nextjs
MEDUSA_ADMIN_ONBOARDING_NEXTJS_DIRECTORY=../frontend
MEDUSA_ADMIN_BACKEND_URL=http://localhost:9000

# Secrets (IMPORTANT: Generate new ones for production!)
JWT_SECRET=$(openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")
COOKIE_SECRET=$(openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

# Redis (Docker will override this)
REDIS_URL=redis://localhost:6379

# Stripe (add your actual keys)
STRIPE_API_KEY=sk_test_your_stripe_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Resend for emails (add your actual key)
RESEND_API_KEY=re_your_resend_key_here
EMAIL_FROM=hello@boughandburrow.com

# Etsy API (for when we set it up)
ETSY_CLIENT_ID=your_etsy_client_id
ETSY_CLIENT_SECRET=your_etsy_client_secret
EOF
    print_status "Created apps/backend/.env with secure random secrets"
    print_warning "Please update the API keys in apps/backend/.env"
}

# Function to create frontend .env file
create_frontend_env() {
    cat > apps/frontend/.env.local << EOF
# Medusa (Docker will override backend URL)
NEXT_PUBLIC_MEDUSA_BACKEND_URL=http://localhost:9000
NEXT_PUBLIC_BASE_URL=http://localhost:8000

# Medusa Publishable Key (will be created after backend setup)
NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=pk_01DUMMY_KEY_REPLACE_AFTER_SETUP

# Environment
NODE_ENV=development

# Stripe (add your actual publishable key)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_your_stripe_publishable_key_here

# Fathom Analytics (add your actual site ID)
NEXT_PUBLIC_FATHOM_SITE_ID=your_fathom_site_id

# Etsy (for frontend auth flow)
NEXT_PUBLIC_ETSY_CLIENT_ID=your_etsy_client_id
EOF
    print_status "Created apps/frontend/.env.local"
    print_warning "Please update the API keys in apps/frontend/.env.local"
    print_warning "The MEDUSA_PUBLISHABLE_KEY is a dummy - will be replaced after backend setup"
}

# Function to clean up Docker resources
cleanup() {
    print_status "Cleaning up Docker resources..."
    docker-compose down -v
    docker system prune -f
    print_status "Cleanup complete"
}

# Main command handler
case "$1" in
    up)
        dev_up
        ;;
    down)
        dev_down
        ;;
    restart)
        dev_restart
        ;;
    logs)
        dev_logs "$2"
        ;;
            migrate)
        db_migrate
        ;;
    seed)
        db_seed
        ;;
    setup)
        db_setup
        ;;
    reset)
        db_reset
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Bough and Burrow Development Environment"
        echo ""
        echo "Usage: $0 {up|down|restart|logs|migrate|seed|setup|reset|cleanup}"
        echo ""
        echo "Commands:"
        echo "  up       - Start the development environment"
        echo "  down     - Stop the development environment"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs (optionally specify service)"
        echo "  migrate  - Run database migrations"
        echo "  seed     - Seed the database with sample data"
        echo "  setup    - Setup database (migrate + seed)"
        echo "  reset    - Reset database (WARNING: destroys all data)"
        echo "  cleanup  - Clean up Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 up"
        echo "  $0 logs backend"
        echo "  $0 logs frontend"
        exit 1
        ;;
esac
