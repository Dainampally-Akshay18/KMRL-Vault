# backend/app/config.py

import os
from typing import Optional
from pydantic_settings import BaseSettings
from pydantic import Field
from urllib.parse import quote_plus
from dotenv import load_dotenv

# --- DIAGNOSTIC STEP ---
# We will explicitly load the .env file and print what we find.
print("--- STARTING CONFIG LOAD ---")
env_path = os.path.join(os.path.dirname(__file__), '..', '.env') # Tries to find .env in the `backend` folder
did_load_env = load_dotenv(dotenv_path=env_path)
secret_key_from_os = os.getenv("SECRET_KEY")

print(f"Searching for .env file at: {env_path}")
print(f"Did load_dotenv find a file? {did_load_env}")
print(f"Value of SECRET_KEY from os.getenv: '{secret_key_from_os}'")
print("--- ENDING CONFIG LOAD ---")
# --- END DIAGNOSTIC ---


class Settings(BaseSettings):
    # API Configuration
    API_V1_STR: str = "/api/v1"
    PROJECT_NAME: str = "Legal AI Platform"
    VERSION: str = "1.0.0"

    # Environment
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # --- Database Components ---
    PROJECT_REF: Optional[str] = Field(default=None, env="PROJECT_REF")
    DB_USER: str = Field(default="postgres", env="DB_USER")
    DB_PASSWORD: str = Field(..., env="DB_PASSWORD")
    DB_HOST: str = Field(..., env="DB_HOST")
    DB_PORT: int = Field(default=5432, env="DB_PORT")
    DB_NAME: str = Field(default="postgres", env="DB_NAME")

    @property
    def DATABASE_URL(self) -> str:
        username = f"postgres.{self.PROJECT_REF}" if self.PROJECT_REF else self.DB_USER
        encoded_password = quote_plus(self.DB_PASSWORD)
        return (
            f"postgresql+asyncpg://{username}:{encoded_password}"
            f"@{self.DB_HOST}:{self.DB_PORT}/{self.DB_NAME}"
        )

    # AI Services
    GROQ_API_KEY: str = Field(..., env="GROQ_API_KEY")
    PINECONE_API_KEY: str = Field(..., env="PINECONE_API_KEY")
    PINECONE_ENVIRONMENT: str = Field(..., env="PINECONE_ENVIRONMENT")
    PINECONE_INDEX_NAME: str = Field(default="legal-clauses", env="PINECONE_INDEX_NAME")

    # File Storage
    SUPABASE_URL: str = Field(..., env="SUPABASE_URL")
    SUPABASE_KEY: str = Field(..., env="SUPABASE_KEY")
    MAX_FILE_SIZE: int = Field(default=10 * 1024 * 1024, env="MAX_FILE_SIZE")

    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=60 * 24, env="ACCESS_TOKEN_EXPIRE_MINUTES")

    # This is the proper way to handle the duplicate key.
    # It ensures JWT_SECRET_KEY is available but reads from the single SECRET_KEY source.
    @property
    def JWT_SECRET_KEY(self) -> str:
        return self.SECRET_KEY

    # CORS
    ALLOWED_ORIGINS: list[str] = Field(
        default=["http://localhost:3000"],
        env="ALLOWED_ORIGINS"
    )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()