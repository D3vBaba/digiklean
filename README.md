# DigiKlean - Online Presence Tracker

A privacy-focused application to track your digital footprint and provide guides for removing personal information from the internet.

## Features

- **Search Dashboard**: Search for your name or username across the web (powered by Google Custom Search API).
- **Privacy Score**: (Coming Soon) Analyze your exposure level.
- **Removal Guides**: Step-by-step instructions to remove data from brokers like Spokeo, Whitepages, etc.
- **Continuous Monitoring**: Automated weekly scans to track your online presence.
- **Premium UI**: Modern, responsive design with dark mode and smooth animations.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Environment Setup

Create a `.env.local` file in the root directory with the following variables:

#### Firebase Configuration (Required)

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**To get Firebase credentials:**
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (or create a new one)
3. Click the gear icon → Project settings
4. Scroll to "Your apps" and select your web app (or create one)
5. Copy the config values

#### Google Custom Search API (Required for search functionality)

```env
GOOGLE_API_KEY=your_google_api_key
GOOGLE_SEARCH_CX=your_search_engine_id
```

**To get Google API credentials:**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Custom Search API
3. Create an API key
4. Create a Custom Search Engine at [Programmable Search Engine](https://programmablesearchengine.google.com/)
5. Copy the Search Engine ID (CX)

### 3. Firebase Setup

#### Enable Authentication
1. In Firebase Console, go to Authentication
2. Enable Email/Password sign-in method

#### Set up Firestore
1. In Firebase Console, go to Firestore Database
2. Create database in production mode
3. Deploy security rules:
   ```bash
   firebase deploy --only firestore:rules
   ```
4. Deploy indexes:
   ```bash
   firebase deploy --only firestore:indexes
   ```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS v4
- **Language**: TypeScript
- **Backend**: Firebase (Authentication + Firestore)
- **Search**: Google Custom Search API

## Troubleshooting

### Firebase initialization failed
- Verify all `NEXT_PUBLIC_FIREBASE_*` variables are set in `.env.local`
- Check that your Firebase project is active
- Ensure you're using the correct Firebase config for your environment

### Search returns no results
- Verify `GOOGLE_API_KEY` and `GOOGLE_SEARCH_CX` are set
- Check your Google API quota hasn't been exceeded
- Ensure Custom Search API is enabled in Google Cloud Console

### Dashboard shows no scans
- Perform a search while logged in to populate data
- Check Firestore security rules allow read/write for authenticated users
- Verify Firestore indexes are deployed

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── api/               # API routes
│   │   ├── search/        # Search endpoint
│   │   ├── monitor/run/   # Manual scan endpoint
│   │   └── opt-out/       # Opt-out automation
│   ├── dashboard/         # Dashboard pages
│   └── login/             # Authentication pages
├── components/            # React components
├── context/              # React context (Auth)
└── lib/                  # Utilities
    ├── firebase.ts       # Firebase config
    └── google-search.ts  # Search API integration
```

## License

MIT
