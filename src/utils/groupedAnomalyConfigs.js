const PERIODIC_GUARD = {
  columns: [
    { label: 'Symbol', value: (row) => row.symbol, bold: true },
    { label: 'Date', value: (row) => row.date },
    { label: 'Period', value: (row) => row.period },
    { label: 'Field', value: (row) => row.metric, muted: true },
  ],
  descriptions: {
    duplicate_key: 'The same symbol and date is stored more than once',
    missing_required_column: 'symbol, date, period, financial_year or source_url is empty',
    unknown_period: 'period is not H1 or H2',
    date_not_month_end: 'The period end date is not the last day of a month',
    wrong_financial_year: 'financial_year does not follow the date and period',
    mislabelled_first_half: 'The row six months before an H2 is not labelled H1',
    balance_sheet_not_balanced: 'total_asset differs from total_liabilities + total_equity by over 1%',
    empty_statement: 'Every field of the income statement, balance sheet or cash flow is empty',
    missing_figure: 'total_revenue, net_income, total_asset or total_equity is empty',
    balance_sheet_parts_off: 'total_current_asset + total_non_current_asset differs from total_asset, or total_current_liabilities + total_non_current_liabilities from total_liabilities, by over 1%',
    cash_flow_off_net: 'operating + investing + financing cash flow differs from net_cash_flow by over 1%',
    negative_revenue: 'total_revenue is below zero',
    h2_vs_h1_revenue: 'H2 total_revenue is below 0.56x or above 1.8x the H1 total_revenue of the same year',
    annual_mismatch: 'H1 + H2 differs from sgx_financials_annual by over 5%',
    period_jump: 'total_revenue or total_asset is 20x or more off the previous half',
    half_not_stored: 'This half is not in the table. Date and Period are the missing half',
    top_symbol_missing: 'A top 100 issuer by market cap has no half year stored',
    top_symbol_stale: 'A top 100 issuer\'s newest stored half is over 300 days old',
    check_crashed: 'A check failed to run',
  },
};

const SGX_FILINGS = {
  columns: [
    { label: 'ID', value: (row) => (row.duplicate_ids || []).join(', ') || row.id, bold: true },
    { label: 'Symbol', value: (row) => row.symbol },
    { label: 'Date', value: (row) => String(row.timestamp || row.key_details?.timestamp || '').slice(0, 10) },
    { label: 'Tags', value: (row) => (Array.isArray(row.tags) ? row.tags.join(', ') : row.tags), muted: true },
  ],
  descriptions: {
    duplicate_filing_record: 'Same source, holder_name, date, and direct and deemed amounts before and after',
    missing_price_per_share: 'A buy or sell has no price_per_share (empty list, or every price is null)',
    missing_price_per_share_invalid_tag: 'No price_per_share, and tags is not award, transfer or inheritance',
    validation_error: 'The validation failed to run',
  },
};

const IDX_FILINGS = {
  symbolExample: 'BBCA',
  columns: [
    {
      label: 'ID',
      value: (row) => (row.older_record_id ? `${row.record_id} (older: ${row.older_record_id})` : row.record_id),
      bold: true,
    },
    { label: 'Symbol', value: (row) => row.symbol || row.ticker },
    { label: 'Holder', value: (row) => row.holder_name, muted: true },
    { label: 'Date', value: (row) => row.filing_date || row.transaction_date },
  ],
  descriptions: {
    transaction_type_mismatch: 'Holdings went down but transaction_type is buy, or went up but it is sell',
    holding_mismatch: 'holding_before + net shares from price_transaction does not equal holding_after',
    transaction_price_correction_candidate: 'A price_transaction price is outside the market range, but price / amount_transacted is inside it (likely a total value)',
    filing_price_discrepancy: 'price differs from the daily close on the filing date by 50% or more',
    duplicate_transaction: 'Same symbol, date, holder_name, transaction_type, holdings before and after, and transaction_value',
    correction_document_candidate: 'A newer filing has the same holder, holdings and transaction date as an older one, so it may be a correction',
    missing_required_columns: 'timestamp, symbol or price is missing from the data',
    validation_error: 'The validation failed to run',
  },
};

export function getGroupedAnomalyConfig(tableName) {
  if (tableName?.startsWith('sgx_periodic_guard')) {
    return PERIODIC_GUARD;
  }

  if (tableName === 'idx_filings') {
    return IDX_FILINGS;
  }

  if (tableName === 'sgx_filings') {
    return SGX_FILINGS;
  }

  return null;
}
