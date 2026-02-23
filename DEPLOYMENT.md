# Deployment Guide - Jost Business to Contabo

## Prerequisites

- SSH access to Contabo server (167.86.87.165)
- Ubuntu 20.04 LTS running on server
- Domain `jost.business` pointing to server IP in GoDaddy DNS
- Git installed on local machine
- Docker and Docker Compose installed on Contabo server

## Step 1: Prepare Contabo Server

### SSH into your server
```bash
ssh root@167.86.87.165
```

### Update system
```bash
apt-get update && apt-get upgrade -y
```

### Install Docker

**For Ubuntu 22.04+ (recommended):**
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

**For Ubuntu 20.04 (EOL - manual installation):**
```bash
# Install prerequisites
apt-get install -y ca-certificates curl gnupg lsb-release

# Add Docker's official GPG key
mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up the stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
```

**Verify Docker installation:**
```bash
if ! command -v docker &> /dev/null; then
    echo "Docker installation failed. Check logs above."
    exit 1
fi

# Add root to docker group (no sudo needed, already root)
usermod -aG docker root

# Test Docker
docker run hello-world
```

### Install Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
docker-compose --version
```

### Install Certbot for SSL/HTTPS
```bash
sudo apt-get install -y certbot python3-certbot-nginx
```

### Install Git
```bash
sudo apt-get install -y git
```

## Step 2: Clone Your Repository to Server

```bash
mkdir -p /home/projects
cd /home/projects
git clone https://github.com/jost-business/jost-business.git jost-business
cd jost-business
```

## Step 3: Set Up SSL Certificates

### Generate self-signed certificate (for testing)
```bash
mkdir -p /home/projects/jost-business/certs
cd /home/projects/jost-business/certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem \
  -subj "/C=US/ST=State/L=City/O=Organization/CN=jost.business"
```

### Or use Let's Encrypt (recommended for production)
```bash
sudo certbot certonly --standalone -d jost.business
sudo cp /etc/letsencrypt/live/jost.business/fullchain.pem /home/projects/jost-business/certs/cert.pem
sudo cp /etc/letsencrypt/live/jost.business/privkey.pem /home/projects/jost-business/certs/key.pem
sudo chown root:root /home/projects/jost-business/certs/*
sudo chmod 644 /home/projects/jost-business/certs/*
```

## Step 4: Verify DNS Configuration

```bash
nslookup jost.business
```

Should resolve to your server IP: 167.86.87.165

## Step 5: Build and Run Docker Containers

```bash
cd /home/projects/jost-business

# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# Verify containers are running
docker-compose ps

# View logs
docker-compose logs -f
```

## Step 6: Access Your Application

- **Browser:** Open `http://jost.business` (or `https://jost.business`)
- **Shell app:** `http://jost.business/`
- **Finance app:** `http://jost.business/finance/`
- **About Me app:** `http://jost.business/about-me/`
- **Playground app:** `http://jost.business/playground/`

## Useful Docker Compose Commands

```bash
# View logs
docker-compose logs -f shell
docker-compose logs -f finance
docker-compose logs -f nginx

# Stop all services
docker-compose stop

# Start all services
docker-compose start

# Rebuild specific service
docker-compose build shell
docker-compose up -d shell

# Remove all containers
docker-compose down

# Remove volumes (data) as well
docker-compose down -v
```

## SSL Certificate Auto-Renewal (Let's Encrypt)

Create a cron job to renew certificates automatically:

```bash
sudo crontab -e

# Add this line:
0 2 * * * certbot renew --quiet && cp /etc/letsencrypt/live/jost.business/fullchain.pem /home/projects/jost-business/certs/cert.pem && cp /etc/letsencrypt/live/jost.business/privkey.pem /home/projects/jost-business/certs/key.pem && docker-compose -f /home/projects/jost-business/docker-compose.yml restart nginx
```

## Monitoring & Health Checks

Check if all services are healthy:

```bash
curl http://localhost/health
curl https://jost.business/health
```

Check individual app health:
```bash
curl http://localhost:3000
curl http://localhost:3001
curl http://localhost:3002
curl http://localhost:3003
```

## Troubleshooting

### Containers keep restarting
```bash
docker-compose logs -f
# Check for build errors or missing dependencies
```

### Port already in use
```bash
# Check what's running on ports
netstat -tulpn | grep LISTEN

# Kill process using port
sudo kill -9 <PID>
```

### DNS not resolving
```bash
# Verify DNS settings in GoDaddy:
# A record: jost.business -> 167.86.87.165

# Test DNS resolution
dig jost.business
nslookup jost.business
```

### Nginx proxy not working
- Check nginx.conf configuration
- Verify containers are on same Docker network
- Check container names in nginx.conf upstream definitions

### Rebuild and restart everything
```bash
cd /home/projects/jost-business
docker-compose down
docker-compose build --no-cache
docker-compose up -d
```

## Performance Optimization

### Enable compression in Nginx
Already configured in `nginx.conf` with gzip

### Cache static files
Already configured with Nginx caching headers

### Rate limiting
Already configured to prevent abuse

## Security Considerations

- Change default SSH port
- Set up firewall (ufw)
- Regular security updates
- Keep Docker updated
- Use strong SSL certificates
- Monitor logs regularly

## Next Steps

1. Set up continuous deployment (CI/CD)
2. Configure monitoring/alerts
3. Set up database backups
4. Implement logging aggregation
5. Add database service if needed
6. Set up email notifications

## Getting Help

- Docker Docs: https://docs.docker.com
- Docker Compose: https://docs.docker.com/compose/
- Nginx: https://nginx.org/en/docs/
- Contabo Support: https://my.contabo.com/support/
