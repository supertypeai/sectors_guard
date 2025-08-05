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
    Typography,
} from '@mui/material';
import { useState } from 'react';

function TableConfiguration() {
  const [selectedTable, setSelectedTable] = useState('');
  const [validationTypes, setValidationTypes] = useState([]);
  const [emailRecipients, setEmailRecipients] = useState('');
  const [errorThreshold, setErrorThreshold] = useState(5);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const availableValidationTypes = [
    'statistical',
    'business_rules',
    'data_quality',
    'time_series',
  ];

  const sampleTables = [
    'users',
    'transactions',
    'products',
    'orders',
    'inventory',
  ];

  const handleValidationTypeChange = (event) => {
    setValidationTypes(event.target.value);
  };

  const handleSaveConfiguration = () => {
    // This would typically make an API call to save the configuration
    console.log('Saving configuration:', {
      table: selectedTable,
      validationTypes,
      emailRecipients: emailRecipients.split(',').map(email => email.trim()),
      errorThreshold,
    });
    
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Table Configuration
      </Typography>
      
      <Typography variant="subtitle1" color="textSecondary" gutterBottom>
        Configure validation rules and notification settings for each table
      </Typography>

      <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
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
                {sampleTables.map((table) => (
                  <MenuItem key={table} value={table}>
                    {table}
                  </MenuItem>
                ))}
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
              onChange={(e) => setErrorThreshold(parseInt(e.target.value))}
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
                onChange={handleValidationTypeChange}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((value) => (
                      <Chip key={value} label={value.replace('_', ' ')} size="small" />
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
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Recipients"
              multiline
              rows={3}
              value={emailRecipients}
              onChange={(e) => setEmailRecipients(e.target.value)}
              helperText="Enter email addresses separated by commas"
              placeholder="admin@company.com, data-team@company.com"
            />
          </Grid>

          {/* Save Button */}
          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="outlined"
                onClick={() => {
                  setSelectedTable('');
                  setValidationTypes([]);
                  setEmailRecipients('');
                  setErrorThreshold(5);
                }}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                onClick={handleSaveConfiguration}
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
        <Paper elevation={3} sx={{ p: 3, mt: 3 }}>
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
                    key={type} 
                    label={type.replace('_', ' ')} 
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
