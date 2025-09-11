#!/usr/bin/env python3
"""
Demo script to test the validation API endpoints with date filters
"""

import requests
import json
from datetime import datetime

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_single_validation():
    """Test single table validation with date filter"""
    print("🧪 Testing single table validation with date filter")
    
    table_name = "idx_daily_data"
    start_date = "2024-08-01"
    end_date = "2024-09-04"
    
    url = f"{BASE_URL}/validation/run/{table_name}"
    params = {
        "start_date": start_date,
        "end_date": end_date
    }
    
    print(f"📤 POST {url}")
    print(f"📅 Params: {params}")
    
    try:
        response = requests.post(url, params=params, timeout=30)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"   - Table: {data.get('table_name')}")
            print(f"   - Status: {data.get('status')}")
            print(f"   - Total Rows: {data.get('total_rows')}")
            print(f"   - Anomalies: {data.get('anomalies_count', 0)}")
            print(f"   - Date Filter: {data.get('date_filter')}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

def test_run_all_validation():
    """Test run all validation with date filter"""
    print("\n🧪 Testing run all validation with date filter")
    
    start_date = "2024-08-01"
    end_date = "2024-09-04"
    
    url = f"{BASE_URL}/validation/run-all"
    params = {
        "start_date": start_date,
        "end_date": end_date
    }
    
    print(f"📤 POST {url}")
    print(f"📅 Params: {params}")
    
    try:
        response = requests.post(url, params=params, timeout=120)  # Longer timeout for all tables
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"   - Status: {data.get('status')}")
            
            summary = data.get('summary', {})
            print(f"   - Total Tables: {summary.get('total_tables')}")
            print(f"   - Successful: {summary.get('successful_validations')}")
            print(f"   - Total Anomalies: {summary.get('total_anomalies')}")
            
            # Show individual results
            results = data.get('results', [])
            print(f"\n📊 Individual Results:")
            for result in results:
                status = result.get('status')
                anomalies = result.get('anomalies_count', 0)
                table = result.get('table_name', 'Unknown')
                emoji = "✅" if status == "success" else "⚠️" if status == "warning" else "❌"
                print(f"   {emoji} {table}: {status} ({anomalies} anomalies)")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

def test_get_tables():
    """Test getting available tables"""
    print("\n🧪 Testing get tables endpoint")
    
    url = f"{BASE_URL}/validation/tables"
    
    print(f"📤 GET {url}")
    
    try:
        response = requests.get(url, timeout=10)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            tables = data.get('data', {}).get('tables', [])
            print(f"✅ Found {len(tables)} tables:")
            for table in tables:
                print(f"   - {table['name']}: {table['description']}")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

if __name__ == "__main__":
    print("🚀 Testing Date Filter API Endpoints")
    print("=" * 50)
    
    # Test all endpoints
    test_get_tables()
    test_single_validation()
    test_run_all_validation()
    
    print("\n✅ API testing completed!")
