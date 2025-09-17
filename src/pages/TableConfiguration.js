import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EmailIcon from '@mui/icons-material/Email';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import RefreshIcon from '@mui/icons-material/Refresh';
import SaveIcon from '@mui/icons-material/Save';
import SettingsIcon from '@mui/icons-material/Settings';
import TableChartIcon from '@mui/icons-material/TableChart';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  CircularProgress,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import { useEffect, useState } from 'react';
import { validationAPI } from '../services/api';

function TableConfiguration() {
  const [selectedTable, setSelectedTable] = useState('');
  const [emailRecipients, setEmailRecipients] = useState('');
  const [errorThreshold, setErrorThreshold] = useState(5);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [tables, setTables] = useState([]);
  const [loadingTables, setLoadingTables] = useState(false);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [rulesJson, setRulesJson] = useState('');
  const [rulesObj, setRulesObj] = useState({});
  const [newThresholdKey, setNewThresholdKey] = useState('');
  const [newThresholdValue, setNewThresholdValue] = useState('');
  const [errors, setErrors] = useState({});
  const [jsonError, setJsonError] = useState('');
  const [activeStep, setActiveStep] = useState(0);

  const steps = ['Select Table', 'Configure Settings', 'Set Rules', 'Review & Save'];

  // Email validation function
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Form validation function
  const validateForm = () => {
    const newErrors = {};
    
    if (!selectedTable) {
      newErrors.table = 'Please select a table';
    }
    
    if (errorThreshold < 0 || errorThreshold > 1000) {
      newErrors.threshold = 'Threshold must be between 0 and 1000';
    }
    
    if (emailRecipients) {
      const emails = emailRecipients.split(',').map(s => s.trim()).filter(Boolean);
      const invalidEmails = emails.filter(email => !validateEmail(email));
      if (invalidEmails.length > 0) {
        newErrors.email = `Invalid email format: ${invalidEmails.join(', ')}`;
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // JSON validation
  const validateJson = (jsonString) => {
    try {
      JSON.parse(jsonString || '{}');
      setJsonError('');
      return true;
    } catch (e) {
      setJsonError(`Invalid JSON: ${e.message}`);
      return false;
    }
  };

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
    
    setLoadingConfig(true);
    setErrors({});
    
    validationAPI.getTableConfig(selectedTable)
      .then(res => {
        const cfg = res.data || res; // backend returns object directly
        // rules may be under rules, config_data, or validation_rules
        const rules = cfg.rules || cfg.config_data || cfg.validation_rules || {};
        const emails = cfg.email_recipients || cfg.emailRecipients || [];
        const threshold = cfg.error_threshold || cfg.errorThreshold || cfg.error_threshold || 5;

        setRulesJson(JSON.stringify(rules, null, 2));
        // also set parsed object
        try {
          setRulesObj(typeof rules === 'object' ? rules : JSON.parse(JSON.stringify(rules)));
        } catch (e) {
          setRulesObj({});
        }
        setEmailRecipients(Array.isArray(emails) ? emails.join(', ') : emails || '');
        setErrorThreshold(threshold);
        
        // Auto advance to next step if this is first time selecting table
        // Use functional state updater to avoid referencing `activeStep` from closure
        setActiveStep(prev => (prev === 0 ? 1 : prev));
      })
      .catch(err => {
        console.error('Failed to load table config', err);
        // Reset to defaults
        setRulesJson('{}');
        setEmailRecipients('');
        setErrorThreshold(5);
        setErrors({ table: 'Failed to load table configuration' });
      })
      .finally(() => {
        setLoadingConfig(false);
      });
  }, [selectedTable]);

  // keep rulesObj and rulesJson in sync when rulesJson is edited manually
  useEffect(() => {
    if (validateJson(rulesJson)) {
      try {
        const parsed = rulesJson ? JSON.parse(rulesJson) : {};
        setRulesObj(parsed);
      } catch (e) {
        // Should not happen if validateJson passed, but just in case
        setRulesObj({});
      }
    }
  }, [rulesJson]);

  return (
    <Box sx={{ maxWidth: 1200, mx: 'auto' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom sx={{ color: '#ffffff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 2 }}>
          <SettingsIcon sx={{ fontSize: 40 }} />
          Table Configuration
        </Typography>
        
        <Typography variant="subtitle1" gutterBottom sx={{ color: '#94a3b8', mb: 3 }}>
          Configure validation rules and notification settings for your data tables
        </Typography>

        {/* Progress Stepper */}
        <Paper sx={{ p: 2, backgroundColor: '#1a1a2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label, index) => (
              <Step key={label}>
                <StepLabel 
                  sx={{
                    '& .MuiStepLabel-label': { color: '#94a3b8' },
                    '& .MuiStepLabel-label.Mui-active': { color: '#3b82f6' },
                    '& .MuiStepLabel-label.Mui-completed': { color: '#10b981' }
                  }}
                >
                  {label}
                </StepLabel>
              </Step>
            ))}
          </Stepper>
        </Paper>
      </Box>

      {/* Step 1: Table Selection */}
      <Card sx={{ mb: 3, backgroundColor: '#1a1a2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
        <CardHeader 
          avatar={<TableChartIcon sx={{ color: '#3b82f6' }} />}
          title={
            <Typography variant="h6" sx={{ color: '#ffffff' }}>
              Step 1: Select Table
            </Typography>
          }
          subheader={
            <Typography variant="body2" sx={{ color: '#94a3b8' }}>
              Choose the data table you want to configure validation rules for
            </Typography>
          }
        />
        <CardContent>
          <FormControl fullWidth error={!!errors.table}>
            <InputLabel>Select Table</InputLabel>
            <Select
              value={selectedTable}
              label="Select Table"
              onChange={(e) => {
                setSelectedTable(e.target.value);
                setErrors(prev => ({ ...prev, table: '' }));
              }}
              startAdornment={
                loadingTables && (
                  <InputAdornment position="start">
                    <CircularProgress size={20} />
                  </InputAdornment>
                )
              }
            >
              {loadingTables ? (
                <MenuItem value="">
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CircularProgress size={16} />
                    Loading tables...
                  </Box>
                </MenuItem>
              ) : tables.length === 0 ? (
                <MenuItem value="">No tables available</MenuItem>
              ) : (
                tables.map((table) => (
                  <MenuItem key={table.name} value={table.name}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <TableChartIcon sx={{ fontSize: 16 }} />
                      {table.name}
                    </Box>
                  </MenuItem>
                ))
              )}
            </Select>
            {errors.table && <FormHelperText>{errors.table}</FormHelperText>}
          </FormControl>
          
          {loadingConfig && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 1 }}>
              <CircularProgress size={16} />
              <Typography variant="body2" sx={{ color: '#3b82f6' }}>
                Loading table configuration...
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Basic Configuration */}
      {selectedTable && (
        <Card sx={{ mb: 3, backgroundColor: '#1a1a2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardHeader 
            avatar={<SettingsIcon sx={{ color: '#10b981' }} />}
            title={
              <Typography variant="h6" sx={{ color: '#ffffff' }}>
                Step 2: Basic Settings
              </Typography>
            }
            subheader={
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Configure error threshold and notification settings
              </Typography>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* Error Threshold */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Error Threshold"
                  type="number"
                  value={errorThreshold}
                  onChange={(e) => {
                    setErrorThreshold(parseInt(e.target.value) || 0);
                    setErrors(prev => ({ ...prev, threshold: '' }));
                  }}
                  error={!!errors.threshold}
                  helperText={errors.threshold || "Number of anomalies before marking as error"}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <ErrorIcon sx={{ color: '#ef4444' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>

              {/* Email Recipients */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Email Recipients"
                  value={emailRecipients}
                  onChange={(e) => {
                    setEmailRecipients(e.target.value);
                    setErrors(prev => ({ ...prev, email: '' }));
                  }}
                  error={!!errors.email}
                  helperText={errors.email || "Enter email addresses separated by commas"}
                  placeholder="admin@company.com, data-team@company.com"
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailIcon sx={{ color: '#3b82f6' }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Rules Configuration */}
      {selectedTable && (
        <Card sx={{ mb: 3, backgroundColor: '#1a1a2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardHeader 
            avatar={<InfoIcon sx={{ color: '#f59e0b' }} />}
            title={
              <Typography variant="h6" sx={{ color: '#ffffff' }}>
                Step 3: Validation Rules
              </Typography>
            }
            subheader={
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Define custom validation rules and thresholds
              </Typography>
            }
          />
          <CardContent>
            <Grid container spacing={3}>
              {/* Rules JSON Editor */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Rules (JSON)"
                  multiline
                  minRows={6}
                  value={rulesJson}
                  onChange={(e) => {
                    setRulesJson(e.target.value);
                    validateJson(e.target.value);
                  }}
                  error={!!jsonError}
                  helperText={jsonError || "Advanced rules configuration in JSON format"}
                  sx={{
                    '& .MuiInputBase-input': {
                      fontFamily: 'monospace',
                      fontSize: '14px',
                    }
                  }}
                />
              </Grid>

              {/* Dynamic Thresholds Editor */}
              <Grid item xs={12}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <SettingsIcon sx={{ fontSize: 18 }} />
                    Quick Threshold Settings
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#94a3b8', mb: 2 }}>
                    Manage numeric thresholds without editing JSON directly
                  </Typography>
                </Box>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {Object.entries(rulesObj || {}).filter(([k, v]) => typeof v === 'number').map(([key, val]) => (
                    <Box key={key} sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
                      <TextField
                        size="small"
                        label={key.charAt(0).toUpperCase() + key.slice(1)}
                        value={String(val)}
                        type="number"
                        onChange={(e) => {
                          const copy = { ...(rulesObj || {}) };
                          const num = Number(e.target.value);
                          copy[key] = Number.isNaN(num) ? 0 : num;
                          setRulesObj(copy);
                          setRulesJson(JSON.stringify(copy, null, 2));
                        }}
                        sx={{ flex: 1 }}
                      />
                      <Tooltip title="Remove this threshold">
                        <IconButton 
                          size="small" 
                          color="error" 
                          onClick={() => {
                            const copy = { ...(rulesObj || {}) };
                            delete copy[key];
                            setRulesObj(copy);
                            setRulesJson(JSON.stringify(copy, null, 2));
                          }}
                        >
                          <ErrorIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  ))}

                  {/* Add New Threshold */}
                  <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', p: 2, backgroundColor: 'rgba(59, 130, 246, 0.1)', borderRadius: 1, border: '1px dashed rgba(59, 130, 246, 0.3)' }}>
                    <TextField 
                      size="small" 
                      label="Threshold Name" 
                      value={newThresholdKey} 
                      onChange={(e) => setNewThresholdKey(e.target.value)} 
                      sx={{ flex: 1 }} 
                      placeholder="e.g., max_revenue_change"
                    />
                    <TextField 
                      size="small" 
                      label="Value" 
                      value={newThresholdValue} 
                      onChange={(e) => setNewThresholdValue(e.target.value)} 
                      type="number" 
                      sx={{ width: 120 }} 
                      placeholder="0.05"
                    />
                    <Button 
                      size="small" 
                      variant="outlined" 
                      onClick={() => {
                        if (!newThresholdKey.trim()) return;
                        const copy = { ...(rulesObj || {}) };
                        const num = Number(newThresholdValue || 0);
                        copy[newThresholdKey.trim()] = Number.isNaN(num) ? 0 : num;
                        setRulesObj(copy);
                        setRulesJson(JSON.stringify(copy, null, 2));
                        setNewThresholdKey('');
                        setNewThresholdValue('');
                      }}
                      disabled={!newThresholdKey.trim()}
                    >
                      Add
                    </Button>
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* Step 4: Review & Save */}
      {selectedTable && (
        <Card sx={{ mb: 3, backgroundColor: '#1a1a2e', border: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <CardHeader 
            avatar={<CheckCircleIcon sx={{ color: '#10b981' }} />}
            title={
              <Typography variant="h6" sx={{ color: '#ffffff' }}>
                Step 4: Review & Save Configuration
              </Typography>
            }
            subheader={
              <Typography variant="body2" sx={{ color: '#94a3b8' }}>
                Review your settings and save the configuration
              </Typography>
            }
          />
          <CardContent>
            {/* Configuration Preview */}
            <Box sx={{ mb: 3, p: 3, backgroundColor: 'rgba(255, 255, 255, 0.05)', borderRadius: 1 }}>
              <Typography variant="h6" gutterBottom sx={{ color: '#ffffff', mb: 2 }}>
                Configuration Summary
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <TableChartIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                    <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>Table:</Typography>
                  </Box>
                  <Typography sx={{ color: '#ffffff', ml: 3 }}>{selectedTable}</Typography>
                </Grid>
                
                <Grid item xs={12} sm={6}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <ErrorIcon sx={{ fontSize: 16, color: '#ef4444' }} />
                    <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>Error Threshold:</Typography>
                  </Box>
                  <Typography sx={{ color: '#ffffff', ml: 3 }}>{errorThreshold} anomalies</Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <EmailIcon sx={{ fontSize: 16, color: '#3b82f6' }} />
                    <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>Email Recipients:</Typography>
                  </Box>
                  <Typography sx={{ color: '#ffffff', ml: 3 }}>
                    {emailRecipients || 'No recipients configured'}
                  </Typography>
                </Grid>
                
                <Grid item xs={12}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <InfoIcon sx={{ fontSize: 16, color: '#f59e0b' }} />
                    <Typography variant="subtitle2" sx={{ color: '#94a3b8' }}>Active Thresholds:</Typography>
                  </Box>
                  <Box sx={{ ml: 3 }}>
                    {Object.entries(rulesObj || {}).filter(([k, v]) => typeof v === 'number').length === 0 ? (
                      <Typography sx={{ color: '#94a3b8', fontStyle: 'italic' }}>No custom thresholds configured</Typography>
                    ) : (
                      Object.entries(rulesObj || {}).filter(([k, v]) => typeof v === 'number').map(([key, val]) => (
                        <Typography key={key} sx={{ color: '#ffffff', fontSize: '0.9em' }}>
                          • {key}: {val}
                        </Typography>
                      ))
                    )}
                  </Box>
                </Grid>
              </Grid>
            </Box>

            {/* Action Buttons */}
            <Box display="flex" justifyContent="space-between" gap={2}>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={() => {
                  setSelectedTable('');
                  setActiveStep(0);
                  setErrors({});
                  setJsonError('');
                }}
              >
                Start Over
              </Button>
              
              <Box display="flex" gap={2}>
                <Button
                  variant="outlined"
                  onClick={() => {
                    if (!validateForm()) return;
                    setActiveStep(Math.max(0, activeStep - 1));
                  }}
                  disabled={activeStep === 0}
                >
                  Previous
                </Button>
                
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} /> : <SaveIcon />}
                  onClick={async () => {
                    if (!validateForm() || !validateJson(rulesJson)) return;
                    
                    setSaving(true);
                    let parsedRules = {};
                    try {
                      parsedRules = JSON.parse(rulesJson || '{}');
                    } catch (e) {
                      console.error('Invalid rules JSON', e);
                      setSaving(false);
                      return;
                    }

                    const payload = {
                      validation_rules: parsedRules,
                      email_recipients: emailRecipients.split(',').map(s => s.trim()).filter(Boolean),
                      error_threshold: errorThreshold,
                      enabled: true
                    };

                    try {
                      await validationAPI.saveTableConfig(selectedTable, payload);
                      setSaveSuccess(true);
                      setActiveStep(4); // Complete step
                      setTimeout(() => setSaveSuccess(false), 5000);
                    } catch (err) {
                      console.error('Save failed', err);
                      setErrors({ save: 'Failed to save configuration. Please try again.' });
                    } finally {
                      setSaving(false);
                    }
                  }}
                  disabled={!selectedTable || saving || !!jsonError}
                >
                  {saving ? 'Saving...' : 'Save Configuration'}
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {saveSuccess && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            '& .MuiAlert-message': { color: '#10b981' }
          }}
          onClose={() => setSaveSuccess(false)}
        >
          Configuration saved successfully! Your validation rules are now active.
        </Alert>
      )}

      {/* Error Messages */}
      {errors.save && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: 3,
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            '& .MuiAlert-message': { color: '#ef4444' }
          }}
          onClose={() => setErrors(prev => ({ ...prev, save: '' }))}
        >
          {errors.save}
        </Alert>
      )}
    </Box>
  );
}

export default TableConfiguration;
