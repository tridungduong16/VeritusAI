#!/bin/bash

# Digital Co-worker Agent - Fly.io Deployment Script
# This script automates the deployment process to Fly.io

set -e  # Exit on any error

echo "🚀 Digital Co-worker Agent - Fly.io Deployment Script"
echo "=================================================="

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

# Check if fly CLI is installed
check_fly_cli() {
    print_status "Checking if Fly.io CLI is installed..."
    if ! command -v fly &> /dev/null; then
        print_error "Fly.io CLI is not installed!"
        echo "Please install it using:"
        echo "curl -L https://fly.io/install.sh | sh"
        exit 1
    fi
    print_success "Fly.io CLI is installed"
}

# Check if user is authenticated
check_auth() {
    print_status "Checking Fly.io authentication..."
    if ! fly auth whoami &> /dev/null; then
        print_error "Not authenticated with Fly.io!"
        echo "Please run: fly auth login"
        exit 1
    fi
    print_success "Authenticated with Fly.io"
}

# Check if .env file exists
check_env_file() {
    print_status "Checking for .env file..."
    if [ ! -f ".env" ]; then
        print_warning ".env file not found!"
        echo "Please create a .env file with your environment variables"
        echo "See README.md for required variables"
        exit 1
    fi
    print_success ".env file found"
}

# Set secrets from .env file
set_secrets() {
    print_status "Setting environment variables as Fly.io secrets..."
    
    # Read .env file and set secrets
    while IFS= read -r line || [ -n "$line" ]; do
        # Skip empty lines and comments
        if [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]]; then
            continue
        fi
        
        # Extract key and value
        if [[ "$line" =~ ^[[:space:]]*([^=]+)=(.*)$ ]]; then
            key="${BASH_REMATCH[1]}"
            value="${BASH_REMATCH[2]}"
            
            # Remove quotes if present
            value=$(echo "$value" | sed 's/^["'\'']\|["'\'']$//g')
            
            print_status "Setting secret: $key"
            fly secrets set "$key=$value" --stage
        fi
    done < .env
    
    print_success "All secrets set successfully"
}

# Deploy the application
deploy_app() {
    print_status "Deploying application to Fly.io..."
    fly deploy
    print_success "Deployment completed!"
}

# Check deployment status
check_status() {
    print_status "Checking deployment status..."
    fly status
    print_success "Status check completed"
}

# Open the deployed application
open_app() {
    print_status "Opening deployed application..."
    fly open
}

# Main deployment process
main() {
    echo "Starting deployment process..."
    echo
    
    check_fly_cli
    check_auth
    check_env_file
    
    echo
    read -p "Do you want to set/update secrets from .env file? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        set_secrets
    fi
    
    echo
    read -p "Do you want to deploy the application? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_app
        check_status
        
        echo
        read -p "Do you want to open the deployed application? (y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            open_app
        fi
    fi
    
    echo
    print_success "Deployment script completed!"
    echo
    echo "Useful commands:"
    echo "  fly logs          - View application logs"
    echo "  fly status        - Check application status"
    echo "  fly restart       - Restart the application"
    echo "  fly ssh console   - SSH into the application"
    echo
}

# Run main function
main "$@"
