from pydantic import AliasChoices, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    database_url: str = "postgresql+psycopg://postgres:postgres@localhost:5432/wheel"
    secret_key: str = Field(
        default="change-me-in-production-use-openssl-rand-hex-32",
        validation_alias=AliasChoices("JWT_SECRET", "SECRET_KEY"),
    )
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    gemini_api_key: str = Field(default="", validation_alias="GEMINI_API_KEY")
    slm_url: str = Field(default="http://slm:11434", validation_alias="SLM_URL")
    slm_model: str = Field(default="qwen2.5:0.5b", validation_alias="SLM_MODEL")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
