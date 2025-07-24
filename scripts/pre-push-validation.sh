#!/bin/bash

# Pre-push validation script for Rolitt project
# This script validates all builds before pushing to ensure deployment success

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Main validation function
main() {
    print_status "Starting pre-push validation for Rolitt project..."
    
    # Check if we're in the right directory
    if [ ! -f "package.json" ] || [ ! -f "next.config.ts" ]; then
        print_error "This script must be run from the project root directory"
        exit 1
    fi
    
    # Check required tools
    print_status "Checking required tools..."
    
    if ! command_exists "npm"; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command_exists "npx"; then
        print_error "npx is not installed"
        exit 1
    fi
    
    print_success "All required tools are available"
    
    # Install dependencies if needed
    print_status "Checking dependencies..."
    if [ ! -d "node_modules" ] || [ "package-lock.json" -nt "node_modules" ]; then
        print_status "Installing dependencies..."
        npm ci
    fi
    print_success "Dependencies are up to date"
    
    # Run linting
    print_status "Running ESLint..."
    if npm run lint; then
        print_success "ESLint passed"
    else
        print_error "ESLint failed"
        exit 1
    fi
    
    # Run type checking
    print_status "Running TypeScript type checking..."
    if npx tsc --noEmit; then
        print_success "TypeScript type checking passed"
    else
        print_error "TypeScript type checking failed"
        exit 1
    fi
    
    # Run tests
    print_status "Running tests..."
    if npm run test; then
        print_success "Tests passed"
    else
        print_error "Tests failed"
        exit 1
    fi
    
    # Standard Next.js build validation
    print_status "Running standard Next.js build..."
    if npm run build; then
        print_success "Standard Next.js build successful"
    else
        print_error "Standard Next.js build failed"
        exit 1
    fi
    
    # Cloudflare Workers build validation
    print_status "Running Cloudflare Workers build validation..."
    if npx opennextjs-cloudflare build; then
        print_success "Cloudflare Workers build successful"
    else
        print_error "Cloudflare Workers build failed"
        exit 1
    fi
    
    # Verify generated files
    print_status "Verifying generated files..."
    
    if [ ! -f ".next/BUILD_ID" ]; then
        print_error "Standard Next.js build files not found"
        exit 1
    fi
    
    if [ ! -f ".open-next/worker.js" ]; then
        print_error "Cloudflare Workers build files not found"
        exit 1
    fi
    
    print_success "All generated files verified"
    
    # Check wrangler.toml configuration
    print_status "Validating wrangler.toml configuration..."
    
    if [ ! -f "wrangler.toml" ]; then
        print_error "wrangler.toml not found"
        exit 1
    fi
    
    # Check if main entry point exists
    MAIN_ENTRY=$(grep "^main" wrangler.toml | cut -d'"' -f2)
    if [ ! -f "$MAIN_ENTRY" ]; then
        print_error "Main entry point $MAIN_ENTRY specified in wrangler.toml does not exist"
        exit 1
    fi
    
    print_success "wrangler.toml configuration is valid"
    
    # Optional: Test Cloudflare Workers locally (if wrangler is available)
    if command_exists "wrangler"; then
        print_status "Testing Cloudflare Workers locally (optional)..."
        
        # Start local preview in background
        timeout 30s wrangler pages dev .open-next/ --port 8788 > /dev/null 2>&1 &
        WRANGLER_PID=$!
        
        # Wait a bit for server to start
        sleep 5
        
        # Test if server is responding
        if curl -s -o /dev/null -w "%{http_code}" http://localhost:8788 | grep -q "200\|301\|302"; then
            print_success "Cloudflare Workers local test passed"
        else
            print_warning "Cloudflare Workers local test failed (this might be normal)"
        fi
        
        # Clean up
        kill $WRANGLER_PID 2>/dev/null || true
        wait $WRANGLER_PID 2>/dev/null || true
    else
        print_warning "Wrangler not found, skipping local Cloudflare Workers test"
    fi
    
    # Check for common deployment issues
    print_status "Checking for common deployment issues..."
    
    # Check for large files that might cause deployment issues
    LARGE_FILES=$(find .next .open-next -type f -size +25M 2>/dev/null || true)
    if [ -n "$LARGE_FILES" ]; then
        print_warning "Found large files that might cause deployment issues:"
        echo "$LARGE_FILES"
    fi
    
    # Check for Node.js version compatibility
    NODE_VERSION=$(node --version | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        print_warning "Node.js version $NODE_VERSION detected. Cloudflare Workers requires Node.js 18+"
    fi
    
    print_success "Common deployment issues check completed"
    
    # Final summary
    echo ""
    print_success "🎉 All pre-push validations passed!"
    print_status "Your code is ready for deployment to both Vercel and Cloudflare Workers"
    echo ""
    print_status "Next steps:"
    echo "  1. git add ."
    echo "  2. git commit -m 'your commit message'"
    echo "  3. git push"
    echo ""
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."
    # Kill any background processes
    jobs -p | xargs -r kill 2>/dev/null || true
}

# Set trap for cleanup
trap cleanup EXIT

# Run main function
main "$@"