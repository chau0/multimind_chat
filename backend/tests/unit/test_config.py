import pytest
from unittest.mock import patch, MagicMock
from app.config import Settings


class TestSettings:

    def test_settings_default_values(self):
        """Test default configuration values."""
        # Create settings with explicit empty values to override any env vars
        settings = Settings(
            database_url=None,
            supabase_url=None,
            supabase_key=None,
            openai_api_key=None,
            azure_openai_endpoint=None,
            azure_openai_api_key=None,
            debug=False,  # Override env var
        )

        assert settings.environment == "development"
        assert settings.debug is False
        assert settings.cors_origins == [
            "http://localhost:3000",
            "http://localhost:5173",
        ]
        assert settings.log_level == "INFO"
        assert settings.log_dir == "logs"
        assert settings.log_max_files == 30
        assert settings.log_enable_console is True
        assert settings.azure_openai_api_version == "2024-12-01-preview"

    def test_effective_database_url_direct(self):
        """Test effective_database_url with direct DATABASE_URL."""
        settings = Settings(database_url="postgresql://user:pass@host:5432/db")

        result = settings.effective_database_url
        assert result == "postgresql://user:pass@host:5432/db"

    def test_effective_database_url_supabase(self):
        """Test effective_database_url with Supabase configuration."""
        settings = Settings(
            database_url=None,  # Override env var
            supabase_url="https://test-project.supabase.co",
            supabase_key="test-key",
        )

        result = settings.effective_database_url
        expected = (
            "postgresql://postgres:test-key@db.test-project.supabase.co:5432/postgres"
        )
        assert result == expected

    def test_effective_database_url_azure_sql(self):
        """Test effective_database_url with Azure SQL configuration."""
        settings = Settings(
            database_url=None,  # Override env var
            supabase_url=None,  # Override env var
            supabase_key=None,  # Override env var
            azure_sql_server="test-server.database.windows.net",
            azure_sql_database="test-db",
            azure_sql_username="test-user",
            azure_sql_password="test-pass",
        )

        result = settings.effective_database_url

        # Should contain the basic components
        assert "mssql+pyodbc://" in result
        assert "test-server.database.windows.net" in result
        assert "test-db" in result
        assert "TrustServerCertificate=yes" in result

    def test_effective_database_url_no_config(self):
        """Test effective_database_url raises error when no config provided."""
        settings = Settings(
            database_url=None,
            supabase_url=None,
            supabase_key=None,
            azure_sql_server=None,
            azure_sql_database=None,
            azure_sql_username=None,
            azure_sql_password=None,
        )

        with pytest.raises(ValueError, match="No database configuration found"):
            _ = settings.effective_database_url

    def test_effective_async_database_url_postgresql(self):
        """Test effective_async_database_url with PostgreSQL URL."""
        settings = Settings(database_url="postgresql://user:pass@host:5432/db")

        result = settings.effective_async_database_url
        assert result == "postgresql+asyncpg://user:pass@host:5432/db"

    def test_effective_async_database_url_supabase(self):
        """Test effective_async_database_url with Supabase configuration."""
        settings = Settings(
            database_url=None,  # Override env var
            supabase_url="https://test-project.supabase.co",
            supabase_key="test-key",
        )

        result = settings.effective_async_database_url
        expected = "postgresql+asyncpg://postgres:test-key@db.test-project.supabase.co:5432/postgres"
        assert result == expected

    def test_effective_async_database_url_azure_sql(self):
        """Test effective_async_database_url with Azure SQL configuration."""
        settings = Settings(
            database_url=None,  # Override env var
            supabase_url=None,  # Override env var
            supabase_key=None,  # Override env var
            azure_sql_server="test-server.database.windows.net",
            azure_sql_database="test-db",
            azure_sql_username="test-user",
            azure_sql_password="test-pass",
        )

        result = settings.effective_async_database_url

        # Should contain async driver
        assert "mssql+aioodbc://" in result
        assert "test-server.database.windows.net" in result

    def test_build_azure_sql_url_encoding(self):
        """Test Azure SQL URL building with special characters."""
        settings = Settings(
            azure_sql_server="test-server.database.windows.net",
            azure_sql_database="test-db",
            azure_sql_username="test@user",
            azure_sql_password="pass@word#123",
        )

        result = settings._build_azure_sql_url()

        # Special characters should be URL encoded
        assert "test%40user" in result  # @ encoded
        assert "pass%40word%23123" in result  # @ and # encoded

    def test_is_using_azure_openai_true(self):
        """Test is_using_azure_openai returns True when Azure config present."""
        settings = Settings(
            azure_openai_endpoint="https://test.openai.azure.com/",
            azure_openai_api_key="test-key",
        )

        assert settings.is_using_azure_openai is True

    def test_is_using_azure_openai_false(self):
        """Test is_using_azure_openai returns False when Azure config missing."""
        settings = Settings(azure_openai_endpoint=None, azure_openai_api_key=None)
        assert settings.is_using_azure_openai is False

    def test_is_using_azure_openai_partial_config(self, isolated_settings):
        """Test is_using_azure_openai with partial Azure config."""
        TestSettings = isolated_settings

        # Only endpoint, no key
        settings1 = TestSettings(
            azure_openai_endpoint="https://test.openai.azure.com/",
            azure_openai_api_key=None,
        )
        assert settings1.is_using_azure_openai is False

        # Only key, no endpoint
        settings2 = TestSettings(
            azure_openai_endpoint=None, azure_openai_api_key="test-key"
        )
        assert settings2.is_using_azure_openai is False

    def test_effective_openai_api_key_azure(self):
        """Test effective_openai_api_key with Azure OpenAI."""
        settings = Settings(
            azure_openai_endpoint="https://test.openai.azure.com/",
            azure_openai_api_key="azure-key",
        )

        result = settings.effective_openai_api_key
        assert result == "azure-key"

    def test_effective_openai_api_key_standard(self, isolated_settings):
        """Test effective_openai_api_key with standard OpenAI."""
        TestSettings = isolated_settings
        settings = TestSettings(
            openai_api_key="sk-standard-key",
            azure_openai_endpoint=None,
            azure_openai_api_key=None,
        )

        result = settings.effective_openai_api_key
        assert result == "sk-standard-key"

    def test_effective_openai_api_key_no_config(self, isolated_settings):
        """Test effective_openai_api_key raises error when no key configured."""
        TestSettings = isolated_settings
        settings = TestSettings(
            openai_api_key=None, azure_openai_endpoint=None, azure_openai_api_key=None
        )

        with pytest.raises(ValueError, match="No OpenAI API key configured"):
            _ = settings.effective_openai_api_key

    def test_supabase_url_parsing(self, isolated_settings):
        """Test Supabase URL parsing extracts project reference correctly."""
        TestSettings = isolated_settings
        settings = TestSettings(
            database_url=None,
            supabase_url="https://abcdefghijklmnop.supabase.co",
            supabase_key="test-key",
        )

        result = settings.effective_database_url
        assert "db.abcdefghijklmnop.supabase.co" in result

    def test_cors_origins_configuration(self):
        """Test CORS origins configuration."""
        custom_origins = ["https://myapp.com", "https://staging.myapp.com"]
        settings = Settings(cors_origins=custom_origins)

        assert settings.cors_origins == custom_origins

    def test_environment_configuration(self):
        """Test environment configuration options."""
        # Development
        dev_settings = Settings(environment="development")
        assert dev_settings.environment == "development"

        # Production
        prod_settings = Settings(environment="production")
        assert prod_settings.environment == "production"

        # Test
        test_settings = Settings(environment="test")
        assert test_settings.environment == "test"

    def test_debug_configuration(self):
        """Test debug mode configuration."""
        # Debug enabled
        debug_settings = Settings(debug=True)
        assert debug_settings.debug is True

        # Debug disabled
        no_debug_settings = Settings(debug=False)
        assert no_debug_settings.debug is False

    def test_logging_configuration(self):
        """Test logging configuration options."""
        settings = Settings(
            log_level="DEBUG",
            log_dir="custom_logs",
            log_max_files=50,
            log_enable_console=False,
        )

        assert settings.log_level == "DEBUG"
        assert settings.log_dir == "custom_logs"
        assert settings.log_max_files == 50
        assert settings.log_enable_console is False

    def test_azure_openai_configuration(self):
        """Test Azure OpenAI specific configuration."""
        settings = Settings(
            azure_openai_endpoint="https://custom.openai.azure.com/",
            azure_openai_api_key="custom-key",
            azure_openai_deployment="custom-deployment",
            azure_openai_api_version="2024-06-01",
        )

        assert settings.azure_openai_endpoint == "https://custom.openai.azure.com/"
        assert settings.azure_openai_api_key == "custom-key"
        assert settings.azure_openai_deployment == "custom-deployment"
        assert settings.azure_openai_api_version == "2024-06-01"

    @patch.dict(
        "os.environ",
        {
            "DATABASE_URL": "postgresql://env:pass@host:5432/db",
            "OPENAI_API_KEY": "sk-env-key",
            "ENVIRONMENT": "production",
        },
    )
    def test_settings_from_environment(self):
        """Test settings loading from environment variables."""
        settings = Settings()

        assert settings.database_url == "postgresql://env:pass@host:5432/db"
        assert settings.openai_api_key == "sk-env-key"
        assert settings.environment == "production"
