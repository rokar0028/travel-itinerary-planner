import os
from functools import lru_cache

from dotenv import load_dotenv

load_dotenv()


@lru_cache
def get_settings():
    return Settings()


class Settings:
    def __init__(self) -> None:
        self.supabase_url = os.getenv("SUPABASE_URL", "").strip()
        self.supabase_anon_key = os.getenv("SUPABASE_ANON_KEY", "").strip()
        self.supabase_service_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
        cors = os.getenv("CORS_ORIGINS", "http://localhost:5173")
        self.cors_origins = [o.strip() for o in cors.split(",") if o.strip()]

    @property
    def supabase_configured(self) -> bool:
        return bool(
            self.supabase_url
            and (self.supabase_anon_key or self.supabase_service_key)
        )

    @property
    def supabase_db_key(self) -> str:
        """Prefer service role for server-side jobs; anon + user JWT for RLS."""
        return self.supabase_service_key or self.supabase_anon_key
