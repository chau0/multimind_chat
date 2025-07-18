from pydantic_settings import BaseSettings
from typing import Optional
import urllib.parse

class Settings(BaseSettings):
    # Azure SQL Database configuration
    azure_sql_server: str
    azure_sql_database: str
    azure_sql_username: str
    azure_sql_password: str
    azure_sql_driver: str = "ODBC Driver 18 for SQL Server"
    
    # OpenAI configuration
    openai_api_key: str
    
    # Application configuration
    environment: str = "development"
    debug: bool = False
    
    class Config:
        env_file = ".env"
    
    @property
    def database_url(self) -> str:
        """Build Azure SQL Database connection string."""
        # URL encode password to handle special characters
        encoded_password = urllib.parse.quote_plus(self.azure_sql_password)
        encoded_username = urllib.parse.quote_plus(self.azure_sql_username)
        encoded_driver = urllib.parse.quote_plus(self.azure_sql_driver)
        
        return (
            f"mssql+pyodbc://{encoded_username}:{encoded_password}@"
            f"{self.azure_sql_server}/{self.azure_sql_database}?"
            f"driver={encoded_driver}&TrustServerCertificate=yes&Connection Timeout=30"
        )
    
    @property
    def async_database_url(self) -> str:
        """Build async Azure SQL Database connection string."""
        encoded_password = urllib.parse.quote_plus(self.azure_sql_password)
        encoded_username = urllib.parse.quote_plus(self.azure_sql_username)
        encoded_driver = urllib.parse.quote_plus(self.azure_sql_driver)
        
        return (
            f"mssql+aioodbc://{encoded_username}:{encoded_password}@"
            f"{self.azure_sql_server}/{self.azure_sql_database}?"
            f"driver={encoded_driver}&TrustServerCertificate=yes&Connection Timeout=30"
        )

settings = Settings()
