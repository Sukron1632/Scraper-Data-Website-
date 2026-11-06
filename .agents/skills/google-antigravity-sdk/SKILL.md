---
name: google-antigravity-sdk
description: >-
  Build, run, and orchestrate autonomous AI agents using the Google Antigravity Python SDK
  (google-antigravity) and Google GenAI SDK (google-genai). Use when writing Python code that
  orchestrates agents, delegates subagents, registers MCP tools, or connects to Gemini models.
---

# Google Antigravity Python SDK & Google GenAI Guide

This skill provides guidelines and patterns for using `google-antigravity` and `google-genai` Python SDKs for agentic orchestration.

## Installation & Environment
```bash
pip install google-antigravity google-genai
```
Requirements:
- Python >= 3.10
- Valid Google Gemini API Key (`GEMINI_API_KEY` or `GOOGLE_API_KEY`) in `.env` or system environment.

## Key Architectures

### 1. Unified Google GenAI Client
For direct model inference, function calling, and structured outputs:
```python
import os
from google import genai
from google.genai import types
from dotenv import load_dotenv

load_dotenv()

client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Standard Generation with System Instruction
response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents="Analyze the price trends from the scraped catalog.",
    config=types.GenerateContentConfig(
        system_instruction="You are an expert price intelligence analyst.",
        temperature=0.2,
    )
)
print(response.text)
```

### 2. Antigravity Agent Runtime Harness
When orchestrating autonomous agents, tools, and subagents:
```python
import google.antigravity as ag

# Initialize agent context with tools and MCP server connections
agent = ag.Agent(
    name="price-crawler-agent",
    system_prompt="Autonomous agent dedicated to resilient web crawling and product price extraction.",
    model="gemini-2.5-flash"
)

# Register MCP servers and execution tools
# agent.connect_mcp("scrapling")
# agent.connect_mcp("playwright")
```

### 3. Structured Outputs with Pydantic
Always enforce typed schemas for scraper data extraction:
```python
from pydantic import BaseModel, Field
from typing import List, Optional

class ProductPriceItem(BaseModel):
    product_name: str = Field(description="Normalized product name")
    sku: Optional[str] = Field(description="SKU or product code")
    current_price: float = Field(description="Numerical current selling price")
    currency: str = Field(default="IDR", description="Currency ISO code")
    in_stock: bool = Field(description="Availability flag")
    source_url: str = Field(description="Original URL scraped")

class PriceExtractionResult(BaseModel):
    items: List[ProductPriceItem]
    extraction_timestamp: str

response = client.models.generate_content(
    model="gemini-2.5-flash",
    contents=raw_scraped_html,
    config=types.GenerateContentConfig(
        response_mime_type="application/json",
        response_schema=PriceExtractionResult,
    )
)
```

## Best Practices
- **Cost & Context Optimization**: Use `gemini-2.5-flash` or `flash_lite` for preliminary parsing and filtering. Reserve `pro` models for complex multi-page reasoning.
- **Fail-safe Error Handling**: Wrap API calls with exponential backoff using `tenacity` or built-in retry mechanisms for transient HTTP 429/503 errors.
- **Environment Boundaries**: Never hardcode credentials. Always load from `.env`.
