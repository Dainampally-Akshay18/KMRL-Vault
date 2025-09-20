# app/config.py

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from urllib.parse import quote_plus

class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Legal AI Platform"
    VERSION: str = "1.0.0"

    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # --- Database Components ---
    # We add PROJECT_REF here to handle the special Supabase username format
    PROJECT_REF: Optional[str] = Field(default=None, env="PROJECT_REF")
    DB_USER: str = Field(default="postgres", env="DB_USER")
    DB_PASSWORD: str = Field(..., env="DB_PASSWORD")
    DB_HOST: str = Field(..., env="DB_HOST")
    DB_PORT: int = Field(default=5432, env="DB_PORT")
    DB_NAME: str = Field(default="postgres", env="DB_NAME")

    @property
    def DATABASE_URL(self) -> str:
        """
        Construct database URL with properly encoded credentials
        and Supabase-specific username formatting.
        """
        # Format the username for Supabase if a project reference is provided.
        # This logic is now centralized here.
        username = f"postgres.{self.PROJECT_REF}" if self.PROJECT_REF else self.DB_USER

        # Properly encode the password to handle special characters
        encoded_password = quote_plus(self.DB_PASSWORD)

        # Build the final URL
        return (
            f"postgresql+asyncpg://{username}:{encoded_password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # AI Services
    GROQ_API_KEY: str = Field(..., env="GROQ_API_KEY")
    PINECONE_API_KEY: str = Field(..., env="PINECONE_API_KEY")
    PINECONE_ENVIRONMENT: str = Field(..., env="PINECONE_ENVIRONMENT")
    PINECONE_INDEX_NAME: str = Field(default="legal-clauses", env="PINECONE_INDEX_NAME")

    # File Storage (e.g., Supabase Storage)
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(..., env="SUPABASE_KEY")
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")  # 10MB

    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24, env="ACCESS_TOKEN_EXPIRE_MINUTES") # 24 hours

    # CORS
    ALLOWED_ORIGINS: list[str] = Field(
        default=["http://localhost:3000"],
        env="ALLOWED_ORIGINS"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()