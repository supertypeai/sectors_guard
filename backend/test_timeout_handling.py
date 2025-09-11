"""
Test script untuk menguji timeout handling pada IDX validator
"""

import asyncio
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.validators.idx_financial_validator import IDXFinancialValidator
from datetime import datetime

async def test_timeout_handling():
    """Test various scenarios that might cause timeout"""
    
    print("🧪 Testing IDX Financial Validator Timeout Handling")
    print("=" * 60)
    
    validator = IDXFinancialValidator()
    
    # Test 1: Validate a simple table
    print("\n1️⃣ Testing simple table validation...")
    try:
        result = await validator.validate_table("idx_combine_financials_annual")
        print(f"✅ Result: {result['status']}")
        print(f"   - Anomalies: {result['anomalies_count']}")
        print(f"   - Total rows: {result.get('total_rows', 'unknown')}")
        print(f"   - Storage: {'✅ Success' if 'validation_timestamp' in result else '⚠️ Local fallback'}")
    except Exception as e:
        print(f"❌ Error: {e}")
    
    # Test 2: Validate multiple tables
    print("\n2️⃣ Testing multiple table validation...")
    tables_to_test = [
        "idx_combine_financials_quarterly",
        "idx_combine_daily_data",
        "idx_combine_dividend"
    ]
    
    for i, table in enumerate(tables_to_test, 1):
        print(f"\n   Testing {i}/{len(tables_to_test)}: {table}")
        try:
            result = await validator.validate_table(table)
            print(f"   ✅ {result['status']} - {result['anomalies_count']} anomalies")
        except Exception as e:
            print(f"   ❌ Error: {e}")
        
        # Small delay between validations
        await asyncio.sleep(0.5)
    
    # Test 3: Check local storage
    print("\n3️⃣ Testing local storage retrieval...")
    try:
        local_results = validator.get_stored_validation_results()
        print(f"✅ Local storage: {len(local_results)} results found")
        
        if local_results:
            latest = local_results[0]
            print(f"   - Latest: {latest.get('table_name')} ({latest.get('validation_timestamp')})")
            
    except Exception as e:
        print(f"❌ Local storage error: {e}")
    
    print("\n" + "=" * 60)
    print("🏁 Test completed!")

if __name__ == "__main__":
    # Set event loop policy untuk Windows
    if sys.platform.startswith('win'):
        asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())
    
    asyncio.run(test_timeout_handling())
