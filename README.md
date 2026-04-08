# FocusForest Frontend

A beautiful, gamified Pomodoro timer application that helps you stay focused and grow your virtual forest.

## Features

- 🍅 **Multiple Timer Variants**: Sprint (15min), Classic (25min), Deep Work (50min), Flow (90min)
- 🌳 **Tree Growth System**: Watch your trees grow as you complete focus sessions
- 📊 **Progress Tracking**: Calendar heatmap, stats dashboard, and session history
- 👥 **Groups**: Create or join groups to stay accountable with friends
- 🏆 **Leaderboard**: Compete with others and track your ranking
- 🔥 **Streak Tracking**: Maintain your daily focus streak
- 📱 **Responsive Design**: Works perfectly on desktop and mobile

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Router** - Client-side routing
- **React Query** - Data fetching and caching
- **Zustand** - State management
- **Axios** - HTTP client
- **Framer Motion** - Animations

## Prerequisites

- Node.js 16+ and npm
- Backend API running at `https://focusforest-backend.onrender.com`

## Getting Started

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd focusforest-frontend

# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

**Development Mode:**
- Uses Vite proxy for API calls
- API requests go to `/api/v1` and are proxied to the backend
- Hot module replacement enabled
- Cookies work correctly with localhost

### Building for Production

```bash
# Create production build
npm run build
```

The optimized build will be in the `dist/` directory.

### Preview Production Build

```bash
# Preview the production build locally
npm run preview
```

## Environment Configuration

### Development (`.env.development`)
```
VITE_API_BASE_URL=/api/v1
```

### Production (`.env.production`)
```
VITE_API_BASE_URL=https://focusforest-backend.onrender.com/api/v1
```

## Project Structure

```
focusforest-frontend/
├── src/
│   ├── api/              # API client and endpoints
│   ├── components/       # Reusable components
│   ├── hooks/            # Custom React hooks
│   ├── lib/              # Utilities and helpers
│   ├── pages/            # Page components
│   ├── stores/           # Zustand stores
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── App.tsx           # Root component
│   └── main.tsx          # Entry point
├── public/               # Static assets
├── docs/                 # Documentation
├── .env.development      # Development environment variables
├── .env.production       # Production environment variables
└── vite.config.ts        # Vite configuration
```

## Key Features Implementation

### Authentication
- HttpOnly cookie-based authentication
- Auto-redirect on 401 (unauthorized)
- Protected routes with auth guard

### Session Management
- Start/Complete/Abandon session flows
- Task tracking with carry-forward
- Real-time timer updates
- Session history

### Data Fetching
- React Query for caching and background updates
- Optimistic updates
- Automatic retry on failure
- Loading and error states

### State Management
- Zustand for global state (auth, session)
- React Query for server state
- localStorage for UI preferences only

## API Integration

All API endpoints are fully integrated:
- Authentication (login, signup, logout)
- Trees & Calendar (today, week, full year)
- Sessions (start, complete, abandon, history)
- Groups (create, join, leave, members, stats)
- Leaderboard (solo, groups, pagination)
- Stats (summary, streaks)
- Profile (view, update)

See `docs/API.md` for complete API documentation.

## Deployment

See `DEPLOYMENT_GUIDE.md` for detailed deployment instructions.

### Quick Deploy

**Netlify:**
```bash
# Build command
npm run build

# Publish directory
dist
```

**Vercel:**
```bash
# Framework preset: Vite
# Build command: npm run build
# Output directory: dist
```

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint (if configured)
```

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- Code splitting (vendor, query, main chunks)
- Tree shaking for unused code removal
- Optimized bundle size
- Lazy loading ready

## Security

- HttpOnly cookies for authentication
- No sensitive data in localStorage
- CORS with credentials
- Auto-logout on 401
- XSS protection via React

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Documentation

- `DEPLOYMENT_GUIDE.md` - Deployment instructions
- `docs/API.md` - API reference
- `docs/API_ERROR_HANDLING.md` - Error handling guide
- `docs/SESSION_LIFECYCLE_GUIDE.md` - Session flow guide
- `docs/FRONTEND_INTEGRATION_GUIDE.md` - Integration patterns

## Troubleshooting

### API calls fail
- Check that backend is running
- Verify `VITE_API_BASE_URL` is correct
- Check browser console for errors

### Cookies not working
- Ensure `withCredentials: true` in API client
- Check backend CORS configuration
- Verify backend sets cookies correctly

### Build fails
- Run `npm install` to update dependencies
- Check for TypeScript errors
- Verify all imports are correct

## License

[Your License Here]

## Support

For issues or questions, please check the documentation or open an issue.
