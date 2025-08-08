"""
API routes for validation and dashboard endpoints
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from typing import List, Dict, Any, Optional
import json
from datetime import datetime

from ..database.connection import get_supabase_client
from ..validators.idx_financial_validator import IDXFinancialValidator
from ..notifications.email_service import EmailService

validation_router = APIRouter()
dashboard_router = APIRouter()

@validation_router.get("/tables")
async def get_tables():
    """Get list of available tables for validation"""
    try:
        supabase = get_supabase_client()
        # IDX financial tables for validation
        idx_tables = [
            {
                "name": "idx_combine_financials_annual", 
                "description": "Annual financial data - Revenue, earnings, assets validation",
                "validation_type": "Financial Performance (Annual)",
                "rules": "Change >50% vs average change per year"
            },
            {
                "name": "idx_combine_financials_quarterly", 
                "description": "Quarterly financial data - Revenue, earnings, assets validation", 
                "validation_type": "Financial Performance (Quarterly)",
                "rules": "Change >50% vs average change per quarter"
            },
            {
                "name": "idx_daily_data", 
                "description": "Daily stock price data - Price movement monitoring (last 7 days)",
                "validation_type": "Price Movement Monitoring", 
                "rules": "Close price change >35% in last 7 days"
            },
            {
                "name": "idx_dividend", 
                "description": "Dividend data - Yield analysis and changes",
                "validation_type": "Dividend Yield Analysis",
                "rules": "Average yield ≥30% or yield change ≥10% per year"
            },
            {
                "name": "idx_all_time_price", 
                "description": "All-time price data - Price consistency validation",
                "validation_type": "Price Consistency Check",
                "rules": "Price hierarchy consistency (90d < YTD < 52w < all-time)"
            },
            {
                "name": "idx_filings", 
                "description": "Filing price validation against daily prices",
                "validation_type": "Filing Price Validation",
                "rules": "Filing price difference ≥50% vs daily close price"
            },
            {
                "name": "idx_stock_split", 
                "description": "Stock split timing validation",
                "validation_type": "Stock Split Analysis",
                "rules": "Multiple stock splits within 2 weeks for same symbol"
            }
        ]
        
        # Get last validation times from database
        for table in idx_tables:
            try:
                response = supabase.table("validation_results").select("validation_timestamp").eq("table_name", table["name"]).order("validation_timestamp", desc=True).limit(1).execute()
                if response.data:
                    table["last_validated"] = response.data[0]["validation_timestamp"]
                else:
                    table["last_validated"] = None
            except Exception:
                table["last_validated"] = None
        
        return {"tables": idx_tables}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@validation_router.post("/run/{table_name}")
async def run_validation(table_name: str):
    """Run validation for a specific table"""
    try:
        validator = IDXFinancialValidator()
        result = await validator.validate_table(table_name)
        
        # Send email if anomalies detected
        if result.get("anomalies_count", 0) > 0:
            email_service = EmailService()
            await email_service.send_anomaly_alert(table_name, result)
        
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dashboard_router.get("/results")
async def get_validation_results(
    table_name: Optional[str] = Query(None, description="Filter by table name"),
    limit: int = Query(10, ge=1, le=100, description="Number of results to return")
):
    """Get validation results with fallback to local storage"""
    try:
        # Try to get from database first
        supabase = get_supabase_client()
        query = supabase.table("validation_results").select("*").order("validation_timestamp", desc=True).limit(limit)
        
        if table_name:
            query = query.eq("table_name", table_name)
        
        response = query.execute()
        
        if response.data:
            return {"status": "success", "data": response.data, "source": "database"}
            
    except Exception as db_error:
        print(f"⚠️  Database query failed: {db_error}")
    
    # Fallback to local storage
    try:
        from app.validators.data_validator import DataValidator
        validator = DataValidator()
        local_results = validator.get_stored_validation_results()
        
        # Filter by table_name if specified
        if table_name:
            local_results = [r for r in local_results if r.get("table_name") == table_name]
        
        # Apply limit
        local_results = local_results[:limit]
        
        return {
            "status": "success", 
            "data": local_results, 
            "source": "local_storage",
            "message": "Using local storage - database unavailable"
        }
        
    except Exception as local_error:
        print(f"⚠️  Local storage also failed: {local_error}")
        return {
            "status": "error", 
            "message": "Both database and local storage unavailable",
            "data": []
        }

@dashboard_router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        supabase = get_supabase_client()
        
        # Get total IDX tables count
        idx_tables = [
            "idx_combine_financials_annual", "idx_combine_financials_quarterly", 
            "idx_daily_data", "idx_dividend", "idx_all_time_price", 
            "idx_filings", "idx_stock_split"
        ]
        total_tables = len(idx_tables)
        
        # Get today's validations
        from datetime import datetime, timedelta
        today = datetime.now().date()
        response = supabase.table("validation_results").select("*").gte("validation_timestamp", today.isoformat()).execute()
        validated_today = len(set(result["table_name"] for result in response.data)) if response.data else 0
        
        # Get anomalies detected today
        anomalies_detected = sum(result.get("anomalies_count", 0) for result in response.data) if response.data else 0
        
        # Get emails sent today
        email_response = supabase.table("email_logs").select("*").gte("sent_at", today.isoformat()).execute()
        emails_sent = len(email_response.data) if email_response.data else 0
        
        # Get last validation time
        last_validation_response = supabase.table("validation_results").select("validation_timestamp").order("validation_timestamp", desc=True).limit(1).execute()
        last_validation = last_validation_response.data[0]["validation_timestamp"] if last_validation_response.data else None
        
        stats = {
            "total_tables": total_tables,
            "validated_today": validated_today,
            "anomalies_detected": anomalies_detected,
            "emails_sent": emails_sent,
            "last_validation": last_validation
        }
        return stats
    except Exception as e:
        # Fallback to default stats if database query fails
        stats = {
            "total_tables": 7,
            "validated_today": 0,
            "anomalies_detected": 0,
            "emails_sent": 0,
            "last_validation": None
        }
        return stats

@dashboard_router.get("/charts/validation-trends")
async def get_validation_trends():
    """Get validation trends data for charts"""
    try:
        supabase = get_supabase_client()
        from datetime import datetime, timedelta
        
        # Get last 7 days of validation data
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)
        
        dates = []
        validations = []
        anomalies = []
        
        for i in range(7):
            current_date = start_date + timedelta(days=i)
            dates.append(current_date.isoformat())
            
            # Get validations for this date
            response = supabase.table("validation_results").select("*").gte("validation_timestamp", current_date.isoformat()).lt("validation_timestamp", (current_date + timedelta(days=1)).isoformat()).execute()
            
            daily_validations = len(response.data) if response.data else 0
            daily_anomalies = sum(result.get("anomalies_count", 0) for result in response.data) if response.data else 0
            
            validations.append(daily_validations)
            anomalies.append(daily_anomalies)
        
        trends = {
            "dates": dates,
            "validations": validations,
            "anomalies": anomalies
        }
        return trends
    except Exception as e:
        # Fallback to mock data if database query fails
        from datetime import datetime, timedelta
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=6)
        dates = [(start_date + timedelta(days=i)).isoformat() for i in range(7)]
        
        trends = {
            "dates": dates,
            "validations": [0] * 7,
            "anomalies": [0] * 7
        }
        return trends

@validation_router.get("/config/{table_name}")
async def get_table_validation_config(table_name: str):
    """Get validation configuration for a specific table"""
    try:
        # IDX table configurations
        idx_configs = {
            "idx_combine_financials_annual": {
                "table_name": table_name,
                "validation_type": "Financial Performance (Annual)",
                "description": "Annual financial data validation",
                "rules": {
                    "extreme_change_threshold": 50,
                    "metrics": ["revenue", "earnings", "total_assets", "total_equity", "operating_pnl"],
                    "comparison_method": "year_over_year_percentage",
                    "alert_condition": "absolute change >50% considering average trends"
                }
            },
            "idx_combine_financials_quarterly": {
                "table_name": table_name,
                "validation_type": "Financial Performance (Quarterly)",
                "description": "Quarterly financial data validation",
                "rules": {
                    "extreme_change_threshold": 50,
                    "metrics": ["total_revenue", "earnings", "total_assets", "total_equity", "operating_pnl"],
                    "comparison_method": "quarter_over_quarter_percentage",
                    "alert_condition": "absolute change >50% considering average trends"
                }
            },
            "idx_daily_data": {
                "table_name": table_name,
                "validation_type": "Price Movement Monitoring",
                "description": "Daily stock price movement validation",
                "rules": {
                    "price_change_threshold": 35,
                    "time_window": "last_7_days",
                    "metrics": ["close"],
                    "alert_condition": "close price change >35% in last 7 days"
                }
            },
            "idx_dividend": {
                "table_name": table_name,
                "validation_type": "Dividend Yield Analysis",
                "description": "Dividend yield and change validation",
                "rules": {
                    "high_yield_threshold": 30,
                    "yield_change_threshold": 10,
                    "metrics": ["yield", "dividend"],
                    "alert_condition": "average yield ≥30% or yield change ≥10% per year"
                }
            },
            "idx_all_time_price": {
                "table_name": table_name,
                "validation_type": "Price Consistency Check",
                "description": "All-time price data consistency validation",
                "rules": {
                    "hierarchy_check": ["90d_high/low", "ytd_high/low", "52w_high/low", "all_time_high/low"],
                    "metrics": ["price"],
                    "alert_condition": "price hierarchy inconsistency"
                }
            },
            "idx_filings": {
                "table_name": table_name,
                "validation_type": "Filing Price Validation",
                "description": "Filing price vs daily price validation",
                "rules": {
                    "price_difference_threshold": 50,
                    "metrics": ["price"],
                    "alert_condition": "filing price difference ≥50% vs daily close price"
                }
            },
            "idx_stock_split": {
                "table_name": table_name,
                "validation_type": "Stock Split Analysis",
                "description": "Stock split timing validation",
                "rules": {
                    "time_window_threshold": 14,
                    "metrics": ["split_ratio", "date"],
                    "alert_condition": "multiple stock splits within 2 weeks for same symbol"
                }
            }
        }
        
        if table_name in idx_configs:
            return idx_configs[table_name]
        else:
            raise HTTPException(status_code=404, detail=f"Configuration not found for table: {table_name}")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dashboard_router.get("/charts/table-status")
async def get_table_status():
    """Get table validation status for pie chart"""
    try:
        supabase = get_supabase_client()
        from datetime import datetime, timedelta
        
        # Get latest validation results for each IDX table
        idx_tables = [
            "idx_combine_financials_annual", "idx_combine_financials_quarterly", 
            "idx_daily_data", "idx_dividend", "idx_all_time_price", 
            "idx_filings", "idx_stock_split"
        ]
        
        healthy = 0
        warning = 0
        error = 0
        
        for table in idx_tables:
            # Get most recent validation result for this table
            response = supabase.table("validation_results").select("status").eq("table_name", table).order("validation_timestamp", desc=True).limit(1).execute()
            
            if response.data:
                status = response.data[0]["status"]
                if status == "success":
                    healthy += 1
                elif status == "warning":
                    warning += 1
                elif status == "error":
                    error += 1
            else:
                # No validation results yet, consider as needing validation
                healthy += 1
        
        status_data = {
            "healthy": healthy,
            "warning": warning,
            "error": error
        }
        return status_data
    except Exception as e:
        # Fallback to default data if database query fails
        status_data = {
            "healthy": 7,
            "warning": 0,
            "error": 0
        }
        return status_data
