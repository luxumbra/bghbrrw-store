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
    print_status "Admin UI: http://localhost:9000/app"
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
    if [ -f "apps/backend/src/scripts/seed.ts" ]; then
        docker-compose exec backend npx medusa exec ./src/scripts/seed.ts
    else
        print_warning "No seed script found at apps/backend/src/scripts/seed.ts"
        print_status "You can create a seed script or manually add data through the admin interface"
    fi
}

# Function to seed Bough & Burrow store
db_seed_bnb() {
    print_status "Seeding Bough & Burrow store..."
    if [ -f "apps/backend/src/scripts/seed-bough-and-burrow.ts" ]; then
        docker-compose exec backend npx medusa exec ./src/scripts/seed-bough-and-burrow.ts
    else
        print_warning "No Bough & Burrow seed script found"
        print_status "You can create a seed script or manually add data through the admin interface"
    fi
}

# Function to setup database (migrate + seed)
db_setup() {
    print_status "Setting up database (migrate + seed)..."
    docker-compose run --rm backend npx medusa db:migrate

    # Ensure backend container is running before seeding
    print_status "Starting backend container for seeding..."
    docker-compose up -d backend
    sleep 10  # Wait for backend to be ready

    docker-compose exec backend npx medusa exec ./src/scripts/seed-bough-and-burrow.ts
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

# Function to generate secure secrets
generate_secrets() {
    print_status "Generating secure secrets..."

    # Generate JWT secret (64 bytes = 512 bits)
    JWT_SECRET=$(openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    # Generate cookie secret (64 bytes = 512 bits)
    COOKIE_SECRET=$(openssl rand -hex 64 2>/dev/null || node -e "console.log(require('crypto').randomBytes(64).toString('hex'))")

    # Generate database password (32 bytes = 256 bits)
    DB_PASSWORD=$(openssl rand -base64 32 2>/dev/null || node -e "console.log(require('crypto').randomBytes(32).toString('base64'))")

    # Generate Redis password (24 bytes = 192 bits)
    REDIS_PASSWORD=$(openssl rand -base64 24 2>/dev/null || node -e "console.log(require('crypto').randomBytes(24).toString('base64'))")

    print_status "Generated secrets:"
    echo "JWT_SECRET: ${JWT_SECRET:0:16}..." # Show first 16 chars
    echo "COOKIE_SECRET: ${COOKIE_SECRET:0:16}..."
    echo "DB_PASSWORD: ${DB_PASSWORD:0:16}..."
    echo "REDIS_PASSWORD: ${REDIS_PASSWORD:0:16}..."

    # Save to a temporary file for reference
    cat > .secrets.tmp << EOF
# Generated on $(date)
# IMPORTANT: Keep these secure and don't commit to version control
JWT_SECRET=$JWT_SECRET
COOKIE_SECRET=$COOKIE_SECRET
DB_PASSWORD=$DB_PASSWORD
REDIS_PASSWORD=$REDIS_PASSWORD
EOF

    print_status "Secrets saved to .secrets.tmp (for reference only)"
    print_warning "Delete .secrets.tmp after copying to your .env files"
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

# Function to create a user
create_user() {
    if [ -z "$1" ] || [ -z "$2" ]; then
        print_error "Usage: $0 user <email> <password>"
        print_error "Example: $0 user hello@boughandburrow.uk theburrow"
        exit 1
    fi

    local email="$1"
    local password="$2"

    print_status "Creating user with email: $email"
    docker-compose exec backend npx medusa user --email "$email" --password "$password"

    if [ $? -eq 0 ]; then
        print_status "User created successfully!"
        print_status "You can now login to the admin at http://localhost:7000"
        print_status "Email: $email"
        print_status "Password: $password"
    else
        print_error "Failed to create user. Check the logs above for details."
    fi
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
    seed-bnb)
        db_seed_bnb
        ;;
    setup)
        db_setup
        ;;
    reset)
        db_reset
        ;;
    user)
        create_user "$2" "$3"
        ;;
    secrets)
        generate_secrets
        ;;
    cleanup)
        cleanup
        ;;
    *)
        echo "Bough and Burrow Development Environment"
        echo ""
        echo "Usage: $0 {up|down|restart|logs|migrate|seed|setup|reset|user|cleanup}"
        echo ""
        echo "Commands:"
        echo "  up       - Start the development environment"
        echo "  down     - Stop the development environment"
        echo "  restart  - Restart all services"
        echo "  logs     - View logs (optionally specify service)"
        echo "  migrate  - Run database migrations"
        echo "  seed     - Seed the database with sample data"
        echo "  seed-bnb - Seed the database with Bough & Burrow store data"
        echo "  setup    - Setup database (migrate + seed)"
        echo "  reset    - Reset database (WARNING: destroys all data)"
        echo "  user     - Create a user (email password)"
        echo "  secrets  - Generate secure secrets"
        echo "  cleanup  - Clean up Docker resources"
        echo ""
        echo "Examples:"
        echo "  $0 up"
        echo "  $0 logs backend"
        echo "  $0 logs frontend"
        echo "  $0 user hello@boughandburrow.uk theburrow"
        exit 1
        ;;
esac
