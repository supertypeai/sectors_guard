#!/usr/bin/env python3
"""
Simple test script to validate IDX data validation integration
"""

import asyncio
import json
from datetime import datetime

# Add the app directory to the Python path
import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.validators.idx_financial_validator import IDXFinancialValidator
from app.notifications.email_service import EmailService

async def test_validator():
    """Test the IDX financial validator"""
    print("=== Testing IDX Financial Validator ===")
    
    validator = IDXFinancialValidator()
    
    # Test available tables
    test_tables = [
        "idx_combine_financials_annual",
        "idx_combine_financials_quarterly", 
        "idx_daily_data",
        "idx_dividend",
        "idx_all_time_price",
        "idx_filings",
        "idx_stock_split"
    ]
    
    print(f"Available IDX tables: {list(validator.idx_tables.keys())}")
    
    # Test each table validation
    for table_name in test_tables:
        print(f"\n--- Testing {table_name} ---")
        try:
            result = await validator.validate_table(table_name)
            print(f"Status: {result.get('status')}")
            print(f"Total rows: {result.get('total_rows', 0)}")
            print(f"Anomalies count: {result.get('anomalies_count', 0)}")
            
            if result.get('anomalies'):
                print("Sample anomalies:")
                for i, anomaly in enumerate(result['anomalies'][:3]):  # Show first 3
                    print(f"  {i+1}. {anomaly.get('type', 'Unknown')}: {anomaly.get('message', 'No message')[:100]}...")
            
        except Exception as e:
            print(f"Error testing {table_name}: {e}")
    
    print("\n=== Validator test completed ===")

async def test_email_service():
    """Test the email service"""
    print("\n=== Testing Email Service ===")
    
    email_service = EmailService()
    
    # Mock validation results
    mock_results = {
        "id": 1,
        "table_name": "idx_daily_data",
        "status": "warning",
        "total_rows": 1000,
        "anomalies_count": 2,
        "validation_timestamp": datetime.now().isoformat(),
        "validations_performed": ["idx_daily_validation"],
        "anomalies": [
            {
                "type": "extreme_daily_price_change",
                "symbol": "BBCA.JK",
                "date": "2025-08-08",
                "close_price": 8500.0,
                "price_change_pct": 45.2,
                "message": "Symbol BBCA.JK on 2025-08-08: Close price changed by 45.2%",
                "severity": "warning"
            },
            {
                "type": "extreme_daily_price_change", 
                "symbol": "BMRI.JK",
                "date": "2025-08-08",
                "close_price": 4200.0,
                "price_change_pct": -38.1,
                "message": "Symbol BMRI.JK on 2025-08-08: Close price changed by -38.1%",
                "severity": "warning"
            }
        ]
    }
    
    # Note: This won't actually send emails without proper SMTP configuration
    print("Mock email alert test (would require SMTP configuration to actually send):")
    print(f"Table: {mock_results['table_name']}")
    print(f"Anomalies: {mock_results['anomalies_count']}")
    print(f"Status: {mock_results['status']}")
    
    # Test HTML email generation
    html_body = email_service._generate_html_email("idx_daily_data", mock_results)
    print(f"Generated HTML email (length: {len(html_body)} chars)")
    
    # Test text email generation
    text_body = email_service._generate_text_email("idx_daily_data", mock_results)
    print(f"Generated text email (length: {len(text_body)} chars)")
    
    print("=== Email service test completed ===")

async def main():
    """Run all tests"""
    print("IDX Data Validation Integration Test")
    print("====================================")
    
    await test_validator()
    await test_email_service()
    
    print("\n🎉 Integration test completed!")
    print("\nNext steps:")
    print("1. Set up environment variables for email configuration")
    print("2. Configure Supabase connection details")
    print("3. Run the backend: python -m uvicorn app.main:app --reload")
    print("4. Start the frontend: npm start")
    print("5. Access the dashboard at http://localhost:3000")

if __name__ == "__main__":
    asyncio.run(main())
