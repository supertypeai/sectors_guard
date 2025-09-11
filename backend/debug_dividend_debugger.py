"""
Debugging script for idx_dividend data

This script fetches rows from the `idx_dividend` table, prints detailed diagnostics
(columns, dtypes, samples), normalizes common alias columns (ex_date, dividend_yield,
dividend_amount), and runs lightweight validations similar to the main validator:
- required columns present
- date parsing
- per-symbol yearly dividend and yield checks (high yield and large year-over-year changes)

Usage (Windows cmd):
    python backend\debug_dividend_debugger.py --limit 50
    python backend\debug_dividend_debugger.py --symbol AMAR.JK

The script is intentionally verbose to help trace why the main validator may raise
KeyError 'date' or other schema issues.
"""

import argparse
import json
from datetime import datetime
from typing import Optional

import pandas as pd

from app.database.connection import get_supabase_client


def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    """Normalize common alias columns into canonical names used by validator.
    Mutates a copy and returns it.
    """
    df = df.copy()
    aliases = {
        'ex_date': 'date',
        'exDate': 'date',
        'ex date': 'date',
        'dividend_yield': 'yield',
        'dividendYield': 'yield',
        'dividend_amount': 'dividend',
        'dividend_original': 'dividend_original'
    }
    for src, dst in aliases.items():
        if src in df.columns and dst not in df.columns:
            df[dst] = df[src]
            print(f"🔁 Normalized column alias: {src} -> {dst}")
    return df


def fetch_table(sup, table: str, limit: Optional[int] = None):
    query = sup.table(table).select("*")
    if limit:
        query = query.limit(limit)
    resp = query.execute()
    data = getattr(resp, 'data', None)
    return pd.DataFrame(data) if data else pd.DataFrame()


def debug_dividend(limit: Optional[int] = None, symbol: Optional[str] = None):
    sup = get_supabase_client()
    print(f"🛰️  Fetching idx_dividend rows (limit={limit})")
    df = fetch_table(sup, 'idx_dividend', limit=limit)
    print(f"🔬 Rows fetched: {len(df)}")

    if df.empty:
        print("⚠️  No data returned from idx_dividend. Check connection/table name.")
        return

    print("Columns:")
    print(df.columns.tolist())
    print("\nDtypes:")
    print(df.dtypes)
    print("\nSample rows (first 3):")
    try:
        print(df.head(3).to_dict(orient='records'))
    except Exception:
        print(df.head(3))

    # Normalize aliases
    df = normalize_columns(df)

    # Required columns check (use canonical names from validator)
    required_cols = ['symbol', 'yield', 'date']
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        print(f"❌ Missing required columns for dividend validation: {missing}")
        print("Suggestion: check aliases such as ex_date, dividend_yield, dividend_amount in your table.")
        # Print available columns to help debugging
        print("Available columns:", df.columns.tolist())
        return

    # Parse dates, show rows that fail
    try:
        df['date_parsed'] = pd.to_datetime(df['date'], errors='coerce')
    except Exception as e:
        print("❌ Exception while parsing date column:", e)
        df['date_parsed'] = pd.to_datetime(df['date'].astype(str), errors='coerce')

    bad_dates = df[df['date_parsed'].isna()]
    if not bad_dates.empty:
        print(f"⚠️  Found {len(bad_dates)} rows with invalid/missing dates. Sample:")
        print(bad_dates.head(5).to_dict(orient='records'))

    df['year'] = df['date_parsed'].dt.year

    # Report nulls in yield
    null_yield = df['yield'].isna().sum()
    print(f"ℹ️  yield null count: {null_yield} / {len(df)}")

    # Per-symbol checks similar to validator
    current_year = datetime.now().year
    results = []
    for sym in df['symbol'].unique():
        sym_df = df[df['symbol'] == sym].copy()
        if sym_df.empty:
            continue
        # yearly sums
        yearly_yield = sym_df.groupby('year')['yield'].sum(min_count=1)
        yearly_div = sym_df.groupby('year')['dividend'].sum(min_count=1) if 'dividend' in sym_df.columns else pd.Series()

        # compute avg close for current year (if daily data exists)
        avg_close_this_year = None
        try:
            daily_q = sup.table('idx_daily_data').select('*').gte('date', f"{current_year}-01-01").lte('date', f"{current_year}-12-31").eq('symbol', sym).execute()
            daily = getattr(daily_q, 'data', None)
            if daily:
                df_daily = pd.DataFrame(daily)
                if 'close' in df_daily.columns:
                    df_daily['date'] = pd.to_datetime(df_daily['date'], errors='coerce')
                    df_daily = df_daily[df_daily['date'].dt.year == current_year]
                    if not df_daily.empty:
                        avg_close_this_year = df_daily['close'].mean()
        except Exception as e:
            print(f"⚠️  Could not fetch daily data for {sym}: {e}")

        div_this_year = yearly_div.get(current_year) if not yearly_div.empty else None
        yield_this_year = None
        if div_this_year is not None and avg_close_this_year not in (None, 0):
            yield_this_year = div_this_year / avg_close_this_year

        # high yields
        high_yields = yearly_yield[yearly_yield >= 0.3]
        large_changes = yearly_yield.sort_index().diff().abs()
        large_changes = large_changes[large_changes >= 0.1]

        # Ensure all values are native Python types (not numpy types) so JSON serialization works
        years_present = [int(y) for y in sorted(list(sym_df['year'].dropna().unique()))]
        entry = {
            'symbol': str(sym),
            'rows': int(len(sym_df)),
            'years_present': years_present,
            'avg_close_this_year': float(avg_close_this_year) if avg_close_this_year is not None else None,
            'div_this_year': float(div_this_year) if div_this_year is not None else None,
            'yield_this_year': float(yield_this_year) if yield_this_year is not None else None,
            'high_yield_years': {int(y): float(v) for y, v in high_yields.items()} if not high_yields.empty else {},
            'large_yield_changes': {int(y): float(v) for y, v in large_changes.items()} if not large_changes.empty else {}
        }
        results.append(entry)

    # Print concise summary
    print("\n=== Dividend validation debug summary ===")
    for r in results:
        # Use default=str as a safe fallback for any remaining non-serializable values
        print(json.dumps(r, ensure_ascii=False, default=str))

    # Optionally write results to file for further inspection
    try:
        out_path = 'backend/debug_dividend_debug_output.json'
        with open(out_path, 'w', encoding='utf-8') as f:
            json.dump({'fetched_rows': int(len(df)), 'results': results}, f, ensure_ascii=False, indent=2, default=str)
        print(f"✅ Debug output written to {out_path}")
    except Exception as e:
        print("⚠️  Could not write debug output file:", e)


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Debug idx_dividend data schema and simple validations')
    parser.add_argument('--limit', type=int, default=200, help='Limit rows to fetch from idx_dividend')
    parser.add_argument('--symbol', type=str, default=None, help='Only debug a single symbol')
    args = parser.parse_args()

    if args.symbol:
        # fetch a small set then filter locally
        debug_dividend(limit=500)
        print('\nNote: --symbol currently filters after fetch; open file to implement server-side symbol filter if needed')
    else:
        debug_dividend(limit=args.limit)
