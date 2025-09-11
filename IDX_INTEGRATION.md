# IDX Data Validation Integration

This update integrates the IDX financial validator with the existing data validation dashboard components.

## Changes Made

### 1. Backend API Updates (`backend/app/api/routes.py`)
- **Updated `/validation/tables`**: Now returns IDX-specific tables with detailed descriptions and validation rules
- **Updated `/validation/results`**: Fetches real validation results from database with anomaly details
- **Updated `/dashboard/stats`**: Calculates real statistics from IDX table validations
- **Updated `/dashboard/charts/*`**: Provides real trend and status data from validation results
- **Added `/validation/config/{table_name}`**: New endpoint to get table-specific validation configurations

### 2. Email Service Updates (`backend/app/notifications/email_service.py`)
- **Enhanced subject line**: Now includes anomaly count for better alert visibility
- **IDX-specific content**: Email templates optimized for IDX financial anomaly types

### 3. Frontend Dashboard Updates (`frontend/src/pages/Dashboard.js`)
- **IDX tables overview**: Updated table list with detailed validation rules and descriptions
- **Enhanced display**: Shows validation rules for each table type
- **Better categorization**: Financial data vs market data validation rules

### 4. Frontend Validation Results Updates (`frontend/src/pages/ValidationResults.js`)
- **Enhanced anomaly display**: Shows IDX-specific anomaly details (symbols, metrics, changes)
- **Better formatting**: Improved layout for financial data anomalies
- **Severity indicators**: Visual distinction between warning and error anomalies

### 5. Frontend Configuration Updates (`frontend/src/pages/TableConfiguration.js`)
- **IDX table focus**: Configuration interface specifically for IDX tables
- **Live configuration**: Fetches real validation rules and displays them
- **Table overview**: Visual cards showing all IDX tables and their rules

### 6. API Service Updates (`frontend/src/services/api.js`)
- **New endpoint**: Added `getTableConfig` for fetching table configurations

## IDX Validation Rules Implemented

### Financial Data Tables
1. **Annual Financial Data** (`idx_combine_financials_annual`)
   - Rule: Alert if absolute change > 50% vs average change pattern
   - Metrics: revenue, earnings, total_assets, total_equity, operating_pnl

2. **Quarterly Financial Data** (`idx_combine_financials_quarterly`)
   - Rule: Alert if absolute change > 50% vs average change pattern
   - Metrics: total_revenue, earnings, total_assets, total_equity, operating_pnl

### Market Data Tables
3. **Daily Price Data** (`idx_daily_data`)
   - Rule: Monitor close price changes >35% in last 7 days
   - Metrics: close price

4. **Dividend Data** (`idx_dividend`)
   - Rule: Flag average yield ≥30% or yield change ≥10% per year
   - Metrics: yield, dividend

5. **All-Time Price Data** (`idx_all_time_price`)
   - Rule: Validate price hierarchy consistency (90d < YTD < 52w < all-time)
   - Metrics: price across time periods

6. **Filing Data** (`idx_filings`)
   - Rule: Compare filing prices with daily close prices (≥50% difference)
   - Metrics: filing price vs daily close

7. **Stock Split Data** (`idx_stock_split`)
   - Rule: Detect multiple stock splits within 2 weeks for same symbol
   - Metrics: split timing and frequency

## Testing

Run the integration test:

```bash
cd backend
python test_integration.py
```

## Setup and Usage

### 1. Backend Setup
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env  # Configure your environment variables
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm start
```

### 3. Environment Variables
Configure these in your `.env` file:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
SMTP_SERVER=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email
SMTP_PASSWORD=your_app_password
FROM_EMAIL=your_email
DEFAULT_EMAIL_RECIPIENTS=recipient1@example.com,recipient2@example.com
```

### 4. Database Tables Required
Ensure these tables exist in your Supabase database:
- `validation_results` - Stores validation run results
- `email_logs` - Stores email sending logs
- `validation_configs` - Stores table-specific configurations
- IDX tables: `idx_combine_financials_annual`, `idx_combine_financials_quarterly`, `idx_daily_data`, `idx_dividend`, `idx_all_time_price`, `idx_filings`, `idx_stock_split`

## API Endpoints

### Validation Endpoints
- `GET /api/validation/tables` - Get all IDX tables with configurations
- `POST /api/validation/run/{table_name}` - Run validation on specific table
- `GET /api/validation/results` - Get recent validation results
- `GET /api/validation/config/{table_name}` - Get table configuration

### Dashboard Endpoints
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/charts/validation-trends` - Get validation trends
- `GET /api/dashboard/charts/table-status` - Get table status distribution

## Features

✅ **IDX-Specific Validations**: Custom algorithms for Indonesian financial data
✅ **Real-time Monitoring**: Live dashboard with IDX table status
✅ **Smart Alerting**: Email notifications with detailed anomaly information
✅ **Configurable Rules**: Table-specific validation parameters
✅ **Comprehensive Reporting**: Detailed anomaly analysis and trends
✅ **Professional UI**: Material-UI based dashboard with IDX branding

## Next Steps

1. Configure your Supabase database connection
2. Set up email SMTP configuration
3. Load your IDX financial data into the respective tables
4. Run validation tests and monitor results
5. Customize email recipients per table as needed
6. Set up scheduled validation runs for continuous monitoring
