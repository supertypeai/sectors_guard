"""
Custom IDX-specific data validators for financial data tables
"""

import pandas as pd
import numpy as np
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import asyncio

from .data_validator import DataValidator
from ..database.connection import get_supabase_client

class IDXFinancialValidator(DataValidator):
    """
    Specialized validator for IDX financial data tables
    """
    
    def __init__(self):
        super().__init__()
        self.idx_tables = {
            'idx_combine_financials_annual': self._validate_financial_annual,
            'idx_combine_financials_quarterly': self._validate_financial_quarterly,
            'idx_daily_data': self._validate_daily_data,
            'idx_dividend': self._validate_dividend,
            'idx_all_time_price': self._validate_all_time_price
        }
    
    async def validate_table(self, table_name: str) -> Dict[str, Any]:
        """
        Override parent method to use IDX-specific validation rules
        """
        if table_name not in self.idx_tables:
            # Fall back to generic validation for non-IDX tables
            return await super().validate_table(table_name)
        
        try:
            # Get table data
            data = await self._fetch_table_data(table_name)
            
            # Run IDX-specific validation
            results = {
                "table_name": table_name,
                "validation_timestamp": datetime.now().isoformat(),
                "total_rows": len(data),
                "anomalies_count": 0,
                "anomalies": [],
                "status": "success",
                "validations_performed": [f"idx_{table_name.split('_')[-1]}_validation"]
            }
            
            if not data.empty:
                # Run table-specific validation
                validation_func = self.idx_tables[table_name]
                idx_results = await validation_func(data)
                results["anomalies"].extend(idx_results.get("anomalies", []))
            
            # Update final counts and status
            results["anomalies_count"] = len(results["anomalies"])
            
            if results["anomalies_count"] > 0:
                if results["anomalies_count"] > 5:  # More than 5 anomalies = error
                    results["status"] = "error"
                else:
                    results["status"] = "warning"
            
            # Store results
            await self._store_validation_results(results)
            
            return results
            
        except Exception as e:
            return {
                "table_name": table_name,
                "status": "error",
                "error": str(e),
                "validation_timestamp": datetime.now().isoformat()
            }
    
    async def _validate_financial_annual(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate idx_combine_financials_annual table
        Condition: absolute change per annual > 50%, but check average changes per period
        """
        anomalies = []
        
        try:
            # Ensure we have required columns
            required_cols = ['date', 'symbol', 'revenue', 'earnings', 'total_assets']
            missing_cols = [col for col in required_cols if col not in data.columns]
            
            if missing_cols:
                anomalies.append({
                    "type": "missing_required_columns",
                    "columns": missing_cols,
                    "message": f"Missing required columns: {', '.join(missing_cols)}",
                    "severity": "error"
                })
                return {"anomalies": anomalies}
            
            # Convert date to datetime and extract year
            data = data.copy()
            data['date'] = pd.to_datetime(data['date'])
            data['year'] = data['date'].dt.year
            
            # Group by symbol and analyze year-over-year changes
            financial_metrics = ['revenue', 'earnings', 'total_assets', 'total_equity', 'operating_pnl']
            available_metrics = [col for col in financial_metrics if col in data.columns]
            
            for symbol in data['symbol'].unique():
                symbol_data = data[data['symbol'] == symbol].sort_values('year')
                
                if len(symbol_data) < 2:
                    continue  # Need at least 2 years of data
                
                for metric in available_metrics:
                    if metric not in symbol_data.columns:
                        continue
                    
                    # Skip if all values are null/NaN for this metric
                    if symbol_data[metric].isna().all():
                        continue
                    
                    # Calculate year-over-year percentage changes
                    symbol_data = symbol_data.copy()
                    symbol_data[f'{metric}_pct_change'] = symbol_data[metric].pct_change() * 100
                    
                    # Get changes excluding first row (which will be NaN)
                    changes = symbol_data[f'{metric}_pct_change'].dropna()
                    
                    if len(changes) == 0:
                        continue
                    
                    # Calculate average absolute change
                    avg_abs_change = changes.abs().mean()
                    
                    extreme_pct_changes = changes[(changes.abs() > 50) & (changes.abs() > (avg_abs_change * 1.5))]
                    
                    # Only trigger if extreme changes are significantly above average
                    if len(extreme_pct_changes) > 0:
                        years_affected = symbol_data[symbol_data[f'{metric}_pct_change'].abs() > 50]['year'].tolist()
                        
                        anomalies.append({
                            "type": "extreme_annual_change",
                            "symbol": symbol,
                            "metric": metric,
                            "years_affected": years_affected,
                            "extreme_pct_changes": extreme_pct_changes.tolist(),
                            "avg_abs_change": round(avg_abs_change, 2),
                            "message": f"Symbol {symbol}: {metric} shows extreme annual changes (>50%) in years {years_affected}. Average absolute change: {avg_abs_change:.1f}%",
                            "severity": "warning"
                        })
        
        except Exception as e:
            anomalies.append({
                "type": "validation_error",
                "message": f"Error validating annual financial data: {str(e)}",
                "severity": "error"
            })
        
        return {"anomalies": anomalies}
    
    async def _validate_financial_quarterly(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate idx_combine_financials_quarterly table
        Condition: absolute change per quarter > 50%, but check average changes per period
        """
        anomalies = []
        try:
            # Ensure we have required columns
            required_cols = ['date', 'symbol', 'total_revenue', 'earnings', 'total_assets']
            missing_cols = [col for col in required_cols if col not in data.columns]
            if missing_cols:
                anomalies.append({
                    "type": "missing_required_columns",
                    "columns": missing_cols,
                    "message": f"Missing required columns: {', '.join(missing_cols)}",
                    "severity": "error"
                })
                return {"anomalies": anomalies}
            
            # Create period identifier
            data = data.copy()
            data['date'] = pd.to_datetime(data['date'])

            # Group by symbol and analyze year-over-year changes
            financial_metrics = ['total_revenue', 'earnings', 'total_assets', 'total_equity', 'operating_pnl']
            available_metrics = [col for col in financial_metrics if col in data.columns]

            for symbol in data['symbol'].unique():
                symbol_data = data[data['symbol'] == symbol].sort_values('date')
                if len(symbol_data) < 4:
                    continue  # Need at least 4 quarters of data
                for metric in available_metrics:
                    if metric not in symbol_data.columns:
                        continue
                    if symbol_data[metric].isna().all():
                        continue
                    symbol_data = symbol_data.copy()
                    symbol_data[f'{metric}_pct_change'] = symbol_data[metric].pct_change() * 100
                    changes = symbol_data[f'{metric}_pct_change'].dropna()
                    if len(changes) == 0:
                        continue
                    avg_abs_change = changes.abs().mean()
                    
                    extreme_pct_changes = changes[(changes.abs() > 50) & (changes.abs() > (avg_abs_change * 1.5))]
                    if len(extreme_pct_changes) > 0:
                        periods_affected = symbol_data[symbol_data[f'{metric}_pct_change'].abs() > 50]['date'].dt.strftime('%Y-%m-%d').tolist()
                        anomalies.append({
                            "type": "extreme_quarterly_change",
                            "symbol": symbol,
                            "metric": metric,
                            "periods_affected": periods_affected,
                            "extreme_pct_changes": extreme_pct_changes.tolist(),
                            "avg_abs_change": round(avg_abs_change, 2),
                            "message": f"Symbol {symbol}: {metric} shows extreme quarterly changes (>50%) in periods {periods_affected}. Average absolute change: {avg_abs_change:.1f}%",
                            "severity": "warning"
                        })
                print(symbol_data[['date', 'total_revenue', 'total_revenue_pct_change', 'earnings', 'earnings_pct_change']])
        except Exception as e:
            anomalies.append({
                "type": "validation_error",
                "message": f"Error validating quarterly financial data: {str(e)}",
                "severity": "error"
            })
        return {"anomalies": anomalies}
    
    async def _validate_daily_data(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate idx_daily_data table
        Condition: close price change > 35%
        Only validate data for the last 7 days
        """
        anomalies = []
        try:
            # Ensure we have required columns
            required_cols = ['date', 'symbol', 'close']
            missing_cols = [col for col in required_cols if col not in data.columns]
            if missing_cols:
                anomalies.append({
                    "type": "missing_required_columns",
                    "columns": missing_cols,
                    "message": f"Missing required columns: {', '.join(missing_cols)}",
                    "severity": "error"
                })
                return {"anomalies": anomalies}

            data = data.copy()
            data['date'] = pd.to_datetime(data['date'])

            # Filter only last 7 days
            today = pd.Timestamp(datetime.now(tz=None).date())
            seven_days_ago = today - pd.Timedelta(days=7)
            data = data[(data['date'] >= seven_days_ago)]

            for symbol in data['symbol'].unique():
                symbol_data = data[data['symbol'] == symbol].sort_values('date')
                if len(symbol_data) < 2:
                    continue  # Need at least 2 days of data
                # Calculate daily price changes
                symbol_data = symbol_data.copy()
                symbol_data['price_pct_change'] = symbol_data['close'].pct_change() * 100
                # Find days with >35% price change
                extreme_pct_changes = symbol_data[symbol_data['price_pct_change'].abs() > 35]
                if len(extreme_pct_changes) > 0:
                    for _, row in extreme_pct_changes.iterrows():
                        anomalies.append({
                            "type": "extreme_daily_price_change",
                            "symbol": symbol,
                            "date": row['date'].strftime('%Y-%m-%d'),
                            "close_price": float(row['close']),
                            "price_change_pct": round(float(row['price_pct_change']), 2),
                            "message": f"Symbol {symbol} on {row['date'].strftime('%Y-%m-%d')}: Close price changed by {row['price_pct_change']:.1f}% (close: {row['close']})",
                            "severity": "warning"
                        })
        except Exception as e:
            anomalies.append({
                "type": "validation_error",
                "message": f"Error validating daily data: {str(e)}",
                "severity": "error"
            })
        return {"anomalies": anomalies}
    
    async def _validate_dividend(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate idx_dividend table
        Conditions:
        1. average yield per year >= 30%
        2. yield (average) per year change >= 10%
        """
        anomalies = []
        try:
            required_cols = ['symbol', 'yield', 'date']
            missing_cols = [col for col in required_cols if col not in data.columns]
            if missing_cols:
                anomalies.append({
                    "type": "missing_required_columns",
                    "columns": missing_cols,
                    "message": f"Missing required columns: {', '.join(missing_cols)}",
                    "severity": "error"
                })
                return {"anomalies": anomalies}

            data = data.copy()
            data['date'] = pd.to_datetime(data['date'])
            # data = data[~data['yield'].isna()]
            data['year'] = data['date'].dt.year

            for symbol in data['symbol'].unique():
                symbol_data = data[data['symbol'] == symbol]
                # data daily
                try:
                    daily_data = await self._fetch_ticker_data('idx_daily_data', symbol)
                except Exception as e:
                    daily_data = None
                if symbol_data.empty:
                    continue
                # 1. Cek rata-rata yield per tahun >= 30%
                yearly_avg = symbol_data.groupby('year')['yield'].mean()
                yearly_div = symbol_data.groupby('year')['dividend'].mean()
                this_year = datetime.now().year

                # Calculate average yield for this year
                avg_close_this_year = None
                if daily_data is not None:
                    # print(daily_data)
                    daily_data['date'] = pd.to_datetime(daily_data['date'])
                    daily_this_symbol = daily_data[(daily_data['symbol'] == symbol) & (daily_data['date'].dt.year == this_year)]
                    # print(f"Daily data for {symbol} this year: {daily_this_symbol.shape[0]} rows")
                    if not daily_this_symbol.empty:
                        avg_close_this_year = daily_this_symbol['close'].mean()
                    # print(f"Average close price for {symbol} this year: {avg_close_this_year}")

                div_this_year = yearly_div.get(this_year)
                if symbol == 'BBCA.JK':
                    div_this_year /= 2
                yield_this_year = None
                if div_this_year is not None and avg_close_this_year is not None and avg_close_this_year != 0:
                    yield_this_year = div_this_year / avg_close_this_year

                if yield_this_year is not None:
                    yearly_avg.loc[this_year] = yield_this_year

                high_yield_years = yearly_avg[yearly_avg >= 0.3]
                if not high_yield_years.empty:
                    for year, avg_yield in high_yield_years.items():
                        anomalies.append({
                            "type": "high_average_yield_per_year",
                            "symbol": symbol,
                            "year": int(year),
                            "average_yield": float(avg_yield),
                            "message": f"symbol {symbol} year {year}: Average yield {avg_yield*100:.2f}% >= 30%",
                            "severity": "warning"
                        })
                # 2. Cek perubahan rata-rata yield per tahun >= 10%
                yearly_avg_sorted = yearly_avg.sort_index()
                # yearly_avg_sorted['change'] = yearly_avg_sorted.pct_change().abs()
                print(yearly_avg_sorted)
                yearly_avg_change = yearly_avg_sorted.pct_change().abs()
                print(yearly_avg_change)
                large_changes = yearly_avg_change[yearly_avg_change >= 0.2]
                if not large_changes.empty:
                    for year, change in large_changes.items():
                        anomalies.append({
                            "type": "large_average_yield_change_per_year",
                            "symbol": symbol,
                            "year": int(year),
                            "yield_change": float(change),
                            "message": f"symbol {symbol} year {year}: Average yield change {change*100:.2f}% >= 20%",
                            "severity": "warning"
                        })
        except Exception as e:
            anomalies.append({
                "type": "validation_error",
                "message": f"Error validating dividend data: {str(e)}",
                "severity": "error"
            })
        return {"anomalies": anomalies}
    
    async def _validate_all_time_price(self, data: pd.DataFrame) -> Dict[str, Any]:
        """
        Validate idx_all_time_price table
        Condition: Check if data is inline
        """
        anomalies = []
        try:
            # Ensure required columns
            required_cols = ['symbol', 'type', 'date', 'price']
            missing_cols = [col for col in required_cols if col not in data.columns]
            if missing_cols:
                anomalies.append({
                    "type": "missing_required_columns",
                    "columns": missing_cols,
                    "message": f"Missing required columns: {', '.join(missing_cols)}",
                    "severity": "error"
                })
                return {"anomalies": anomalies}

            # For each symbol, get price for each type
            data = data.copy()
            data['date'] = pd.to_datetime(data['date'])
            pivoted = data.pivot_table(index='symbol', columns='type', values='price', aggfunc='first')
            pivoted = pivoted.reset_index()

            # Map type names in JSON to logical periods
            type_map = {
                'all_time_high': 'all_time_high',
                'all_time_low': 'all_time_low',
                '52_w_high': '52w_high',
                '52_w_low': '52w_low',
                '90_d_high': '90d_high',
                '90_d_low': '90d_low',
                'ytd_high': 'ytd_high',
                'ytd_low': 'ytd_low',
            }

            for _, row in pivoted.iterrows():
                symbol = row['symbol']
                issues = []
                # Extract values for each logical period
                values = {}
                for json_type, logic_name in type_map.items():
                    if json_type in row and pd.notna(row[json_type]):
                        values[logic_name] = float(row[json_type])

                # Check highs
                high_hierarchy = ['90d_high', 'ytd_high', '52w_high', 'all_time_high']
                available_highs = [(period, values[period]) for period in high_hierarchy if period in values]
                for i in range(len(available_highs) - 1):
                    current_period, current_value = available_highs[i]
                    next_period, next_value = available_highs[i + 1]
                    if current_value > next_value:
                        issues.append(f"{current_period} ({current_value}) > {next_period} ({next_value})")

                # Check lows
                low_hierarchy = ['90d_low', 'ytd_low', '52w_low', 'all_time_low']
                available_lows = [(period, values[period]) for period in low_hierarchy if period in values]
                for i in range(len(available_lows) - 1):
                    current_period, current_value = available_lows[i]
                    next_period, next_value = available_lows[i + 1]
                    if current_value < next_value:
                        issues.append(f"{current_period} ({current_value}) < {next_period} ({next_value})")

                # If we found inconsistencies, add anomaly
                if issues:
                    anomalies.append({
                        "type": "price_data_inconsistency",
                        "symbol": symbol,
                        "issues": issues,
                        "values": values,
                        "message": f"symbol {symbol}: Price data inconsistencies detected - {'; '.join(issues)}",
                        "severity": "error"
                    })
        except Exception as e:
            anomalies.append({
                "type": "validation_error",
                "message": f"Error validating all-time price data: {str(e)}",
                "severity": "error"
            })
        return {"anomalies": anomalies}
