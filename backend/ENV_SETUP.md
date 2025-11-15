# Environment Variables Setup Guide

## 📋 Required Environment Variables

### 1. Server Configuration

#### `PORT`
- **Description**: Port number for the Express server
- **Default**: `3000`
- **Example**: `PORT=3000`

### 2. CORS Configuration

#### `CORS_ORIGIN`
- **Description**: Allowed origin for CORS requests
- **Development**: Use `*` to allow all origins
- **Production**: Use your frontend URL (e.g., `https://your-app.expo.dev`)
- **Example**: 
  - Development: `CORS_ORIGIN=*`
  - Production: `CORS_ORIGIN=https://your-app.expo.dev`

### 3. Firebase Admin SDK Configuration

#### `FIREBASE_PROJECT_ID`
- **Description**: Your Firebase project ID
- **How to get**: Firebase Console > Project Settings > General
- **Example**: `FIREBASE_PROJECT_ID=handy-app-848e6`

#### `FIREBASE_PRIVATE_KEY`
- **Description**: Private key from Firebase service account
- **How to get**: 
  1. Go to Firebase Console > Project Settings > Service Accounts
  2. Click "Generate new private key"
  3. Download the JSON file
  4. Copy the `private_key` value (keep the newlines `\n`)
- **Important**: 
  - Keep the quotes around the key
  - Keep the `\n` characters for newlines
  - Example format: `"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"`

#### `FIREBASE_CLIENT_EMAIL`
- **Description**: Client email from Firebase service account
- **How to get**: From the same JSON file, copy the `client_email` value
- **Example**: `FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@handy-app-848e6.iam.gserviceaccount.com`

## 🚀 Setup Steps

### Step 1: Create `.env` file
```bash
cd backend
cp .env.example .env
```

### Step 2: Get Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `handy-app-848e6`
3. Go to **Project Settings** (gear icon) > **Service Accounts**
4. Click **"Generate new private key"**
5. Download the JSON file (e.g., `handy-app-848e6-firebase-adminsdk-xxxxx.json`)

### Step 3: Extract Values from JSON

Open the downloaded JSON file and extract:

```json
{
  "project_id": "handy-app-848e6",  // -> FIREBASE_PROJECT_ID
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",  // -> FIREBASE_PRIVATE_KEY
  "client_email": "firebase-adminsdk-xxxxx@handy-app-848e6.iam.gserviceaccount.com"  // -> FIREBASE_CLIENT_EMAIL
}
```

### Step 4: Fill in `.env` file

Edit `backend/.env` and fill in all values:

```env
PORT=3000
CORS_ORIGIN=*
FIREBASE_PROJECT_ID=handy-app-848e6
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@handy-app-848e6.iam.gserviceaccount.com
```

**⚠️ Important Notes:**
- Keep the quotes around `FIREBASE_PRIVATE_KEY`
- Keep the `\n` characters in the private key
- Never commit `.env` file to Git (it's already in `.gitignore`)

### Step 5: Test the Configuration

Start the server:

```bash
cd backend
npm install
npm run dev
```

You should see:
```
✅ Firebase Admin initialized successfully
Server is running on port 3000
Health check: http://localhost:3000/health
API base URL: http://localhost:3000/api
```

## 🌐 Production Deployment

When deploying to production (Railway, Render, Vercel, Heroku, etc.), set these environment variables in your platform's dashboard:

1. **PORT**: Usually auto-set by platform, but can override
2. **CORS_ORIGIN**: Your production frontend URL
3. **FIREBASE_PROJECT_ID**: Same as development
4. **FIREBASE_PRIVATE_KEY**: Same as development (copy from JSON)
5. **FIREBASE_CLIENT_EMAIL**: Same as development (copy from JSON)

### Example Production Environment Variables:

```env
PORT=3000
CORS_ORIGIN=https://your-app.expo.dev
FIREBASE_PROJECT_ID=handy-app-848e6
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@handy-app-848e6.iam.gserviceaccount.com
```

## 🔒 Security Best Practices

1. ✅ Never commit `.env` file to Git
2. ✅ Use different Firebase projects for dev/staging/production
3. ✅ Restrict CORS_ORIGIN in production to specific domains
4. ✅ Rotate service account keys periodically
5. ✅ Use environment variable management tools for production

## ❓ Troubleshooting

### Error: "Firebase Admin initialization failed"
- Check if all Firebase environment variables are set correctly
- Verify the private key includes `\n` characters
- Make sure the service account has proper permissions

### Error: "CORS policy blocked"
- Check `CORS_ORIGIN` setting
- Make sure frontend URL matches CORS_ORIGIN
- For development, try `CORS_ORIGIN=*` temporarily

### Error: "Port already in use"
- Change `PORT` to a different number (e.g., `3001`)
- Or stop the process using port 3000

