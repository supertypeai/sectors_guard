# IDX Data Validation Dashboard

A comprehensive dashboard for monitoring IDX (Indonesian Stock Exchange) financial data quality with automated anomaly detection and email notifications. Built with React frontend, Python FastAPI backend, and automated workflows using GitHub Actions.

## 🚀 Features

- **IDX Financial Data Validation**: Specialized validation for Indonesian Stock Exchange data
- **Multi-Table Support**: Different validation approaches for different financial data types
- **Real-time Anomaly Detection**: 
  - Financial statement changes (>50% with trend analysis)
  - Daily price movements (>35%)
  - Dividend yield anomalies (>50% yield or >10% change)
  - Price data consistency checks
- **Automated Email Alerts**: Instant notifications when anomalies are detected
- **Interactive Dashboard**: Charts and visualizations for data trends and status
- **Periodic Validation**: Automated workflows for continuous monitoring
- **Configurable Rules**: Customize validation rules per table
- **Daily Summaries**: Automated daily reports of validation activities

## 📊 IDX Tables Monitored

### Financial Statements
- **`idx_combine_financials_annual`**: Annual financial data validation
- **`idx_combine_financials_quarterly`**: Quarterly financial data validation

### Market Data  
- **`idx_daily_data`**: Daily stock price movements
- **`idx_dividend`**: Dividend yield and changes analysis
- **`idx_all_time_price`**: All-time vs. periodic price consistency

## 🔍 Validation Rules

### Financial Data Validation
```python
# Annual/Quarterly Financial Changes
- Alert if absolute change > 50% 
- Consider average change trends (>30% for annual, >25% for quarterly)
- Analyze: revenue, net_income, total_assets, total_equity
```

### Market Data Validation
```python
# Daily Price Movements
- Alert if close price change > 35%

# Dividend Analysis  
- Alert if yield > 50%
- Alert if yield change > 10 percentage points

# Price Consistency
- Validate 30d_high <= 90d_high <= 52w_high <= all_time_high
- Check current price within recent ranges
```

## 🏗️ Architecture

```
├── backend/                 # Python FastAPI backend
│   ├── app/
│   │   ├── api/            # API routes
│   │   ├── validators/     # Data validation engines
│   │   ├── notifications/  # Email notification service
│   │   ├── database/       # Database models and connections
│   │   └── main.py        # FastAPI application
│   ├── tests/             # Backend tests
│   └── requirements.txt   # Python dependencies
├── frontend/              # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   └── utils/         # Utility functions
│   └── package.json       # Node.js dependencies
├── .github/workflows/     # GitHub Actions workflows
└── docs/                  # Documentation
```

## 🔧 Setup Instructions

### Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase account
- SMTP email service (Gmail, SendGrid, etc.)

### Backend Setup

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install Python dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Set up environment variables** (copy from `.env` file):
   ```bash
   JWT_SECRET="your-jwt-secret"
   PASSWORD="your-password"
   SUPABASE_URL="your-supabase-url"
   SUPABASE_KEY="your-supabase-key"
   SMTP_USERNAME="your-smtp-username"
   SMTP_PASSWORD="your-smtp-password"
   DEFAULT_EMAIL_RECIPIENTS="admin@company.com,team@company.com"
   ```

4. **Run the backend**:
   ```bash
   python main.py
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

The frontend will be available at `http://localhost:3000`

### Database Setup

1. **Create Supabase tables** (run these SQL commands in your Supabase SQL editor):

```sql
-- Validation results table
CREATE TABLE validation_results (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR NOT NULL,
    validation_type VARCHAR NOT NULL,
    status VARCHAR NOT NULL,
    anomalies_count INTEGER DEFAULT 0,
    details JSONB,
    created_at TIMESTAMP DEFAULT NOW(),
    email_sent BOOLEAN DEFAULT FALSE
);

-- Validation configurations table
CREATE TABLE validation_configs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR NOT NULL UNIQUE,
    validation_rules JSONB NOT NULL,
    email_recipients JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Email logs table
CREATE TABLE email_logs (
    id SERIAL PRIMARY KEY,
    validation_result_id INTEGER NOT NULL,
    recipients JSONB,
    subject VARCHAR,
    body TEXT,
    sent_at TIMESTAMP DEFAULT NOW(),
    status VARCHAR
);
```

## 🔄 GitHub Actions Workflows

### 1. Periodic Data Validation (`data-validation.yml`)
- Runs every hour during business hours
- Runs every 4 hours during off-hours and weekends
- Validates all configured tables
- Sends email alerts for anomalies
- Can be triggered manually

### 2. Daily Summary Report (`daily-summary.yml`)
- Runs daily at 8 AM UTC
- Generates and sends daily summary emails
- Provides overview of validation activities
- Creates summary artifacts

### 3. Deployment Workflow (`deploy.yml`)
- Runs on push to main branch
- Tests both backend and frontend
- Creates deployment packages
- Can be customized for your deployment target

### Setting up GitHub Secrets

Add these secrets to your GitHub repository:

```
JWT_SECRET=your-jwt-secret
PASSWORD=your-password
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SMTP_USERNAME=your-smtp-username
SMTP_PASSWORD=your-smtp-password
DEFAULT_EMAIL_RECIPIENTS=admin@company.com,team@company.com
DAILY_SUMMARY_RECIPIENTS=management@company.com,data-team@company.com
```

## 📊 Validation Types

### 1. Statistical Validation
- Detects outliers using IQR method
- Identifies unusual patterns in numerical data
- Configurable thresholds

### 2. Business Rules Validation
- Required field validation
- Duplicate detection
- Value range checks
- Custom business logic

### 3. Data Quality Validation
- Null value percentage checks
- Format validation (email, phone, etc.)
- Data type consistency
- Pattern matching

### 4. Time Series Validation
- Data gap detection
- Volume change analysis
- Temporal pattern anomalies
- Trend analysis

## 📧 Email Notifications

### Anomaly Alerts
- Triggered when anomalies are detected
- Detailed HTML and text versions
- Customizable per table
- Immediate notifications

### Daily Summaries
- Overview of validation activities
- Table status summaries
- Anomaly counts and trends
- Management-friendly reports

## 🎨 Dashboard Features

### Main Dashboard
- Real-time statistics
- Validation trends chart
- Table status distribution
- Last validation timestamps

### Validation Results Page
- Table management
- Manual validation triggers
- Results history
- Detailed anomaly views

### Configuration Page
- Per-table validation settings
- Email recipient management
- Validation type selection
- Error threshold configuration

## 🧪 Testing

### Backend Tests
```bash
cd backend
python -m pytest tests/ -v
```

### Frontend Tests
```bash
cd frontend
npm test
```

## 🚀 Deployment

### Production Deployment
1. Set up your production environment
2. Configure environment variables
3. Build the frontend: `npm run build`
4. Deploy backend to your server
5. Serve frontend static files
6. Set up GitHub Actions with production secrets

### Docker Deployment (Optional)
Create Dockerfiles for containerized deployment:

```dockerfile
# Backend Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "main.py"]

# Frontend Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM nginx:alpine
COPY --from=0 /app/build /usr/share/nginx/html
```

## 📝 Configuration Examples

### Table Configuration Example
```json
{
  "types": ["statistical", "business_rules", "data_quality"],
  "rules": {
    "required_fields": ["id", "email", "created_at"],
    "no_duplicates": ["email"],
    "email_format": true,
    "amount_range": {"min": 0, "max": 100000}
  },
  "time_column": "created_at",
  "error_threshold": 5
}
```

### Environment Variables Example
```env
# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Email
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password

# Recipients
DEFAULT_EMAIL_RECIPIENTS=admin@company.com,alerts@company.com
DAILY_SUMMARY_RECIPIENTS=management@company.com

# Security
JWT_SECRET=your-secret-key-here
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-validation`
3. Make your changes
4. Add tests for new functionality
5. Run tests: `npm test` and `pytest`
6. Commit changes: `git commit -m "Add new validation type"`
7. Push to branch: `git push origin feature/new-validation`
8. Create a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- Check the [documentation](docs/) for detailed guides
- Open an issue for bug reports or feature requests
- Review existing issues before creating new ones

## 🔄 Changelog

### v1.0.0 (Initial Release)
- Complete dashboard implementation
- Multiple validation types
- Email notification system
- GitHub Actions workflows
- React frontend with Material-UI
- FastAPI backend with Supabase integration
