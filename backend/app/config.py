from pydantic_settings import BaseSettings
from typing import Optional
import urllib.parse

class Settings(BaseSettings):
    # Database configuration - supports both PostgreSQL (Supabase) and Azure SQL
    database_url: Optional[str] = None
    
    # Supabase configuration
    supabase_url: Optional[str] = None
    supabase_key: Optional[str] = None
    
    # Legacy Azure SQL Database configuration (for backward compatibility)
    azure_sql_server: Optional[str] = None
    azure_sql_database: Optional[str] = None
    azure_sql_username: Optional[str] = None
    azure_sql_password: Optional[str] = None
    azure_sql_driver: str = "ODBC Driver 18 for SQL Server"
    
    # OpenAI configuration - supports both Azure OpenAI and standard OpenAI
    openai_api_key: Optional[str] = None
    azure_openai_endpoint: Optional[str] = None
    azure_openai_api_key: Optional[str] = None
    azure_openai_deployment: Optional[str] = None
    azure_openai_api_version: str = "2024-12-01-preview"
    
    # Application configuration
    environment: str = "development"
    debug: bool = False
    cors_origins: list[str] = ["http://localhost:3000", "http://localhost:5173"]
    
    # Logging configuration
    log_level: str = "INFO"
    log_dir: str = "logs"
    log_max_files: int = 30
    log_enable_console: bool = True
    
    class Config:
        env_file = ".env"
    
    @property
    def effective_database_url(self) -> str:
        """Get the effective database URL, preferring direct DATABASE_URL over Azure SQL config."""
        if self.database_url:
            return self.database_url
        
        # Check for Supabase configuration
        if self.supabase_url and self.supabase_key:
            # Extract database URL from Supabase URL
            # Supabase URL format: https://your-project.supabase.co
            # Database URL format: postgresql://postgres:[password]@db.your-project.supabase.co:5432/postgres
            project_ref = self.supabase_url.replace('https://', '').replace('.supabase.co', '')
            return f"postgresql://postgres:{self.supabase_key}@db.{project_ref}.supabase.co:5432/postgres"
        
        # Fallback to Azure SQL configuration
        if all([self.azure_sql_server, self.azure_sql_database, 
                self.azure_sql_username, self.azure_sql_password]):
            return self._build_azure_sql_url()
        
        raise ValueError("No database configuration found. Set DATABASE_URL, Supabase config, or Azure SQL config.")
    
    @property
    def effective_async_database_url(self) -> str:
        """Get the effective async database URL."""
        if self.database_url:
            # For PostgreSQL, use asyncpg driver for async operations
            if self.database_url.startswith("postgresql://"):
                return self.database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
            return self.database_url
        
        # Check for Supabase configuration
        if self.supabase_url and self.supabase_key:
            # Extract database URL from Supabase URL and use asyncpg
            project_ref = self.supabase_url.replace('https://', '').replace('.supabase.co', '')
            return f"postgresql+asyncpg://postgres:{self.supabase_key}@db.{project_ref}.supabase.co:5432/postgres"
        
        # Fallback to Azure SQL async configuration
        if all([self.azure_sql_server, self.azure_sql_database, 
                self.azure_sql_username, self.azure_sql_password]):
            return self._build_azure_sql_async_url()
        
        raise ValueError("No database configuration found. Set DATABASE_URL, Supabase config, or Azure SQL config.")
    
    def _build_azure_sql_url(self) -> str:
        """Build Azure SQL Database connection string."""
        encoded_password = urllib.parse.quote_plus(self.azure_sql_password)
        encoded_username = urllib.parse.quote_plus(self.azure_sql_username)
        encoded_driver = urllib.parse.quote_plus(self.azure_sql_driver)
        
        return (
            f"mssql+pyodbc://{encoded_username}:{encoded_password}@"
            f"{self.azure_sql_server}/{self.azure_sql_database}?"
            f"driver={encoded_driver}&TrustServerCertificate=yes&Connection Timeout=30"
        )
    
    def _build_azure_sql_async_url(self) -> str:
        """Build async Azure SQL Database connection string."""
        encoded_password = urllib.parse.quote_plus(self.azure_sql_password)
        encoded_username = urllib.parse.quote_plus(self.azure_sql_username)
        encoded_driver = urllib.parse.quote_plus(self.azure_sql_driver)
        
        return (
            f"mssql+aioodbc://{encoded_username}:{encoded_password}@"
            f"{self.azure_sql_server}/{self.azure_sql_database}?"
            f"driver={encoded_driver}&TrustServerCertificate=yes&Connection Timeout=30"
        )
    
    @property
    def is_using_azure_openai(self) -> bool:
        """Check if using Azure OpenAI instead of standard OpenAI."""
        return bool(self.azure_openai_endpoint and self.azure_openai_api_key)
    
    @property
    def effective_openai_api_key(self) -> str:
        """Get the effective OpenAI API key."""
        if self.is_using_azure_openai:
            return self.azure_openai_api_key
        if self.openai_api_key:
            return self.openai_api_key
        raise ValueError("No OpenAI API key configured. Set OPENAI_API_KEY or Azure OpenAI config.")

settings = Settings()
