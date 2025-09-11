# GitHub Actions Validation Schedules

## 📅 Custom Schedule Overview

Setiap tabel validasi memiliki jadwal yang disesuaikan dengan kebutuhan bisnis dan frekuensi data update:

### Schedule Detail

| Table | Schedule | Cron Expression | Waktu (UTC) | Deskripsi |
|-------|----------|----------------|-------------|-----------|
| **Annual Financials** | 1 Januari | `0 2 1 1 *` | 2:00 AM | Validasi data tahunan setiap awal tahun |
| **Quarterly Financials** | Setiap kuartal (Jan, Apr, Jul, Okt) | `0 3 1 1,4,7,10 *` | 3:00 AM | Validasi data kuartalan |
| **Daily Data** | Setiap Senin | `0 1 * * 1` | 1:00 AM | Validasi pergerakan harga mingguan |
| **Dividend** | Setiap tanggal 1 | `0 4 1 * *` | 4:00 AM | Validasi dividen bulanan |
| **All-time Price** | 1 Januari | `0 5 1 1 *` | 5:00 AM | Validasi konsistensi harga tahunan |
| **Filings** | Setiap kuartal | `0 6 1 1,4,7,10 *` | 6:00 AM | Validasi filing kuartalan |
| **Stock Split** | 6 bulan sekali (Jan, Jul) | `0 7 1 1,7 *` | 7:00 AM | Validasi stock split semesteran |

## 🛠️ Manual Trigger Options

Workflow dapat dipicu manual dengan opsi:

```yaml
workflow_dispatch:
  inputs:
    validation_type:
      options:
        - 'all'          # Jalankan semua validasi
        - 'annual'       # Hanya annual financials
        - 'quarterly'    # Hanya quarterly financials
        - 'daily'        # Hanya daily data
        - 'dividend'     # Hanya dividend
        - 'alltime'      # Hanya all-time price
        - 'filings'      # Hanya filings
        - 'stocksplit'   # Hanya stock split
```

## 🔄 Workflow Logic

### 1. Determine Validation Type Job
- **Scheduled**: Menentukan tabel mana yang harus divalidasi berdasarkan tanggal/waktu saat ini
- **Manual**: Menggunakan input dari user untuk menentukan tabel yang akan divalidasi

### 2. Data Validation Job  
- Hanya berjalan jika ada tabel yang perlu divalidasi
- Menjalankan validator untuk tabel yang dipilih
- Mengirim email alert jika ada anomali
- Menyimpan hasil ke database dan artifact

### 3. Artifacts & Reports
- **validation_results.json**: Hasil detail validasi per tabel
- **validation_report.json**: Summary lengkap dengan metadata workflow
- Disimpan selama 30 hari untuk troubleshooting

## 📊 Expected Execution Pattern

### Januari (Peak Activity)
- **1 Jan 2:00 AM**: Annual Financials
- **1 Jan 3:00 AM**: Quarterly Financials (Q1)
- **1 Jan 4:00 AM**: Dividend (monthly)
- **1 Jan 5:00 AM**: All-time Price
- **1 Jan 6:00 AM**: Filings (Q1)
- **1 Jan 7:00 AM**: Stock Split (semesteran)

### April (Quarterly)
- **1 Apr 3:00 AM**: Quarterly Financials (Q2)
- **1 Apr 4:00 AM**: Dividend (monthly)
- **1 Apr 6:00 AM**: Filings (Q2)

### Juli (Mid-year)
- **1 Jul 3:00 AM**: Quarterly Financials (Q3)
- **1 Jul 4:00 AM**: Dividend (monthly)
- **1 Jul 6:00 AM**: Filings (Q3)
- **1 Jul 7:00 AM**: Stock Split (semesteran)

### Oktober (End Q3)
- **1 Okt 3:00 AM**: Quarterly Financials (Q4)
- **1 Okt 4:00 AM**: Dividend (monthly)
- **1 Okt 6:00 AM**: Filings (Q4)

### Bulanan (Monthly)
- **1st of month 4:00 AM**: Dividend validation

### Mingguan (Weekly)
- **Monday 1:00 AM**: Daily data validation

## 🚨 Notifications & Alerts

### Automatic Email Alerts
- Dikirim otomatis saat anomali terdeteksi
- Recipients dari `DEFAULT_EMAIL_RECIPIENTS` secret
- Berisi detail anomali dan link ke dashboard

### GitHub Actions Notifications
- **Success**: `::notice::` untuk validasi bersih
- **Warning**: `::warning::` untuk anomali terdeteksi
- **Error**: `::error::` untuk kegagalan sistem

### Slack Integration (Optional)
Tambahkan step untuk notifikasi Slack:

```yaml
- name: Notify Slack on anomalies
  if: contains(steps.validation.outputs.result, 'anomalies')
  uses: 8398a7/action-slack@v3
  with:
    status: custom
    custom_payload: |
      {
        "text": "🚨 IDX Data Validation Alert",
        "blocks": [
          {
            "type": "section",
            "text": {
              "type": "mrkdwn", 
              "text": "*Anomalies detected in IDX data validation*\nTable: ${{ env.TABLE_NAME }}\nAnomalies: ${{ env.ANOMALY_COUNT }}"
            }
          }
        ]
      }
  env:
    SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}
```

## 🔧 Troubleshooting

### Common Issues

1. **No tables validated**: 
   - Check if schedule logic matches current date/time
   - Verify cron expressions are correct

2. **Validation failures**:
   - Check database connection secrets
   - Verify table exists in Supabase
   - Review validator logic for that table

3. **Email sending failed**:
   - Check SMTP credentials in secrets
   - Verify recipient email addresses

### Debug Commands

```bash
# Test manual trigger
gh workflow run data-validation.yml --field validation_type=daily

# Check workflow runs
gh run list --workflow=data-validation.yml

# Download artifacts
gh run download [run-id] --name validation-report-[run-id]
```

## 🎯 Business Logic Alignment

Schedule disesuaikan dengan:
- **Annual**: Data tahunan biasanya tersedia setelah akhir tahun
- **Quarterly**: Q1(Jan), Q2(Apr), Q3(Jul), Q4(Okt)
- **Daily**: Monitoring mingguan cukup untuk deteksi trend
- **Dividend**: Bulanan sesuai periode pembayaran dividen
- **Filings**: Mengikuti schedule quarterly report
- **Stock Split**: Events jarang, cukup 6 bulan sekali

Schedule ini dapat diubah sesuai kebutuhan bisnis dengan mengedit cron expressions di workflow file.
