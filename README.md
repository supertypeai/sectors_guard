# Sectors Guard

A comprehensive data validation dashboard with automated anomaly detection and email notifications. This application monitors data quality across multiple tables in Supabase and provides real-time insights through an interactive dashboard.

## 🚀 Quick Start

### 1. Clone and Setup
```bash
git clone <repository-url>
cd idx_data_validation
```

### 2. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp ../.env.example .env  # Edit with your configurations
python main.py
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 4. Access the Dashboard
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 📊 Features

- **Multi-Table Validation**: Different validation approaches for different table types
- **Real-time Monitoring**: Live dashboard with charts and statistics
- **Automated Alerts**: Email notifications when anomalies are detected
- **Scheduled Workflows**: GitHub Actions for periodic validation
- **Configurable Rules**: Customize validation rules per table
- **Daily Reports**: Automated daily summary emails

## 🏗️ Project Structure

```
├── backend/              # Python FastAPI backend
│   ├── app/
│   │   ├── api/         # API routes and endpoints
│   │   ├── validators/  # Data validation engines
│   │   ├── notifications/ # Email notification service
│   │   └── database/    # Database models and connections
│   └── tests/           # Backend tests
├── frontend/            # React frontend
│   ├── src/
│   │   ├── components/  # Reusable React components
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service layer
│   │   └── utils/       # Utility functions
│   └── public/          # Static assets
├── .github/workflows/   # GitHub Actions for automation
└── docs/                # Detailed documentation
```

## 🔧 Configuration

### Environment Variables
Copy `.env.example` to `.env` and configure:

```env
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
SMTP_USERNAME=your-email@gmail.com
SMTP_PASSWORD=your-app-password
DEFAULT_EMAIL_RECIPIENTS=admin@company.com
```

### Database Setup
Run these SQL commands in your Supabase SQL editor:

```sql
-- Create validation results table
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

-- Create validation configs table
CREATE TABLE validation_configs (
    id SERIAL PRIMARY KEY,
    table_name VARCHAR NOT NULL UNIQUE,
    validation_rules JSONB NOT NULL,
    email_recipients JSONB,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Create email logs table
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

## 🤖 Automated Workflows

The application includes GitHub Actions workflows for:

1. **Periodic Validation** (`data-validation.yml`)
   - Runs every hour during business hours
   - Validates all configured tables
   - Sends alerts for anomalies

2. **Daily Summary** (`daily-summary.yml`)
   - Generates daily reports
   - Sends summary emails to management

3. **Deployment** (`deploy.yml`)
   - Automated testing and deployment
   - Runs on push to main branch

## 📚 Documentation

For detailed setup instructions, API documentation, and usage guides, see the [docs/README.md](docs/README.md) file.

## 🧪 Testing

Run backend tests:
```bash
cd backend
python -m pytest tests/ -v
```

Run frontend tests:
```bash
cd frontend
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.