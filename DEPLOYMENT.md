# Deploying to Vercel

Since your code conflicts are securely hosted on GitHub, deploying to Vercel is extremely straightforward.

## Step 1: Login to Vercel
1. Go to [vercel.com](https://vercel.com) and log in (or sign up) using your **GitHub** account.

## Step 2: Import Project
1. On your Vercel Dashboard, click **"Add New..."** -> **"Project"**.
2. Assuming you logged in with GitHub, you should see `aurumtechnologyltd/aurum-transcription` under "Import Git Repository".
3. Click the **"Import"** button next to it.

## Step 3: Configure Project
Vercel will automatically detect that this is a **Vite** project.
- **Framework Preset**: Vite (should be auto-selected)
- **Root Directory**: `./` (default)
- **Build Command**: `npm run build` (default)
- **Output Directory**: `dist` (default)

### Environment Variables
Since you are storing the OpenAI Key in the user's browser (`localStorage`), you currently **DO NOT** need to set any server-side environment variables for the core functionality to work.

## Step 4: Deploy
1. Click **"Deploy"**.
2. Wait for the build to complete (usually < 1 minute).
3. Once finished, you will get a live URL (e.g., `https://aurum-transcription.vercel.app`).
