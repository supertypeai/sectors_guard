"""
Debug script to reproduce the KeyError 'date' issue when calling validator in different ways
This helps identify where the discrepancy lies between direct validator calls vs API/backend calls
"""
import asyncio
import sys
import os
import json

sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.validators.idx_financial_validator import IDXFinancialValidator

async def test_different_call_patterns():
    print("🔍 Testing different validator call patterns to identify KeyError 'date' source")
    print("=" * 70)
    
    validator = IDXFinancialValidator()
    
    # Test 1: Direct call to validate_table without date parameters (like validate_idx.py does)
    print("\n1️⃣  Test 1: validate_table('idx_dividend') - NO date params (like validate_idx.py)")
    try:
        result1 = await validator.validate_table('idx_dividend')
        print(f"   ✅ Success: Status={result1.get('status')}, Anomalies={result1.get('anomalies_count', 0)}")
        if result1.get('anomalies'):
            for anomaly in result1.get('anomalies', []):
                if 'Error validating dividend data' in anomaly.get('message', ''):
                    print(f"   🚨 FOUND THE ERROR: {anomaly}")
                    break
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test 2: Call with date range that user reported as problematic
    print("\n2️⃣  Test 2: validate_table('idx_dividend') WITH date range 2020-2022")
    try:
        result2 = await validator.validate_table('idx_dividend', start_date='2020-01-01', end_date='2022-06-30')
        print(f"   ✅ Success: Status={result2.get('status')}, Anomalies={result2.get('anomalies_count', 0)}")
        if result2.get('anomalies'):
            for anomaly in result2.get('anomalies', []):
                if 'Error validating dividend data' in anomaly.get('message', ''):
                    print(f"   🚨 FOUND THE ERROR: {anomaly}")
                    break
    except Exception as e:
        print(f"   ❌ Exception: {e}")
    
    # Test 3: Call _validate_dividend directly with fetched data (like debug scripts do)
    print("\n3️⃣  Test 3: Direct call to _validate_dividend with fetched data")
    try:
        # Fetch data using the same method that validate_table uses
        data, applied_start, applied_end = await validator._fetch_table_data_with_filter('idx_dividend', '2020-01-01', '2022-06-30')
        print(f"   📊 Fetched {len(data)} rows with columns: {list(data.columns) if not data.empty else 'EMPTY'}")
        
        if not data.empty:
            result3 = await validator._validate_dividend(data)
            print(f"   ✅ _validate_dividend Success: {len(result3.get('anomalies', []))} anomalies")
            if result3.get('anomalies'):
                for anomaly in result3.get('anomalies', []):
                    if 'Error validating dividend data' in anomaly.get('message', ''):
                        print(f"   🚨 FOUND THE ERROR: {anomaly}")
                        break
        else:
            print("   ⚠️  No data fetched - this might be the issue!")
            
    except Exception as e:
        print(f"   ❌ Exception in direct _validate_dividend: {e}")
    
    # Test 4: Check what happens with different date ranges
    print("\n4️⃣  Test 4: Try different problematic date ranges")
    date_ranges = [
        ('2020-01-01', '2021-12-31'),
        ('2021-01-01', '2022-06-30'),
        ('2020-07-01', '2022-01-31')
    ]
    
    for start_date, end_date in date_ranges:
        try:
            print(f"   📅 Testing range {start_date} to {end_date}")
            result = await validator.validate_table('idx_dividend', start_date=start_date, end_date=end_date)
            print(f"      ✅ Success: Status={result.get('status')}, Anomalies={result.get('anomalies_count', 0)}")
            if result.get('anomalies'):
                for anomaly in result.get('anomalies', []):
                    if 'Error validating dividend data' in anomaly.get('message', ''):
                        print(f"      🚨 FOUND THE ERROR IN RANGE {start_date}-{end_date}: {anomaly}")
                        break
        except Exception as e:
            print(f"      ❌ Exception in range {start_date}-{end_date}: {e}")
    
    # Test 5: Test with empty date params vs None date params
    print("\n5️⃣  Test 5: Different ways of calling without date filters")
    try:
        print("   📞 Calling with start_date=None, end_date=None explicitly")
        result5a = await validator.validate_table('idx_dividend', start_date=None, end_date=None)
        print(f"      ✅ Success: {len(result5a.get('anomalies', []))} anomalies")
        
        print("   📞 Calling without any date parameters (like validate_idx.py)")
        result5b = await validator.validate_table('idx_dividend')
        print(f"      ✅ Success: {len(result5b.get('anomalies', []))} anomalies")
        
    except Exception as e:
        print(f"      ❌ Exception: {e}")
    
    print("\n" + "="*70)
    print("🏁 Test completed. Check above output for any '🚨 FOUND THE ERROR' messages")

if __name__ == '__main__':
    asyncio.run(test_different_call_patterns())
