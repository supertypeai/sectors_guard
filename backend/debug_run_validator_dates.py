"""
Run IDXFinancialValidator.validate_table for a given table with date filters to reproduce date-filter-related issues.
Usage:
    python backend\debug_run_validator_dates.py --table idx_dividend --start 2020-01-01 --end 2022-06-30
"""
import argparse
import asyncio
from datetime import datetime
import json
import os
import sys

# ensure app package is importable
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

from app.validators.idx_financial_validator import IDXFinancialValidator

async def run(table: str, start: str = None, end: str = None):
    v = IDXFinancialValidator()
    res = await v.validate_table(table, start, end)
    print(json.dumps(res, indent=2, default=str, ensure_ascii=False))

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--table', required=True)
    parser.add_argument('--start', required=False)
    parser.add_argument('--end', required=False)
    args = parser.parse_args()
    asyncio.run(run(args.table, args.start, args.end))
