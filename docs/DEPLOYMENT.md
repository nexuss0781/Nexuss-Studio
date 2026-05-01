# Nexuss-Studio Deployment Guide

## Prerequisites

- PHP 7.4 or higher
- Web server (Apache/Nginx)
- Git
- Node.js (optional, for development)

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/nexuss0781/Nexuss-Studio.git
cd Nexuss-Studio
```

### 2. Set Permissions
```bash
chmod +x scripts/*.sh
chmod 755 projects history backups temp logs cache
```

### 3. Run Health Check
```bash
./scripts/health_check.sh
```

### 4. Start Development Server
```bash
php -S localhost:8000
```

### 5. Access Application
Open http://localhost:8000 in your browser

## Production Deployment

### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName nexuss-studio.example.com
    DocumentRoot /var/www/nexuss-studio
    
    <Directory /var/www/nexuss-studio>
        AllowOverride All
        Require all granted
    </Directory>
    
    ErrorLog ${APACHE_LOG_DIR}/nexuss-studio-error.log
    CustomLog ${APACHE_LOG_DIR}/nexuss-studio-access.log combined
</VirtualHost>
```

### Nginx Configuration

```nginx
server {
    listen 80;
    server_name nexuss-studio.example.com;
    root /var/www/nexuss-studio;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \.php$ {
        include snippets/fastcgi-php.conf;
        fastcgi_pass unix:/run/php/php7.4-fpm.sock;
    }

    location ~ /\.ht {
        deny all;
    }
}
```

### SSL Configuration (Let's Encrypt)

```bash
sudo certbot --apache -d nexuss-studio.example.com
# or
sudo certbot --nginx -d nexuss-studio.example.com
```

## Automated Deployment Script

```bash
#!/bin/bash
# deploy.sh

echo "Deploying Nexuss-Studio..."

# Pull latest changes
git pull origin main

# Run health check
./scripts/health_check.sh

# Create backup
./scripts/backup.sh

# Clear cache
php scripts/clear_cache.php

# Restart services
sudo systemctl restart php-fpm
sudo systemctl restart nginx

echo "Deployment completed!"
```

## Environment Variables

Create `.env` file for custom configurations:

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://nexuss-studio.example.com

# AI Model API Keys
PUTER_API_KEY=your_api_key_here

# Cache Settings
CACHE_TTL=3600
CACHE_MAX_SIZE=1000

# Security
RATE_LIMIT=100
CSRF_ENABLED=true
```

## Monitoring Setup

### Systemd Service

```ini
[Unit]
Description=Nexuss-Studio Monitor
After=network.target

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/nexuss-studio
ExecStart=/usr/bin/php -S localhost:8000
Restart=always

[Install]
WantedBy=multi-user.target
```

### Log Rotation

Create `/etc/logrotate.d/nexuss-studio`:

```
/var/www/nexuss-studio/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    notifempty
    create 0640 www-data www-data
}
```

## Troubleshooting

### Common Issues

1. **Permission Denied**
   ```bash
   chown -R www-data:www-data /var/www/nexuss-studio
   chmod -R 755 /var/www/nexuss-studio
   ```

2. **Cache Errors**
   ```bash
   rm -rf cache/*
   php scripts/clear_cache.php
   ```

3. **Database Connection**
   - Check directory permissions
   - Verify disk space

### Support

- Documentation: docs/
- Issues: https://github.com/nexuss0781/Nexuss-Studio/issues
- Email: nexuss0781@gmail.com

---
*Version: 1.0.0*
*Last Updated: 2024*
