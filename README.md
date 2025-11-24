# Minute Betting Game - Multiplayer

A real-time multiplayer betting game where players bet credits every minute and winners are paired by bet proximity.

## Features
- Real-time multiplayer using Socket.io
- 60-second betting rounds
- Automatic pairing by bet amount proximity
- Winner takes loser's bet in each pair
- Live updates for all connected players
- Mobile-friendly design

## Quick Deploy to Render (FREE)

### Option 1: Deploy via GitHub (Recommended)

1. **Push this code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Deploy on Render:**
   - Go to [render.com](https://render.com) and sign up/login
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Render will auto-detect the settings from `render.yaml`
   - Click "Create Web Service"
   - Wait 2-3 minutes for deployment
   - Your game will be live at: `https://your-app-name.onrender.com`

### Option 2: Deploy via Render Dashboard (Without Git)

1. Go to [render.com](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Choose "Deploy from Git" and create a new repo, or use the manual deploy option
4. Set:
   - **Name**: betting-game (or your choice)
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
5. Click "Create Web Service"

## Alternative: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Click "Start a New Project"
3. Select "Deploy from GitHub repo" (push your code first)
4. Railway auto-detects Node.js
5. Your app deploys automatically
6. Get your URL from the deployment

## Local Testing

```bash
npm install
npm start
```

Then open `http://localhost:3000` in multiple browser windows/devices on the same network.

## How to Play

1. Everyone opens the same URL on their phones
2. One person adds all player names
3. Click "Start Game"
4. Each round lasts 60 seconds
5. Everyone places their bet (amounts hidden until round ends)
6. Winners paired by proximity take losers' bets
7. New round starts automatically

## Tech Stack

- **Backend**: Node.js + Express + Socket.io
- **Frontend**: Vanilla JavaScript + HTML/CSS
- **Deployment**: Render (free tier)

## Notes

- Free tier on Render spins down after 15 minutes of inactivity
- First request after spin-down takes ~30 seconds to wake up
- Upgrade to paid tier ($7/month) for always-on hosting
