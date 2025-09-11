#!/usr/bin/env python3
"""
Debug script untuk testing insert data ke validation_results table
"""

import asyncio
import json
import sys
import os
from datetime import datetime

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'app'))

from app.database.connection import get_supabase_client

async def test_supabase_connection():
    """Test basic Supabase connection"""
    print("🔍 Testing Supabase connection...")
    try:
        supabase = get_supabase_client()
        
        # Test basic connection
        response = supabase.table('idx_dividend').select("*").limit(1).execute()
        print(f"✅ Supabase connection successful")
        print(f"📊 Test query returned {len(response.data)} rows")
        return True
    except Exception as e:
        print(f"❌ Supabase connection failed: {e}")
        return False

async def test_validation_results_table():
    """Test if validation_results table exists and is accessible"""
    print("\n🔍 Testing validation_results table...")
    try:
        supabase = get_supabase_client()
        
        # Try to select from table
        response = supabase.table('validation_results').select("*").limit(1).execute()
        print(f"✅ validation_results table exists")
        print(f"📊 Current rows in table: {len(response.data)}")
        
        # Check table structure by getting one row (if exists)
        if response.data:
            print(f"📋 Sample row columns: {list(response.data[0].keys())}")
        
        return True
    except Exception as e:
        print(f"❌ validation_results table error: {e}")
        print("💡 Table may not exist or have wrong structure")
        return False

async def test_simple_insert():
    """Test simple insert to validation_results"""
    print("\n🔍 Testing simple insert...")
    try:
        supabase = get_supabase_client()
        
        # Prepare minimal test data
        test_data = {
            "table_name": "test_table",
            "status": "success",
            "total_rows": 100,
            "anomalies_count": 0,
            "anomalies": [],
            "validations_performed": ["test_validation"],
            "validation_timestamp": datetime.now().isoformat()
        }
        
        print(f"📝 Inserting test data: {test_data}")
        
        # Try insert with timeout
        response = supabase.table("validation_results").insert(test_data).execute()
        
        print(f"✅ Simple insert successful")
        print(f"📊 Inserted data: {response.data}")
        
        # Clean up - delete the test row
        if response.data:
            test_id = response.data[0]['id']
            delete_response = supabase.table("validation_results").delete().eq('id', test_id).execute()
            print(f"🗑️ Cleaned up test data")
        
        return True
    except Exception as e:
        print(f"❌ Simple insert failed: {e}")
        return False

async def test_complex_insert():
    """Test insert with complex anomalies data (like real validation results)"""
    print("\n🔍 Testing complex insert (with anomalies)...")
    try:
        supabase = get_supabase_client()
        
        # Prepare complex test data (similar to real validation results)
        complex_anomalies = [
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
                "type": "extreme_annual_change",
                "symbol": "BMRI.JK",
                "metric": "revenue",
                "years_affected": [2023, 2024],
                "extreme_pct_changes": [67.5, -45.2],
                "avg_abs_change": 25.3,
                "message": "Symbol BMRI.JK: revenue shows extreme annual changes",
                "severity": "warning"
            }
        ]
        
        test_data = {
            "table_name": "idx_daily_data",
            "status": "warning",
            "total_rows": 5000,
            "anomalies_count": 2,
            "anomalies": complex_anomalies,
            "validations_performed": ["idx_daily_validation"],
            "validation_timestamp": datetime.now().isoformat()
        }
        
        print(f"📝 Inserting complex data...")
        print(f"   - Table: {test_data['table_name']}")
        print(f"   - Anomalies count: {test_data['anomalies_count']}")
        print(f"   - Anomalies size: {len(json.dumps(complex_anomalies))} chars")
        
        # Try insert
        response = supabase.table("validation_results").insert(test_data).execute()
        
        print(f"✅ Complex insert successful")
        print(f"📊 Inserted row ID: {response.data[0]['id'] if response.data else 'Unknown'}")
        
        # Clean up
        if response.data:
            test_id = response.data[0]['id']
            delete_response = supabase.table("validation_results").delete().eq('id', test_id).execute()
            print(f"🗑️ Cleaned up test data")
        
        return True
    except Exception as e:
        print(f"❌ Complex insert failed: {e}")
        return False

async def test_batch_insert():
    """Test multiple inserts to see if there's a performance issue"""
    print("\n🔍 Testing batch insert performance...")
    try:
        supabase = get_supabase_client()
        
        # Prepare batch data
        batch_data = []
        for i in range(5):
            data = {
                "table_name": f"test_batch_{i}",
                "status": "success",
                "total_rows": 1000 + i,
                "anomalies_count": i,
                "anomalies": [{"type": "test", "message": f"Test anomaly {i}"}] if i > 0 else [],
                "validations_performed": ["batch_test"],
                "validation_timestamp": datetime.now().isoformat()
            }
            batch_data.append(data)
        
        print(f"📝 Inserting batch of {len(batch_data)} records...")
        
        start_time = datetime.now()
        response = supabase.table("validation_results").insert(batch_data).execute()
        end_time = datetime.now()
        
        duration = (end_time - start_time).total_seconds()
        print(f"✅ Batch insert successful in {duration:.2f} seconds")
        print(f"📊 Inserted {len(response.data)} rows")
        
        # Clean up
        if response.data:
            ids = [row['id'] for row in response.data]
            for test_id in ids:
                supabase.table("validation_results").delete().eq('id', test_id).execute()
            print(f"🗑️ Cleaned up {len(ids)} test records")
        
        return True
    except Exception as e:
        print(f"❌ Batch insert failed: {e}")
        return False

async def test_large_anomaly_data():
    """Test insert with very large anomaly data to find size limits"""
    print("\n🔍 Testing large anomaly data...")
    try:
        supabase = get_supabase_client()
        
        # Create large anomalies data
        large_anomalies = []
        for i in range(100):  # 100 anomalies
            anomaly = {
                "type": f"test_anomaly_{i}",
                "symbol": f"TEST{i:03d}.JK",
                "message": f"This is test anomaly number {i} with some detailed message explaining what went wrong in the validation process. " * 5,  # Long message
                "severity": "warning",
                "details": {
                    "metric": "test_metric",
                    "values": list(range(10)),  # Array of values
                    "metadata": f"Additional metadata for anomaly {i}"
                }
            }
            large_anomalies.append(anomaly)
        
        test_data = {
            "table_name": "test_large_data",
            "status": "warning",
            "total_rows": 10000,
            "anomalies_count": len(large_anomalies),
            "anomalies": large_anomalies,
            "validations_performed": ["large_data_test"],
            "validation_timestamp": datetime.now().isoformat()
        }
        
        anomalies_json = json.dumps(large_anomalies)
        print(f"📝 Testing insert with large anomaly data...")
        print(f"   - Anomalies count: {len(large_anomalies)}")
        print(f"   - JSON size: {len(anomalies_json)} characters")
        print(f"   - JSON size: {len(anomalies_json.encode('utf-8'))} bytes")
        
        start_time = datetime.now()
        response = supabase.table("validation_results").insert(test_data).execute()
        end_time = datetime.now()
        
        duration = (end_time - start_time).total_seconds()
        print(f"✅ Large data insert successful in {duration:.2f} seconds")
        
        # Clean up
        if response.data:
            test_id = response.data[0]['id']
            supabase.table("validation_results").delete().eq('id', test_id).execute()
            print(f"🗑️ Cleaned up test data")
        
        return True
    except Exception as e:
        print(f"❌ Large data insert failed: {e}")
        return False

async def main():
    """Run all debug tests"""
    print("🚀 IDX Data Validation - Insert Debug Tests")
    print("=" * 50)
    
    # Run tests in sequence
    tests = [
        ("Supabase Connection", test_supabase_connection),
        ("Table Structure", test_validation_results_table),
        ("Simple Insert", test_simple_insert),
        ("Complex Insert", test_complex_insert),
        ("Batch Insert", test_batch_insert),
        ("Large Data Insert", test_large_anomaly_data)
    ]
    
    results = {}
    for test_name, test_func in tests:
        print(f"\n{'='*20} {test_name} {'='*20}")
        try:
            results[test_name] = await test_func()
        except Exception as e:
            print(f"❌ Test '{test_name}' crashed: {e}")
            results[test_name] = False
    
    # Summary
    print(f"\n{'='*50}")
    print("📋 Test Results Summary:")
    print(f"{'='*50}")
    
    passed = 0
    total = len(tests)
    
    for test_name, result in results.items():
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Overall: {passed}/{total} tests passed")
    
    # Recommendations
    print(f"\n💡 Recommendations:")
    if not results.get("Supabase Connection"):
        print("   - Check SUPABASE_URL and SUPABASE_KEY environment variables")
    if not results.get("Table Structure"):
        print("   - Create validation_results table using the SQL provided earlier")
    if not results.get("Simple Insert"):
        print("   - Check table permissions and RLS policies")
    if not results.get("Large Data Insert"):
        print("   - Consider reducing anomaly data size or implementing pagination")
    
    print(f"\n🏁 Debug completed!")

if __name__ == "__main__":
    asyncio.run(main())
