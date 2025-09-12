import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  TextField,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { validationAPI } from '../services/api';

function TableConfiguration() {
  const [selectedTable, setSelectedTable] = useState('');
  const [validationTypes, setValidationTypes] = useState([]);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [errorThreshold, setErrorThreshold] = useState(5);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [metrics, setMetrics] = useState([]);
  const [rulesJson, setRulesJson] = useState('');
  const [rulesObj, setRulesObj] = useState({});
  const [newThresholdKey, setNewThresholdKey] = useState('');
  const [newThresholdValue, setNewThresholdValue] = useState('');

  const availableValidationTypes = [
    'statistical',
    'business_rules',
    'data_quality',
    'time_series',
  ];

  useEffect(() => {
    // Load tables from backend
    setLoadingTables(true);
    validationAPI.getTables().then(res => {
      const data = res.data?.tables || [];
      setTables(data);
    }).catch(err => {
      console.error('Failed to load tables', err);
    }).finally(() => setLoadingTables(false));
  }, []);

  useEffect(() => {
    if (!selectedTable) return;
  // setLoadingConfig(true);
    validationAPI.getTableConfig(selectedTable)
      .then(res => {
        const cfg = res.data || res; // backend returns object directly
        // rules may be under rules, config_data, or validation_rules
        const rules = cfg.rules || cfg.config_data || cfg.validation_rules || {};
  const typesRaw = cfg.validation_types || cfg.types || (cfg.validation_type ? [cfg.validation_type] : []);
  const types = Array.isArray(typesRaw) ? typesRaw : (typesRaw ? [typesRaw] : []);
        const emails = cfg.email_recipients || cfg.emailRecipients || [];
        const threshold = cfg.error_threshold || cfg.errorThreshold || cfg.error_threshold || 5;

        setValidationTypes(Array.isArray(types) ? types : []);
        setMetrics(rules.metrics || []);
        setRulesJson(JSON.stringify(rules, null, 2));
        // also set parsed object
        try {
          setRulesObj(typeof rules === 'object' ? rules : JSON.parse(JSON.stringify(rules)));
        } catch (e) {
          setRulesObj({});
        }
        setEmailRecipients(Array.isArray(emails) ? emails.join(', ') : emails || '');
        setErrorThreshold(threshold);
      })
      .catch(err => {
        console.error('Failed to load table config', err);
        // Reset to defaults
        setValidationTypes([]);
        setMetrics([]);
        setRulesJson('{}');
        setEmailRecipients('');
        setErrorThreshold(5);
      })
  .finally(() => {});
  }, [selectedTable]);

  // keep rulesObj and rulesJson in sync when rulesJson is edited manually
  useEffect(() => {
    try {
      const parsed = rulesJson ? JSON.parse(rulesJson) : {};
      setRulesObj(parsed);
    } catch (e) {
      // invalid JSON: do not override rulesObj
    }
  }, [rulesJson]);

  return (
    <Box>
  <Typography variant="h4" gutterBottom sx={{ color: '#ffffff', fontWeight: 600 }}>
        Table Configuration
      </Typography>
      
      <Typography variant="subtitle1" gutterBottom sx={{ color: '#94a3b8' }}>
        Configure validation rules and notification settings for each table
      </Typography>

  <Paper 
        sx={{ 
          p: 3, 
          mt: 3,
          backgroundColor: '#1a1a2e',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <Grid container spacing={3}>
          {/* Table Selection */}
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Select Table</InputLabel>
              <Select
                value={selectedTable}
                label="Select Table"
                onChange={(e) => setSelectedTable(e.target.value)}
              >
                {loadingTables ? (
                  <MenuItem value="">Loading...</MenuItem>
                ) : (
                  tables.map((table) => (
                    <MenuItem key={table.name} value={table.name}>
                      {table.name}
                    </MenuItem>
                  ))
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* Error Threshold */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Error Threshold"
              type="number"
              value={errorThreshold}
              onChange={(e) => setErrorThreshold(parseInt(e.target.value) || 0)}
              helperText="Number of anomalies before marking as error"
            />
          </Grid>

          {/* Validation Types */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel>Validation Types</InputLabel>
              <Select
                multiple
                value={validationTypes}
                label="Validation Types"
                onChange={(e) => setValidationTypes(e.target.value)}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {(Array.isArray(selected) ? selected : []).map((value) => (
                      <Chip key={String(value)} label={String(value || '').replace('_', ' ')} size="small" />
                    ))}
                  </Box>
                )}
              >
                {availableValidationTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          {/* Email Recipients */}
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Email Recipients"
              multiline
              rows={2}
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              helperText="Enter email addresses separated by commas"
              placeholder="admin@company.com, data-team@company.com"
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Metrics (comma separated)"
              value={metrics.join(', ')}
              onChange={(e) => setMetrics(e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
              helperText="Metrics used by validator, e.g. revenue, earnings"
            />
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Rules (JSON)"
              multiline
              minRows={4}
              value={rulesJson}
              onChange={(e) => setRulesJson(e.target.value)}
              helperText="Advanced rules JSON. 'metrics' field will be synced with Metrics input above."
            />
          </Grid>

          {/* Dynamic thresholds editor (numeric keys in rules) */}
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>Thresholds</Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {Object.entries(rulesObj || {}).filter(([k, v]) => typeof v === 'number').map(([key, val]) => (
                <Box key={key} sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <TextField
                    size="small"
                    label={key}
                    value={String(val)}
                    type="number"
                    onChange={(e) => {
                      const copy = { ...(rulesObj || {}) };
                      const num = Number(e.target.value);
                      copy[key] = Number.isNaN(num) ? 0 : num;
                      setRulesObj(copy);
                      setRulesJson(JSON.stringify(copy, null, 2));
                    }}
                    sx={{ width: 240 }}
                  />
                  <Button size="small" color="error" onClick={() => {
                    const copy = { ...(rulesObj || {}) };
                    delete copy[key];
                    setRulesObj(copy);
                    setRulesJson(JSON.stringify(copy, null, 2));
                  }}>Remove</Button>
                </Box>
              ))}

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', mt: 1 }}>
                <TextField size="small" label="key" value={newThresholdKey} onChange={(e) => setNewThresholdKey(e.target.value)} sx={{ width: 180 }} />
                <TextField size="small" label="value" value={newThresholdValue} onChange={(e) => setNewThresholdValue(e.target.value)} type="number" sx={{ width: 120 }} />
                <Button size="small" variant="outlined" onClick={() => {
                  if (!newThresholdKey) return;
                  const copy = { ...(rulesObj || {}) };
                  const num = Number(newThresholdValue || 0);
                  copy[newThresholdKey] = Number.isNaN(num) ? 0 : num;
                  setRulesObj(copy);
                  setRulesJson(JSON.stringify(copy, null, 2));
                  setNewThresholdKey('');
                  setNewThresholdValue('');
                }}>Add Threshold</Button>
              </Box>
            </Box>
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  // reload selected table config
                  if (selectedTable) setSelectedTable('');
                  setTimeout(() => setSelectedTable(prev => prev || ''), 50);
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={async () => {
                  // Save handler
                  if (!selectedTable) return;
                  let parsedRules = {};
                  try {
                    parsedRules = JSON.parse(rulesJson || '{}');
                  } catch (e) {
                    console.error('Invalid rules JSON', e);
                    alert('Rules JSON is invalid. Fix syntax before saving.');
                    return;
                  }

                  // Ensure metrics from input are set in rules
                  parsedRules.metrics = metrics;

                  const payload = {
                    validation_rules: parsedRules,
                    validation_types: validationTypes,
                    email_recipients: emailRecipients.split(',').map(s => s.trim()).filter(Boolean),
                    error_threshold: errorThreshold,
                    enabled: true
                  };

                  try {
                    await validationAPI.saveTableConfig(selectedTable, payload);
                    setSaveSuccess(true);
                    setTimeout(() => setSaveSuccess(false), 3000);
                  } catch (err) {
                    console.error('Save failed', err);
                    alert('Failed to save configuration');
                  }
                }}
                disabled={!selectedTable}
              >
                Save Configuration
              </Button>
            </Box>
          </Grid>
        </Grid>

        {saveSuccess && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Configuration saved successfully!
          </Alert>
        )}
      </Paper>

      {/* Configuration Preview */}
      {selectedTable && (
        <Paper 
          sx={{ 
            p: 3, 
            mt: 3,
            backgroundColor: '#1a1a2e',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <Typography variant="h6" gutterBottom>
            Configuration Preview
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Table:</Typography>
              <Typography>{selectedTable}</Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2">Error Threshold:</Typography>
              <Typography>{errorThreshold} anomalies</Typography>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2">Validation Types:</Typography>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                {validationTypes.map((type) => (
                  <Chip 
                    key={String(type)} 
                    label={String(type || '').replace('_', ' ')} 
                    color="primary" 
                    size="small" 
                  />
                ))}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <Typography variant="subtitle2">Email Recipients:</Typography>
              <Typography>
                {emailRecipients || 'No recipients configured'}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
}

export default TableConfiguration;
