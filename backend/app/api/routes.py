"""
API routes for validation and dashboard endpoints
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List, Dict, Any
import json

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
        tables = [
            {"name": "idx_combine_financials_annual", "last_validated": "2025-08-05T10:00:00Z", "description": "Annual financial data"},
            {"name": "idx_combine_financials_quarterly", "last_validated": "2025-08-05T09:30:00Z", "description": "Quarterly financial data"},
            {"name": "idx_daily_data", "last_validated": "2025-08-05T09:45:00Z", "description": "Daily stock price data"},
            {"name": "idx_dividend", "last_validated": "2025-08-05T08:45:00Z", "description": "Dividend data"},
            {"name": "idx_all_time_price", "last_validated": "2025-08-05T08:30:00Z", "description": "All-time price data"}
        ]
        return {"tables": tables}
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

@validation_router.get("/results")
async def get_validation_results():
    """Get recent validation results"""
    try:
        supabase = get_supabase_client()
        # Query validation results from database
        # Mock response for now
        results = [
            {
                "id": 1,
                "table_name": "users",
                "status": "warning",
                "anomalies_count": 5,
                "created_at": "2025-08-05T10:00:00Z"
            }
        ]
        return {"results": results}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dashboard_router.get("/stats")
async def get_dashboard_stats():
    """Get dashboard statistics"""
    try:
        # Mock dashboard statistics
        stats = {
            "total_tables": 15,
            "validated_today": 12,
            "anomalies_detected": 3,
            "emails_sent": 2,
            "last_validation": "2025-08-05T10:00:00Z"
        }
        return stats
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dashboard_router.get("/charts/validation-trends")
async def get_validation_trends():
    """Get validation trends data for charts"""
    try:
        # Mock chart data
        trends = {
            "dates": ["2025-08-01", "2025-08-02", "2025-08-03", "2025-08-04", "2025-08-05"],
            "validations": [45, 52, 38, 60, 47],
            "anomalies": [2, 1, 5, 3, 2]
        }
        return trends
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@dashboard_router.get("/charts/table-status")
async def get_table_status():
    """Get table validation status for pie chart"""
    try:
        # Mock pie chart data
        status = {
            "healthy": 10,
            "warning": 3,
            "error": 2
        }
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
