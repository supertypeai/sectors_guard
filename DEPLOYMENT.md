# Deployment Guide: Frontend (Vercel) + Backend (Fly.io)

## Architecture
- **Frontend**: React app deployed to Vercel
- **Backend**: FastAPI app deployed to Fly.io
- **Database**: Supabase (cloud-hosted)

## Prerequisites
- Vercel account and CLI
- Fly.io account and flyctl CLI
- Git repository

## 1. Backend Deployment (Fly.io)

### Setup Fly.io
```bash
# Install flyctl (Windows)
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"

# Login to Fly.io
flyctl auth login
```

### Deploy Backend
```bash
cd backend

# Create and launch app (first time only)
flyctl launch --no-dockerfile

# Set environment variables
flyctl secrets set SUPABASE_URL="your-supabase-url"
flyctl secrets set SUPABASE_KEY="your-supabase-key"
flyctl secrets set JWT_SECRET="your-jwt-secret"
flyctl secrets set SMTP_SERVER="smtp.gmail.com"
flyctl secrets set SMTP_PORT="587"
flyctl secrets set SMTP_USERNAME="your-email@gmail.com"
flyctl secrets set SMTP_PASSWORD="your-app-password"
flyctl secrets set DEFAULT_EMAIL_RECIPIENTS="admin@company.com"

# Deploy
flyctl deploy

# Check status
flyctl status
flyctl logs
```

### Get Backend URL
```bash
flyctl info
# Note the hostname (e.g., https://idx-data-validation-backend.fly.dev)
```

## 2. Frontend Deployment (Vercel)

### Setup Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login
```

### Deploy Frontend
```bash
cd frontend

# First deployment
vercel

# Follow prompts:
# - Link to existing project? No
# - What's your project's name? idx-data-validation-frontend
# - In which directory is your code located? ./
# - Override the settings? No

# Set environment variables in Vercel dashboard or via CLI
vercel env add REACT_APP_API_URL
# Enter: https://your-backend.fly.dev/api

# Redeploy with new env vars
vercel --prod
```

### Alternative: Deploy via Git
1. Push to GitHub
2. Import project in Vercel dashboard
3. Set environment variable: `REACT_APP_API_URL = https://your-backend.fly.dev/api`
4. Deploy

## 3. Environment Variables Summary

### Backend (Fly.io secrets)
```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key
JWT_SECRET=your-jwt-secret-key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
DEFAULT_EMAIL_RECIPIENTS=admin@company.com,user@company.com
```

### Frontend (Vercel environment)
```bash
REACT_APP_API_URL=https://your-backend.fly.dev/api
```

## 4. Custom Domains (Optional)

### Backend Custom Domain
```bash
flyctl certs create backend.yourdomain.com
flyctl ips list  # Add A/AAAA records to your DNS
```

### Frontend Custom Domain
1. Go to Vercel dashboard → Project → Settings → Domains
2. Add your domain (e.g., app.yourdomain.com)
3. Follow DNS configuration instructions

## 5. Monitoring & Logs

### Backend (Fly.io)
```bash
flyctl logs --follow
flyctl status
flyctl metrics
```

### Frontend (Vercel)
- Dashboard: https://vercel.com/dashboard
- Function logs available in dashboard
- Performance insights in dashboard

## 6. Scaling & Updates

### Backend Updates
```bash
cd backend
flyctl deploy
```

### Frontend Updates
```bash
cd frontend
vercel --prod
# Or push to Git if using Git deployment
```

### Backend Scaling
```bash
# Scale to 2 machines
flyctl scale count 2

# Scale machine specs
flyctl scale vm shared-cpu-1x --memory 2048
```

## 7. Costs Estimate

### Fly.io (Backend)
- Shared CPU 1x (256MB): ~$1.94/month
- 1GB additional memory: ~$2.70/month
- Total: ~$4-6/month

### Vercel (Frontend)
- Hobby plan: Free (100GB bandwidth)
- Pro plan: $20/month (1TB bandwidth)

### Total Monthly Cost: $4-26 depending on usage

## 8. Troubleshooting

### Common Issues
1. **CORS errors**: Check backend CORS settings in `app/main.py`
2. **API connection failed**: Verify `REACT_APP_API_URL` in Vercel
3. **Backend startup errors**: Check Fly.io logs: `flyctl logs`
4. **Database connection**: Verify Supabase credentials

### Health Checks
- Backend: `https://your-backend.fly.dev/health`
- Frontend: Check browser console for errors
- Database: Test connection in Supabase dashboard
