# environment variables setup

## project Structure

this project has two parts that need environment variables:

1. **Frontend** (root directory) - Expo/React Native app
2. **Backend** (`backend/` directory) - Express API server

## Frontend Setup

### Step 1: create `.env` file in root directory

```bash
cp .env.example .env
```

### Step 2: configure Frontend environment variables

#### `EXPO_PUBLIC_API_BASE_URL`
- **Description**: Backend API URL
- **Development**: Leave empty (will auto-detect localhost)
- **Production**: Set to your deployed backend URL
- **Example**: `EXPO_PUBLIC_API_BASE_URL=https://your-api.railway.app/api`

#### Firebase Variables
the app already has default Firebase config hardcoded. only set these if want to override:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

#### `EXPO_PUBLIC_NEWS_API_KEY` (Optional)
- **Description**: News API key for fetching news articles
- **Get free key**: https://newsapi.org/

### Frontend `.env`:

```env
# Development
EXPO_PUBLIC_API_BASE_URL=

# Production (when backend is deployed)
# EXPO_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api
```

## Backend Setup

See [backend/ENV_SETUP.md](./backend/ENV_SETUP.md) for detailed backend setup instructions.

