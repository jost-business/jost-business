# Jost Business - Angular 21 Nx Monorepo with Micro Frontends

Modern Angular 21 monorepo using Nx with zoneless change detection, signals, and lazy-loaded feature apps.

## 📁 Project Structure

```
jost-business/
├── apps/
│   ├── shell/           # Main host application
│   ├── finance/         # Finance feature app
│   ├── about-me/        # About Me feature app
│   └── playground/      # Playground feature app
├── libs/
│   └── shared/          # Shared library (services, components, themes)
├── nx.json              # Nx configuration
├── tsconfig.base.json   # TypeScript base config with path mappings
└── package.json         # Dependencies and scripts
```

## 🚀 Tech Stack

- **Angular 21** - Latest stable version
- **Nx 22** - Monorepo management
- **TypeScript 5.9** - Latest TypeScript
- **Angular Material 21** - Material Design 3
- **Zoneless** - No Zone.js for better performance
- **Signals** - New state management API
- **RxJS 7.8** - Reactive programming

## 📦 Key Features

### apps/shell
- Host application served at `/`
- Main navigation and routing
- Lazy loads all feature apps
- Uses Angular Material with Signals

### apps/finance
- Finance dashboard and transactions
- Lazy loaded at `/finance`
- Imports shared services (AuthService)
- Demonstrates shared state management

### apps/about-me
- Profile and bio section
- Lazy loaded at `/about-me`
- Uses shared auth context

### apps/playground
- Interactive demo of Signals and forms
- Lazy loaded at `/playground`
- Shows cross-app state sharing

### libs/shared
- **Services:**
  - `AuthService` (with Signals for state)
  
- **Components:**
  - `HeaderComponent` (reusable header with Material)

- **Theme:**
  - Material Design 3 theme configuration

## 🛠️ Setup & Running Locally

### Prerequisites
- Node.js 18+
- npm 9+

### Installation

```bash
npm install
```

### Development Server

```bash
npm start
# or
npm run serve
# or use Nx directly
npx nx serve shell
```

Navigate to `http://localhost:4200/`. The app will automatically reload when you change any of the source files.

### Build for Production

```bash
npm run build
# or
npx nx build shell
```

Output will be in `dist/apps/shell/`.

## 🔧 Nx Commands

```bash
# Serve the shell app
npx nx serve shell

# Build shell app
npx nx build shell

# List all projects
npx nx list

# Show project graph
npx nx graph

# Run linting
npx nx lint shell

# Generate documentation
npx nx affected:graph
```

## 📋 Module Federation (Ready for Future Use)

This monorepo is structured to support Module Federation for true micro frontends:
- Each app (finance, about-me, playground) can be deployed independently
- Shared libraries configured for singleton pattern
- Just add `module-federation.config.js` to each app to enable true federation

## 🎨 Material Design Integration

The Material theme is configured globally in `libs/shared/src/theme/material-theme.scss` and applied to all apps via the shell app's styles.

## 🔐 Authentication

The `AuthService` from `libs/shared` uses Angular Signals for state management:
- `currentUser` signal - currently logged-in user
- `isAuthenticated` signal - auth status
- `isLoading` signal - loading state

State is shared across all lazy-loaded apps automatically.

## 📱 Routing

- `/` - Home (shell)
- `/finance` - Finance app (lazy loaded)
- `/about-me` - About Me app (lazy loaded)
- `/playground` - Playground app (lazy loaded)

## 🐳 Docker & Deployment

This project is fully containerized with Docker and ready to deploy:

### Local Docker Testing
```bash
docker-compose up --build
```

Visit `http://localhost` (shell), `http://localhost/finance`, etc.

### Deploy to Contabo
See [DEPLOYMENT.md](./DEPLOYMENT.md) for complete deployment instructions.

**Quick summary:**
1. SSH into Contabo server (167.86.87.165)
2. Clone/SCP this repository
3. Generate SSL certificates
4. Run `docker-compose up -d`
5. Visit `jost.business`

**Routing (with Nginx):**
- `/` → Shell app (port 3000)
- `/finance/` → Finance app (port 3001)
- `/about-me/` → About Me app (port 3002)
- `/playground/` → Playground app (port 3003)

## 📚 Learning Resources

- [Nx Documentation](https://nx.dev)
- [Angular 21 Docs](https://angular.io)
- [Signals Guide](https://angular.io/guide/signals)
- [Material Documentation](https://material.angular.io)

## 📝 Next Steps

1. ✅ Nx monorepo initialized
2. ✅ Shell app created
3. ✅ 3 feature apps created
4. ✅ Shared library created
5. ⏳ Configure Module Federation (optional)
6. ⏳ Add Dockerfiles for each app
7. ⏳ Create docker-compose.yml
8. ⏳ Configure Nginx for sub-path routing
9. ⏳ Deploy to Contabo server

## 🤝 Contributing

1. Create feature in appropriate app or lib
2. Use TypeScript strict mode
3. Follow Angular style guide
4. Test changes before committing

## 📄 License

MIT
