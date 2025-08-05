"""
Basic test cases for the data validation system
"""

import pytest
import asyncio
import pandas as pd
from unittest.mock import Mock, patch
import sys
import os

# Add the app directory to the Python path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'app'))

from app.validators.data_validator import DataValidator

class TestDataValidator:
    """Test cases for the DataValidator class"""
    
    @pytest.fixture
    def validator(self):
        """Create a DataValidator instance for testing"""
        return DataValidator()
    
    @pytest.fixture
    def sample_data(self):
        """Create sample data for testing"""
        return pd.DataFrame({
            'id': [1, 2, 3, 4, 5],
            'email': ['user1@test.com', 'user2@test.com', 'invalid-email', 'user4@test.com', 'user5@test.com'],
            'amount': [100, 200, 1000000, 300, 250],  # One outlier
            'created_at': ['2025-08-01', '2025-08-02', '2025-08-03', '2025-08-04', '2025-08-05']
        })
    
    def test_get_default_config_users_table(self, validator):
        """Test default configuration for users table"""
        config = validator._get_default_config("users")
        
        assert "data_quality" in config["types"]
        assert "business_rules" in config["types"]
        assert config["error_threshold"] == 5
        assert "email_format" in config["rules"]
    
    def test_get_default_config_transactions_table(self, validator):
        """Test default configuration for transactions table"""
        config = validator._get_default_config("transactions")
        
        assert "statistical" in config["types"]
        assert "time_series" in config["types"]
        assert "time_column" in config
        assert config["time_column"] == "created_at"
    
    @pytest.mark.asyncio
    async def test_statistical_validation_outliers(self, validator, sample_data):
        """Test statistical validation detects outliers"""
        result = await validator._statistical_validation(sample_data, "test_table")
        
        anomalies = result["anomalies"]
        assert len(anomalies) > 0
        
        # Should detect outlier in amount column
        amount_anomalies = [a for a in anomalies if a["column"] == "amount"]
        assert len(amount_anomalies) > 0
        assert amount_anomalies[0]["type"] == "statistical_outlier"
    
    @pytest.mark.asyncio
    async def test_data_quality_validation_email_format(self, validator, sample_data):
        """Test data quality validation detects invalid email formats"""
        result = await validator._data_quality_validation(sample_data)
        
        anomalies = result["anomalies"]
        email_anomalies = [a for a in anomalies if a["type"] == "invalid_email_format"]
        
        assert len(email_anomalies) > 0
        assert email_anomalies[0]["count"] == 1  # One invalid email
    
    @pytest.mark.asyncio
    async def test_business_rule_validation_duplicates(self, validator):
        """Test business rule validation detects duplicates"""
        data_with_duplicates = pd.DataFrame({
            'id': [1, 2, 3, 4, 5],
            'email': ['user1@test.com', 'user2@test.com', 'user1@test.com', 'user4@test.com', 'user5@test.com']
        })
        
        rules = {"no_duplicates": ["email"]}
        result = await validator._business_rule_validation(data_with_duplicates, rules)
        
        anomalies = result["anomalies"]
        duplicate_anomalies = [a for a in anomalies if a["type"] == "duplicate_values"]
        
        assert len(duplicate_anomalies) > 0
        assert duplicate_anomalies[0]["column"] == "email"
    
    @pytest.mark.asyncio
    async def test_business_rule_validation_missing_fields(self, validator, sample_data):
        """Test business rule validation detects missing required fields"""
        rules = {"required_fields": ["email", "missing_field"]}
        result = await validator._business_rule_validation(sample_data, rules)
        
        anomalies = result["anomalies"]
        missing_field_anomalies = [a for a in anomalies if a["type"] == "missing_required_fields"]
        
        assert len(missing_field_anomalies) > 0
        assert "missing_field" in missing_field_anomalies[0]["fields"]
    
    @pytest.mark.asyncio
    async def test_empty_dataframe_handling(self, validator):
        """Test that validator handles empty DataFrames gracefully"""
        empty_df = pd.DataFrame()
        
        result = await validator._statistical_validation(empty_df, "empty_table")
        assert result["anomalies"] == []
        
        result = await validator._data_quality_validation(empty_df)
        assert result["anomalies"] == []
        
        result = await validator._business_rule_validation(empty_df, {})
        assert result["anomalies"] == []

@pytest.mark.asyncio 
async def test_validator_integration():
    """Integration test for the complete validation flow"""
    validator = DataValidator()
    
    # Mock the Supabase client to return test data
    with patch.object(validator, '_fetch_table_data') as mock_fetch:
        mock_fetch.return_value = pd.DataFrame({
            'id': [1, 2, 3],
            'email': ['test1@example.com', 'test2@example.com', 'invalid-email'],
            'amount': [100, 200, 300]
        })
        
        with patch.object(validator, '_store_validation_results') as mock_store:
            result = await validator.validate_table("test_table")
            
            assert result["table_name"] == "test_table"
            assert result["total_rows"] == 3
            assert "validation_timestamp" in result
            assert "status" in result
            
            # Should have stored the results
            mock_store.assert_called_once()

if __name__ == "__main__":
    pytest.main([__file__])
