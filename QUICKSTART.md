# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Docker & Docker Compose installed
- OR Node.js 20+ with npm

---

## Option 1: Run with Docker (Recommended)

### Start everything with one command:
```bash
cd d:\projects\jost-business
docker-compose up --build
```

### Open in browser:
- Shell app: http://localhost
- Finance: http://localhost/finance/
- About Me: http://localhost/about-me/
- Playground: http://localhost/playground/

### Stop:
```bash
docker-compose down
```

---

## Option 2: Local Development (Without Docker)

### Install dependencies:
```bash
cd d:\projects\jost-business
npm install
```

### Start shell app:
```bash
npm start
```

### Open browser:
- http://localhost:4200

### Other useful commands:
```bash
npm run build         # Build for production
npm run lint          # Run linter
npm run test          # Run tests
```

---

## 📁 Project Structure

```
apps/
├── shell/       → Main app (/)
├── finance/     → Finance (/finance)
├── about-me/    → About Me (/about-me)
└── playground/  → Playground (/playground)

libs/
└── shared/      → Reusable services & components
```

---

## 🎯 Key Files

| File | Purpose |
|------|---------|
| `docker-compose.yml` | Run all services together |
| `nginx.conf` | Routing configuration |
| `apps/*/Dockerfile` | Build each app |
| `libs/shared/src/services/auth.service.ts` | Authentication |
| `libs/shared/src/theme/material-theme.scss` | Global styling |

---

## 🔒 Authentication

The app includes a built-in auth service:

```typescript
// Signals-based auth
authService.currentUser()        // Get current user
authService.isAuthenticated()    // Check if logged in
authService.login(user)          // Login
authService.logout()             // Logout
```

**Auto-persists to sessionStorage** - State survives page refreshes!

---

## 🎨 Styling

All components use:
- **Separate `.scss` files** (not inline styles)
- **CSS classes** for styling
- **Material Design 3** colors & components
- **Responsive design**

Example:
```typescript
// Component uses external styles
@Component({
  selector: 'app-finance',
  templateUrl: './finance.component.html',
  styleUrl: './finance.component.scss',  // ← Separate file
})
export class FinanceComponent { }
```

---

## 🚀 Deploy to Production

### Contabo Server (167.86.87.165)

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

**Quick version:**
```bash
# On your Contabo server
ssh root@167.86.87.165

# Install Docker & Docker Compose
curl -fsSL https://get.docker.com | sh
# ... (follow installation)

# Clone your repo
git clone <repo-url> /home/jost-business
cd /home/jost-business

# Generate SSL certificate
mkdir -p certs && cd certs
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout key.pem -out cert.pem

# Start services
docker-compose up -d

# Visit
# https://jost.business
```

---

## 🔧 Useful Commands

### Docker
```bash
docker-compose up                 # Start services
docker-compose up -d              # Start in background
docker-compose down               # Stop services
docker-compose logs -f shell      # View logs
docker-compose ps                 # Check status
docker-compose rebuild            # Rebuild images
docker-compose exec shell sh      # SSH into container
```

### Nx (Local development)
```bash
npx nx serve shell                # Start dev server
npx nx build shell                # Production build
npx nx list                       # List all projects
npx nx graph                      # Visualize dependency graph
npx nx lint shell                 # Lint checks
```

---

## 📱 Features

✅ **Angular 21** - Latest version  
✅ **Zoneless** - Better performance  
✅ **Signals** - Modern state management  
✅ **Material Design 3** - Professional UI  
✅ **Separate Templates** - Clean architecture  
✅ **Shared Services** - Cross-app state  
✅ **Docker Ready** - Production deployment  
✅ **Nginx Routing** - Sub-path support  
✅ **SSL/HTTPS** - Secure by default  

---

## 🐛 Troubleshooting

### Port already in use
```bash
docker-compose down
docker system prune
docker-compose up --build
```

### Build failing
```bash
# Clean rebuild
docker-compose down -v
docker-compose build --no-cache
docker-compose up
```

### Can't access from browser
```bash
# Check if services are running
docker-compose ps

# Check logs
docker-compose logs -f

# Verify networking
docker network ls
```

### DNS not resolving (production)
```bash
nslookup jost.business
dig jost.business
# Should show your server IP: 167.86.87.165
```

---

## 📚 Learn More

- [COMPLETION.md](./COMPLETION.md) - Full project details
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Production deployment
- [README.md](./README.md) - Technical overview
- Component files - Well-commented code

---

## 🎉 You're All Set!

Choose an option above and get started!

**Questions?** Check the documentation files or add comments to the code.

Happy coding! 🚀
