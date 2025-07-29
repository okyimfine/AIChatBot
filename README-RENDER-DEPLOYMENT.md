# How to Deploy Your AI Chat App to Render

## Step 1: Prepare Your Code

Your app is already set up correctly! The important files are ready:
- ✅ `package.json` has the correct `build` and `start` scripts
- ✅ `render.yaml` is configured for automatic deployment
- ✅ Your app supports PostgreSQL database

## Step 2: Create a GitHub Repository

1. Go to [GitHub.com](https://github.com)
2. Click "New repository"
3. Name it `ai-chat-app` (or any name you prefer)
4. Make it **Public** (required for Render free tier)
5. Click "Create repository"

## Step 3: Upload Your Code to GitHub

**Option A: Using GitHub Web Interface (Easiest)**
1. Download all your project files from Replit
2. In your new GitHub repo, click "uploading an existing file"
3. Drag and drop all your project files
4. Add commit message: "Initial commit - AI Chat App"
5. Click "Commit changes"

**Option B: Using Git Commands (if you have Git installed)**
```bash
git init
git add .
git commit -m "Initial commit - AI Chat App"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/ai-chat-app.git
git push -u origin main
```

## Step 4: Set Up Database on Render

1. Go to [Render.com](https://render.com) and sign up
2. Click "New +" → "PostgreSQL"
3. Choose these settings:
   - **Name**: `ai-chat-database`
   - **Plan**: Free
   - **Region**: Choose closest to you
4. Click "Create Database"
5. **Save the connection details** you'll see (especially the External Database URL)

## Step 5: Deploy Your App

1. In Render dashboard, click "New +" → "Web Service"
2. Connect your GitHub repository
3. Choose your `ai-chat-app` repository
4. Configure these settings:
   - **Name**: `ai-chat-app`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 6: Add Environment Variables

In the Environment section, add these variables:

```
NODE_ENV=production
DATABASE_URL=postgresql://[your-database-url-from-step-4]
GEMINI_API_KEY=[your-gemini-key]
GOOGLE_CLIENT_ID=[your-google-client-id]
GOOGLE_CLIENT_SECRET=[your-google-client-secret]
```

**Important**: Replace the values with your actual API keys from Replit Secrets.

## Step 7: Update Google OAuth Settings

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to "APIs & Services" → "Credentials"
3. Find your OAuth 2.0 Client ID
4. Add your Render URL to "Authorized redirect URIs":
   - `https://your-app-name.onrender.com/api/auth/google/callback`
5. Add to "Authorized JavaScript origins":
   - `https://your-app-name.onrender.com`

## Step 8: Deploy and Test

1. Click "Create Web Service"
2. Wait for deployment (5-10 minutes)
3. Once deployed, you'll get a URL like: `https://your-app-name.onrender.com`
4. Test your app by visiting the URL

## Important Notes

- **Free tier limitations**: 
  - App sleeps after 15 minutes of inactivity
  - 750 hours per month (enough for testing)
  - Database limited to 1GB

- **Database migration**: After deployment, visit your app URL once to trigger database table creation

- **Troubleshooting**: Check the logs in Render dashboard if something goes wrong

## Your API Keys Needed

Make sure you have these from your Replit Secrets:
- `GEMINI_API_KEY`
- `GOOGLE_CLIENT_ID` 
- `GOOGLE_CLIENT_SECRET`

## After Testing on Render

Once everything works on Render, you can easily deploy to Replit hosting by simply clicking the Deploy button in your Replit project!

Good luck with your deployment! 🚀