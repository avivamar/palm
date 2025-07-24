#!/bin/bash

# Install Git hooks for Rolitt project
# This script sets up the pre-push hook for automated validation

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

# Get the project root directory
PROJECT_ROOT="$(git rev-parse --show-toplevel 2>/dev/null)" || {
    print_error "This script must be run from within a Git repository"
    exit 1
}

# Define paths
HOOKS_DIR="$PROJECT_ROOT/.git/hooks"
PRE_PUSH_HOOK="$HOOKS_DIR/pre-push"
VALIDATION_SCRIPT="$PROJECT_ROOT/scripts/pre-push-validation.sh"

print_status "Installing Git hooks for Rolitt project..."
print_status "Project root: $PROJECT_ROOT"

# Check if validation script exists
if [ ! -f "$VALIDATION_SCRIPT" ]; then
    print_error "Pre-push validation script not found at: $VALIDATION_SCRIPT"
    print_error "Please ensure the validation script exists first"
    exit 1
fi

# Make sure validation script is executable
if [ ! -x "$VALIDATION_SCRIPT" ]; then
    print_status "Making validation script executable..."
    chmod +x "$VALIDATION_SCRIPT"
fi

# Check if hooks directory exists
if [ ! -d "$HOOKS_DIR" ]; then
    print_error "Git hooks directory not found: $HOOKS_DIR"
    print_error "Are you sure this is a Git repository?"
    exit 1
fi

# Backup existing pre-push hook if it exists
if [ -f "$PRE_PUSH_HOOK" ]; then
    BACKUP_FILE="$PRE_PUSH_HOOK.backup.$(date +%Y%m%d_%H%M%S)"
    print_warning "Existing pre-push hook found"
    print_status "Creating backup: $BACKUP_FILE"
    cp "$PRE_PUSH_HOOK" "$BACKUP_FILE"
fi

# Create the pre-push hook
print_status "Creating pre-push hook..."
cat > "$PRE_PUSH_HOOK" << 'EOF'
#!/bin/bash

# Git pre-push hook for Rolitt project
# This hook runs the pre-push validation script before allowing a push

echo "🔍 Running pre-push validation..."
echo ""

# Get the project root directory (where .git is located)
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# Check if the validation script exists
VALIDATION_SCRIPT="$PROJECT_ROOT/scripts/pre-push-validation.sh"

if [ ! -f "$VALIDATION_SCRIPT" ]; then
    echo "❌ Pre-push validation script not found at: $VALIDATION_SCRIPT"
    echo "Please ensure the script exists and is executable."
    exit 1
fi

# Make sure the script is executable
if [ ! -x "$VALIDATION_SCRIPT" ]; then
    echo "⚠️  Making validation script executable..."
    chmod +x "$VALIDATION_SCRIPT"
fi

# Change to project root directory
cd "$PROJECT_ROOT" || {
    echo "❌ Failed to change to project root directory: $PROJECT_ROOT"
    exit 1
}

# Run the validation script
if "$VALIDATION_SCRIPT"; then
    echo ""
    echo "✅ Pre-push validation passed! Proceeding with push..."
    exit 0
else
    echo ""
    echo "❌ Pre-push validation failed! Push aborted."
    echo "Please fix the issues and try again."
    echo ""
    echo "To bypass this check (not recommended), use:"
    echo "  git push --no-verify"
    exit 1
fi
EOF

# Make the hook executable
chmod +x "$PRE_PUSH_HOOK"

print_success "Pre-push hook installed successfully!"
print_status "Hook location: $PRE_PUSH_HOOK"

# Test the hook
print_status "Testing the hook installation..."
if [ -x "$PRE_PUSH_HOOK" ]; then
    print_success "Hook is executable"
else
    print_error "Hook is not executable"
    exit 1
fi

# Display usage information
echo ""
print_success "🎉 Git hooks installation completed!"
echo ""
print_status "What happens now:"
echo "  • Every time you run 'git push', the pre-push validation will run automatically"
echo "  • The validation includes linting, type checking, tests, and build verification"
echo "  • If validation fails, the push will be aborted"
echo ""
print_status "To bypass validation (not recommended):"
echo "  git push --no-verify"
echo ""
print_status "To uninstall the hook:"
echo "  rm $PRE_PUSH_HOOK"
echo ""
print_status "To test the validation manually:"
echo "  ./scripts/pre-push-validation.sh"
echo ""