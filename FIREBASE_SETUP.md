# Firebase Setup Guide for JobTrack

This guide walks you through setting up Firebase for the JobTrack application.

---

## 1. Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **"Create a project"**
3. Enter project name: `jobtrack` (or your preferred name)
4. Disable Google Analytics (optional for this app)
5. Click **"Create project"**

---

## 2. Register Your Web App

1. In Firebase Console, click the **Web icon** (`</>`) to add a web app
2. Enter app nickname: `JobTrack Web`
3. Check **"Also set up Firebase Hosting"** (optional)
4. Click **"Register app"**
5. **Copy the Firebase config object** - you'll need this for the `.env` file

Your config will look like this:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

---

## 3. Enable Authentication

### Email/Password Authentication
1. Go to **Build → Authentication** in Firebase Console
2. Click **"Get started"**
3. Go to **Sign-in method** tab
4. Click **"Email/Password"**
5. Toggle **"Enable"** for Email/Password
6. Click **"Save"**

### Google OAuth
1. In **Sign-in method** tab, click **"Google"**
2. Toggle **"Enable"**
3. Select a **Project support email**
4. Click **"Save"**

### GitHub OAuth
1. In **Sign-in method** tab, click **"GitHub"**
2. Toggle **"Enable"**
3. You'll need to create a GitHub OAuth App:
   - Go to [GitHub Developer Settings](https://github.com/settings/developers)
   - Click **"New OAuth App"**
   - Fill in:
     - Application name: `JobTrack`
     - Homepage URL: `http://localhost:5173` (or your production URL)
     - Authorization callback URL: Copy from Firebase (looks like `https://your-project.firebaseapp.com/__/auth/handler`)
   - Click **"Register application"**
   - Copy the **Client ID** and generate a **Client Secret**
4. Paste the Client ID and Client Secret in Firebase
5. Click **"Save"**

---

## 4. Set Up Firestore Database

1. Go to **Build → Firestore Database**
2. Click **"Create database"**
3. Select **"Start in production mode"**
4. Choose a location close to your users (e.g., `us-central`)
5. Click **"Enable"**

### Security Rules

Go to **Firestore → Rules** and replace with:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // AI rate limit logs - allow all authenticated users
    match /ai_rate_limits/{documentId} {
      allow read, write: if request.auth != null;
    }
    
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      // Applications subcollection
      match /applications/{applicationId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
        
        // Notes subcollection
        match /notes/{noteId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
        
        // Summary subcollection (one per application)
        match /summary/{summaryId} {
          allow read, write: if request.auth != null && request.auth.uid == userId;
        }
      }
      
      // User insights subcollection
      match /insights/{insightId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

Click **"Publish"** to save the rules.

---

## 5. Enable Firebase AI (for AI Insights)

This app uses Firebase AI Logic to provide AI-powered features like application insights and note summarization.

1. Go to **Build → AI Logic** in Firebase Console
2. Click **"Get started"**
3. Select **"Gemini API"** as the AI provider
4. Accept the terms of service
5. Click **"Enable Gemini API"**

> **Note**: The app uses multiple Gemini models with automatic fallback:
> - gemini-3-pro-preview → gemini-3-flash-preview → gemini-2.5-pro → gemini-2.5-flash → gemini-2.5-flash-lite → gemini-2.0-flash
> 
> If one model hits rate limits (429/503), the app automatically tries the next one.

### Rate Limit Tracking

The app logs rate limit errors to Firestore in the `ai_rate_limits` collection. You can monitor which models are hitting limits in the Firebase Console under Firestore.

---

## 6. Configure Environment Variables

1. In your project root, **copy `.env.example` to `.env`**:
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Firebase config values** in `.env`:
   ```
   VITE_FIREBASE_API_KEY=AIzaSy...
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abc123
   ```

3. **Restart the dev server** for changes to take effect:
   ```bash
   npm run dev
   ```

---

## 6. Test the Application

1. Open `http://localhost:5173`
2. You should see the login page
3. Click **"Sign up"** to create an account
4. Try creating a job application
5. Test the Google/GitHub sign-in buttons

---

## 7. Deploy to Firebase Hosting (Optional)

### Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Initialize Hosting
```bash
firebase init hosting
```
- Select your Firebase project
- Set public directory to `dist`
- Configure as single-page app: **Yes**
- Don't overwrite `index.html`

### Build and Deploy
```bash
npm run build
firebase deploy --only hosting
```

Your app will be live at `https://your-project.web.app`

---

## Troubleshooting

### "Firebase: Error (auth/configuration-not-found)"
- Ensure your `.env` file has correct values
- Restart the dev server after changing `.env`

### "Firebase: Error (auth/popup-closed-by-user)"
- User closed the OAuth popup before completing sign-in
- Retry the sign-in process

### OAuth Redirect Errors
- Ensure the callback URL in GitHub/Google matches exactly what Firebase provides
- For local development, ensure `localhost` domains are authorized in Firebase Console → Authentication → Settings → Authorized domains

### Firestore Permission Denied
- Check that your security rules are published
- Ensure the user is authenticated before accessing data

---

## Summary

| Component | Status |
|-----------|--------|
| Firebase Project | Create at console.firebase.google.com |
| Authentication | Enable Email/Password + Google + GitHub |
| Firestore | Create database + add security rules |
| Environment | Copy `.env.example` to `.env` and fill values |
| Deployment | Optional: Firebase Hosting |
