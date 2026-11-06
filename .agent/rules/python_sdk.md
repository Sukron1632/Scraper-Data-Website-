# Google Antigravity & GenAI Python SDK Rules

1. **Typed Output Contract**:
   - Extraction results from web crawlers or analysis scripts must be strictly typed using Pydantic `BaseModel` schemas.
2. **Error Handling & Resilience**:
   - Wrap Gemini API and network calls with retry logic (exponential backoff) against rate limits (HTTP 429) or transient server issues.
3. **Environment Security**:
   - Access keys strictly via `os.getenv("GEMINI_API_KEY")`. Never commit credentials.
