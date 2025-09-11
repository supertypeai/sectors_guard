#!/usr/bin/env python3
"""
Test script for date filter functionality
"""

import asyncio
import sys
import os

# Add the parent directory to the path to import modules
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.validators.idx_financial_validator import IDXFinancialValidator

async def test_date_filter():
    """Test the date filter functionality"""
    
    print("🧪 Testing Date Filter Functionality")
    print("=" * 50)
    
    validator = IDXFinancialValidator()
    table_name = "idx_daily_data"  # Use daily data for testing
    
    # Test 1: No filter (all data)
    print("\n📊 Test 1: Fetching all data (no filter)")
    result1 = await validator._fetch_table_data_with_filter(table_name)
    print(f"Result: {len(result1)} rows")
    
    # Test 2: Start date filter only
    print("\n📊 Test 2: Fetching data with start date filter (2024-01-01)")
    result2 = await validator._fetch_table_data_with_filter(table_name, start_date="2024-01-01")
    print(f"Result: {len(result2)} rows")
    
    # Test 3: End date filter only  
    print("\n📊 Test 3: Fetching data with end date filter (2024-12-31)")
    result3 = await validator._fetch_table_data_with_filter(table_name, end_date="2024-12-31")
    print(f"Result: {len(result3)} rows")
    
    # Test 4: Both start and end date filters
    print("\n📊 Test 4: Fetching data with both filters (2024-01-01 to 2024-12-31)")
    result4 = await validator._fetch_table_data_with_filter(table_name, start_date="2024-01-01", end_date="2024-12-31")
    print(f"Result: {len(result4)} rows")
    
    # Test 5: Recent date range
    print("\n📊 Test 5: Fetching recent data (2024-08-01 to 2024-09-04)")
    result5 = await validator._fetch_table_data_with_filter(table_name, start_date="2024-08-01", end_date="2024-09-04")
    print(f"Result: {len(result5)} rows")
    
    # Test validation with filter
    print("\n🔍 Test 6: Running full validation with date filter")
    validation_result = await validator.validate_table(table_name, start_date="2024-08-01", end_date="2024-09-04")
    print(f"Validation Status: {validation_result.get('status')}")
    print(f"Total Rows: {validation_result.get('total_rows')}")
    print(f"Anomalies: {validation_result.get('anomalies_count', 0)}")
    print(f"Date Filter Applied: {validation_result.get('date_filter')}")
    
    print("\n✅ Date filter testing completed!")

if __name__ == "__main__":
    asyncio.run(test_date_filter())
