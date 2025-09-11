"""
Script to analyze potential false positives in validation errors
"""

import json
import pandas as pd

def analyze_false_positives():
    """Analyze the validation errors to identify false positives"""
    
    # Load the data
    with open('app/validators/dummy.json', 'r') as f:
        data = json.load(f)
    
    df = pd.DataFrame(data)
    
    print("=== Analysis of Validation Errors ===\n")
    
    # Check specific records mentioned in errors
    print("=== Analyzing BMRI.JK 2021-12-31 (Error #1) ===")
    bmri_2021 = df[(df['symbol'] == 'BMRI.JK') & (df['date'] == '2021-12-31')].iloc[0]
    
    print(f"Total Assets: {bmri_2021['total_assets']:,}")
    print(f"Total Liabilities: {bmri_2021['total_liabilities']:,}")
    print(f"Total Equity: {bmri_2021['total_equity']:,}")
    
    assets_liab_equity_diff = bmri_2021['total_assets'] - (bmri_2021['total_liabilities'] + bmri_2021['total_equity'])
    print(f"Assets - (Liabilities + Equity): {assets_liab_equity_diff:,}")
    print(f"Percentage difference: {abs(assets_liab_equity_diff) / bmri_2021['total_assets'] * 100:.2f}%")
    
    print("\n=== Net Loan Check ===")
    print(f"Gross Loan: {bmri_2021['gross_loan']:,}")
    print(f"Allowance for Loans: {bmri_2021['allowance_for_loans']:,}")
    print(f"Net Loan (actual): {bmri_2021['net_loan']:,}")
    
    expected_net_loan = bmri_2021['gross_loan'] - bmri_2021['allowance_for_loans']
    print(f"Expected Net Loan (Gross - Allowance): {expected_net_loan:,}")
    
    net_loan_diff = bmri_2021['net_loan'] - expected_net_loan
    print(f"Difference: {net_loan_diff:,}")
    print(f"Percentage difference: {abs(net_loan_diff) / expected_net_loan * 100:.2f}%")
    
    print("\n=== Cash Flow Check ===")
    print(f"CFO: {bmri_2021['net_operating_cash_flow']:,}")
    print(f"CFI: {bmri_2021['net_investing_cash_flow']:,}")
    print(f"CFF: {bmri_2021['net_financing_cash_flow']:,}")
    print(f"Net Cash Flow (actual): {bmri_2021['net_cash_flow']:,}")
    
    expected_net_cash_flow = (bmri_2021['net_operating_cash_flow'] + 
                             bmri_2021['net_investing_cash_flow'] + 
                             bmri_2021['net_financing_cash_flow'])
    print(f"Expected Net Cash Flow (CFO+CFI+CFF): {expected_net_cash_flow:,}")
    
    cash_flow_diff = bmri_2021['net_cash_flow'] - expected_net_cash_flow
    print(f"Difference: {cash_flow_diff:,}")
    print(f"Percentage difference: {abs(cash_flow_diff) / abs(expected_net_cash_flow) * 100:.2f}%")
    
    print("\n" + "="*80)
    print("=== Analysis of BRIS.JK LDR Issues ===")
    
    bris_data = df[df['symbol'] == 'BRIS.JK']
    for _, row in bris_data.iterrows():
        if pd.notna(row['gross_loan']) and pd.notna(row['total_deposit']) and row['total_deposit'] != 0:
            ldr = row['gross_loan'] / row['total_deposit']
            print(f"\nBRIS.JK {row['date']}:")
            print(f"  Gross Loan: {row['gross_loan']:,}")
            print(f"  Total Deposit: {row['total_deposit']:,}")
            print(f"  LDR: {ldr:.4f} ({ldr*100:.2f}%)")
            if ldr > 1.3:
                print(f"  ❌ LDR {ldr:.2f} exceeds normal range (>130%)")
    
    print("\n" + "="*80)
    print("=== Summary of Potential Issues ===")
    
    # Check if these are real accounting errors or data issues
    print("\n1. ASSETS = LIABILITIES + EQUITY violations:")
    print("   - These could be real accounting errors")
    print("   - However, some might be due to:")
    print("     * Rounding differences in large numbers")
    print("     * Different reporting standards")
    print("     * Timing differences in consolidation")
    
    print("\n2. NET LOAN = GROSS LOAN - ALLOWANCE violations:")
    print("   - The formula assumes: Net Loan = Gross Loan - Allowance")
    print("   - But in banking, this might not always hold due to:")
    print("     * Write-offs during the period")
    print("     * Different classification of allowances")
    print("     * Restructured loans")
    
    print("\n3. CASH FLOW violations:")
    print("   - Very large percentage differences suggest:")
    print("     * Possible data entry errors")
    print("     * Different reporting periods or methods")
    print("     * Missing components in the calculation")
    
    print("\n4. LDR (Loan-to-Deposit Ratio) for BRIS.JK:")
    print("   - LDR > 300% is extremely unusual for Indonesian banks")
    print("   - Regulatory limit is typically around 110-120%")
    print("   - This suggests either:")
    print("     * Data quality issues")
    print("     * Special circumstances (e.g., acquisition, restructuring)")
    print("     * Different accounting treatment")

if __name__ == "__main__":
    analyze_false_positives()
