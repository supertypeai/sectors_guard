#!/usr/bin/env python3
"""
Quick test script for the fixed validator
"""
import pandas as pd
import numpy as np
from app.validators.idx_financial_validator import IDXFinancialValidator
import asyncio

async def test_improved_validator():
    """Test the improved validator with less false positives"""
    validator = IDXFinancialValidator()
    
    # Create sample data that would previously trigger false positives
    sample_data = pd.DataFrame({
        'date': ['2020-12-31', '2021-12-31', '2022-12-31', '2023-12-31'],
        'symbol': ['BBCA.JK', 'BBCA.JK', 'BBCA.JK', 'BBCA.JK'],
        'revenue': [10000, 15000, 12000, 18000],  # 50% changes but not multiple extremes
        'earnings': [3000, 4500, 3600, 5400],
        'total_assets': [500000, 520000, 540000, 560000],  # Steady growth
        'total_liabilities': [450000, 468000, 486000, 504000],
        'total_equity': [50000, 52000, 54000, 56000],
        'gross_loan': [300000, 312000, 324000, 336000],
        'allowance_for_loans': [3000, 3120, 3240, 3360],
        'net_loan': [297000, 308880, 320760, 332640],
        'total_deposit': [400000, 416000, 432000, 448000],
        'net_interest_income': [8000, 12000, 9600, 14400],
        'non_interest_income': [2000, 3000, 2400, 3600]
    })
    
    print("Testing Annual Validation (should have fewer false positives)...")
    annual_results = await validator._validate_financial_annual(sample_data)
    print(f"Annual anomalies found: {len(annual_results['anomalies'])}")
    for anomaly in annual_results['anomalies']:
        print(f"  - {anomaly['type']}: {anomaly.get('message', 'N/A')}")
    
    print("\nTesting Critical Identity Checks...")
    critical_identities = validator._add_critical_identity_anomalies(sample_data)
    print(f"Critical identity anomalies: {len(critical_identities)}")
    for anomaly in critical_identities:
        print(f"  - {anomaly['type']}: {anomaly.get('message', 'N/A')}")
    
    print("\nTesting Critical Ratio Checks...")
    critical_ratios = validator._add_critical_ratio_anomalies(sample_data)
    print(f"Critical ratio anomalies: {len(critical_ratios)}")
    for anomaly in critical_ratios:
        print(f"  - {anomaly['type']}: {anomaly.get('message', 'N/A')}")
    
    print("\n✅ Test completed successfully!")

if __name__ == "__main__":
    asyncio.run(test_improved_validator())
