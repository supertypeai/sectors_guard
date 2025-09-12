# Deployment Guide to Vercel

## Prerequisites
1. Install Vercel CLI: `npm install -g vercel`
2. Create a Vercel account at https://vercel.com

## Environment Variables
Before deploying, make sure to set up environment variables in Vercel:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variable:
   - `REACT_APP_API_URL`: Your backend API URL (e.g., `https://your-backend-api.com/api`)

## Deployment Methods

### Method 1: Deploy via Vercel CLI
1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy the project:
   ```bash
   vercel
   ```

3. Follow the prompts to configure your project

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Method 2: Deploy via GitHub Integration
1. Push your code to GitHub
2. Go to Vercel dashboard
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables
6. Deploy

## Build Configuration
The project is configured with:
- Framework: Create React App
- Build Command: `npm run build`
- Output Directory: `build`
- Node.js Version: 18.x (recommended)

## Custom Domain (Optional)
To add a custom domain:
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Configure DNS records as instructed

## Troubleshooting
- Make sure all environment variables are set correctly
- Check build logs for any errors
- Ensure your backend API supports CORS for your Vercel domain
