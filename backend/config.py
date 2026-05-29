"""Application configuration loaded from environment variables using pydantic-settings."""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """All environment variables with type validation and sensible defaults."""

    database_url: str = "postgresql://arrears_user:arrears_pass@localhost:5432/arrears_db"
    chromadb_url: str = "http://localhost:8001"
    ollama_url: str = "http://localhost:11434"
    ollama_model: str = "qwen2.5:14b"
    secret_key: str = "change-this-secret-key-in-production"
    environment: str = "development"
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    next_public_api_url: str = "http://localhost:8000"
    frontend_url: str = "http://localhost:3001"

    class Config:
        env_file = ".env"
        case_sensitive = False


settings = Settings()
