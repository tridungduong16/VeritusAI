# Fly.io Commands Quick Reference

## 🚀 Essential Commands for Digital Co-worker Agent

### Initial Setup
```bash
# Install Fly.io CLI
curl -L https://fly.io/install.sh | sh

# Login to Fly.io
fly auth login

# Initialize app (first time only)
fly launch --no-deploy
```

### Deployment
```bash
# Quick deployment using script
./deploy.sh

# Manual deployment
fly deploy

# Deploy without cache
fly deploy --no-cache

# Deploy with verbose output
fly deploy --verbose
```

### Environment Variables & Secrets
```bash
# List all secrets
fly secrets list

# Set individual secret
fly secrets set SECRET_NAME="value"

# Set multiple secrets from .env
fly secrets import < .env

# Remove a secret
fly secrets unset SECRET_NAME

# Set secrets for specific app
fly secrets set -a digital-co-worker SECRET_NAME="value"
```

### Monitoring & Debugging
```bash
# View real-time logs
fly logs

# View logs for specific app
fly logs -a digital-co-worker

# Follow logs (like tail -f)
fly logs --follow

# SSH into running machine
fly ssh console

# Execute command in running machine
fly ssh console --command "ls -la"

# Check app status
fly status

# Check detailed app info
fly info

# List all machines
fly machine list
```

### Scaling & Performance
```bash
# Scale number of instances
fly scale count 2

# Scale memory
fly scale memory 2048

# Scale to specific VM size
fly scale vm shared-cpu-2x

# Scale to performance VM
fly scale vm performance-2x

# Auto-scale configuration
fly autoscale set min=1 max=3
```

### App Management
```bash
# List all your apps
fly apps list

# Restart the app
fly restart

# Stop the app
fly apps suspend digital-co-worker

# Resume the app
fly apps resume digital-co-worker

# Destroy the app (careful!)
fly apps destroy digital-co-worker
```

### Configuration
```bash
# Validate fly.toml
fly config validate

# Show current config
fly config show

# Edit fly.toml
fly config save
```

### Volumes (if needed)
```bash
# List volumes
fly volumes list

# Create volume
fly volumes create data --size 10

# Destroy volume
fly volumes destroy vol_xyz123
```

### Networking
```bash
# List IP addresses
fly ips list

# Allocate IPv4 address
fly ips allocate-v4

# Allocate IPv6 address
fly ips allocate-v6

# Release IP address
fly ips release <ip-address>
```

### Database & Extensions
```bash
# List available extensions
fly extensions list

# Create PostgreSQL database
fly postgres create

# Connect to PostgreSQL
fly postgres connect

# Create Redis instance
fly redis create
```

### Health Checks
```bash
# List health checks
fly checks list

# View specific check details
fly checks show <check-id>
```

### Certificates (HTTPS)
```bash
# List certificates
fly certs list

# Add custom domain certificate
fly certs create example.com

# Check certificate status
fly certs check example.com
```

### Backup & Recovery
```bash
# Create app backup
fly apps backup create

# List backups
fly apps backup list

# Restore from backup
fly apps backup restore <backup-id>
```

## 🔧 Troubleshooting Commands

### When Deployment Fails
```bash
fly logs
fly status
fly machine list
fly deploy --verbose
```

### When App is Not Responding
```bash
fly status
fly restart
fly ssh console
fly logs --follow
```

### When Memory Issues Occur
```bash
fly scale memory 4096
fly machine list
fly ssh console --command "free -h"
```

### When Need to Debug
```bash
fly ssh console
fly logs --follow
fly status --all
fly machine restart <machine-id>
```

## 📊 Monitoring Commands

### Performance Monitoring
```bash
# Check resource usage
fly status --all

# View metrics
fly machine list

# SSH and check processes
fly ssh console --command "top"

# Check disk usage
fly ssh console --command "df -h"
```

### Log Analysis
```bash
# Filter logs by level
fly logs --level error

# Search logs
fly logs | grep "ERROR"

# Export logs
fly logs > app_logs.txt
```

## 🚨 Emergency Commands

### Quick Fixes
```bash
# Restart immediately
fly restart

# Scale down to save costs
fly scale count 0

# Scale back up
fly scale count 1

# Emergency stop
fly apps suspend digital-co-worker
```

### Recovery
```bash
# Redeploy last working version
fly deploy

# Check what went wrong
fly logs --follow
fly status
fly machine list
```

## 💡 Pro Tips

1. **Use the deployment script**: `./deploy.sh` for automated deployment
2. **Monitor logs during deployment**: `fly logs --follow` in another terminal
3. **Set up aliases** in your shell:
   ```bash
   alias flog='fly logs --follow'
   alias fstat='fly status'
   alias fdeploy='fly deploy'
   ```
4. **Use staging environment**: Create a separate app for testing
5. **Regular backups**: Set up automated backups for production

## 📱 Mobile Commands (if using Fly.io mobile app)
- View app status
- Check logs
- Restart apps
- Monitor performance

---

**Remember**: Always test in a staging environment before deploying to production!

For more detailed information, visit: https://fly.io/docs/
