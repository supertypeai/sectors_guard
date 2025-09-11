#!/usr/bin/env python3
"""
Test script to debug validation results API
"""

import requests
import json

# API base URL
BASE_URL = "http://localhost:8000/api"

def test_get_results():
    """Test get validation results endpoint"""
    print("🧪 Testing get validation results")
    
    url = f"{BASE_URL}/dashboard/results"
    
    print(f"📤 GET {url}")
    
    try:
        response = requests.get(url, timeout=10)
        
        print(f"📥 Response Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Success!")
            print(f"   - Status: {data.get('status')}")
            print(f"   - Source: {data.get('source')}")
            
            results = data.get('data', {}).get('results', [])
            print(f"   - Total Results: {len(results)}")
            
            if results:
                print("\n📊 Recent Results:")
                for i, result in enumerate(results[:5]):  # Show first 5
                    print(f"   {i+1}. {result.get('table_name')} - {result.get('status')} ({result.get('anomalies_count', 0)} anomalies)")
                    print(f"      Date: {result.get('validation_timestamp')}")
            else:
                print("   No results found")
        else:
            print(f"❌ Error: {response.text}")
            
    except Exception as e:
        print(f"❌ Request failed: {str(e)}")

def test_database_direct():
    """Test direct database query to check if data exists"""
    print("\n🧪 Testing direct database connection")
    
    try:
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        from app.database.connection import get_supabase_client
        
        supabase = get_supabase_client()
        response = supabase.table("validation_results").select("*").order("validation_timestamp", desc=True).limit(5).execute()
        
        print(f"📊 Direct database query:")
        print(f"   - Found {len(response.data)} records")
        
        if response.data:
            print("\n📋 Sample Records:")
            for i, record in enumerate(response.data):
                print(f"   {i+1}. {record.get('table_name')} - {record.get('status')}")
                print(f"      ID: {record.get('id')}, Date: {record.get('validation_timestamp')}")
        
    except Exception as e:
        print(f"❌ Database test failed: {str(e)}")

if __name__ == "__main__":
    print("🔍 Debugging Validation Results API")
    print("=" * 40)
    
    test_database_direct()
    test_get_results()
    
    print("\n✅ Testing completed!")
